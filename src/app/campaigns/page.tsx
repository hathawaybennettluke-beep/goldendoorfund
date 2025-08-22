"use client";

import { useState, useMemo } from "react";
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

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  category: string;
  location: string;
  status: "active" | "completed" | "upcoming";
  urgency: "high" | "medium" | "low";
  endDate: string;
  organizationName: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Water Wells for Rural Communities",
    description:
      "Providing clean, safe drinking water to remote villages in East Africa. Each well serves 500+ people and includes maintenance training for local communities.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 45000,
    goal: 75000,
    donors: 234,
    category: "Water & Sanitation",
    location: "East Africa",
    status: "active",
    urgency: "high",
    endDate: "2024-12-15",
    organizationName: "Water for Life Foundation",
  },
  {
    id: "2",
    title: "School Supplies for Underprivileged Children",
    description:
      "Ensuring every child has access to basic educational materials and books for the upcoming school year. Supporting 500+ students across 10 schools.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 28000,
    goal: 40000,
    donors: 156,
    category: "Education",
    location: "Rural Bangladesh",
    status: "active",
    urgency: "medium",
    endDate: "2024-11-30",
    organizationName: "Education First Initiative",
  },
  {
    id: "3",
    title: "Mobile Medical Clinic for Remote Areas",
    description:
      "Bringing essential healthcare services to communities without access to medical facilities. Includes equipment, staff training, and transportation.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 100000,
    goal: 100000,
    donors: 389,
    category: "Healthcare",
    location: "Amazon Basin, Brazil",
    status: "completed",
    urgency: "high",
    endDate: "2024-10-15",
    organizationName: "Doctors Without Borders",
  },
  {
    id: "4",
    title: "Reforestation Project - Plant 10,000 Trees",
    description:
      "Combat climate change by planting native trees in deforested areas. Includes community education and long-term forest management.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 0,
    goal: 25000,
    donors: 0,
    category: "Environment",
    location: "Costa Rica",
    status: "upcoming",
    urgency: "medium",
    endDate: "2025-03-01",
    organizationName: "Green Earth Coalition",
  },
  {
    id: "5",
    title: "Emergency Food Relief for Disaster Victims",
    description:
      "Providing immediate food assistance to families affected by recent flooding. Includes emergency supplies and nutrition support for children.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 85000,
    goal: 120000,
    donors: 567,
    category: "Emergency Relief",
    location: "Philippines",
    status: "active",
    urgency: "high",
    endDate: "2024-12-31",
    organizationName: "Global Relief Network",
  },
  {
    id: "6",
    title: "Women's Empowerment Microfinance Program",
    description:
      "Supporting women entrepreneurs with small loans and business training to start sustainable businesses in their communities.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 62000,
    goal: 80000,
    donors: 298,
    category: "Economic Development",
    location: "Rural India",
    status: "active",
    urgency: "low",
    endDate: "2025-01-15",
    organizationName: "Women Rising Foundation",
  },
];

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");

  // Get unique categories for filter
  const categories = Array.from(new Set(mockCampaigns.map((c) => c.category)));

  // Filter and search campaigns
  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.organizationName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || campaign.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || campaign.status === selectedStatus;
      const matchesUrgency =
        selectedUrgency === "all" || campaign.urgency === selectedUrgency;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesUrgency
      );
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedUrgency]);

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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "upcoming":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
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

              <Select
                value={selectedUrgency}
                onValueChange={setSelectedUrgency}
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
              Showing {filteredCampaigns.length} of {mockCampaigns.length}{" "}
              campaigns
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
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                  setSelectedUrgency("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
                    <div className="relative">
                      <img
                        src={campaign.image}
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
                          <span>{campaign.organizationName}</span>
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
                              {formatCurrency(campaign.raised)} raised
                            </span>
                            <span className="text-muted-foreground">
                              {formatCurrency(campaign.goal)} goal
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-primary transition-all duration-300"
                              style={{
                                width: `${getProgressPercentage(campaign.raised, campaign.goal)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.donors} donors
                        </span>
                        {campaign.status !== "upcoming" && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {Math.round(
                              getProgressPercentage(
                                campaign.raised,
                                campaign.goal
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
    </div>
  );
}
