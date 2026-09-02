import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";
import { requireStoreAccess } from "./lib/auth";

export const actorValidator = v.union(v.literal("automation"), v.literal("user"), v.literal("system"));
export const areaValidator = v.union(
  v.literal("research"),
  v.literal("store"),
  v.literal("marketing"),
  v.literal("orders"),
  v.literal("settings")
);
export const levelValidator = v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error"));

export const log = internalMutation({
  args: {
    storeId: v.id("ecStores"),
    actor: actorValidator,
    area: areaValidator,
    action: v.string(),
    detail: v.optional(v.string()),
    level: v.optional(levelValidator),
    refType: v.optional(v.string()),
    refId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ecActivity", {
      storeId: args.storeId,
      actor: args.actor,
      area: args.area,
      action: args.action,
      detail: args.detail,
      level: args.level ?? "info",
      refType: args.refType,
      refId: args.refId,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { storeId: v.id("ecStores"), limit: v.optional(v.number()), area: v.optional(areaValidator) },
  handler: async (ctx, args) => {
    await requireStoreAccess(ctx, args.storeId);
    const rows = await ctx.db
      .query("ecActivity")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .take(args.area ? (args.limit ?? 50) * 3 : args.limit ?? 50);
    const filtered = args.area ? rows.filter((r) => r.area === args.area) : rows;
    return filtered.slice(0, args.limit ?? 50);
  },
});
