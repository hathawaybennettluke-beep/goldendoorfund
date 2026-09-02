"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Image as ImageIcon, Tag, Globe, Trash2, ExternalLink, Wand2, Save, Upload } from "lucide-react";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { useCurrentStore } from "@/components/ecommerce/StoreProvider";
import { PageHeader, Section, StatusBadge, LoadingButton, ProductImage, AiTag, KeyValue } from "@/components/ecommerce/bits";
import { Markdown } from "@/components/ecommerce/Markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { money, pct } from "@/lib/ecommerce/format";
import { computeMargin, DEFAULT_MARGIN_ASSUMPTIONS } from "../../../../../../../convex/ecommerce/lib/pricing";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id as Id<"ecProducts">;
  const store = useCurrentStore();
  const router = useRouter();
  const product = useQuery(api.ecommerce.products.get, { productId });
  const update = useMutation(api.ecommerce.products.update);
  const remove = useMutation(api.ecommerce.products.remove);
  const removeImage = useMutation(api.ecommerce.products.removeImage);
  const addImage = useMutation(api.ecommerce.products.addImage);
  const generateUploadUrl = useMutation(api.ecommerce.products.generateUploadUrl);
  const genDescription = useAction(api.ecommerce.productActions.generateDescription);
  const genImages = useAction(api.ecommerce.productActions.generateImages);
  const genPricing = useAction(api.ecommerce.productActions.suggestPricing);
  const genSeo = useAction(api.ecommerce.productActions.generateSeo);
  const genAll = useAction(api.ecommerce.productActions.generateAll);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", category: "", price: "", compareAtPrice: "", cost: "", shippingCost: "", inventory: "", shortDescription: "", description: "", seoTitle: "", seoDescription: "", seoKeywords: "" });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (product && !dirty) {
      setForm({
        title: product.title, category: product.category, price: String(product.price), compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "", cost: String(product.cost), shippingCost: String(product.shippingCost ?? 0), inventory: String(product.inventory),
        shortDescription: product.shortDescription ?? "", description: product.description, seoTitle: product.seo.title, seoDescription: product.seo.description, seoKeywords: product.seo.keywords.join(", "),
      });
    }
  }, [product, dirty]);

  if (product === undefined) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (product === null) return <p>Product not found.</p>;

  const run = async (key: string, fn: () => Promise<unknown>, success: string) => {
    setBusy(key);
    try {
      await fn();
      setDirty(false);
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const save = () =>
    run("save", () => update({
      productId, title: form.title, category: form.category, price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined, cost: Number(form.cost), shippingCost: Number(form.shippingCost || 0), inventory: Number(form.inventory || 0),
      shortDescription: form.shortDescription, description: form.description,
      seo: { ...product.seo, title: form.seoTitle, description: form.seoDescription, keywords: form.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean) },
    }), "Saved");

  const onUpload = async (file: File) => {
    setBusy("upload");
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await res.json();
      await addImage({ productId, storageId, alt: product.title });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  };

  const margin = computeMargin({ price: Number(form.price) || 0, cost: Number(form.cost) || 0, shippingCost: Number(form.shippingCost) || 0, adCostPerOrder: 0, paymentFeePct: DEFAULT_MARGIN_ASSUMPTIONS.paymentFeePct, paymentFeeFixed: DEFAULT_MARGIN_ASSUMPTIONS.paymentFeeFixed, platformFeePct: 0, returnRatePct: DEFAULT_MARGIN_ASSUMPTIONS.returnRatePct, otherCostPerOrder: DEFAULT_MARGIN_ASSUMPTIONS.otherCostPerOrder });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setForm({ ...form, [k]: e.target.value }); setDirty(true); };
  const shopifyUrl = (product.externalIds as { shopifyAdminUrl?: string } | undefined)?.shopifyAdminUrl;

  return (
    <div className="space-y-6">
      <Link href="/ecommerce/dashboard/store/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> Products</Link>
      <PageHeader
        title={product.title}
        description={`${product.category} · ${product.sku}`}
        actions={
          <>
            <StatusBadge status={product.status} />
            {product.generation && (product.generation.description || product.generation.seo) && <AiTag usedAi={product.generation.usedAi} />}
            <Select value={product.status} onValueChange={(v) => run("status", () => update({ productId, status: v as "draft" | "active" | "archived" }), `Product ${v}`)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
            </Select>
            <LoadingButton loading={busy === "all"} onClick={() => run("all", () => genAll({ productId, publish: true }), "Full product page generated and published")}><Wand2 className="h-4 w-4" /> Build everything</LoadingButton>
            {product.status === "active" && <Button variant="outline" asChild><Link href={`/ecommerce/storefront/${store.slug}/products/${product.handle}`} target="_blank"><ExternalLink className="h-4 w-4" /> View page</Link></Button>}
            {shopifyUrl && <Button variant="outline" asChild><a href={shopifyUrl} target="_blank" rel="noreferrer"><Upload className="h-4 w-4" /> Shopify</a></Button>}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Product page copy" description="Generated description, bullets and FAQ. Edit freely." actions={<LoadingButton size="sm" variant="outline" loading={busy === "copy"} onClick={() => run("copy", () => genDescription({ productId }), "Description generated")}><Sparkles className="h-4 w-4" /> Generate copy</LoadingButton>}>
            <Tabs defaultValue="preview">
              <TabsList><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="edit">Edit</TabsTrigger></TabsList>
              <TabsContent value="preview" className="mt-3">
                {product.description ? (
                  <div className="space-y-4">
                    {product.shortDescription && <p className="text-lg text-muted-foreground">{product.shortDescription}</p>}
                    <Markdown content={product.description} />
                    {product.bullets.length > 0 && <ul className="grid gap-2 sm:grid-cols-2">{product.bullets.map((b) => <li key={b} className="flex gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"><span className="text-primary">✓</span>{b}</li>)}</ul>}
                    {product.faq && product.faq.length > 0 && <div className="space-y-2"><h3 className="font-semibold">FAQ</h3>{product.faq.map((f) => <details key={f.question} className="rounded-lg border px-3 py-2 text-sm"><summary className="cursor-pointer font-medium">{f.question}</summary><p className="mt-2 text-muted-foreground">{f.answer}</p></details>)}</div>}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No copy yet – click “Generate copy”.</p>}
              </TabsContent>
              <TabsContent value="edit" className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={set("title")} /></div>
                  <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={set("category")} /></div>
                </div>
                <div className="space-y-1.5"><Label>Short description</Label><Input value={form.shortDescription} onChange={set("shortDescription")} /></div>
                <div className="space-y-1.5"><Label>Description (Markdown)</Label><Textarea rows={14} value={form.description} onChange={set("description")} className="font-mono text-xs" /></div>
                <LoadingButton onClick={save} loading={busy === "save"} disabled={!dirty}><Save className="h-4 w-4" /> Save changes</LoadingButton>
              </TabsContent>
            </Tabs>
          </Section>

          <Section title="Images" description="AI-generated in studio, lifestyle and flat-lay styles, or upload your own." actions={
            <div className="flex gap-2">
              <LoadingButton size="sm" variant="outline" loading={busy === "images"} onClick={() => run("images", () => genImages({ productId, count: 3 }), "Images generated")}><ImageIcon className="h-4 w-4" /> Generate 3 images</LoadingButton>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"><Upload className="h-4 w-4" /> Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} /></label>
            </div>
          }>
            {product.images.length === 0 ? <p className="text-sm text-muted-foreground">No images yet.</p> : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {product.images.map((img, i) => (
                  <figure key={img.url} className="group relative overflow-hidden rounded-lg border">
                    <ProductImage src={img.url} alt={img.alt} className="aspect-square w-full" />
                    <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 text-[10px] text-white"><span className="capitalize">{img.source}</span><button onClick={() => removeImage({ productId, index: i })} className="opacity-70 hover:opacity-100"><Trash2 className="h-3 w-3" /></button></figcaption>
                  </figure>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Pricing" description={`Strategy: ${store.pricing.strategy}, target ${store.pricing.targetMarginPct}% net margin.`} actions={<LoadingButton size="sm" variant="outline" loading={busy === "pricing"} onClick={() => run("pricing", () => genPricing({ productId }), "Price suggested and applied")}><Tag className="h-4 w-4" /> Set price</LoadingButton>}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Price</Label><Input type="number" value={form.price} onChange={set("price")} /></div>
              <div className="space-y-1.5"><Label>Compare at</Label><Input type="number" value={form.compareAtPrice} onChange={set("compareAtPrice")} /></div>
              <div className="space-y-1.5"><Label>Landed cost</Label><Input type="number" value={form.cost} onChange={set("cost")} /></div>
              <div className="space-y-1.5"><Label>Shipping cost</Label><Input type="number" value={form.shippingCost} onChange={set("shippingCost")} /></div>
              <div className="space-y-1.5"><Label>Inventory</Label><Input type="number" value={form.inventory} onChange={set("inventory")} /></div>
            </div>
            <div className="mt-3 rounded-lg bg-muted/60 p-3 text-sm">
              <div className="flex justify-between"><span>Gross margin (before ads)</span><span className={`font-medium ${margin.grossMarginPct >= store.pricing.minMarginPct ? "text-emerald-700" : "text-red-700"}`}>{pct(margin.grossMarginPct)}</span></div>
              <div className="flex justify-between"><span>Profit per unit</span><span className="font-medium">{money(margin.grossProfit, store.currency)}</span></div>
              <div className="flex justify-between"><span>Break-even CPA</span><span className="font-medium">{money(margin.breakevenCpa, store.currency)}</span></div>
            </div>
            {product.pricingNote && <p className="mt-3 text-xs text-muted-foreground">{product.pricingNote}</p>}
            {dirty && <LoadingButton onClick={save} loading={busy === "save"} className="mt-3 w-full" size="sm"><Save className="h-4 w-4" /> Save</LoadingButton>}
          </Section>

          <Section title="SEO" description={product.seo.score !== undefined ? `Score ${product.seo.score}/100` : "Not scored yet"} actions={<LoadingButton size="sm" variant="outline" loading={busy === "seo"} onClick={() => run("seo", () => genSeo({ productId }), "SEO metadata generated")}><Globe className="h-4 w-4" /> Generate</LoadingButton>}>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Meta title <span className="text-muted-foreground">({form.seoTitle.length}/60)</span></Label><Input value={form.seoTitle} onChange={set("seoTitle")} /></div>
              <div className="space-y-1.5"><Label>Meta description <span className="text-muted-foreground">({form.seoDescription.length}/155)</span></Label><Textarea rows={3} value={form.seoDescription} onChange={set("seoDescription")} /></div>
              <div className="space-y-1.5"><Label>Keywords (comma separated)</Label><Input value={form.seoKeywords} onChange={set("seoKeywords")} /></div>
              {product.seo.issues && product.seo.issues.length > 0 && <ul className="list-disc pl-4 text-xs text-amber-700">{product.seo.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
              <div className="rounded-lg border p-3">
                <p className="truncate text-sm text-[#1a0dab]">{form.seoTitle || product.title}</p>
                <p className="text-xs text-[#006621]">/ecommerce/storefront/{store.slug}/products/{product.handle}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{form.seoDescription}</p>
              </div>
            </div>
          </Section>

          <Section title="Details">
            <KeyValue items={[
              { label: "Handle", value: product.handle },
              { label: "Tags", value: product.tags.join(", ") || "—" },
              { label: "Collections", value: product.collections.map((c) => c.title).join(", ") || "—" },
              { label: "Variants", value: product.variants?.map((v) => `${v.name}: ${v.options.join("/")}`).join("; ") || "—" },
            ]} />
            <Button variant="ghost" size="sm" className="mt-4 text-red-600" onClick={async () => { if (confirm("Delete this product?")) { await remove({ productId }); router.push("/ecommerce/dashboard/store/products"); } }}><Trash2 className="h-4 w-4" /> Delete product</Button>
          </Section>
        </div>
      </div>
    </div>
  );
}
