"use node";
/**
 * Pillar 4 – Manage orders: monitor incoming orders, send them to
 * fulfilment, track shipments, notify customers and handle cancellations.
 */
import { v } from "convex/values";
import Stripe from "stripe";
import { action, internalAction } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { cancelFulfillment, submitOrder, type FulfillmentCredentials } from "./lib/integrations/fulfillment";
import { fakeTrackingNumber, fetchTracking, simulateTracking, trackingUrlFor, type TrackingCredentials } from "./lib/integrations/tracking";
import { deliverStep, orderVars, triggerFlows } from "./lib/notify";
import { seededRandom } from "./lib/text";

const SIMULATED_SHIP_AFTER_MS = 20 * 60 * 1000;

type OrderWithShipments = Doc<"ecOrders"> & { shipments: Doc<"ecShipments">[] };

async function fulfillmentCreds(ctx: ActionCtx, storeId: Id<"ecStores">): Promise<FulfillmentCredentials | null> {
  const conn = await ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId, provider: "fulfillment" });
  if (!conn) return null;
  const c = conn.credentials as Partial<FulfillmentCredentials>;
  if (c.provider === "webhook" && c.endpointUrl) return c as FulfillmentCredentials;
  if (c.provider === "printful" && c.apiKey) return c as FulfillmentCredentials;
  return null;
}

async function trackingCreds(ctx: ActionCtx, storeId: Id<"ecStores">): Promise<TrackingCredentials | null> {
  const conn = await ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId, provider: "tracking" });
  const c = conn?.credentials as Partial<TrackingCredentials> | undefined;
  return c?.apiKey ? { provider: "aftership", apiKey: c.apiKey } : null;
}

function hasEvent(order: Doc<"ecOrders">, event: string): boolean {
  return order.timeline.some((t) => t.event === event);
}

async function confirmOrder(ctx: ActionCtx, store: Doc<"ecStores">, order: Doc<"ecOrders">, actor: "user" | "automation"): Promise<boolean> {
  if (hasEvent(order, "Confirmation sent")) return false;
  const res = await triggerFlows(ctx, store, "order_confirmation", order);
  await ctx.runMutation(internal.ecommerce.orders.patchOrder, { orderId: order._id, timelineEvent: { event: "Confirmation sent", detail: res.simulated ? "Simulated (no email provider connected)" : `${res.delivered} message(s)`, actor } });
  return true;
}

async function fulfil(ctx: ActionCtx, store: Doc<"ecStores">, order: Doc<"ecOrders">, actor: "user" | "automation"): Promise<{ simulated: boolean; externalId: string }> {
  if (order.paymentStatus !== "paid") throw new Error("Order is not paid yet.");
  if (!["unfulfilled", "on_hold"].includes(order.fulfillmentStatus)) throw new Error(`Order is already ${order.fulfillmentStatus.replace(/_/g, " ")}.`);
  const creds = await fulfillmentCreds(ctx, store._id);
  const result = await submitOrder(creds, {
    orderId: order._id,
    orderNumber: order.orderNumber,
    customer: order.customer,
    shippingAddress: order.shippingAddress,
    items: order.items.map((i) => ({ title: i.title, sku: i.sku, quantity: i.quantity, unitPrice: i.unitPrice, variant: i.variant })),
    total: order.total,
    currency: order.currency,
    note: order.customerNote,
  });
  await ctx.runMutation(internal.ecommerce.orders.patchOrder, {
    orderId: order._id,
    fulfillmentStatus: result.status,
    fulfillmentProvider: result.provider,
    fulfillmentExternalId: result.externalId,
    timelineEvent: { event: "Sent to fulfilment", detail: result.simulated ? "Simulated fulfilment partner (connect a 3PL in Settings)" : `${result.provider} · ref ${result.externalId}`, actor },
  });
  await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor, area: "orders", action: `Order ${order.orderNumber} sent to fulfilment`, detail: result.simulated ? "Simulated partner" : `${result.provider} ref ${result.externalId}`, level: "success", refType: "order", refId: order._id });
  return { simulated: result.simulated, externalId: result.externalId };
}

