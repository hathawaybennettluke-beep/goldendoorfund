"use node";
/**
 * Pillar 3 – Manage marketing: paid social/search campaigns, creatives,
 * email/SMS flows, influencer outreach and automated optimisation.
 */
import { v } from "convex/values";
import { z } from "zod";
import { action, internalAction } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { generateStructured, researchWithWebSearch, storeContext, withAi } from "./lib/ai";
import { fallbackAdCopy, fallbackFlow, fallbackInfluencers, fallbackOptimizationNotes, fallbackOutreach, fallbackTargeting, fallbackVideoScript } from "./lib/fallbacks";
import { seededRandom } from "./lib/text";
import { cpa as calcCpa, ctr as calcCtr, roas as calcRoas } from "./lib/pricing";
import * as ads from "./lib/integrations/ads";
import { deliverStep, getMessagingCreds } from "./lib/notify";
import { sendEmail } from "./lib/integrations/messaging";
import { channelValidator, triggerValidator } from "./marketing";

const TargetingSchema = z.object({
  audience: z.string(),
  interests: z.array(z.string()),
  ageRange: z.string(),
  genders: z.string(),
  locations: z.array(z.string()),
  placements: z.array(z.string()),
  keywords: z.array(z.string()).describe("Search keywords; empty for social channels"),
  strategy: z.string().describe("4-6 sentence launch & scaling plan with concrete kill/scale rules"),
});

const AdCopySchema = z.object({
  variants: z.array(z.object({ variant: z.string(), hook: z.string(), headline: z.string(), primaryText: z.string(), description: z.string(), cta: z.string() })).describe("3 distinct angles"),
});

const VideoScriptSchema = z.object({
  hook: z.string(),
  script: z.array(z.object({ scene: z.number(), durationSec: z.number(), visual: z.string(), voiceover: z.string(), onScreenText: z.string() })).describe("5-7 scenes, 20-35 seconds total"),
});

const FlowSchema = z.object({
  name: z.string(),
  steps: z.array(z.object({ delayHours: z.number(), subject: z.string().describe("Empty for SMS"), body: z.string().describe("Use {{customerName}}, {{orderNumber}}, {{total}}, {{trackingUrl}}, {{carrier}}, {{storeName}} placeholders where useful") })),
});

const InfluencerListSchema = z.object({
  influencers: z.array(z.object({
    name: z.string(), handle: z.string(), platform: z.string(), followers: z.number(), engagementRate: z.number(), niche: z.string(),
    contact: z.string().describe("Public business email or 'unknown'"), profileUrl: z.string(), fitScore: z.number().describe("0-100 fit with the store"), estimatedRate: z.number().describe("Estimated cost per sponsored post in store currency, 0 if unknown"),
  })),
});

const OutreachSchema = z.object({ outreachMessage: z.string(), followUpMessage: z.string() });

type ChannelCreds = { meta?: ads.MetaCredentials; tiktok?: ads.TikTokCredentials; google?: ads.GoogleAdsCredentials };

async function channelCreds(ctx: ActionCtx, storeId: Id<"ecStores">, channel: string): Promise<ChannelCreds> {
  if (!["meta", "tiktok", "google"].includes(channel)) return {};
  const conn = await ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId, provider: channel });
  if (!conn) return {};
  return { [channel]: conn.credentials } as ChannelCreds;
}

async function productsFor(ctx: ActionCtx, ids: Id<"ecProducts">[]): Promise<Doc<"ecProducts">[]> {
  const out: Doc<"ecProducts">[] = [];
  for (const id of ids) {
    const p = await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: id });
    if (p) out.push(p);
  }
  return out;
}

async function generateAdCopy(ctx: ActionCtx, store: Doc<"ecStores">, product: Doc<"ecProducts">, channel: string, campaignId?: Id<"ecAdCampaigns">) {
  const result = await withAi(
    () =>
      generateStructured({
        schema: AdCopySchema,
        prompt: `Write 3 ${channel} ad variants (different angles: problem/solution, social proof without fake numbers, urgency/offer) for "${product.title}" at ${store.currency} ${product.price.toFixed(2)}.\nProduct summary: ${product.shortDescription ?? product.description.slice(0, 400)}\nBullets: ${product.bullets.join("; ")}\n\n${storeContext(store)}\n\nRespect ${channel} character norms (headline ≤ 40 chars, primary text ≤ 125 chars for the first line).`,
      }),
    () => ({ variants: fallbackAdCopy({ title: product.title, channel, niche: store.niche, price: product.price, currency: store.currency }) })
  );
  const ids = await ctx.runMutation(internal.ecommerce.marketing.insertCreatives, {
    storeId: store._id,
    creatives: result.data.variants.map((vnt) => ({ campaignId, productId: product._id, type: "ad_copy" as const, channel, ...vnt, usedAi: result.usedAi })),
  });
  return { ids, usedAi: result.usedAi };
}

