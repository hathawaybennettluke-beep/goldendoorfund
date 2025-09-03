"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Search,
  Filter,
  Heart,
  Users,
  Target,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// For now, we'll use a placeholder image for campaigns without images
const getCampaignImage = (imageUrl?: string) => {
  return (
    imageUrl ||
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
  );
};

export default function CampaignsManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") || "all"
  );
  const [selectedUrgency, setSelectedUrgency] = useState(
    searchParams.get("urgency") || "all"
  );

  // Fetch campaigns from Convex
  const campaigns = useQuery(api.campaigns.list, {
    status:
      selectedStatus === "all"
        ? undefined
        : (selectedStatus as "active" | "completed" | "upcoming" | "draft"),
    category: selectedCategory === "all" ? undefined : selectedCategory,
    urgency:
      selectedUrgency === "all"
        ? undefined
        : (selectedUrgency as "high" | "medium" | "low"),
    search: searchTerm || undefined,
  });

  // Get unique categories for filter
  const categories = Array.from(
    new Set((campaigns || []).map((c) => c.category))
  );

  // Function to update URL with current filter state
  const updateURL = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const newURL = params.toString() ? `?${params.toString()}` : "/campaigns";
      router.push(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  // Filter and search campaigns (filtering is now handled by Convex query)
  const filteredCampaigns = campaigns || [];

  // Track if we're updating from URL to prevent loops
  const [isUpdatingFromURL, setIsUpdatingFromURL] = useState(false);

  // Sync state with URL params on mount and when searchParams change
  useEffect(() => {
    setIsUpdatingFromURL(true);
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "all");
    setSelectedStatus(searchParams.get("status") || "all");
    setSelectedUrgency(searchParams.get("urgency") || "all");
    setIsUpdatingFromURL(false);
  }, [searchParams]);

  // Debounce search updates (only when not updating from URL)
  useEffect(() => {
    if (isUpdatingFromURL) return;

    const timeoutId = setTimeout(() => {
      updateURL({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        urgency: selectedUrgency,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedUrgency,
    isUpdatingFromURL,
    updateURL,
  ]);

  // Handlers for updating filters
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleUrgencyChange = (value: string) => {
    setSelectedUrgency(value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedUrgency("all");
    router.push("/campaigns", { scroll: false });
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Browse Campaigns
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover meaningful causes and make a difference in communities
              worldwide. Every donation, no matter the size, creates lasting
              impact.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 px-10 border-b bg-background">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search campaigns, organizations, or keywords..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>

              {categories.length > 0 && (
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.filter((categories) => categories.trim() !== "")?.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
              }

              <Select
                value={selectedUrgency}
                onValueChange={handleUrgencyChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-6 px-10 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredCampaigns.length} campaigns
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Active
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Completed
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                Upcoming
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      {campaigns === undefined ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      ) : (
        <section className="py-24 px-10">
          <div className="container">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold mb-4">
                  No campaigns found
                </h3>
                <p className="text-muted-foreground mb-8">
                  Try adjusting your search terms or filters to find more
                  campaigns.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns?.map((campaign) => (
                  <Link
                    key={campaign._id}
                    href={`/campaigns/${campaign._id}`}
                    className="group block"
                  >
                    <div className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
                      <div className="relative">
                        <img
                          src={getCampaignImage(campaign.imageUrl)}
                          alt={campaign.title}
                          className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                        />

                        {/* Status and Urgency Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(campaign.status)}`}
                          >
                            {campaign.status.charAt(0).toUpperCase() +
                              campaign.status.slice(1)}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getUrgencyColor(campaign.urgency)}`}
                          >
                            {campaign.urgency.charAt(0).toUpperCase() +
                              campaign.urgency.slice(1)}
                          </span>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {campaign.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold line-clamp-2 mb-2">
                            {campaign.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {campaign.description}
                          </p>

                          {/* Organization and Location */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{campaign.organization}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {campaign.location}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {campaign.status !== "upcoming" && (
                          <div className="mb-4">
                            <div className="mb-2 flex justify-between text-sm">
                              <span className="font-medium">
                                {formatCurrency(campaign.currentAmount)} raised
                              </span>
                              <span className="text-muted-foreground">
                                {formatCurrency(campaign.goalAmount)} goal
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-primary transition-all duration-300"
                                style={{
                                  width: `${getProgressPercentage(campaign.currentAmount, campaign.goalAmount)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {/* TODO: Add donor count from payments.getDonationStats */}
                            0 donors
                          </span>
                          {campaign.status !== "upcoming" && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {Math.round(
                                getProgressPercentage(
                                  campaign.currentAmount,
                                  campaign.goalAmount
                                )
                              )}
                              % funded
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        </div>

                        <Button className="w-full" variant="outline">
                          <Heart className="mr-2 h-4 w-4" />
                          {campaign.status === "upcoming"
                            ? "Follow Campaign"
                            : "Donate Now"}
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