async function createShipment(ctx: ActionCtx, store: Doc<"ecStores">, order: Doc<"ecOrders">, carrier: string, trackingNumber: string, provider: string, actor: "user" | "automation" | "system"): Promise<Id<"ecShipments">> {
  const now = Date.now();
  const shipmentId = await ctx.runMutation(internal.ecommerce.orders.upsertShipment, {
    storeId: store._id,
    orderId: order._id,
    carrier,
    trackingNumber,
    status: "label_created",
    events: [{ at: now, status: "label_created", description: "Shipping label created", location: "Fulfilment centre" }],
    estimatedDelivery: now + 62 * 3_600_000,
    provider,
  });
  await ctx.runMutation(internal.ecommerce.orders.patchOrder, { orderId: order._id, fulfillmentStatus: "shipped", timelineEvent: { event: "Shipped", detail: `${carrier} ${trackingNumber}`, actor } });
  return shipmentId;
}

async function notifyShipmentStatus(ctx: ActionCtx, store: Doc<"ecStores">, shipment: Doc<"ecShipments">, order: Doc<"ecOrders">, status: string, actor: "user" | "automation"): Promise<void> {
  if (shipment.notifiedStatuses.includes(status)) return;
  const trigger = status === "delivered" ? "delivered" : "shipping_update";
  const vars = { carrier: shipment.carrier, trackingNumber: shipment.trackingNumber, trackingUrl: shipment.trackingUrl ?? trackingUrlFor(shipment.carrier, shipment.trackingNumber), estimatedDelivery: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toDateString() : undefined };
  const res = await triggerFlows(ctx, store, trigger, order, vars);
  await ctx.runMutation(internal.ecommerce.orders.markShipmentNotified, { shipmentId: shipment._id, status });
  await ctx.runMutation(internal.ecommerce.orders.patchOrder, { orderId: order._id, timelineEvent: { event: status === "delivered" ? "Delivery notification sent" : "Tracking sent to customer", detail: `${shipment.carrier} ${shipment.trackingNumber}${res.simulated ? " (simulated send)" : ""}`, actor } });
}

async function refreshShipment(ctx: ActionCtx, store: Doc<"ecStores">, shipment: Doc<"ecShipments">, actor: "user" | "automation"): Promise<{ changed: boolean; status: string }> {
  const creds = await trackingCreds(ctx, store._id);
  const now = Date.now();
  let snapshot;
  if (shipment.provider === "simulated" || (!creds && shipment.provider !== "aftership")) {
    snapshot = simulateTracking(shipment.createdAt, now, shipment.events);
  } else if (creds) {
    try {
      snapshot = await fetchTracking(creds, shipment.carrier, shipment.trackingNumber);
    } catch (error) {
      console.error("Tracking fetch failed", shipment._id, error);
      return { changed: false, status: shipment.status };
    }
  } else {
    return { changed: false, status: shipment.status };
  }
  const changed = snapshot.status !== shipment.status || snapshot.events.length !== shipment.events.length;
  await ctx.runMutation(internal.ecommerce.orders.upsertShipment, {
    shipmentId: shipment._id,
    storeId: store._id,
    orderId: shipment.orderId,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    status: snapshot.status,
    events: snapshot.events,
    estimatedDelivery: snapshot.estimatedDelivery,
    provider: shipment.provider,
  });
  const order = await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: shipment.orderId });
  if (order && snapshot.status !== shipment.status) {
    if (snapshot.status === "delivered") {
      await ctx.runMutation(internal.ecommerce.orders.patchOrder, { orderId: order._id, fulfillmentStatus: "delivered", timelineEvent: { event: "Delivered", detail: snapshot.events[snapshot.events.length - 1]?.description, actor: "system" } });
    } else if (snapshot.status === "exception") {
      await ctx.runMutation(internal.ecommerce.orders.patchOrder, { orderId: order._id, timelineEvent: { event: "Delivery exception", detail: snapshot.events[snapshot.events.length - 1]?.description, actor: "system" } });
      await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "system", area: "orders", action: `Delivery exception on ${order.orderNumber}`, detail: `${shipment.carrier} ${shipment.trackingNumber}`, level: "warning", refType: "order", refId: order._id });
    }
  }
  if (order && store.automation.autoNotifyTracking) {
    const fresh = (await ctx.runQuery(internal.ecommerce.orders.getShipmentInternal, { shipmentId: shipment._id }))!;
    if (["in_transit", "label_created", "out_for_delivery"].includes(snapshot.status)) await notifyShipmentStatus(ctx, store, fresh, order, "shipped", actor);
    if (snapshot.status === "delivered") await notifyShipmentStatus(ctx, store, fresh, order, "delivered", actor);
  }
  return { changed, status: snapshot.status };
}

