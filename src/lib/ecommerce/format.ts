export function money(amount: number | undefined | null, currency = "USD", opts: { compact?: boolean } = {}): string {
  const n = amount ?? 0;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: opts.compact && Math.abs(n) >= 1000 ? 0 : 2, notation: opts.compact && Math.abs(n) >= 100000 ? "compact" : "standard" }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function compact(n: number | undefined | null): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);
}

export function pct(n: number | undefined | null, digits = 1): string {
  return `${(n ?? 0).toFixed(digits)}%`;
}

export function humanize(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(ts: number | undefined | null, withTime = false): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", withTime ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", year: "numeric" });
}

export function relativeTime(ts: number | undefined | null): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const s = Math.round(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(ts);
}

export const CHANNEL_LABELS: Record<string, string> = {
  meta: "Facebook / Instagram",
  tiktok: "TikTok",
  google: "Google",
  email: "Email",
  sms: "SMS",
  influencer: "Influencer",
};

export const TRIGGER_LABELS: Record<string, string> = {
  order_confirmation: "Order confirmation",
  shipping_update: "Shipping update",
  delivered: "Delivered",
  abandoned_cart: "Abandoned cart",
  welcome: "Welcome series",
  post_purchase: "Post-purchase upsell",
  winback: "Win-back",
  cancellation: "Cancellation",
};
