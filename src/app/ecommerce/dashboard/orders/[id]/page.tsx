"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { ArrowLeft, PackageCheck, Send, Ban, RefreshCw, ShieldAlert, ShieldCheck, Truck, Bot, User, CreditCard, ExternalLink } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { PageHeader, Section, StatusBadge, LoadingButton, KeyValue, ProductImage } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { money, formatDate, humanize } from "@/lib/ecommerce/format";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id as Id<"ecOrders">;
  const order = useQuery(api.ecommerce.orders.get, { orderId });
  const sendToFulfillment = useAction(api.ecommerce.orderActions.sendToFulfillment);
  const cancel = useAction(api.ecommerce.orderActions.cancelOrder);
  const resend = useAction(api.ecommerce.orderActions.resendTracking);
  const refresh = useAction(api.ecommerce.orderActions.refreshTracking);
  const markPaid = useMutation(api.ecommerce.orders.markPaid);
  const setHold = useMutation(api.ecommerce.orders.setHold);
  const addNote = useMutation(api.ecommerce.orders.addNote);
  const addTracking = useMutation(api.ecommerce.orders.addTracking);
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelForm, setCancelForm] = useState({ reason: "Customer request", refund: true });
  const [tracking, setTracking] = useState({ carrier: "UPS", number: "" });
  const [note, setNote] = useState("");

  if (order === undefined) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (order === null) return <p>Order not found.</p>;

  const run = async (key: string, fn: () => Promise<unknown>, msg: string) => {
    setBusy(key);
    try { await fn(); toast.success(msg); } catch (error) { toast.error(error instanceof Error ? error.message : "Failed"); } finally { setBusy(null); }
  };
  const canFulfil = order.paymentStatus === "paid" && ["unfulfilled", "on_hold"].includes(order.fulfillmentStatus);
  const canCancel = !["cancelled", "shipped", "delivered", "returned"].includes(order.fulfillmentStatus);
  const shipment = order.shipments[order.shipments.length - 1];

  return (
    <div className="space-y-6">
      <Link href="/ecommerce/dashboard/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Orders</Link>
      <PageHeader title={`Order ${order.orderNumber}`} description={`${formatDate(order.createdAt, true)} · via ${order.source}${order.externalId ? ` · ${order.externalId}` : ""}`} actions={
        <>
          <StatusBadge status={order.paymentStatus} />
          <StatusBadge status={order.fulfillmentStatus} />
          {order.paymentStatus === "pending" && <LoadingButton variant="outline" loading={busy === "paid"} onClick={() => run("paid", () => markPaid({ orderId }), "Payment recorded")}><CreditCard className="h-4 w-4" /> Mark paid</LoadingButton>}
          {canFulfil && <LoadingButton loading={busy === "fulfil"} onClick={() => run("fulfil", () => sendToFulfillment({ orderId }), "Sent to fulfilment")}><PackageCheck className="h-4 w-4" /> Send to fulfilment</LoadingButton>}
          {shipment && <LoadingButton variant="outline" loading={busy === "resend"} onClick={() => run("resend", () => resend({ orderId }), "Tracking sent to customer")}><Send className="h-4 w-4" /> Resend tracking</LoadingButton>}
          {canCancel && (
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="text-red-600"><Ban className="h-4 w-4" /> Cancel order</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Cancel {order.orderNumber}</DialogTitle><DialogDescription>We&apos;ll notify the fulfilment partner, restock inventory, refund if requested and message the customer.</DialogDescription></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Reason</Label><Input value={cancelForm.reason} onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })} /></div>
                  {order.paymentStatus === "paid" && <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Refund {money(order.total, order.currency)}</p><p className="text-xs text-muted-foreground">Via Stripe when a payment reference exists, otherwise recorded manually.</p></div><Switch checked={cancelForm.refund} onCheckedChange={(v) => setCancelForm({ ...cancelForm, refund: v })} /></div>}
                </div>
                <DialogFooter><LoadingButton variant="destructive" loading={busy === "cancel"} onClick={() => run("cancel", () => cancel({ orderId, reason: cancelForm.reason, refund: cancelForm.refund }), "Order cancelled")}>Confirm cancellation</LoadingButton></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      } />

      {order.fulfillmentStatus === "on_hold" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-2"><ShieldAlert className="mt-0.5 h-4 w-4" /><div><p className="font-medium">Held for review (risk score {order.riskScore})</p><ul className="list-disc pl-4">{order.riskFlags.map((f) => <li key={f}>{f}</li>)}</ul></div></div>
          <LoadingButton size="sm" loading={busy === "release"} onClick={() => run("release", () => setHold({ orderId, hold: false, reason: "Reviewed and approved" }), "Released – will be fulfilled on the next automation pass")}><ShieldCheck className="h-4 w-4" /> Approve & release</LoadingButton>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Items">
            <ul className="divide-y">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3 py-3 text-sm"><ProductImage src={i.imageUrl} alt={i.title} className="h-12 w-12 rounded border" /><div className="flex-1"><p className="font-medium">{i.title}</p><p className="text-xs text-muted-foreground">{i.sku}{i.variant ? ` · ${i.variant}` : ""} · qty {i.quantity}</p></div><span className="font-medium">{money(i.unitPrice * i.quantity, order.currency)}</span></li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t pt-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(order.subtotal, order.currency)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{money(order.shipping, order.currency)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{money(order.tax, order.currency)}</span></div><div className="flex justify-between font-semibold"><span>Total</span><span>{money(order.total, order.currency)}</span></div></div>
          </Section>

          <Section title="Shipments" description="Tracked automatically every 30 minutes." actions={!shipment && ["sent_to_fulfillment", "in_production", "unfulfilled"].includes(order.fulfillmentStatus) ? (
            <Dialog>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Truck className="h-4 w-4" /> Add tracking</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add tracking number</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Carrier</Label><Input value={tracking.carrier} onChange={(e) => setTracking({ ...tracking, carrier: e.target.value })} /></div><div className="space-y-1.5"><Label>Tracking number</Label><Input value={tracking.number} onChange={(e) => setTracking({ ...tracking, number: e.target.value })} /></div></div>
                <DialogFooter><LoadingButton loading={busy === "track"} onClick={() => run("track", () => addTracking({ orderId, carrier: tracking.carrier, trackingNumber: tracking.number }), "Shipment added")}>Save</LoadingButton></DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}>
            {order.shipments.length === 0 ? <p className="text-sm text-muted-foreground">No shipment yet.</p> : order.shipments.map((s) => (
              <div key={s._id} className="rounded-lg border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><span className="font-medium">{s.carrier} {s.trackingNumber}</span><StatusBadge status={s.status} />{s.provider === "simulated" && <StatusBadge status="simulated" />}</div><div className="flex items-center gap-2">{s.trackingUrl && <Button size="sm" variant="ghost" asChild><a href={s.trackingUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Carrier site</a></Button>}<LoadingButton size="sm" variant="outline" loading={busy === s._id} onClick={() => run(s._id, () => refresh({ shipmentId: s._id }), "Tracking refreshed")}><RefreshCw className="h-4 w-4" /></LoadingButton></div></div>
                {s.estimatedDelivery && <p className="mt-1 text-xs text-muted-foreground">Estimated delivery {formatDate(s.estimatedDelivery)} · customer notified: {s.notifiedStatuses.join(", ") || "not yet"}</p>}
                <ol className="mt-3 space-y-2 border-l pl-4">{[...s.events].reverse().map((e, i) => <li key={i} className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" /><p className="font-medium">{e.description}</p><p className="text-xs text-muted-foreground">{formatDate(e.at, true)}{e.location ? ` · ${e.location}` : ""}</p></li>)}</ol>
              </div>
            ))}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Customer">
            <KeyValue items={[
              { label: "Name", value: order.customer.name }, { label: "Email", value: order.customer.email }, { label: "Phone", value: order.customer.phone ?? "—" },
              { label: "Ships to", value: `${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, ${order.shippingAddress.city}${order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}` },
              { label: "Payment ref", value: order.paymentReference ?? "—" }, { label: "Fulfilment", value: order.fulfillmentProvider ? `${order.fulfillmentProvider} · ${order.fulfillmentExternalId}` : "—" },
            ]} />
            {order.customerNote && <p className="mt-3 rounded bg-muted/50 p-2 text-sm"><span className="font-medium">Customer note:</span> {order.customerNote}</p>}
            <div className="mt-3 space-y-2"><Textarea rows={2} placeholder="Internal note…" value={note || order.internalNote || ""} onChange={(e) => setNote(e.target.value)} /><Button size="sm" variant="outline" disabled={!note} onClick={() => run("note", () => addNote({ orderId, note }), "Note saved")}>Save note</Button></div>
          </Section>
          <Section title="Timeline">
            <ol className="space-y-3">
              {[...order.timeline].reverse().map((t, i) => (
                <li key={i} className="flex gap-2 text-sm"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${t.actor === "automation" || t.actor === "system" ? "bg-primary/10 text-primary" : "bg-muted"}`}>{t.actor === "automation" || t.actor === "system" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}</span><div><p className="font-medium">{t.event}</p>{t.detail && <p className="text-muted-foreground">{t.detail}</p>}<p className="text-xs text-muted-foreground">{formatDate(t.at, true)} · {humanize(t.actor)}</p></div></li>
              ))}
            </ol>
          </Section>
          <Section title="Messages">
            {order.messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages sent yet.</p> : <ul className="space-y-2 text-sm">{order.messages.map((m) => <li key={m._id} className="rounded bg-muted/50 p-2"><div className="flex items-center justify-between"><span className="font-medium">{m.subject ?? m.channel.toUpperCase()}</span><StatusBadge status={m.status} /></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.body}</p></li>)}</ul>}
          </Section>
        </div>
      </div>
    </div>
  );
}