async function processStore(ctx: ActionCtx, store: Doc<"ecStores">, actor: "user" | "automation"): Promise<{ confirmed: number; fulfilled: number; shipped: number; trackingUpdates: number }> {
  const summary = { confirmed: 0, fulfilled: 0, shipped: 0, trackingUpdates: 0 };
  // 1. New paid orders → confirmation + fulfilment
  const pending = await ctx.runQuery(internal.ecommerce.orders.listForAutomation, { storeId: store._id });
  for (const order of pending) {
    if (await confirmOrder(ctx, store, order, actor)) summary.confirmed += 1;
    if (store.automation.autoFulfill || actor === "user") {
      try {
        await fulfil(ctx, store, order, actor);
        summary.fulfilled += 1;
      } catch (error) {
        console.error("Fulfilment failed", order._id, error);
        await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor, area: "orders", action: `Fulfilment failed for ${order.orderNumber}`, detail: error instanceof Error ? error.message : String(error), level: "error", refType: "order", refId: order._id });
      }
    }
  }
  // 2. Simulated fulfilment partner ships after a short delay
  const inFulfilment: Doc<"ecOrders">[] = await ctx.runQuery(internal.ecommerce.orders.listSentToFulfillment, { storeId: store._id });
  for (const order of inFulfilment) {
    if (order.fulfillmentProvider !== "simulated") continue;
    const sentAt = order.timeline.find((t: { event: string }) => t.event === "Sent to fulfilment")?.at ?? order.updatedAt;
    if (Date.now() - sentAt < SIMULATED_SHIP_AFTER_MS) continue;
    const { carrier, trackingNumber } = fakeTrackingNumber(order._id);
    const shipmentId = await createShipment(ctx, store, order, carrier, trackingNumber, "simulated", "system");
    summary.shipped += 1;
    if (store.automation.autoNotifyTracking) {
      const shipment = (await ctx.runQuery(internal.ecommerce.orders.getShipmentInternal, { shipmentId }))!;
      const fresh = (await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: order._id }))!;
      await notifyShipmentStatus(ctx, store, shipment, fresh, "shipped", actor);
    }
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "system", area: "orders", action: `Order ${order.orderNumber} shipped`, detail: `${carrier} ${trackingNumber} (simulated partner)`, level: "success", refType: "order", refId: order._id });
  }
  // 3. Tracking refresh
  const shipments = await ctx.runQuery(internal.ecommerce.orders.listActiveShipments, { storeId: store._id });
  for (const s of shipments) {
    const r = await refreshShipment(ctx, store, s, actor);
    if (r.changed) summary.trackingUpdates += 1;
  }
  return summary;
}

export const runAutomation = action({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args): Promise<{ confirmed: number; fulfilled: number; shipped: number; trackingUpdates: number }> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const summary = await processStore(ctx, store, "user");
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "orders", action: "Order automation run", detail: `${summary.confirmed} confirmed · ${summary.fulfilled} sent to fulfilment · ${summary.shipped} shipped · ${summary.trackingUpdates} tracking update(s)`, level: "info" });
    return summary;
  },
});

export const processAllStores = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const stores = await ctx.runQuery(internal.ecommerce.stores.listAllInternal, {});
    for (const store of stores) {
      try {
        await processStore(ctx, store, "automation");
      } catch (error) {
        console.error("Order automation failed", store._id, error);
      }
    }
  },
});

export const refreshAllTracking = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const stores = await ctx.runQuery(internal.ecommerce.stores.listAllInternal, {});
    for (const store of stores) {
      const shipments = await ctx.runQuery(internal.ecommerce.orders.listActiveShipments, { storeId: store._id });
      for (const s of shipments) await refreshShipment(ctx, store, s, "automation").catch(console.error);
    }
  },
});

export const sendToFulfillment = action({
  args: { orderId: v.id("ecOrders") },
  handler: async (ctx, args): Promise<{ simulated: boolean; externalId: string }> => {
    const order = await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: args.orderId });
    if (!order) throw new Error("Order not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: order.storeId });
    await confirmOrder(ctx, store, order, "user");
    return await fulfil(ctx, store, order, "user");
  },
});

