"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Package, Plus, Sparkles, Upload, Wand2 } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, StatusBadge, EmptyState, LoadingButton, ProductImage, AiTag } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, relativeTime } from "@/lib/ecommerce/format";

export default function ProductsPage() {
  const store = useCurrentStore();
  const router = useRouter();
  const products = useQuery(api.ecommerce.products.list, { storeId: store._id });
  const connectors = useQuery(api.ecommerce.connectors.list, { storeId: store._id });
  const create = useMutation(api.ecommerce.products.create);
  const generateAll = useAction(api.ecommerce.productActions.generateAll);
  const pushShopify = useAction(api.ecommerce.productActions.pushToShopify);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: store.niche, cost: "", price: "" });
  const [creating, setCreating] = useState(false);
  const [building, setBuilding] = useState<Id<"ecProducts"> | "all" | null>(null);
  const [pushing, setPushing] = useState(false);
  const shopifyConnected = connectors?.some((c) => c.provider === "shopify" && c.status === "connected");

  const submit = async () => {
    if (!form.title.trim() || !form.cost) return toast.error("Title and cost are required");
    setCreating(true);
    try {
      const id = await create({ storeId: store._id, title: form.title, category: form.category || store.niche, cost: Number(form.cost), price: form.price ? Number(form.price) : undefined });
      setOpen(false);
      setForm({ title: "", category: store.niche, cost: "", price: "" });
      router.push(`/ecommerce/dashboard/store/products/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create product");
    } finally {
      setCreating(false);
    }
  };

  const buildOne = async (id: Id<"ecProducts">) => {
    setBuilding(id);
    try {
      const res = await generateAll({ productId: id, publish: true });
      toast.success(`Product page built and published (SEO ${res.seoScore}/100)${res.usedAi ? "" : " – demo templates"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setBuilding(null);
    }
  };

  const buildAllDrafts = async () => {
    const drafts = (products ?? []).filter((p) => p.status === "draft" && !p.generation?.description);
    if (drafts.length === 0) return toast.message("No unbuilt drafts");
    setBuilding("all");
    try {
      for (const d of drafts) await generateAll({ productId: d._id, publish: true });
      toast.success(`${drafts.length} product page(s) built and published`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setBuilding(null);
    }
  };

  const push = async () => {
    setPushing(true);
    try {
      const res = await pushShopify({ storeId: store._id });
      toast[res.errors.length ? "warning" : "success"](`${res.pushed} product(s) and ${res.collectionsPushed} collection(s) synced to Shopify${res.errors.length ? ` · ${res.errors.length} error(s)` : ""}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Shopify sync failed");
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pillar 2"
        title="Products"
        description="Every product gets AI-written copy, generated images, margin-based pricing and SEO. Publish to the built-in storefront or sync to Shopify."
        actions={
          <>
            <LoadingButton variant="outline" onClick={buildAllDrafts} loading={building === "all"}><Wand2 className="h-4 w-4" /> Build all drafts</LoadingButton>
            {shopifyConnected ? (
              <LoadingButton variant="outline" onClick={push} loading={pushing}><Upload className="h-4 w-4" /> Sync to Shopify</LoadingButton>
            ) : (
              <Button variant="outline" asChild><Link href="/ecommerce/dashboard/settings?tab=integrations"><Upload className="h-4 w-4" /> Connect Shopify</Link></Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add product</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New product</DialogTitle>
                  <DialogDescription>Just the basics – the autopilot generates everything else.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Foldable Bamboo Laptop Stand" /></div>
                  <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Landed cost ({store.currency})</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="9.80" /></div>
                    <div className="space-y-1.5"><Label>Price (optional)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="auto" /></div>
                  </div>
                </div>
                <DialogFooter><LoadingButton onClick={submit} loading={creating}>Create draft</LoadingButton></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {!products ? <p className="text-sm text-muted-foreground">Loading…</p> : products.length === 0 ? (
        <EmptyState icon={<Package className="h-5 w-5" />} title="No products yet" description="Launch an idea from the research board or add a product manually. Then click “Build” to generate the full page." action={<Button asChild variant="outline"><Link href="/ecommerce/dashboard/research">Go to idea board</Link></Button>} />
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price / cost</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const g = p.generation;
                const done = [g?.description, g?.images, g?.pricing, g?.seo].filter(Boolean).length;
                return (
                  <TableRow key={p._id}>
                    <TableCell>
                      <Link href={`/ecommerce/dashboard/store/products/${p._id}`} className="flex items-center gap-3 hover:underline">
                        <ProductImage src={p.images[0]?.url} alt={p.title} className="h-12 w-12 rounded-md border" />
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.category} · {p.sku} · updated {relativeTime(p.updatedAt)}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell><p className="font-medium">{money(p.price, store.currency)}</p><p className="text-xs text-muted-foreground">cost {money(p.cost, store.currency)} · {p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0}%</p></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-2 w-4 rounded-sm ${i < done ? "bg-primary" : "bg-muted"}`} />)}</div>
                        <span className="text-xs text-muted-foreground">{done}/4</span>
                        {done > 0 && <AiTag usedAi={Boolean(g?.usedAi)} className="hidden xl:inline-flex" />}
                      </div>
                    </TableCell>
                    <TableCell>{p.inventory}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {done < 4 && <LoadingButton size="sm" loading={building === p._id} onClick={() => buildOne(p._id)}><Sparkles className="h-3.5 w-3.5" /> Build</LoadingButton>}
                        <Button size="sm" variant="outline" asChild><Link href={`/ecommerce/dashboard/store/products/${p._id}`}>Open</Link></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
