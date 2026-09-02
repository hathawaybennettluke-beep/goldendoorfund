"use node";
/**
 * Pillar 1 – Finding products: trend research, competitor analysis,
 * margin estimation and idea generation.
 */
import { v } from "convex/values";
import { z } from "zod";
import { action, internalAction } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { aiEnabled, generateStructured, researchWithWebSearch, storeContext, withAi, type AiResult, type AiSource } from "./lib/ai";
import { domainOf, fallbackCompetitor, fallbackTrendIdeas } from "./lib/fallbacks";
import { computeMargin, DEFAULT_MARGIN_ASSUMPTIONS, suggestPrice } from "./lib/pricing";

const IdeaSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  trendScore: z.number().describe("0-100, how strongly demand is rising right now"),
  competitionLevel: z.enum(["low", "medium", "high"]),
  demandSignal: z.string().describe("Concrete evidence of demand, with the time frame"),
  whyNow: z.string(),
  risks: z.array(z.string()),
  estimatedCost: z.number().describe("Estimated landed unit cost in store currency"),
  suggestedPrice: z.number().describe("Recommended retail price in store currency"),
  searchVolume: z.string().describe("Estimated monthly searches, e.g. '22k/mo (estimate)'"),
  keywords: z.array(z.string()),
  supplierHints: z.array(z.string()),
});

const TrendResultSchema = z.object({
  summary: z.string().describe("3-5 sentence market summary for the store owner"),
  ideas: z.array(IdeaSchema),
});

const CompetitorSchema = z.object({
  name: z.string(),
  positioning: z.string(),
  priceRange: z.object({ min: z.number(), max: z.number() }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()).describe("Specific ways our store can win against this competitor"),
  topProducts: z.array(z.object({ name: z.string(), price: z.number().describe("0 if unknown"), note: z.string() })),
  trafficEstimate: z.string(),
  marketingChannels: z.array(z.string()),
});

const MarginAssumptionsSchema = z.object({
  unitCost: z.number(),
  shippingCost: z.number(),
  adCostPerOrder: z.number().describe("Realistic blended CPA for paid social/search in this niche"),
  returnRatePct: z.number(),
  recommendedPrice: z.number(),
  notes: z.string().describe("Brief justification of the assumptions"),
  confidence: z.enum(["low", "medium", "high"]),
});

type TrendData = z.infer<typeof TrendResultSchema> & { sources: AiSource[] };

export interface MarginEstimate {
  productName: string;
  assumptions: { unitCost: number; shippingCost: number; adCostPerOrder: number; returnRatePct: number; paymentFeePct: number; paymentFeeFixed: number; otherCostPerOrder: number; notes: string; confidence: "low" | "medium" | "high" };
  recommended: { price: number; compareAtPrice?: number; rationale: string; netMarginPct: number };
  scenarios: Array<{ price: number; grossProfit: number; grossMarginPct: number; netProfit: number; netMarginPct: number; breakevenRoas: number | null; breakevenCpa: number }>;
  verdict: "viable" | "marginal" | "weak";
  usedAi: boolean;
  warning?: string;
}

