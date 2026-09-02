import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizeShopifyOrder, verifyWebhookHmac } from "./ecommerce/lib/integrations/shopify";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/api/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature: string = request.headers.get("stripe-signature") as string;
    const result = await ctx.runAction(internal.payments.fulfill, {
      payload: await request.text(),
      signature,
    });
    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

// ---------------------------------------------------------------------------
// Ecommerce automation webhooks
// ---------------------------------------------------------------------------

/** Shopify `orders/create` webhook. Register: https://<deployment>.convex.site/api/ecommerce/webhooks/shopify/orders?store=<storeId> */
http.route({
  path: "/api/ecommerce/webhooks/shopify/orders",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const storeId = new URL(request.url).searchParams.get("store") as Id<"ecStores"> | null;
    if (!storeId) return new Response("Missing store", { status: 400 });
    const connector = await ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId, provider: "shopify" });
    if (!connector) return new Response("Shopify not connected", { status: 404 });
    const rawBody = await request.text();
    const secret = (connector.credentials as { webhookSecret?: string }).webhookSecret;
    if (secret) {
      const ok = await verifyWebhookHmac(secret, rawBody, request.headers.get("X-Shopify-Hmac-Sha256"));
      if (!ok) return new Response("Invalid signature", { status: 401 });
    }
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const order = normalizeShopifyOrder(payload);
    await ctx.runMutation(internal.ecommerce.orders.ingestExternal, {
      storeId,
      source: "shopify",
      externalId: order.externalId,
      externalOrderNumber: order.orderNumber,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      items: order.items,
      shipping: order.shipping,
      tax: order.tax,
      currency: order.currency,
      paid: order.paid,
      customerNote: order.note,
    });
    return new Response(null, { status: 200 });
  }),
});

/**
 * Generic inbound order webhook for any storefront / marketplace / automation tool.
 * POST JSON: { externalId, orderNumber?, customer:{name,email,phone?}, shippingAddress:{line1,line2?,city,state?,postalCode,country},
 *              items:[{title,sku?,quantity,unitPrice,variant?}], shipping?, tax?, currency?, paid, note? }
 * Auth: ?store=<storeId>&token=<inbound webhook token from Settings>
 */
http.route({
  path: "/api/ecommerce/webhooks/orders",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storeId = url.searchParams.get("store") as Id<"ecStores"> | null;
    const token = url.searchParams.get("token") ?? request.headers.get("x-webhook-token");
    if (!storeId || !token) return new Response("Missing store or token", { status: 400 });
    const connector = await ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId, provider: "inbound_webhook" });
    if (!connector || (connector.credentials as { token?: string }).token !== token) return new Response("Unauthorized", { status: 401 });
    let body: {
      externalId?: string; orderNumber?: string; customer: { name: string; email: string; phone?: string };
      shippingAddress: { line1: string; line2?: string; city: string; state?: string; postalCode: string; country: string };
      items: Array<{ title: string; sku?: string; quantity: number; unitPrice: number; variant?: string }>;
      shipping?: number; tax?: number; currency?: string; paid?: boolean; note?: string; paymentReference?: string;
    };
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    if (!body.customer?.email || !Array.isArray(body.items) || body.items.length === 0 || !body.shippingAddress?.line1) {
      return new Response("customer, shippingAddress and items are required", { status: 422 });
    }
    const orderId = await ctx.runMutation(internal.ecommerce.orders.ingestExternal, {
      storeId,
      source: "webhook",
      externalId: body.externalId ? `webhook:${body.externalId}` : undefined,
      externalOrderNumber: body.orderNumber,
      customer: { name: body.customer.name ?? "Customer", email: body.customer.email, phone: body.customer.phone },
      shippingAddress: { line1: body.shippingAddress.line1, line2: body.shippingAddress.line2, city: body.shippingAddress.city ?? "", state: body.shippingAddress.state, postalCode: body.shippingAddress.postalCode ?? "", country: body.shippingAddress.country ?? "" },
      items: body.items.map((i) => ({ title: i.title, sku: i.sku, quantity: Number(i.quantity) || 1, unitPrice: Number(i.unitPrice) || 0, variant: i.variant })),
      shipping: body.shipping,
      tax: body.tax,
      currency: body.currency,
      paid: Boolean(body.paid),
      paymentReference: body.paymentReference,
      customerNote: body.note,
    });
    return new Response(JSON.stringify({ ok: true, orderId }), { status: 200, headers: { "Content-Type": "application/json" } });
  }),
});

/** Stripe Checkout completion for storefront orders. */
http.route({
  path: "/api/ecommerce/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature") ?? "";
    const result = await ctx.runAction(internal.ecommerce.orderActions.handleStripeWebhook, { payload: await request.text(), signature });
    return new Response(result.ok ? null : result.message ?? "Webhook error", { status: result.ok ? 200 : 400 });
  }),
});

export default http;
