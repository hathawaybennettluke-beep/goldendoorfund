import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../../convex/_generated/api";
import { ProductView } from "./ProductView";

type Params = { slug: string; handle: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, handle } = await params;
  try {
    const data = await fetchQuery(api.ecommerce.storefront.getProduct, { slug, handle });
    if (!data) return { title: "Product not found" };
    const { product, store } = data;
    return {
      title: product.seo.title || `${product.title} | ${store.name}`,
      description: product.seo.description || product.shortDescription,
      keywords: product.seo.keywords,
      openGraph: { title: product.seo.title || product.title, description: product.seo.description, images: product.images.map((i) => ({ url: i.url, alt: i.alt })) },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug, handle } = await params;
  return <ProductView slug={slug} handle={handle} />;
}
