"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { Package, Truck, CheckCircle2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { ProductImage, StatusBadge } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money, formatDate } from "@/lib/ecommerce/format";

export default function TrackPage() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const [form, setForm] = useState({ order: params.get("order") ?? "", email: params.get("email") ?? "" });
  const [query, setQuery] = useState<{ orderNumber: string; email: string } | null>(form.order && form.email ? { orderNumber: form.order, email: form.email } : null);
  const result = useQuery(api.ecommerce.storefront.getOrderStatus, query ? { slug, ...query } : "skip");
  const justPlaced = params.get("test") === "1" || params.get("paid") === "1";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {justPlaced && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><CheckCircle2 className="mt-0.5 h-5 w-5" /><div><p className="font-semibold">Thank you – your order is in!</p><p className="text-sm">{params.get("test") === "1" ? "Recorded in test mode (no payment processor configured). " : "Payment received. "}You&apos;ll get an email as soon as it ships. Bookmark this page to track it.</p></div></div>}
      <div>
        <h1 className="text-2xl font-bold">Track your order</h1>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); setQuery({ orderNumber: form.order.startsWith("#") ? form.order : `#${form.order}`, email: form.email }); }}>
          <div className="space-y-1.5"><Label>Order number</Label><Input placeholder="#1001" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <Button type="submit">Find order</Button>
        </form>
      </div>
      {query && result === null && <p className="text-sm text-muted-foreground">We couldn&apos;t find that order. Check the number and the email used at checkout.</p>}
      {result && (
        <div className="space-y-6 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm text-muted-foreground">{result.storeName} · {formatDate(result.createdAt)}</p><h2 className="text-xl font-semibold">Order {result.orderNumber}</h2></div><div className="flex gap-2"><StatusBadge status={result.paymentStatus} /><StatusBadge status={result.fulfillmentStatus} /></div></div>
          <ul className="divide-y">{result.items.map((i, idx) => <li key={idx} className="flex items-center gap-3 py-2 text-sm"><ProductImage src={i.imageUrl} alt={i.title} className="h-12 w-12 rounded border" /><span className="flex-1">{i.quantity} × {i.title}</span><span>{money(i.unitPrice * i.quantity, result.currency)}</span></li>)}</ul>
          <p className="text-right font-semibold">Total {money(result.total, result.currency)}</p>
          {result.shipments.length === 0 ? <p className="flex items-center gap-2 rounded-xl bg-neutral-50 p-4 text-sm"><Package className="h-4 w-4" /> Your order is being prepared. Tracking details will appear here as soon as it ships.</p> : result.shipments.map((s) => (
            <div key={s.trackingNumber} className="rounded-xl bg-neutral-50 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 font-medium"><Truck className="h-4 w-4" /> {s.carrier} · {s.trackingNumber}</span><StatusBadge status={s.status} /></div>
              {s.estimatedDelivery && <p className="mt-1 text-muted-foreground">Estimated delivery {formatDate(s.estimatedDelivery)}</p>}
              {s.trackingUrl && <a href={s.trackingUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block underline">Track on carrier site</a>}
              <ol className="mt-3 space-y-2 border-l pl-4">{[...s.events].reverse().map((e, i) => <li key={i} className="relative"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-neutral-900" /><p className="font-medium">{e.description}</p><p className="text-xs text-muted-foreground">{formatDate(e.at, true)}{e.location ? ` · ${e.location}` : ""}</p></li>)}</ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
