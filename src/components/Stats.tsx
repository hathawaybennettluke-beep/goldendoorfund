import { ArrowRight, TrendingUp, Users, DollarSign, Target, CheckCircle } from "lucide-react";
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
  heading = "Platform performance insights",
  description = "Ensuring stability and scalability for all users",
  link = {
    text: "Read the full impact report",
    url: "https://www.google.com",
  },
  stats = [
    {
      id: "stat-1",
      value: "250%+",
      label: "average growth in user engagement",
      icon: <TrendingUp className="h-6 w-6" />,
      trend: "+12% this month",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "stat-2",
      value: "$2.5m",
      label: "annual savings per enterprise partner",
      icon: <DollarSign className="h-6 w-6" />,
      trend: "+8% this quarter",
      color: "from-green-500 to-green-600",
    },
    {
      id: "stat-3",
      value: "200+",
      label: "integrations with top industry platforms",
      icon: <Target className="h-6 w-6" />,
      trend: "+15 new this year",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "stat-4",
      value: "99.9%",
      label: "customer satisfaction over the last year",
      icon: <CheckCircle className="h-6 w-6" />,
      trend: "Maintained",
      color: "from-orange-500 to-orange-600",
    },
  ],
}: StatsProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
            <TrendingUp className="h-4 w-4" />
            Impact Metrics
          </div>
          
          <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            {heading}
          </h2>
          
          <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="group hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-2 hover:border-primary/30"
          >
            <a href={link.url} className="flex items-center gap-2">
              {link.text}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={stat.id} 
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-primary">
                  {stat.icon}
                </div>
              </div>

              {/* Value */}
              <div className="mb-3 text-4xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {stat.value}
              </div>

              {/* Label */}
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                {stat.label}
              </p>

              {/* Trend */}
              {stat.trend && (
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {stat.trend}
                </div>
              )}

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Join thousands of donors making a difference
          </div>
        </div>
      </div>
    </section>
  );
};

export { Stats };
