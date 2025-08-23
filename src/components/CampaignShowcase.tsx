import { ArrowRight, Heart, Users, Target, Sparkles, Globe, BookOpen, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  category: string;
  urgency?: "high" | "medium" | "low";
}

interface CampaignShowcaseProps {
  heading?: string;
  description?: string;
  campaigns?: Campaign[];
  viewAllUrl?: string;
}

const defaultCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Water Wells for Rural Communities",
    description:
      "Providing clean, safe drinking water to remote villages in East Africa. Each well serves 500+ people and includes maintenance training for local communities.",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 45000,
    goal: 75000,
    donors: 234,
    category: "Water & Sanitation",
    urgency: "high",
  },
  {
    id: "2",
    title: "School Supplies for Underprivileged Children",
    description:
      "Ensuring every child has access to basic educational materials and books for the upcoming school year. Supporting 500+ students across 10 schools.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80",
    raised: 28000,
    goal: 40000,
    donors: 156,
    category: "Education",
    urgency: "medium",
  },
  {
    id: "3",
    title: "Mobile Medical Clinic for Remote Areas",
    description:
      "Bringing essential healthcare services to communities without access to medical facilities. Includes equipment, staff training, and transportation.",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    raised: 62000,
    goal: 100000,
    donors: 389,
    category: "Healthcare",
    urgency: "high",
  },
];

const CampaignShowcase = ({
  heading = "Active Campaigns Making a Difference",
  description = "Support causes that matter to you. Every donation brings us closer to our goals and creates lasting impact in communities worldwide.",
  campaigns = defaultCampaigns,
  viewAllUrl = "/campaigns",
}: CampaignShowcaseProps) => {
  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "water & sanitation":
        return <Globe className="h-4 w-4" />;
      case "education":
        return <BookOpen className="h-4 w-4" />;
      case "healthcare":
        return <HeartHandshake className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <section className="py-24 px-10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5" />
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
      </div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary border border-secondary/20 mb-6">
            <Sparkles className="h-4 w-4" />
            Featured Campaigns
          </div>
          
          <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            {heading}
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Urgency Badge */}
                {campaign.urgency && (
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getUrgencyColor(campaign.urgency)} shadow-lg`}
                    >
                      {campaign.urgency === "high"
                        ? "🔥 Urgent"
                        : campaign.urgency === "medium"
                          ? "⚡ Active"
                          : "🌱 Ongoing"}
                    </span>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground border border-border/50 shadow-lg">
                    {getCategoryIcon(campaign.category)}
                    {campaign.category}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="mb-3 text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {campaign.title}
                </h3>
                
                <p className="mb-6 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {campaign.description}
                </p>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(campaign.raised)} raised
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(campaign.goal)} goal
                    </span>
                  </div>
                  
                  {/* Enhanced Progress Bar */}
                  <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
                    <div
                      className="relative h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out shadow-lg"
                      style={{
                        width: `${getProgressPercentage(campaign.raised, campaign.goal)}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-medium">{campaign.donors.toLocaleString()}</span> donors
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {Math.round(getProgressPercentage(campaign.raised, campaign.goal))}%
                      </span> funded
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn"
                >
                  <Heart className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                  Donate Now
                </Button>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild 
            size="lg"
            variant="outline"
            className="group px-8 py-6 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <a href={viewAllUrl} className="flex items-center gap-2">
              View All Campaigns
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export { CampaignShowcase };
