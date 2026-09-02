"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Plug, Bot, Store as StoreIcon, Webhook, CheckCircle2, AlertCircle, Copy, Trash2 } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, StatusBadge, LoadingButton } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Field = { key: string; label: string; placeholder?: string; secret?: boolean; type?: "text" | "select"; options?: string[] };
const PROVIDERS: Array<{ id: string; label: string; area: string; description: string; fields: Field[] }> = [
  { id: "shopify", label: "Shopify", area: "Store", description: "Push products & collections, receive orders via webhook.", fields: [{ key: "shopDomain", label: "Shop domain", placeholder: "my-store.myshopify.com" }, { key: "accessToken", label: "Admin API access token", placeholder: "shpat_…", secret: true }, { key: "webhookSecret", label: "Webhook signing secret (app client secret)", secret: true }] },
  { id: "meta", label: "Meta Ads (Facebook & Instagram)", area: "Marketing", description: "Create campaigns and sync insights.", fields: [{ key: "adAccountId", label: "Ad account ID (digits)", placeholder: "1234567890" }, { key: "accessToken", label: "System user access token", secret: true }, { key: "pageId", label: "Page ID (optional)" }, { key: "pixelId", label: "Pixel ID (optional)" }] },
  { id: "tiktok", label: "TikTok Ads", area: "Marketing", description: "Create campaigns and sync reports.", fields: [{ key: "advertiserId", label: "Advertiser ID" }, { key: "accessToken", label: "Access token", secret: true }] },
  { id: "google", label: "Google Ads", area: "Marketing", description: "Create Performance Max campaigns.", fields: [{ key: "customerId", label: "Customer ID (digits only)" }, { key: "developerToken", label: "Developer token", secret: true }, { key: "accessToken", label: "OAuth access token", secret: true }, { key: "loginCustomerId", label: "Login customer ID (MCC, optional)" }] },
  { id: "email", label: "Email (Resend or SMTP)", area: "Messaging", description: "Transactional & marketing email.", fields: [{ key: "from", label: "From address", placeholder: "hello@yourstore.com" }, { key: "apiKey", label: "Resend API key (leave blank for SMTP)", secret: true }, { key: "smtpHost", label: "SMTP host" }, { key: "smtpPort", label: "SMTP port", placeholder: "587" }, { key: "smtpUser", label: "SMTP user" }, { key: "smtpPass", label: "SMTP password", secret: true }] },
  { id: "sms", label: "SMS (Twilio)", area: "Messaging", description: "SMS flows and shipping alerts.", fields: [{ key: "accountSid", label: "Account SID" }, { key: "authToken", label: "Auth token", secret: true }, { key: "from", label: "From number", placeholder: "+15551234567" }] },
  { id: "fulfillment", label: "Fulfilment partner", area: "Orders", description: "Any 3PL via signed webhook, or Printful.", fields: [{ key: "provider", label: "Provider", type: "select", options: ["webhook", "printful"] }, { key: "endpointUrl", label: "Webhook endpoint URL (webhook provider)", placeholder: "https://3pl.example.com/orders" }, { key: "secret", label: "Webhook signing secret (optional)", secret: true }, { key: "apiKey", label: "Printful API key (printful provider)", secret: true }] },
  { id: "tracking", label: "Shipment tracking (AfterShip)", area: "Orders", description: "Carrier tracking for real shipments.", fields: [{ key: "apiKey", label: "AfterShip API key", secret: true }] },
];

