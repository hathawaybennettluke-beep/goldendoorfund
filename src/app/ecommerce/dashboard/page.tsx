"use client";

import Link from "next/link";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import { DollarSign, ShoppingCart, Megaphone, Package, Truck, Lightbulb, Bot, ArrowRight, Zap, CheckCircle2, Circle, Search, Store as StoreIcon, Users } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, StatCard, Section, StatusBadge, LoadingButton, EmptyState } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { money, relativeTime, compact } from "@/lib/ecommerce/format";
import { cn } from "@/lib/utils";

const BASE = "/ecommerce/dashboard";

export default function OverviewPage() {
  const store = useCurrentStore();
  const data = useQuery(api.ecommerce.stores.overview, { storeId: store._id });
  const runOrders = useAction(api.ecommerce.orderActions.runAutomation);
  const optimize = useAction(api.ecommerce.marketingActions.optimizeCampaigns);
  const [running, setRunning] = useState(false);

  const runEverything = async () => {
    setRunning(true);
    try {
      const [orders, decisions] = await Promise.all([runOrders({ storeId: store._id }), optimize({ storeId: store._id })]);
      toast.success(`Automation run complete: ${orders.fulfilled} order(s) fulfilled, ${orders.shipped} shipped, ${orders.trackingUpdates} tracking update(s), ${decisions.filter((d) => d.action !== "hold").length} campaign change(s).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Automation run failed");
    } finally {
      setRunning(false);
    }
  };

  if (!data) return <div className="text-muted-foreground">Loading…</div>;
  const k = data.kpis;

  const steps = [
    { done: data.pipeline.research, title: "Find products", detail: k.ideas ? `${k.ideas} ideas · ${k.shortlisted} shortlisted` : "Run trend research to discover winners", href: `${BASE}/research`, icon: Search },
    { done: data.pipeline.store, title: "Build the store", detail: k.products ? `${k.activeProducts}/${k.products} products live` : "Generate product pages, images, pricing and SEO", href: `${BASE}/store/products`, icon: StoreIcon },
    { done: data.pipeline.marketing, title: "Launch marketing", detail: k.campaigns ? `${k.activeCampaigns} active campaign(s) · ROAS ${k.roas.toFixed(2)}` : "Create ad campaigns, creatives and email flows", href: `${BASE}/marketing/campaigns`, icon: Megaphone },
    { done: data.pipeline.orders, title: "Automate orders", detail: k.orders ? `${k.orders} orders · ${k.pendingFulfillment} awaiting fulfilment` : "Connect a sales channel or simulate an order", href: `${BASE}/orders`, icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={store.niche}
        title={store.name}
        description="Your ecommerce business on autopilot. Every pillar below runs on schedules in the background; use the button to run a pass right now."
        actions={
          <>
            <StatusBadge status={store.status} />
            <LoadingButton onClick={runEverything} loading={running}>
              <Zap className="h-4 w-4" /> Run automation now
            </LoadingButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (paid orders)" value={money(k.revenue, store.currency)} hint={`${k.paidOrders} paid · AOV ${money(k.avgOrderValue, store.currency)}`} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Gross profit" value={money(k.grossProfit, store.currency)} hint="Revenue minus product cost" icon={<DollarSign className="h-4 w-4" />} tone={k.grossProfit >= 0 ? "good" : "bad"} />
        <StatCard label="Orders" value={k.orders} hint={`${k.ordersLast24h} in last 24h · ${k.pendingFulfillment} to fulfil · ${k.inTransit} in transit`} icon={<ShoppingCart className="h-4 w-4" />} tone={k.pendingFulfillment > 0 ? "warn" : "default"} />
        <StatCard label="Ad ROAS" value={k.adSpend > 0 ? `${k.roas.toFixed(2)}x` : "—"} hint={`${money(k.adSpend, store.currency)} spend → ${money(k.adRevenue, store.currency)} revenue`} icon={<Megaphone className="h-4 w-4" />} tone={k.adSpend === 0 ? "default" : k.roas >= store.automation.minRoas ? "good" : "warn"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Automation pipeline" description="The four pillars, in order." className="lg:col-span-2">
          <ol className="grid gap-3 md:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title}>
                <Link href={s.href} className={cn("group flex h-full items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50", s.done ? "border-emerald-200 bg-emerald-50/40" : "")}>
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", s.done ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary")}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Step {i + 1}</span>
                      {s.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.detail}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-3 text-sm"><span className="text-muted-foreground">Products</span><p className="text-lg font-semibold">{k.products} <span className="text-xs font-normal text-muted-foreground">({k.activeProducts} live)</span></p></div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm"><span className="text-muted-foreground">Influencers in pipeline</span><p className="text-lg font-semibold">{k.influencers}</p></div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm"><span className="text-muted-foreground">Automated actions (recent)</span><p className="text-lg font-semibold">{k.automationActions}</p></div>
          </div>
        </Section>

        <Section title="Automation schedule" description="Runs in the background via Convex cron jobs.">
          <ul className="space-y-3 text-sm">
            {[
              { on: store.automation.autoFulfill, label: "Send paid orders to fulfilment", cadence: "every 15 min" },
              { on: store.automation.autoNotifyTracking, label: "Track shipments & notify customers", cadence: "every 30 min" },
              { on: store.automation.autoOptimizeCampaigns, label: "Optimise ad campaigns", cadence: "every 6 hours" },
              { on: store.automation.autoRefreshTrends, label: "Refresh trend research", cadence: "daily" },
              { on: store.automation.autoHandleCancellations, label: "Handle cancellations & refunds", cadence: "on request" },
            ].map((r) => (
              <li key={r.label} className="flex items-start gap-2">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", r.on ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                <div className="flex-1">
                  <p className={cn(!r.on && "text-muted-foreground line-through")}>{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.cadence}</p>
                </div>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link href={`${BASE}/settings?tab=automation`}>Adjust automation rules</Link>
          </Button>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Recent orders" actions={<Button asChild variant="ghost" size="sm"><Link href={`${BASE}/orders`}>All orders <ArrowRight className="h-4 w-4" /></Link></Button>}>
          {data.recentOrders.length === 0 ? (
            <EmptyState icon={<ShoppingCart className="h-5 w-5" />} title="No orders yet" description="Connect Shopify, use the inbound webhook, or simulate an order to watch the fulfilment automation work." action={<Button asChild size="sm"><Link href={`${BASE}/orders`}>Go to orders</Link></Button>} />
          ) : (
            <ul className="divide-y">
              {data.recentOrders.map((o) => (
                <li key={o._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <Link href={`${BASE}/orders/${o._id}`} className="font-medium hover:underline">{o.orderNumber}</Link>
                    <p className="text-muted-foreground">{o.customer.name} · {relativeTime(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.fulfillmentStatus} />
                    <span className="font-medium">{money(o.total, o.currency)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Activity feed" description="What the autopilot and your team did recently.">
          {data.activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.activity.map((a) => (
                <li key={a._id} className="flex gap-3 text-sm">
                  <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", a.actor === "automation" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    {a.actor === "automation" ? <Bot className="h-3.5 w-3.5" /> : a.area === "research" ? <Lightbulb className="h-3.5 w-3.5" /> : a.area === "store" ? <Package className="h-3.5 w-3.5" /> : a.area === "marketing" ? <Megaphone className="h-3.5 w-3.5" /> : a.area === "orders" ? <Truck className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-snug">{a.action}</p>
                    {a.detail && <p className="text-muted-foreground line-clamp-2">{a.detail}</p>}
                    <p className="text-xs text-muted-foreground">{relativeTime(a.createdAt)} · {a.actor}</p>
                  </div>
                  <StatusBadge status={a.level} className="h-fit" />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
      <p className="text-xs text-muted-foreground">Metrics are computed live from your data. Ad metrics for unconnected channels are simulated ({compact(k.adSpend)} spend) so you can preview the optimisation loop.</p>
    </div>
  );
}
