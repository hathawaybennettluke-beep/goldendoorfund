import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireStoreAccess } from "./lib/auth";
import { orderNumber as formatOrderNumber } from "./lib/text";
import { trackingUrlFor } from "./lib/integrations/tracking";

export const addressValidator = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.optional(v.string()),
  postalCode: v.string(),
  country: v.string(),
});
export const customerValidator = v.object({ name: v.string(), email: v.string(), phone: v.optional(v.string()) });
export const orderItemValidator = v.object({
  productId: v.optional(v.id("ecProducts")),
  title: v.string(),
  sku: v.optional(v.string()),
  quantity: v.number(),
  unitPrice: v.number(),
  unitCost: v.optional(v.number()),
  variant: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
});
export const fulfillmentStatusValidator = v.union(
  v.literal("unfulfilled"), v.literal("on_hold"), v.literal("sent_to_fulfillment"), v.literal("in_production"),
  v.literal("shipped"), v.literal("delivered"), v.literal("cancelled"), v.literal("returned")
);
export const paymentStatusValidator = v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded"), v.literal("partially_refunded"), v.literal("failed"));
export const shipmentStatusValidator = v.union(v.literal("label_created"), v.literal("in_transit"), v.literal("out_for_delivery"), v.literal("delivered"), v.literal("exception"), v.literal("returned"));
export const sourceValidator = v.union(v.literal("storefront"), v.literal("shopify"), v.literal("webhook"), v.literal("manual"), v.literal("simulated"));
export const actorValidator = v.union(v.literal("automation"), v.literal("user"), v.literal("system"), v.literal("customer"));
export const timelineEventValidator = v.object({ at: v.number(), event: v.string(), detail: v.optional(v.string()), actor: actorValidator });

const DISPOSABLE_DOMAINS = ["mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com", "yopmail.com", "trashmail.com", "sharklasers.com"];

/** Simple, explainable fraud/risk heuristics. Score >= 50 puts an order on hold. */
export function assessRisk(order: { total: number; customer: { email: string; phone?: string }; items: Array<{ quantity: number }>; shippingAddress: { country: string; postalCode: string } }, holdAmount: number): { flags: string[]; score: number } {
  const flags: string[] = [];
  let score = 0;
  if (order.total >= holdAmount) { flags.push(`Order value above ${holdAmount} review threshold`); score += 50; }
  else if (order.total >= holdAmount * 0.6) { flags.push("Higher than average order value"); score += 15; }
  const domain = order.customer.email.split("@")[1]?.toLowerCase() ?? "";
  if (DISPOSABLE_DOMAINS.includes(domain)) { flags.push("Disposable email domain"); score += 40; }
  if (order.items.some((i) => i.quantity >= 10)) { flags.push("Bulk quantity on a single line"); score += 25; }
  if (!order.shippingAddress.postalCode || order.shippingAddress.postalCode.length < 3) { flags.push("Incomplete shipping address"); score += 30; }
  if (order.total > 200 && !order.customer.phone) { flags.push("No phone number on a larger order"); score += 10; }
  return { flags, score };
}

export interface InsertOrderInput {
  storeId: Id<"ecStores">;
  source: "storefront" | "shopify" | "webhook" | "manual" | "simulated";
  externalId?: string;
  externalOrderNumber?: string;
  customer: { name: string; email: string; phone?: string };
  shippingAddress: { line1: string; line2?: string; city: string; state?: string; postalCode: string; country: string };
  items: Array<{ productId?: Id<"ecProducts">; title: string; sku?: string; quantity: number; unitPrice: number; unitCost?: number; variant?: string; imageUrl?: string }>;
  shipping?: number;
  tax?: number;
  currency?: string;
  paid: boolean;
  paymentReference?: string;
  customerNote?: string;
  actor: "automation" | "user" | "system" | "customer";
}