async function generateVideo(ctx: ActionCtx, store: Doc<"ecStores">, product: Doc<"ecProducts">, channel: string, campaignId?: Id<"ecAdCampaigns">) {
  const result = await withAi(
    () =>
      generateStructured({
        schema: VideoScriptSchema,
        prompt: `Write a 25-second UGC-style ${channel} video ad script for "${product.title}". Native, first-person, scroll-stopping hook in the first 2 seconds, clear demo, CTA at the end.\nProduct: ${product.shortDescription ?? product.description.slice(0, 400)}\n\n${storeContext(store)}`,
      }),
    () => fallbackVideoScript({ title: product.title, niche: store.niche, channel })
  );
  const ids = await ctx.runMutation(internal.ecommerce.marketing.insertCreatives, {
    storeId: store._id,
    creatives: [{ campaignId, productId: product._id, type: "video_script" as const, channel, variant: "UGC script", hook: result.data.hook, script: result.data.script, usedAi: result.usedAi }],
  });
  return { ids, usedAi: result.usedAi };
}

export const createCampaign = action({
  args: {
    storeId: v.id("ecStores"),
    channel: channelValidator,
    objective: v.string(),
    productIds: v.array(v.id("ecProducts")),
    dailyBudget: v.number(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ campaignId: Id<"ecAdCampaigns">; usedAi: boolean; warning?: string }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const products = await productsFor(ctx, args.productIds);
    if (products.length === 0) throw new Error("Select at least one product for the campaign.");
    const lead = products[0];
    const targeting = await withAi(
      () =>
        generateStructured({
          schema: TargetingSchema,
          prompt: `Plan a ${args.channel} campaign with objective "${args.objective}" and a daily budget of ${store.currency} ${args.dailyBudget}.\nProducts: ${products.map((p) => `${p.title} (${store.currency} ${p.price})`).join("; ")}\n\n${storeContext(store)}\n\nTarget ROAS ≥ ${store.automation.minRoas}, max CPA ${store.currency} ${store.automation.maxCpa}.`,
        }),
      () => fallbackTargeting(args.channel, store.niche, store.targetAudience)
    );
    const name = args.name?.trim() || `${lead.title} – ${args.channel} ${args.objective}`;
    const campaignId = await ctx.runMutation(internal.ecommerce.marketing.insertCampaign, {
      storeId: store._id,
      name,
      channel: args.channel,
      objective: args.objective,
      dailyBudget: args.dailyBudget,
      productIds: args.productIds,
      targeting: targeting.data,
      strategy: targeting.data.strategy,
    });
    let usedAi = targeting.usedAi;
    if (["meta", "tiktok", "google", "influencer"].includes(args.channel)) {
      const copy = await generateAdCopy(ctx, store, lead, args.channel, campaignId);
      usedAi = usedAi || copy.usedAi;
      if (args.channel === "meta" || args.channel === "tiktok" || args.channel === "influencer") {
        const video = await generateVideo(ctx, store, lead, args.channel, campaignId);
        usedAi = usedAi || video.usedAi;
      }
      if (lead.images.length) {
        await ctx.runMutation(internal.ecommerce.marketing.insertCreatives, {
          storeId: store._id,
          creatives: lead.images.slice(0, 2).map((img, i) => ({ campaignId, productId: lead._id, type: "image" as const, channel: args.channel, variant: `Image ${i + 1}`, imageUrl: img.url, headline: lead.title, usedAi: false })),
        });
      }
    } else {
      const flow = await withAi(
        () => generateStructured({ schema: FlowSchema, prompt: `Write a 2-step ${args.channel} promotional sequence for "${lead.title}" with objective "${args.objective}".\n${storeContext(store)}` }),
        () => fallbackFlow("post_purchase", store.name, args.channel === "sms" ? "sms" : "email")
      );
      await ctx.runMutation(internal.ecommerce.marketing.insertCreatives, {
        storeId: store._id,
        creatives: flow.data.steps.map((s, i) => ({ campaignId, productId: lead._id, type: args.channel as "email" | "sms", channel: args.channel, variant: `Step ${i + 1} (+${s.delayHours}h)`, headline: s.subject || undefined, primaryText: s.body, usedAi: flow.usedAi })),
      });
      usedAi = usedAi || flow.usedAi;
    }
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "marketing", action: `Campaign drafted: ${name}`, detail: `${args.channel} · ${store.currency} ${args.dailyBudget}/day · targeting and creatives generated.`, level: "success", refType: "campaign", refId: campaignId });
    return { campaignId, usedAi, warning: targeting.warning };
  },
});

