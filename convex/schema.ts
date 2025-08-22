import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example tables for a donation platform
  users: defineTable({
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    clerkUserId: v.optional(v.string()), // Store Clerk user ID for reference
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkUserId"]),

  campaigns: defineTable({
    title: v.string(),
    description: v.string(),
    goalAmount: v.number(),
    currentAmount: v.number(),
    creatorId: v.id("users"),
    imageUrl: v.optional(v.string()),
    category: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    endDate: v.optional(v.number()),
  })
    .index("by_creator", ["creatorId"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  donations: defineTable({
    amount: v.number(),
    donorId: v.id("users"),
    campaignId: v.id("campaigns"),
    message: v.optional(v.string()),
    isAnonymous: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_donor", ["donorId"])
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_date", ["campaignId", "createdAt"]),

  blogPosts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    slug: v.string(),
    authorId: v.id("users"),
    featuredImageId: v.optional(v.id("_storage")),
    featuredImageUrl: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    featured: v.boolean(),
    readTime: v.number(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  })
    .index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_slug", ["slug"])
    .index("by_published_date", ["status", "publishedAt"])
    .index("by_featured", ["featured", "status"]),

  blogCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),
});
