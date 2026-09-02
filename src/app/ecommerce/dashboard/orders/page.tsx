"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import { ShoppingCart, Zap, FlaskConical, AlertTriangle, Truck, Clock, DollarSign } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, StatCard, StatusBadge, EmptyState, LoadingButton } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, relativeTime, humanize } from "@/lib/ecommerce/format";

const FILTERS = ["all", "unfulfilled", "on_hold", "sent_to_fulfillment", "shipped", "delivered", "cancelled"] as const;

export default function OrdersPage() {
  const store = useCurrentStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const orders = useQuery(api.ecommerce.orders.list, { storeId: store._id, fulfillmentStatus: filter === "all" ? undefined : filter });
  const overview = useQuery(api.ecommerce.orders.ordersOverview, { storeId: store._id });
  const connectors = useQuery(api.ecommerce.connectors.list, { storeId: store._id });
  const runAutomation = useAction(api.ecommerce.orderActions.runAutomation);
  const simulate = useAction(api.ecommerce.orderActions.simulateIncomingOrder);
  const [busy, setBusy] = useState<string | null>(null);
  const fulfillmentConnected = connectors?.some((c) => c.provider === "fulfillment" && c.status === "connected");

  const run = async () => {
    setBusy("run");
    try {
      const r = await runAutomation({ storeId: store._id });
      toast.success(`${r.confirmed} confirmed · ${r.fulfilled} sent to fulfilment · ${r.shipped} shipped · ${r.trackingUpdates} tracking update(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Automation failed");
    } finally {
      setBusy(null);
    }
  };
  const sim = async () => {
    setBusy("sim");
    try {
      await simulate({ storeId: store._id });
      toast.success("Incoming order received – the autopilot will confirm and fulfil it");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not simulate");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 4" title="Orders" description="Incoming orders from your storefront, Shopify or webhooks are confirmed, risk-checked, sent to fulfilment and tracked automatically." actions={
        <>
          <LoadingButton variant="outline" loading={busy === "sim"} onClick={sim}><FlaskConical className="h-4 w-4" /> Simulate incoming order</LoadingButton>
          <LoadingButton loading={busy === "run"} onClick={run}><Zap className="h-4 w-4" /> Run automation now</LoadingButton>
        </>
      } />
      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Revenue" value={money(overview.revenue, store.currency)} icon={<DollarSign className="h-4 w-4" />} hint={`${overview.total} orders`} />
          <StatCard label="Awaiting fulfilment" value={overview.counts.unfulfilled ?? 0} icon={<Clock className="h-4 w-4" />} hint={store.automation.autoFulfill ? "Auto-fulfilled every 15 min" : "Auto-fulfil is off"} tone={(overview.counts.unfulfilled ?? 0) > 0 ? "warn" : "default"} />
          <StatCard label="On hold (review)" value={overview.needsAttention} icon={<AlertTriangle className="h-4 w-4" />} hint={`Risk hold above ${money(store.automation.riskHoldAmount, store.currency)}`} tone={overview.needsAttention > 0 ? "bad" : "default"} />
          <StatCard label="In fulfilment / transit" value={(overview.counts.sent_to_fulfillment ?? 0) + (overview.counts.in_production ?? 0) + (overview.counts.shipped ?? 0)} icon={<Truck className="h-4 w-4" />} hint={`${overview.counts.delivered ?? 0} delivered · ${overview.awaitingPayment} awaiting payment`} />
        </div>
      )}
      {!fulfillmentConnected && <p className="text-sm text-muted-foreground">No fulfilment partner connected – orders go to a <strong>simulated</strong> partner that ships ~20 minutes after hand-off. <Link href="/ecommerce/dashboard/settings?tab=integrations" className="text-primary underline">Connect a 3PL or Printful</Link>.</p>}
      <div className="flex flex-wrap gap-2">{FILTERS.map((f) => <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f === "all" ? "All" : humanize(f)}</Button>)}</div>
      {!orders ? <p className="text-sm text-muted-foreground">Loading…</p> : orders.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="h-5 w-5" />} title="No orders here" description="Orders arrive from the storefront checkout, Shopify webhooks or the inbound order webhook. Use “Simulate incoming order” to see the automation in action." />
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Fulfilment</TableHead><TableHead>Source</TableHead><TableHead>Received</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o._id} className={o.fulfillmentStatus === "on_hold" ? "bg-amber-50/40" : ""}>
                  <TableCell><Link href={`/ecommerce/dashboard/orders/${o._id}`} className="font-medium hover:underline">{o.orderNumber}</Link>{o.riskFlags.length > 0 && <p className="text-xs text-amber-700">{o.riskFlags[0]}</p>}</TableCell>
                  <TableCell><p>{o.customer.name}</p><p className="text-xs text-muted-foreground">{o.shippingAddress.city}, {o.shippingAddress.country}</p></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.items.reduce((s, i) => s + i.quantity, 0)} · {o.items[0]?.title}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""}</TableCell>
                  <TableCell className="font-medium">{money(o.total, o.currency)}</TableCell>
                  <TableCell><StatusBadge status={o.paymentStatus} /></TableCell>
                  <TableCell><StatusBadge status={o.fulfillmentStatus} /></TableCell>
                  <TableCell className="text-xs capitalize text-muted-foreground">{o.source}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{relativeTime(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
