"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Download,
  Filter,
  Heart,
  Search,
  Target,
  TrendingUp,
  Receipt,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  status: "completed" | "processing" | "failed";
  paymentMethod: string;
  isRecurring: boolean;
  taxDeductible: boolean;
  receiptUrl?: string;
  impactUpdate?: string;
}

const mockDonations: Donation[] = [
  {
    id: "don_001",
    campaignId: "1",
    campaignTitle: "Emergency Water Wells for Rural Communities",
    amount: 100,
    date: "2024-01-15",
    status: "completed",
    paymentMethod: "Credit Card ****1234",
    isRecurring: false,
    taxDeductible: true,
    receiptUrl: "/receipts/don_001.pdf",
    impactUpdate: "Your donation helped provide clean water to 25 families!",
  },
  {
    id: "don_002",
    campaignId: "2",
    campaignTitle: "School Supplies for Underprivileged Children",
    amount: 50,
    date: "2024-01-10",
    status: "completed",
    paymentMethod: "PayPal",
    isRecurring: true,
    taxDeductible: true,
    receiptUrl: "/receipts/don_002.pdf",
  },
  {
    id: "don_003",
    campaignId: "5",
    campaignTitle: "Emergency Food Relief for Disaster Victims",
    amount: 200,
    date: "2024-01-05",
    status: "completed",
    paymentMethod: "Credit Card ****5678",
    isRecurring: false,
    taxDeductible: true,
    receiptUrl: "/receipts/don_003.pdf",
    impactUpdate: "Your donation provided emergency meals for 40 people!",
  },
  {
    id: "don_004",
    campaignId: "6",
    campaignTitle: "Women's Empowerment Microfinance Program",
    amount: 75,
    date: "2023-12-20",
    status: "completed",
    paymentMethod: "Bank Transfer",
    isRecurring: false,
    taxDeductible: true,
    receiptUrl: "/receipts/don_004.pdf",
  },
  {
    id: "don_005",
    campaignId: "1",
    campaignTitle: "Emergency Water Wells for Rural Communities",
    amount: 150,
    date: "2023-12-15",
    status: "completed",
    paymentMethod: "Credit Card ****1234",
    isRecurring: false,
    taxDeductible: true,
    receiptUrl: "/receipts/don_005.pdf",
  },
  {
    id: "don_006",
    campaignId: "3",
    campaignTitle: "Mobile Medical Clinic for Remote Areas",
    amount: 300,
    date: "2023-11-28",
    status: "completed",
    paymentMethod: "Credit Card ****9012",
    isRecurring: false,
    taxDeductible: true,
    receiptUrl: "/receipts/don_006.pdf",
    impactUpdate: "Your donation helped provide medical care to 60 patients!",
  },
];

export default function DonationHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Calculate summary statistics
  const totalDonated = mockDonations
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDonations = mockDonations.filter(
    (d) => d.status === "completed"
  ).length;

  const recurringDonations = mockDonations.filter(
    (d) => d.isRecurring && d.status === "completed"
  ).length;

  // Get unique years for filter
  const years = Array.from(
    new Set(mockDonations.map((d) => new Date(d.date).getFullYear()))
  ).sort((a, b) => b - a);

  // Filter donations
  const filteredDonations = useMemo(() => {
    return mockDonations.filter((donation) => {
      const matchesSearch = donation.campaignTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || donation.status === statusFilter;
      const matchesYear =
        yearFilter === "all" ||
        new Date(donation.date).getFullYear().toString() === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [searchTerm, statusFilter, yearFilter]);

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
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-10 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-1/4 right-1/4 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-24 w-24 sm:h-48 sm:w-48 rounded-full bg-secondary/10 blur-2xl" />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              Donation History
            </div>
            
            <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Your Generosity Journey
            </h1>
            
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Track your donations, view impact updates, and see how your generosity creates positive change around the world.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                ${totalDonated.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Donated</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
              <div className="text-xl sm:text-2xl font-bold text-secondary mb-1">
                {totalDonations}
              </div>
              <div className="text-xs text-muted-foreground">Total Donations</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="text-xl sm:text-2xl font-bold text-accent mb-1">
                {recurringDonations}
              </div>
              <div className="text-xs text-muted-foreground">Recurring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
        <div className="container">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 shadow-lg">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/80 border-border/50"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/80 border-border/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="bg-background/80 border-border/50">
                  <SelectValue placeholder="Filter by date" />
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

              {/* Amount Filter */}
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="bg-background/80 border-border/50">
                  <SelectValue placeholder="Filter by amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="51-100">$51 - $100</SelectItem>
                  <SelectItem value="101-200">$101 - $200</SelectItem>
                  <SelectItem value="201+">$201+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Donations List */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
        <div className="container">
          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="text-sm text-muted-foreground">
              Showing {filteredDonations.length} of {mockDonations.length} donations
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setYearFilter("all");
              }}
              className="text-xs"
            >
              <XCircle className="h-3 w-3 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Donations Grid */}
          <div className="grid gap-6 sm:gap-8">
            {filteredDonations.map((donation) => (
              <Card
                key={donation.id}
                className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/30"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
                    {/* Campaign Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-3 w-3 text-primary" />
                        <Badge variant="secondary" className="text-xs">
                          {donation.isRecurring ? "Recurring" : "One-time"}
                        </Badge>
                        {donation.taxDeductible && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            Tax Deductible
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {donation.campaignTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(donation.date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Amount and Status */}
                    <div className="space-y-2">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        ${donation.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        {donation.status === "completed" && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {donation.status === "processing" && (
                          <Clock className="h-3 w-3 text-yellow-500" />
                        )}
                        {donation.status === "failed" && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <Badge
                          variant={
                            donation.status === "completed"
                              ? "default"
                              : donation.status === "processing"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {donation.paymentMethod}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      {donation.receiptUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group/btn"
                          asChild
                        >
                          <Link href={donation.receiptUrl} target="_blank">
                            <Download className="h-3 w-3 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                            Download Receipt
                          </Link>
                        </Button>
                      )}
                      {donation.impactUpdate && (
                        <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-semibold text-green-700">Impact Update</span>
                          </div>
                          <p className="text-xs text-green-700">{donation.impactUpdate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredDonations.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No donations found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or filters
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setYearFilter("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
