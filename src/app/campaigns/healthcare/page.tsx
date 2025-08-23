"use client";

import { useState } from "react";
import { 
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
  Award,
  Stethoscope,
  Pill,
  Activity,
  Shield,
  Ambulance
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

interface HealthcareCampaign {
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
  patients: number;
  focus: string;
}

const healthcareCampaigns: HealthcareCampaign[] = [
  {
    id: "1",
    title: "Mobile Medical Clinics for Remote Communities",
    description: "Deploying fully equipped mobile medical units to provide essential healthcare services in isolated rural areas. Includes doctors, nurses, and medical supplies.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 180000,
    goal: 250000,
    donors: 892,
    category: "Primary Care",
    location: "Rural Africa & Asia",
    urgency: "critical",
    endDate: "2025-02-15",
    organizationName: "Doctors Without Borders",
    progress: 72,
    daysLeft: 55,
    impact: "Healthcare access for 25,000+ people",
    patients: 25000,
    focus: "Primary Healthcare"
  },
  {
    id: "2",
    title: "Children's Hospital Cancer Treatment Center",
    description: "Building a specialized pediatric oncology unit with state-of-the-art equipment, trained staff, and family support services for children battling cancer.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 450000,
    goal: 800000,
    donors: 1245,
    category: "Pediatric Care",
    location: "Mexico City, Mexico",
    urgency: "high",
    endDate: "2025-06-30",
    organizationName: "Children's Cancer Foundation",
    progress: 56,
    daysLeft: 180,
    impact: "Cancer treatment for 500+ children annually",
    patients: 500,
    focus: "Cancer Treatment"
  },
  {
    id: "3",
    title: "Mental Health Support for Trauma Survivors",
    description: "Providing comprehensive mental health services including counseling, therapy, and support groups for individuals affected by war, natural disasters, and violence.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 89000,
    goal: 150000,
    donors: 456,
    category: "Mental Health",
    location: "Ukraine, Syria, Yemen",
    urgency: "high",
    endDate: "2025-03-01",
    organizationName: "Mental Health International",
    progress: 59,
    daysLeft: 95,
    impact: "Mental health support for 3,000+ survivors",
    patients: 3000,
    focus: "Trauma Recovery"
  },
  {
    id: "4",
    title: "Maternal & Newborn Care Initiative",
    description: "Improving maternal and infant health outcomes through prenatal care, safe delivery services, and postnatal support in developing regions.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 120000,
    goal: 200000,
    donors: 678,
    category: "Maternal Health",
    location: "Sub-Saharan Africa",
    urgency: "high",
    endDate: "2025-04-15",
    organizationName: "Safe Motherhood Network",
    progress: 60,
    daysLeft: 130,
    impact: "Safe deliveries for 5,000+ mothers",
    patients: 5000,
    focus: "Maternal Care"
  },
  {
    id: "5",
    title: "Emergency Medical Equipment & Supplies",
    description: "Providing critical medical equipment, medications, and supplies to hospitals and clinics in crisis-affected areas. Includes ventilators, surgical tools, and medicines.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 67000,
    goal: 120000,
    donors: 345,
    category: "Medical Equipment",
    location: "Global Crisis Zones",
    urgency: "critical",
    endDate: "2025-01-31",
    organizationName: "Global Medical Aid",
    progress: 56,
    daysLeft: 45,
    impact: "Equipment for 50+ healthcare facilities",
    patients: 10000,
    focus: "Medical Supplies"
  },
  {
    id: "6",
    title: "Community Health Worker Training Program",
    description: "Training local community members as health workers to provide basic healthcare, health education, and emergency response in underserved communities.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 78000,
    goal: 120000,
    donors: 234,
    category: "Community Health",
    location: "Rural South America",
    urgency: "medium",
    endDate: "2025-05-01",
    organizationName: "Community Health Initiative",
    progress: 65,
    daysLeft: 145,
    impact: "Health workers for 100+ communities",
    patients: 15000,
    focus: "Community Health"
  }
];

export default function HealthcarePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");

  const filteredCampaigns = healthcareCampaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory;
    const matchesUrgency = selectedUrgency === "all" || campaign.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const categories = Array.from(new Set(healthcareCampaigns.map(c => c.category)));
  const totalRaised = healthcareCampaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal = healthcareCampaigns.reduce((sum, c) => sum + c.goal, 0);
  const totalPatients = healthcareCampaigns.reduce((sum, c) => sum + c.patients, 0);

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
      case "critical": return <Ambulance className="h-4 w-4" />;
      case "high": return <Activity className="h-4 w-4" />;
      case "medium": return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Primary Care": return <Stethoscope className="h-4 w-4" />;
      case "Pediatric Care": return <Heart className="h-4 w-4" />;
      case "Mental Health": return <Heart className="h-4 w-4" />;
      case "Maternal Health": return <Heart className="h-4 w-4" />;
      case "Medical Equipment": return <Pill className="h-4 w-4" />;
      case "Community Health": return <Users className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
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
            {/* Healthcare Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-semibold text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm">
              <Heart className="h-4 w-4" />
              Healthcare & Medical
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Healthcare Campaigns
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Saving lives and improving health outcomes through medical care, equipment, and community health initiatives. 
              Every donation brings healing and hope to those in need.
            </p>

            {/* Healthcare Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">${(totalRaised / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-primary/80 font-medium">Healthcare Funds Raised</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="text-3xl font-bold text-secondary mb-2">{totalPatients.toLocaleString()}+</div>
                <div className="text-sm text-secondary/80 font-medium">Patients Helped</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="text-3xl font-bold text-accent mb-2">{healthcareCampaigns.length}</div>
                <div className="text-sm text-accent/80 font-medium">Active Programs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Impact Banner */}
      <section className="py-6 px-10 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container">
          <div className="flex items-center justify-center gap-3 text-center">
            <Heart className="h-5 w-5" />
            <span className="font-semibold">
              Health is a state of complete physical, mental and social well-being. - World Health Organization
            </span>
            <Heart className="h-5 w-5" />
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
                placeholder="Search healthcare programs, medical services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            {/* Enhanced Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Healthcare Filters:
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
              Showing {filteredCampaigns.length} of {healthcareCampaigns.length} healthcare campaigns
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

      {/* Enhanced Healthcare Campaigns Grid */}
      <section className="py-24 px-10">
        <div className="container">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No healthcare campaigns found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters to find more healthcare campaigns.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedUrgency("all");
                }}
                className="px-8 py-3 h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
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
                  <article className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/40 hover:bg-primary/5">
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
                        <span className="bg-background/90 text-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                          {getCategoryIcon(campaign.category)}
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

                      {/* Healthcare Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {campaign.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {campaign.description}
                      </p>

                      {/* Focus & Impact */}
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="text-sm font-medium text-primary/80 mb-1">
                          <Stethoscope className="inline h-3 w-3 mr-1" />
                          Focus: {campaign.focus}
                        </div>
                        <div className="text-xs text-primary/80">
                          Impact: {campaign.impact}
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

                      <Button className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 bg-primary hover:bg-primary/90 text-white" variant="default">
                        <Heart className="mr-2 h-4 w-4" />
                        Support Healthcare
                      </Button>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Healthcare CTA Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Heart className="h-4 w-4" />
              Save Lives Today
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Every Donation Brings Healing & Hope
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your support provides critical medical care, life-saving equipment, and health services to communities in need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90" asChild>
                <Link href="/campaigns">View All Healthcare Programs</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300" asChild>
                <Link href="/contact">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
