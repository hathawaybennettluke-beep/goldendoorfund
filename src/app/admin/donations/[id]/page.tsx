"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  MessageSquare,
  DollarSign,
  Target,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useState } from "react";

export default function DonationDetails() {
  const router = useRouter();
  const params = useParams();
  const donationId = params.id as Id<"donations">;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch donation details
  const donation = useQuery(api.donations.list)?.find(
    (d) => d._id === donationId
  );

  // Fetch donor details
  const donor = useQuery(
    api.users.getUserById,
    donation?.donorId ? { userId: donation.donorId } : "skip"
  );

  // Fetch campaign details
  const campaign = useQuery(
    api.campaigns.get,
    donation?.campaignId ? { id: donation.campaignId } : "skip"
  );

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "canceled":
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case "pending":
        return <Loader className="h-5 w-5 text-yellow-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Loading state
  if (!donation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Donations
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Donation Details
          </h1>
          <p className="text-muted-foreground">
            View comprehensive information about this donation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(donation.status)} variant="outline">
            {getStatusIcon(donation.status)}
            <span className="ml-2 capitalize">{donation.status}</span>
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Donation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Donation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Amount</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(donation.amount)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(donation.status)}
                  <Badge className={getStatusColor(donation.status)}>
                    {donation.status}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">
                  Donation ID
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{donation._id}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(donation._id, "donationId")}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {copiedField === "donationId" && (
                    <span className="text-xs text-green-600">Copied!</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Anonymous</span>
                <span className="text-sm">
                  {donation.isAnonymous ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Created</span>
                <div className="text-right">
                  <div className="text-sm">
                    {formatDate(donation.createdAt)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getTimeAgo(donation.createdAt)}
                  </div>
                </div>
              </div>

              {donation.updatedAt !== donation.createdAt && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">
                    Last Updated
                  </span>
                  <div className="text-right">
                    <div className="text-sm">
                      {formatDate(donation.updatedAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getTimeAgo(donation.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {donation.message && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Donor Message
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm">{donation.message}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Donor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {donation.isAnonymous ? "Anonymous Donor" : "Donor Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!donation.isAnonymous && donor ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {donor.profileImage ? (
                      <Image
                        src={donor.profileImage}
                        alt={donor.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{donor.name}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{donor.email}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Donated
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(donor.stats?.totalDonated || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Donations
                    </span>
                    <span className="font-semibold">
                      {donor.stats?.donationCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Campaigns Supported
                    </span>
                    <span className="font-semibold">
                      {donor.stats?.campaignsSupported || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Member Since
                    </span>
                    <span className="text-sm">
                      {new Date(donor.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {(donor.phoneNumber || donor.location || donor.bio) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {donor.phoneNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Phone
                          </span>
                          <span className="text-sm">{donor.phoneNumber}</span>
                        </div>
                      )}
                      {donor.location && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Location
                          </span>
                          <span className="text-sm">{donor.location}</span>
                        </div>
                      )}
                      {donor.bio && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Bio
                          </span>
                          <p className="text-sm bg-muted/50 p-2 rounded">
                            {donor.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Anonymous Donation</h3>
                <p className="text-sm text-muted-foreground">
                  This donor chose to remain anonymous. Personal information is
                  not available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Information */}
      {campaign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Campaign Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {campaign.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{campaign.category}</Badge>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    {campaign.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {campaign.description}
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Organization
                      </span>
                    </div>
                    <span className="font-medium">{campaign.organization}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Location
                      </span>
                    </div>
                    <span className="font-medium">{campaign.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        End Date
                      </span>
                    </div>
                    <span className="font-medium">
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-sm font-semibold">
                      {Math.round(
                        (campaign.currentAmount / campaign.goalAmount) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (campaign.currentAmount / campaign.goalAmount) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-emerald-600 font-semibold">
                      {formatCurrency(campaign.currentAmount)} raised
                    </span>
                    <span className="text-muted-foreground">
                      of {formatCurrency(campaign.goalAmount)}
                    </span>
                  </div>
                </div>

                {campaign.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push(`/campaigns/${campaign._id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Campaign Page
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/campaigns/${campaign._id}`)}
              >
                <Target className="h-4 w-4 mr-2" />
                Manage Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Status
                </span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(donation.status)}
                  <span className="font-medium capitalize">
                    {donation.status}
                  </span>
                </div>
              </div>

              {donation.stripePaymentIntentId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Stripe Payment ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {donation.stripePaymentIntentId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          donation.stripePaymentIntentId!,
                          "stripeId"
                        )
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {copiedField === "stripeId" && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </div>
                </div>
              )}

              {donation.stripeCustomerId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Stripe Customer ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {donation.stripeCustomerId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          donation.stripeCustomerId!,
                          "customerId"
                        )
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {copiedField === "customerId" && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Transaction Time
                </span>
                <div className="text-right">
                  <div className="text-sm">
                    {formatDate(donation.createdAt)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(donation.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Processing Fee
                </span>
                <span className="text-sm">
                  {formatCurrency(donation.amount * 0.029 + 0.3)} (est.)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Net Amount
                </span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(
                    donation.amount - (donation.amount * 0.029 + 0.3)
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>
            Administrative actions for this donation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/donations")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Donations
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const data = {
                  donationId: donation._id,
                  amount: donation.amount,
                  donor: donor?.name || "Anonymous",
                  campaign: campaign?.title || "Unknown",
                  date: formatDate(donation.createdAt),
                  status: donation.status,
                };
                copyToClipboard(JSON.stringify(data, null, 2), "fullData");
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Details
              {copiedField === "fullData" && (
                <span className="ml-2 text-green-600">Copied!</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
