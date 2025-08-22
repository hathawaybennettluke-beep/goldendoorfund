"use client";

import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
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
import Link from "next/link";

// Mock data for the dashboard
const dashboardStats = [
  {
    title: "Total Donations",
    value: "$2,847,392",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "From last month",
  },
  {
    title: "Active Campaigns",
    value: "127",
    change: "+8",
    changeType: "positive" as const,
    icon: Target,
    description: "New this month",
  },
  {
    title: "Total Users",
    value: "15,847",
    change: "+23.1%",
    changeType: "positive" as const,
    icon: Users,
    description: "From last month",
  },
  {
    title: "Success Rate",
    value: "94.2%",
    change: "-2.1%",
    changeType: "negative" as const,
    icon: TrendingUp,
    description: "Campaign completion",
  },
];

const recentCampaigns = [
  {
    id: "1",
    title: "Emergency Water Wells for Rural Communities",
    raised: 45000,
    goal: 75000,
    status: "active",
    urgency: "high",
    donors: 234,
    daysLeft: 12,
    category: "Water & Sanitation",
  },
  {
    id: "2",
    title: "School Supplies for Underprivileged Children",
    raised: 28000,
    goal: 40000,
    status: "active",
    urgency: "medium",
    donors: 156,
    daysLeft: 25,
    category: "Education",
  },
  {
    id: "3",
    title: "Emergency Food Relief for Disaster Victims",
    raised: 85000,
    goal: 120000,
    status: "active",
    urgency: "high",
    donors: 567,
    daysLeft: 8,
    category: "Emergency Relief",
  },
  {
    id: "4",
    title: "Mobile Medical Clinic for Remote Areas",
    raised: 100000,
    goal: 100000,
    status: "completed",
    urgency: "high",
    donors: 389,
    daysLeft: 0,
    category: "Healthcare",
  },
];

const recentDonations = [
  {
    id: "1",
    donor: "Sarah M.",
    amount: 500,
    campaign: "Emergency Water Wells",
    time: "2 hours ago",
    anonymous: false,
  },
  {
    id: "2",
    donor: "Anonymous",
    amount: 100,
    campaign: "School Supplies",
    time: "5 hours ago",
    anonymous: true,
  },
  {
    id: "3",
    donor: "Michael K.",
    amount: 250,
    campaign: "Food Relief",
    time: "1 day ago",
    anonymous: false,
  },
  {
    id: "4",
    donor: "Anonymous",
    amount: 75,
    campaign: "Medical Clinic",
    time: "2 days ago",
    anonymous: true,
  },
  {
    id: "5",
    donor: "Emma L.",
    amount: 150,
    campaign: "Water Wells",
    time: "3 days ago",
    anonymous: false,
  },
];

const recentActivity = [
  {
    id: "1",
    type: "campaign",
    title: "New Campaign Created",
    message: "Emergency Water Wells campaign went live",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "donation",
    title: "Large Donation Received",
    message: "$500 donation for School Supplies campaign",
    time: "5 hours ago",
  },
  {
    id: "3",
    type: "blog",
    title: "Blog Post Published",
    message: "New impact story about water projects",
    time: "1 day ago",
  },
];

export default function AdminDashboard() {
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
          <Button>
            <Target className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
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
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 text-destructive" />
                  )}
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
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(campaign.urgency)}`}
                        >
                          {campaign.urgency}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{formatCurrency(campaign.raised)} raised</span>
                          <span>{formatCurrency(campaign.goal)} goal</span>
                        </div>
                        <Progress
                          value={getProgressPercentage(
                            campaign.raised,
                            campaign.goal
                          )}
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.donors} donors
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {campaign.daysLeft} days left
                        </span>
                        <span>{campaign.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {donation.donor}
                        </span>
                        <span className="font-bold text-emerald-500">
                          {formatCurrency(donation.amount)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {donation.campaign} • {donation.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.message}
                        </p>
                        <span className="text-xs text-muted-foreground/60">
                          {activity.time}
                        </span>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "campaign"
                            ? "bg-blue-500"
                            : activity.type === "donation"
                              ? "bg-emerald-500"
                              : "bg-purple-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
