"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Mail, MessageSquare, Sparkles, Send, Trash2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, StatusBadge, EmptyState, LoadingButton, AiTag } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRIGGER_LABELS, relativeTime } from "@/lib/ecommerce/format";

type Trigger = keyof typeof TRIGGER_LABELS;

export default function MessagingPage() {
  const store = useCurrentStore();
  const flows = useQuery(api.ecommerce.marketing.listFlows, { storeId: store._id });
  const logs = useQuery(api.ecommerce.marketing.listMessageLogs, { storeId: store._id, limit: 30 });
  const connectors = useQuery(api.ecommerce.connectors.list, { storeId: store._id });
  const generate = useAction(api.ecommerce.marketingActions.generateFlow);
  const sendTest = useAction(api.ecommerce.marketingActions.sendTestMessage);
  const setStatus = useMutation(api.ecommerce.marketing.setFlowStatus);
  const remove = useMutation(api.ecommerce.marketing.deleteFlow);
  const [trigger, setTrigger] = useState<Trigger>("abandoned_cart");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [busy, setBusy] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const emailConnected = connectors?.some((c) => c.provider === "email" && c.status === "connected");
  const smsConnected = connectors?.some((c) => c.provider === "sms" && c.status === "connected");

  const gen = async () => {
    setBusy("gen");
    try {
      const res = await generate({ storeId: store._id, trigger: trigger as Parameters<typeof generate>[0]["trigger"], channel });
      toast.success(`${TRIGGER_LABELS[trigger]} ${channel} flow ready${res.usedAi ? "" : " (demo template)"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 3" title="Email & SMS" description="Transactional and lifecycle flows. Order automation triggers confirmations, tracking and delivery messages from these templates." />
      {!(emailConnected || smsConnected) && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">No email or SMS provider connected – messages are recorded as <strong>simulated</strong>. Connect Resend/SMTP or Twilio in Settings → Integrations to send for real.</div>}
      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Generate a flow" description="Pick a trigger; the autopilot writes the sequence.">
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Trigger</Label><Select value={trigger} onValueChange={(v) => setTrigger(v as Trigger)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TRIGGER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Channel</Label><div className="grid grid-cols-2 gap-2">{(["email", "sms"] as const).map((c) => <button key={c} onClick={() => setChannel(c)} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm ${channel === c ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>{c === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />} {c.toUpperCase()}</button>)}</div></div>
            <LoadingButton onClick={gen} loading={busy === "gen"} className="w-full"><Sparkles className="h-4 w-4" /> Generate flow</LoadingButton>
            <div className="space-y-1.5 pt-2"><Label>Send test to</Label><Input placeholder={channel === "email" ? "you@example.com" : "+15551234567"} value={testTo} onChange={(e) => setTestTo(e.target.value)} /></div>
          </div>
        </Section>
        <div className="space-y-4 lg:col-span-2">
          {!flows ? null : flows.length === 0 ? <EmptyState icon={<Mail className="h-5 w-5" />} title="No flows yet" /> : flows.map((f) => (
            <article key={f._id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">{f.channel === "email" ? <Mail className="h-4 w-4 text-primary" /> : <MessageSquare className="h-4 w-4 text-primary" />}<h3 className="font-semibold">{f.name}</h3><StatusBadge status={f.status} /><span className="text-xs text-muted-foreground">{TRIGGER_LABELS[f.trigger]} · {f.steps.length} step(s) · {f.stats.sent} sent</span></div>
                <div className="flex items-center gap-2">
                  <AiTag usedAi={f.usedAi} />
                  <Switch checked={f.status === "active"} onCheckedChange={(on) => setStatus({ flowId: f._id, status: on ? "active" : "paused" })} />
                  <LoadingButton size="sm" variant="outline" loading={busy === f._id} disabled={!testTo} onClick={async () => { setBusy(f._id); try { const s = await sendTest({ flowId: f._id, to: testTo }); toast.success(`Test message ${s}`); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setBusy(null); } }}><Send className="h-3.5 w-3.5" /> Test</LoadingButton>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove({ flowId: f._id })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <ol className="mt-4 space-y-2">
                {f.steps.map((s, i) => (
                  <li key={i} className="rounded-lg bg-muted/50 p-3 text-sm"><p className="text-xs font-medium text-muted-foreground">Step {i + 1} · {s.delayHours === 0 ? "immediately" : `after ${s.delayHours}h`}</p>{s.subject && <p className="mt-1 font-semibold">{s.subject}</p>}<p className="mt-1 whitespace-pre-wrap text-muted-foreground">{s.body}</p></li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
      <Section title="Message log" description="Everything sent (or simulated) to customers.">
        {!logs?.length ? <p className="text-sm text-muted-foreground">No messages yet – they appear here when orders flow through the automation.</p> : (
          <ul className="divide-y text-sm">
            {logs.map((l) => <li key={l._id} className="flex flex-wrap items-center justify-between gap-2 py-2"><div><span className="font-medium">{l.to}</span> <span className="text-muted-foreground">· {l.subject ?? l.body.slice(0, 60)}</span></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><StatusBadge status={l.status} /> {l.provider} · {relativeTime(l.createdAt)}</div></li>)}
          </ul>
        )}
      </Section>
    </div>
  );
}