export async function insertOrder(ctx: MutationCtx, store: Doc<"ecStores">, input: InsertOrderInput): Promise<Id<"ecOrders">> {
  if (input.externalId) {
    const dup = await ctx.db.query("ecOrders").withIndex("by_external", (q) => q.eq("externalId", input.externalId)).first();
    if (dup) return dup._id;
  }
  const count = (await ctx.db.query("ecOrders").withIndex("by_store", (q) => q.eq("storeId", store._id)).collect()).length;
  const orderNumber = input.externalOrderNumber ?? formatOrderNumber(count + 1);
  const subtotal = input.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = input.shipping ?? 0;
  const tax = input.tax ?? 0;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  const now = Date.now();
  const risk = assessRisk({ total, customer: input.customer, items: input.items, shippingAddress: input.shippingAddress }, store.automation.riskHoldAmount);
  const onHold = risk.score >= 50;
  const timeline = [{ at: now, event: "Order received", detail: `Source: ${input.source}`, actor: input.actor }];
  if (onHold) timeline.push({ at: now, event: "Placed on hold for review", detail: risk.flags.join("; "), actor: "automation" as const });
  const orderId = await ctx.db.insert("ecOrders", {
    storeId: store._id,
    orderNumber,
    source: input.source,
    externalId: input.externalId,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    items: input.items,
    subtotal: Math.round(subtotal * 100) / 100,
    shipping,
    tax,
    total,
    currency: input.currency ?? store.currency,
    paymentStatus: input.paid ? "paid" : "pending",
    paymentReference: input.paymentReference,
    fulfillmentStatus: onHold ? "on_hold" : "unfulfilled",
    riskFlags: risk.flags,
    riskScore: risk.score,
    customerNote: input.customerNote,
    timeline,
    createdAt: now,
    updatedAt: now,
  });
  // Decrement inventory for known products.
  for (const item of input.items) {
    if (!item.productId) continue;
    const p = await ctx.db.get(item.productId);
    if (p) await ctx.db.patch(p._id, { inventory: Math.max(p.inventory - item.quantity, 0) });
  }
  await ctx.db.insert("ecActivity", {
    storeId: store._id,
    actor: input.actor === "user" ? "user" : "system",
    area: "orders",
    action: `New order ${orderNumber}`,
    detail: `${input.customer.name} · ${input.items.reduce((s, i) => s + i.quantity, 0)} item(s) · ${total.toFixed(2)} ${input.currency ?? store.currency}${onHold ? " · ON HOLD" : ""}`,
    level: onHold ? "warning" : "info",
    refType: "order",
    refId: orderId,
    createdAt: now,
  });
  return orderId;
}

// -------------------------------------------------------------- queries -----

export const list = query({
  args: { storeId: v.id("ecStores"), fulfillmentStatus: v.optional(fulfillmentStatusValidator), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const orders = await ctx.db.query("ecOrders").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").take(args.limit ?? 200);
    return args.fulfillmentStatus ? orders.filter((o) => o.fulfillmentStatus === args.fulfillmentStatus) : orders;
  },
});

export const get = query({
  args: { orderId: v.id("ecOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    await requireStoreAccess(ctx, order.storeId);
    const [shipments, messages] = await Promise.all([
      ctx.db.query("ecShipments").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).collect(),
      ctx.db.query("ecMessageLogs").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).collect(),
    ]);
    return { ...order, shipments, messages };
  },
});

export const listShipments = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const shipments = await ctx.db.query("ecShipments").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").take(200);
    return await Promise.all(
      shipments.map(async (s) => {
        const order = await ctx.db.get(s.orderId);
        return { ...s, orderNumber: order?.orderNumber ?? "?", customerName: order?.customer.name ?? "" };
      })
    );
  },
});

export const ordersOverview = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const orders = await ctx.db.query("ecOrders").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.fulfillmentStatus] = (counts[o.fulfillmentStatus] ?? 0) + 1;
    const paid = orders.filter((o) => o.paymentStatus === "paid" && o.fulfillmentStatus !== "cancelled");
    return {
      total: orders.length,
      counts,
      revenue: paid.reduce((s, o) => s + o.total, 0),
      awaitingPayment: orders.filter((o) => o.paymentStatus === "pending" && o.fulfillmentStatus !== "cancelled").length,
      needsAttention: orders.filter((o) => o.fulfillmentStatus === "on_hold").length,
    };
  },
});

// ------------------------------------------------------------ mutations -----

export const createManual = mutation({
  args: {
    storeId: v.id("ecStores"),
    customer: customerValidator,
    shippingAddress: addressValidator,
    items: v.array(v.object({ productId: v.id("ecProducts"), quantity: v.number() })),
    paid: v.boolean(),
    shipping: v.optional(v.number()),
    customerNote: v.optional(v.string()),
    source: v.optional(sourceValidator),
  },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    const items = [];
    for (const line of args.items) {
      const p = await ctx.db.get(line.productId);
      if (!p) throw new Error("Product not found");
      items.push({ productId: p._id, title: p.title, sku: p.sku, quantity: line.quantity, unitPrice: p.price, unitCost: p.cost, imageUrl: p.images[0]?.url });
    }
    return await insertOrder(ctx, store, { storeId: args.storeId, source: args.source ?? "manual", customer: args.customer, shippingAddress: args.shippingAddress, items, paid: args.paid, shipping: args.shipping, customerNote: args.customerNote, actor: "user" });
  },
});

