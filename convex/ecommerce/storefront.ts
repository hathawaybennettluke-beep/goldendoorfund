/**
 * Public, unauthenticated API for the generated storefront pages.
 */
import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { insertOrder, addressValidator, customerValidator } from "./orders";

function publicStore(store: Doc<"ecStores">) {
  return { _id: store._id, name: store.name, slug: store.slug, niche: store.niche, description: store.description, logoUrl: store.logoUrl, primaryColor: store.primaryColor, currency: store.currency, seo: store.seo, status: store.status };
}

export const getStore = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const store = await ctx.db.query("ecStores").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    if (!store) return null;
    const collections = await ctx.db.query("ecCollections").withIndex("by_store", (q) => q.eq("storeId", store._id)).collect();
    return { ...publicStore(store), collections: collections.map((c) => ({ _id: c._id, title: c.title, handle: c.handle, description: c.description, count: c.productIds.length, imageUrl: c.imageUrl })) };
  },
});

export const listProducts = query({
  args: { slug: v.string(), collectionHandle: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const store = await ctx.db.query("ecStores").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    if (!store) return [];
    let products = await ctx.db.query("ecProducts").withIndex("by_store_status", (q) => q.eq("storeId", store._id).eq("status", "active")).collect();
    if (args.collectionHandle) {
      const collection = await ctx.db.query("ecCollections").withIndex("by_store_handle", (q) => q.eq("storeId", store._id).eq("handle", args.collectionHandle!)).first();
      const ids = new Set((collection?.productIds ?? []).map(String));
      products = products.filter((p) => ids.has(String(p._id)));
    }
    return products.map((p) => ({ _id: p._id, title: p.title, handle: p.handle, shortDescription: p.shortDescription, price: p.price, compareAtPrice: p.compareAtPrice, image: p.images[0], category: p.category, tags: p.tags, inventory: p.inventory }));
  },
});

export const getProduct = query({
  args: { slug: v.string(), handle: v.string() },
  handler: async (ctx, args) => {
    const store = await ctx.db.query("ecStores").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    if (!store) return null;
    const product = await ctx.db.query("ecProducts").withIndex("by_store_handle", (q) => q.eq("storeId", store._id).eq("handle", args.handle)).first();
    if (!product || product.status !== "active") return null;
    const related = (await ctx.db.query("ecProducts").withIndex("by_store_status", (q) => q.eq("storeId", store._id).eq("status", "active")).collect())
      .filter((p) => p._id !== product._id)
      .slice(0, 4)
      .map((p) => ({ _id: p._id, title: p.title, handle: p.handle, price: p.price, image: p.images[0] }));
    return { store: publicStore(store), product, related };
  },
});

export const placeOrder = mutation({
  args: {
    slug: v.string(),
    items: v.array(v.object({ productId: v.id("ecProducts"), quantity: v.number(), variant: v.optional(v.string()) })),
    customer: customerValidator,
    shippingAddress: addressValidator,
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.query("ecStores").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    if (!store) throw new Error("Store not found");
    if (args.items.length === 0) throw new Error("Cart is empty");
    const items = [];
    for (const line of args.items) {
      const p = await ctx.db.get(line.productId);
      if (!p || p.storeId !== store._id || p.status !== "active") throw new Error("A product in your cart is no longer available");
      if (line.quantity < 1 || line.quantity > 20) throw new Error("Invalid quantity");
      items.push({ productId: p._id, title: p.title, sku: p.sku, quantity: line.quantity, unitPrice: p.price, unitCost: p.cost, variant: line.variant, imageUrl: p.images[0]?.url });
    }
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const orderId = await insertOrder(ctx, store, {
      storeId: store._id,
      source: "storefront",
      customer: args.customer,
      shippingAddress: args.shippingAddress,
      items,
      shipping,
      paid: false,
      customerNote: args.note,
      actor: "customer",
    });
    const order = await ctx.db.get(orderId);
    return { orderId, orderNumber: order!.orderNumber, total: order!.total, currency: order!.currency };
  },
});

export const getOrderStatus = query({
  args: { slug: v.string(), orderNumber: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const store = await ctx.db.query("ecStores").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    if (!store) return null;
    const order = await ctx.db.query("ecOrders").withIndex("by_store_number", (q) => q.eq("storeId", store._id).eq("orderNumber", args.orderNumber)).first();
    if (!order || order.customer.email.toLowerCase() !== args.email.toLowerCase()) return null;
    const shipments = await ctx.db.query("ecShipments").withIndex("by_order", (q) => q.eq("orderId", order._id)).collect();
    return {
      orderNumber: order.orderNumber,
      total: order.total,
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, unitPrice: i.unitPrice, imageUrl: i.imageUrl })),
      createdAt: order.createdAt,
      shipments: shipments.map((s) => ({ carrier: s.carrier, trackingNumber: s.trackingNumber, trackingUrl: s.trackingUrl, status: s.status, estimatedDelivery: s.estimatedDelivery, events: s.events })),
      storeName: store.name,
    };
  },
});

/** Called by the Stripe webhook once a Checkout Session completes. */
export const markPaidFromCheckout = internalMutation({
  args: { orderId: v.id("ecOrders"), reference: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.paymentStatus === "paid") return;
    await ctx.db.patch(args.orderId, { paymentStatus: "paid", paymentReference: args.reference, timeline: [...order.timeline, { at: Date.now(), event: "Payment confirmed by Stripe", detail: args.reference, actor: "system" }], updatedAt: Date.now() });
  },
});