export const launchCampaign = action({
  args: { campaignId: v.id("ecAdCampaigns") },
  handler: async (ctx, args): Promise<{ simulated: boolean; externalId?: string; adminUrl?: string }> => {
    const campaign = await ctx.runQuery(internal.ecommerce.marketing.getCampaignInternal, { campaignId: args.campaignId });
    if (!campaign) throw new Error("Campaign not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: campaign.storeId });
    const creds = await channelCreds(ctx, store._id, campaign.channel);
    const spec = { name: campaign.name, objective: campaign.objective, dailyBudget: campaign.dailyBudget, startDate: campaign.startDate, endDate: campaign.endDate };
    let result: ads.CampaignPushResult = { externalId: `sim_${campaign._id.slice(-8)}`, externalStatus: "SIMULATED", simulated: true };
    if (campaign.channel === "meta" && creds.meta) result = await ads.metaCreateCampaign(creds.meta, spec);
    else if (campaign.channel === "tiktok" && creds.tiktok) result = await ads.tiktokCreateCampaign(creds.tiktok, spec);
    else if (campaign.channel === "google" && creds.google) result = await ads.googleCreateCampaign(creds.google, spec);
    await ctx.runMutation(internal.ecommerce.marketing.patchCampaign, {
      campaignId: campaign._id,
      status: "active",
      externalId: result.externalId,
      externalStatus: result.externalStatus,
      simulated: result.simulated,
      lastSyncedAt: Date.now(),
      optimization: { action: "Launched", reason: result.simulated ? `${campaign.channel} is not connected – running in simulation so you can preview the optimisation loop.` : `Created as PAUSED in ${campaign.channel} ads manager for final review: ${result.adminUrl ?? result.externalId}`, automated: false },
    });
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "marketing", action: `Campaign launched: ${campaign.name}`, detail: result.simulated ? "Simulated (channel not connected)" : `Pushed to ${campaign.channel} (${result.externalId})`, level: "success", refType: "campaign", refId: campaign._id });
    return { simulated: result.simulated, externalId: result.externalId, adminUrl: result.adminUrl };
  },
});

export const setCampaignStatus = action({
  args: { campaignId: v.id("ecAdCampaigns"), status: v.union(v.literal("active"), v.literal("paused"), v.literal("completed")) },
  handler: async (ctx, args): Promise<void> => {
    const campaign = await ctx.runQuery(internal.ecommerce.marketing.getCampaignInternal, { campaignId: args.campaignId });
    if (!campaign) throw new Error("Campaign not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: campaign.storeId });
    if (!campaign.simulated && campaign.externalId) {
      const creds = await channelCreds(ctx, store._id, campaign.channel);
      const enable = args.status === "active";
      if (campaign.channel === "meta" && creds.meta) await ads.metaSetStatus(creds.meta, campaign.externalId, enable ? "ACTIVE" : "PAUSED");
      if (campaign.channel === "tiktok" && creds.tiktok) await ads.tiktokSetStatus(creds.tiktok, campaign.externalId, enable);
      if (campaign.channel === "google" && creds.google) await ads.googleSetStatus(creds.google, campaign.externalId, enable ? "ENABLED" : "PAUSED");
    }
    await ctx.runMutation(internal.ecommerce.marketing.patchCampaign, { campaignId: campaign._id, status: args.status, optimization: { action: `Status → ${args.status}`, reason: "Manual change", automated: false } });
  },
});

export const generateCreatives = action({
  args: { storeId: v.id("ecStores"), productId: v.id("ecProducts"), channel: v.string(), type: v.union(v.literal("ad_copy"), v.literal("video_script")), campaignId: v.optional(v.id("ecAdCampaigns")) },
  handler: async (ctx, args): Promise<{ created: number; usedAi: boolean }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const product = await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: args.productId });
    if (!product) throw new Error("Product not found");
    const result = args.type === "ad_copy" ? await generateAdCopy(ctx, store, product, args.channel, args.campaignId) : await generateVideo(ctx, store, product, args.channel, args.campaignId);
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "marketing", action: `${result.ids.length} ${args.type === "ad_copy" ? "ad variant(s)" : "video script"} generated for ${product.title}`, level: "success" });
    return { created: result.ids.length, usedAi: result.usedAi };
  },
});

