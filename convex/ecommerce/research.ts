import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { requireStoreAccess } from "./lib/auth";

export const runKindValidator = v.union(v.literal("trends"), v.literal("competitor"), v.literal("margins"), v.literal("ideas"));

export const ideaInputValidator = v.object({
  name: v.string(),
  description: v.string(),
  category: v.string(),
  trendScore: v.number(),
  competitionLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  demandSignal: v.string(),
  whyNow: v.optional(v.string()),
  risks: v.optional(v.array(v.string())),
  estimatedCost: v.number(),
  suggestedPrice: v.number(),
  searchVolume: v.optional(v.string()),
  keywords: v.optional(v.array(v.string())),
  supplierHints: v.optional(v.array(v.string())),
});

export const listRuns = query({
  args: { storeId: v.id("ecStores"), kind: v.optional(runKindValidator) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const runs = await ctx.db.query("ecResearchRuns").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").take(60);
    return args.kind ? runs.filter((r) => r.kind === args.kind) : runs;
  },
});

export const getRun = query({
  args: { runId: v.id("ecResearchRuns") },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) return null;
    await requireStoreAccess(ctx, run.storeId);
    return run;
  },
});

export const listIdeas = query({
  args: { storeId: v.id("ecStores"), status: v.optional(v.union(v.literal("candidate"), v.literal("shortlisted"), v.literal("rejected"), v.literal("launched"))) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const ideas = await ctx.db.query("ecProductIdeas").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").collect();
    const filtered = args.status ? ideas.filter((i) => i.status === args.status) : ideas;
    return filtered.sort((a, b) => b.trendScore - a.trendScore);
  },
});

export const listCompetitors = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    return await ctx.db.query("ecCompetitors").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").collect();
  },
});

export const updateIdeaStatus = mutation({
  args: { ideaId: v.id("ecProductIdeas"), status: v.union(v.literal("candidate"), v.literal("shortlisted"), v.literal("rejected"), v.literal("launched")) },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    await requireStoreAccess(ctx, idea.storeId);
    await ctx.db.patch(args.ideaId, { status: args.status });
  },
});

export const deleteIdea = mutation({
  args: { ideaId: v.id("ecProductIdeas") },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) return;
    await requireStoreAccess(ctx, idea.storeId);
    await ctx.db.delete(args.ideaId);
  },
});

export const deleteCompetitor = mutation({
  args: { competitorId: v.id("ecCompetitors") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.competitorId);
    if (!row) return;
    await requireStoreAccess(ctx, row.storeId);
    await ctx.db.delete(args.competitorId);
  },
});

// ------------------------------------------------------------- internal -----

export const createRun = internalMutation({
  args: { storeId: v.id("ecStores"), kind: runKindValidator, query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ecResearchRuns", { storeId: args.storeId, kind: args.kind, query: args.query, status: "running", usedAi: false, createdAt: Date.now() });
  },
});

export const completeRun = internalMutation({
  args: {
    runId: v.id("ecResearchRuns"),
    summary: v.string(),
    result: v.any(),
    sources: v.optional(v.array(v.object({ title: v.string(), url: v.string() }))),
    usedAi: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, { status: "completed", summary: args.summary, result: args.result, sources: args.sources, usedAi: args.usedAi, completedAt: Date.now() });
  },
});

export const failRun = internalMutation({
  args: { runId: v.id("ecResearchRuns"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, { status: "failed", error: args.error, completedAt: Date.now() });
  },
});

export const insertIdeas = internalMutation({
  args: { storeId: v.id("ecStores"), runId: v.optional(v.id("ecResearchRuns")), ideas: v.array(ideaInputValidator) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];
    for (const idea of args.ideas) {
      const margin = idea.suggestedPrice - idea.estimatedCost;
      ids.push(
        await ctx.db.insert("ecProductIdeas", {
          storeId: args.storeId,
          researchRunId: args.runId,
          ...idea,
          estimatedMargin: Math.round(margin * 100) / 100,
          marginPct: idea.suggestedPrice > 0 ? Math.round((margin / idea.suggestedPrice) * 1000) / 10 : 0,
          status: "candidate",
          createdAt: now,
        })
      );
    }
    return ids;
  },
});

export const upsertCompetitor = internalMutation({
  args: {
    storeId: v.id("ecStores"),
    url: v.string(),
    domain: v.string(),
    name: v.string(),
    positioning: v.optional(v.string()),
    priceRange: v.optional(v.object({ min: v.number(), max: v.number() })),
    strengths: v.array(v.string()),
    weaknesses: v.array(v.string()),
    opportunities: v.array(v.string()),
    topProducts: v.array(v.object({ name: v.string(), price: v.optional(v.number()), note: v.optional(v.string()) })),
    trafficEstimate: v.optional(v.string()),
    marketingChannels: v.optional(v.array(v.string())),
    usedAi: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = (await ctx.db.query("ecCompetitors").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect()).find((c) => c.domain === args.domain);
    const { storeId, ...rest } = args;
    if (existing) {
      await ctx.db.patch(existing._id, { ...rest, lastAnalyzedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("ecCompetitors", { storeId, ...rest, lastAnalyzedAt: now, createdAt: now });
  },
});

export const getIdeaInternal = internalQuery({
  args: { ideaId: v.id("ecProductIdeas") },
  handler: async (ctx, args) => ctx.db.get(args.ideaId),
});

export const competitorPricesInternal = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const comps = await ctx.db.query("ecCompetitors").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    return comps.flatMap((c) => c.topProducts.map((p) => p.price).filter((p): p is number => typeof p === "number"));
  },
});
