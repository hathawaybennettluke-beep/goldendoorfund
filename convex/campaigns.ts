import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Generate upload URL for campaign images
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Query to get all campaigns with optional filters
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("upcoming"),
        v.literal("draft"),
        v.literal("all")
      )
    ),
    category: v.optional(v.string()),
    urgency: v.optional(
      v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
        v.literal("all")
      )
    ),
    search: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let campaigns = await ctx.db.query("campaigns").collect();

    // Apply filters
    if (args.status && args.status !== "all") {
      campaigns = campaigns.filter(
        (campaign) => campaign.status === args.status
      );
    }

    if (args.category && args.category !== "all") {
      campaigns = campaigns.filter(
        (campaign) => campaign.category === args.category
      );
    }

    if (args.urgency && args.urgency !== "all") {
      campaigns = campaigns.filter(
        (campaign) => campaign.urgency === args.urgency
      );
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      campaigns = campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchLower) ||
          campaign.organization.toLowerCase().includes(searchLower)
      );
    }

    if (args.featured !== undefined) {
      campaigns = campaigns.filter(
        (campaign) => campaign.featured === args.featured
      );
    }

    // Sort by creation date (newest first)
    campaigns.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      campaigns = campaigns.slice(0, args.limit);
    }

    return campaigns;
  },
});

// Query to get a single campaign by ID
export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query to get campaigns by creator
export const getByCreator = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

// Query to get featured campaigns
export const getFeatured = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Query to get active campaigns
export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Mutation to create a new campaign
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    goalAmount: v.number(),
    organization: v.string(),
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
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    creatorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get image URL if image ID is provided
    let imageUrl: string | undefined;
    if (args.imageId) {
      const url = await ctx.storage.getUrl(args.imageId);
      imageUrl = url || undefined;
    }

    const campaignId = await ctx.db.insert("campaigns", {
      ...args,
      imageUrl,
      currentAmount: 0,
      isActive: args.status === "active",
      createdAt: now,
      updatedAt: now,
    });

    return campaignId;
  },
});

// Mutation to update a campaign
export const update = mutation({
  args: {
    id: v.id("campaigns"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    goalAmount: v.optional(v.number()),
    organization: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("upcoming"),
        v.literal("draft")
      )
    ),
    urgency: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
    ),
    location: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const patchData = {
      ...updates,
      isActive: updates.status === "active",
      updatedAt: Date.now(),
    };

    // Get image URL if image ID is provided
    if (updates.imageId) {
      const url = await ctx.storage.getUrl(updates.imageId);
      patchData.imageUrl = url || undefined;
    }

    await ctx.db.patch(id, patchData);

    return id;
  },
});

// Mutation to delete a campaign
export const remove = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Delete the image from storage if it exists
    if (campaign.imageId) {
      await ctx.storage.delete(campaign.imageId);
    }

    await ctx.db.delete(args.id);
  },
});

// Internal mutation to update campaign amount (for donations)
export const updateAmount = internalMutation({
  args: {
    id: v.id("campaigns"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await ctx.db.patch(args.id, {
      currentAmount: campaign.currentAmount + args.amount,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to toggle featured status
export const toggleFeatured = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await ctx.db.patch(args.id, {
      featured: !campaign.featured,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to update campaign status
export const updateStatus = mutation({
  args: {
    id: v.id("campaigns"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("upcoming"),
      v.literal("draft")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      isActive: args.status === "active",
      updatedAt: Date.now(),
    });
  },
});

// Query to get campaign statistics
export const getStats = query({
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    const donations = await ctx.db.query("donations").collect();

    const totalCampaigns = campaigns.length;
    const totalRaised = campaigns.reduce(
      (sum, campaign) => sum + campaign.currentAmount,
      0
    );
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === "active"
    ).length;
    const completedCampaigns = campaigns.filter(
      (campaign) => campaign.status === "completed"
    ).length;
    const upcomingCampaigns = campaigns.filter(
      (campaign) => campaign.status === "upcoming"
    ).length;

    // Count unique donors
    const uniqueDonors = new Set(donations.map((donation) => donation.donorId));
    const totalDonors = uniqueDonors.size;

    // Get unique categories
    const categories = [
      ...new Set(campaigns.map((campaign) => campaign.category)),
    ];

    return {
      totalCampaigns,
      totalRaised,
      totalDonors,
      activeCampaigns,
      completedCampaigns,
      upcomingCampaigns,
      categories,
    };
  },
});
