import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Example tables for a donation platform
  users: defineTable({
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

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
});
