import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { requireStoreAccess } from "./lib/auth";

export const channelValidator = v.union(v.literal("meta"), v.literal("tiktok"), v.literal("google"), v.literal("email"), v.literal("sms"), v.literal("influencer"));
export const campaignStatusValidator = v.union(v.literal("draft"), v.literal("scheduled"), v.literal("active"), v.literal("paused"), v.literal("completed"));
export const creativeTypeValidator = v.union(v.literal("ad_copy"), v.literal("video_script"), v.literal("image"), v.literal("email"), v.literal("sms"), v.literal("ugc_brief"));
export const triggerValidator = v.union(
  v.literal("order_confirmation"), v.literal("shipping_update"), v.literal("delivered"), v.literal("abandoned_cart"),
  v.literal("welcome"), v.literal("post_purchase"), v.literal("winback"), v.literal("cancellation")
);
export const metricsValidator = v.object({ impressions: v.number(), clicks: v.number(), spend: v.number(), conversions: v.number(), revenue: v.number() });
export const stepValidator = v.object({ delayHours: v.number(), subject: v.optional(v.string()), body: v.string() });
export const scriptValidator = v.array(v.object({ scene: v.number(), durationSec: v.number(), visual: v.string(), voiceover: v.string(), onScreenText: v.optional(v.string()) }));
export const influencerStatusValidator = v.union(v.literal("identified"), v.literal("contacted"), v.literal("negotiating"), v.literal("agreed"), v.literal("declined"), v.literal("posted"));

export const creativeInputValidator = v.object({
  campaignId: v.optional(v.id("ecAdCampaigns")),
  productId: v.optional(v.id("ecProducts")),
  type: creativeTypeValidator,
  channel: v.string(),
  variant: v.string(),
  headline: v.optional(v.string()),
  primaryText: v.optional(v.string()),
  description: v.optional(v.string()),
  cta: v.optional(v.string()),
  hook: v.optional(v.string()),
  script: v.optional(scriptValidator),
  imageUrl: v.optional(v.string()),
  imagePrompt: v.optional(v.string()),
  usedAi: v.boolean(),
});

// -------------------------------------------------------------- queries -----

export const listCampaigns = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    return await ctx.db.query("ecAdCampaigns").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").collect();
  },
});

export const getCampaign = query({
  args: { campaignId: v.id("ecAdCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;
    await requireStoreAccess(ctx, campaign.storeId);
    const creatives = await ctx.db.query("ecCreatives").withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId)).collect();
    const products = (await Promise.all(campaign.productIds.map((id) => ctx.db.get(id)))).filter((p) => p !== null);
    return { ...campaign, creatives, products };
  },
});

export const listCreatives = query({
  args: { storeId: v.id("ecStores"), type: v.optional(creativeTypeValidator) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const rows = await ctx.db.query("ecCreatives").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").collect();
    return args.type ? rows.filter((r) => r.type === args.type) : rows;
  },
});

export const listFlows = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    return await ctx.db.query("ecMessagingFlows").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
  },
});

export const listInfluencers = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const rows = await ctx.db.query("ecInfluencers").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").collect();
    return rows.sort((a, b) => b.fitScore - a.fitScore);
  },
});

export const listMessageLogs = query({
  args: { storeId: v.id("ecStores"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    return await ctx.db.query("ecMessageLogs").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").take(args.limit ?? 50);
  },
});

export const marketingOverview = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const campaigns = await ctx.db.query("ecAdCampaigns").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    const byChannel: Record<string, { spend: number; revenue: number; conversions: number; clicks: number; impressions: number; campaigns: number }> = {};
    for (const c of campaigns) {
      const b = (byChannel[c.channel] ??= { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0, campaigns: 0 });
      b.spend += c.metrics.spend;
      b.revenue += c.metrics.revenue;
      b.conversions += c.metrics.conversions;
      b.clicks += c.metrics.clicks;
      b.impressions += c.metrics.impressions;
      b.campaigns += 1;
    }
    const totals = Object.values(byChannel).reduce((a, b) => ({ spend: a.spend + b.spend, revenue: a.revenue + b.revenue, conversions: a.conversions + b.conversions, clicks: a.clicks + b.clicks, impressions: a.impressions + b.impressions }), { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 });
    return { byChannel, totals, campaigns: campaigns.length, active: campaigns.filter((c) => c.status === "active").length };
  },
});

