import { ArrowDownRight, Star, Sparkles, Heart, Shield, Users } from "lucide-react";
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
  heading = "Blocks built with Shadcn & Tailwind",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  buttons = {
    primary: {
      text: "Sign Up",
      url: "https://www.google.com",
    },
    secondary: {
      text: "Get Started",
      url: "https://www.google.com",
    },
  },
  reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
        alt: "Avatar 1",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
        alt: "Avatar 2",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
        alt: "Avatar 3",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
        alt: "Avatar 4",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
        alt: "Avatar 5",
      },
    ],
  },
}: HeroProps) => {
  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 right-20 h-12 w-12 sm:h-24 sm:w-24 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-20 left-1/4 h-10 w-10 sm:h-20 sm:w-20 rounded-full bg-accent/10 blur-2xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container relative z-10 grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left Content */}
        <div className="mx-auto flex flex-col items-center text-center px-4 sm:px-6 md:ml-auto lg:max-w-3xl lg:items-start lg:text-left lg:px-0">
          {/* Badge */}
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-primary border border-primary/20">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            Trusted by 15,000+ donors worldwide
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 sm:mb-8 text-pretty text-3xl sm:text-4xl md:text-5xl font-bold leading-tight lg:text-6xl xl:text-7xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            {heading}
          </h1>

          {/* Description */}
          <p className="mb-8 sm:mb-12 max-w-2xl text-base sm:text-lg text-muted-foreground lg:text-xl leading-relaxed">
            {description}
          </p>

          {/* Trust Indicators */}
          <div className="mb-8 sm:mb-12 flex w-fit flex-col items-center gap-4 sm:gap-6 sm:flex-row">
            {/* Avatar Stack */}
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="inline-flex items-center -space-x-2 sm:-space-x-3">
                {reviews.avatars.map((avatar, index) => (
                  <Avatar key={index} className="size-8 sm:size-10 lg:size-12 border-2 border-background shadow-lg ring-2 ring-primary/20">
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
                  <span className="font-bold text-base sm:text-lg">
                    {reviews.rating?.toFixed(1)}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                  from {reviews.count.toLocaleString()}+ reviews
                </p>
              </div>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="mb-8 sm:mb-12 flex flex-wrap items-center gap-2 sm:gap-3 justify-center lg:justify-start">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-green-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-green-700 border border-green-200">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              Secure Payments
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              Transparent Impact
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-purple-50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-purple-700 border border-purple-200">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              Global Community
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex w-full flex-col justify-center gap-3 sm:gap-4 sm:flex-row lg:justify-start">
            {buttons.primary && (
              <Button 
                asChild 
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <a href={buttons.primary.url} className="flex items-center gap-2">
                  {buttons.primary.text}
                  <ArrowDownRight className="size-4 sm:size-5" />
                </a>
              </Button>
            )}
            {buttons.secondary && (
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                <a href={buttons.secondary.url} className="flex items-center gap-2">
                  {buttons.secondary.text}
                  <ArrowDownRight className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative flex justify-center lg:justify-end px-4 sm:px-6 lg:px-0">
          {/* Main Image Container */}
          <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none">
            {/* Background Glow */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl" />
            
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
                alt="People working together for community impact"
                className="max-h-[400px] sm:max-h-[500px] w-full object-cover lg:max-h-[700px]"
              />
              
              {/* Overlay Elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Floating Stats */}
              <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-background/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-border/50">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">$2.8M+</div>
                  <div className="text-xs text-muted-foreground">Raised</div>
                </div>
              </div>
              
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-background/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-border/50">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-secondary">15K+</div>
                  <div className="text-xs text-muted-foreground">Donors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