export const markPaid = mutation({
  args: { orderId: v.id("ecOrders"), reference: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await requireStoreAccess(ctx, order.storeId);
    await ctx.db.patch(args.orderId, { paymentStatus: "paid", paymentReference: args.reference ?? order.paymentReference, timeline: [...order.timeline, { at: Date.now(), event: "Payment recorded", detail: args.reference, actor: "user" }], updatedAt: Date.now() });
  },
});

export const setHold = mutation({
  args: { orderId: v.id("ecOrders"), hold: v.boolean(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await requireStoreAccess(ctx, order.storeId);
    if (!["unfulfilled", "on_hold"].includes(order.fulfillmentStatus)) throw new Error("Only unfulfilled orders can be held or released.");
    await ctx.db.patch(args.orderId, {
      fulfillmentStatus: args.hold ? "on_hold" : "unfulfilled",
      riskFlags: args.hold ? order.riskFlags : [],
      riskScore: args.hold ? order.riskScore : 0,
      timeline: [...order.timeline, { at: Date.now(), event: args.hold ? "Placed on hold" : "Released from hold – approved for fulfilment", detail: args.reason, actor: "user" }],
      updatedAt: Date.now(),
    });
  },
});

export const addNote = mutation({
  args: { orderId: v.id("ecOrders"), note: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await requireStoreAccess(ctx, order.storeId);
    await ctx.db.patch(args.orderId, { internalNote: args.note, timeline: [...order.timeline, { at: Date.now(), event: "Note added", detail: args.note, actor: "user" }], updatedAt: Date.now() });
  },
});

export const addTracking = mutation({
  args: { orderId: v.id("ecOrders"), carrier: v.string(), trackingNumber: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    await requireStoreAccess(ctx, order.storeId);
    const now = Date.now();
    const shipmentId = await ctx.db.insert("ecShipments", {
      storeId: order.storeId,
      orderId: order._id,
      carrier: args.carrier,
      trackingNumber: args.trackingNumber,
      trackingUrl: trackingUrlFor(args.carrier, args.trackingNumber),
      status: "label_created",
      events: [{ at: now, status: "label_created", description: "Tracking number added" }],
      provider: "manual",
      notifiedStatuses: [],
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(order._id, { fulfillmentStatus: "shipped", timeline: [...order.timeline, { at: now, event: "Shipped", detail: `${args.carrier} ${args.trackingNumber}`, actor: "user" }], updatedAt: now });
    return shipmentId;
  },
});

// ------------------------------------------------------------- internal -----

export const getInternal = internalQuery({
  args: { orderId: v.id("ecOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const shipments = await ctx.db.query("ecShipments").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).collect();
    return { ...order, shipments };
  },
});

export const ingestExternal = internalMutation({
  args: {
    storeId: v.id("ecStores"),
    source: sourceValidator,
    externalId: v.optional(v.string()),
    externalOrderNumber: v.optional(v.string()),
    customer: customerValidator,
    shippingAddress: addressValidator,
    items: v.array(orderItemValidator),
    shipping: v.optional(v.number()),
    tax: v.optional(v.number()),
    currency: v.optional(v.string()),
    paid: v.boolean(),
    paymentReference: v.optional(v.string()),
    customerNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Store not found");
    // Match line items to catalogue products by SKU or title so COGS can be tracked.
    const products = await ctx.db.query("ecProducts").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    const items = args.items.map((item) => {
      const match = products.find((p) => (item.sku && p.sku === item.sku) || p.title.toLowerCase() === item.title.toLowerCase());
      return match ? { ...item, productId: match._id, unitCost: item.unitCost ?? match.cost, imageUrl: item.imageUrl ?? match.images[0]?.url } : item;
    });
    return await insertOrder(ctx, store, { ...args, items, actor: "system" });
  },
});

export const patchOrder = internalMutation({
  args: {
    orderId: v.id("ecOrders"),
    fulfillmentStatus: v.optional(fulfillmentStatusValidator),
    paymentStatus: v.optional(paymentStatusValidator),
    paymentReference: v.optional(v.string()),
    fulfillmentProvider: v.optional(v.string()),
    fulfillmentExternalId: v.optional(v.string()),
    cancelReason: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    timelineEvent: v.optional(v.object({ event: v.string(), detail: v.optional(v.string()), actor: actorValidator })),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    const { orderId, timelineEvent, ...rest } = args;
    const clean = Object.fromEntries(Object.entries(rest).filter(([, val]) => val !== undefined));
    const patch: Record<string, unknown> = { ...clean, updatedAt: Date.now() };
    if (timelineEvent) patch.timeline = [...order.timeline, { at: Date.now(), ...timelineEvent }];
    await ctx.db.patch(orderId, patch);
  },
});

export const listForAutomation = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("ecOrders").withIndex("by_store_fulfillment", (q) => q.eq("storeId", args.storeId).eq("fulfillmentStatus", "unfulfilled")).collect();
    return orders.filter((o) => o.paymentStatus === "paid");
  },
});

export const listActiveShipments = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const shipments = await ctx.db.query("ecShipments").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    return shipments.filter((s) => !["delivered", "returned"].includes(s.status));
  },
});