// ------------------------------------------------------------ mutations -----

export const updateCampaignStatus = mutation({
  args: { campaignId: v.id("ecAdCampaigns"), status: campaignStatusValidator },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.campaignId);
    if (!c) throw new Error("Campaign not found");
    await requireStoreAccess(ctx, c.storeId);
    await ctx.db.patch(args.campaignId, { status: args.status, optimizations: [...c.optimizations, { at: Date.now(), action: `Status set to ${args.status}`, reason: "Manual change", automated: false }], updatedAt: Date.now() });
  },
});

export const updateCampaignBudget = mutation({
  args: { campaignId: v.id("ecAdCampaigns"), dailyBudget: v.number() },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.campaignId);
    if (!c) throw new Error("Campaign not found");
    await requireStoreAccess(ctx, c.storeId);
    await ctx.db.patch(args.campaignId, { dailyBudget: args.dailyBudget, updatedAt: Date.now() });
  },
});

export const deleteCampaign = mutation({
  args: { campaignId: v.id("ecAdCampaigns") },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.campaignId);
    if (!c) return;
    await requireStoreAccess(ctx, c.storeId);
    const creatives = await ctx.db.query("ecCreatives").withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId)).collect();
    for (const cr of creatives) await ctx.db.patch(cr._id, { campaignId: undefined });
    await ctx.db.delete(args.campaignId);
  },
});

export const updateCreativeStatus = mutation({
  args: { creativeId: v.id("ecCreatives"), status: v.union(v.literal("draft"), v.literal("approved"), v.literal("live"), v.literal("retired")) },
  handler: async (ctx, args) => {
    const cr = await ctx.db.get(args.creativeId);
    if (!cr) throw new Error("Creative not found");
    await requireStoreAccess(ctx, cr.storeId);
    await ctx.db.patch(args.creativeId, { status: args.status });
  },
});

export const deleteCreative = mutation({
  args: { creativeId: v.id("ecCreatives") },
  handler: async (ctx, args) => {
    const cr = await ctx.db.get(args.creativeId);
    if (!cr) return;
    await requireStoreAccess(ctx, cr.storeId);
    await ctx.db.delete(args.creativeId);
  },
});

export const upsertFlow = mutation({
  args: { flowId: v.optional(v.id("ecMessagingFlows")), storeId: v.id("ecStores"), name: v.string(), channel: v.union(v.literal("email"), v.literal("sms")), trigger: triggerValidator, steps: v.array(stepValidator), status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("draft"))) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const now = Date.now();
    if (args.flowId) {
      await ctx.db.patch(args.flowId, { name: args.name, channel: args.channel, trigger: args.trigger, steps: args.steps, status: args.status ?? "active", updatedAt: now });
      return args.flowId;
    }
    return await ctx.db.insert("ecMessagingFlows", { storeId: args.storeId, name: args.name, channel: args.channel, trigger: args.trigger, steps: args.steps, status: args.status ?? "active", stats: { sent: 0, opened: 0, clicked: 0 }, usedAi: false, createdAt: now, updatedAt: now });
  },
});

export const setFlowStatus = mutation({
  args: { flowId: v.id("ecMessagingFlows"), status: v.union(v.literal("active"), v.literal("paused"), v.literal("draft")) },
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.flowId);
    if (!flow) throw new Error("Flow not found");
    await requireStoreAccess(ctx, flow.storeId);
    await ctx.db.patch(args.flowId, { status: args.status, updatedAt: Date.now() });
  },
});

