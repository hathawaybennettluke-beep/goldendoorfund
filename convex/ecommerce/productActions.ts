"use node";
/**
 * Pillar 2 – Build the store: product copy, images, pricing, collections,
 * SEO and publishing to Shopify.
 */
import { v } from "convex/values";
import { z } from "zod";
import { action } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { generateStructured, storeContext, withAi, type AiResult } from "./lib/ai";
import { fallbackProductCopy, fallbackSeo } from "./lib/fallbacks";
import { buildImagePrompt, generateImage, imageProvider, placeholderSvg } from "./lib/images";
import { suggestPrice, type PriceSuggestion } from "./lib/pricing";
import { scoreSeo } from "./products";
import { pushCollection, pushProduct, type ShopifyCredentials } from "./lib/integrations/shopify";

const CopySchema = z.object({
  shortDescription: z.string().describe("One punchy sentence for product cards, under 160 characters"),
  description: z.string().describe("Full product page copy in Markdown with ## headings: hook, benefits, how it works, what's in the box. 180-320 words."),
  bullets: z.array(z.string()).describe("5 benefit-led bullet points"),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).describe("3-4 objection-handling FAQs"),
  tags: z.array(z.string()),
  variants: z.array(z.object({ name: z.string(), options: z.array(z.string()) })).describe("Likely variant options, e.g. Color/Size; empty if none"),
});

const SeoSchema = z.object({
  title: z.string().describe("Meta title, max 60 chars, primary keyword first"),
  description: z.string().describe("Meta description, 120-155 chars, with a call to action"),
  keywords: z.array(z.string()).describe("4-8 target keywords, most important first"),
});

const PricingNoteSchema = z.object({
  rationale: z.string().describe("2 sentences explaining the price to the store owner"),
  adCostPerOrder: z.number().describe("Realistic blended paid-ads cost per order for this product"),
  competitorPriceEstimate: z.number().describe("Typical market price for comparable products, 0 if unknown"),
});

const CollectionsSchema = z.object({
  collections: z.array(
    z.object({
      title: z.string(),
      description: z.string().describe("1-2 sentence collection intro"),
      productHandles: z.array(z.string()),
      seoTitle: z.string(),
      seoDescription: z.string(),
      keywords: z.array(z.string()),
    })
  ),
});

async function loadProduct(ctx: ActionCtx, productId: Id<"ecProducts">): Promise<{ product: Doc<"ecProducts">; store: Doc<"ecStores"> }> {
  const product = await ctx.runQuery(internal.ecommerce.products.getInternal, { productId });
  if (!product) throw new Error("Product not found");
  const store = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: product.storeId });
  return { product, store };
}

type CopyOutput = z.infer<typeof CopySchema>;
type CollectionsPlan = z.infer<typeof CollectionsSchema>;
type SeoOutput = { title: string; description: string; keywords: string[]; score: number; issues: string[]; usedAi: boolean };
type PricingOutput = PriceSuggestion & { usedAi: boolean };

async function generateCopyFor(ctx: ActionCtx, store: Doc<"ecStores">, product: Doc<"ecProducts">): Promise<AiResult<CopyOutput>> {
  const result: AiResult<CopyOutput> = await withAi(
    () =>
      generateStructured({
        schema: CopySchema,
        prompt: `Write the product page for "${product.title}" (${product.category}) priced at ${store.currency} ${product.price.toFixed(2)}.\n${product.description ? `Existing notes: ${product.description.slice(0, 600)}` : ""}\n\n${storeContext(store)}\n\nMake the copy specific to the product and audience; avoid clichés and unverifiable claims (no fake review counts).`,
      }),
    () => fallbackProductCopy({ title: product.title, category: product.category, niche: store.niche, brandVoice: store.brandVoice, audience: store.targetAudience })
  );
  await ctx.runMutation(internal.ecommerce.products.applyGeneration, {
    productId: product._id,
    patch: { ...result.data, tags: Array.from(new Set([...product.tags, ...result.data.tags])).slice(0, 12) },
    flags: { description: true, usedAi: result.usedAi },
  });
  return result;
}

