"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { testConnection as shopifyTest, registerOrderWebhook, type ShopifyCredentials } from "./lib/integrations/shopify";
import * as ads from "./lib/integrations/ads";
import { sendEmail, sendSms, type EmailCredentials, type SmsCredentials } from "./lib/integrations/messaging";

/** Verify a connector's credentials against the provider and record the result. */
export const test = action({
  args: { storeId: v.id("ecStores"), provider: v.string(), convexSiteUrl: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ ok: boolean; message: string }> => {
    await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const connector: Doc<"ecConnectors"> | null = await ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId: args.storeId, provider: args.provider });
    if (!connector) return { ok: false, message: "Not connected" };
    const creds = connector.credentials as Record<string, string>;
    let message = "Connection OK";
    try {
      switch (args.provider) {
        case "shopify": {
          const shop = await shopifyTest(creds as unknown as ShopifyCredentials);
          message = `Connected to ${shop.name} (${shop.domain})`;
          if (args.convexSiteUrl) {
            const hook = await registerOrderWebhook(creds as unknown as ShopifyCredentials, `${args.convexSiteUrl}/api/ecommerce/webhooks/shopify/orders?store=${args.storeId}`);
            message += ` · orders/create webhook registered (#${hook.id})`;
          }
          break;
        }
        case "meta": message = `Meta ad account: ${await ads.metaTest(creds as unknown as ads.MetaCredentials)}`; break;
        case "tiktok": message = `TikTok advertiser: ${await ads.tiktokTest(creds as unknown as ads.TikTokCredentials)}`; break;
        case "google": message = `Google Ads customer: ${await ads.googleTest(creds as unknown as ads.GoogleAdsCredentials)}`; break;
        case "email": {
          const c = { provider: creds.apiKey ? "resend" : "smtp", ...creds, smtpPort: creds.smtpPort ? Number(creds.smtpPort) : undefined } as EmailCredentials;
          const r = await sendEmail(c, { to: creds.from, subject: "Commerce Autopilot – email connected", text: "Your email provider is connected. Transactional and marketing flows will be sent from this address." });
          if (r.status !== "sent") throw new Error(r.error ?? "Send failed");
          message = `Test email sent to ${creds.from} via ${r.provider}`;
          break;
        }
        case "sms": {
          const r = await sendSms({ provider: "twilio", ...creds } as SmsCredentials, { to: creds.from, body: "Commerce Autopilot: SMS connected." });
          if (r.status !== "sent") throw new Error(r.error ?? "Send failed");
          message = "Twilio credentials verified";
          break;
        }
        case "fulfillment": {
          if (creds.provider === "printful") {
            const res = await fetch("https://api.printful.com/store", { headers: { Authorization: `Bearer ${creds.apiKey}` } });
            if (!res.ok) throw new Error(`Printful error ${res.status}`);
            message = "Printful connected";
          } else {
            if (!creds.endpointUrl) throw new Error("Endpoint URL required");
            const res = await fetch(creds.endpointUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "ping" }) });
            message = res.ok ? `Webhook endpoint responded ${res.status}` : `Endpoint responded ${res.status} – check that it accepts POST`;
            if (!res.ok) throw new Error(message);
          }
          break;
        }
        case "tracking": {
          const res = await fetch("https://api.aftership.com/v4/couriers", { headers: { "as-api-key": creds.apiKey } });
          if (!res.ok) throw new Error(`AfterShip error ${res.status}`);
          message = "AfterShip connected";
          break;
        }
        default:
          message = "Saved";
      }
      await ctx.runMutation(internal.ecommerce.connectors.setStatus, { connectorId: connector._id, status: "connected", lastSyncedAt: Date.now() });
      return { ok: true, message };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await ctx.runMutation(internal.ecommerce.connectors.setStatus, { connectorId: connector._id, status: "error", lastError: msg });
      return { ok: false, message: msg };
    }
  },
});