export default function SettingsPage() {
  const store = useCurrentStore();
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab") ?? "store";
  return (
    <div className="space-y-6">
      <PageHeader title="Settings & integrations" description="Store profile, pricing strategy, automation rules and the services the autopilot talks to." />
      <Tabs value={tab} onValueChange={(v) => router.replace(`/ecommerce/dashboard/settings?tab=${v}`)}>
        <TabsList className="flex-wrap h-auto"><TabsTrigger value="store"><StoreIcon className="mr-1.5 h-4 w-4" /> Store & pricing</TabsTrigger><TabsTrigger value="automation"><Bot className="mr-1.5 h-4 w-4" /> Automation rules</TabsTrigger><TabsTrigger value="integrations"><Plug className="mr-1.5 h-4 w-4" /> Integrations</TabsTrigger><TabsTrigger value="webhooks"><Webhook className="mr-1.5 h-4 w-4" /> Webhooks</TabsTrigger></TabsList>
        <TabsContent value="store" className="mt-4"><StoreTab store={store} /></TabsContent>
        <TabsContent value="automation" className="mt-4"><AutomationTab store={store} /></TabsContent>
        <TabsContent value="integrations" className="mt-4"><IntegrationsTab store={store} /></TabsContent>
        <TabsContent value="webhooks" className="mt-4"><WebhooksTab store={store} /></TabsContent>
      </Tabs>
    </div>
  );
}

function StoreTab({ store }: { store: Doc<"ecStores"> }) {
  const update = useMutation(api.ecommerce.stores.update);
  const updatePricing = useMutation(api.ecommerce.stores.updatePricing);
  const remove = useMutation(api.ecommerce.stores.remove);
  const router = useRouter();
  const [form, setForm] = useState({ name: store.name, niche: store.niche, description: store.description ?? "", targetAudience: store.targetAudience ?? "", brandVoice: store.brandVoice ?? "", currency: store.currency, country: store.country ?? "", primaryColor: store.primaryColor ?? "#d4a017", status: store.status });
  const [pricing, setPricing] = useState(store.pricing);
  const [busy, setBusy] = useState<string | null>(null);
  const save = async (key: string, fn: () => Promise<unknown>) => { setBusy(key); try { await fn(); toast.success("Saved"); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setBusy(null); } };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Store profile" description="Feeds every AI generation.">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-1.5"><Label>Niche</Label><Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} /></div></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label>Target audience</Label><Input value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} /></div><div className="space-y-1.5"><Label>Brand voice</Label><Input value={form.brandVoice} onChange={(e) => setForm({ ...form, brandVoice: e.target.value })} /></div></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Currency</Label><Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["USD", "EUR", "GBP", "CAD", "AUD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Market</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="setup">Setup</SelectItem><SelectItem value="live">Live</SelectItem><SelectItem value="paused">Paused</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-1.5"><Label>Brand colour</Label><div className="flex gap-2"><input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-9 w-12 rounded border" /><Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="font-mono" /></div></div>
          <LoadingButton loading={busy === "store"} onClick={() => save("store", () => update({ storeId: store._id, ...form }))}>Save profile</LoadingButton>
        </div>
      </Section>
      <div className="space-y-6">
        <Section title="Pricing strategy" description="Drives the pricing engine for every product.">
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Strategy</Label><Select value={pricing.strategy} onValueChange={(v) => setPricing({ ...pricing, strategy: v as typeof pricing.strategy })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="margin">Margin target</SelectItem><SelectItem value="competitive">Competitive (undercut median)</SelectItem><SelectItem value="premium">Premium</SelectItem><SelectItem value="penetration">Penetration</SelectItem></SelectContent></Select></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5"><Label>Target net margin %</Label><Input type="number" value={pricing.targetMarginPct} onChange={(e) => setPricing({ ...pricing, targetMarginPct: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Minimum margin %</Label><Input type="number" value={pricing.minMarginPct} onChange={(e) => setPricing({ ...pricing, minMarginPct: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Rounding</Label><Select value={pricing.roundTo} onValueChange={(v) => setPricing({ ...pricing, roundTo: v as typeof pricing.roundTo })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value=".99">.99</SelectItem><SelectItem value=".95">.95</SelectItem><SelectItem value="whole">Whole</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select></div>
            </div>
            <LoadingButton loading={busy === "pricing"} onClick={() => save("pricing", () => updatePricing({ storeId: store._id, pricing }))}>Save pricing</LoadingButton>
          </div>
        </Section>
        <Section title="Danger zone">
          <Button variant="outline" className="text-red-600" onClick={async () => { if (confirm(`Delete ${store.name} and all of its data? This cannot be undone.`)) { await remove({ storeId: store._id }); router.push("/ecommerce/dashboard"); } }}><Trash2 className="h-4 w-4" /> Delete store</Button>
        </Section>
      </div>
    </div>
  );
}

