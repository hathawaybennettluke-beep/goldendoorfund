import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireStoreAccess } from "./lib/auth";
import { slugify } from "./lib/text";
import { fallbackSeo } from "./lib/fallbacks";

export const imageValidator = v.object({
  url: v.string(),
  storageId: v.optional(v.id("_storage")),
  alt: v.string(),
  source: v.string(),
});

export const seoValidator = v.object({
  title: v.string(),
  description: v.string(),
  keywords: v.array(v.string()),
  score: v.optional(v.number()),
  issues: v.optional(v.array(v.string())),
});

async function uniqueHandle(ctx: MutationCtx, storeId: Id<"ecStores">, base: string, table: "ecProducts" | "ecCollections"): Promise<string> {
  let handle = slugify(base);
  let n = 1;
  const exists = async (h: string) =>
    table === "ecProducts"
      ? await ctx.db.query("ecProducts").withIndex("by_store_handle", (q) => q.eq("storeId", storeId).eq("handle", h)).first()
      : await ctx.db.query("ecCollections").withIndex("by_store_handle", (q) => q.eq("storeId", storeId).eq("handle", h)).first();
  while (await exists(handle)) {
    n += 1;
    handle = `${slugify(base)}-${n}`;
  }
  return handle;
}

/** Rule-based on-page SEO score used by the SEO manager. */
export function scoreSeo(p: { title: string; description: string; images: Array<{ alt: string }>; seo: { title: string; description: string; keywords: string[] } }): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  if (!p.seo.title) { issues.push("Missing meta title"); score -= 25; }
  else if (p.seo.title.length > 60) { issues.push("Meta title longer than 60 characters"); score -= 10; }
  else if (p.seo.title.length < 25) { issues.push("Meta title is very short"); score -= 8; }
  if (!p.seo.description) { issues.push("Missing meta description"); score -= 25; }
  else if (p.seo.description.length > 160) { issues.push("Meta description longer than 160 characters"); score -= 10; }
  else if (p.seo.description.length < 70) { issues.push("Meta description is too short to be compelling"); score -= 8; }
  if (p.seo.keywords.length < 3) { issues.push("Fewer than 3 target keywords"); score -= 10; }
  if (p.description.split(/\s+/).length < 120) { issues.push("Product copy under 120 words"); score -= 12; }
  if (p.images.length === 0) { issues.push("No product images"); score -= 15; }
  if (p.images.some((i) => !i.alt)) { issues.push("Images missing alt text"); score -= 8; }
  const primary = p.seo.keywords[0]?.toLowerCase();
  if (primary && !p.description.toLowerCase().includes(primary) && !p.title.toLowerCase().includes(primary)) {
    issues.push("Primary keyword does not appear in the title or copy");
    score -= 10;
  }
  return { score: Math.max(score, 0), issues };
}

export const list = query({
  args: { storeId: v.id("ecStores"), status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const products = await ctx.db.query("ecProducts").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).order("desc").collect();
    return args.status ? products.filter((p) => p.status === args.status) : products;
  },
});

export const get = query({
  args: { productId: v.id("ecProducts") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;
    await requireStoreAccess(ctx, product.storeId);
    const collections = await ctx.db.query("ecCollections").withIndex("by_store", (q) => q.eq("storeId", product.storeId)).collect();
    return { ...product, collections: collections.filter((c) => c.productIds.includes(product._id)) };
  },
});

export const listCollections = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    return await ctx.db.query("ecCollections").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
  },
});