async function generateImagesFor(ctx: ActionCtx, store: Doc<"ecStores">, product: Doc<"ecProducts">, count: number): Promise<{ count: number; provider: string }> {
  const styles = ["studio", "lifestyle", "flatlay"] as const;
  const images: Doc<"ecProducts">["images"] = [];
  let provider = imageProvider() ?? "placeholder";
  for (let i = 0; i < count; i++) {
    const style = styles[i % styles.length];
    const prompt = buildImagePrompt({ title: product.title, category: product.category, description: product.shortDescription ?? product.description, style, brandColor: store.primaryColor });
    let storageId: Id<"_storage">;
    let source = "ai";
    try {
      const generated = await generateImage(prompt);
      if (generated && generated.kind === "bytes") {
        storageId = await ctx.storage.store(new Blob([generated.bytes], { type: generated.mime }));
        provider = generated.provider;
      } else {
        storageId = await ctx.storage.store(new Blob([placeholderSvg({ title: product.title, category: product.category, color: store.primaryColor, variant: i })], { type: "image/svg+xml" }));
        source = "placeholder";
        provider = "placeholder";
      }
    } catch (error) {
      console.error("Image generation failed, using placeholder", error);
      storageId = await ctx.storage.store(new Blob([placeholderSvg({ title: product.title, category: product.category, color: store.primaryColor, variant: i })], { type: "image/svg+xml" }));
      source = "placeholder";
      provider = "placeholder";
    }
    const url = await ctx.storage.getUrl(storageId);
    if (url) images.push({ url, storageId, alt: `${product.title} – ${style} shot`, source });
  }
  await ctx.runMutation(internal.ecommerce.products.applyGeneration, {
    productId: product._id,
    patch: { images: [...product.images, ...images] },
    flags: { images: true, usedAi: provider !== "placeholder" },
  });
  return { count: images.length, provider };
}

async function pricingFor(ctx: ActionCtx, store: Doc<"ecStores">, product: Doc<"ecProducts">): Promise<PricingOutput> {
  const competitorPrices: number[] = await ctx.runQuery(internal.ecommerce.research.competitorPricesInternal, { storeId: store._id });
  const advice: AiResult<z.infer<typeof PricingNoteSchema>> = await withAi(
    () =>
      generateStructured({
        schema: PricingNoteSchema,
        effort: "low",
        prompt: `We sell "${product.title}" (${product.category}) with a landed cost of ${store.currency} ${product.cost.toFixed(2)} and shipping cost ${store.currency} ${(product.shippingCost ?? 0).toFixed(2)}.\n${storeContext(store)}\n${competitorPrices.length ? `Competitor prices on file: ${competitorPrices.join(", ")}` : "No competitor prices on file."}\nEstimate a realistic blended ad cost per order and the typical market price, and explain the pricing logic in two sentences.`,
      }),
    () => ({ rationale: "", adCostPerOrder: Math.max(8, Math.round(product.cost * 1.1)), competitorPriceEstimate: 0 })
  );
  const comps = [...competitorPrices];
  if (advice.data.competitorPriceEstimate > 0) comps.push(advice.data.competitorPriceEstimate);
  const suggestion = suggestPrice({ ...store.pricing, cost: product.cost, shippingCost: product.shippingCost ?? 0, adCostPerOrder: advice.data.adCostPerOrder, competitorPrices: comps, currentPrice: product.price });
  const note: string = `${suggestion.rationale}${advice.data.rationale ? ` ${advice.data.rationale}` : ""} Assumes ${store.currency} ${advice.data.adCostPerOrder.toFixed(2)} ad cost per order → ${suggestion.netMarginPct.toFixed(1)}% net margin.`;
  await ctx.runMutation(internal.ecommerce.products.applyGeneration, {
    productId: product._id,
    patch: { price: suggestion.price, compareAtPrice: suggestion.compareAtPrice, pricingNote: note },
    flags: { pricing: true, usedAi: advice.usedAi },
  });
  return { ...suggestion, rationale: note, usedAi: advice.usedAi };
}

async function seoFor(ctx: ActionCtx, store: Doc<"ecStores">, product: Doc<"ecProducts">): Promise<SeoOutput> {
  const result: AiResult<z.infer<typeof SeoSchema>> = await withAi(
    () =>
      generateStructured({
        schema: SeoSchema,
        effort: "low",
        prompt: `Write on-page SEO metadata for the product "${product.title}" (${product.category}) sold by ${store.name}.\n${storeContext(store)}\nProduct copy:\n${(product.shortDescription ?? "") + "\n" + product.description.slice(0, 1200)}`,
      }),
    () => fallbackSeo({ title: product.title, category: product.category, niche: store.niche, storeName: store.name })
  );
  const seo = { ...result.data, title: result.data.title.slice(0, 70), description: result.data.description.slice(0, 165) };
  const scored = scoreSeo({ ...product, seo });
  await ctx.runMutation(internal.ecommerce.products.applyGeneration, {
    productId: product._id,
    patch: { seo: { ...seo, score: scored.score, issues: scored.issues } },
    flags: { seo: true, usedAi: result.usedAi },
  });
  return { ...seo, ...scored, usedAi: result.usedAi };
}

