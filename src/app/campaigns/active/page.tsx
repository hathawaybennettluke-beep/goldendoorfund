"use client";

import { useState } from "react";
import { 
  Target, 
  Heart, 
  Users, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Sparkles, 
  Star,
  Filter,
  Search,
  ArrowRight,
  Clock,
  Globe,
  Award
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
import Link from "next/link";
import { Footer } from "@/components/Footer";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  category: string;
  location: string;
  urgency: "high" | "medium" | "low";
  endDate: string;
  organizationName: string;
  progress: number;
  daysLeft: number;
}

const activeCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Water Wells for Rural Communities",
    description: "Providing clean, safe drinking water to remote villages in East Africa. Each well serves 500+ people and includes maintenance training for local communities.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 45000,
    goal: 75000,
    donors: 234,
    category: "Water & Sanitation",
    location: "East Africa",
    urgency: "high",
    endDate: "2024-12-15",
    organizationName: "Water for Life Foundation",
    progress: 60,
    daysLeft: 12
  },
  {
    id: "2",
    title: "School Supplies for Underprivileged Children",
    description: "Ensuring every child has access to basic educational materials and books for the upcoming school year. Supporting 500+ students across 10 schools.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80",
    raised: 28000,
    goal: 40000,
    donors: 156,
    category: "Education",
    location: "Rural Bangladesh",
    urgency: "medium",
    endDate: "2024-11-30",
    organizationName: "Education First Initiative",
    progress: 70,
    daysLeft: 25
  },
  {
    id: "3",
    title: "Mobile Medical Clinic for Remote Areas",
    description: "Bringing essential healthcare services to communities without access to medical facilities. Includes equipment, staff training, and transportation.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 62000,
    goal: 100000,
    donors: 389,
    category: "Healthcare",
    location: "Amazon Basin, Brazil",
    urgency: "high",
    endDate: "2025-01-15",
    organizationName: "Doctors Without Borders",
    progress: 62,
    daysLeft: 45
  },
  {
    id: "4",
    title: "Women's Empowerment Microfinance Program",
    description: "Supporting women entrepreneurs with small loans and business training to start sustainable businesses in their communities.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 42000,
    goal: 60000,
    donors: 198,
    category: "Economic Development",
    location: "Rural India",
    urgency: "medium",
    endDate: "2025-02-01",
    organizationName: "Women Rising Foundation",
    progress: 70,
    daysLeft: 60
  },
  {
    id: "5",
    title: "Reforestation Project - Plant 10,000 Trees",
    description: "Combat climate change by planting native trees in deforested areas. Includes community education and long-term forest management.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 15000,
    goal: 50000,
    donors: 89,
    category: "Environment",
    location: "Costa Rica",
    urgency: "low",
    endDate: "2025-06-01",
    organizationName: "Green Earth Coalition",
    progress: 30,
    daysLeft: 180
  },
  {
    id: "6",
    title: "Emergency Food Relief for Disaster Victims",
    description: "Providing immediate food assistance to families affected by recent flooding. Includes emergency supplies and nutrition support for children.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 85000,
    goal: 120000,
    donors: 567,
    category: "Emergency Relief",
    location: "Philippines",
    urgency: "high",
    endDate: "2024-12-31",
    organizationName: "Global Relief Network",
    progress: 71,
    daysLeft: 8
  }
];

export default function ActiveCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");

  const filteredCampaigns = activeCampaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory;
    const matchesUrgency = selectedUrgency === "all" || campaign.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const categories = Array.from(new Set(activeCampaigns.map(c => c.category)));
  const totalRaised = activeCampaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal = activeCampaigns.reduce((sum, c) => sum + c.goal, 0);
  const totalDonors = activeCampaigns.reduce((sum, c) => sum + c.donors, 0);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high": return "High Priority";
      case "medium": return "Medium Priority";
      case "low": return "Low Priority";
      default: return "Unknown";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Enhanced Hero Section */}
      <section className="relative py-32 px-10 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 h-48 w-48 rounded-full bg-secondary/10 blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 blur-3xl opacity-30" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-semibold text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm">
              <Target className="h-4 w-4" />
              Active Campaigns
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Active Campaigns Making a Difference
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Support ongoing campaigns that are actively creating positive change in communities worldwide. 
              Every donation brings us closer to our goals.
            </p>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">${(totalRaised / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-muted-foreground">Total Raised</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="text-3xl font-bold text-secondary mb-2">{totalDonors.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Total Donors</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="text-3xl font-bold text-accent mb-2">{activeCampaigns.length}</div>
                <div className="text-sm text-muted-foreground">Active Campaigns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Search and Filters */}
      <section className="py-16 px-10 border-b bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Enhanced Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search campaigns, organizations, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            {/* Enhanced Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters:
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
                  <SelectValue placeholder="All Categories" />
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

              <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                <SelectTrigger className="w-[160px] h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
                  <SelectValue placeholder="All Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-8 px-10 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              Showing {filteredCampaigns.length} of {activeCampaigns.length} active campaigns
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                High Priority
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                Medium Priority
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Low Priority
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Campaigns Grid */}
      <section className="py-24 px-10">
        <div className="container">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No campaigns found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters to find more campaigns.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedUrgency("all");
                }}
                className="px-8 py-3 h-12 text-lg font-semibold"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group"
                >
                  <article className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30 hover:bg-card/80">
                    <div className="relative">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      
                      {/* Urgency Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getUrgencyColor(campaign.urgency)}`}>
                          {getUrgencyText(campaign.urgency)}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-background/90 text-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          {campaign.category}
                        </span>
                      </div>

                      {/* Days Left Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-background/90 text-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {campaign.daysLeft} days left
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {campaign.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {campaign.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">${campaign.raised.toLocaleString()} raised</span>
                          <span className="text-muted-foreground">${campaign.goal.toLocaleString()} goal</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                        <div className="text-right text-xs text-muted-foreground mt-1">
                          {campaign.progress}% funded
                        </div>
                      </div>

                      {/* Organization and Location */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="font-medium">{campaign.organizationName}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {campaign.location}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.donors} donors
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ends {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <Button className="w-full group-hover:bg-primary/90 transition-all duration-300" variant="outline">
                        <Heart className="mr-2 h-4 w-4" />
                        Donate Now
                      </Button>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4" />
              Ready to Make an Impact?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Support These Active Campaigns
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Every donation, no matter the size, brings us closer to our goals and creates real change in communities worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
                <Link href="/campaigns">View All Campaigns</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300" asChild>
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
