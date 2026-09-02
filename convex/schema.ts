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

  // ---------------------------------------------------------------------------
  // Ecommerce Automation Platform
  // ---------------------------------------------------------------------------

  ecStores: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    niche: v.string(),
    description: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    brandVoice: v.optional(v.string()),
    currency: v.string(),
    country: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    status: v.union(v.literal("setup"), v.literal("live"), v.literal("paused")),
    seo: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
      })
    ),
    pricing: v.object({
      strategy: v.union(
        v.literal("margin"),
        v.literal("competitive"),
        v.literal("premium"),
        v.literal("penetration")
      ),
      targetMarginPct: v.number(),
      roundTo: v.union(v.literal("none"), v.literal(".99"), v.literal(".95"), v.literal("whole")),
      minMarginPct: v.number(),
    }),
    automation: v.object({
      autoFulfill: v.boolean(),
      autoNotifyTracking: v.boolean(),
      autoHandleCancellations: v.boolean(),
      autoOptimizeCampaigns: v.boolean(),
      autoRefreshTrends: v.boolean(),
      riskHoldAmount: v.number(),
      minRoas: v.number(),
      maxCpa: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),

  ecConnectors: defineTable({
    storeId: v.id("ecStores"),
    provider: v.string(), // shopify | meta | tiktok | google | email | sms | fulfillment | tracking | stripe | influencer
    label: v.string(),
    status: v.union(
      v.literal("disconnected"),
      v.literal("connected"),
      v.literal("error")
    ),
    credentials: v.any(), // provider specific secrets (server-side only)
    config: v.any(),
    lastSyncedAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_provider", ["storeId", "provider"]),

  ecResearchRuns: defineTable({
    storeId: v.id("ecStores"),
    kind: v.union(
      v.literal("trends"),
      v.literal("competitor"),
      v.literal("margins"),
      v.literal("ideas")
    ),
    query: v.string(),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    summary: v.optional(v.string()),
    result: v.optional(v.any()),
    sources: v.optional(v.array(v.object({ title: v.string(), url: v.string() }))),
    usedAi: v.boolean(),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_store", ["storeId", "createdAt"]),

  ecProductIdeas: defineTable({
    storeId: v.id("ecStores"),
    researchRunId: v.optional(v.id("ecResearchRuns")),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    trendScore: v.number(), // 0-100
    competitionLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    demandSignal: v.string(),
    whyNow: v.optional(v.string()),
    risks: v.optional(v.array(v.string())),
    estimatedCost: v.number(),
    suggestedPrice: v.number(),
    estimatedMargin: v.number(),
    marginPct: v.number(),
    searchVolume: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    supplierHints: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("candidate"),
      v.literal("shortlisted"),
      v.literal("rejected"),
      v.literal("launched")
    ),
    productId: v.optional(v.id("ecProducts")),
    createdAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_store_status", ["storeId", "status"]),

  ecCompetitors: defineTable({
    storeId: v.id("ecStores"),
    name: v.string(),
    url: v.string(),
    domain: v.string(),
    positioning: v.optional(v.string()),
    priceRange: v.optional(v.object({ min: v.number(), max: v.number() })),
    strengths: v.array(v.string()),
    weaknesses: v.array(v.string()),
    opportunities: v.array(v.string()),
    topProducts: v.array(
      v.object({ name: v.string(), price: v.optional(v.number()), note: v.optional(v.string()) })
    ),
    trafficEstimate: v.optional(v.string()),
    marketingChannels: v.optional(v.array(v.string())),
    usedAi: v.boolean(),
    lastAnalyzedAt: v.number(),
    createdAt: v.number(),
  }).index("by_store", ["storeId"]),

  ecProducts: defineTable({
    storeId: v.id("ecStores"),
    title: v.string(),
    handle: v.string(),
    description: v.string(), // markdown/html body
    shortDescription: v.optional(v.string()),
    bullets: v.array(v.string()),
    category: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    cost: v.number(),
    shippingCost: v.optional(v.number()),
    sku: v.optional(v.string()),
    inventory: v.number(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    images: v.array(
      v.object({
        url: v.string(),
        storageId: v.optional(v.id("_storage")),
        alt: v.string(),
        source: v.string(), // ai | upload | placeholder | url
      })
    ),
    tags: v.array(v.string()),
    collectionIds: v.array(v.id("ecCollections")),
    seo: v.object({
      title: v.string(),
      description: v.string(),
      keywords: v.array(v.string()),
      score: v.optional(v.number()),
      issues: v.optional(v.array(v.string())),
    }),
    faq: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
    variants: v.optional(
      v.array(v.object({ name: v.string(), options: v.array(v.string()) }))
    ),
    pricingNote: v.optional(v.string()),
    externalIds: v.optional(v.any()),
    generation: v.optional(
      v.object({
        description: v.boolean(),
        images: v.boolean(),
        pricing: v.boolean(),
        seo: v.boolean(),
        usedAi: v.boolean(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_store_handle", ["storeId", "handle"])
    .index("by_store_status", ["storeId", "status"]),

  ecCollections: defineTable({
    storeId: v.id("ecStores"),
    title: v.string(),
    handle: v.string(),
    description: v.string(),
    productIds: v.array(v.id("ecProducts")),
    seo: v.object({ title: v.string(), description: v.string(), keywords: v.array(v.string()) }),
    imageUrl: v.optional(v.string()),
    externalIds: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_handle", ["storeId", "handle"]),

  ecAdCampaigns: defineTable({
    storeId: v.id("ecStores"),
    name: v.string(),
    channel: v.union(
      v.literal("meta"),
      v.literal("tiktok"),
      v.literal("google"),
      v.literal("email"),
      v.literal("sms"),
      v.literal("influencer")
    ),
    objective: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
    dailyBudget: v.number(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    productIds: v.array(v.id("ecProducts")),
    targeting: v.any(),
    strategy: v.optional(v.string()),
    externalId: v.optional(v.string()),
    externalStatus: v.optional(v.string()),
    simulated: v.boolean(),
    metrics: v.object({
      impressions: v.number(),
      clicks: v.number(),
      spend: v.number(),
      conversions: v.number(),
      revenue: v.number(),
    }),
    metricsHistory: v.optional(
      v.array(
        v.object({
          date: v.string(),
          impressions: v.number(),
          clicks: v.number(),
          spend: v.number(),
          conversions: v.number(),
          revenue: v.number(),
        })
      )
    ),
    optimizations: v.array(
      v.object({
        at: v.number(),
        action: v.string(),
        reason: v.string(),
        automated: v.boolean(),
      })
    ),
    lastOptimizedAt: v.optional(v.number()),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_store_status", ["storeId", "status"]),

  ecCreatives: defineTable({
    storeId: v.id("ecStores"),
    campaignId: v.optional(v.id("ecAdCampaigns")),
    productId: v.optional(v.id("ecProducts")),
    type: v.union(
      v.literal("ad_copy"),
      v.literal("video_script"),
      v.literal("image"),
      v.literal("email"),
      v.literal("sms"),
      v.literal("ugc_brief")
    ),
    channel: v.string(),
    variant: v.string(),
    headline: v.optional(v.string()),
    primaryText: v.optional(v.string()),
    description: v.optional(v.string()),
    cta: v.optional(v.string()),
    hook: v.optional(v.string()),
    script: v.optional(
      v.array(
        v.object({
          scene: v.number(),
          durationSec: v.number(),
          visual: v.string(),
          voiceover: v.string(),
          onScreenText: v.optional(v.string()),
        })
      )
    ),
    imageUrl: v.optional(v.string()),
    imagePrompt: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("approved"), v.literal("live"), v.literal("retired")),
    performance: v.optional(v.object({ ctr: v.number(), cvr: v.number(), score: v.number() })),
    usedAi: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_campaign", ["campaignId"]),

  ecMessagingFlows: defineTable({
    storeId: v.id("ecStores"),
    name: v.string(),
    channel: v.union(v.literal("email"), v.literal("sms")),
    trigger: v.union(
      v.literal("order_confirmation"),
      v.literal("shipping_update"),
      v.literal("delivered"),
      v.literal("abandoned_cart"),
      v.literal("welcome"),
      v.literal("post_purchase"),
      v.literal("winback"),
      v.literal("cancellation")
    ),
    steps: v.array(
      v.object({
        delayHours: v.number(),
        subject: v.optional(v.string()),
        body: v.string(),
      })
    ),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("draft")),
    stats: v.object({ sent: v.number(), opened: v.number(), clicked: v.number() }),
    usedAi: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_trigger", ["storeId", "trigger"]),

  ecMessageLogs: defineTable({
    storeId: v.id("ecStores"),
    orderId: v.optional(v.id("ecOrders")),
    flowId: v.optional(v.id("ecMessagingFlows")),
    channel: v.union(v.literal("email"), v.literal("sms")),
    to: v.string(),
    subject: v.optional(v.string()),
    body: v.string(),
    status: v.union(v.literal("sent"), v.literal("simulated"), v.literal("failed")),
    provider: v.string(),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_order", ["orderId"]),

  ecInfluencers: defineTable({
    storeId: v.id("ecStores"),
    name: v.string(),
    handle: v.string(),
    platform: v.string(),
    followers: v.number(),
    engagementRate: v.number(),
    niche: v.string(),
    contact: v.optional(v.string()),
    profileUrl: v.optional(v.string()),
    fitScore: v.number(),
    estimatedRate: v.optional(v.number()),
    status: v.union(
      v.literal("identified"),
      v.literal("contacted"),
      v.literal("negotiating"),
      v.literal("agreed"),
      v.literal("declined"),
      v.literal("posted")
    ),
    outreachMessage: v.optional(v.string()),
    followUpMessage: v.optional(v.string()),
    lastContactedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    usedAi: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_store_status", ["storeId", "status"]),

  ecOrders: defineTable({
    storeId: v.id("ecStores"),
    orderNumber: v.string(),
    source: v.union(
      v.literal("storefront"),
      v.literal("shopify"),
      v.literal("webhook"),
      v.literal("manual"),
      v.literal("simulated")
    ),
    externalId: v.optional(v.string()),
    customer: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
    }),
    shippingAddress: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.optional(v.string()),
      postalCode: v.string(),
      country: v.string(),
    }),
    items: v.array(
      v.object({
        productId: v.optional(v.id("ecProducts")),
        title: v.string(),
        sku: v.optional(v.string()),
        quantity: v.number(),
        unitPrice: v.number(),
        unitCost: v.optional(v.number()),
        variant: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
      })
    ),
    subtotal: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    currency: v.string(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("partially_refunded"),
      v.literal("failed")
    ),
    paymentReference: v.optional(v.string()),
    fulfillmentStatus: v.union(
      v.literal("unfulfilled"),
      v.literal("on_hold"),
      v.literal("sent_to_fulfillment"),
      v.literal("in_production"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("returned")
    ),
    fulfillmentProvider: v.optional(v.string()),
    fulfillmentExternalId: v.optional(v.string()),
    riskFlags: v.array(v.string()),
    riskScore: v.number(),
    customerNote: v.optional(v.string()),
    internalNote: v.optional(v.string()),
    timeline: v.array(
      v.object({
        at: v.number(),
        event: v.string(),
        detail: v.optional(v.string()),
        actor: v.union(v.literal("automation"), v.literal("user"), v.literal("system"), v.literal("customer")),
      })
    ),
    cancelReason: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_store_fulfillment", ["storeId", "fulfillmentStatus"])
    .index("by_store_number", ["storeId", "orderNumber"])
    .index("by_external", ["externalId"]),

  ecShipments: defineTable({
    storeId: v.id("ecStores"),
    orderId: v.id("ecOrders"),
    carrier: v.string(),
    trackingNumber: v.string(),
    trackingUrl: v.optional(v.string()),
    status: v.union(
      v.literal("label_created"),
      v.literal("in_transit"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("exception"),
      v.literal("returned")
    ),
    events: v.array(
      v.object({
        at: v.number(),
        status: v.string(),
        location: v.optional(v.string()),
        description: v.string(),
      })
    ),
    estimatedDelivery: v.optional(v.number()),
    provider: v.string(), // aftership | simulated | manual | shopify
    lastCheckedAt: v.optional(v.number()),
    notifiedStatuses: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId", "createdAt"])
    .index("by_order", ["orderId"])
    .index("by_tracking", ["trackingNumber"]),

  ecActivity: defineTable({
    storeId: v.id("ecStores"),
    actor: v.union(v.literal("automation"), v.literal("user"), v.literal("system")),
    area: v.union(
      v.literal("research"),
      v.literal("store"),
      v.literal("marketing"),
      v.literal("orders"),
      v.literal("settings")
    ),
    action: v.string(),
    detail: v.optional(v.string()),
    level: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
    refType: v.optional(v.string()),
    refId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_store", ["storeId", "createdAt"]),
});
