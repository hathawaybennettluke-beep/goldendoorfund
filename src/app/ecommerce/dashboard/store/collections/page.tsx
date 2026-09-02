"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Layers, Plus, Sparkles, Trash2, ExternalLink } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, EmptyState, LoadingButton, ProductImage } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CollectionsPage() {
  const store = useCurrentStore();
  const collections = useQuery(api.ecommerce.products.listCollections, { storeId: store._id });
  const products = useQuery(api.ecommerce.products.list, { storeId: store._id });
  const auto = useAction(api.ecommerce.productActions.autoCollections);
  const create = useMutation(api.ecommerce.products.createCollection);
  const update = useMutation(api.ecommerce.products.updateCollection);
  const remove = useMutation(api.ecommerce.products.deleteCollection);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const runAuto = async () => {
    setLoading(true);
    try {
      const res = await auto({ storeId: store._id });
      toast.success(`${res.created} collection(s) created${res.usedAi ? "" : " (demo templates)"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (collectionId: Id<"ecCollections">, current: Id<"ecProducts">[], productId: Id<"ecProducts">) => {
    const next = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId];
    await update({ collectionId, productIds: next });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pillar 2" title="Collections" description="Group products into shoppable collections. The autopilot proposes collections from your catalogue and writes their SEO." actions={
        <>
          <LoadingButton variant="outline" onClick={runAuto} loading={loading}><Sparkles className="h-4 w-4" /> Auto-create collections</LoadingButton>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New collection</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New collection</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={async () => { if (!form.title.trim()) return; await create({ storeId: store._id, title: form.title, description: form.description || undefined }); setOpen(false); setForm({ title: "", description: "" }); }}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      } />
      {!collections || !products ? <p className="text-sm text-muted-foreground">Loading…</p> : collections.length === 0 ? (
        <EmptyState icon={<Layers className="h-5 w-5" />} title="No collections" description="Create collections manually or let the autopilot organise your products." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {collections.map((c) => (
            <article key={c._id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">SEO: {c.seo.title}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" asChild><Link href={`/ecommerce/storefront/${store.slug}?collection=${c.handle}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove({ collectionId: c._id })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">{c.productIds.length} product(s) – click to toggle</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {products.map((p) => {
                  const on = c.productIds.includes(p._id);
                  return (
                    <button key={p._id} onClick={() => toggle(c._id, c.productIds, p._id)} className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs transition-colors ${on ? "border-primary bg-primary/10" : "opacity-60 hover:opacity-100"}`}>
                      <ProductImage src={p.images[0]?.url} alt={p.title} className="h-5 w-5 rounded-full" />{p.title}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
