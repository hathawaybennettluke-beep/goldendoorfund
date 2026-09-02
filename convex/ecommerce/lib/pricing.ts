/**
 * Pure pricing & margin math shared by the backend and the dashboard UI.
 */
export type RoundTo = "none" | ".99" | ".95" | "whole";
export type PricingStrategy = "margin" | "competitive" | "premium" | "penetration";

export interface MarginInputs {
  price: number;
  cost: number;
  shippingCost: number;
  paymentFeePct: number; // e.g. 2.9
  paymentFeeFixed: number; // e.g. 0.30
  platformFeePct: number; // marketplace / app fees
  adCostPerOrder: number; // blended CPA
  returnRatePct: number; // % of orders refunded
  otherCostPerOrder: number; // packaging, handling
}

export interface MarginResult {
  revenue: number;
  landedCost: number;
  paymentFees: number;
  platformFees: number;
  adCost: number;
  returnsCost: number;
  otherCost: number;
  totalCost: number;
  grossProfit: number; // before ads
  grossMarginPct: number;
  netProfit: number; // after ads
  netMarginPct: number;
  breakevenRoas: number;
  breakevenCpa: number;
  maxCpaForTargetMargin: (targetPct: number) => number;
}

export const DEFAULT_MARGIN_ASSUMPTIONS = {
  paymentFeePct: 2.9,
  paymentFeeFixed: 0.3,
  platformFeePct: 0,
  returnRatePct: 3,
  otherCostPerOrder: 0.75,
};

export function computeMargin(i: MarginInputs): MarginResult {
  const revenue = i.price;
  const landedCost = i.cost + i.shippingCost;
  const paymentFees = revenue * (i.paymentFeePct / 100) + i.paymentFeeFixed;
  const platformFees = revenue * (i.platformFeePct / 100);
  const returnsCost = revenue * (i.returnRatePct / 100);
  const otherCost = i.otherCostPerOrder;
  const grossProfit = revenue - landedCost - paymentFees - platformFees - returnsCost - otherCost;
  const adCost = i.adCostPerOrder;
  const netProfit = grossProfit - adCost;
  const totalCost = landedCost + paymentFees + platformFees + returnsCost + otherCost + adCost;
  const safeRevenue = revenue > 0 ? revenue : 1;
  const breakevenCpa = Math.max(grossProfit, 0);
  const breakevenRoas = breakevenCpa > 0 ? revenue / breakevenCpa : Infinity;
  return {
    revenue,
    landedCost,
    paymentFees,
    platformFees,
    adCost,
    returnsCost,
    otherCost,
    totalCost,
    grossProfit,
    grossMarginPct: (grossProfit / safeRevenue) * 100,
    netProfit,
    netMarginPct: (netProfit / safeRevenue) * 100,
    breakevenRoas,
    breakevenCpa,
    maxCpaForTargetMargin: (targetPct: number) => Math.max(grossProfit - revenue * (targetPct / 100), 0),
  };
}

export function applyRounding(price: number, roundTo: RoundTo): number {
  if (price <= 0) return 0;
  switch (roundTo) {
    case ".99":
      return Math.max(Math.ceil(price) - 0.01, 0.99);
    case ".95":
      return Math.max(Math.ceil(price) - 0.05, 0.95);
    case "whole":
      return Math.max(Math.round(price), 1);
    default:
      return Math.round(price * 100) / 100;
  }
}

/**
 * Price required to hit a target net margin given the cost structure.
 * Solves price so that netMargin = target.
 */
export function priceForTargetMargin(
  targetMarginPct: number,
  costs: Omit<MarginInputs, "price">
): number {
  // price*(1 - feePct - platformPct - returnPct - target) = fixed costs
  const fixed = costs.cost + costs.shippingCost + costs.paymentFeeFixed + costs.otherCostPerOrder + costs.adCostPerOrder;
  const pctSum =
    (costs.paymentFeePct + costs.platformFeePct + costs.returnRatePct + targetMarginPct) / 100;
  if (pctSum >= 0.95) return fixed * 20; // unattainable, cap
  return fixed / (1 - pctSum);
}

export interface PriceSuggestion {
  price: number;
  compareAtPrice?: number;
  rationale: string;
  netMarginPct: number;
}

export function suggestPrice(params: {
  strategy: PricingStrategy;
  targetMarginPct: number;
  minMarginPct: number;
  roundTo: RoundTo;
  cost: number;
  shippingCost: number;
  adCostPerOrder: number;
  competitorPrices?: number[];
  currentPrice?: number;
}): PriceSuggestion {
  const base = {
    cost: params.cost,
    shippingCost: params.shippingCost,
    adCostPerOrder: params.adCostPerOrder,
    ...DEFAULT_MARGIN_ASSUMPTIONS,
  };
  const marginPrice = priceForTargetMargin(params.targetMarginPct, base);
  const floorPrice = priceForTargetMargin(params.minMarginPct, base);
  const comps = (params.competitorPrices ?? []).filter((p) => p > 0).sort((a, b) => a - b);
  const median = comps.length ? comps[Math.floor(comps.length / 2)] : undefined;

  let raw = marginPrice;
  let rationale = `Priced to reach a ${params.targetMarginPct}% net margin after fees, shipping and a $${params.adCostPerOrder.toFixed(2)} blended ad cost.`;

  if (params.strategy === "competitive" && median) {
    raw = Math.max(median * 0.95, floorPrice);
    rationale = `Undercuts the competitor median ($${median.toFixed(2)}) by ~5% while staying above your ${params.minMarginPct}% margin floor.`;
  } else if (params.strategy === "premium") {
    raw = Math.max(marginPrice * 1.25, median ? median * 1.15 : marginPrice * 1.25);
    rationale = `Premium positioning: ~15-25% above the market to signal quality; requires strong creative and social proof.`;
  } else if (params.strategy === "penetration") {
    raw = Math.max(floorPrice * 1.05, median ? median * 0.85 : floorPrice * 1.05);
    rationale = `Penetration pricing to win early volume and reviews; sits just above the ${params.minMarginPct}% margin floor.`;
  }

  const price = applyRounding(raw, params.roundTo);
  const compareAtPrice = applyRounding(price * 1.3, params.roundTo);
  const result = computeMargin({ ...base, price });
  return { price, compareAtPrice, rationale, netMarginPct: result.netMarginPct };
}

export function roas(revenue: number, spend: number): number {
  return spend > 0 ? revenue / spend : 0;
}
export function cpa(spend: number, conversions: number): number {
  return conversions > 0 ? spend / conversions : 0;
}
export function ctr(clicks: number, impressions: number): number {
  return impressions > 0 ? (clicks / impressions) * 100 : 0;
}