function AutomationTab({ store }: { store: Doc<"ecStores"> }) {
  const update = useMutation(api.ecommerce.stores.updateAutomation);
  const [a, setA] = useState(store.automation);
  const [busy, setBusy] = useState(false);
  const toggles: Array<{ key: keyof typeof a; label: string; detail: string }> = [
    { key: "autoFulfill", label: "Auto-send paid orders to fulfilment", detail: "Runs every 15 minutes. Orders above the risk threshold are held for review instead." },
    { key: "autoNotifyTracking", label: "Auto-notify customers with tracking", detail: "Shipping and delivery messages from your Email & SMS flows." },
    { key: "autoHandleCancellations", label: "Auto-notify on cancellations", detail: "Send the cancellation flow and restock inventory when an order is cancelled." },
    { key: "autoOptimizeCampaigns", label: "Auto-optimise ad campaigns", detail: "Every 6 hours: scale, reduce, pause or refresh creative based on ROAS/CPA targets." },
    { key: "autoRefreshTrends", label: "Daily trend research refresh", detail: "Adds fresh product opportunities to the idea board every morning." },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Automation toggles">
        <ul className="divide-y">{toggles.map((t) => <li key={t.key} className="flex items-start justify-between gap-4 py-3"><div><p className="font-medium">{t.label}</p><p className="text-sm text-muted-foreground">{t.detail}</p></div><Switch checked={Boolean(a[t.key])} onCheckedChange={(v) => setA({ ...a, [t.key]: v })} /></li>)}</ul>
      </Section>
      <Section title="Guard-rails" description="Thresholds the automation respects.">
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Hold orders for review above ({store.currency})</Label><Input type="number" value={a.riskHoldAmount} onChange={(e) => setA({ ...a, riskHoldAmount: Number(e.target.value) })} /></div>
          <div className="space-y-1.5"><Label>Minimum ROAS before scaling</Label><Input type="number" step="0.1" value={a.minRoas} onChange={(e) => setA({ ...a, minRoas: Number(e.target.value) })} /></div>
          <div className="space-y-1.5"><Label>Maximum cost per acquisition ({store.currency})</Label><Input type="number" value={a.maxCpa} onChange={(e) => setA({ ...a, maxCpa: Number(e.target.value) })} /></div>
          <LoadingButton loading={busy} onClick={async () => { setBusy(true); try { await update({ storeId: store._id, automation: a }); toast.success("Automation rules saved"); } finally { setBusy(false); } }}>Save rules</LoadingButton>
        </div>
      </Section>
    </div>
  );
}