async function performTrendResearch(
  ctx: ActionCtx,
  store: Doc<"ecStores">,
  focus: string | undefined,
  actor: "user" | "automation"
): Promise<{ runId: Id<"ecResearchRuns">; ideaCount: number; usedAi: boolean; warning?: string }> {
  const query = focus?.trim() || store.niche;
  const runId = await ctx.runMutation(internal.ecommerce.research.createRun, { storeId: store._id, kind: "trends", query });
  try {
    const result = await withAi<TrendData>(
      async () => {
        const research = await researchWithWebSearch({
          prompt: `Research currently trending and rising ecommerce products for this store. Focus: "${query}".\n\n${storeContext(store)}\n\nUse web search to look at recent trend reports, marketplace best-seller movements, social media product trends and search-interest signals from the last 90 days. Collect concrete evidence (what is rising, why, price points, competition, sourcing notes). Cover 6-8 distinct product opportunities.`,
          maxUses: 8,
        });
        const structured = await generateStructured({
          schema: TrendResultSchema,
          effort: "medium",
          prompt: `Turn these research notes into a structured list of 6-8 product opportunities for the store below. Estimate costs and prices in ${store.currency}. Be honest about uncertainty in the text fields.\n\n${storeContext(store)}\n\nRESEARCH NOTES:\n${research.notes}`,
        });
        return { ...structured, sources: research.sources };
      },
      () => ({
        summary: `Demo-mode analysis for "${query}": we generated representative product opportunities using built-in market templates. Add an ANTHROPIC_API_KEY to run live web research with cited sources.`,
        ideas: fallbackTrendIdeas(query, 6),
        sources: [],
      })
    );
    const ideaIds = await ctx.runMutation(internal.ecommerce.research.insertIdeas, {
      storeId: store._id,
      runId,
      ideas: result.data.ideas.map((i) => ({ ...i, trendScore: Math.max(0, Math.min(100, Math.round(i.trendScore))) })),
    });
    await ctx.runMutation(internal.ecommerce.research.completeRun, {
      runId,
      summary: result.data.summary,
      result: { ideaIds, ideaCount: ideaIds.length, warning: result.warning },
      sources: result.data.sources,
      usedAi: result.usedAi,
    });
    await ctx.runMutation(internal.ecommerce.activity.log, {
      storeId: store._id,
      actor,
      area: "research",
      action: `Trend research completed for "${query}"`,
      detail: `${ideaIds.length} product opportunities added${result.usedAi ? " (live web research)" : " (demo templates)"}.`,
      level: "success",
      refType: "researchRun",
      refId: runId,
    });
    return { runId, ideaCount: ideaIds.length, usedAi: result.usedAi, warning: result.warning };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await ctx.runMutation(internal.ecommerce.research.failRun, { runId, error: message });
    throw error;
  }
}

export const runTrendResearch = action({
  args: { storeId: v.id("ecStores"), focus: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ runId: Id<"ecResearchRuns">; ideaCount: number; usedAi: boolean; warning?: string }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    return await performTrendResearch(ctx, store, args.focus, "user");
  },
});

export const refreshTrendsAllStores = internalAction({
  args: {},
  handler: async (ctx) => {
    const stores = await ctx.runQuery(internal.ecommerce.stores.listAllInternal, {});
    for (const store of stores) {
      if (!store.automation.autoRefreshTrends) continue;
      try {
        await performTrendResearch(ctx, store, undefined, "automation");
      } catch (error) {
        console.error("Scheduled trend refresh failed", store._id, error);
      }
    }
  },
});

async function fetchPageText(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url.startsWith("http") ? url : `https://${url}`, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StoreResearchBot/1.0)", Accept: "text/html" },
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 8000);
  } catch {
    return "";
  }
}