export const generateDescription = action({
  args: { productId: v.id("ecProducts") },
  handler: async (ctx, args): Promise<{ usedAi: boolean; warning?: string }> => {
    const { product, store } = await loadProduct(ctx, args.productId);
    const result = await generateCopyFor(ctx, store, product);
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "store", action: `Product copy generated: ${product.title}`, level: "success", refType: "product", refId: product._id });
    return { usedAi: result.usedAi, warning: result.warning };
  },
});

export const generateImages = action({
  args: { productId: v.id("ecProducts"), count: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ count: number; provider: string }> => {
    const { product, store } = await loadProduct(ctx, args.productId);
    const result = await generateImagesFor(ctx, store, product, Math.min(Math.max(args.count ?? 3, 1), 4));
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "store", action: `${result.count} product image(s) created: ${product.title}`, detail: result.provider === "placeholder" ? "Branded placeholders – configure an image provider (IMAGE_PROVIDER) for photoreal renders." : `Generated with ${result.provider}.`, level: "success", refType: "product", refId: product._id });
    return result;
  },
});

export const suggestPricing = action({
  args: { productId: v.id("ecProducts") },
  handler: async (ctx, args): Promise<PricingOutput> => {
    const { product, store } = await loadProduct(ctx, args.productId);
    const result = await pricingFor(ctx, store, product);
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: store._id, actor: "user", area: "store", action: `Price set for ${product.title}: ${store.currency} ${result.price.toFixed(2)}`, detail: result.rationale, level: "info", refType: "product", refId: product._id });
    return result;
  },
});

export const generateSeo = action({
  args: { productId: v.id("ecProducts") },
  handler: async (ctx, args): Promise<SeoOutput> => {
    const { product, store } = await loadProduct(ctx, args.productId);
    return await seoFor(ctx, store, product);
  },
});

/** One-click: copy → pricing → images → SEO, optionally publishing the product. */
export const generateAll = action({
  args: { productId: v.id("ecProducts"), publish: v.optional(v.boolean()), imageCount: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ usedAi: boolean; warning?: string; price: number; seoScore: number; images: number }> => {
    const { product, store } = await loadProduct(ctx, args.productId);
    const copy = await generateCopyFor(ctx, store, product);
    let current: Doc<"ecProducts"> = (await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: args.productId }))!;
    const pricing = await pricingFor(ctx, store, current);
    current = (await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: args.productId }))!;
    const images: { count: number; provider: string } = current.images.length === 0 ? await generateImagesFor(ctx, store, current, Math.min(Math.max(args.imageCount ?? 3, 1), 4)) : { count: 0, provider: "existing" };
    current = (await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: args.productId }))!;
    const seo = await seoFor(ctx, store, current);
    if (args.publish) {
      await ctx.runMutation(internal.ecommerce.products.applyGeneration, { productId: args.productId, patch: { status: "active" } });
    }
    await ctx.runMutation(internal.ecommerce.activity.log, {
      storeId: store._id,
      actor: "user",
      area: "store",
      action: `Product page built: ${product.title}`,
      detail: `Copy, pricing (${store.currency} ${pricing.price.toFixed(2)}), ${images.count} image(s) and SEO (score ${seo.score}) generated${args.publish ? " and published" : ""}.`,
      level: "success",
      refType: "product",
      refId: product._id,
    });
    return { usedAi: copy.usedAi || pricing.usedAi || seo.usedAi, warning: copy.warning, price: pricing.price, seoScore: seo.score, images: images.count };
  },
});