function IntegrationsTab({ store }: { store: Doc<"ecStores"> }) {
  const connectors = useQuery(api.ecommerce.connectors.list, { storeId: store._id });
  const upsert = useMutation(api.ecommerce.connectors.upsert);
  const disconnect = useMutation(api.ecommerce.connectors.disconnect);
  const test = useAction(api.ecommerce.connectorActions.test);
  const [editing, setEditing] = useState<(typeof PROVIDERS)[number] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const byProvider = new Map((connectors ?? []).map((c) => [c.provider, c]));
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".convex.cloud", ".convex.site");

  const open = (p: (typeof PROVIDERS)[number]) => {
    const existing = byProvider.get(p.id);
    const creds = (existing?.credentials ?? {}) as Record<string, string>;
    setValues(Object.fromEntries(p.fields.map((f) => [f.key, creds[f.key] ?? (f.type === "select" ? f.options![0] : "")])));
    setEditing(p);
  };
  const save = async () => {
    if (!editing) return;
    setBusy("save");
    try {
      await upsert({ storeId: store._id, provider: editing.id, label: editing.label, credentials: values });
      const res = await test({ storeId: store._id, provider: editing.id, convexSiteUrl: siteUrl });
      toast[res.ok ? "success" : "error"](res.message);
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Nothing connected? Everything still works in <strong>demo mode</strong> with simulated channels. Connect services as you go live. Credentials are stored server-side and never shown in full again.</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PROVIDERS.map((p) => {
          const c = byProvider.get(p.id);
          return (
            <article key={p.id} className="flex flex-col rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">{p.area}</p><h3 className="font-semibold">{p.label}</h3></div>{c ? <StatusBadge status={c.status} /> : <StatusBadge status="disconnected" />}</div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
              {c?.lastError && <p className="mt-2 flex items-start gap-1 text-xs text-red-600"><AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />{c.lastError}</p>}
              {c && !c.lastError && c.status === "connected" && <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Connected</p>}
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant={c ? "outline" : "default"} onClick={() => open(p)}>{c ? "Edit" : "Connect"}</Button>
                {c && <LoadingButton size="sm" variant="ghost" loading={busy === p.id} onClick={async () => { setBusy(p.id); try { const r = await test({ storeId: store._id, provider: p.id, convexSiteUrl: siteUrl }); toast[r.ok ? "success" : "error"](r.message); } finally { setBusy(null); } }}>Test</LoadingButton>}
                {c && <Button size="sm" variant="ghost" className="ml-auto text-red-600" onClick={() => disconnect({ storeId: store._id, provider: p.id })}>Disconnect</Button>}
              </div>
            </article>
          );
        })}
      </div>
      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.label}</DialogTitle><DialogDescription>{editing?.description} Secrets already saved appear masked – leave them as-is to keep them.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            {editing?.fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                {f.type === "select" ? <Select value={values[f.key]} onValueChange={(v) => setValues({ ...values, [f.key]: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{f.options!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select> : <Input type={f.secret ? "password" : "text"} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} autoComplete="off" />}
              </div>
            ))}
          </div>
          <DialogFooter><LoadingButton loading={busy === "save"} onClick={save}>Save & test</LoadingButton></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WebhooksTab({ store }: { store: Doc<"ecStores"> }) {
  const connectors = useQuery(api.ecommerce.connectors.list, { storeId: store._id });
  const inbound = connectors?.find((c) => c.provider === "inbound_webhook");
  const token = (inbound?.credentials as { token?: string } | undefined)?.token;
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".convex.cloud", ".convex.site") ?? "https://<your-deployment>.convex.site";
  const copy = (t: string) => navigator.clipboard.writeText(t).then(() => toast.success("Copied"));
  const rows = [
    { title: "Inbound orders (any platform)", url: `${siteUrl}/api/ecommerce/webhooks/orders?store=${store._id}&token=${token ?? "<token>"}`, note: "POST JSON with customer, shippingAddress, items[], paid. Works with Zapier, Make, WooCommerce, custom carts." },
    { title: "Shopify orders/create", url: `${siteUrl}/api/ecommerce/webhooks/shopify/orders?store=${store._id}`, note: "Registered automatically when you connect Shopify. HMAC verified with your webhook secret." },
    { title: "Stripe Checkout (storefront payments)", url: `${siteUrl}/api/ecommerce/webhooks/stripe`, note: "Add as a Stripe webhook endpoint for checkout.session.completed with STRIPE_WEBHOOK_SECRET set in Convex." },
  ];
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <Section key={r.title} title={r.title} description={r.note}>
          <div className="flex items-center gap-2"><code className="flex-1 overflow-x-auto rounded bg-muted px-3 py-2 text-xs">{r.url}</code><Button size="icon" variant="outline" onClick={() => copy(r.url)}><Copy className="h-4 w-4" /></Button></div>
        </Section>
      ))}
      <Section title="Example payload (inbound orders)">
        <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">{JSON.stringify({ externalId: "ORD-1001", customer: { name: "Ava Thompson", email: "ava@example.com", phone: "+15551234567" }, shippingAddress: { line1: "12 Maple St", city: "Austin", state: "TX", postalCode: "78701", country: "US" }, items: [{ title: "Compact Organizer", sku: "ORG-001", quantity: 1, unitPrice: 29.99 }], shipping: 4.99, currency: store.currency, paid: true }, null, 2)}</pre>
      </Section>
    </div>
  );
}
