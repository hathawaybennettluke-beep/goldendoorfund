"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import { Truck, RefreshCw, ExternalLink } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, StatusBadge, EmptyState, LoadingButton, StatCard } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, relativeTime } from "@/lib/ecommerce/format";

export default function ShipmentsPage() {
  const store = useCurrentStore();
  const shipments = useQuery(api.ecommerce.orders.listShipments, { storeId: store._id });
  const runAutomation = useAction(api.ecommerce.orderActions.runAutomation);
  const refresh = useAction(api.ecommerce.orderActions.refreshTracking);
  const [busy, setBusy] = useState<string | null>(null);
  const counts = (shipments ?? []).reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }), {});

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 4" title="Shipments" description="Every parcel, its carrier status and whether the customer has been notified." actions={<LoadingButton loading={busy === "all"} onClick={async () => { setBusy("all"); try { const r = await runAutomation({ storeId: store._id }); toast.success(`${r.trackingUpdates} tracking update(s)`); } finally { setBusy(null); } }}><RefreshCw className="h-4 w-4" /> Refresh all tracking</LoadingButton>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Label created" value={counts.label_created ?? 0} />
        <StatCard label="In transit" value={(counts.in_transit ?? 0) + (counts.out_for_delivery ?? 0)} />
        <StatCard label="Delivered" value={counts.delivered ?? 0} tone="good" />
        <StatCard label="Exceptions" value={counts.exception ?? 0} tone={(counts.exception ?? 0) > 0 ? "bad" : "default"} />
      </div>
      {!shipments ? null : shipments.length === 0 ? <EmptyState icon={<Truck className="h-5 w-5" />} title="No shipments yet" description="Shipments appear once fulfilment hands over a tracking number." /> : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Carrier / tracking</TableHead><TableHead>Status</TableHead><TableHead>Latest event</TableHead><TableHead>ETA</TableHead><TableHead>Customer notified</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {shipments.map((s) => (
                <TableRow key={s._id}>
                  <TableCell><Link href={`/ecommerce/dashboard/orders/${s.orderId}`} className="font-medium hover:underline">{s.orderNumber}</Link><p className="text-xs text-muted-foreground">{s.customerName}</p></TableCell>
                  <TableCell><p>{s.carrier}</p><a href={s.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">{s.trackingNumber}<ExternalLink className="h-3 w-3" /></a></TableCell>
                  <TableCell><div className="flex gap-1"><StatusBadge status={s.status} />{s.provider === "simulated" && <StatusBadge status="simulated" />}</div></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.events[s.events.length - 1]?.description} · {relativeTime(s.events[s.events.length - 1]?.at)}</TableCell>
                  <TableCell className="text-xs">{formatDate(s.estimatedDelivery)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.notifiedStatuses.length ? s.notifiedStatuses.join(", ") : "—"}</TableCell>
                  <TableCell><Button size="icon" variant="ghost" className="h-8 w-8" disabled={busy === s._id} onClick={async () => { setBusy(s._id); try { await refresh({ shipmentId: s._id }); } finally { setBusy(null); } }}><RefreshCw className={`h-4 w-4 ${busy === s._id ? "animate-spin" : ""}`} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
