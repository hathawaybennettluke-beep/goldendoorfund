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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Donation History</h1>
            <p className="text-muted-foreground text-lg">
              Track your contributions and see the impact you&apos;ve made
            </p>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-8 px-10">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Total Donated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(totalDonated)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lifetime contributions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Total Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {totalDonations}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Successful donations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recurring Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {recurringDonations}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Active subscriptions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Filter Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
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

                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donations List */}
            <div className="space-y-4">
              {filteredDonations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16">
                    <h3 className="text-2xl font-semibold mb-4">
                      No donations found
                    </h3>
                    <p className="text-muted-foreground mb-8">
                      Try adjusting your search terms or filters.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setYearFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredDonations.map((donation) => (
                  <Card
                    key={donation.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              href={`/campaigns/${donation.campaignId}`}
                              className="text-lg font-semibold hover:text-primary transition-colors"
                            >
                              {donation.campaignTitle}
                            </Link>
                            <Badge className={getStatusColor(donation.status)}>
                              {donation.status.charAt(0).toUpperCase() +
                                donation.status.slice(1)}
                            </Badge>
                            {donation.isRecurring && (
                              <Badge variant="outline">Recurring</Badge>
                            )}
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(donation.date).toLocaleDateString()}
                            </div>
                            <div>Payment: {donation.paymentMethod}</div>
                            <div>
                              {donation.taxDeductible
                                ? "Tax Deductible"
                                : "Not Tax Deductible"}
                            </div>
                            <div>ID: {donation.id}</div>
                          </div>

                          {donation.impactUpdate && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                              <p className="text-sm font-medium text-primary mb-1">
                                Impact Update
                              </p>
                              <p className="text-sm">{donation.impactUpdate}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-primary mb-2">
                            {formatCurrency(donation.amount)}
                          </div>
                          <div className="flex gap-2">
                            {donation.receiptUrl && (
                              <Button variant="outline" size="sm">
                                <Receipt className="mr-2 h-4 w-4" />
                                Receipt
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/campaigns/${donation.campaignId}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Campaign
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Results Summary */}
            {filteredDonations.length > 0 && (
              <div className="mt-8 text-center text-muted-foreground">
                <p>
                  Showing {filteredDonations.length} of {mockDonations.length}{" "}
                  donations
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
