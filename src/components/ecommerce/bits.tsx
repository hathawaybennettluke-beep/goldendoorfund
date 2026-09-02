"use client";

import type { ReactNode, ComponentProps } from "react";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { humanize } from "@/lib/ecommerce/format";

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Section({ title, description, actions, children, className }: { title: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, icon, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: "default" | "good" | "warn" | "bad" }) {
  const tones = { default: "text-foreground", good: "text-emerald-600", warn: "text-amber-600", bad: "text-red-600" };
  return (
    <Card className="shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <p className={cn("mt-2 text-2xl font-semibold tracking-tight", tones[tone])}>{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  connected: "bg-emerald-100 text-emerald-800 border-emerald-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sent: "bg-emerald-100 text-emerald-800 border-emerald-200",
  agreed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  posted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  viable: "bg-emerald-100 text-emerald-800 border-emerald-200",
  launched: "bg-emerald-100 text-emerald-800 border-emerald-200",
  shipped: "bg-sky-100 text-sky-800 border-sky-200",
  in_transit: "bg-sky-100 text-sky-800 border-sky-200",
  out_for_delivery: "bg-sky-100 text-sky-800 border-sky-200",
  sent_to_fulfillment: "bg-sky-100 text-sky-800 border-sky-200",
  in_production: "bg-sky-100 text-sky-800 border-sky-200",
  contacted: "bg-sky-100 text-sky-800 border-sky-200",
  negotiating: "bg-sky-100 text-sky-800 border-sky-200",
  shortlisted: "bg-sky-100 text-sky-800 border-sky-200",
  scheduled: "bg-sky-100 text-sky-800 border-sky-200",
  running: "bg-sky-100 text-sky-800 border-sky-200",
  info: "bg-sky-100 text-sky-800 border-sky-200",
  simulated: "bg-violet-100 text-violet-800 border-violet-200",
  on_hold: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paused: "bg-amber-100 text-amber-800 border-amber-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  marginal: "bg-amber-100 text-amber-800 border-amber-200",
  label_created: "bg-amber-100 text-amber-800 border-amber-200",
  unfulfilled: "bg-amber-100 text-amber-800 border-amber-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  setup: "bg-amber-100 text-amber-800 border-amber-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  error: "bg-red-100 text-red-800 border-red-200",
  exception: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-red-100 text-red-800 border-red-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  declined: "bg-red-100 text-red-800 border-red-200",
  returned: "bg-red-100 text-red-800 border-red-200",
  weak: "bg-red-100 text-red-800 border-red-200",
  high: "bg-red-100 text-red-800 border-red-200",
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", STATUS_STYLES[status] ?? "bg-muted text-foreground", className)}>
      {humanize(status)}
    </Badge>
  );
}

export function AiTag({ usedAi, className }: { usedAi: boolean; className?: string }) {
  return usedAi ? (
    <Badge variant="outline" className={cn("gap-1 border-primary/40 bg-primary/10 text-primary", className)}>
      <Sparkles className="h-3 w-3" /> AI generated
    </Badge>
  ) : (
    <Badge variant="outline" className={cn("gap-1 text-muted-foreground", className)}>
      <FileText className="h-3 w-3" /> Template (demo mode)
    </Badge>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div>}
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingButton({ loading, children, disabled, ...props }: ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function ProductImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  if (!src) {
    return <div className={cn("flex items-center justify-center bg-muted text-muted-foreground text-xs", className)}>No image</div>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={cn("object-cover", className)} loading="lazy" />;
}

export function KeyValue({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-muted/50 px-3 py-2">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="text-sm font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">{children}</div>;
}