export const autoCollections = action({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args): Promise<{ created: number; usedAi: boolean; warning?: string }> => {
    const store: Doc<"ecStores"> = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const products: Doc<"ecProducts">[] = await ctx.runQuery(internal.ecommerce.products.listInternal, { storeId: args.storeId });
    if (products.length === 0) throw new Error("Add products before generating collections.");
    const existing: Doc<"ecCollections">[] = await ctx.runQuery(internal.ecommerce.products.listCollectionsInternal, { storeId: args.storeId });
    const plan: AiResult<CollectionsPlan> = await withAi(
      () =>
        generateStructured({
          schema: CollectionsSchema,
          prompt: `Organise these products into 3-6 shoppable collections (by use case, category or audience). Every product should appear in at least one collection; reference products by handle exactly.\n${existing.length ? `Existing collections (avoid duplicates): ${existing.map((c) => c.title).join(", ")}` : ""}\n\n${storeContext(store)}\n\nPRODUCTS:\n${products.map((p) => `- handle: ${p.handle} | title: ${p.title} | category: ${p.category} | price: ${p.price}`).join("\n")}`,
        }),
      () => {
        const byCategory = new Map<string, Doc<"ecProducts">[]>();
        for (const p of products) byCategory.set(p.category, [...(byCategory.get(p.category) ?? []), p]);
        const collections = [...byCategory.entries()].map(([category, items]) => ({
          title: category,
          description: `Our ${category.toLowerCase()} picks, chosen for ${store.niche.toLowerCase()} lovers.`,
          productHandles: items.map((p) => p.handle),
          seoTitle: `${category} | ${store.name}`,
          seoDescription: `Shop ${category.toLowerCase()} at ${store.name}. Fast shipping, 30-day guarantee.`,
          keywords: [category.toLowerCase(), store.niche.toLowerCase()],
        }));
        collections.unshift({ title: "Best Sellers", description: `The ${store.name} products customers love most.`, productHandles: products.slice(0, 6).map((p) => p.handle), seoTitle: `Best Sellers | ${store.name}`, seoDescription: `Discover the most popular ${store.niche.toLowerCase()} products at ${store.name}.`, keywords: ["best sellers", store.niche.toLowerCase()] });
        return { collections };
      }
    );
    const byHandle = new Map(products.map((p) => [p.handle, p._id]));
    const existingTitles = new Set(existing.map((c) => c.title.toLowerCase()));
    let created = 0;
    for (const c of plan.data.collections) {
      if (existingTitles.has(c.title.toLowerCase())) continue;
      const productIds = c.productHandles.map((h) => byHandle.get(h)).filter((id): id is Id<"ecProducts"> => Boolean(id));
      if (productIds.length === 0) continue;
      await ctx.runMutation(internal.ecommerce.products.insertCollectionInternal, {
        storeId: args.storeId,
        title: c.title,
        description: c.description,
        productIds,
        seo: { title: c.seoTitle.slice(0, 70), description: c.seoDescription.slice(0, 165), keywords: c.keywords },
      });
      created += 1;
    }
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: args.storeId, actor: "user", area: "store", action: `${created} collection(s) created automatically`, level: "success" });
    return { created, usedAi: plan.usedAi, warning: plan.warning };
  },
});