export const seoOverview = query({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    const products = await ctx.db.query("ecProducts").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect();
    const rows = products.map((p) => ({ ...p, seo: { ...p.seo, ...scoreSeo(p) } }));
    const avg = rows.length ? rows.reduce((s, r) => s + r.seo.score, 0) / rows.length : 0;
    return { store, products: rows, averageScore: Math.round(avg), needsWork: rows.filter((r) => r.seo.score < 70).length };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const create = mutation({
  args: {
    storeId: v.id("ecStores"),
    title: v.string(),
    category: v.string(),
    cost: v.number(),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    inventory: v.optional(v.number()),
    shippingCost: v.optional(v.number()),
    ideaId: v.optional(v.id("ecProductIdeas")),
  },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    const now = Date.now();
    const handle = await uniqueHandle(ctx, args.storeId, args.title, "ecProducts");
    const price = args.price ?? Math.ceil(args.cost * 3) - 0.01;
    const productId = await ctx.db.insert("ecProducts", {
      storeId: args.storeId,
      title: args.title.trim(),
      handle,
      description: args.description ?? "",
      bullets: [],
      category: args.category.trim(),
      price,
      compareAtPrice: undefined,
      cost: args.cost,
      shippingCost: args.shippingCost ?? 0,
      sku: `${slugify(store.name).slice(0, 4).toUpperCase()}-${handle.slice(0, 12).toUpperCase()}`,
      inventory: args.inventory ?? 100,
      status: "draft",
      images: [],
      tags: [],
      collectionIds: [],
      seo: { ...fallbackSeo({ title: args.title, category: args.category, niche: store.niche, storeName: store.name }), score: undefined, issues: undefined },
      generation: { description: false, images: false, pricing: false, seo: false, usedAi: false },
      createdAt: now,
      updatedAt: now,
    });
    if (args.ideaId) {
      await ctx.db.patch(args.ideaId, { status: "launched", productId });
    }
    await ctx.db.insert("ecActivity", { storeId: args.storeId, actor: "user", area: "store", action: `Product created: ${args.title}`, level: "info", refType: "product", refId: productId, createdAt: now });
    return productId;
  },
});

export const createFromIdea = mutation({
  args: { ideaId: v.id("ecProductIdeas") },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idea not found");
    const { store } = await requireStoreAccess(ctx, idea.storeId);
    const now = Date.now();
    const handle = await uniqueHandle(ctx, idea.storeId, idea.name, "ecProducts");
    const productId = await ctx.db.insert("ecProducts", {
      storeId: idea.storeId,
      title: idea.name,
      handle,
      description: idea.description,
      shortDescription: idea.description,
      bullets: [],
      category: idea.category,
      price: idea.suggestedPrice,
      cost: idea.estimatedCost,
      shippingCost: 0,
      sku: `${slugify(store.name).slice(0, 4).toUpperCase()}-${handle.slice(0, 12).toUpperCase()}`,
      inventory: 100,
      status: "draft",
      images: [],
      tags: idea.keywords ?? [],
      collectionIds: [],
      seo: { ...fallbackSeo({ title: idea.name, category: idea.category, niche: store.niche, storeName: store.name }), keywords: idea.keywords?.length ? idea.keywords : fallbackSeo({ title: idea.name, category: idea.category, niche: store.niche, storeName: store.name }).keywords },
      generation: { description: false, images: false, pricing: false, seo: false, usedAi: false },
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(args.ideaId, { status: "launched", productId });
    await ctx.db.insert("ecActivity", { storeId: idea.storeId, actor: "user", area: "store", action: `Idea launched as product: ${idea.name}`, level: "success", refType: "product", refId: productId, createdAt: now });
    return productId;
  },
});

export const update = mutation({
  args: {
    productId: v.id("ecProducts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    bullets: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    cost: v.optional(v.number()),
    shippingCost: v.optional(v.number()),
    sku: v.optional(v.string()),
    inventory: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    tags: v.optional(v.array(v.string())),
    seo: v.optional(seoValidator),
    faq: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
    variants: v.optional(v.array(v.object({ name: v.string(), options: v.array(v.string()) }))),
  },
  handler: async (ctx, args) => {
    const { productId, ...patch } = args;
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");
    await requireStoreAccess(ctx, product.storeId);
    const clean = Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined));
    await ctx.db.patch(productId, { ...clean, updatedAt: Date.now() });
    if (args.status && args.status !== product.status) {
      await ctx.db.insert("ecActivity", { storeId: product.storeId, actor: "user", area: "store", action: `${product.title} set to ${args.status}`, level: "info", refType: "product", refId: productId, createdAt: Date.now() });
    }
  },
});

export const remove = mutation({
  args: { productId: v.id("ecProducts") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return;
    await requireStoreAccess(ctx, product.storeId);
    for (const img of product.images) if (img.storageId) await ctx.storage.delete(img.storageId).catch(() => undefined);
    const collections = await ctx.db.query("ecCollections").withIndex("by_store", (q) => q.eq("storeId", product.storeId)).collect();
    for (const c of collections) {
      if (c.productIds.includes(args.productId)) await ctx.db.patch(c._id, { productIds: c.productIds.filter((id) => id !== args.productId) });
    }
    await ctx.db.delete(args.productId);
  },
});

export const addImage = mutation({
  args: { productId: v.id("ecProducts"), storageId: v.optional(v.id("_storage")), url: v.optional(v.string()), alt: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    await requireStoreAccess(ctx, product.storeId);
    const url = args.storageId ? await ctx.storage.getUrl(args.storageId) : args.url;
    if (!url) throw new Error("Image URL missing");
    await ctx.db.patch(args.productId, {
      images: [...product.images, { url, storageId: args.storageId, alt: args.alt ?? product.title, source: args.storageId ? "upload" : "url" }],
      updatedAt: Date.now(),
    });
  },
});

export const removeImage = mutation({
  args: { productId: v.id("ecProducts"), index: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    await requireStoreAccess(ctx, product.storeId);
    const img = product.images[args.index];
    if (img?.storageId) await ctx.storage.delete(img.storageId).catch(() => undefined);
    await ctx.db.patch(args.productId, { images: product.images.filter((_, i) => i !== args.index), updatedAt: Date.now() });
  },
});

export const createCollection = mutation({
  args: { storeId: v.id("ecStores"), title: v.string(), description: v.optional(v.string()), productIds: v.optional(v.array(v.id("ecProducts"))) },
  handler: async (ctx, args) => {
    const { store } = await requireStoreAccess(ctx, args.storeId);
    const now = Date.now();
    const handle = await uniqueHandle(ctx, args.storeId, args.title, "ecCollections");
    const productIds = args.productIds ?? [];
    const id = await ctx.db.insert("ecCollections", {
      storeId: args.storeId,
      title: args.title,
      handle,
      description: args.description ?? `Explore our ${args.title.toLowerCase()} collection.`,
      productIds,
      seo: { title: `${args.title} | ${store.name}`, description: `Shop ${args.title.toLowerCase()} at ${store.name}.`, keywords: [args.title.toLowerCase(), store.niche.toLowerCase()] },
      createdAt: now,
      updatedAt: now,
    });
    for (const pid of productIds) {
      const p = await ctx.db.get(pid);
      if (p && !p.collectionIds.includes(id)) await ctx.db.patch(pid, { collectionIds: [...p.collectionIds, id] });
    }
    return id;
  },
});

export const updateCollection = mutation({
  args: { collectionId: v.id("ecCollections"), title: v.optional(v.string()), description: v.optional(v.string()), productIds: v.optional(v.array(v.id("ecProducts"))) },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");
    await requireStoreAccess(ctx, collection.storeId);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.productIds) {
      patch.productIds = args.productIds;
      const all = await ctx.db.query("ecProducts").withIndex("by_store", (q) => q.eq("storeId", collection.storeId)).collect();
      for (const p of all) {
        const shouldHave = args.productIds.includes(p._id);
        const has = p.collectionIds.includes(collection._id);
        if (shouldHave && !has) await ctx.db.patch(p._id, { collectionIds: [...p.collectionIds, collection._id] });
        if (!shouldHave && has) await ctx.db.patch(p._id, { collectionIds: p.collectionIds.filter((id) => id !== collection._id) });
      }
    }
    await ctx.db.patch(args.collectionId, patch);
  },
});

