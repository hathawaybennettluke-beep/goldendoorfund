"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  MapPin, 
  Filter,
  Search,
  Clock,
  GraduationCap,
  Lightbulb,
  School,
  Brain
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

interface EducationCampaign {
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
  impact: string;
  students: number;
  focus: string;
}

const educationCampaigns: EducationCampaign[] = [
  {
    id: "1",
    title: "Digital Learning Centers for Rural Schools",
    description: "Establishing computer labs and internet connectivity in 50 rural schools across developing countries. Providing tablets, educational software, and teacher training.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80",
    raised: 89000,
    goal: 150000,
    donors: 456,
    category: "Technology",
    location: "Rural India & Africa",
    urgency: "high",
    endDate: "2025-03-15",
    organizationName: "Digital Education Initiative",
    progress: 59,
    daysLeft: 85,
    impact: "Digital literacy for 5,000+ students",
    students: 5000,
    focus: "Digital Skills"
  },
  {
    id: "2",
    title: "Girls' STEM Education Program",
    description: "Empowering young girls with science, technology, engineering, and mathematics education. Includes hands-on workshops, mentorship, and career guidance.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 67000,
    goal: 100000,
    donors: 234,
    category: "STEM",
    location: "Kenya, Tanzania, Uganda",
    urgency: "high",
    endDate: "2025-02-28",
    organizationName: "Women in Science Foundation",
    progress: 67,
    daysLeft: 70,
    impact: "STEM education for 2,000+ girls",
    students: 2000,
    focus: "STEM Education"
  },
  {
    id: "3",
    title: "School Library & Reading Program",
    description: "Building libraries and implementing reading programs in elementary schools. Providing books, reading materials, and literacy training for teachers.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 45000,
    goal: 80000,
    donors: 189,
    category: "Literacy",
    location: "Rural Bangladesh",
    urgency: "medium",
    endDate: "2025-04-01",
    organizationName: "Reading for All",
    progress: 56,
    daysLeft: 120,
    impact: "Literacy improvement for 3,000+ children",
    students: 3000,
    focus: "Reading & Literacy"
  },
  {
    id: "4",
    title: "Vocational Training for Youth",
    description: "Providing practical skills training in carpentry, electrical work, plumbing, and other trades. Includes tools, materials, and job placement support.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 78000,
    goal: 120000,
    donors: 345,
    category: "Vocational",
    location: "Philippines",
    urgency: "medium",
    endDate: "2025-05-15",
    organizationName: "Skills for Success",
    progress: 65,
    daysLeft: 165,
    impact: "Job training for 1,500+ youth",
    students: 1500,
    focus: "Practical Skills"
  },
  {
    id: "5",
    title: "Special Needs Education Support",
    description: "Creating inclusive learning environments for children with disabilities. Providing specialized equipment, teacher training, and accessible facilities.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 34000,
    goal: 60000,
    donors: 123,
    category: "Inclusive Education",
    location: "Mexico",
    urgency: "low",
    endDate: "2025-06-30",
    organizationName: "Inclusive Learning Network",
    progress: 57,
    daysLeft: 210,
    impact: "Inclusive education for 800+ children",
    students: 800,
    focus: "Special Needs Support"
  },
  {
    id: "6",
    title: "Teacher Professional Development",
    description: "Enhancing teaching quality through professional development programs. Includes workshops, certification courses, and ongoing mentorship support.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 56000,
    goal: 90000,
    donors: 267,
    category: "Teacher Training",
    location: "Colombia",
    urgency: "medium",
    endDate: "2025-03-30",
    organizationName: "Educators for Excellence",
    progress: 62,
    daysLeft: 100,
    impact: "Professional development for 500+ teachers",
    students: 10000,
    focus: "Teacher Quality"
  }
];

export default function EducationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");

  const filteredCampaigns = educationCampaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory;
    const matchesUrgency = selectedUrgency === "all" || campaign.urgency === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const categories = Array.from(new Set(educationCampaigns.map(c => c.category)));
  const totalRaised = educationCampaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalStudents = educationCampaigns.reduce((sum, c) => sum + c.students, 0);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-primary text-white";
      case "medium": return "bg-secondary text-white";
      case "low": return "bg-accent text-white";
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Technology": return <Brain className="h-4 w-4" />;
      case "STEM": return <Lightbulb className="h-4 w-4" />;
      case "Literacy": return <BookOpen className="h-4 w-4" />;
      case "Vocational": return <School className="h-4 w-4" />;
      case "Inclusive Education": return <Users className="h-4 w-4" />;
      case "Teacher Training": return <GraduationCap className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
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
            {/* Education Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-semibold text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm">
              <BookOpen className="h-4 w-4" />
              Education & Learning
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Education Campaigns
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Empowering minds through education, technology, and skill development. 
              Every donation builds brighter futures and opens doors of opportunity.
            </p>

            {/* Education Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-3xl font-bold text-primary mb-2">${(totalRaised / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-primary/80 font-medium">Education Funds Raised</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="text-3xl font-bold text-secondary mb-2">{totalStudents.toLocaleString()}+</div>
                <div className="text-sm text-secondary/80 font-medium">Students Impacted</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="text-3xl font-bold text-accent mb-2">{educationCampaigns.length}</div>
                <div className="text-sm text-accent/80 font-medium">Active Programs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Impact Banner */}
      <section className="py-6 px-10 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container">
          <div className="flex items-center justify-center gap-3 text-center">
            <Lightbulb className="h-5 w-5" />
            <span className="font-semibold">
              Education is the most powerful weapon which you can use to change the world. - Nelson Mandela
            </span>
            <Lightbulb className="h-5 w-5" />
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
                placeholder="Search education programs, skills, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            {/* Enhanced Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Education Filters:
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
      <section className="py-8 px-10 bg-primary/5">
        <div className="container">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              Showing {filteredCampaigns.length} of {educationCampaigns.length} education campaigns
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                High Priority
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                Medium Priority
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                Low Priority
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Education Campaigns Grid */}
      <section className="py-24 px-10">
        <div className="container">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No education campaigns found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters to find more education campaigns.
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
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getUrgencyColor(campaign.urgency)}`}>
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

                      {/* Education Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                          <Lightbulb className="inline h-3 w-3 mr-1" />
                          Focus: {campaign.focus}
                        </div>
                        <div className="text-xs text-primary/60">
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
                        <BookOpen className="mr-2 h-4 w-4" />
                        Support Education
                      </Button>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Education CTA Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Lightbulb className="h-4 w-4" />
              Invest in the Future
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Education is the Foundation of Progress
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your support creates opportunities, builds skills, and transforms lives through the power of education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90" asChild>
                <Link href="/campaigns">View All Education Programs</Link>
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
