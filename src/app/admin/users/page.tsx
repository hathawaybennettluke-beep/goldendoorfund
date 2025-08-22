"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  DollarSign,
  Target,
  Activity,
  Mail,
  User,
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
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users from Convex
  const allUsersResult = useQuery(api.users.getAllUsers, {
    limit: 100,
    searchTerm: searchTerm || undefined,
  });

  // Fetch user stats for the dashboard cards
  const userStatsResult = useQuery(api.users.getUserStats);

  const users = useMemo(
    () => allUsersResult?.users || [],
    [allUsersResult?.users]
  );

  // Calculate stats from real data
  const userStats = useMemo(() => {
    if (!userStatsResult) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        recentUsers: 0,
        averageDonation: 0,
      };
    }

    return {
      totalUsers: userStatsResult.totalUsers,
      activeUsers: userStatsResult.activeUsers,
      recentUsers: userStatsResult.recentUsers,
      averageDonation: userStatsResult.averageDonationPerUser,
    };
  }, [userStatsResult]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getUserStatus = (user: {
    stats: { donationCount: number; lastDonationDate: number | null };
  }) => {
    if (user.stats.donationCount === 0)
      return { status: "inactive", color: "bg-gray-100 text-gray-800" };
    if (
      user.stats.lastDonationDate &&
      Date.now() - user.stats.lastDonationDate < 30 * 24 * 60 * 60 * 1000
    ) {
      return { status: "active", color: "bg-green-100 text-green-800" };
    }
    return { status: "dormant", color: "bg-yellow-100 text-yellow-800" };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all platform users
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userStats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userStats.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userStats.recentUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Donation
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(userStats.averageDonation)}
            </div>
            <p className="text-xs text-muted-foreground">Per active user</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {allUsersResult?.total || 0} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Donated</TableHead>
              <TableHead>Donations</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const userStatus = getUserStatus(user);
              return (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {user.profileImage ? (
                          <Image
                            src={user.profileImage}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {user._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={userStatus.color}>
                      {userStatus.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-emerald-600">
                      {formatCurrency(user.stats.totalDonated)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {user.stats.donationCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      {user.stats.campaignsSupported}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.stats.lastDonationDate
                        ? getTimeAgo(user.stats.lastDonationDate)
                        : "Never"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(user.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {users.length} of {allUsersResult?.total || 0} users
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