export const generateFlow = action({
  args: { storeId: v.id("ecStores"), trigger: triggerValidator, channel: v.union(v.literal("email"), v.literal("sms")) },
  handler: async (ctx, args): Promise<{ flowId: Id<"ecMessagingFlows">; usedAi: boolean }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const result = await withAi(
      () =>
        generateStructured({
          schema: FlowSchema,
          prompt: `Write the "${args.trigger.replace(/_/g, " ")}" ${args.channel} flow for ${store.name}. ${args.channel === "sms" ? "Each step under 160 characters, include opt-out hint on promotional steps." : "Subject lines under 50 characters."} Use placeholders like {{customerName}}, {{orderNumber}}, {{total}}, {{trackingUrl}}, {{carrier}}, {{storeName}} where appropriate. Transactional triggers (order_confirmation, shipping_update, delivered, cancellation) get 1-2 steps; lifecycle triggers get 2-3 steps with sensible delays in hours.\n\n${storeContext(store)}`,
        }),
      () => fallbackFlow(args.trigger, store.name, args.channel)
    );
    const flowId = await ctx.runMutation(internal.ecommerce.marketing.insertFlow, {
      storeId: store._id,
      name: result.data.name,
      channel: args.channel,
      trigger: args.trigger,
      steps: result.data.steps.map((s) => ({ delayHours: Math.max(0, s.delayHours), subject: args.channel === "email" && s.subject ? s.subject : undefined, body: s.body })),
      usedAi: result.usedAi,
    });
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "marketing", action: `${args.channel.toUpperCase()} flow generated: ${result.data.name}`, level: "success" });
    return { flowId, usedAi: result.usedAi };
  },
});

export const sendTestMessage = action({
  args: { flowId: v.id("ecMessagingFlows"), to: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const flow = await ctx.runQuery(internal.ecommerce.marketing.getFlowInternal, { flowId: args.flowId });
    if (!flow) throw new Error("Flow not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: flow.storeId });
    const status = await deliverStep(ctx, store, flow, 0, { email: args.to, phone: args.to }, { storeName: store.name, customerName: "Alex", orderNumber: "#1042", total: `${store.currency} 49.99`, carrier: "UPS", trackingNumber: "1Z999AA10123456784", trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784" });
    return status;
  },
});

export const findInfluencers = action({
  args: { storeId: v.id("ecStores"), productId: v.optional(v.id("ecProducts")), count: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ added: number; usedAi: boolean; warning?: string }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const product = args.productId ? await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: args.productId }) : null;
    const count = Math.min(args.count ?? 8, 12);
    const result = await withAi(
      async () => {
        const research = await researchWithWebSearch({
          prompt: `Find ${count} real, currently active social media creators (Instagram, TikTok, YouTube) in the ${store.niche} niche who do product reviews/sponsorships and would fit ${store.name}${product ? ` promoting "${product.title}"` : ""}. Prefer micro/mid-tier creators (10k-500k followers). For each, note handle, platform, approximate followers, engagement signals, and any public business contact. Only include creators you actually found in search results.\n\n${storeContext(store)}`,
          maxUses: 8,
        });
        return await generateStructured({
          schema: InfluencerListSchema,
          prompt: `Structure these creator notes. Only include creators explicitly present in the notes; use 'unknown' for missing contacts and 0 for unknown rates. Rates in ${store.currency}.\n\nNOTES:\n${research.notes}`,
        });
      },
      () => ({ influencers: fallbackInfluencers(store.niche, count) })
    );
    const added = await ctx.runMutation(internal.ecommerce.marketing.insertInfluencers, {
      storeId: store._id,
      influencers: result.data.influencers.map((i) => ({ ...i, handle: i.handle.startsWith("@") ? i.handle : `@${i.handle}`, contact: i.contact && i.contact !== "unknown" ? i.contact : undefined, profileUrl: i.profileUrl || undefined, estimatedRate: i.estimatedRate > 0 ? i.estimatedRate : undefined, fitScore: Math.max(0, Math.min(100, Math.round(i.fitScore))), usedAi: result.usedAi })),
    });
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "marketing", action: `${added} influencer(s) added to outreach pipeline`, detail: result.usedAi ? "Sourced with live web research" : "Demo placeholders – add ANTHROPIC_API_KEY for real creator discovery", level: "success" });
    return { added, usedAi: result.usedAi, warning: result.warning };
  },
});

