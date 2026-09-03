import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const roleSchema = v.union(v.literal("admin"), v.literal("user"));

export default defineSchema({
  // Example tables for a donation platform
  users: defineTable({
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(roleSchema), // Optional with default handled in mutation
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
    organization: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    category: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("upcoming"),
      v.literal("draft")
    ),
    urgency: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    location: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    featured: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_active", ["isActive"])
    .index("by_featured", ["featured"])
    .index("by_urgency", ["urgency"]),

  donations: defineTable({
    amount: v.number(),
    donorId: v.id("users"),
    campaignId: v.id("campaigns"),
    message: v.optional(v.string()),
    isAnonymous: v.boolean(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("canceled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_donor", ["donorId"])
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_date", ["campaignId", "createdAt"])
    .index("by_status", ["status"])
    .index("by_payment_intent", ["stripePaymentIntentId"]),

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

  // CMS Content Management
  cmsContent: defineTable({
    pageType: v.union(
      v.literal("home"),
      v.literal("about"),
      v.literal("contact")
    ),
    sectionType: v.string(), // e.g., "hero", "features", "values", "team", etc.
    contentType: v.union(
      v.literal("text"),
      v.literal("card"),
      v.literal("hero"),
      v.literal("stats")
    ),
    identifier: v.string(), // unique identifier for the content piece
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()), // Rich text content
    buttonText: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
    secondaryButtonText: v.optional(v.string()),
    secondaryButtonUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageAlt: v.optional(v.string()),
    iconName: v.optional(v.string()), // Name of the lucide icon
    color: v.optional(v.string()),
    order: v.number(), // For ordering items within a section
    isActive: v.boolean(),
    metadata: v.optional(v.string()), // JSON string for additional data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_page_section", ["pageType", "sectionType"])
    .index("by_identifier", ["identifier"])
    .index("by_active", ["isActive"]),

  // Site Settings
  siteSettings: defineTable({
    key: v.string(), // unique key like "site_title", "site_description", etc.
    value: v.string(), // the actual value
    type: v.union(
      v.literal("text"),
      v.literal("textarea"),
      v.literal("number"),
      v.literal("boolean"),
      v.literal("url"),
      v.literal("color")
    ),
    category: v.string(), // e.g., "general", "contact", "social", "seo"
    label: v.string(), // Display name for the setting
    description: v.optional(v.string()), // Help text for the setting
    isPublic: v.boolean(), // Whether this setting is publicly accessible
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("replied")
    ),
    emailSent: v.boolean(), // Whether notification email was sent successfully
    ipAddress: v.optional(v.string()), // For security/spam prevention
    userAgent: v.optional(v.string()), // Browser info for debugging
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_created_date", ["createdAt"])
    .index("by_email_sent", ["emailSent"]),
});