export const deleteCollection = mutation({
  args: { collectionId: v.id("ecCollections") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) return;
    await requireStoreAccess(ctx, collection.storeId);
    for (const pid of collection.productIds) {
      const p = await ctx.db.get(pid);
      if (p) await ctx.db.patch(pid, { collectionIds: p.collectionIds.filter((id) => id !== collection._id) });
    }
    await ctx.db.delete(args.collectionId);
  },
});

// ------------------------------------------------------------- internal -----

export const getInternal = internalQuery({
  args: { productId: v.id("ecProducts") },
  handler: async (ctx, args) => ctx.db.get(args.productId),
});

export const listInternal = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => ctx.db.query("ecProducts").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
});

export const listCollectionsInternal = internalQuery({
  args: { storeId: v.id("ecStores") },
  handler: async (ctx, args) => ctx.db.query("ecCollections").withIndex("by_store", (q) => q.eq("storeId", args.storeId)).collect(),
});

export const applyGeneration = internalMutation({
  args: {
    productId: v.id("ecProducts"),
    patch: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      shortDescription: v.optional(v.string()),
      bullets: v.optional(v.array(v.string())),
      price: v.optional(v.number()),
      compareAtPrice: v.optional(v.number()),
      pricingNote: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      seo: v.optional(seoValidator),
      faq: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
      variants: v.optional(v.array(v.object({ name: v.string(), options: v.array(v.string()) }))),
      images: v.optional(v.array(imageValidator)),
      externalIds: v.optional(v.any()),
      status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    }),
    flags: v.optional(v.object({ description: v.optional(v.boolean()), images: v.optional(v.boolean()), pricing: v.optional(v.boolean()), seo: v.optional(v.boolean()), usedAi: v.optional(v.boolean()) })),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    const clean = Object.fromEntries(Object.entries(args.patch).filter(([, val]) => val !== undefined));
    const generation = { ...(product.generation ?? { description: false, images: false, pricing: false, seo: false, usedAi: false }) };
    if (args.flags) {
      for (const [k, val] of Object.entries(args.flags)) {
        if (val !== undefined) (generation as Record<string, boolean>)[k] = k === "usedAi" ? generation.usedAi || val : val;
      }
    }
    await ctx.db.patch(args.productId, { ...clean, generation, updatedAt: Date.now() });
  },
});

export const insertCollectionInternal = internalMutation({
  args: {
    storeId: v.id("ecStores"),
    title: v.string(),
    description: v.string(),
    productIds: v.array(v.id("ecProducts")),
    seo: v.object({ title: v.string(), description: v.string(), keywords: v.array(v.string()) }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const handle = await uniqueHandle(ctx, args.storeId, args.title, "ecCollections");
    const id = await ctx.db.insert("ecCollections", { ...args, handle, createdAt: now, updatedAt: now });
    for (const pid of args.productIds) {
      const p = await ctx.db.get(pid);
      if (p && !p.collectionIds.includes(id)) await ctx.db.patch(pid, { collectionIds: [...p.collectionIds, id] });
    }
    return id;
  },
});

export const patchCollectionInternal = internalMutation({
  args: { collectionId: v.id("ecCollections"), externalIds: v.optional(v.any()), imageUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.externalIds) patch.externalIds = args.externalIds;
    if (args.imageUrl) patch.imageUrl = args.imageUrl;
    await ctx.db.patch(args.collectionId, patch);
  },
});