export const generateOutreach = action({
  args: { influencerId: v.id("ecInfluencers"), productId: v.optional(v.id("ecProducts")) },
  handler: async (ctx, args): Promise<{ outreachMessage: string; followUpMessage: string; usedAi: boolean }> => {
    const inf = await ctx.runQuery(internal.ecommerce.marketing.getInfluencerInternal, { influencerId: args.influencerId });
    if (!inf) throw new Error("Influencer not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: inf.storeId });
    let product = args.productId ? await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: args.productId }) : null;
    if (!product) product = (await ctx.runQuery(internal.ecommerce.products.listInternal, { storeId: store._id }))[0] ?? null;
    const productTitle = product?.title ?? `${store.name} products`;
    const result = await withAi(
      () =>
        generateStructured({
          schema: OutreachSchema,
          prompt: `Write a warm, specific influencer outreach DM/email and a short follow-up to ${inf.name} (${inf.handle}, ${inf.platform}, ${inf.followers.toLocaleString()} followers, ${inf.engagementRate}% engagement) from ${store.name}. Offer: free ${productTitle} + affiliate code (15-20%). Keep the first message under 140 words, no hype, sound human.\n\n${storeContext(store)}`,
        }),
      () => fallbackOutreach({ influencerName: inf.name, handle: inf.handle, storeName: store.name, productTitle, niche: store.niche })
    );
    await ctx.runMutation(internal.ecommerce.marketing.patchInfluencer, { influencerId: inf._id, outreachMessage: result.data.outreachMessage, followUpMessage: result.data.followUpMessage, usedAi: result.usedAi });
    return { ...result.data, usedAi: result.usedAi };
  },
});

export const sendOutreach = action({
  args: { influencerId: v.id("ecInfluencers") },
  handler: async (ctx, args): Promise<{ status: string }> => {
    const inf = await ctx.runQuery(internal.ecommerce.marketing.getInfluencerInternal, { influencerId: args.influencerId });
    if (!inf) throw new Error("Influencer not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: inf.storeId });
    if (!inf.outreachMessage) throw new Error("Generate the outreach message first.");
    const creds = await getMessagingCreds(ctx, store._id);
    const to = inf.contact && inf.contact.includes("@") && !inf.contact.startsWith("@") ? inf.contact : null;
    let status = "simulated";
    if (to) {
      const result = await sendEmail(creds.email, { to, subject: `Collab idea from ${store.name}`, text: inf.outreachMessage });
      status = result.status;
      await ctx.runMutation(internal.ecommerce.marketing.insertMessageLog, { storeId: store._id, channel: "email", to, subject: `Collab idea from ${store.name}`, body: inf.outreachMessage, status: result.status, provider: result.provider, providerMessageId: result.providerMessageId, error: result.error });
    }
    await ctx.runMutation(internal.ecommerce.marketing.patchInfluencer, { influencerId: inf._id, status: "contacted", lastContactedAt: Date.now() });
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "marketing", action: `Outreach sent to ${inf.handle}`, detail: to ? `Email ${status} to ${to}` : "No email contact on file – marked as contacted; copy the message into your DMs.", level: "info" });
    return { status };
  },
});

// ---------------------------------------------------------- metrics -----