export const analyzeCompetitor = action({
  args: { storeId: v.id("ecStores"), url: v.string() },
  handler: async (ctx, args): Promise<{ competitorId: Id<"ecCompetitors">; usedAi: boolean; warning?: string }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const domain = domainOf(args.url);
    const runId = await ctx.runMutation(internal.ecommerce.research.createRun, { storeId: store._id, kind: "competitor", query: domain });
    try {
      const pageText = aiEnabled() ? await fetchPageText(args.url) : "";
      const result = await withAi(
        async () => {
          const research = await researchWithWebSearch({
            prompt: `Analyse the ecommerce competitor at ${domain} for the store below. Find their positioning, price range, best-selling products, marketing channels, reviews/sentiment and weaknesses we can exploit.\n\n${storeContext(store)}\n\n${pageText ? `HOMEPAGE TEXT (truncated):\n${pageText}` : ""}`,
            maxUses: 6,
          });
          const structured = await generateStructured({
            schema: CompetitorSchema,
            prompt: `Summarise this competitor analysis into the required structure. Prices in ${store.currency}; use 0 when a price is unknown.\n\nCOMPETITOR: ${domain}\n\nNOTES:\n${research.notes}`,
          });
          return { ...structured, sources: research.sources };
        },
        () => ({ ...fallbackCompetitor(args.url, store.niche), sources: [] as AiSource[] })
      );
      const competitorId = await ctx.runMutation(internal.ecommerce.research.upsertCompetitor, {
        storeId: store._id,
        url: args.url,
        domain,
        name: result.data.name,
        positioning: result.data.positioning,
        priceRange: result.data.priceRange,
        strengths: result.data.strengths,
        weaknesses: result.data.weaknesses,
        opportunities: result.data.opportunities,
        topProducts: result.data.topProducts.map((p) => ({ name: p.name, price: p.price > 0 ? p.price : undefined, note: p.note || undefined })),
        trafficEstimate: result.data.trafficEstimate,
        marketingChannels: result.data.marketingChannels,
        usedAi: result.usedAi,
      });
      await ctx.runMutation(internal.ecommerce.research.completeRun, {
        runId,
        summary: `${result.data.name}: ${result.data.positioning}`,
        result: { competitorId, warning: result.warning },
        sources: result.data.sources,
        usedAi: result.usedAi,
      });
      await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "research", action: `Competitor analysed: ${domain}`, level: "success", refType: "competitor", refId: competitorId });
      return { competitorId, usedAi: result.usedAi, warning: result.warning };
    } catch (error) {
      await ctx.runMutation(internal.ecommerce.research.failRun, { runId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
});

export const estimateMargins = action({
  args: {
    storeId: v.id("ecStores"),
    productName: v.string(),
    category: v.optional(v.string()),
    unitCost: v.optional(v.number()),
    price: v.optional(v.number()),
    shippingCost: v.optional(v.number()),
    adCostPerOrder: v.optional(v.number()),
    ideaId: v.optional(v.id("ecProductIdeas")),
  },
  handler: async (ctx, args): Promise<MarginEstimate> => {
    const store: Doc<"ecStores"> = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const competitorPrices: number[] = await ctx.runQuery(internal.ecommerce.research.competitorPricesInternal, { storeId: args.storeId });
    const runId = await ctx.runMutation(internal.ecommerce.research.createRun, { storeId: store._id, kind: "margins", query: args.productName });

    const assumptions: AiResult<z.infer<typeof MarginAssumptionsSchema>> = await withAi(
      () =>
        generateStructured({
          schema: MarginAssumptionsSchema,
          effort: "low",
          prompt: `Estimate realistic unit economics for selling "${args.productName}"${args.category ? ` (${args.category})` : ""} online in ${store.currency}.\n${storeContext(store)}\n${args.unitCost ? `Owner's unit cost estimate: ${args.unitCost}.` : ""} ${args.price ? `Owner's intended price: ${args.price}.` : ""} ${competitorPrices.length ? `Known competitor prices: ${competitorPrices.join(", ")}.` : ""}\nReturn typical landed cost, shipping-to-customer cost, blended paid-ads cost per order, return rate and a recommended retail price.`,
        }),
      () => {
        const unitCost = args.unitCost ?? 12;
        return {
          unitCost,
          shippingCost: args.shippingCost ?? Math.round(unitCost * 0.35 * 100) / 100,
          adCostPerOrder: args.adCostPerOrder ?? Math.max(8, Math.round(unitCost * 1.1)),
          returnRatePct: DEFAULT_MARGIN_ASSUMPTIONS.returnRatePct,
          recommendedPrice: args.price ?? Math.ceil(unitCost * 3) - 0.01,
          notes: "Template assumptions: 3x cost multiple, ~35% of cost for shipping, CPA ≈ 1.1x unit cost. Replace with supplier quotes when available.",
          confidence: "low" as const,
        };
      }
    );
    const a = assumptions.data;
    const unitCost = args.unitCost ?? a.unitCost;
    const shippingCost = args.shippingCost ?? a.shippingCost;
    const adCostPerOrder = args.adCostPerOrder ?? a.adCostPerOrder;
    const base = { cost: unitCost, shippingCost, adCostPerOrder, paymentFeePct: DEFAULT_MARGIN_ASSUMPTIONS.paymentFeePct, paymentFeeFixed: DEFAULT_MARGIN_ASSUMPTIONS.paymentFeeFixed, platformFeePct: 0, returnRatePct: a.returnRatePct, otherCostPerOrder: DEFAULT_MARGIN_ASSUMPTIONS.otherCostPerOrder };
    const suggestion = suggestPrice({ ...store.pricing, cost: unitCost, shippingCost, adCostPerOrder, competitorPrices });
    const candidatePrices = Array.from(new Set([args.price, a.recommendedPrice, suggestion.price, Math.ceil(unitCost * 2.5) - 0.01, Math.ceil(unitCost * 4) - 0.01].filter((p): p is number => typeof p === "number" && p > 0))).sort((x, y) => x - y);
    const scenarios = candidatePrices.map((price) => {
      const m = computeMargin({ ...base, price });
      return { price, grossProfit: m.grossProfit, grossMarginPct: m.grossMarginPct, netProfit: m.netProfit, netMarginPct: m.netMarginPct, breakevenRoas: Number.isFinite(m.breakevenRoas) ? m.breakevenRoas : null, breakevenCpa: m.breakevenCpa };
    });
    const result: MarginEstimate = {
      productName: args.productName,
      assumptions: { unitCost, shippingCost, adCostPerOrder, returnRatePct: a.returnRatePct, paymentFeePct: base.paymentFeePct, paymentFeeFixed: base.paymentFeeFixed, otherCostPerOrder: base.otherCostPerOrder, notes: a.notes, confidence: a.confidence },
      recommended: { price: suggestion.price, compareAtPrice: suggestion.compareAtPrice, rationale: suggestion.rationale, netMarginPct: suggestion.netMarginPct },
      scenarios,
      verdict: suggestion.netMarginPct >= store.pricing.targetMarginPct ? "viable" : suggestion.netMarginPct >= store.pricing.minMarginPct ? "marginal" : "weak",
      usedAi: assumptions.usedAi,
      warning: assumptions.warning,
    };
    await ctx.runMutation(internal.ecommerce.research.completeRun, { runId, summary: `${args.productName}: recommended ${store.currency} ${suggestion.price.toFixed(2)} → ${suggestion.netMarginPct.toFixed(1)}% net margin (${result.verdict})`, result, usedAi: assumptions.usedAi });
    return result;
  },
});

export const generateIdeasFromBrief = action({
  args: { storeId: v.id("ecStores"), brief: v.string() },
  handler: async (ctx, args): Promise<{ runId: Id<"ecResearchRuns">; ideaCount: number; usedAi: boolean; warning?: string }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const runId = await ctx.runMutation(internal.ecommerce.research.createRun, { storeId: store._id, kind: "ideas", query: args.brief });
    try {
      const result = await withAi(
        () =>
          generateStructured({
            schema: TrendResultSchema,
            prompt: `Brainstorm 6 sellable product ideas that fit this brief and store. Prefer products that are demonstrable on video, solve a clear problem, weigh under 1kg and can retail at 2.5-4x landed cost. Prices in ${store.currency}.\n\nBRIEF: ${args.brief}\n\n${storeContext(store)}`,
          }),
        () => ({ summary: `Demo-mode ideas for: ${args.brief}`, ideas: fallbackTrendIdeas(args.brief, 6) })
      );
      const ideaIds = await ctx.runMutation(internal.ecommerce.research.insertIdeas, { storeId: store._id, runId, ideas: result.data.ideas });
      await ctx.runMutation(internal.ecommerce.research.completeRun, { runId, summary: result.data.summary, result: { ideaIds, warning: result.warning }, usedAi: result.usedAi });
      await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "research", action: "Product ideas generated from brief", detail: `${ideaIds.length} ideas: ${args.brief.slice(0, 80)}`, level: "success", refType: "researchRun", refId: runId });
      return { runId, ideaCount: ideaIds.length, usedAi: result.usedAi, warning: result.warning };
    } catch (error) {
      await ctx.runMutation(internal.ecommerce.research.failRun, { runId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
});