export const listSentToFulfillment = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const a = await ctx.db.query("ecOrders").withIndex("by_store_fulfillment", (q) => q.eq("storeId", args.storeId).eq("fulfillmentStatus", "sent_to_fulfillment")).collect();
    const b = await ctx.db.query("ecOrders").withIndex("by_store_fulfillment", (q) => q.eq("storeId", args.storeId).eq("fulfillmentStatus", "in_production")).collect();
    return [...a, ...b];
  },
});

export const getShipmentInternal = internalQuery({
  args: { shipmentId: v.id("ecShipments") },
  handler: async (ctx, args) => ctx.db.get(args.shipmentId),
});

export const upsertShipment = internalMutation({
  args: {
    shipmentId: v.optional(v.id("ecShipments")),
    storeId: v.id("ecStores"),
    orderId: v.id("ecOrders"),
    carrier: v.string(),
    trackingNumber: v.string(),
    status: shipmentStatusValidator,
    events: v.array(v.object({ at: v.number(), status: v.string(), location: v.optional(v.string()), description: v.string() })),
    estimatedDelivery: v.optional(v.number()),
    provider: v.string(),
    notifiedStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (args.shipmentId) {
      const existing = await ctx.db.get(args.shipmentId);
      if (!existing) throw new Error("Shipment not found");
      const notified = args.notifiedStatus && !existing.notifiedStatuses.includes(args.notifiedStatus) ? [...existing.notifiedStatuses, args.notifiedStatus] : existing.notifiedStatuses;
      await ctx.db.patch(args.shipmentId, { status: args.status, events: args.events, estimatedDelivery: args.estimatedDelivery, lastCheckedAt: now, notifiedStatuses: notified, updatedAt: now });
      return args.shipmentId;
    }
    return await ctx.db.insert("ecShipments", {
      storeId: args.storeId,
      orderId: args.orderId,
      carrier: args.carrier,
      trackingNumber: args.trackingNumber,
      trackingUrl: trackingUrlFor(args.carrier, args.trackingNumber),
      status: args.status,
      events: args.events,
      estimatedDelivery: args.estimatedDelivery,
      provider: args.provider,
      lastCheckedAt: now,
      notifiedStatuses: args.notifiedStatus ? [args.notifiedStatus] : [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const markShipmentNotified = internalMutation({
  args: { shipmentId: v.id("ecShipments"), status: v.string() },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.shipmentId);
    if (!s || s.notifiedStatuses.includes(args.status)) return;
    await ctx.db.patch(args.shipmentId, { notifiedStatuses: [...s.notifiedStatuses, args.status] });
  },
});

export const restockInternal = internalMutation({
  args: { orderId: v.id("ecOrders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;
    for (const item of order.items) {
      if (!item.productId) continue;
      const p = await ctx.db.get(item.productId);
      if (p) await ctx.db.patch(p._id, { inventory: p.inventory + item.quantity });
    }
  },
});

export const listActiveProductsInternal = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const active = await ctx.db.query("ecProducts").withIndex("by_store_status", (q) => q.eq("storeId", args.storeId).eq("status", "active")).collect();
    if (active.length) return active;
    return await ctx.db.query("ecProducts").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
  },
});