export const deleteFlow = mutation({
  args: { flowId: v.id("ecMessagingFlows") },
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.flowId);
    if (!flow) return;
    await requireStoreAccess(ctx, flow.storeId);
    await ctx.db.delete(args.flowId);
  },
});

export const updateInfluencer = mutation({
  args: { influencerId: v.id("ecInfluencers"), status: v.optional(influencerStatusValidator), notes: v.optional(v.string()), contact: v.optional(v.string()), outreachMessage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const inf = await ctx.db.get(args.influencerId);
    if (!inf) throw new Error("Influencer not found");
    await requireStoreAccess(ctx, inf.storeId);
    const { influencerId, ...patch } = args;
    const clean = Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined));
    await ctx.db.patch(influencerId, clean);
  },
});

export const addInfluencer = mutation({
  args: { storeId: v.id("ecStores"), name: v.string(), handle: v.string(), platform: v.string(), followers: v.number(), engagementRate: v.number(), contact: v.optional(v.string()), profileUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    return await ctx.db.insert("ecInfluencers", { ...args, niche: store.niche, fitScore: 70, status: "identified", usedAi: false, createdAt: Date.now() });
  },
});

export const deleteInfluencer = mutation({
  args: { influencerId: v.id("ecInfluencers") },
  handler: async (ctx, args) => {
    const inf = await ctx.db.get(args.influencerId);
    if (!inf) return;
    await requireStoreAccess(ctx, inf.storeId);
    await ctx.db.delete(args.influencerId);
  },
});

// ------------------------------------------------------------- internal -----

export const insertCampaign = internalMutation({
  args: {
    storeId: v.id("ecStores"),
    name: v.string(),
    channel: channelValidator,
    objective: v.string(),
    dailyBudget: v.number(),
    productIds: v.array(v.id("ecProducts")),
    targeting: v.any(),
    strategy: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ecAdCampaigns", {
      ...args,
      status: "draft",
      simulated: true,
      metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 },
      metricsHistory: [],
      optimizations: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const patchCampaign = internalMutation({
  args: {
    campaignId: v.id("ecAdCampaigns"),
    status: v.optional(campaignStatusValidator),
    externalId: v.optional(v.string()),
    externalStatus: v.optional(v.string()),
    simulated: v.optional(v.boolean()),
    dailyBudget: v.optional(v.number()),
    metrics: v.optional(metricsValidator),
    appendHistory: v.optional(v.object({ date: v.string(), impressions: v.number(), clicks: v.number(), spend: v.number(), conversions: v.number(), revenue: v.number() })),
    optimization: v.optional(v.object({ action: v.string(), reason: v.string(), automated: v.boolean() })),
    lastSyncedAt: v.optional(v.number()),
    lastOptimizedAt: v.optional(v.number()),
    strategy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.campaignId);
    if (!c) throw new Error("Campaign not found");
    const { campaignId, appendHistory, optimization, ...rest } = args;
    const clean = Object.fromEntries(Object.entries(rest).filter(([, val]) => val !== undefined));
    const patch: Record<string, unknown> = { ...clean, updatedAt: Date.now() };
    if (appendHistory) patch.metricsHistory = [...(c.metricsHistory ?? []), appendHistory].slice(-90);
    if (optimization) patch.optimizations = [...c.optimizations, { at: Date.now(), ...optimization }];
    await ctx.db.patch(campaignId, patch);
  },
});

export const getCampaignInternal = internalQuery({
  args: { campaignId: v.id("ecAdCampaigns") },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.campaignId);
    if (!c) return null;
    const creatives = await ctx.db.query("ecCreatives").withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId)).collect();
    return { ...c, creatives };
  },
});

export const listCampaignsInternal = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => ctx.db.query("ecAdCampaigns").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
});