export const refreshTracking = action({
  args: { shipmentId: v.id("ecShipments") },
  handler: async (ctx, args): Promise<{ changed: boolean; status: string }> => {
    const shipment = await ctx.runQuery(internal.ecommerce.orders.getShipmentInternal, { shipmentId: args.shipmentId });
    if (!shipment) throw new Error("Shipment not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: shipment.storeId });
    return await refreshShipment(ctx, store, shipment, "user");
  },
});

export const resendTracking = action({
  args: { orderId: v.id("ecOrders") },
  handler: async (ctx, args): Promise<{ delivered: number; simulated: boolean }> => {
    const order = await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: args.orderId });
    if (!order) throw new Error("Order not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: order.storeId });
    const shipment = order.shipments[order.shipments.length - 1];
    if (!shipment) throw new Error("No shipment on this order yet.");
    const res = await triggerFlows(ctx, store, "shipping_update", order, { carrier: shipment.carrier, trackingNumber: shipment.trackingNumber, trackingUrl: shipment.trackingUrl ?? trackingUrlFor(shipment.carrier, shipment.trackingNumber) });
    await ctx.runMutation(internal.ecommerce.orders.patchOrder, { orderId: order._id, timelineEvent: { event: "Tracking re-sent to customer", detail: res.simulated ? "Simulated send" : `${res.delivered} message(s)`, actor: "user" } });
    return res;
  },
});

export const cancelOrder = action({
  args: { orderId: v.id("ecOrders"), reason: v.string(), refund: v.boolean() },
  handler: async (ctx, args): Promise<{ refunded: boolean; fulfillmentMessage: string }> => {
    const order = await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: args.orderId });
    if (!order) throw new Error("Order not found");
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: order.storeId });
    if (["cancelled", "delivered", "returned"].includes(order.fulfillmentStatus)) throw new Error(`Order is ${order.fulfillmentStatus} and cannot be cancelled.`);
    if (order.fulfillmentStatus === "shipped") throw new Error("Order already shipped – process it as a return instead.");
    let fulfillmentMessage = "Not yet sent to fulfilment";
    if (["sent_to_fulfillment", "in_production"].includes(order.fulfillmentStatus)) {
      const creds = order.fulfillmentProvider === "simulated" ? null : await fulfillmentCreds(ctx, store._id);
      const res = await cancelFulfillment(creds, order.fulfillmentExternalId ?? "", args.reason);
      fulfillmentMessage = res.message;
      if (!res.ok) throw new Error(res.message);
    }
    let refunded = false;
    if (args.refund && order.paymentStatus === "paid") {
      if (order.paymentReference?.startsWith("pi_") && process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.refunds.create({ payment_intent: order.paymentReference });
        refunded = true;
      } else if (order.paymentReference?.startsWith("cs_") && process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(order.paymentReference);
        if (typeof session.payment_intent === "string") {
          await stripe.refunds.create({ payment_intent: session.payment_intent });
          refunded = true;
        }
      } else {
        refunded = true; // recorded manually – no processor reference
      }
    }
    await ctx.runMutation(internal.ecommerce.orders.patchOrder, {
      orderId: order._id,
      fulfillmentStatus: "cancelled",
      paymentStatus: refunded ? "refunded" : order.paymentStatus,
      cancelReason: args.reason,
      cancelledAt: Date.now(),
      timelineEvent: { event: "Cancelled", detail: `${args.reason} · ${fulfillmentMessage}${refunded ? " · refund issued" : ""}`, actor: "user" },
    });
    await ctx.runMutation(internal.ecommerce.orders.restockInternal, { orderId: order._id });
    if (store.automation.autoHandleCancellations) {
      const fresh = (await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: order._id }))!;
      await triggerFlows(ctx, store, "cancellation", fresh, { reason: args.reason });
    }
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "orders", action: `Order ${order.orderNumber} cancelled`, detail: `${args.reason}${refunded ? " · refunded" : ""} · inventory restocked · customer notified`, level: "warning", refType: "order", refId: order._id });
    return { refunded, fulfillmentMessage };
  },
});

export const deliverScheduledStep = internalAction({
  args: { storeId: v.id("ecStores"), flowId: v.id("ecMessagingFlows"), stepIndex: v.number(), orderId: v.optional(v.id("ecOrders")) },
  handler: async (ctx, args): Promise<void> => {
    const [store, flow] = await Promise.all([
      ctx.runQuery(internal.ecommerce.stores.getInternal, { storeId: args.storeId }),
      ctx.runQuery(internal.ecommerce.marketing.getFlowInternal, { flowId: args.flowId }),
    ]);
    if (!store || !flow || flow.status !== "active") return;
    const order = args.orderId ? await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: args.orderId }) : null;
    if (!order) return;
    if (order.fulfillmentStatus === "cancelled" && flow.trigger !== "cancellation") return;
    await deliverStep(ctx, store, flow, args.stepIndex, order.customer, orderVars(store, order), order._id);
  },
});

