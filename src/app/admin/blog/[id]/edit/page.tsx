"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Trash2,
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
import Link from "next/link";

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

// Mock data for the existing post
const mockPost = {
  id: "1",
  title: "The Impact of Clean Water Projects in Rural Communities",
  excerpt:
    "Exploring how access to clean water transforms entire communities, from health improvements to educational opportunities and economic growth.",
  content: `Clean water is a fundamental human right, yet millions of people around the world still lack access to this basic necessity. In this comprehensive analysis, we explore how our clean water projects in rural communities have created transformational change that extends far beyond the initial investment.

## The Ripple Effect of Clean Water

When we install a well or water purification system in a rural community, the immediate benefit is obvious: people have access to clean, safe drinking water. However, the secondary and tertiary effects are what truly demonstrate the power of this intervention.

### Health Improvements

Access to clean water dramatically reduces waterborne diseases such as cholera, dysentery, and typhoid. In the communities where we've worked, we've seen:

- 60% reduction in waterborne illness
- 40% decrease in child mortality rates
- Significant improvements in maternal health

### Educational Opportunities

When children (especially girls) don't have to spend hours each day collecting water, they can attend school. Our data shows:

- 35% increase in school enrollment
- 50% improvement in girls' education completion rates
- Better academic performance across all age groups

### Economic Growth

With better health and education comes economic opportunity. Communities with access to clean water have experienced:

- 25% increase in household income
- New businesses and microenterprises
- Improved agricultural productivity

## Long-term Sustainability

Our approach focuses on community ownership and maintenance training to ensure these benefits last for generations. We provide:

1. Technical training for local technicians
2. Establishment of water committees
3. Ongoing support and monitoring
4. Emergency repair protocols

## The Path Forward

As we look to the future, we're committed to expanding our clean water initiatives while continuing to support existing projects. Every dollar invested in clean water generates an estimated $4-7 in economic returns for the community.

The transformation we've witnessed in these communities is a testament to the power of addressing basic human needs. Clean water is not just about survival—it's about giving people the foundation they need to thrive.`,
  category: "Impact Stories",
  tags: ["Water", "Community Development", "Health"],
  status: "published",
  featured: true,
  publishedAt: "2024-10-20",
  createdAt: "2024-10-19",
  lastEdited: "2024-10-20",
  metaTitle: "Clean Water Projects: Transforming Rural Communities",
  metaDescription:
    "Discover how clean water access creates lasting change in rural communities, improving health, education, and economic opportunities.",
  author: {
    name: "Sarah Johnson",
    role: "Impact Research Director",
  },
  featuredImageUrl:
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
};

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTagInput, setSelectedTagInput] = useState("");

  // Load post data on component mount
  useEffect(() => {
    const loadPost = async () => {
      try {
        // In a real implementation, you would fetch from Convex
        // const post = await ctx.query(api.blog.getBlogPostById, { id: params.id });

        // For now, use mock data
        setFormData({
          title: mockPost.title,
          excerpt: mockPost.excerpt,
          content: mockPost.content,
          category: mockPost.category,
          tags: mockPost.tags,
          status: mockPost.status,
          featured: mockPost.featured,
          metaTitle: mockPost.metaTitle,
          metaDescription: mockPost.metaDescription,
        });

        setFeaturedImagePreview(mockPost.featuredImageUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading post:", error);
        setIsLoading(false);
      }
    };

    loadPost();
  }, [params.id]);

  const handleInputChange = (field: string, value: any) => {
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

  const handleSave = async (status?: "draft" | "published") => {
    setIsSaving(true);

    try {
      const updateData = {
        ...formData,
        ...(status && { status }),
      };

      // In a real implementation, you would:
      // 1. Upload the featured image if changed
      // 2. Update the blog post with Convex mutation
      // 3. Handle success/error states

      console.log("Updating blog post:", updateData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (status === "published") {
        router.push("/admin/blog?success=published");
      } else {
        router.push("/admin/blog?success=updated");
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      try {
        // In a real implementation, you would call the delete mutation
        console.log("Deleting blog post:", params.id);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        router.push("/admin/blog?success=deleted");
      } catch (error) {
        console.error("Error deleting blog post:", error);
      }
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-foreground">Edit Post</h1>
            <p className="text-sm text-muted-foreground">
              Last edited {mockPost.lastEdited} •{" "}
              {calculateReadTime(formData.content)} min read
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => handleSave("published")} disabled={isSaving}>
            <Globe className="h-4 w-4 mr-2" />
            {isSaving ? "Updating..." : "Update & Publish"}
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
              <CardDescription>Edit your blog post content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter your blog post title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-lg font-medium"
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
                />
                <p className="text-xs text-muted-foreground">
                  {formData.excerpt.length}/300 characters
                </p>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Write your blog post content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={25}
                  className="min-h-[500px] font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.split(/\s+/).length} words •{" "}
                  {calculateReadTime(formData.content)} min read
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
                Update the featured image for your blog post
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
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFeaturedImage(null);
                          setFeaturedImagePreview("");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
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
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
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
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Tag */}
              <div className="flex gap-2">
                <Select
                  value={selectedTagInput}
                  onValueChange={setSelectedTagInput}
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
                  disabled={!selectedTagInput}
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
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
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
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaTitle.length}/60 characters
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
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {mockPost.createdAt}
                </p>
                <p>
                  <span className="font-medium">Published:</span>{" "}
                  {mockPost.publishedAt}
                </p>
                <p>
                  <span className="font-medium">Author:</span>{" "}
                  {mockPost.author.name}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleSave("published")}
                  disabled={isSaving}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {isSaving ? "Updating..." : "Update & Publish"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
