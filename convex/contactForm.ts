import { internalMutation, query,mutation } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation to store contact submission in database
export const storeContactSubmission = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now();
    
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      message: args.message,
      status: "pending",
      emailSent: false,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: currentTime,
    });
    
    return submissionId;
  },
});

// Internal mutation to update submission with email status
export const updateSubmissionEmailStatus = internalMutation({
  args: {
    submissionId: v.id("contactSubmissions"),
    emailSent: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      emailSent: args.emailSent,
      ...(args.emailSent && { status: "processed" }),
    });
    
    return { success: true };
  },
});
// Query to get all contact submissions (for admin dashboard)
export const getAllContactSubmissions = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("processed"), v.literal("replied"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db.query("contactSubmissions");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const submissions = await query
      .order("desc")
      .take(limit);
    
    return submissions;
  },
});

// Query to get contact submission by ID
export const getContactSubmissionById = query({
  args: { id: v.id("contactSubmissions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation to update contact submission status
export const updateContactSubmissionStatus = mutation({
  args: {
    id: v.id("contactSubmissions"),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("replied")),
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now();
    
    await ctx.db.patch(args.id, {
      status: args.status,
      processedAt: args.status !== "pending" ? currentTime : undefined,
    });
    
    return { success: true };
  },
});

// Query to get contact form statistics
export const getContactFormStats = query({
  handler: async (ctx) => {
    const allSubmissions = await ctx.db.query("contactSubmissions").collect();
    
    const stats = {
      total: allSubmissions.length,
      pending: allSubmissions.filter(s => s.status === "pending").length,
      processed: allSubmissions.filter(s => s.status === "processed").length,
      replied: allSubmissions.filter(s => s.status === "replied").length,
      emailsSent: allSubmissions.filter(s => s.emailSent).length,
      emailsFailed: allSubmissions.filter(s => !s.emailSent).length,
    };
    
    return stats;
  },
});