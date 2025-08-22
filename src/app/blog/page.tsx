"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
}

// Mock data kept for fallback - will be removed when Convex is fully integrated
const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Impact of Clean Water Projects in Rural Communities",
    excerpt:
      "Exploring how access to clean water transforms entire communities, from health improvements to educational opportunities and economic growth.",
    content: "Full blog content would go here...",
    author: {
      name: "Sarah Johnson",
      avatar:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
      role: "Impact Research Director",
    },
    publishedAt: "2024-10-20",
    readTime: 8,
    category: "Impact Stories",
    tags: ["Water", "Community Development", "Health"],
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    featured: true,
  },
  {
    id: "2",
    title: "How Technology is Revolutionizing Charitable Giving",
    excerpt:
      "From blockchain transparency to AI-powered matching, discover how technology is making donations more effective and trustworthy.",
    content: "Full blog content would go here...",
    author: {
      name: "Michael Chen",
      avatar:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
      role: "Technology Lead",
    },
    publishedAt: "2024-10-18",
    readTime: 6,
    category: "Technology",
    tags: ["Innovation", "Blockchain", "AI"],
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    featured: false,
  },
  {
    id: "3",
    title: "Building Sustainable Education Programs That Last",
    excerpt:
      "Learn about our approach to creating educational initiatives that continue to benefit communities long after initial funding ends.",
    content: "Full blog content would go here...",
    author: {
      name: "Emily Rodriguez",
      avatar:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
      role: "Education Program Manager",
    },
    publishedAt: "2024-10-15",
    readTime: 10,
    category: "Education",
    tags: ["Sustainability", "Education", "Long-term Impact"],
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    featured: true,
  },
  {
    id: "4",
    title: "Emergency Response: Lessons from Recent Disaster Relief",
    excerpt:
      "Insights from our emergency response teams on what works, what doesn't, and how communities can better prepare for disasters.",
    content: "Full blog content would go here...",
    author: {
      name: "David Thompson",
      avatar:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
      role: "Emergency Response Coordinator",
    },
    publishedAt: "2024-10-12",
    readTime: 7,
    category: "Emergency Relief",
    tags: ["Emergency Response", "Disaster Relief", "Crisis Management"],
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    featured: false,
  },
  {
    id: "5",
    title: "Transparency in Action: Our 2024 Impact Report",
    excerpt:
      "A comprehensive look at how your donations made a difference this year, with detailed breakdowns and beneficiary stories.",
    content: "Full blog content would go here...",
    author: {
      name: "Sarah Johnson",
      avatar:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
      role: "Impact Research Director",
    },
    publishedAt: "2024-10-10",
    readTime: 12,
    category: "Impact Stories",
    tags: ["Transparency", "Annual Report", "Impact"],
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    featured: false,
  },
  {
    id: "6",
    title: "Women's Empowerment Through Microfinance: Success Stories",
    excerpt:
      "Meet the inspiring women who have transformed their communities through our microfinance programs and business training initiatives.",
    content: "Full blog content would go here...",
    author: {
      name: "Emily Rodriguez",
      avatar:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
      role: "Education Program Manager",
    },
    publishedAt: "2024-10-08",
    readTime: 9,
    category: "Success Stories",
    tags: ["Women's Empowerment", "Microfinance", "Economic Development"],
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    featured: false,
  },
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch published blog posts from Convex
  const blogPostsResult = useQuery(api.blog.getPublishedBlogPosts, {
    limit: 50,
  });

  const blogPosts = useMemo(
    () => blogPostsResult?.posts || [],
    [blogPostsResult?.posts]
  );

  // Get unique categories
  const categories = Array.from(
    new Set(blogPosts.map((post) => post.category))
  );

  // Filter and sort blog posts
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.publishedAt || 0) - (a.publishedAt || 0);
        case "oldest":
          return (a.publishedAt || 0) - (b.publishedAt || 0);
        case "readTime":
          return a.readTime - b.readTime;
        default:
          return 0;
      }
    });

    return filtered;
  }, [blogPosts, searchTerm, selectedCategory, sortBy]);

  const featuredPosts = blogPosts.filter((post) => post.featured);

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Not published";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (!blogPostsResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Stories of Impact
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover inspiring stories, insights, and updates from our
              community of donors, organizations, and the people whose lives are
              being transformed.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 px-10 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Featured Stories</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative">
                      <img
                        src={
                          post.featuredImageUrl ||
                          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
                        }
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime} min read
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              post.author?.profileImage ||
                              "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                            }
                            alt={post.author?.name || "Author"}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {post.author?.name || "Anonymous"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Author
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <section className="py-12 px-10 border-b">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles, authors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="readTime">Read Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-6 px-10 bg-muted/30">
        <div className="container">
          <p className="text-muted-foreground">
            Showing {filteredAndSortedPosts.length} of {blogPosts.length}{" "}
            articles
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-24 px-10">
        <div className="container">
          {filteredAndSortedPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold mb-4">No articles found</h3>
              <p className="text-muted-foreground mb-8">
                Try adjusting your search terms or filters to find more
                articles.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSortBy("newest");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative">
                      <img
                        src={
                          post.featuredImageUrl ||
                          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
                        }
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-background/90 text-foreground px-2 py-1 rounded text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime} min
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              post.author?.profileImage ||
                              "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                            }
                            alt={post.author?.name || "Author"}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium">
                            {post.author?.name || "Anonymous"}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 px-10 bg-muted/50">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter to get the latest impact stories,
              campaign updates, and insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                type="email"
                className="flex-1"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
