import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { requireStoreAccess } from "./lib/auth";

export const PROVIDERS = [
  { id: "shopify", label: "Shopify", area: "store", fields: ["shopDomain", "accessToken", "webhookSecret"] },
  { id: "meta", label: "Meta Ads (Facebook & Instagram)", area: "marketing", fields: ["adAccountId", "accessToken", "pageId", "pixelId"] },
  { id: "tiktok", label: "TikTok Ads", area: "marketing", fields: ["advertiserId", "accessToken"] },
  { id: "google", label: "Google Ads", area: "marketing", fields: ["customerId", "developerToken", "accessToken", "loginCustomerId"] },
  { id: "email", label: "Email (Resend or SMTP)", area: "marketing", fields: ["provider", "from", "apiKey", "smtpHost", "smtpPort", "smtpUser", "smtpPass"] },
  { id: "sms", label: "SMS (Twilio)", area: "marketing", fields: ["accountSid", "authToken", "from"] },
  { id: "fulfillment", label: "Fulfilment (3PL webhook or Printful)", area: "orders", fields: ["provider", "endpointUrl", "secret", "apiKey"] },
  { id: "tracking", label: "Shipment tracking (AfterShip)", area: "orders", fields: ["apiKey"] },
] as const;

function mask(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.length <= 6) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-2)}`;
}

const SAFE_KEYS = new Set(["provider", "from", "shopDomain", "adAccountId", "advertiserId", "customerId", "loginCustomerId", "pageId", "pixelId", "smtpHost", "smtpPort", "smtpUser", "endpointUrl", "accountSid"]);

export const list = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const rows = await ctx.db.query("ecConnectors").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    return rows.map((row) => ({
      ...row,
      credentials: Object.fromEntries(
        Object.entries((row.credentials ?? {}) as Record<string, unknown>).map(([k, val]) => [k, SAFE_KEYS.has(k) ? val : mask(val)])
      ),
    }));
  },
});

export const upsert = mutation({
  args: {
    storeId: v.id("ecStores"),
    provider: v.string(),
    label: v.string(),
    credentials: v.any(),
    config: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const existing = await ctx.db
      .query("ecConnectors")
      .withIndex("by_store_provider", (q) => q.eq("storeId", args.storeId).eq("provider", args.provider))
      .first();
    const now = Date.now();
    // Keep previously saved secrets when the form submits a masked/blank value.
    const merged: Record<string, unknown> = { ...((existing?.credentials as Record<string, unknown>) ?? {}) };
    for (const [k, val] of Object.entries(args.credentials as Record<string, unknown>)) {
      if (typeof val === "string" && (val.trim() === "" || val.includes("••••"))) continue;
      merged[k] = val;
    }
    if (existing) {
      await ctx.db.patch(existing._id, { credentials: merged, config: args.config ?? existing.config, label: args.label, status: "connected", lastError: undefined, updatedAt: now });
    } else {
      await ctx.db.insert("ecConnectors", { storeId: args.storeId, provider: args.provider, label: args.label, status: "connected", credentials: merged, config: args.config ?? {}, createdAt: now, updatedAt: now });
    }
    await ctx.db.insert("ecActivity", { storeId: args.storeId, actor: "user", area: "settings", action: `${args.label} connected`, level: "success", createdAt: now });
  },
});

export const disconnect = mutation({
  args: { storeId: v.id("ecStores"), provider: v.string() },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const existing = await ctx.db
      .query("ecConnectors")
      .withIndex("by_store_provider", (q) => q.eq("storeId", args.storeId).eq("provider", args.provider))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const getByProvider = internalQuery({
  args: { storeId: v.id("ecStores"), provider: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("ecConnectors")
      .withIndex("by_store_provider", (q) => q.eq("storeId", args.storeId).eq("provider", args.provider))
      .first();
    return row && row.status !== "disconnected" ? row : null;
  },
});

export const setStatus = internalMutation({
  args: { connectorId: v.id("ecConnectors"), status: v.union(v.literal("connected"), v.literal("error")), lastError: v.optional(v.string()), lastSyncedAt: v.optional(v.number()), config: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status, lastError: args.lastError, updatedAt: Date.now() };
    if (args.lastSyncedAt) patch.lastSyncedAt = args.lastSyncedAt;
    if (args.config) patch.config = args.config;
    await ctx.db.patch(args.connectorId, patch);
  },
});