export const fixSeo = action({
  args: { storeId: v.id("ecStores"), threshold: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ fixed: number; usedAi: boolean }> => {
    const store: Doc<"ecStores"> = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const products: Doc<"ecProducts">[] = await ctx.runQuery(internal.ecommerce.products.listInternal, { storeId: args.storeId });
    const threshold = args.threshold ?? 70;
    let fixed = 0;
    let usedAi = false;
    for (const product of products) {
      const before = scoreSeo(product);
      if (before.score >= threshold) continue;
      if (product.description.split(/\s+/).length < 120) {
        const copy = await generateCopyFor(ctx, store, product);
        usedAi = usedAi || copy.usedAi;
      }
      const current: Doc<"ecProducts"> = (await ctx.runQuery(internal.ecommerce.products.getInternal, { productId: product._id }))!;
      const seo = await seoFor(ctx, store, current);
      usedAi = usedAi || seo.usedAi;
      fixed += 1;
    }
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: args.storeId, actor: "user", area: "store", action: `SEO fixed on ${fixed} product(s)`, detail: `Products scoring below ${threshold} were rewritten.`, level: "success" });
    return { fixed, usedAi };
  },
});

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
  const inline = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }
    const h = /^(#{1,4})\s+(.*)/.exec(line);
    if (h) { closeList(); const lvl = Math.min(h[1].length + 1, 4); out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); continue; }
    if (/^[-*]\s+/.test(line)) { if (inList !== "ul") { closeList(); out.push("<ul>"); inList = "ul"; } out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`); continue; }
    if (/^\d+[.)]\s+/.test(line)) { if (inList !== "ol") { closeList(); out.push("<ol>"); inList = "ol"; } out.push(`<li>${inline(line.replace(/^\d+[.)]\s+/, ""))}</li>`); continue; }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

export const pushToShopify = action({
  args: { storeId: v.id("ecStores"), productIds: v.optional(v.array(v.id("ecProducts"))) },
  handler: async (ctx, args): Promise<{ pushed: number; collectionsPushed: number; errors: string[] }> => {
    const store: Doc<"ecStores"> = await ctx.runQuery(internal.ecommerce.stores.requireAccess, { storeId: args.storeId });
    const connector: Doc<"ecConnectors"> | null = await ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId: args.storeId, provider: "shopify" });
    if (!connector) throw new Error("Connect Shopify in Settings → Integrations first.");
    const creds = connector.credentials as ShopifyCredentials;
    const all: Doc<"ecProducts">[] = await ctx.runQuery(internal.ecommerce.products.listInternal, { storeId: args.storeId });
    const products = (args.productIds ? all.filter((p) => args.productIds!.includes(p._id)) : all).filter((p) => p.status !== "archived");
    const errors: string[] = [];
    let pushed = 0;
    for (const p of products) {
      try {
        const existingId = (p.externalIds as { shopifyProductId?: string } | undefined)?.shopifyProductId;
        const result = await pushProduct(creds, {
          title: p.title,
          bodyHtml: markdownToHtml(p.description) + (p.faq?.length ? `<h3>FAQ</h3>${p.faq.map((f) => `<p><strong>${f.question}</strong><br/>${f.answer}</p>`).join("")}` : ""),
          vendor: store.name,
          productType: p.category,
          tags: p.tags,
          handle: p.handle,
          status: p.status === "active" ? "active" : "draft",
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          sku: p.sku,
          inventory: p.inventory,
          images: p.images.filter((i) => !i.url.endsWith(".svg") && i.source !== "placeholder").map((i) => ({ src: i.url, alt: i.alt })),
          seoTitle: p.seo.title,
          seoDescription: p.seo.description,
        }, existingId);
        await ctx.runMutation(internal.ecommerce.products.applyGeneration, { productId: p._id, patch: { externalIds: { ...(p.externalIds ?? {}), shopifyProductId: result.id, shopifyAdminUrl: result.adminUrl } } });
        pushed += 1;
      } catch (error) {
        errors.push(`${p.title}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    // Collections
    const refreshed: Doc<"ecProducts">[] = await ctx.runQuery(internal.ecommerce.products.listInternal, { storeId: args.storeId });
    const collections: Doc<"ecCollections">[] = await ctx.runQuery(internal.ecommerce.products.listCollectionsInternal, { storeId: args.storeId });
    let collectionsPushed = 0;
    for (const c of collections) {
      try {
        const externalProductIds = c.productIds.map((id) => (refreshed.find((p) => p._id === id)?.externalIds as { shopifyProductId?: string } | undefined)?.shopifyProductId).filter((id): id is string => Boolean(id));
        if (externalProductIds.length === 0) continue;
        const existingId = (c.externalIds as { shopifyCollectionId?: string } | undefined)?.shopifyCollectionId;
        const result = await pushCollection(creds, { title: c.title, handle: c.handle, bodyHtml: `<p>${c.description}</p>`, productExternalIds: externalProductIds }, existingId);
        await ctx.runMutation(internal.ecommerce.products.patchCollectionInternal, { collectionId: c._id, externalIds: { ...(c.externalIds ?? {}), shopifyCollectionId: result.id } });
        collectionsPushed += 1;
      } catch (error) {
        errors.push(`Collection ${c.title}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    await ctx.runMutation(internal.ecommerce.connectors.setStatus, { connectorId: connector._id, status: errors.length && pushed === 0 ? "error" : "connected", lastError: errors[0], lastSyncedAt: Date.now() });
    await ctx.runMutation(internal.ecommerce.activity.log, { storeId: args.storeId, actor: "user", area: "store", action: `Synced ${pushed} product(s) and ${collectionsPushed} collection(s) to Shopify`, detail: errors.length ? `${errors.length} error(s): ${errors[0]}` : undefined, level: errors.length ? "warning" : "success" });
    return { pushed, collectionsPushed, errors };
  },
});
