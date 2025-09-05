"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  DollarSign,
  Target,
  MapPin,
  Phone,
  FileText,
  Heart,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function UserDetails() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as Id<"users">;

  // Fetch user details
  const userDetails = useQuery(api.users.getUserById, { userId });

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  const getUserStatus = (user: { donations?: Array<{ createdAt: number }> }) => {
    if (!user.donations || user.donations.length === 0) {
      return { status: "inactive", color: "bg-gray-100 text-gray-800" };
    }
    
    const lastDonation = Math.max(...user.donations.map((d: { createdAt: number }) => d.createdAt));
    if (Date.now() - lastDonation < 30 * 24 * 60 * 60 * 1000) {
      return { status: "active", color: "bg-green-100 text-green-800" };
    }
    return { status: "dormant", color: "bg-yellow-100 text-yellow-800" };
  };

  // Loading state
  if (!userDetails) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const userStatus = getUserStatus(userDetails);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              User Details
            </h1>
            <p className="text-muted-foreground">
              Comprehensive information about {userDetails.name}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Profile Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  {userDetails.profileImage ? (
                    <Image
                      src={userDetails.profileImage}
                      alt={userDetails.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </Avatar>
              </div>
              <CardTitle className="text-xl">{userDetails.name}</CardTitle>
              <CardDescription>
                ID: {userDetails._id.slice(-8)}
              </CardDescription>
                             <Badge className={`${userStatus.color} w-fit mx-auto mt-2`}>
                {userStatus.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userDetails.email}</span>
                </div>
                {userDetails.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userDetails.phoneNumber}</span>
                  </div>
                )}
                {userDetails.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userDetails.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {formatDate(userDetails.createdAt)}
                  </span>
                </div>
              </div>
              {userDetails.bio && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">
                      {userDetails.bio}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Stats */}
        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Donated
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(userDetails.stats.totalDonated)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime contributions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Donations
                </CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {userDetails.stats.donationCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Individual donations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Campaigns Supported
                </CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {userDetails.stats.campaignsSupported}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique campaigns
                </p>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>

      {/* Donation History */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>
            Complete history of all donations made by this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userDetails.donations && userDetails.donations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                                 {userDetails.donations.map((donation) => (
                  <TableRow key={donation._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {donation.campaign?.title || "Unknown Campaign"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {donation.campaign?.category || "Unknown"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-emerald-600">
                        {formatCurrency(donation.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          donation.status === "succeeded"
                            ? "bg-green-100 text-green-800"
                            : donation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {donation.message ? (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm truncate">
                              {donation.message.length > 50
                                ? `${donation.message.substring(0, 50)}...`
                                : donation.message}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No message
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(donation.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No donations yet</h3>
              <p className="text-muted-foreground">
                                 This user hasn&apos;t made any donations yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
