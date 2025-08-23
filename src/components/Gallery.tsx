"use client";

import { ArrowLeft, ArrowRight, Sparkles, ExternalLink, Heart, Users, Globe } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  category?: string;
  impact?: string;
  location?: string;
}

export interface GalleryProps {
  title?: string;
  description?: string;
  items?: GalleryItem[];
}

const data = [
  {
    id: "water-wells",
    title: "Clean Water Wells in Rural Communities",
    description:
      "Providing sustainable access to clean drinking water for remote villages. Each well serves 500+ people and includes community training for long-term maintenance.",
    href: "/campaigns/water-wells",
    image:
      "https://images.unsplash.com/photo-1551250928-243dc937c49d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMjN8fHx8fHwyfHwxNzIzODA2OTM5fA&ixlib=rb-4.0.3&q=80&w=1080",
    category: "Water & Sanitation",
    impact: "500+ people served",
    location: "East Africa",
  },
  {
    id: "education-support",
    title: "School Supplies for Underprivileged Children",
    description:
      "Ensuring every child has access to basic educational materials and books. Supporting 500+ students across 10 schools with sustainable resources.",
    href: "/campaigns/education",
    image:
      "https://images.unsplash.com/photo-1551250928-e4a05afaed1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMjR8fHx8fHwyfHwxNzIzODA2OTM5fA&ixlib=rb-4.0.3&q=80&w=1080",
    category: "Education",
    impact: "500+ students",
    location: "Rural Bangladesh",
  },
  {
    id: "medical-clinic",
    title: "Mobile Medical Clinic for Remote Areas",
    description:
      "Bringing essential healthcare services to communities without access to medical facilities. Includes equipment, staff training, and transportation.",
    href: "/campaigns/medical",
    image:
      "https://images.unsplash.com/photo-1536735561749-fc87494598cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxNzd8fHx8fHwyfHwxNzIzNjM0NDc0fA&ixlib=rb-4.0.3&q=80&w=1080",
    category: "Healthcare",
    impact: "1000+ patients",
    location: "Amazon Basin",
  },
  {
    id: "reforestation",
    title: "Reforestation Project - Plant 10,000 Trees",
    description:
      "Combat climate change by planting native trees in deforested areas. Includes community education and long-term forest management training.",
    href: "/campaigns/reforestation",
    image:
      "https://images.unsplash.com/photo-1548324215-9133768e4094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMzF8fHx8fHwyfHwxNzIzNDM1MzA1fA&ixlib=rb-4.0.3&q=80&w=1080",
    category: "Environment",
    impact: "10,000 trees",
    location: "Costa Rica",
  },
  {
    id: "women-empowerment",
    title: "Women's Empowerment Microfinance Program",
    description:
      "Supporting women entrepreneurs with small loans and business training to start sustainable businesses in their communities.",
    href: "/campaigns/women-empowerment",
    image:
      "https://images.unsplash.com/photo-1550070881-a5d71eda5800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NDI3NzN8MHwxfGFsbHwxMjV8fHx8fHwyfHwxNzIzNDM1Mjk4fA&ixlib=rb-4.0.3&q=80&w=1080",
    category: "Economic Development",
    impact: "200+ women",
    location: "Rural India",
  },
];

const Gallery = ({
  title = "Impact Stories & Case Studies",
  description = "Discover how your donations create real change in communities worldwide. These stories showcase the transformative impact of collective giving.",
  items = data,
}: GalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "water & sanitation":
        return "from-blue-500 to-blue-600";
      case "education":
        return "from-green-500 to-green-600";
      case "healthcare":
        return "from-red-500 to-red-600";
      case "environment":
        return "from-emerald-500 to-emerald-600";
      case "economic development":
        return "from-purple-500 to-purple-600";
      default:
        return "from-primary to-primary/80";
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
      </div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary border border-secondary/20 mb-6">
            <Sparkles className="h-4 w-4" />
            Success Stories
          </div>
          
          <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            {title}
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="mb-12 flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => carouselApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="h-12 w-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary/30 transition-all duration-300 disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? "bg-primary w-8" 
                    : "bg-primary/20 hover:bg-primary/40"
                }`}
                onClick={() => carouselApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          <Button
            size="icon"
            variant="outline"
            onClick={() => carouselApi?.scrollNext()}
            disabled={!canScrollNext}
            className="h-12 w-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary/30 transition-all duration-300 disabled:opacity-50"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
        >
          <CarouselContent className="ml-0 2xl:mr-[max(0rem,calc(50vw-700px))] 2xl:ml-[max(8rem,calc(50vw-700px))]">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="max-w-[380px] pl-[20px] lg:max-w-[420px]"
              >
                <a href={item.href} className="group block">
                  <div className="group relative h-full min-h-[32rem] max-w-full overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30">
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Category Badge */}
                      {item.category && (
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${getCategoryColor(item.category)} px-3 py-1.5 text-xs font-semibold text-white shadow-lg`}>
                            {item.category}
                          </span>
                        </div>
                      )}
                      
                      {/* Impact Badge */}
                      {item.impact && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground border border-border/50 shadow-lg">
                            <Heart className="h-3 w-3 text-primary" />
                            {item.impact}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="mb-3 text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      
                      <p className="mb-6 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Location */}
                      {item.location && (
                        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          {item.location}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors duration-300">
                          Read more
                          <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>Community Impact</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Border Effect */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Bottom CTA */}
      <div className="container mt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-sm text-muted-foreground">
          <Heart className="h-4 w-4 text-primary" />
          Every story represents real lives changed by your generosity
        </div>
      </div>
    </section>
  );
};

export { Gallery };
