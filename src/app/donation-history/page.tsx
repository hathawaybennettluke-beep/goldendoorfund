"use client";

import { useState, useMemo } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Download,
  Heart,
  Search,
  Target,
  Receipt,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  Sparkles,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function DonationHistoryPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [downloadingReceipts, setDownloadingReceipts] = useState<Set<string>>(
    new Set()
  );

  // Receipt download action
  const getReceiptUrl = useAction(api.payments.getReceiptUrl);

  // Get user donations and stats
  const donations = useQuery(
    api.payments.getUserDonationsByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const donationStats = useQuery(
    api.payments.getUserDonationStats,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get unique years for filter
  const years = useMemo(() => {
    if (!donations) return [];
    return Array.from(
      new Set(donations.map((d) => new Date(d.createdAt).getFullYear()))
    ).sort((a: number, b: number) => b - a);
  }, [donations]);

  // Filter donations
  const filteredDonations = useMemo(() => {
    if (!donations) return [];

    return donations.filter((donation) => {
      const matchesSearch =
        donation.campaign?.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) || false;
      const matchesStatus =
        statusFilter === "all" || donation.status === statusFilter;
      const matchesYear =
        yearFilter === "all" ||
        new Date(donation.createdAt).getFullYear().toString() === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [donations, searchTerm, statusFilter, yearFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "canceled":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "succeeded":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "canceled":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleDownloadReceipt = async (paymentIntentId: string) => {
    setDownloadingReceipts((prev) => new Set(prev).add(paymentIntentId));

    try {
      const receiptUrl = await getReceiptUrl({
        paymentIntentId,
      });

      if (receiptUrl) {
        // Open receipt in new tab
        window.open(receiptUrl, "_blank");
        toast({
          title: "Receipt Opened",
          description: "Your payment receipt has been opened in a new tab.",
          type: "success",
        });
      } else {
        throw new Error("Receipt not found");
      }
    } catch {
      toast({
        title: "Receipt Not Found",
        description: "Sorry, we couldn't find the receipt for this payment.",
        type: "error",
      });
    } finally {
      setDownloadingReceipts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(paymentIntentId);
        return newSet;
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 max-w-md border-0 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to view your donation history and track your
              impact.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <Link href="/sign-in">
                <Heart className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-10 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-1/4 right-1/4 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-24 w-24 sm:h-48 sm:w-48 rounded-full bg-secondary/10 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-96 w-96 rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
          </div>
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 sm:px-8 sm:py-4 text-sm font-medium border border-primary/20 mb-8 backdrop-blur-sm">
              <Receipt className="h-5 w-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                Donation History
              </span>
              <Sparkles className="h-4 w-4 text-secondary" />
            </div>

            <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
              Your Impact Journey
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Every donation tells a story of hope and change. Track your
              contributions and see the positive impact you&apos;ve made in
              communities worldwide.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {donationStats ? (
              <>
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm group hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                  <CardContent className="relative p-6 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                      {formatCurrency(donationStats.totalDonated)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Total Donated
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent backdrop-blur-sm group hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                  <CardContent className="relative p-6 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
                      {donationStats.totalDonations}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Total Donations
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent backdrop-blur-sm group hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                  <CardContent className="relative p-6 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">
                      {donationStats.campaignsSupported}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Campaigns Supported
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="border-0 bg-card/50 backdrop-blur-sm"
                  >
                    <CardContent className="p-6 text-center">
                      <Skeleton className="h-10 w-24 mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
        <div className="container">
          <Card className="border-0 bg-card/30 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-background/80 border-border/50 h-12 text-sm focus:border-primary/50 transition-all duration-300"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-background/80 border-border/50 h-12 focus:border-primary/50 transition-all duration-300">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="succeeded">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="bg-background/80 border-border/50 h-12 focus:border-primary/50 transition-all duration-300">
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Donations List */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
        <div className="container">
          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="text-sm text-muted-foreground font-medium">
              {filteredDonations && filteredDonations.length > 0 && (
                <>
                  Showing {filteredDonations.length}{" "}
                  {filteredDonations.length === 1 ? "donation" : "donations"}
                </>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setYearFilter("all");
              }}
              className="text-sm border-border/50 hover:bg-muted/50 transition-all duration-300"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Loading State */}
          {!donations && (
            <div className="grid gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 bg-card/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Donations Grid */}
          {donations && filteredDonations.length > 0 && (
            <div className="grid gap-6 sm:gap-8">
              {filteredDonations.map((donation) => (
                <Card
                  key={donation._id}
                  className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-2xl transition-all duration-700 hover:scale-[1.01] hover:from-card/90 hover:to-card/60"
                >
                  {/* Background Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-all duration-700" />

                  <CardContent className="relative p-6 sm:p-8">
                    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
                      {/* Campaign Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-all duration-500">
                            <Heart className="h-4 w-4 text-primary" />
                          </div>
                          {donation.isAnonymous && (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground border-muted-foreground/30"
                            >
                              Anonymous
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-500 mb-2 leading-tight">
                            {donation.campaign?.title || "Campaign not found"}
                          </h3>
                          {donation.message && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                              <p className="text-sm text-muted-foreground italic">
                                &ldquo;{donation.message}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(donation.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>

                      {/* Amount and Status */}
                      <div className="space-y-4">
                        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {formatCurrency(donation.amount)}
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusIcon(donation.status)}
                          <Badge
                            variant={getStatusBadgeVariant(donation.status)}
                            className="text-sm px-3 py-1"
                          >
                            {donation.status === "succeeded"
                              ? "Completed"
                              : donation.status.charAt(0).toUpperCase() +
                                donation.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          <span>Stripe Payment</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group/btn border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                          asChild
                        >
                          <Link href={`/campaigns/${donation.campaignId}`}>
                            <Target className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                            View Campaign
                            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </Button>

                        {/* Receipt Button - only for succeeded donations with payment intent */}
                        {donation.status === "succeeded" &&
                          donation.stripePaymentIntentId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full group/receipt border-border/50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
                              onClick={() =>
                                donation.stripePaymentIntentId &&
                                handleDownloadReceipt(
                                  donation.stripePaymentIntentId
                                )
                              }
                              disabled={
                                !donation.stripePaymentIntentId ||
                                downloadingReceipts.has(
                                  donation.stripePaymentIntentId
                                )
                              }
                            >
                              {donation.stripePaymentIntentId &&
                              downloadingReceipts.has(
                                donation.stripePaymentIntentId
                              ) ? (
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2 group-hover/receipt:scale-110 transition-transform duration-300" />
                              )}
                              View Receipt
                            </Button>
                          )}

                        {donation.stripePaymentIntentId && (
                          <div className="text-xs text-muted-foreground font-mono bg-muted/30 rounded-lg p-3 border border-border/30">
                            <span className="block mb-1 font-semibold text-foreground">
                              Payment ID:
                            </span>
                            <span className="break-all">
                              {donation.stripePaymentIntentId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {donations && filteredDonations.length === 0 && (
            <Card className="border-0 bg-card/30 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mb-8">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {donations.length === 0
                    ? "No donations yet"
                    : "No donations found"}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {donations.length === 0
                    ? "Start making a difference by supporting campaigns that matter to you."
                    : "Try adjusting your search criteria or filters to find what you're looking for."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {donations.length === 0 ? (
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
                    >
                      <Link href="/campaigns">
                        <Heart className="h-5 w-5 mr-2" />
                        Explore Campaigns
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setYearFilter("all");
                      }}
                      size="lg"
                      variant="outline"
                      className="border-border/50 hover:bg-primary/5 transition-all duration-300"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
