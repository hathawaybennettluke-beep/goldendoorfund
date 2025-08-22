"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Users,
  Target,
  DollarSign,
  Clock,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Mock campaign data
const campaigns = [
  {
    id: "1",
    title: "Emergency Water Wells for Rural Communities",
    organization: "Water for Life Foundation",
    raised: 45000,
    goal: 75000,
    donors: 234,
    status: "active",
    urgency: "high",
    category: "Water & Sanitation",
    location: "East Africa",
    startDate: "2024-09-15",
    endDate: "2024-12-15",
    featured: true,
  },
  {
    id: "2",
    title: "School Supplies for Underprivileged Children",
    organization: "Education First Initiative",
    raised: 28000,
    goal: 40000,
    donors: 156,
    status: "active",
    urgency: "medium",
    category: "Education",
    location: "Rural Bangladesh",
    startDate: "2024-10-01",
    endDate: "2024-11-30",
    featured: false,
  },
  {
    id: "3",
    title: "Mobile Medical Clinic for Remote Areas",
    organization: "Doctors Without Borders",
    raised: 100000,
    goal: 100000,
    donors: 389,
    status: "completed",
    urgency: "high",
    category: "Healthcare",
    location: "Amazon Basin, Brazil",
    startDate: "2024-07-01",
    endDate: "2024-10-15",
    featured: true,
  },
  {
    id: "4",
    title: "Reforestation Project - Plant 10,000 Trees",
    organization: "Green Earth Coalition",
    raised: 0,
    goal: 25000,
    donors: 0,
    status: "upcoming",
    urgency: "medium",
    category: "Environment",
    location: "Costa Rica",
    startDate: "2025-01-01",
    endDate: "2025-03-01",
    featured: false,
  },
  {
    id: "5",
    title: "Emergency Food Relief for Disaster Victims",
    organization: "Global Relief Network",
    raised: 85000,
    goal: 120000,
    donors: 567,
    status: "active",
    urgency: "high",
    category: "Emergency Relief",
    location: "Philippines",
    startDate: "2024-10-10",
    endDate: "2024-12-31",
    featured: true,
  },
  {
    id: "6",
    title: "Women's Empowerment Microfinance Program",
    organization: "Women Rising Foundation",
    raised: 62000,
    goal: 80000,
    donors: 298,
    status: "active",
    urgency: "low",
    category: "Economic Development",
    location: "Rural India",
    startDate: "2024-09-01",
    endDate: "2025-01-15",
    featured: false,
  },
];

export default function CampaignsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

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

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || campaign.category === categoryFilter;
    const matchesUrgency =
      urgencyFilter === "all" || campaign.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesUrgency;
  });

  const categories = Array.from(new Set(campaigns.map((c) => c.category)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Campaign Management
          </h1>
          <p className="text-muted-foreground">
            Manage all donation campaigns, track progress, and analyze
            performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search campaigns or organizations..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Total Campaigns
            </span>
          </div>
          <div className="text-2xl font-bold mt-2 text-foreground">
            {campaigns.length}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Total Raised</span>
          </div>
          <div className="text-2xl font-bold mt-2 text-foreground">
            {formatCurrency(campaigns.reduce((sum, c) => sum + c.raised, 0))}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total Donors</span>
          </div>
          <div className="text-2xl font-bold mt-2 text-foreground">
            {campaigns.reduce((sum, c) => sum + c.donors, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              Active Campaigns
            </span>
          </div>
          <div className="text-2xl font-bold mt-2 text-foreground">
            {campaigns.filter((c) => c.status === "active").length}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Donors</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{campaign.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {campaign.location}
                      </span>
                      {campaign.featured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{campaign.organization}</div>
                </TableCell>
                <TableCell>
                  <div className="w-24">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{formatCurrency(campaign.raised)}</span>
                      <span>
                        {Math.round(
                          getProgressPercentage(campaign.raised, campaign.goal)
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        campaign.raised,
                        campaign.goal
                      )}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      of {formatCurrency(campaign.goal)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge className={getUrgencyColor(campaign.urgency)}>
                      {campaign.urgency}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{campaign.category}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{campaign.donors}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Campaign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
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
