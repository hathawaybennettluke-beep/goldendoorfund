import { ArrowRight, TrendingUp, Users, Target, CheckCircle, Sparkles, Heart, Globe, HandHeart, Trophy, Shield, Star, PiggyBank, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatsProps {
  heading?: string;
  description?: string;
  link?: {
    text: string;
    url: string;
  };
  stats?: Array<{
    id: string;
    value: string;
    label: string;
    icon?: React.ReactNode;
    trend?: string;
    color?: string;
  }>;
}

const Stats = ({
  heading = "Our Impact in Numbers",
  description = "Transparent reporting on how your donations create meaningful change",
  link = {
    text: "View detailed impact report",
    url: "https://www.google.com",
  },
  stats = [
    {
      id: "stat-1",
      value: "$2.8M+",
      label: "total funds raised for causes worldwide",
      icon: <PiggyBank className="h-12 w-12" />,
      trend: "+15% this month",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "stat-2",
      value: "15,000+",
      label: "active donors supporting campaigns",
      icon: <UserCheck className="h-12 w-12" />,
      trend: "+2,500 new donors",
      color: "from-primary to-primary/80",
    },
    {
      id: "stat-3",
      value: "450+",
      label: "successful campaigns completed",
      icon: <Trophy className="h-12 w-12" />,
      trend: "+45 this quarter",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "stat-4",
      value: "98.5%",
      label: "of donations reach their intended recipients",
      icon: <ShieldCheck className="h-12 w-12" />,
      trend: "Maintained",
      color: "from-green-500 to-green-600",
    },
  ],
}: StatsProps) => {
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <div className="absolute top-40 right-32 h-12 w-12 sm:h-24 sm:w-24 rounded-full bg-blue-500/10 blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/3 h-20 w-20 sm:h-40 sm:w-40 rounded-full bg-emerald-500/10 blur-2xl animate-pulse delay-2000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] lg:h-[800px] lg:w-[800px] rounded-full bg-gradient-to-r from-primary/20 via-blue-500/10 to-emerald-500/20 blur-3xl opacity-30" />
      </div>

      <div className="container relative z-10">
        {/* Enhanced Header Section */}
        <div className="mx-auto max-w-4xl text-center mb-12 sm:mb-16 lg:mb-20">
          {/* Impact Metrics Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-blue-500/10 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-primary border border-primary/20 mb-6 sm:mb-8 shadow-lg backdrop-blur-sm">
            <div className="relative">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="absolute -top-1 -right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary rounded-full animate-ping" />
            </div>
            Impact Metrics
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60" />
          </div>
          
          {/* Main Heading */}
          <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl font-bold md:text-6xl lg:text-7xl bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
            {heading}
          </h2>
          
          {/* Description */}
          <p className="mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
          
          {/* Enhanced CTA Button */}
          <Button 
            asChild 
            size="lg"
            className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-500 hover:scale-105 border-0"
          >
            <a href={link.url} className="flex items-center gap-2 sm:gap-3 relative z-10">
              {link.text}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </a>
          </Button>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12 sm:mb-16 lg:mb-20">
          {stats.map((stat, index) => (
            <div 
              key={stat.id} 
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-700 hover:scale-105 hover:border-primary/40 hover:bg-gradient-to-br hover:from-card/90 hover:to-card/60"
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-all duration-700`} />
              
              {/* Floating Particles */}
              <div className="absolute top-4 right-4 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500" />
              <div className="absolute bottom-6 left-6 h-1 w-1 sm:h-1.5 sm:w-1.5 bg-blue-500/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500 delay-200" />
              
              {/* Enhanced Icon Container */}
              <div className="mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border-2 border-primary/30 group-hover:border-primary/50 group-hover:bg-gradient-to-br group-hover:from-primary/25 group-hover:via-primary/20 group-hover:to-primary/15 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                <div className="text-primary group-hover:text-primary/90 group-hover:scale-110 transition-all duration-500 drop-shadow-lg">
                  {stat.icon}
                </div>
              </div>

              {/* Enhanced Value */}
              <div className="mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent group-hover:from-primary to-primary/60 transition-all duration-500">
                {stat.value}
              </div>

              {/* Enhanced Label */}
              <p className="mb-4 sm:mb-5 text-sm sm:text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-500">
                {stat.label}
              </p>

              {/* Enhanced Trend */}
              {stat.trend && (
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-primary">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-gradient-to-r from-primary to-primary/60 animate-pulse" />
                  {stat.trend}
                </div>
              )}

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-700" />
              
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-2xl sm:rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
            </div>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base text-muted-foreground border border-border/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-gradient-to-r hover:from-muted to-muted/80">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
            Join thousands of donors making a difference
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Stats };
