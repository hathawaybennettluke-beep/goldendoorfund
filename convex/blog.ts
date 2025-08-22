import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to get Convex user ID from Clerk authentication
// async function getCurrentConvexUserId(ctx: any) {
//   const identity = await ctx.auth.getUserIdentity();
//   if (!identity) {
//     throw new Error("User not authenticated");
//   }

//   const user = await ctx.db
//     .query("users")
//     .withIndex("by_email", (q) => q.eq("email", identity.email!))
//     .first();

//   if (!user) {
//     throw new Error(
//       "User not found in database. Please ensure user sync is working."
//     );
//   }

//   return user._id;
// }

// Utility function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Utility function to calculate read time
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// CREATE BLOG POST
export const createBlogPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    featured: v.boolean(),
    featuredImageId: v.optional(v.id("_storage")),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the Convex user ID for the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error(
        "User not found in database. Please ensure user sync is working."
      );
    }

    const authorId = user._id;

    const slug = generateSlug(args.title);
    const readTime = calculateReadTime(args.content);
    const now = Date.now();

    // Check if slug already exists
    const existingPost = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    let finalSlug = slug;
    if (existingPost) {
      finalSlug = `${slug}-${now}`;
    }

    // Get featured image URL if image ID is provided
    let featuredImageUrl: string | undefined;
    if (args.featuredImageId) {
      const url = await ctx.storage.getUrl(args.featuredImageId);
      featuredImageUrl = url || undefined;
    }

    const blogPostId = await ctx.db.insert("blogPosts", {
      title: args.title,
      content: args.content,
      excerpt: args.excerpt,
      slug: finalSlug,
      authorId: authorId,
      featuredImageId: args.featuredImageId,
      featuredImageUrl,
      category: args.category,
      tags: args.tags,
      status: args.status,
      featured: args.featured,
      readTime,
      publishedAt: args.status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
    });

    return blogPostId;
  },
});

// UPDATE BLOG POST
export const updateBlogPost = mutation({
  args: {
    id: v.id("blogPosts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))
    ),
    featured: v.optional(v.boolean()),
    featuredImageId: v.optional(v.id("_storage")),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existingPost = await ctx.db.get(id);
    if (!existingPost) {
      throw new Error("Blog post not found");
    }

    const updateData: Partial<typeof existingPost> = {
      ...updates,
      updatedAt: Date.now(),
    };

    // Update slug if title changed
    if (updates.title && updates.title !== existingPost.title) {
      const newSlug = generateSlug(updates.title);
      const existingSlugPost = await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();

      if (existingSlugPost && existingSlugPost._id !== id) {
        updateData.slug = `${newSlug}-${Date.now()}`;
      } else {
        updateData.slug = newSlug;
      }
    }

    // Update read time if content changed
    if (updates.content) {
      updateData.readTime = calculateReadTime(updates.content);
    }

    // Update published date if status changed to published
    if (updates.status === "published" && existingPost.status !== "published") {
      updateData.publishedAt = Date.now();
    }

    // Get featured image URL if image ID is provided
    if (updates.featuredImageId) {
      const url = await ctx.storage.getUrl(updates.featuredImageId);
      updateData.featuredImageUrl = url || undefined;
    }

    await ctx.db.patch(id, updateData);
    return id;
  },
});

// DELETE BLOG POST
export const deleteBlogPost = mutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const existingPost = await ctx.db.get(args.id);
    if (!existingPost) {
      throw new Error("Blog post not found");
    }

    // Delete the featured image from storage if it exists
    if (existingPost.featuredImageId) {
      await ctx.storage.delete(existingPost.featuredImageId);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// GET ALL BLOG POSTS (Admin)
export const getAllBlogPosts = query({
  args: {
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))
    ),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let posts;

    if (args.status) {
      posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status as "draft" | "published" | "archived")
        )
        .order("desc")
        .collect();
    } else {
      posts = await ctx.db.query("blogPosts").order("desc").collect();
    }
    // Filter by category if specified
    const filteredPosts = args.category
      ? posts.filter((post) => post.category === args.category)
      : posts;

    // Apply pagination
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    // Get author information for each post
    const postsWithAuthors = await Promise.all(
      paginatedPosts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                email: author.email,
                profileImage: author.profileImage,
              }
            : null,
        };
      })
    );

    return {
      posts: postsWithAuthors,
      total: filteredPosts.length,
      hasMore: offset + limit < filteredPosts.length,
    };
  },
});

// GET PUBLISHED BLOG POSTS (Public)
export const getPublishedBlogPosts = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    if (args.featured) {
      query = ctx.db
        .query("blogPosts")
        .withIndex("by_featured", (q) =>
          q.eq("featured", true).eq("status", "published")
        );
    }

    const posts = await query.order("desc").collect();

    // Filter by category if specified
    const filteredPosts = args.category
      ? posts.filter((post) => post.category === args.category)
      : posts;

    // Apply pagination
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    // Get author information for each post
    const postsWithAuthors = await Promise.all(
      paginatedPosts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                email: author.email,
                profileImage: author.profileImage,
              }
            : null,
        };
      })
    );

    return {
      posts: postsWithAuthors,
      total: filteredPosts.length,
      hasMore: offset + limit < filteredPosts.length,
    };
  },
});

// GET BLOG POST BY ID
export const getBlogPostById = query({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      return null;
    }

    const author = await ctx.db.get(post.authorId);
    return {
      ...post,
      author: author
        ? {
            _id: author._id,
            name: author.name,
            email: author.email,
            profileImage: author.profileImage,
          }
        : null,
    };
  },
});

// GET BLOG POST BY SLUG
export const getBlogPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post || post.status !== "published") {
      return null;
    }

    const author = await ctx.db.get(post.authorId);
    return {
      ...post,
      author: author
        ? {
            _id: author._id,
            name: author.name,
            email: author.email,
            profileImage: author.profileImage,
          }
        : null,
    };
  },
});

// BLOG CATEGORIES CRUD
export const createBlogCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = generateSlug(args.name);

    // Check if slug already exists
    const existingCategory = await ctx.db
      .query("blogCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    return await ctx.db.insert("blogCategories", {
      name: args.name,
      slug,
      description: args.description,
      color: args.color,
      createdAt: Date.now(),
    });
  },
});

export const getAllBlogCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("blogCategories").order("asc").collect();
  },
});

export const deleteBlogCategory = mutation({
  args: { id: v.id("blogCategories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// GENERATE UPLOAD URL FOR IMAGES
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
