"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { useCart } from "@/components/ecommerce/storefront/Cart";
import { ProductImage } from "@/components/ecommerce/bits";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/ecommerce/format";

export default function StorefrontHome() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const collection = params.get("collection") ?? undefined;
  const store = useQuery(api.ecommerce.storefront.getStore, { slug });
  const products = useQuery(api.ecommerce.storefront.listProducts, { slug, collectionHandle: collection });
  const { add } = useCart();

  if (store === null) return <p className="py-20 text-center text-muted-foreground">This store does not exist.</p>;
  if (!store || !products) return <p className="py-20 text-center text-muted-foreground">Loading…</p>;
  const activeCollection = store.collections.find((c) => c.handle === collection);
  const color = store.primaryColor ?? "#d4a017";

  return (
    <div className="space-y-10">
      <section className="rounded-3xl px-8 py-14 text-center text-white" style={{ background: `linear-gradient(135deg, ${color}, #1f1f1f)` }}>
        <p className="text-sm uppercase tracking-widest opacity-80">{store.niche}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{activeCollection ? activeCollection.title : store.seo?.title ?? store.name}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/85">{activeCollection ? activeCollection.description : store.seo?.description ?? store.description}</p>
      </section>

      {!activeCollection && store.collections.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Shop by collection</h2>
          <div className="flex flex-wrap gap-2">{store.collections.map((c) => <Link key={c._id} href={`/ecommerce/storefront/${slug}?collection=${c.handle}`} className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-50">{c.title} <span className="text-muted-foreground">({c.count})</span></Link>)}</div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{activeCollection ? activeCollection.title : "All products"}</h2><span className="text-sm text-muted-foreground">{products.length} item(s)</span></div>
        {products.length === 0 ? <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">No products published yet.</p> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <article key={p._id} className="group flex flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg">
                <Link href={`/ecommerce/storefront/${slug}/products/${p.handle}`} className="block overflow-hidden bg-neutral-50"><ProductImage src={p.image?.url} alt={p.image?.alt ?? p.title} className="aspect-square w-full transition-transform duration-300 group-hover:scale-105" /></Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.category}</p>
                  <Link href={`/ecommerce/storefront/${slug}/products/${p.handle}`} className="mt-1 font-semibold leading-tight hover:underline">{p.title}</Link>
                  {p.shortDescription && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.shortDescription}</p>}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div><span className="font-semibold">{money(p.price, store.currency)}</span>{p.compareAtPrice && p.compareAtPrice > p.price && <span className="ml-2 text-sm text-muted-foreground line-through">{money(p.compareAtPrice, store.currency)}</span>}</div>
                    <Button size="sm" style={{ backgroundColor: color }} onClick={() => { add({ productId: p._id, handle: p.handle, title: p.title, price: p.price, image: p.image?.url }); toast.success(`${p.title} added to cart`); }}><ShoppingBag className="h-4 w-4" /> Add</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