/** Demo helper: create a realistic paid order so the automation loop can be observed. */
export const simulateIncomingOrder = action({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args): Promise<Id<"ecOrders">> => {
    const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const products = await ctx.runQuery(internal.ecommerce.orders.listActiveProductsInternal, { storeId: args.storeId });
    if (products.length === 0) throw new Error("Add at least one product before simulating orders.");
    const rnd = seededRandom(`${args.storeId}-${Date.now()}`);
    const names = ["Ava Thompson", "Liam Carter", "Sophia Nguyen", "Noah Patel", "Mia Rodriguez", "Ethan Kim", "Isabella Rossi", "Lucas Meyer"];
    const cities = [["Austin", "TX", "78701", "US"], ["Denver", "CO", "80202", "US"], ["Portland", "OR", "97205", "US"], ["Toronto", "ON", "M5V 2T6", "CA"], ["Manchester", "", "M1 1AE", "GB"], ["Brisbane", "QLD", "4000", "AU"]];
    const name = names[Math.floor(rnd() * names.length)];
    const [city, state, postalCode, country] = cities[Math.floor(rnd() * cities.length)];
    const lineCount = 1 + (rnd() < 0.3 ? 1 : 0);
    const chosen = [...products].sort(() => rnd() - 0.5).slice(0, lineCount);
    const orderId = await ctx.runMutation(internal.ecommerce.orders.ingestExternal, {
      storeId: args.storeId,
      source: "simulated",
      customer: { name, email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`, phone: rnd() < 0.6 ? `+1555${Math.floor(1000000 + rnd() * 8999999)}` : undefined },
      shippingAddress: { line1: `${Math.floor(10 + rnd() * 990)} ${["Maple", "Oak", "Cedar", "Harbor", "Sunset"][Math.floor(rnd() * 5)]} Street`, city, state: state || undefined, postalCode, country },
      items: chosen.map((p) => ({ productId: p._id, title: p.title, sku: p.sku, quantity: rnd() < 0.2 ? 2 : 1, unitPrice: p.price, unitCost: p.cost, imageUrl: p.images[0]?.url })),
      shipping: rnd() < 0.5 ? 0 : 4.99,
      tax: 0,
      currency: store.currency,
      paid: true,
      paymentReference: `sim_${Math.floor(rnd() * 1e9).toString(36)}`,
    });
    return orderId;
  },
});

// ---------------------------------------------------------------- Stripe -----

export const createCheckoutSession = action({
  args: { slug: v.string(), orderId: v.id("ecOrders"), successUrl: v.string(), cancelUrl: v.string() },
  handler: async (ctx, args): Promise<{ url: string | null; testMode: boolean }> => {
    const order: OrderWithShipments | null = await ctx.runQuery(internal.ecommerce.orders.getInternal, { orderId: args.orderId });
    if (!order) throw new Error("Order not found");
    if (!process.env.STRIPE_SECRET_KEY) return { url: null, testMode: true };
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer.email,
      line_items: order.items.map((i: Doc<"ecOrders">["items"][number]) => ({ quantity: i.quantity, price_data: { currency: order.currency.toLowerCase(), unit_amount: Math.round(i.unitPrice * 100), product_data: { name: i.title, images: i.imageUrl && !i.imageUrl.endsWith(".svg") ? [i.imageUrl] : undefined } } })),
      shipping_options: order.shipping > 0 ? [{ shipping_rate_data: { type: "fixed_amount", display_name: "Standard shipping", fixed_amount: { amount: Math.round(order.shipping * 100), currency: order.currency.toLowerCase() } } }] : undefined,
      metadata: { orderId: order._id, storeSlug: args.slug },
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
    });
    await ctx.runMutation(internal.ecommerce.orders.patchOrder, { orderId: order._id, paymentReference: session.id, timelineEvent: { event: "Checkout started", detail: session.id, actor: "customer" } });
    return { url: session.url, testMode: false };
  },
});

export const handleStripeWebhook = internalAction({
  args: { payload: v.string(), signature: v.string() },
  handler: async (ctx, args): Promise<{ ok: boolean; message?: string }> => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!process.env.STRIPE_SECRET_KEY || !secret) return { ok: false, message: "Stripe is not configured" };
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(args.payload, args.signature, secret);
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Invalid signature" };
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId as Id<"ecOrders"> | undefined;
      if (orderId && session.payment_status === "paid") {
        await ctx.runMutation(internal.ecommerce.storefront.markPaidFromCheckout, { orderId, reference: typeof session.payment_intent === "string" ? session.payment_intent : session.id });
      }
    }
    return { ok: true };
  },
});
