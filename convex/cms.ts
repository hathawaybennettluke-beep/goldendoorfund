import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all CMS content by page and section
export const getPageContent = query({
  args: {
    pageType: v.union(
      v.literal("home"),
      v.literal("about"),
      v.literal("contact")
    ),
    sectionType: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let content = await ctx.db
      .query("cmsContent")
      .withIndex("by_page_section", (q) => q.eq("pageType", args.pageType))
      .collect();

    if (args.sectionType) {
      content = content.filter((item) => item.sectionType === args.sectionType);
    }

    if (args.activeOnly !== false) {
      content = content.filter((item) => item.isActive);
    }

    // Sort by order
    content.sort((a, b) => a.order - b.order);

    return content;
  },
});

// Query to get all CMS content (admin view)
export const getAllContent = query({
  args: {
    pageType: v.optional(
      v.union(v.literal("home"), v.literal("about"), v.literal("contact"))
    ),
  },
  handler: async (ctx, args) => {
    let content = await ctx.db.query("cmsContent").collect();

    if (args.pageType) {
      content = content.filter((item) => item.pageType === args.pageType);
    }

    // Sort by page, then section, then order
    content.sort((a, b) => {
      if (a.pageType !== b.pageType) {
        return a.pageType.localeCompare(b.pageType);
      }
      if (a.sectionType !== b.sectionType) {
        return a.sectionType.localeCompare(b.sectionType);
      }
      return a.order - b.order;
    });

    return content;
  },
});

// Query to get single content item
export const getContent = query({
  args: { id: v.id("cmsContent") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query to get content by identifier
export const getByIdentifier = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cmsContent")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();
  },
});

