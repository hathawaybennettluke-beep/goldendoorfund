"use client";

import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Tag,
  ArrowLeft,
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Fetch the blog post by slug
  const post = useQuery(api.blog.getBlogPostBySlug, { slug });

  // Loading state
  if (post === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  // Post not found
  if (post === null) {
    return (
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Not published";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Impact Stories": "bg-purple-100 text-purple-800",
      Technology: "bg-blue-100 text-blue-800",
      Education: "bg-green-100 text-green-800",
      "Emergency Relief": "bg-red-100 text-red-800",
      "Success Stories": "bg-orange-100 text-orange-800",
      "Community Updates": "bg-teal-100 text-teal-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Read Later
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <Badge className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              <img
                src={
                  post.author?.profileImage ||
                  "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                }
                alt={post.author?.name || "Author"}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold">
                  {post.author?.name || "Anonymous"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Published on {formatDate(post.publishedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <section className="py-8">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg max-w-none"
              style={{
                lineHeight: "1.75",
                fontSize: "1.125rem",
              }}
            >
              {/* For now, display content as plain text with basic formatting */}
              {post.content.split("\n\n").map((paragraph, index) => {
                // Handle headers
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }

                // Handle lists
                if (paragraph.includes("- ") || paragraph.includes("1. ")) {
                  const items = paragraph
                    .split("\n")
                    .filter((line) => line.trim());
                  return (
                    <ul key={index} className="mb-6 space-y-2">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex} className="ml-6">
                          {item.replace(/^- |^\d+\. /, "")}
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Regular paragraphs
                return (
                  <p key={index} className="mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Author Bio */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-background rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">About the Author</h3>
              <div className="flex items-start gap-4">
                <img
                  src={
                    post.author?.profileImage ||
                    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                  }
                  alt={post.author?.name || "Author"}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-lg">
                    {post.author?.name || "Anonymous"}
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    A passionate writer dedicated to sharing impactful stories
                    and insights from our community of donors and changemakers.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      More Posts
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Inspired by this story?</h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of others making a difference in communities around
              the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Start a Campaign
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Make a Donation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
