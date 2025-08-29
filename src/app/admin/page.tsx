"use client";

import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  // Fetch real data
  const userStats = useQuery(api.users.getUserStats, {});
  const donationStats = useQuery(api.donations.getStats, {});
  const campaignStats = useQuery(api.campaigns.getStats, {});
  const recentCampaigns = useQuery(api.campaigns.list, { limit: 4 });
  const recentDonations = useQuery(api.donations.getRecentActivity, {
    limit: 5,
  });

  const isLoading = !userStats || !donationStats || !campaignStats;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    }
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

  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your donation
            platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button
            onClick={() => {
              router.push("/admin/campaigns/new");
            }}
          >
            <Target className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Donations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(donationStats?.totalAmount || 0)}
              </div>
            )}
            <div className="flex items-center text-xs mt-1">
              <span className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-3 w-16" />
                ) : (
                  `${donationStats?.totalDonations || 0} total donations`
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {campaignStats?.activeCampaigns || 0}
              </div>
            )}
            <div className="flex items-center text-xs mt-1">
              <span className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-3 w-20" />
                ) : (
                  `${campaignStats?.totalCampaigns || 0} total campaigns`
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {userStats?.totalUsers || 0}
              </div>
            )}
            <div className="flex items-center text-xs mt-1">
              <span className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-3 w-16" />
                ) : (
                  `${userStats?.activeUsers || 0} active users`
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Raised */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Raised
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(campaignStats?.totalRaised || 0)}
              </div>
            )}
            <div className="flex items-center text-xs mt-1">
              <span className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-3 w-20" />
                ) : (
                  `${campaignStats?.completedCampaigns || 0} completed campaigns`
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>
                  Latest campaign activity and performance
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/campaigns">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!recentCampaigns ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))
                ) : recentCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No campaigns yet</p>
                    <p className="text-sm">
                      Create your first campaign to get started
                    </p>
                  </div>
                ) : (
                  recentCampaigns.map((campaign) => (
                    <div
                      key={campaign._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm">
                            {campaign.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                          >
                            {campaign.status}
                          </span>
                          {campaign.urgency && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(campaign.urgency)}`}
                            >
                              {campaign.urgency}
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>
                              {formatCurrency(campaign.currentAmount)} raised
                            </span>
                            <span>
                              {formatCurrency(campaign.goalAmount)} goal
                            </span>
                          </div>
                          <Progress
                            value={getProgressPercentage(
                              campaign.currentAmount,
                              campaign.goalAmount
                            )}
                            className="h-2"
                          />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{campaign.category}</span>
                          <span>
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/campaigns/${campaign._id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/campaigns/${campaign._id}/edit`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Recent Donations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donation activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/donations">
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!recentDonations ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No donations yet</p>
                    <p className="text-sm">
                      Donations will appear here once received
                    </p>
                  </div>
                ) : (
                  recentDonations.map((donation) => (
                    <div
                      key={donation._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {donation.donor?.name || "Anonymous"}
                          </span>
                          <span className="font-bold text-emerald-500">
                            {formatCurrency(donation.amount)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {donation.campaign?.title || "Unknown Campaign"} •{" "}
                          {getTimeAgo(donation.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
