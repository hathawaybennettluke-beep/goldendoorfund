import { ArrowDownRight, Star, Sparkles, Heart, Shield, Users, Globe, TrendingUp, CheckCircle } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeroProps {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
    rating?: number;
  };
}

const Hero = ({
  heading = "Transform Lives with Every Donation",
  description = "Join a global community of changemakers. Your generosity creates real impact through transparent, verified campaigns that change lives worldwide.",
  buttons = {
    primary: {
      text: "Start Making Impact",
      url: "/campaigns",
    },
    secondary: {
      text: "See Our Stories",
      url: "/about",
    },
  },
  reviews = {
    count: 15000,
    rating: 4.9,
    avatars: [
      {
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
        alt: "Donor 1",
      },
      {
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Donor 2",
      },
      {
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Donor 3",
      },
      {
        src: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Donor 4",
      },
      {
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        alt: "Donor 5",
      },
    ],
  },
}: HeroProps) => {
  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 py-16 sm:py-20 lg:py-24">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Animated Floating Elements */}
        <div className="absolute top-20 left-10 h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 h-12 w-12 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 h-10 w-10 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 blur-2xl animate-pulse delay-2000" />
        
        {/* Additional floating elements */}
        <div className="absolute top-1/3 right-1/3 h-8 w-8 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 blur-xl animate-pulse delay-1500" />
        <div className="absolute bottom-1/3 right-1/4 h-6 w-6 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 blur-lg animate-pulse delay-3000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-primary/5" />
      </div>

      <div className="container relative z-10">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left Content */}
          <div className="mx-auto flex flex-col items-center text-center px-4 sm:px-6 lg:max-w-2xl lg:items-start lg:text-left">
            {/* Enhanced Badge */}
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/10 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-primary border border-primary/20 shadow-lg backdrop-blur-sm animate-fade-in">
              <div className="relative">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="absolute -top-1 -right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary rounded-full animate-ping" />
              </div>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Trusted by {reviews.count.toLocaleString()}+ donors worldwide
              </span>
            </div>

            {/* Main Heading with Enhanced Typography */}
            <h1 className="mb-6 sm:mb-8 text-pretty text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                {heading}
              </span>
            </h1>

            {/* Enhanced Description */}
            <p className="mb-6 sm:mb-8 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-in-up delay-200">
              {description}
            </p>

            {/* Enhanced Trust Indicators */}
            <div className="mb-6 sm:mb-8 flex w-fit flex-col items-center gap-4 sm:gap-6 sm:flex-row animate-fade-in-up delay-300">
              {/* Avatar Stack */}
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="inline-flex items-center -space-x-2 sm:-space-x-3">
                  {reviews.avatars.map((avatar, index) => (
                    <Avatar 
                      key={index} 
                      className="size-8 sm:size-10 lg:size-12 border-2 border-background shadow-lg ring-2 ring-primary/20 hover:scale-110 transition-transform duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <AvatarImage src={avatar.src} alt={avatar.alt} />
                    </Avatar>
                  ))}
                </span>
                
                {/* Rating */}
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className="size-4 sm:size-5 fill-yellow-400 text-yellow-400 drop-shadow-sm"
                        />
                      ))}
                    </div>
                    <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {reviews.rating?.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    from {reviews.count.toLocaleString()}+ reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Feature Pills */}
            <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-2 sm:gap-3 justify-center lg:justify-start animate-fade-in-up delay-400">
              <div className="group flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-green-700 border border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" />
                Secure Payments
              </div>
              <div className="group flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" />
                Transparent Impact
              </div>
              <div className="group flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-purple-50 to-violet-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-purple-700 border border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" />
                Global Community
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex w-full flex-col justify-center gap-3 sm:gap-4 sm:flex-row lg:justify-start animate-fade-in-up delay-500">
              {buttons.primary && (
                              <Button 
                asChild 
                size="lg"
                className="group w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary border-0"
              >
                <a href={buttons.primary.url} className="flex items-center gap-2">
                  {buttons.primary.text}
                  <ArrowDownRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </a>
              </Button>
              )}
              {buttons.secondary && (
                              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="group w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-4 text-base font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 bg-background/80 backdrop-blur-sm"
              >
                <a href={buttons.secondary.url} className="flex items-center gap-2">
                  {buttons.secondary.text}
                  <ArrowDownRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </a>
              </Button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-md animate-fade-in-up delay-600">
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-lg sm:text-xl font-bold text-primary">$2.8M+</div>
                <div className="text-xs text-muted-foreground">Raised</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="text-lg sm:text-xl font-bold text-secondary">450+</div>
                <div className="text-xs text-muted-foreground">Campaigns</div>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="text-lg sm:text-xl font-bold text-accent">98.5%</div>
                <div className="text-xs text-muted-foreground">Success</div>
              </div>
            </div>
          </div>

          {/* Right Visual - Enhanced */}
          <div className="relative flex justify-center lg:justify-end px-4 sm:px-6 lg:px-0">
            {/* Main Image Container */}
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
              {/* Enhanced Background Glow */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/30 via-primary/20 to-transparent blur-3xl animate-pulse" />
              
              {/* Main Image with Enhanced Effects */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
                  alt="People working together for community impact"
                  className="max-h-[300px] sm:max-h-[400px] w-full object-cover lg:max-h-[500px] xl:max-h-[600px] transition-transform duration-700 hover:scale-105"
                />
                
                {/* Enhanced Overlay Elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Floating Stats with Enhanced Design */}
                <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-background/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl border border-border/50 hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      <span className="text-lg sm:text-2xl font-bold text-primary">$2.8M+</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Total Raised</div>
                  </div>
                </div>
                
                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-background/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl border border-border/50 hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      <span className="text-lg sm:text-2xl font-bold text-secondary">15K+</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Active Donors</div>
                  </div>
                </div>

                {/* Bottom Achievement Badge */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg border border-white/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Verified Impact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-2.5 bg-primary/60 rounded-full mt-1.5 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
