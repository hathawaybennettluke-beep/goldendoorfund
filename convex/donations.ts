import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
// Query to get all donations
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("donations").collect();
  },
});

// Query to get donations by campaign
export const getByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
  },
});

// Query to get donations by donor
export const getByDonor = query({
  args: { donorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_donor", (q) => q.eq("donorId", args.donorId))
      .collect();
  },
});

// Query to get donor count for a campaign
export const getDonorCount = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Count unique donors
    const uniqueDonors = new Set(donations.map((donation) => donation.donorId));
    return uniqueDonors.size;
  },
});

// Query to get donor counts for multiple campaigns
export const getDonorCounts = query({
  args: { campaignIds: v.array(v.id("campaigns")) },
  handler: async (ctx, args) => {
    const allDonations = await ctx.db.query("donations").collect();

    const donorCounts: Record<string, number> = {};

    for (const campaignId of args.campaignIds) {
      const campaignDonations = allDonations.filter(
        (donation) => donation.campaignId === campaignId
      );
      const uniqueDonors = new Set(
        campaignDonations.map((donation) => donation.donorId)
      );
      donorCounts[campaignId] = uniqueDonors.size;
    }

    return donorCounts;
  },
});

// Mutation to delete a donation
export const remove = mutation({
  args: { id: v.id("donations") },
  handler: async (ctx, args) => {
    const donation = await ctx.db.get(args.id);
    if (!donation) {
      throw new Error("Donation not found");
    }

    await ctx.db.delete(args.id);

    // Update campaign amount (subtract the donation) using internal mutation
    await ctx.scheduler.runAfter(0, internal.payments.updateCampaignAmount, {
      campaignId: donation.campaignId,
      amount: -donation.amount,
    });
  },
});

// Query to get donations with donor and campaign details (for admin dashboard)
export const listWithDetails = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("succeeded"),
        v.literal("failed"),
        v.literal("canceled")
      )
    ),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    let donations = await ctx.db.query("donations").order("desc").collect();

    // Apply filters
    if (args.status) {
      donations = donations.filter(
        (donation) => donation.status === args.status
      );
    }
    if (args.campaignId) {
      donations = donations.filter(
        (donation) => donation.campaignId === args.campaignId
      );
    }

    // Apply pagination
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    const paginatedDonations = donations.slice(offset, offset + limit);

    // Get detailed info for each donation
    const donationsWithDetails = await Promise.all(
      paginatedDonations.map(async (donation) => {
        // Get donor info
        const donor = await ctx.db.get(donation.donorId);

        // Get campaign info
        const campaign = await ctx.db.get(donation.campaignId);

        return {
          ...donation,
          donor: donor
            ? {
                _id: donor._id,
                name: donor.name,
                email: donor.email,
                profileImage: donor.profileImage,
              }
            : null,
          campaign: campaign
            ? {
                _id: campaign._id,
                title: campaign.title,
                organization: campaign.organization,
                category: campaign.category,
                status: campaign.status,
              }
            : null,
        };
      })
    );

    return {
      donations: donationsWithDetails,
      total: donations.length,
      hasMore: offset + limit < donations.length,
    };
  },
});

// Query to get donation statistics
export const getStats = query({
  handler: async (ctx) => {
    const donations = await ctx.db.query("donations").collect();

    const totalDonations = donations.length;
    const totalAmount = donations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );
    const uniqueDonors = new Set(donations.map((donation) => donation.donorId))
      .size;
    const uniqueCampaigns = new Set(
      donations.map((donation) => donation.campaignId)
    ).size;

    return {
      totalDonations,
      totalAmount,
      uniqueDonors,
      uniqueCampaigns,
    };
  },
});

// Query to get recent donation activity for dashboard
export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const donations = await ctx.db.query("donations").order("desc").take(limit);

    // Get detailed info for recent donations
    const recentDonations = await Promise.all(
      donations.map(async (donation) => {
        const donor = await ctx.db.get(donation.donorId);
        const campaign = await ctx.db.get(donation.campaignId);

        return {
          ...donation,
          donor: donor
            ? {
                _id: donor._id,
                name: donor.name,
                email: donor.email,
              }
            : null,
          campaign: campaign
            ? {
                _id: campaign._id,
                title: campaign.title,
                organization: campaign.organization,
              }
            : null,
        };
      })
    );

    return recentDonations;
  },
});

// This is now handled by payments.updateCampaignAmount
// Keeping this for backward compatibility but it's deprecated
export const updateCurrentAmountInternal = internalMutation({
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
