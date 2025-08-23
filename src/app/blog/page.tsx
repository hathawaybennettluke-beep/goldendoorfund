"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Clock, ArrowRight, Sparkles, Star, Filter, TrendingUp } from "lucide-react";
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
import { Footer } from "@/components/Footer";

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
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      role: "Impact Research Director",
    },
    publishedAt: "2024-10-20",
    readTime: 8,
    category: "Impact Stories",
    tags: ["Water", "Community Development", "Health"],
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
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
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      role: "Technology Lead",
    },
    publishedAt: "2024-10-18",
    readTime: 6,
    category: "Technology",
    tags: ["Innovation", "Blockchain", "AI"],
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
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
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      role: "Education Program Manager",
    },
    publishedAt: "2024-10-15",
    readTime: 10,
    category: "Education",
    tags: ["Sustainability", "Education", "Long-term Impact"],
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80",
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
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      role: "Emergency Response Coordinator",
    },
    publishedAt: "2024-10-12",
    readTime: 7,
    category: "Emergency Relief",
    tags: ["Emergency Response", "Disaster Relief", "Crisis Management"],
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
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
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      role: "Impact Research Director",
    },
    publishedAt: "2024-10-10",
    readTime: 12,
    category: "Impact Stories",
    tags: ["Transparency", "Annual Report", "Impact"],
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
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
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      role: "Education Program Manager",
    },
    publishedAt: "2024-10-08",
    readTime: 9,
    category: "Success Stories",
    tags: ["Women's Empowerment", "Microfinance", "Economic Development"],
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
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
      {/* Enhanced Hero Section */}
      <section className="relative py-32 px-10 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 h-48 w-48 rounded-full bg-secondary/10 blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 blur-3xl opacity-30" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-semibold text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm">
              <TrendingUp className="h-4 w-4" />
              Latest Updates & Stories
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Stories of Impact
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Discover inspiring stories, insights, and updates from our
              community of donors, organizations, and the people whose lives are
              being transformed.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-24 px-10 bg-gradient-to-br from-muted/30 to-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
                <Star className="h-4 w-4" />
                Featured Stories
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                Must-Read Impact Stories
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our most compelling stories that showcase the real impact of your donations
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {featuredPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30 hover:bg-card/80">
                    <div className="relative">
                      <img
                        src={
                          post.featuredImageUrl ||
                          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        }
                        alt={post.title}
                        className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          Featured
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-background/90 text-foreground px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {post.readTime} min read
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              post.author?.profileImage ||
                              "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                            }
                            alt={post.author?.name || "Author"}
                            className="w-10 h-10 rounded-full border-2 border-primary/20"
                          />
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {post.author?.name || "Anonymous"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Author
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Search and Filter */}
      <section className="py-16 px-10 border-b bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Enhanced Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search articles, authors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            {/* Enhanced Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters:
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
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
                <SelectTrigger className="w-[140px] h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
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

      {/* Enhanced Results Summary */}
      <section className="py-8 px-10 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              Showing {filteredAndSortedPosts.length} of {blogPosts.length}{" "}
              articles
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                Featured
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                Regular
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Blog Posts Grid */}
      <section className="py-24 px-10">
        <div className="container">
          {filteredAndSortedPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No articles found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters to find more
                articles.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSortBy("newest");
                }}
                className="px-8 py-3 h-12 text-lg font-semibold"
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
                  <article className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30 hover:bg-card/80">
                    <div className="relative">
                      <img
                        src={
                          post.featuredImageUrl ||
                          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        }
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-background/90 text-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {post.readTime} min
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-medium"
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
                              "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                            }
                            alt={post.author?.name || "Author"}
                            className="w-8 h-8 rounded-full border-2 border-primary/20"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {post.author?.name || "Anonymous"}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Newsletter CTA */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4" />
              Stay Updated
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Never Miss an Impact Story
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Subscribe to our newsletter to get the latest impact stories,
              campaign updates, and insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                type="email"
                className="flex-1 h-12 text-lg border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
              <Button className="px-8 py-3 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
