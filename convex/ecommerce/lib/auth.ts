import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

/**
 * Resolve the signed-in application user from the Clerk identity.
 * Users are synced into the `users` table by the UserSyncProvider on the client.
 */
export async function getCurrentUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const byClerk = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
    .first();
  if (byClerk) return byClerk;
  if (identity.email) {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
  }
  return null;
}

export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("You must be signed in to do this.");
  }
  return user;
}

/** Ensure the current user owns the store (admins may access every store). */
export async function requireStoreAccess(
  ctx: Ctx,
  storeId: Id<"ecStores">
): Promise<{ user: Doc<"users">; store: Doc<"ecStores"> }> {
  const user = await requireUser(ctx);
  const store = await ctx.db.get(storeId);
  if (!store) throw new Error("Store not found");
  if (store.ownerId !== user._id && user.role !== "admin") {
    throw new Error("You do not have access to this store.");
  }
  return { user, store };
}