function simulateDelta(campaign: Doc<"ecAdCampaigns">, avgPrice: number, now: number): ads.CampaignMetrics {
  const since = campaign.lastSyncedAt ?? campaign.updatedAt;
  const hours = Math.min(Math.max((now - since) / 3_600_000, 0.25), 24);
  const rnd = seededRandom(`${campaign._id}-${Math.floor(now / 3_600_000)}`);
  const spend = campaign.dailyBudget * (hours / 24) * (0.85 + rnd() * 0.3);
  const cpm = campaign.channel === "google" ? 22 : campaign.channel === "tiktok" ? 6.5 : 9;
  const impressions = Math.round((spend / cpm) * 1000);
  const baseCtr = campaign.channel === "google" ? 0.035 : 0.012;
  const clicks = Math.round(impressions * baseCtr * (0.6 + rnd() * 0.9));
  const cvr = 0.018 + rnd() * 0.025;
  const conversions = Math.round(clicks * cvr);
  const revenue = conversions * avgPrice * (0.9 + rnd() * 0.4);
  return { impressions, clicks, spend: Math.round(spend * 100) / 100, conversions, revenue: Math.round(revenue * 100) / 100 };
}

async function syncStoreMetrics(ctx: ActionCtx, store: Doc<"ecStores">): Promise<number> {
  const campaigns = await ctx.runQuery(internal.ecommerce.marketing.listCampaignsInternal, { storeId: store._id });
  const now = Date.now();
  let synced = 0;
  for (const c of campaigns) {
    if (c.status !== "active") continue;
    const products = await productsFor(ctx, c.productIds);
    const avgPrice = products.length ? products.reduce((s, p) => s + p.price, 0) / products.length : 40;
    let metrics: ads.CampaignMetrics;
    if (!c.simulated && c.externalId) {
      const creds = await channelCreds(ctx, store._id, c.channel);
      try {
        if (c.channel === "meta" && creds.meta) metrics = await ads.metaInsights(creds.meta, c.externalId);
        else if (c.channel === "tiktok" && creds.tiktok) metrics = await ads.tiktokInsights(creds.tiktok, c.externalId);
        else if (c.channel === "google" && creds.google) metrics = await ads.googleInsights(creds.google, c.externalId);
        else continue;
      } catch (error) {
        console.error("Metrics sync failed", c._id, error);
        continue;
      }
    } else {
      const d = simulateDelta(c, avgPrice, now);
      metrics = { impressions: c.metrics.impressions + d.impressions, clicks: c.metrics.clicks + d.clicks, spend: Math.round((c.metrics.spend + d.spend) * 100) / 100, conversions: c.metrics.conversions + d.conversions, revenue: Math.round((c.metrics.revenue + d.revenue) * 100) / 100 };
    }
    const date = new Date(now).toISOString().slice(0, 10);
    await ctx.runMutation(internal.ecommerce.marketing.patchCampaign, { campaignId: c._id, metrics, lastSyncedAt: now, appendHistory: { date, ...metrics } });
    synced += 1;
  }
  return synced;
}

export const syncMetrics = action({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args): Promise<{ synced: number }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    return { synced: await syncStoreMetrics(ctx, store) };
  },
});

interface Decision { campaignId: Id<"ecAdCampaigns">; name: string; action: "scale" | "hold" | "reduce" | "pause" | "refresh_creative"; reason: string; newBudget?: number }

