"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Users, Sparkles, Send, Trash2, ExternalLink, MessageCircle, Copy } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Doc } from "../../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, EmptyState, LoadingButton, AiTag, DemoNotice } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { compact, money, relativeTime } from "@/lib/ecommerce/format";

const STATUSES = ["identified", "contacted", "negotiating", "agreed", "declined", "posted"] as const;

export default function InfluencersPage() {
  const store = useCurrentStore();
  const influencers = useQuery(api.ecommerce.marketing.listInfluencers, { storeId: store._id });
  const find = useAction(api.ecommerce.marketingActions.findInfluencers);
  const outreach = useAction(api.ecommerce.marketingActions.generateOutreach);
  const send = useAction(api.ecommerce.marketingActions.sendOutreach);
  const update = useMutation(api.ecommerce.marketing.updateInfluencer);
  const remove = useMutation(api.ecommerce.marketing.deleteInfluencer);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Doc<"ecInfluencers"> | null>(null);
  const [draft, setDraft] = useState("");

  const discover = async () => {
    setBusy("find");
    try {
      const res = await find({ storeId: store._id, count: 8 });
      toast.success(`${res.added} creator(s) added${res.usedAi ? "" : " (demo placeholders)"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const openOutreach = async (inf: Doc<"ecInfluencers">) => {
    setSelected(inf);
    setDraft(inf.outreachMessage ?? "");
    if (!inf.outreachMessage) {
      setBusy(`gen-${inf._id}`);
      try {
        const res = await outreach({ influencerId: inf._id });
        setDraft(res.outreachMessage);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed");
      } finally {
        setBusy(null);
      }
    }
  };

  const doSend = async () => {
    if (!selected) return;
    setBusy("send");
    try {
      await update({ influencerId: selected._id, outreachMessage: draft });
      const res = await send({ influencerId: selected._id });
      toast.success(res.status === "simulated" ? "Marked as contacted – copy the message into your DMs" : `Outreach email ${res.status}`);
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const pipeline = STATUSES.map((s) => ({ status: s, count: (influencers ?? []).filter((i) => i.status === s).length }));
  const demo = influencers?.some((i) => !i.usedAi);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 3" title="Influencer outreach" description="Discover creators in your niche, generate personalised outreach and track the deal pipeline." actions={<LoadingButton onClick={discover} loading={busy === "find"}><Sparkles className="h-4 w-4" /> Find creators</LoadingButton>} />
      {demo && <DemoNotice>Some creators are <strong>demo placeholders</strong> (example handles). Add an ANTHROPIC_API_KEY to discover real creators with live web research.</DemoNotice>}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{pipeline.map((p) => <div key={p.status} className="rounded-lg border bg-card p-3 text-center"><p className="text-xl font-semibold">{p.count}</p><p className="text-xs capitalize text-muted-foreground">{p.status}</p></div>)}</div>
      {!influencers ? null : influencers.length === 0 ? <EmptyState icon={<Users className="h-5 w-5" />} title="No creators yet" description="Click “Find creators” to build a shortlist ranked by fit." /> : (
        <Section title="Pipeline">
          <ul className="divide-y">
            {influencers.map((inf) => (
              <li key={inf._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{inf.name}</p>{inf.profileUrl ? <a href={inf.profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{inf.handle}<ExternalLink className="h-3 w-3" /></a> : <span className="text-sm text-muted-foreground">{inf.handle}</span>}<span className="text-xs capitalize text-muted-foreground">{inf.platform}</span><AiTag usedAi={inf.usedAi} /></div>
                  <p className="text-xs text-muted-foreground">{compact(inf.followers)} followers · {inf.engagementRate}% engagement · fit {inf.fitScore}/100{inf.estimatedRate ? ` · ~${money(inf.estimatedRate, store.currency)}/post` : ""}{inf.contact ? ` · ${inf.contact}` : ""}{inf.lastContactedAt ? ` · contacted ${relativeTime(inf.lastContactedAt)}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={inf.status} onValueChange={(v) => update({ influencerId: inf._id, status: v as (typeof STATUSES)[number] })}><SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select>
                  <LoadingButton size="sm" variant="outline" loading={busy === `gen-${inf._id}`} onClick={() => openOutreach(inf)}><MessageCircle className="h-3.5 w-3.5" /> Outreach</LoadingButton>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove({ influencerId: inf._id })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Outreach to {selected?.name} <span className="text-muted-foreground">{selected?.handle}</span></DialogTitle></DialogHeader>
          {busy?.startsWith("gen-") ? <p className="text-sm text-muted-foreground">Writing a personalised message…</p> : <Textarea rows={12} value={draft} onChange={(e) => setDraft(e.target.value)} />}
          {selected?.followUpMessage && <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">Follow-up message</summary><p className="mt-2 whitespace-pre-wrap rounded bg-muted/50 p-3">{selected.followUpMessage}</p></details>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(draft).then(() => toast.success("Copied"))}><Copy className="h-4 w-4" /> Copy</Button>
            <LoadingButton variant="outline" loading={busy === `gen-${selected?._id}`} onClick={async () => { if (!selected) return; setBusy(`gen-${selected._id}`); try { const r = await outreach({ influencerId: selected._id }); setDraft(r.outreachMessage); } finally { setBusy(null); } }}><Sparkles className="h-4 w-4" /> Regenerate</LoadingButton>
            <LoadingButton loading={busy === "send"} onClick={doSend}><Send className="h-4 w-4" /> {selected?.contact?.includes("@") && !selected.contact.startsWith("@") ? "Send email" : "Mark contacted"}</LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