export const insertCreatives = internalMutation({
  args: { storeId: v.id("ecStores"), creatives: v.array(creativeInputValidator) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];
    for (const cr of args.creatives) {
      ids.push(await ctx.db.insert("ecCreatives", { storeId: args.storeId, ...cr, status: "draft", createdAt: now }));
    }
    return ids;
  },
});

export const insertFlow = internalMutation({
  args: { storeId: v.id("ecStores"), name: v.string(), channel: v.union(v.literal("email"), v.literal("sms")), trigger: triggerValidator, steps: v.array(stepValidator), usedAi: v.boolean() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("ecMessagingFlows").withIndex("by_store_trigger", (q) => q.eq("storeId", args.storeId).eq("trigger", args.trigger)).collect();
    const same = existing.find((f) => f.channel === args.channel);
    if (same) {
      await ctx.db.patch(same._id, { name: args.name, steps: args.steps, usedAi: args.usedAi, updatedAt: now });
      return same._id;
    }
    return await ctx.db.insert("ecMessagingFlows", { ...args, status: "active", stats: { sent: 0, opened: 0, clicked: 0 }, createdAt: now, updatedAt: now });
  },
});

export const getFlowsByTrigger = internalQuery({
  args: { storeId: v.id("ecStores"), trigger: triggerValidator },
  handler: async (ctx, args) => {
    const flows = await ctx.db.query("ecMessagingFlows").withIndex("by_store_trigger", (q) => q.eq("storeId", args.storeId).eq("trigger", args.trigger)).collect();
    return flows.filter((f) => f.status === "active");
  },
});

export const getFlowInternal = internalQuery({
  args: { flowId: v.id("ecMessagingFlows") },
  handler: async (ctx, args) => ctx.db.get(args.flowId),
});

export const bumpFlowStats = internalMutation({
  args: { flowId: v.id("ecMessagingFlows") },
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.flowId);
    if (!flow) return;
    await ctx.db.patch(args.flowId, { stats: { ...flow.stats, sent: flow.stats.sent + 1 } });
  },
});

export const insertMessageLog = internalMutation({
  args: {
    storeId: v.id("ecStores"),
    orderId: v.optional(v.id("ecOrders")),
    flowId: v.optional(v.id("ecMessagingFlows")),
    channel: v.union(v.literal("email"), v.literal("sms")),
    to: v.string(),
    subject: v.optional(v.string()),
    body: v.string(),
    status: v.union(v.literal("sent"), v.literal("simulated"), v.literal("failed")),
    provider: v.string(),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("ecMessageLogs", { ...args, createdAt: Date.now() }),
});

export const insertInfluencers = internalMutation({
  args: {
    storeId: v.id("ecStores"),
    influencers: v.array(v.object({
      name: v.string(), handle: v.string(), platform: v.string(), followers: v.number(), engagementRate: v.number(), niche: v.string(),
      contact: v.optional(v.string()), profileUrl: v.optional(v.string()), fitScore: v.number(), estimatedRate: v.optional(v.number()), usedAi: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("ecInfluencers").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    const handles = new Set(existing.map((e) => e.handle.toLowerCase()));
    let inserted = 0;
    for (const inf of args.influencers) {
      if (handles.has(inf.handle.toLowerCase())) continue;
      await ctx.db.insert("ecInfluencers", { storeId: args.storeId, ...inf, status: "identified", createdAt: now });
      inserted += 1;
    }
    return inserted;
  },
});

export const getInfluencerInternal = internalQuery({
  args: { influencerId: v.id("ecInfluencers") },
  handler: async (ctx, args) => ctx.db.get(args.influencerId),
});

export const patchInfluencer = internalMutation({
  args: { influencerId: v.id("ecInfluencers"), status: v.optional(influencerStatusValidator), outreachMessage: v.optional(v.string()), followUpMessage: v.optional(v.string()), lastContactedAt: v.optional(v.number()), usedAi: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const { influencerId, ...patch } = args;
    const clean = Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined));
    await ctx.db.patch(influencerId, clean);
  },
});