async function optimizeStore(ctx: ActionCtx, store: Doc<"ecStores">, actor: "user" | "automation"): Promise<Decision[]> {
  await syncStoreMetrics(ctx, store);
  const campaigns = await ctx.runQuery(internal.ecommerce.marketing.listCampaignsInternal, { storeId: store._id });
  const decisions: Decision[] = [];
  const target = store.automation.minRoas;
  for (const c of campaigns) {
    if (c.status !== "active") continue;
    const m = c.metrics;
    const r = calcRoas(m.revenue, m.spend);
    const cost = calcCpa(m.spend, m.conversions);
    const clickRate = calcCtr(m.clicks, m.impressions);
    const learning = m.spend < Math.max(c.dailyBudget * 1.5, 30);
    let decision: Decision;
    if (learning) {
      decision = { campaignId: c._id, name: c.name, action: "hold", reason: `Still in learning phase (${store.currency} ${m.spend.toFixed(2)} spent) – no changes until ~1.5 days of budget is spent.` };
    } else if (r >= target * 1.3 && m.conversions >= 3) {
      const newBudget = Math.round(c.dailyBudget * 1.2 * 100) / 100;
      decision = { campaignId: c._id, name: c.name, action: "scale", reason: `ROAS ${r.toFixed(2)} is 30%+ above the ${target} target with ${m.conversions} conversions – budget +20% to ${store.currency} ${newBudget}.`, newBudget };
    } else if (r < target * 0.5 && m.spend >= c.dailyBudget * 3) {
      decision = { campaignId: c._id, name: c.name, action: "pause", reason: `ROAS ${r.toFixed(2)} is under half the ${target} target after ${store.currency} ${m.spend.toFixed(0)} – paused to stop the bleed.` };
    } else if (clickRate < 0.8 && m.impressions > 3000) {
      decision = { campaignId: c._id, name: c.name, action: "refresh_creative", reason: `CTR ${clickRate.toFixed(2)}% is weak – creative fatigue; fresh ad variants generated.` };
    } else if (r < target || (cost > store.automation.maxCpa && m.conversions > 0)) {
      const newBudget = Math.max(5, Math.round(c.dailyBudget * 0.8 * 100) / 100);
      decision = { campaignId: c._id, name: c.name, action: "reduce", reason: `ROAS ${r.toFixed(2)} / CPA ${store.currency} ${cost.toFixed(2)} miss targets (${target} / ${store.currency} ${store.automation.maxCpa}) – budget −20% to ${store.currency} ${newBudget}.`, newBudget };
    } else {
      decision = { campaignId: c._id, name: c.name, action: "hold", reason: fallbackOptimizationNotes(c.name, r, target, clickRate) };
    }
    decisions.push(decision);

    const creds = await channelCreds(ctx, store._id, c.channel);
    if (decision.action === "scale" || decision.action === "reduce") {
      if (!c.simulated && c.externalId && c.channel === "meta" && creds.meta) await ads.metaSetBudget(creds.meta, c.externalId, decision.newBudget!).catch(console.error);
      await ctx.runMutation(internal.ecommerce.marketing.patchCampaign, { campaignId: c._id, dailyBudget: decision.newBudget, lastOptimizedAt: Date.now(), optimization: { action: decision.action === "scale" ? "Budget increased" : "Budget reduced", reason: decision.reason, automated: actor === "automation" } });
    } else if (decision.action === "pause") {
      if (!c.simulated && c.externalId) {
        if (c.channel === "meta" && creds.meta) await ads.metaSetStatus(creds.meta, c.externalId, "PAUSED").catch(console.error);
        if (c.channel === "tiktok" && creds.tiktok) await ads.tiktokSetStatus(creds.tiktok, c.externalId, false).catch(console.error);
        if (c.channel === "google" && creds.google) await ads.googleSetStatus(creds.google, c.externalId, "PAUSED").catch(console.error);
      }
      await ctx.runMutation(internal.ecommerce.marketing.patchCampaign, { campaignId: c._id, status: "paused", lastOptimizedAt: Date.now(), optimization: { action: "Paused", reason: decision.reason, automated: actor === "automation" } });
    } else if (decision.action === "refresh_creative") {
      const lead = await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: c.productIds[0] });
      if (lead) await generateAdCopy(ctx, store, lead, c.channel, c._id);
      await ctx.runMutation(internal.ecommerce.marketing.patchCampaign, { campaignId: c._id, lastOptimizedAt: Date.now(), optimization: { action: "Creative refreshed", reason: decision.reason, automated: actor === "automation" } });
    } else {
      await ctx.runMutation(internal.ecommerce.marketing.patchCampaign, { campaignId: c._id, lastOptimizedAt: Date.now(), optimization: { action: "Held", reason: decision.reason, automated: actor === "automation" } });
    }
  }
  if (decisions.length) {
    const changed = decisions.filter((d) => d.action !== "hold");
    await ctx.runMutation(internal.ecommerce.activity.log, {
      storeId: store._id,
      actor,
      area: "marketing",
      action: `Campaign optimisation pass: ${changed.length} change(s) across ${decisions.length} campaign(s)`,
      detail: changed.map((d) => `${d.name}: ${d.action}`).join(" · ") || "All campaigns held at current settings.",
      level: changed.some((d) => d.action === "pause") ? "warning" : "info",
    });
  }
  return decisions;
}

export const optimizeCampaigns = action({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args): Promise<Decision[]> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    return await optimizeStore(ctx, store, "user");
  },
});

export const optimizeAllStores = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const stores = await ctx.runQuery(internal.ecommerce.stores.listAllInternal, {});
    for (const store of stores) {
      try {
        if (store.automation.autoOptimizeCampaigns) await optimizeStore(ctx, store, "automation");
        else await syncStoreMetrics(ctx, store);
      } catch (error) {
        console.error("Scheduled optimisation failed", store._id, error);
      }
    }
  },
});
