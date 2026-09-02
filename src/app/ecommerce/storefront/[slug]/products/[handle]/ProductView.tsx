"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, Check } from "lucide-react";
import { api } from "../../../../../../../convex/_generated/api";
import { useCart } from "@/components/ecommerce/storefront/Cart";
import { ProductImage } from "@/components/ecommerce/bits";
import { Markdown } from "@/components/ecommerce/Markdown";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/ecommerce/format";

export function ProductView({ slug, handle }: { slug: string; handle: string }) {
  const data = useQuery(api.ecommerce.storefront.getProduct, { slug, handle });
  const { add } = useCart();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [variant, setVariant] = useState<Record<string, string>>({});

  if (data === null) return <p className="py-20 text-center text-muted-foreground">Product not found.</p>;
  if (!data) return <p className="py-20 text-center text-muted-foreground">Loading…</p>;
  const { product, store, related } = data;
  const color = store.primaryColor ?? "#d4a017";
  const variantLabel = Object.values(variant).join(" / ") || undefined;
  const addToCart = () => add({ productId: product._id, handle: product.handle, title: product.title, price: product.price, image: product.images[0]?.url, variant: variantLabel });

  return (
    <div className="space-y-14">
      <nav className="text-sm text-muted-foreground"><Link href={`/ecommerce/storefront/${slug}`} className="hover:underline">{store.name}</Link> / <span>{product.category}</span> / <span className="text-foreground">{product.title}</span></nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border bg-neutral-50"><ProductImage src={product.images[active]?.url} alt={product.images[active]?.alt ?? product.title} className="aspect-square w-full" /></div>
          {product.images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2">{product.images.map((img, i) => <button key={img.url} onClick={() => setActive(i)} className={`overflow-hidden rounded-xl border ${i === active ? "ring-2 ring-offset-2" : ""}`} style={i === active ? { ["--tw-ring-color" as string]: color } : undefined}><ProductImage src={img.url} alt={img.alt} className="aspect-square w-full" /></button>)}</div>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{product.title}</h1>
          {product.shortDescription && <p className="mt-3 text-lg text-muted-foreground">{product.shortDescription}</p>}
          <div className="mt-5 flex items-baseline gap-3"><span className="text-3xl font-semibold">{money(product.price, store.currency)}</span>{product.compareAtPrice && product.compareAtPrice > product.price && <><span className="text-lg text-muted-foreground line-through">{money(product.compareAtPrice, store.currency)}</span><span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: color }}>Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%</span></>}</div>
          {product.variants?.map((v) => (
            <div key={v.name} className="mt-5"><p className="text-sm font-medium">{v.name}</p><div className="mt-2 flex flex-wrap gap-2">{v.options.map((o) => <button key={o} onClick={() => setVariant({ ...variant, [v.name]: o })} className={`rounded-full border px-4 py-1.5 text-sm ${variant[v.name] === o ? "text-white" : "hover:bg-neutral-50"}`} style={variant[v.name] === o ? { backgroundColor: color, borderColor: color } : undefined}>{o}</button>)}</div></div>
          ))}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" style={{ backgroundColor: color }} disabled={product.inventory <= 0} onClick={() => { addToCart(); toast.success("Added to cart"); }}><ShoppingBag className="h-4 w-4" /> {product.inventory > 0 ? "Add to cart" : "Sold out"}</Button>
            <Button size="lg" variant="outline" className="flex-1" disabled={product.inventory <= 0} onClick={() => { addToCart(); router.push(`/ecommerce/storefront/${slug}/checkout`); }}>Buy now</Button>
          </div>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3"><li className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free shipping over {money(50, store.currency)}</li><li className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> 30-day returns</li><li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure checkout</li></ul>
          {product.bullets.length > 0 && <ul className="mt-6 space-y-2">{product.bullets.map((b) => <li key={b} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />{b}</li>)}</ul>}
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2"><Markdown content={product.description} className="text-[15px] leading-relaxed" /></div>
        {product.faq && product.faq.length > 0 && <aside><h2 className="mb-3 text-lg font-semibold">Questions</h2><div className="space-y-2">{product.faq.map((f) => <details key={f.question} className="rounded-xl border px-4 py-3"><summary className="cursor-pointer text-sm font-medium">{f.question}</summary><p className="mt-2 text-sm text-muted-foreground">{f.answer}</p></details>)}</div></aside>}
      </div>
      {related.length > 0 && (
        <section><h2 className="mb-4 text-lg font-semibold">You may also like</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <Link key={r._id} href={`/ecommerce/storefront/${slug}/products/${r.handle}`} className="rounded-2xl border p-3 hover:shadow-md"><ProductImage src={r.image?.url} alt={r.title} className="aspect-square w-full rounded-xl" /><p className="mt-2 text-sm font-medium">{r.title}</p><p className="text-sm text-muted-foreground">{money(r.price, store.currency)}</p></Link>)}</div></section>
      )}
    </div>
  );
}
