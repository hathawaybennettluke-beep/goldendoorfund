"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Eye,
  Upload,
  Image,
  Calendar,
  Tag,
  FileText,
  Settings,
  ArrowLeft,
  Star,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "convex/react";
import { useImageUpload } from "@/hooks/useImageUpload";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";

const categories = [
  "Impact Stories",
  "Technology",
  "Education",
  "Emergency Relief",
  "Success Stories",
  "Community Updates",
];

const availableTags = [
  "Water",
  "Community Development",
  "Health",
  "Innovation",
  "Blockchain",
  "AI",
  "Sustainability",
  "Education",
  "Long-term Impact",
  "Emergency Response",
  "Disaster Relief",
  "Crisis Management",
  "Transparency",
  "Annual Report",
  "Impact",
  "Women's Empowerment",
  "Microfinance",
  "Economic Development",
];

export default function NewBlogPost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [] as string[],
    status: "draft",
    featured: false,
    metaTitle: "",
    metaDescription: "",
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTagInput, setSelectedTagInput] = useState("");

  // Convex mutations
  const createBlogPost = useMutation(api.blog.createBlogPost);
  const { uploadImage, isUploading } = useImageUpload();

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange("tags", [...formData.tags, tag]);
      setSelectedTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!formData.title.trim()) {
      alert("Please enter a title for your blog post.");
      return;
    }

    if (!formData.content.trim()) {
      alert("Please enter content for your blog post.");
      return;
    }

    if (!formData.category) {
      alert("Please select a category for your blog post.");
      return;
    }

    setIsPublishing(true);

    try {
      let featuredImageId = undefined;

      // Upload featured image if provided
      if (featuredImage) {
        featuredImageId = await uploadImage(featuredImage);
      }

      // Create the blog post
      const blogPostId = await createBlogPost({
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + "...",
        category: formData.category,
        tags: formData.tags,
        status: status as "draft" | "published" | "archived",
        featured: formData.featured,
        featuredImageId: featuredImageId || undefined,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt,
      });

      // Success! Redirect to blog management
      if (status === "published") {
        router.push("/admin/blog?success=published");
      } else {
        router.push("/admin/blog?success=saved");
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert("There was an error saving your blog post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const calculateReadTime = (content: string) => {
    if (!content.trim()) return 0;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const isLoading = isPublishing || isUploading;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Create New Post
            </h1>
            <p className="text-sm text-muted-foreground">
              {isUploading && "Uploading image... • "}
              {isPublishing && "Saving post... • "}
              {calculateReadTime(formData.content)} min read
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isPublishing && formData.status === "draft"
              ? "Saving..."
              : "Save Draft"}
          </Button>
          <Button variant="outline" disabled={isLoading}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => handleSave("published")} disabled={isLoading}>
            <Globe className="h-4 w-4 mr-2" />
            {isPublishing && formData.status === "published"
              ? "Publishing..."
              : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Post Content
              </CardTitle>
              <CardDescription>
                Create engaging content for your audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter your blog post title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-lg font-medium"
                  disabled={isLoading}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Excerpt</label>
                <Textarea
                  placeholder="Write a compelling excerpt that summarizes your post..."
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.excerpt.length}/300 characters
                  {!formData.excerpt &&
                    " (will auto-generate from content if empty)"}
                </p>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Content <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Write your blog post content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={20}
                  className="min-h-[400px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {
                    formData.content
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  }{" "}
                  words • {calculateReadTime(formData.content)} min read
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Featured Image
              </CardTitle>
              <CardDescription>
                Upload an image to represent your blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredImagePreview ? (
                  <div className="relative">
                    <img
                      src={featuredImagePreview}
                      alt="Featured image preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFeaturedImage(null);
                        setFeaturedImagePreview("");
                      }}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-sm">Uploading...</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors ${
                      isLoading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-muted-foreground/50"
                    }`}
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload featured image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Post Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Post */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Featured Post</label>
                <Button
                  variant={formData.featured ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleInputChange("featured", !formData.featured)
                  }
                  disabled={isLoading}
                >
                  <Star
                    className={`h-4 w-4 mr-1 ${formData.featured ? "fill-current" : ""}`}
                  />
                  {formData.featured ? "Featured" : "Feature"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
              <CardDescription>
                Add tags to help categorize your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Tag */}
              <div className="flex gap-2">
                <Select
                  value={selectedTagInput}
                  onValueChange={setSelectedTagInput}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter((tag) => !formData.tags.includes(tag))
                      .map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => addTag(selectedTagInput)}
                  disabled={!selectedTagInput || isLoading}
                  size="sm"
                >
                  Add
                </Button>
              </div>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={
                      isLoading ? "cursor-not-allowed" : "cursor-pointer"
                    }
                    onClick={() => !isLoading && removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Title</label>
                <Input
                  placeholder="Custom title for search engines"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    handleInputChange("metaTitle", e.target.value)
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaTitle.length}/60 characters
                  {!formData.metaTitle && " (will use post title if empty)"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea
                  placeholder="Brief description for search results"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription.length}/160 characters
                  {!formData.metaDescription && " (will use excerpt if empty)"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Status:</span> Ready to save
                </p>
                <p>
                  <span className="font-medium">Visibility:</span> Public
                </p>
                <p>
                  <span className="font-medium">Publish:</span> Immediately
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleSave("published")}
                  disabled={isLoading}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {isPublishing ? "Publishing..." : "Publish Now"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSave("draft")}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
