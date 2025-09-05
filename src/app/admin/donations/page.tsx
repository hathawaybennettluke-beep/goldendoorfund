"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  Users,
  Target,
  DollarSign,
  TrendingUp,
  MessageSquare,
  User,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Id } from "../../../../convex/_generated/dataModel";

type DonationWithDetails = {
  _id: Id<"donations">;
  amount: number;
  donorId: Id<"users">;
  campaignId: Id<"campaigns">;
  message?: string;
  isAnonymous: boolean;
  status: "pending" | "succeeded" | "failed" | "canceled";
  createdAt: number;
  updatedAt: number;
  donor?: {
    _id: Id<"users">;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
  campaign?: {
    _id: Id<"campaigns">;
    title: string;
    organization: string;
    category: string;
    status: string;
  } | null;
};

export default function DonationsManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch donations with details and related data
  const donationsResult = useQuery(api.donations.listWithDetails, {
    limit: 100,
    status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as "pending" | "succeeded" | "failed" | "canceled"),
    campaignId:
      campaignFilter === "all"
        ? undefined
        : (campaignFilter as Id<"campaigns">),
  });
  const donationStats = useQuery(api.donations.getStats);
  const campaigns = useQuery(api.campaigns.list, { status: "all" });

  // Mutations
  const deleteDonation = useMutation(api.donations.remove);

  // Get donations with details from the query result
  const donationsWithDetails: DonationWithDetails[] = useMemo(() => {
    if (!donationsResult?.donations) return [];
    return donationsResult.donations as DonationWithDetails[];
  }, [donationsResult]);

  // Filter and sort donations (search and sort done client-side for better UX)
  const filteredAndSortedDonations = useMemo(() => {
    let filtered = donationsWithDetails;

    // Search filter (client-side for instant feedback)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (donation) =>
          donation.donor?.name.toLowerCase().includes(searchLower) ||
          donation.donor?.email.toLowerCase().includes(searchLower) ||
          donation.campaign?.title.toLowerCase().includes(searchLower) ||
          donation.campaign?.organization.toLowerCase().includes(searchLower)
      );
    }

    // Sort (client-side since we have limited data)
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case "date":
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "donor":
          aValue = a.donor?.name || "";
          bValue = b.donor?.name || "";
          break;
        case "campaign":
          aValue = a.campaign?.title || "";
          bValue = b.campaign?.title || "";
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [donationsWithDetails, searchTerm, sortBy, sortOrder]);

  // Helper functions
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-600" />;
      case "canceled":
        return <XCircle className="h-3 w-3 text-gray-600" />;
      case "pending":
        return <Loader className="h-3 w-3 text-yellow-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "canceled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDeleteDonation = async (donationId: Id<"donations">) => {
    try {
      await deleteDonation({ id: donationId });
    } catch (error) {
      console.error("Failed to delete donation:", error);
    }
  };

  const handleSort = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  // Export donations to CSV
  const exportDonationsToCSV = (donations: DonationWithDetails[]) => {
    if (!donations.length) return;

    const headers = [
      'Donor Name',
      'Donor Email',
      'Campaign',
      'Organization',
      'Category',
      'Amount',
      'Status',
      'Message',
      'Anonymous',
      'Date',
      'Payment Intent ID'
    ];

    const csvData = donations.map(donation => [
      donation.isAnonymous ? 'Anonymous' : (donation.donor?.name || 'Unknown'),
      donation.isAnonymous ? 'N/A' : (donation.donor?.email || 'Unknown'),
      donation.campaign?.title || 'Unknown Campaign',
      donation.campaign?.organization || 'Unknown',
      donation.campaign?.category || 'Unknown',
      formatCurrency(donation.amount),
      donation.status,
      donation.message || 'No message',
      donation.isAnonymous ? 'Yes' : 'No',
      formatDate(donation.createdAt),
      'N/A' // stripePaymentIntentId not available in current type
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `donations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (!donationStats || !donationsResult) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Donations Management
          </h1>
          <p className="text-muted-foreground">
            Monitor all donations, track payment status, and manage donor
            interactions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => exportDonationsToCSV(filteredAndSortedDonations)}
            disabled={!filteredAndSortedDonations.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {donationStats.totalDonations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(donationStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Total raised</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Donors
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {donationStats.uniqueDonors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Individual donors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {donationStats.uniqueCampaigns.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Campaigns funded</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Donations</CardTitle>
          <CardDescription>
            {filteredAndSortedDonations.length} of {donationsResult?.total || 0}{" "}
            total donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by donor, campaign, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns?.slice(0, 20).map((campaign) => (
                    <SelectItem key={campaign._id} value={campaign._id}>
                      {campaign.title.length > 30
                        ? `${campaign.title.substring(0, 30)}...`
                        : campaign.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  <SelectItem value="donor-asc">Donor A-Z</SelectItem>
                  <SelectItem value="donor-desc">Donor Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("donor")}
              >
                <div className="flex items-center gap-1">
                  Donor
                  {sortBy === "donor" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center gap-1">
                  Amount
                  {sortBy === "amount" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortBy === "date" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      campaignFilter !== "all"
                        ? "No donations match your filters"
                        : "No donations found"}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedDonations.map((donation) => (
                <TableRow key={donation._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {!donation.isAnonymous && donation.donor ? (
                        <>
                          <Avatar className="h-8 w-8">
                            {donation.donor.profileImage ? (
                              <Image
                                src={donation.donor.profileImage}
                                alt={donation.donor.name}
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
                            <div className="font-medium">
                              {donation.donor.name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {donation.donor.email}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </Avatar>
                          <div>
                            <div className="font-medium text-muted-foreground">
                              Anonymous Donor
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Private donation
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {donation.campaign ? (
                      <div>
                        <div className="font-medium">
                          {donation.campaign.title.length > 40
                            ? `${donation.campaign.title.substring(0, 40)}...`
                            : donation.campaign.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{donation.campaign.organization}</span>
                          <Badge variant="outline" className="text-xs">
                            {donation.campaign.category}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Campaign not found
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-lg text-emerald-600">
                      {formatCurrency(donation.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(donation.status)}
                      <Badge className={getStatusColor(donation.status)}>
                        {donation.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {donation.message ? (
                      <div className="max-w-xs">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MessageSquare className="h-3 w-3" />
                          Message
                        </div>
                        <div
                          className="text-sm truncate"
                          title={donation.message}
                        >
                          {donation.message.length > 50
                            ? `${donation.message.substring(0, 50)}...`
                            : donation.message}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No message
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">
                        {formatDate(donation.createdAt)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(donation.createdAt)}
                      </div>
                    </div>
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
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/donations/${donation._id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Donation
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Donation
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this donation?
                                This action cannot be undone and will also
                                update the campaign&apos;s raised amount.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteDonation(donation._id)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredAndSortedDonations.length} of{" "}
          {donationsResult?.total || 0} donations
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
