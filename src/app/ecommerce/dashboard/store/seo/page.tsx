"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Globe, Wand2, Save } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, StatCard, LoadingButton, EmptyState } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SeoPage() {
  const store = useCurrentStore();
  const data = useQuery(api.ecommerce.products.seoOverview, { storeId: store._id });
  const fix = useAction(api.ecommerce.productActions.fixSeo);
  const updateStore = useMutation(api.ecommerce.stores.update);
  const [loading, setLoading] = useState(false);
  const [seo, setSeo] = useState<{ title: string; description: string; keywords: string } | null>(null);
  const current = seo ?? { title: store.seo?.title ?? "", description: store.seo?.description ?? "", keywords: (store.seo?.keywords ?? []).join(", ") };

  const runFix = async () => {
    setLoading(true);
    try {
      const res = await fix({ storeId: store._id });
      toast.success(`${res.fixed} product(s) rewritten for SEO`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 2" title="SEO manager" description="On-page scoring for every product with one-click fixes, plus store-level metadata for the storefront." actions={<LoadingButton onClick={runFix} loading={loading}><Wand2 className="h-4 w-4" /> Fix everything under 70</LoadingButton>} />
      {!data ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Average SEO score" value={`${data.averageScore}/100`} tone={data.averageScore >= 80 ? "good" : data.averageScore >= 60 ? "warn" : "bad"} icon={<Globe className="h-4 w-4" />} />
            <StatCard label="Products needing work" value={data.needsWork} hint="Score below 70" tone={data.needsWork ? "warn" : "good"} />
            <StatCard label="Products audited" value={data.products.length} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Section title="Product pages" className="lg:col-span-2">
              {data.products.length === 0 ? <EmptyState title="No products to audit" description="Add products first." /> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="w-40">Score</TableHead><TableHead>Issues</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.products.sort((a, b) => a.seo.score - b.seo.score).map((p) => (
                        <TableRow key={p._id}>
                          <TableCell><Link href={`/ecommerce/dashboard/store/products/${p._id}`} className="font-medium hover:underline">{p.title}</Link><p className="text-xs text-muted-foreground truncate max-w-xs">{p.seo.title}</p></TableCell>
                          <TableCell><div className="flex items-center gap-2"><Progress value={p.seo.score} className="h-2" /><span className="text-sm font-medium w-8">{p.seo.score}</span></div></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{p.seo.issues.length ? p.seo.issues.join(" · ") : <span className="text-emerald-700">All checks pass</span>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Section>
            <Section title="Storefront metadata" description="Used on the storefront home page.">
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Title</Label><Input value={current.title} onChange={(e) => setSeo({ ...current, title: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={current.description} onChange={(e) => setSeo({ ...current, description: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Keywords</Label><Input value={current.keywords} onChange={(e) => setSeo({ ...current, keywords: e.target.value })} /></div>
                <Button size="sm" disabled={!seo} onClick={async () => { await updateStore({ storeId: store._id, seo: { title: current.title, description: current.description, keywords: current.keywords.split(",").map((k) => k.trim()).filter(Boolean) } }); setSeo(null); toast.success("Store SEO saved"); }}><Save className="h-4 w-4" /> Save</Button>
              </div>
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
