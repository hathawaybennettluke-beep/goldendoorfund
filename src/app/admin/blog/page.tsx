"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";

export default function BlogManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Fetch all blog posts from Convex
  const allPostsResult = useQuery(api.blog.getAllBlogPosts, {
    limit: 100,
  });

  // Fetch categories
  const categoriesResult = useQuery(api.blog.getAllBlogCategories);

  const deleteBlogPost = useMutation(api.blog.deleteBlogPost);

  const blogPosts = useMemo(
    () => allPostsResult?.posts || [],
    [allPostsResult?.posts]
  );

  const categories = useMemo(() => {
    if (!categoriesResult) return ["All"];
    return ["All", ...categoriesResult.map((cat) => cat.name)];
  }, [categoriesResult]);

  const statuses = ["All", "Published", "Draft", "Archived"];

  // Calculate stats from real data
  const blogStats = useMemo(() => {
    const totalPosts = blogPosts.length;
    const publishedPosts = blogPosts.filter(
      (post) => post.status === "published"
    ).length;
    const draftPosts = blogPosts.filter(
      (post) => post.status === "draft"
    ).length;

    return [
      {
        title: "Total Posts",
        value: totalPosts.toString(),
        change: "+0",
        changeType: "positive" as const,
        icon: FileText,
        description: "All time",
      },
      {
        title: "Published",
        value: publishedPosts.toString(),
        change: "+0",
        changeType: "positive" as const,
        icon: Eye,
        description: "Live posts",
      },
      {
        title: "Draft Posts",
        value: draftPosts.toString(),
        change: "+0",
        changeType: "positive" as const,
        icon: Edit,
        description: "In progress",
      },
      {
        title: "Categories",
        value: (categoriesResult?.length || 0).toString(),
        change: "+0",
        changeType: "positive" as const,
        icon: TrendingUp,
        description: "Available",
      },
    ];
  }, [blogPosts, categoriesResult]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Impact Stories": "bg-purple-100 text-purple-800",
      Technology: "bg-blue-100 text-blue-800",
      Education: "bg-green-100 text-green-800",
      "Emergency Relief": "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Not published";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All" ||
        post.status === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogPosts, searchTerm, selectedCategory, selectedStatus]);

  const handleDeletePost = async (postId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      try {
        await deleteBlogPost({ id: postId as Id<"blogPosts"> });
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Error deleting post. Please try again.");
      }
    }
  };

  // Loading state
  if (!allPostsResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Blog Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your blog content
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Post
          </Button>
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {blogStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs">
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-emerald-500"
                        : "text-destructive"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Manage all your blog posts from this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search posts, authors, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {blogPosts.length} posts
            </p>
          </div>

          {/* Posts Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Post</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Read Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium line-clamp-1">
                            {post.title}
                          </h4>
                          {post.featured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {post.tags.length} tags
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={
                            post.author?.profileImage ||
                            "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp"
                          }
                          alt={post.author?.name || "Author"}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
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
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getCategoryColor(post.category)}
                      >
                        {post.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(post.publishedAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {post.readTime} min
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${post.slug}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Post
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/blog/${post._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Post
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Update Image
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {blogPosts.length === 0
                  ? "No blog posts yet. Create your first post to get started!"
                  : "Try adjusting your search terms or filters."}
              </p>
              <div className="flex gap-2 justify-center">
                {blogPosts.length > 0 && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setSelectedStatus("All");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
                <Button asChild>
                  <Link href="/admin/blog/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {blogPosts.length === 0 ? "Create First Post" : "New Post"}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
