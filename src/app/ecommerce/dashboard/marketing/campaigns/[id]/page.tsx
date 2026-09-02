"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { ArrowLeft, Rocket, Pause, Play, Trash2, Sparkles, Bot, ExternalLink, Clapperboard } from "lucide-react";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, StatusBadge, StatCard, LoadingButton, AiTag, KeyValue, ProductImage } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money, pct, CHANNEL_LABELS, relativeTime, formatDate } from "@/lib/ecommerce/format";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const campaignId = id as Id<"ecAdCampaigns">;
  const store = useCurrentStore();
  const router = useRouter();
  const campaign = useQuery(api.ecommerce.marketing.getCampaign, { campaignId });
  const launch = useAction(api.ecommerce.marketingActions.launchCampaign);
  const setStatus = useAction(api.ecommerce.marketingActions.setCampaignStatus);
  const generate = useAction(api.ecommerce.marketingActions.generateCreatives);
  const updateBudget = useMutation(api.ecommerce.marketing.updateCampaignBudget);
  const remove = useMutation(api.ecommerce.marketing.deleteCampaign);
  const updateCreative = useMutation(api.ecommerce.marketing.updateCreativeStatus);
  const [busy, setBusy] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);

  if (campaign === undefined) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (campaign === null) return <p>Campaign not found.</p>;

  const run = async (key: string, fn: () => Promise<unknown>, msg: string) => {
    setBusy(key);
    try { await fn(); toast.success(msg); } catch (error) { toast.error(error instanceof Error ? error.message : "Failed"); } finally { setBusy(null); }
  };
  const m = campaign.metrics;
  const roas = m.spend > 0 ? m.revenue / m.spend : 0;
  const cpa = m.conversions > 0 ? m.spend / m.conversions : 0;
  const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0;
  const t = campaign.targeting as { audience?: string; interests?: string[]; ageRange?: string; genders?: string; locations?: string[]; placements?: string[]; keywords?: string[] };
  const copy = campaign.creatives.filter((c) => c.type === "ad_copy" || c.type === "email" || c.type === "sms");
  const videos = campaign.creatives.filter((c) => c.type === "video_script");
  const images = campaign.creatives.filter((c) => c.type === "image");

  return (
    <div className="space-y-6">
      <Link href="/ecommerce/dashboard/marketing/campaigns" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Campaigns</Link>
      <PageHeader title={campaign.name} description={`${CHANNEL_LABELS[campaign.channel]} · ${campaign.objective} · created ${formatDate(campaign.createdAt)}`} actions={
        <>
          <StatusBadge status={campaign.status} />
          {campaign.simulated && campaign.status !== "draft" && <StatusBadge status="simulated" />}
          {campaign.status === "draft" && <LoadingButton loading={busy === "launch"} onClick={() => run("launch", () => launch({ campaignId }), "Campaign launched")}><Rocket className="h-4 w-4" /> Launch</LoadingButton>}
          {campaign.status === "active" && <LoadingButton variant="outline" loading={busy === "pause"} onClick={() => run("pause", () => setStatus({ campaignId, status: "paused" }), "Paused")}><Pause className="h-4 w-4" /> Pause</LoadingButton>}
          {campaign.status === "paused" && <LoadingButton loading={busy === "resume"} onClick={() => run("resume", () => setStatus({ campaignId, status: "active" }), "Resumed")}><Play className="h-4 w-4" /> Resume</LoadingButton>}
          <Button variant="ghost" className="text-red-600" onClick={async () => { if (confirm("Delete campaign?")) { await remove({ campaignId }); router.push("/ecommerce/dashboard/marketing/campaigns"); } }}><Trash2 className="h-4 w-4" /></Button>
        </>
      } />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Spend" value={money(m.spend, store.currency)} hint={`${money(campaign.dailyBudget, store.currency)}/day`} />
        <StatCard label="Revenue" value={money(m.revenue, store.currency)} hint={`${m.conversions} conversions`} />
        <StatCard label="ROAS" value={m.spend > 0 ? `${roas.toFixed(2)}x` : "—"} hint={`target ≥ ${store.automation.minRoas}x`} tone={m.spend === 0 ? "default" : roas >= store.automation.minRoas ? "good" : "warn"} />
        <StatCard label="CPA" value={m.conversions > 0 ? money(cpa, store.currency) : "—"} hint={`max ${money(store.automation.maxCpa, store.currency)}`} tone={m.conversions === 0 ? "default" : cpa <= store.automation.maxCpa ? "good" : "warn"} />
        <StatCard label="CTR" value={m.impressions > 0 ? pct(ctr, 2) : "—"} hint={`${m.impressions.toLocaleString()} impressions · ${m.clicks.toLocaleString()} clicks`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Ad copy" description={`${copy.length} variant(s)`} actions={<LoadingButton size="sm" variant="outline" loading={busy === "copy"} onClick={() => run("copy", () => generate({ storeId: store._id, productId: campaign.productIds[0], channel: campaign.channel, type: "ad_copy", campaignId }), "3 new variants generated")}><Sparkles className="h-4 w-4" /> More variants</LoadingButton>}>
            {copy.length === 0 ? <p className="text-sm text-muted-foreground">No copy yet.</p> : (
              <div className="grid gap-3 md:grid-cols-2">
                {copy.map((c) => (
                  <article key={c._id} className="rounded-lg border p-4 text-sm">
                    <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-muted-foreground">{c.variant}</span><div className="flex items-center gap-1"><AiTag usedAi={c.usedAi} /><StatusBadge status={c.status} /></div></div>
                    {c.hook && <p className="mt-2 text-xs italic text-muted-foreground">Hook: {c.hook}</p>}
                    {c.headline && <p className="mt-2 font-semibold">{c.headline}</p>}
                    {c.primaryText && <p className="mt-1 whitespace-pre-wrap">{c.primaryText}</p>}
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{c.description}</span>{c.cta && <span className="rounded bg-primary px-2 py-0.5 font-medium text-primary-foreground">{c.cta}</span>}</div>
                    <div className="mt-3 flex gap-2">
                      {c.status !== "approved" && c.status !== "live" && <Button size="sm" variant="outline" onClick={() => updateCreative({ creativeId: c._id, status: "approved" })}>Approve</Button>}
                      {c.status !== "retired" && <Button size="sm" variant="ghost" onClick={() => updateCreative({ creativeId: c._id, status: "retired" })}>Retire</Button>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Section>

          <Section title="Video scripts" description="UGC-style scripts ready for a creator or your own phone." actions={<LoadingButton size="sm" variant="outline" loading={busy === "video"} onClick={() => run("video", () => generate({ storeId: store._id, productId: campaign.productIds[0], channel: campaign.channel, type: "video_script", campaignId }), "Video script generated")}><Clapperboard className="h-4 w-4" /> New script</LoadingButton>}>
            {videos.length === 0 ? <p className="text-sm text-muted-foreground">No scripts yet.</p> : videos.map((v) => (
              <div key={v._id} className="mb-4 rounded-lg border p-4 text-sm last:mb-0">
                <div className="flex items-center justify-between"><p className="font-semibold">Hook: {v.hook}</p><AiTag usedAi={v.usedAi} /></div>
                <ol className="mt-3 space-y-2">
                  {v.script?.map((s) => (
                    <li key={s.scene} className="grid gap-1 rounded bg-muted/50 p-2 sm:grid-cols-[3rem_1fr_1fr]"><span className="text-xs font-mono text-muted-foreground">{s.durationSec}s</span><span><span className="text-xs font-semibold text-muted-foreground">VISUAL</span><br />{s.visual}{s.onScreenText && <span className="block text-xs text-primary">On screen: {s.onScreenText}</span>}</span><span><span className="text-xs font-semibold text-muted-foreground">VOICEOVER</span><br />{s.voiceover}</span></li>
                  ))}
                </ol>
              </div>
            ))}
          </Section>

          {images.length > 0 && <Section title="Image creatives"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((i) => <ProductImage key={i._id} src={i.imageUrl} alt={i.headline ?? "creative"} className="aspect-square w-full rounded-lg border" />)}</div></Section>}
        </div>

        <div className="space-y-6">
          <Section title="Targeting & strategy">
            <KeyValue items={[
              { label: "Audience", value: t.audience ?? "—" },
              { label: "Age / gender", value: `${t.ageRange ?? "—"} · ${t.genders ?? "all"}` },
              { label: "Locations", value: t.locations?.join(", ") ?? "—" },
              { label: "Placements", value: t.placements?.join(", ") ?? "—" },
              { label: "Interests", value: t.interests?.join(", ") ?? "—" },
              ...(t.keywords?.length ? [{ label: "Keywords", value: t.keywords.join(", ") }] : []),
            ]} />
            {campaign.strategy && <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{campaign.strategy}</p>}
            <div className="mt-4 flex items-end gap-2">
              <div className="flex-1 space-y-1"><label className="text-xs text-muted-foreground">Daily budget</label><Input type="number" value={budget ?? String(campaign.dailyBudget)} onChange={(e) => setBudget(e.target.value)} /></div>
              <Button size="sm" disabled={budget === null} onClick={async () => { await updateBudget({ campaignId, dailyBudget: Number(budget) }); setBudget(null); toast.success("Budget updated"); }}>Save</Button>
            </div>
            {campaign.externalId && !campaign.simulated && <p className="mt-3 text-xs text-muted-foreground">Platform ID: {campaign.externalId} ({campaign.externalStatus})</p>}
          </Section>
          <Section title="Products">
            <ul className="space-y-2">{campaign.products.map((p) => <li key={p._id}><Link href={`/ecommerce/dashboard/store/products/${p._id}`} className="flex items-center gap-2 text-sm hover:underline"><ProductImage src={p.images[0]?.url} alt={p.title} className="h-8 w-8 rounded border" />{p.title}<ExternalLink className="h-3 w-3 text-muted-foreground" /></Link></li>)}</ul>
          </Section>
          <Section title="Optimisation log" description="Every automated and manual decision.">
            {campaign.optimizations.length === 0 ? <p className="text-sm text-muted-foreground">Nothing yet.</p> : (
              <ul className="space-y-3">
                {[...campaign.optimizations].reverse().map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${o.automated ? "bg-primary/10 text-primary" : "bg-muted"}`}>{o.automated ? <Bot className="h-3 w-3" /> : <span className="text-[10px]">you</span>}</span><div><p className="font-medium">{o.action}</p><p className="text-muted-foreground">{o.reason}</p><p className="text-xs text-muted-foreground">{relativeTime(o.at)}</p></div></li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
