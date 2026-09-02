import { v } from "convex/values";
import { internalQuery, mutation, query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getCurrentUser, requireStoreAccess, requireUser } from "./lib/auth";
import { slugify, randomId } from "./lib/text";
import { fallbackFlow } from "./lib/fallbacks";

export const pricingValidator = v.object({
  strategy: v.union(v.literal("margin"), v.literal("competitive"), v.literal("premium"), v.literal("penetration")),
  targetMarginPct: v.number(),
  roundTo: v.union(v.literal("none"), v.literal(".99"), v.literal(".95"), v.literal("whole")),
  minMarginPct: v.number(),
});

export const automationValidator = v.object({
  autoFulfill: v.boolean(),
  autoNotifyTracking: v.boolean(),
  autoHandleCancellations: v.boolean(),
  autoOptimizeCampaigns: v.boolean(),
  autoRefreshTrends: v.boolean(),
  riskHoldAmount: v.number(),
  minRoas: v.number(),
  maxCpa: v.number(),
});

const DEFAULT_PRICING = { strategy: "margin" as const, targetMarginPct: 30, roundTo: ".99" as const, minMarginPct: 15 };
const DEFAULT_AUTOMATION = {
  autoFulfill: true,
  autoNotifyTracking: true,
  autoHandleCancellations: true,
  autoOptimizeCampaigns: true,
  autoRefreshTrends: false,
  riskHoldAmount: 500,
  minRoas: 2,
  maxCpa: 40,
};

async function uniqueSlug(ctx: MutationCtx, base: string): Promise<string> {
  let slug = slugify(base);
  let n = 1;
  while (await ctx.db.query("ecStores").withIndex("by_slug", (q) => q.eq("slug", slug)).first()) {
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
  return slug;
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    if (user.role === "admin") {
      return await ctx.db.query("ecStores").order("desc").collect();
    }
    return await ctx.db.query("ecStores").withIndex("by_owner", (q) => q.eq("ownerId", user._id)).order("desc").collect();
  },
});

export const get = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    return store;
  },
});

/** Used by actions: verifies the caller's access and returns the store. */
export const requireAccess = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    return store;
  },
});

/** Used by scheduled jobs (no user in context). */
export const getInternal = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => ctx.db.get(args.storeId),
});

export const listAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => ctx.db.query("ecStores").collect(),
});

export const create = mutation({
  args: {
    name: v.string(),
    niche: v.string(),
    description: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    brandVoice: v.optional(v.string()),
    currency: v.optional(v.string()),
    country: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.name);
    const storeId = await ctx.db.insert("ecStores", {
      ownerId: user._id,
      name: args.name.trim(),
      slug,
      niche: args.niche.trim(),
      description: args.description?.trim() || undefined,
      targetAudience: args.targetAudience?.trim() || undefined,
      brandVoice: args.brandVoice?.trim() || undefined,
      currency: args.currency ?? "USD",
      country: args.country,
      primaryColor: args.primaryColor ?? "#d4a017",
      status: "setup",
      seo: {
        title: `${args.name} – ${args.niche}`,
        description: `${args.name} is the home of thoughtfully designed ${args.niche.toLowerCase()} products. Fast shipping and a 30-day guarantee.`,
        keywords: [args.niche.toLowerCase(), `${args.niche.toLowerCase()} store`, args.name.toLowerCase()],
      },
      pricing: DEFAULT_PRICING,
      automation: DEFAULT_AUTOMATION,
      createdAt: now,
      updatedAt: now,
    });

    // Inbound order webhook token so external systems can push orders immediately.
    await ctx.db.insert("ecConnectors", {
      storeId,
      provider: "inbound_webhook",
      label: "Inbound order webhook",
      status: "connected",
      credentials: { token: randomId("whk_") },
      config: {},
      createdAt: now,
      updatedAt: now,
    });

    // Seed transactional messaging flows so order automation can notify customers from day one.
    const triggers = ["order_confirmation", "shipping_update", "delivered", "cancellation"] as const;
    for (const trigger of triggers) {
      const flow = fallbackFlow(trigger, args.name, "email");
      await ctx.db.insert("ecMessagingFlows", {
        storeId,
        name: flow.name,
        channel: "email",
        trigger,
        steps: flow.steps,
        status: "active",
        stats: { sent: 0, opened: 0, clicked: 0 },
        usedAi: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("ecActivity", {
      storeId,
      actor: "user",
      area: "settings",
      action: "Store created",
      detail: `${args.name} (${args.niche}) is ready. Transactional email flows and an inbound order webhook were set up automatically.`,
      level: "success",
      createdAt: now,
    });
    return storeId;
  },
});

export const update = mutation({
  args: {
    storeId: v.id("ecStores"),
    name: v.optional(v.string()),
    niche: v.optional(v.string()),
    description: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    brandVoice: v.optional(v.string()),
    currency: v.optional(v.string()),
    country: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("setup"), v.literal("live"), v.literal("paused"))),
    seo: v.optional(v.object({ title: v.optional(v.string()), description: v.optional(v.string()), keywords: v.optional(v.array(v.string())) })),
  },
  handler: async (ctx, args) => {
    const { storeId, ...patch } = args;
    await requireStoreAccess(ctx, storeId);
    const clean = Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined));
    await ctx.db.patch(storeId, { ...clean, updatedAt: Date.now() });
  },
});

