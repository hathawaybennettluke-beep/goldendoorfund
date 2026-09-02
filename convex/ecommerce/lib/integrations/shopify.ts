/**
 * Shopify Admin REST adapter. Pushes generated products/collections into a
 * connected Shopify store and normalises inbound order webhooks.
 */
export interface ShopifyCredentials {
  shopDomain: string; // e.g. my-store.myshopify.com
  accessToken: string; // Admin API access token (shpat_...)
  webhookSecret?: string; // App client secret used to sign webhooks
}

const API_VERSION = "2024-10";

function baseUrl(creds: ShopifyCredentials): string {
  const domain = creds.shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${domain}/admin/api/${API_VERSION}`;
}

async function shopifyRequest<T>(
  creds: ShopifyCredentials,
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(`${baseUrl(creds)}${path}`, {
    method,
    headers: {
      "X-Shopify-Access-Token": creds.accessToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Shopify ${method} ${path} failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export async function testConnection(creds: ShopifyCredentials): Promise<{ name: string; domain: string }> {
  const data = await shopifyRequest<{ shop: { name: string; domain: string } }>(creds, "/shop.json", "GET");
  return { name: data.shop.name, domain: data.shop.domain };
}

export interface ShopifyProductInput {
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  handle: string;
  status: "active" | "draft" | "archived";
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventory: number;
  images: Array<{ src: string; alt: string }>;
  seoTitle: string;
  seoDescription: string;
}

export async function pushProduct(
  creds: ShopifyCredentials,
  input: ShopifyProductInput,
  existingId?: string
): Promise<{ id: string; handle: string; adminUrl: string }> {
  const payload = {
    product: {
      title: input.title,
      body_html: input.bodyHtml,
      vendor: input.vendor,
      product_type: input.productType,
      tags: input.tags.join(", "),
      handle: input.handle,
      status: input.status,
      variants: [
        {
          price: input.price.toFixed(2),
          compare_at_price: input.compareAtPrice ? input.compareAtPrice.toFixed(2) : null,
          sku: input.sku ?? "",
          inventory_management: "shopify",
          inventory_quantity: input.inventory,
        },
      ],
      images: input.images.map((i) => ({ src: i.src, alt: i.alt })),
      metafields_global_title_tag: input.seoTitle,
      metafields_global_description_tag: input.seoDescription,
    },
  };
  const data = existingId
    ? await shopifyRequest<{ product: { id: number; handle: string } }>(creds, `/products/${existingId}.json`, "PUT", payload)
    : await shopifyRequest<{ product: { id: number; handle: string } }>(creds, "/products.json", "POST", payload);
  const domain = creds.shopDomain.replace(/^https?:\/\//, "");
  return {
    id: String(data.product.id),
    handle: data.product.handle,
    adminUrl: `https://${domain}/admin/products/${data.product.id}`,
  };
}

export async function pushCollection(
  creds: ShopifyCredentials,
  input: { title: string; handle: string; bodyHtml: string; productExternalIds: string[] },
  existingId?: string
): Promise<{ id: string }> {
  const payload = { custom_collection: { title: input.title, handle: input.handle, body_html: input.bodyHtml, published: true } };
  const data = existingId
    ? await shopifyRequest<{ custom_collection: { id: number } }>(creds, `/custom_collections/${existingId}.json`, "PUT", payload)
    : await shopifyRequest<{ custom_collection: { id: number } }>(creds, "/custom_collections.json", "POST", payload);
  const collectionId = data.custom_collection.id;
  for (const productId of input.productExternalIds) {
    try {
      await shopifyRequest(creds, "/collects.json", "POST", { collect: { product_id: Number(productId), collection_id: collectionId } });
    } catch (error) {
      // Already collected products return 422 – ignore.
      if (!(error instanceof Error && error.message.includes("422"))) throw error;
    }
  }
  return { id: String(collectionId) };
}

export async function registerOrderWebhook(creds: ShopifyCredentials, address: string): Promise<{ id: string }> {
  const existing = await shopifyRequest<{ webhooks: Array<{ id: number; address: string; topic: string }> }>(creds, "/webhooks.json?topic=orders/create", "GET");
  const found = existing.webhooks.find((w) => w.address === address);
  if (found) return { id: String(found.id) };
  const data = await shopifyRequest<{ webhook: { id: number } }>(creds, "/webhooks.json", "POST", {
    webhook: { topic: "orders/create", address, format: "json" },
  });
  return { id: String(data.webhook.id) };
}

export async function cancelOrder(creds: ShopifyCredentials, externalOrderId: string, reason: string): Promise<void> {
  await shopifyRequest(creds, `/orders/${externalOrderId}/cancel.json`, "POST", { reason, email: true });
}

/** Verify the X-Shopify-Hmac-Sha256 header using Web Crypto. */
export async function verifyWebhookHmac(secret: string, rawBody: string, headerValue: string | null): Promise<boolean> {
  if (!headerValue) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  if (expected.length !== headerValue.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ headerValue.charCodeAt(i);
  return diff === 0;
}

export interface NormalizedOrder {
  externalId: string;
  orderNumber: string;
  customer: { name: string; email: string; phone?: string };
  shippingAddress: { line1: string; line2?: string; city: string; state?: string; postalCode: string; country: string };
  items: Array<{ title: string; sku?: string; quantity: number; unitPrice: number; variant?: string }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  paid: boolean;
  note?: string;
}

/** Convert a Shopify orders/create payload into the platform's order shape. */
export function normalizeShopifyOrder(payload: Record<string, unknown>): NormalizedOrder {
  const p = payload as {
    id: number; name: string; email?: string; contact_email?: string; phone?: string; currency: string; note?: string;
    financial_status?: string; subtotal_price?: string; total_tax?: string; total_price?: string;
    total_shipping_price_set?: { shop_money?: { amount?: string } };
    customer?: { first_name?: string; last_name?: string; email?: string; phone?: string };
    shipping_address?: { name?: string; address1?: string; address2?: string; city?: string; province?: string; zip?: string; country_code?: string; country?: string; phone?: string };
    line_items?: Array<{ title: string; sku?: string; quantity: number; price: string; variant_title?: string }>;
  };
  const addr = p.shipping_address ?? {};
  const customerName = addr.name || `${p.customer?.first_name ?? ""} ${p.customer?.last_name ?? ""}`.trim() || "Customer";
  return {
    externalId: `shopify:${p.id}`,
    orderNumber: p.name,
    customer: {
      name: customerName,
      email: p.email || p.contact_email || p.customer?.email || "unknown@example.com",
      phone: p.phone || p.customer?.phone || addr.phone || undefined,
    },
    shippingAddress: {
      line1: addr.address1 ?? "",
      line2: addr.address2 || undefined,
      city: addr.city ?? "",
      state: addr.province || undefined,
      postalCode: addr.zip ?? "",
      country: addr.country_code || addr.country || "",
    },
    items: (p.line_items ?? []).map((li) => ({
      title: li.title,
      sku: li.sku || undefined,
      quantity: li.quantity,
      unitPrice: Number(li.price),
      variant: li.variant_title || undefined,
    })),
    subtotal: Number(p.subtotal_price ?? 0),
    shipping: Number(p.total_shipping_price_set?.shop_money?.amount ?? 0),
    tax: Number(p.total_tax ?? 0),
    total: Number(p.total_price ?? 0),
    currency: p.currency ?? "USD",
    paid: p.financial_status === "paid",
    note: p.note || undefined,
  };
}
