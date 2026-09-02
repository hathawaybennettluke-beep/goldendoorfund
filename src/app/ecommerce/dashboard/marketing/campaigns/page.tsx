"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import { Megaphone, Plus, RefreshCw, LineChart, Facebook, Music2, Globe, Mail, MessageSquare, Handshake } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, StatCard, StatusBadge, EmptyState, LoadingButton, DemoNotice } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, pct, CHANNEL_LABELS, relativeTime } from "@/lib/ecommerce/format";

const CHANNELS = [
  { id: "meta", icon: Facebook }, { id: "tiktok", icon: Music2 }, { id: "google", icon: Globe }, { id: "email", icon: Mail }, { id: "sms", icon: MessageSquare }, { id: "influencer", icon: Handshake },
] as const;
const OBJECTIVES = ["Sales", "Traffic", "Retargeting", "Brand awareness", "Lead generation"];

export default function CampaignsPage() {
  const store = useCurrentStore();
  const router = useRouter();
  const campaigns = useQuery(api.ecommerce.marketing.listCampaigns, { storeId: store._id });
  const overview = useQuery(api.ecommerce.marketing.marketingOverview, { storeId: store._id });
  const products = useQuery(api.ecommerce.products.list, { storeId: store._id });
  const connectors = useQuery(api.ecommerce.connectors.list, { storeId: store._id });
  const create = useAction(api.ecommerce.marketingActions.createCampaign);
  const optimize = useAction(api.ecommerce.marketingActions.optimizeCampaigns);
  const sync = useAction(api.ecommerce.marketingActions.syncMetrics);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState<{ channel: (typeof CHANNELS)[number]["id"]; objective: string; productIds: Id<"ecProducts">[]; dailyBudget: string; name: string }>({ channel: "meta", objective: "Sales", productIds: [], dailyBudget: "50", name: "" });
  const connected = new Set((connectors ?? []).filter((c) => c.status === "connected").map((c) => c.provider));

  const submit = async () => {
    if (form.productIds.length === 0) return toast.error("Select at least one product");
    setBusy("create");
    try {
      const res = await create({ storeId: store._id, channel: form.channel, objective: form.objective, productIds: form.productIds, dailyBudget: Number(form.dailyBudget) || 20, name: form.name || undefined });
      toast.success(`Campaign drafted with targeting and creatives${res.usedAi ? "" : " (demo templates)"}`);
      setOpen(false);
      router.push(`/ecommerce/dashboard/marketing/campaigns/${res.campaignId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setBusy(null);
    }
  };

  const runOptimize = async () => {
    setBusy("optimize");
    try {
      const decisions = await optimize({ storeId: store._id });
      const changed = decisions.filter((d) => d.action !== "hold");
      toast.success(changed.length ? `${changed.length} change(s): ${changed.map((d) => `${d.name} → ${d.action}`).join("; ")}` : "All campaigns held – nothing to change yet");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Optimisation failed");
    } finally {
      setBusy(null);
    }
  };

  const totals = overview?.totals;
  const roas = totals && totals.spend > 0 ? totals.revenue / totals.spend : 0;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 3" title="Campaigns" description="Facebook/Instagram, TikTok, Google, email, SMS and influencer campaigns with AI targeting, creatives and automated optimisation." actions={
        <>
          <LoadingButton variant="outline" loading={busy === "sync"} onClick={async () => { setBusy("sync"); try { const r = await sync({ storeId: store._id }); toast.success(`${r.synced} campaign(s) synced`); } finally { setBusy(null); } }}><RefreshCw className="h-4 w-4" /> Sync metrics</LoadingButton>
          <LoadingButton variant="outline" loading={busy === "optimize"} onClick={runOptimize}><LineChart className="h-4 w-4" /> Optimise now</LoadingButton>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New campaign</Button></DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader><DialogTitle>Create a campaign</DialogTitle><DialogDescription>The autopilot writes the targeting plan, launch strategy and creatives. You review before launch.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Channel</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {CHANNELS.map((c) => (
                      <button key={c.id} type="button" onClick={() => setForm({ ...form, channel: c.id })} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.channel === c.id ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>
                        <c.icon className="h-4 w-4" /> <span className="truncate">{CHANNEL_LABELS[c.id]}</span>
                      </button>
                    ))}
                  </div>
                  {!connected.has(form.channel) && ["meta", "tiktok", "google"].includes(form.channel) && <p className="text-xs text-muted-foreground">Channel not connected – the campaign will run in simulation until you add credentials in Settings.</p>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label>Objective</Label><Select value={form.objective} onValueChange={(v) => setForm({ ...form, objective: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OBJECTIVES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1.5"><Label>Daily budget ({store.currency})</Label><Input type="number" value={form.dailyBudget} onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })} /></div>
                </div>
                <div className="space-y-1.5"><Label>Name (optional)</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Auto-generated from product & channel" /></div>
                <div className="space-y-1.5">
                  <Label>Products</Label>
                  {!products?.length ? <p className="text-sm text-muted-foreground">Add products first.</p> : (
                    <div className="flex flex-wrap gap-2">
                      {products.map((p) => {
                        const on = form.productIds.includes(p._id);
                        return <button key={p._id} type="button" onClick={() => setForm({ ...form, productIds: on ? form.productIds.filter((id) => id !== p._id) : [...form.productIds, p._id] })} className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>{p.title}</button>;
                      })}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter><LoadingButton loading={busy === "create"} onClick={submit}>Generate campaign</LoadingButton></DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      } />

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active campaigns" value={`${overview.active}/${overview.campaigns}`} icon={<Megaphone className="h-4 w-4" />} />
          <StatCard label="Ad spend" value={money(totals?.spend, store.currency)} hint={`${totals?.impressions.toLocaleString()} impressions · ${totals?.clicks.toLocaleString()} clicks`} />
          <StatCard label="Attributed revenue" value={money(totals?.revenue, store.currency)} hint={`${totals?.conversions} conversions`} />
          <StatCard label="Blended ROAS" value={totals && totals.spend > 0 ? `${roas.toFixed(2)}x` : "—"} hint={`Target ≥ ${store.automation.minRoas}x · max CPA ${money(store.automation.maxCpa, store.currency)}`} tone={totals && totals.spend > 0 ? (roas >= store.automation.minRoas ? "good" : "warn") : "default"} />
        </div>
      )}

      {campaigns?.some((c) => c.simulated && c.status === "active") && <DemoNotice>Some campaigns run in <strong>simulation</strong> because their channel isn&apos;t connected. Metrics are modelled so you can see the optimisation rules act; connect Meta, TikTok or Google in Settings to go live.</DemoNotice>}

      {!campaigns ? <p className="text-sm text-muted-foreground">Loading…</p> : campaigns.length === 0 ? (
        <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No campaigns yet" description="Create your first campaign – targeting, strategy, ad copy and a video script are generated automatically." />
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Status</TableHead><TableHead>Budget/day</TableHead><TableHead>Spend</TableHead><TableHead>Revenue</TableHead><TableHead>ROAS</TableHead><TableHead>CTR</TableHead><TableHead>Last optimised</TableHead></TableRow></TableHeader>
            <TableBody>
              {campaigns.map((c) => {
                const r = c.metrics.spend > 0 ? c.metrics.revenue / c.metrics.spend : 0;
                const ctr = c.metrics.impressions > 0 ? (c.metrics.clicks / c.metrics.impressions) * 100 : 0;
                return (
                  <TableRow key={c._id}>
                    <TableCell><Link href={`/ecommerce/dashboard/marketing/campaigns/${c._id}`} className="font-medium hover:underline">{c.name}</Link><p className="text-xs text-muted-foreground">{CHANNEL_LABELS[c.channel]} · {c.objective}{c.simulated ? " · simulated" : ""}</p></TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell>{money(c.dailyBudget, store.currency)}</TableCell>
                    <TableCell>{money(c.metrics.spend, store.currency)}</TableCell>
                    <TableCell>{money(c.metrics.revenue, store.currency)}</TableCell>
                    <TableCell className={c.metrics.spend > 0 ? (r >= store.automation.minRoas ? "text-emerald-700 font-medium" : "text-amber-700 font-medium") : ""}>{c.metrics.spend > 0 ? `${r.toFixed(2)}x` : "—"}</TableCell>
                    <TableCell>{c.metrics.impressions > 0 ? pct(ctr, 2) : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.lastOptimizedAt ? relativeTime(c.lastOptimizedAt) : "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
