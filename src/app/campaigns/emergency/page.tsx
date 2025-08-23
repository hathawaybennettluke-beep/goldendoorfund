"use client";

import { useState } from "react";
import { 
  AlertTriangle, 
  Users, 
  Calendar, 
  MapPin, 
  Filter,
  Search,
  Clock,
  Flame,
  Shield,
  Zap
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

interface EmergencyCampaign {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  category: string;
  location: string;
  urgency: "critical" | "high" | "medium";
  endDate: string;
  organizationName: string;
  progress: number;
  daysLeft: number;
  impact: string;
  beneficiaries: number;
}

const emergencyCampaigns: EmergencyCampaign[] = [
  {
    id: "1",
    title: "Hurricane Relief - Immediate Food & Shelter",
    description: "Providing emergency food, clean water, and temporary shelter to families displaced by Hurricane Maria. Urgent need for basic supplies and medical assistance.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 125000,
    goal: 200000,
    donors: 892,
    category: "Natural Disaster",
    location: "Puerto Rico",
    urgency: "critical",
    endDate: "2024-12-20",
    organizationName: "Red Cross Emergency Response",
    progress: 63,
    daysLeft: 5,
    impact: "Immediate relief for 2,000+ families",
    beneficiaries: 8000
  },
  {
    id: "2",
    title: "Earthquake Emergency Medical Response",
    description: "Deploying medical teams and emergency supplies to earthquake-affected regions. Critical need for trauma care, medications, and medical equipment.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 89000,
    goal: 150000,
    donors: 567,
    category: "Natural Disaster",
    location: "Nepal",
    urgency: "critical",
    endDate: "2024-12-25",
    organizationName: "Doctors Without Borders",
    progress: 59,
    daysLeft: 10,
    impact: "Medical care for 5,000+ victims",
    beneficiaries: 5000
  },
  {
    id: "3",
    title: "War Zone Humanitarian Aid",
    description: "Delivering essential supplies including food, medicine, and hygiene kits to conflict-affected areas. Supporting vulnerable populations in active war zones.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 210000,
    goal: 300000,
    donors: 1245,
    category: "Conflict",
    location: "Ukraine",
    urgency: "high",
    endDate: "2025-01-15",
    organizationName: "UNICEF Emergency Fund",
    progress: 70,
    daysLeft: 35,
    impact: "Aid for 10,000+ displaced families",
    beneficiaries: 40000
  },
  {
    id: "4",
    title: "Flood Emergency Response & Recovery",
    description: "Providing immediate rescue operations, emergency supplies, and long-term recovery support for communities devastated by severe flooding.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80",
    raised: 156000,
    goal: 250000,
    donors: 734,
    category: "Natural Disaster",
    location: "Bangladesh",
    urgency: "high",
    endDate: "2025-01-10",
    organizationName: "Save the Children",
    progress: 62,
    daysLeft: 30,
    impact: "Rescue and relief for 15,000+ people",
    beneficiaries: 15000
  },
  {
    id: "5",
    title: "Refugee Crisis Emergency Support",
    description: "Providing emergency shelter, food, and medical care to refugees fleeing conflict and persecution. Supporting families in transit camps.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 89000,
    goal: 180000,
    donors: 456,
    category: "Humanitarian Crisis",
    location: "Turkey-Syria Border",
    urgency: "high",
    endDate: "2025-02-01",
    organizationName: "International Rescue Committee",
    progress: 49,
    daysLeft: 55,
    impact: "Support for 8,000+ refugee families",
    beneficiaries: 32000
  },
  {
    id: "6",
    title: "Wildfire Emergency Response",
    description: "Deploying firefighting teams, emergency medical care, and evacuation support for communities affected by devastating wildfires.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 67000,
    goal: 120000,
    donors: 389,
    category: "Natural Disaster",
    location: "California, USA",
    urgency: "medium",
    endDate: "2025-01-30",
    organizationName: "American Red Cross",
    progress: 56,
    daysLeft: 70,
    impact: "Emergency response for 3,000+ families",
    beneficiaries: 12000
  }
];

export default function EmergencyReliefPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");

  const filteredCampaigns = emergencyCampaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory;
    const matchesUrgency = selectedUrgency === "all" || campaign.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const categories = Array.from(new Set(emergencyCampaigns.map(c => c.category)));
  const totalRaised = emergencyCampaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalBeneficiaries = emergencyCampaigns.reduce((sum, c) => sum + c.beneficiaries, 0);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-primary text-white animate-pulse";
      case "high": return "bg-secondary text-white";
      case "medium": return "bg-accent text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "critical": return "CRITICAL";
      case "high": return "HIGH PRIORITY";
      case "medium": return "MEDIUM PRIORITY";
      default: return "Unknown";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "critical": return <Flame className="h-4 w-4" />;
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
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
            {/* Emergency Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-bold text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm animate-pulse">
              <AlertTriangle className="h-4 w-4" />
              EMERGENCY RESPONSE
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Emergency Relief Campaigns
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Urgent campaigns responding to natural disasters, conflicts, and humanitarian crises. 
              Your immediate support can save lives and provide critical assistance.
            </p>

            {/* Emergency Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">${(totalRaised / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-primary/80 font-medium">Emergency Funds Raised</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="text-3xl font-bold text-secondary mb-2">{totalBeneficiaries.toLocaleString()}+</div>
                <div className="text-sm text-secondary/80 font-medium">People Helped</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="text-3xl font-bold text-accent mb-2">{emergencyCampaigns.length}</div>
                <div className="text-sm text-accent/80 font-medium">Active Emergencies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Alert Banner */}
      <section className="py-6 px-10 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container">
          <div className="flex items-center justify-center gap-3 text-center">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">
              These campaigns need immediate support. Every minute counts in emergency response.
            </span>
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Enhanced Search and Filters */}
      <section className="py-16 px-10 border-b bg-gradient-to-br from-background to-primary/5">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Enhanced Search */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search emergency campaigns, disasters, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            {/* Enhanced Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Emergency Filters:
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-12 border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300">
                  <SelectValue placeholder="All Disasters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disasters</SelectItem>
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
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="py-8 px-10 bg-primary/5">
        <div className="container">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              Showing {filteredCampaigns.length} of {emergencyCampaigns.length} emergency campaigns
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                Critical
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                High Priority
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                Medium Priority
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Emergency Campaigns Grid */}
      <section className="py-24 px-10">
        <div className="container">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No emergency campaigns found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters to find more emergency campaigns.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedUrgency("all");
                }}
                className="px-8 py-3 h-12 text-lg font-semibold bg-red-600 hover:bg-red-700"
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
                  <article className="relative overflow-hidden rounded-3xl border-2 border-red-200 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-red-400 hover:bg-red-50/30">
                    <div className="relative">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      
                      {/* Urgency Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getUrgencyColor(campaign.urgency)} flex items-center gap-1`}>
                          {getUrgencyIcon(campaign.urgency)}
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

                      {/* Emergency Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {campaign.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {campaign.description}
                      </p>

                      {/* Impact & Beneficiaries */}
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="text-sm font-medium text-primary/80 mb-1">
                          <Users className="inline h-3 w-3 mr-1" />
                          Impact: {campaign.impact}
                        </div>
                        <div className="text-xs text-primary/60">
                          Beneficiaries: {campaign.beneficiaries.toLocaleString()}+ people
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">${campaign.raised.toLocaleString()} raised</span>
                          <span className="text-muted-foreground">${campaign.goal.toLocaleString()} goal</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
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

                      <Button className="w-full group-hover:bg-primary/90 transition-all duration-300 bg-primary hover:bg-primary/90 text-white" variant="default">
                        <Zap className="mr-2 h-4 w-4" />
                        Emergency Donate
                      </Button>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Emergency CTA Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary border border-primary/20 mb-6">
              <AlertTriangle className="h-4 w-4" />
              URGENT ACTION NEEDED
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Every Second Counts in Emergency Response
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your immediate support can make the difference between life and death for families affected by disasters and crises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90" asChild>
                <Link href="/campaigns">View All Emergencies</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300" asChild>
                <Link href="/contact">Get Emergency Updates</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
