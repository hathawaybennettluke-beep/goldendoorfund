/**
 * Fulfilment adapters. Supports a generic signed webhook (works with any 3PL
 * or automation tool such as Zapier/Make), Printful, and a built-in
 * simulation used when nothing is connected.
 */
export interface FulfillmentCredentials {
  provider: "webhook" | "printful";
  endpointUrl?: string; // webhook
  secret?: string; // webhook signing secret
  apiKey?: string; // printful
}

export interface FulfillmentOrderPayload {
  orderId: string;
  orderNumber: string;
  customer: { name: string; email: string; phone?: string };
  shippingAddress: { line1: string; line2?: string; city: string; state?: string; postalCode: string; country: string };
  items: Array<{ title: string; sku?: string; quantity: number; unitPrice: number; variant?: string }>;
  total: number;
  currency: string;
  note?: string;
}

export interface FulfillmentResult {
  externalId: string;
  status: "sent_to_fulfillment" | "in_production";
  simulated: boolean;
  provider: string;
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function submitOrder(creds: FulfillmentCredentials | null, order: FulfillmentOrderPayload): Promise<FulfillmentResult> {
  if (!creds) {
    return { externalId: `SIM-${order.orderNumber.replace("#", "")}`, status: "sent_to_fulfillment", simulated: true, provider: "simulated" };
  }
  if (creds.provider === "webhook") {
    if (!creds.endpointUrl) throw new Error("Fulfilment webhook URL missing");
    const body = JSON.stringify({ event: "order.created", order });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (creds.secret) headers["X-Signature-SHA256"] = await hmacHex(creds.secret, body);
    const res = await fetch(creds.endpointUrl, { method: "POST", headers, body });
    if (!res.ok) throw new Error(`Fulfilment webhook failed (${res.status}): ${await res.text()}`);
    let externalId = `WH-${order.orderNumber.replace("#", "")}`;
    try {
      const json = (await res.json()) as { id?: string; externalId?: string };
      externalId = json.externalId ?? json.id ?? externalId;
    } catch {
      /* non JSON response is fine */
    }
    return { externalId, status: "sent_to_fulfillment", simulated: false, provider: "webhook" };
  }
  // Printful
  const res = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${creds.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      external_id: order.orderId,
      recipient: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address1: order.shippingAddress.line1,
        address2: order.shippingAddress.line2,
        city: order.shippingAddress.city,
        state_code: order.shippingAddress.state,
        zip: order.shippingAddress.postalCode,
        country_code: order.shippingAddress.country,
      },
      items: order.items.map((i) => ({ external_variant_id: i.sku, quantity: i.quantity, name: i.title, retail_price: i.unitPrice.toFixed(2) })),
    }),
  });
  if (!res.ok) throw new Error(`Printful error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { result: { id: number } };
  return { externalId: String(json.result.id), status: "in_production", simulated: false, provider: "printful" };
}

export async function cancelFulfillment(creds: FulfillmentCredentials | null, externalId: string, reason: string): Promise<{ ok: boolean; simulated: boolean; message: string }> {
  if (!creds) return { ok: true, simulated: true, message: "Simulated fulfilment cancelled" };
  if (creds.provider === "webhook") {
    if (!creds.endpointUrl) throw new Error("Fulfilment webhook URL missing");
    const body = JSON.stringify({ event: "order.cancelled", externalId, reason });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (creds.secret) headers["X-Signature-SHA256"] = await hmacHex(creds.secret, body);
    const res = await fetch(creds.endpointUrl, { method: "POST", headers, body });
    return { ok: res.ok, simulated: false, message: res.ok ? "Cancellation sent to fulfilment partner" : `Partner rejected cancellation (${res.status})` };
  }
  const res = await fetch(`https://api.printful.com/orders/${externalId}`, { method: "DELETE", headers: { Authorization: `Bearer ${creds.apiKey}` } });
  return { ok: res.ok, simulated: false, message: res.ok ? "Printful order cancelled" : `Printful refused cancellation (${res.status}) – it may already be in production` };
}
