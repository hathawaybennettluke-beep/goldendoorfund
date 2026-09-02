/**
 * Shipment tracking. Uses AfterShip when connected; otherwise simulates a
 * realistic delivery timeline so the automation loop can be observed.
 */
export interface TrackingCredentials {
  provider: "aftership";
  apiKey: string;
}

export type ShipmentStatus = "label_created" | "in_transit" | "out_for_delivery" | "delivered" | "exception" | "returned";

export interface TrackingEvent {
  at: number;
  status: string;
  location?: string;
  description: string;
}

export interface TrackingSnapshot {
  status: ShipmentStatus;
  events: TrackingEvent[];
  estimatedDelivery?: number;
}

const CARRIER_URLS: Record<string, (n: string) => string> = {
  ups: (n) => `https://www.ups.com/track?tracknum=${n}`,
  usps: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
  fedex: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
  dhl: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${n}`,
  "royal-mail": (n) => `https://www.royalmail.com/track-your-item#/tracking-results/${n}`,
  "canada-post": (n) => `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${n}`,
  "australia-post": (n) => `https://auspost.com.au/mypost/track/#/details/${n}`,
  yunexpress: (n) => `https://www.yuntrack.com/parcelTracking?id=${n}`,
  "4px": (n) => `https://track.4px.com/#/result/0/${n}`,
};

export function trackingUrlFor(carrier: string, trackingNumber: string): string {
  const key = carrier.toLowerCase().replace(/\s+/g, "-");
  const builder = CARRIER_URLS[key];
  return builder ? builder(trackingNumber) : `https://www.google.com/search?q=${encodeURIComponent(`${carrier} ${trackingNumber}`)}`;
}

const AFTERSHIP_STATUS: Record<string, ShipmentStatus> = {
  Pending: "label_created",
  InfoReceived: "label_created",
  InTransit: "in_transit",
  OutForDelivery: "out_for_delivery",
  AttemptFail: "exception",
  Delivered: "delivered",
  AvailableForPickup: "out_for_delivery",
  Exception: "exception",
  Expired: "exception",
};

export async function fetchTracking(creds: TrackingCredentials, carrier: string, trackingNumber: string): Promise<TrackingSnapshot> {
  const slug = carrier.toLowerCase().replace(/\s+/g, "-");
  const headers = { "as-api-key": creds.apiKey, "Content-Type": "application/json" };
  let res = await fetch(`https://api.aftership.com/v4/trackings/${slug}/${encodeURIComponent(trackingNumber)}`, { headers });
  if (res.status === 404) {
    await fetch("https://api.aftership.com/v4/trackings", { method: "POST", headers, body: JSON.stringify({ tracking: { slug, tracking_number: trackingNumber } }) });
    res = await fetch(`https://api.aftership.com/v4/trackings/${slug}/${encodeURIComponent(trackingNumber)}`, { headers });
  }
  if (!res.ok) throw new Error(`AfterShip error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: { tracking: { tag: string; expected_delivery?: string; checkpoints: Array<{ checkpoint_time: string; tag: string; location?: string; message: string }> } } };
  const t = json.data.tracking;
  return {
    status: AFTERSHIP_STATUS[t.tag] ?? "in_transit",
    estimatedDelivery: t.expected_delivery ? Date.parse(t.expected_delivery) : undefined,
    events: (t.checkpoints ?? []).map((c) => ({ at: Date.parse(c.checkpoint_time), status: AFTERSHIP_STATUS[c.tag] ?? c.tag, location: c.location, description: c.message })),
  };
}

/**
 * Advance a simulated shipment along a realistic timeline based on how much
 * time has passed since it was created. Deterministic and idempotent.
 */
export function simulateTracking(createdAt: number, now: number, existing: TrackingEvent[]): TrackingSnapshot {
  const HOUR = 60 * 60 * 1000;
  const timeline: Array<{ afterMs: number; status: ShipmentStatus; description: string; location: string }> = [
    { afterMs: 0, status: "label_created", description: "Shipping label created", location: "Fulfilment centre" },
    { afterMs: 2 * HOUR, status: "in_transit", description: "Package picked up by carrier", location: "Origin facility" },
    { afterMs: 20 * HOUR, status: "in_transit", description: "Departed regional hub", location: "Regional sorting hub" },
    { afterMs: 44 * HOUR, status: "in_transit", description: "Arrived at destination facility", location: "Destination facility" },
    { afterMs: 56 * HOUR, status: "out_for_delivery", description: "Out for delivery", location: "Local delivery station" },
    { afterMs: 62 * HOUR, status: "delivered", description: "Delivered – left at front door", location: "Customer address" },
  ];
  const elapsed = now - createdAt;
  const reached = timeline.filter((t) => t.afterMs <= elapsed);
  const events: TrackingEvent[] = reached.map((t) => ({ at: createdAt + t.afterMs, status: t.status, location: t.location, description: t.description }));
  const merged = events.length >= existing.length ? events : existing;
  const last = reached[reached.length - 1] ?? timeline[0];
  return { status: last.status, events: merged, estimatedDelivery: createdAt + 62 * HOUR };
}

export function fakeTrackingNumber(seed: string): { carrier: string; trackingNumber: string } {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const carriers = ["UPS", "USPS", "FedEx", "DHL"];
  const carrier = carriers[h % carriers.length];
  const digits = String(h).padStart(10, "0").slice(0, 10) + String(Date.now()).slice(-6);
  const prefix = carrier === "UPS" ? "1Z" : carrier === "USPS" ? "94" : carrier === "FedEx" ? "78" : "JD";
  return { carrier, trackingNumber: `${prefix}${digits}` };
}