// Mutation to create CMS content
export const createContent = mutation({
  args: {
    pageType: v.union(
      v.literal("home"),
      v.literal("about"),
      v.literal("contact")
    ),
    sectionType: v.string(),
    contentType: v.union(
      v.literal("text"),
      v.literal("card"),
      v.literal("hero"),
      v.literal("stats")
    ),
    identifier: v.string(),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
    secondaryButtonText: v.optional(v.string()),
    secondaryButtonUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageAlt: v.optional(v.string()),
    iconName: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.number(),
    isActive: v.optional(v.boolean()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if identifier already exists
    const existing = await ctx.db
      .query("cmsContent")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    if (existing) {
      throw new Error("Content with this identifier already exists");
    }

    const now = Date.now();

    const contentId = await ctx.db.insert("cmsContent", {
      ...args,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return contentId;
  },
});

// Mutation to update CMS content
export const updateContent = mutation({
  args: {
    id: v.id("cmsContent"),
    pageType: v.optional(
      v.union(v.literal("home"), v.literal("about"), v.literal("contact"))
    ),
    sectionType: v.optional(v.string()),
    contentType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("card"),
        v.literal("hero"),
        v.literal("stats")
      )
    ),
    identifier: v.optional(v.string()),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    buttonText: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
    secondaryButtonText: v.optional(v.string()),
    secondaryButtonUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageAlt: v.optional(v.string()),
    iconName: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const content = await ctx.db.get(id);
    if (!content) {
      throw new Error("Content not found");
    }

    // If updating identifier, check for conflicts
    if (updates.identifier && updates.identifier !== content.identifier) {
      const existing = await ctx.db
        .query("cmsContent")
        .withIndex("by_identifier", (q) =>
          q.eq("identifier", updates.identifier!)
        )
        .first();

      if (existing && existing._id !== id) {
        throw new Error("Content with this identifier already exists");
      }
    }

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(id, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Mutation to delete CMS content
export const deleteContent = mutation({
  args: { id: v.id("cmsContent") },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);
    if (!content) {
      throw new Error("Content not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mutation to toggle content active status
export const toggleContentActive = mutation({
  args: { id: v.id("cmsContent") },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);
    if (!content) {
      throw new Error("Content not found");
    }

    await ctx.db.patch(args.id, {
      isActive: !content.isActive,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Mutation to reorder content items
export const reorderContent = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("cmsContent"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await Promise.all(
      args.items.map(async (item) => {
        await ctx.db.patch(item.id, {
          order: item.order,
          updatedAt: now,
        });
      })
    );

    return true;
  },
});

// SITE SETTINGS QUERIES AND MUTATIONS

// Query to get all site settings
export const getSiteSettings = query({
  args: {
    category: v.optional(v.string()),
    publicOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let settings = await ctx.db.query("siteSettings").collect();

    if (args.category) {
      settings = settings.filter(
        (setting) => setting.category === args.category
      );
    }

    if (args.publicOnly) {
      settings = settings.filter((setting) => setting.isPublic);
    }

    // Sort by category, then key
    settings.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.key.localeCompare(b.key);
    });

    return settings;
  },
});

// Query to get single setting by key
export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});

// Mutation to create or update site setting
export const upsertSetting = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("textarea"),
      v.literal("number"),
      v.literal("boolean"),
      v.literal("url"),
      v.literal("color")
    ),
    category: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing setting
      await ctx.db.patch(existing._id, {
        value: args.value,
        type: args.type,
        category: args.category,
        label: args.label,
        description: args.description,
        isPublic: args.isPublic ?? false,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new setting
      const settingId = await ctx.db.insert("siteSettings", {
        key: args.key,
        value: args.value,
        type: args.type,
        category: args.category,
        label: args.label,
        description: args.description,
        isPublic: args.isPublic ?? false,
        updatedAt: now,
      });
      return settingId;
    }
  },
});

// Mutation to delete site setting
export const deleteSetting = mutation({
  args: { id: v.id("siteSettings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Generate upload URL for CMS images
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Seed initial content and settings (run once)
export const seedInitialContent = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Check if content already exists
    const existingContent = await ctx.db.query("cmsContent").first();
    if (existingContent) {
      throw new Error("Content already exists. Use update operations instead.");
    }

    // Initial site settings
    const initialSettings = [
      {
        key: "site_title",
        value: "Golden Door - Transforming Lives Through Donations",
        type: "text" as const,
        category: "general",
        label: "Site Title",
        description: "Main title shown in browser tabs and search results",
        isPublic: true,
      },
      {
        key: "site_description",
        value:
          "Join a global community of changemakers. Your generosity creates real impact through transparent, verified campaigns that change lives worldwide.",
        type: "textarea" as const,
        category: "seo",
        label: "Site Description",
        description: "Meta description for search engines (150-160 characters)",
        isPublic: true,
      },
      {
        key: "contact_email",
        value: "contact@goldendoor.org",
        type: "text" as const,
        category: "contact",
        label: "Contact Email",
        description: "Main contact email address",
        isPublic: true,
      },
      {
        key: "support_email",
        value: "support@goldendoor.org",
        type: "text" as const,
        category: "contact",
        label: "Support Email",
        description: "Support and help email address",
        isPublic: true,
      },
      {
        key: "primary_color",
        value: "#2563eb",
        type: "color" as const,
        category: "appearance",
        label: "Primary Color",
        description: "Main brand color used throughout the site",
        isPublic: true,
      },
      {
        key: "secondary_color",
        value: "#7c3aed",
        type: "color" as const,
        category: "appearance",
        label: "Secondary Color",
        description: "Secondary brand color for accents",
        isPublic: true,
      },
    ];

    // Insert settings
    for (const setting of initialSettings) {
      await ctx.db.insert("siteSettings", {
        ...setting,
        updatedAt: now,
      });
    }

    // Initial CMS content
    const initialContent = [
      // Home page hero
      {
        pageType: "home" as const,
        sectionType: "hero",
        contentType: "hero" as const,
        identifier: "home-hero-main",
        title: "Transform Lives with Every Donation",
        description:
          "Join a global community of changemakers. Your generosity creates real impact through transparent, verified campaigns that change lives worldwide.",
        buttonText: "Start Making Impact",
        buttonUrl: "/campaigns",
        secondaryButtonText: "See Our Stories",
        secondaryButtonUrl: "/about",
        order: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // Why Choose Us section
      {
        pageType: "home" as const,
        sectionType: "features",
        contentType: "card" as const,
        identifier: "home-feature-transparency",
        title: "100% Transparency",
        description:
          "Track every dollar with real-time updates and detailed impact reports. Know exactly where your donation goes.",
        iconName: "Shield",
        color: "#10b981",
        order: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "features",
        contentType: "card" as const,
        identifier: "home-feature-impact",
        title: "Verified Impact",
        description:
          "All campaigns are thoroughly vetted and monitored. See real stories and measurable results from your generosity.",
        iconName: "Heart",
        color: "#dc2626",
        order: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "features",
        contentType: "card" as const,
        identifier: "home-feature-global",
        title: "Global Reach",
        description:
          "Support causes worldwide from your home. Our platform connects you with communities in need across the globe.",
        iconName: "Globe",
        color: "#2563eb",
        order: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "features",
        contentType: "card" as const,
        identifier: "home-feature-community",
        title: "Community Driven",
        description:
          "Join thousands of donors making a difference together. Share stories, celebrate impact, and inspire others.",
        iconName: "Users",
        color: "#7c3aed",
        order: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // About page hero
      {
        pageType: "about" as const,
        sectionType: "hero",
        contentType: "hero" as const,
        identifier: "about-hero-main",
        title: "Empowering Communities Through Transparent Giving",
        description:
          "We believe that every donation has the power to create lasting change. Our platform connects generous donors with impactful causes, ensuring transparency and measurable results.",
        buttonText: "Explore Campaigns",
        buttonUrl: "/campaigns",
        secondaryButtonText: "Get in Touch",
        secondaryButtonUrl: "/contact",
        order: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // About values
      {
        pageType: "about" as const,
        sectionType: "values",
        contentType: "card" as const,
        identifier: "about-value-compassion",
        title: "Compassion First",
        description:
          "Every decision we make is guided by empathy and the desire to create meaningful change in people's lives.",
        iconName: "Heart",
        order: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "about" as const,
        sectionType: "values",
        contentType: "card" as const,
        identifier: "about-value-transparency",
        title: "Transparency",
        description:
          "We believe in complete openness about how donations are used, with real-time tracking and detailed impact reports.",
        iconName: "Shield",
        order: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "about" as const,
        sectionType: "values",
        contentType: "card" as const,
        identifier: "about-value-community",
        title: "Community Driven",
        description:
          "Our platform is built by and for people who want to make a difference, fostering connections between donors and causes.",
        iconName: "Users",
        order: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "about" as const,
        sectionType: "values",
        contentType: "card" as const,
        identifier: "about-value-global",
        title: "Global Impact",
        description:
          "We support causes worldwide, breaking down barriers to help communities regardless of location or size.",
        iconName: "Globe",
        order: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      // FAQ Section
      {
        pageType: "home" as const,
        sectionType: "faq",
        contentType: "text" as const,
        identifier: "home-faq-title",
        title: "Frequently Asked Questions",
        description:
          "Find answers to common questions about our platform and donation process.",
        order: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "faq",
        contentType: "card" as const,
        identifier: "faq-how-secure",
        title: "How secure are my donations?",
        content:
          "We use industry-standard encryption and partner with trusted payment processors like Stripe to ensure your financial information is completely secure. All transactions are encrypted and PCI DSS compliant.",
        order: 1,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "faq",
        contentType: "card" as const,
        identifier: "faq-tax-deductible",
        title: "Are donations tax-deductible?",
        content:
          "Yes, donations to verified 501(c)(3) organizations are tax-deductible. You'll receive a receipt immediately after your donation for your records. Please consult your tax advisor for specific guidance.",
        order: 2,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "faq",
        contentType: "card" as const,
        identifier: "faq-track-impact",
        title: "How can I track my donation's impact?",
        content:
          "Every donation comes with real-time tracking through your donor dashboard. You'll receive updates on how funds are used, project milestones, and impact reports from the organizations you support.",
        order: 3,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "faq",
        contentType: "card" as const,
        identifier: "faq-fees",
        title: "What fees do you charge?",
        content:
          "We charge a small processing fee of 2.9% + $0.30 per transaction to cover payment processing and platform maintenance. 100% of your intended donation goes to the cause you choose.",
        order: 4,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        pageType: "home" as const,
        sectionType: "faq",
        contentType: "card" as const,
        identifier: "faq-monthly-donations",
        title: "Can I set up monthly donations?",
        content:
          "Yes! You can set up recurring monthly donations to any campaign. This helps organizations plan better and creates sustained impact for the causes you care about.",
        order: 5,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Insert content
    for (const content of initialContent) {
      await ctx.db.insert("cmsContent", content);
    }

    return { message: "Initial content and settings created successfully" };
  },
});
