import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// GET ALL USERS (Admin)
export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").order("desc").collect();

    // Filter by search term if provided
    if (args.searchTerm && args.searchTerm.trim()) {
      const searchLower = args.searchTerm.toLowerCase().trim();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    const paginatedUsers = users.slice(offset, offset + limit);

    // Get donation stats for each user
    const usersWithStats = await Promise.all(
      paginatedUsers.map(async (user) => {
        // Get all donations by this user
        const donations = await ctx.db
          .query("donations")
          .withIndex("by_donor", (q) => q.eq("donorId", user._id))
          .collect();

        // Calculate total donated and number of donations
        const totalDonated = donations.reduce(
          (sum, donation) => sum + donation.amount,
          0
        );
        const donationCount = donations.length;

        // Get unique campaigns donated to
        const uniqueCampaigns = new Set(donations.map((d) => d.campaignId));
        const campaignsSupported = uniqueCampaigns.size;

        // Get most recent donation date
        const lastDonationDate =
          donations.length > 0
            ? Math.max(...donations.map((d) => d.createdAt))
            : null;

        return {
          ...user,
          stats: {
            totalDonated,
            donationCount,
            campaignsSupported,
            lastDonationDate,
          },
        };
      })
    );

    return {
      users: usersWithStats,
      total: users.length,
      hasMore: offset + limit < users.length,
    };
  },
});

// GET USER BY ID (Admin)
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get all donations by this user
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_donor", (q) => q.eq("donorId", args.userId))
      .collect();

    // Get campaigns for each donation
    const donationsWithCampaigns = await Promise.all(
      donations.map(async (donation) => {
        const campaign = await ctx.db.get(donation.campaignId);
        return {
          ...donation,
          campaign: campaign
            ? {
                _id: campaign._id,
                title: campaign.title,
                category: campaign.category,
              }
            : null,
        };
      })
    );

    // Calculate stats
    const totalDonated = donations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );
    const donationCount = donations.length;
    const uniqueCampaigns = new Set(donations.map((d) => d.campaignId));
    const campaignsSupported = uniqueCampaigns.size;

    return {
      ...user,
      donations: donationsWithCampaigns,
      stats: {
        totalDonated,
        donationCount,
        campaignsSupported,
      },
    };
  },
});

// CREATE USER (Admin)
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      profileImage: args.profileImage,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// SYNC USER FROM CLERK (Auto-sync on app usage)
export const syncUserFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // First check if user with this Clerk ID already exists
    const existingUserByClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existingUserByClerkId) {
      // User exists by Clerk ID, update with latest info if needed
      const updates: {
        name?: string;
        email?: string;
        profileImage?: string;
      } = {};
      if (existingUserByClerkId.name !== args.name) updates.name = args.name;
      if (existingUserByClerkId.email !== args.email)
        updates.email = args.email;
      if (existingUserByClerkId.profileImage !== args.profileImage)
        updates.profileImage = args.profileImage;

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUserByClerkId._id, updates);
      }

      return existingUserByClerkId._id;
    }

    // Check if user with this email already exists (legacy users without Clerk ID)
    const existingUserByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUserByEmail) {
      // Update existing user with Clerk ID and latest info
      const updates: {
        clerkUserId: string;
        name?: string;
        profileImage?: string;
      } = {
        clerkUserId: args.clerkUserId,
      };
      if (existingUserByEmail.name !== args.name) updates.name = args.name;
      if (existingUserByEmail.profileImage !== args.profileImage)
        updates.profileImage = args.profileImage;

      await ctx.db.patch(existingUserByEmail._id, updates);
      return existingUserByEmail._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      profileImage: args.profileImage,
      clerkUserId: args.clerkUserId,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// GET CURRENT USER (Returns user data for authenticated Clerk user)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Find user by email from Clerk identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    return user;
  },
});

// UPDATE USER (Admin)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If email is being updated, check for conflicts
    if (updates.email && updates.email !== user.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email as string))
        .first();

      if (existingUser && existingUser._id !== userId) {
        throw new Error("Another user with this email already exists");
      }
    }

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(userId, cleanUpdates);
    return userId;
  },
});

// DELETE USER (Admin)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Note: In a real application, you might want to handle related data differently
    // For now, we'll just delete the user (donations will remain but become orphaned)
    // You might want to implement soft delete or cascade delete based on your needs

    await ctx.db.delete(args.userId);
    return args.userId;
  },
});

// GET USER STATS (Dashboard)
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const donations = await ctx.db.query("donations").collect();

    const totalUsers = users.length;
    const totalDonationAmount = donations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );

    // Users who have made donations
    const usersWithDonations = new Set(donations.map((d) => d.donorId));
    const activeUsers = usersWithDonations.size;

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentUsers = users.filter((user) => user.createdAt > thirtyDaysAgo);

    return {
      totalUsers,
      activeUsers,
      recentUsers: recentUsers.length,
      averageDonationPerUser:
        activeUsers > 0 ? totalDonationAmount / activeUsers : 0,
    };
  },
});