export const updateAutomation = mutation({
  args: { storeId: v.id("ecStores"), automation: automationValidator },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    await ctx.db.patch(args.storeId, { automation: args.automation, updatedAt: Date.now() });
    await ctx.db.insert("ecActivity", {
      storeId: args.storeId,
      actor: "user",
      area: "settings",
      action: "Automation rules updated",
      level: "info",
      createdAt: Date.now(),
    });
  },
});

export const updatePricing = mutation({
  args: { storeId: v.id("ecStores"), pricing: pricingValidator },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    await ctx.db.patch(args.storeId, { pricing: args.pricing, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const tables = [
      "ecConnectors", "ecResearchRuns", "ecProductIdeas", "ecCompetitors", "ecProducts", "ecCollections",
      "ecAdCampaigns", "ecCreatives", "ecMessagingFlows", "ecMessageLogs", "ecInfluencers", "ecOrders", "ecShipments", "ecActivity",
    ] as const;
    for (const table of tables) {
      const rows = await ctx.db
        .query(table)
        .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
        .collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }
    await ctx.db.delete(args.storeId);
  },
});

export const overview = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    const [orders, products, campaigns, ideas, shipments, activity, influencers] = await Promise.all([
      ctx.db.query("ecOrders").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
      ctx.db.query("ecProducts").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
      ctx.db.query("ecAdCampaigns").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
      ctx.db.query("ecProductIdeas").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
      ctx.db.query("ecShipments").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
      ctx.db.query("ecActivity").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").take(12),
      ctx.db.query("ecInfluencers").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
    ]);
    const paid = orders.filter((o) => o.paymentStatus === "paid" && o.fulfillmentStatus !== "cancelled");
    const revenue = paid.reduce((s, o) => s + o.total, 0);
    const cogs = paid.reduce((s, o) => s + o.items.reduce((a, i) => a + (i.unitCost ?? 0) * i.quantity, 0), 0);
    const spend = campaigns.reduce((s, c) => s + c.metrics.spend, 0);
    const adRevenue = campaigns.reduce((s, c) => s + c.metrics.revenue, 0);
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const automationActions = activity.filter((a) => a.actor === "automation").length;
    return {
      store,
      kpis: {
        revenue,
        orders: orders.length,
        paidOrders: paid.length,
        grossProfit: revenue - cogs,
        avgOrderValue: paid.length ? revenue / paid.length : 0,
        pendingFulfillment: orders.filter((o) => o.paymentStatus === "paid" && ["unfulfilled", "on_hold"].includes(o.fulfillmentStatus)).length,
        inTransit: shipments.filter((s) => ["in_transit", "out_for_delivery", "label_created"].includes(s.status)).length,
        products: products.length,
        activeProducts: products.filter((p) => p.status === "active").length,
        campaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c) => c.status === "active").length,
        adSpend: spend,
        adRevenue,
        roas: spend > 0 ? adRevenue / spend : 0,
        ideas: ideas.length,
        shortlisted: ideas.filter((i) => i.status === "shortlisted").length,
        influencers: influencers.length,
        ordersLast24h: orders.filter((o) => o.createdAt > dayAgo).length,
        automationActions,
      },
      recentOrders: orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
      activity,
      pipeline: {
        research: ideas.length > 0,
        store: products.some((p) => p.status === "active"),
        marketing: campaigns.length > 0,
        orders: orders.length > 0,
      },
    };
  },
});

export type StoreDoc = Doc<"ecStores">;
export type StoreId = Id<"ecStores">;
