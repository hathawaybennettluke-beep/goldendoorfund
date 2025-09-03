"use client";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { CampaignShowcase } from "@/components/CampaignShowcase";
import { Blog7 } from "@/components/BlogTeaser";
import { Community } from "@/components/Community";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Shield,
  Heart,
  Globe,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  Award,
  Zap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const whyChooseUs = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "100% Transparency",
      description:
        "Track every dollar with real-time updates and detailed impact reports. Know exactly where your donation goes.",
      color: "from-green-500/20 to-green-500/5",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Verified Impact",
      description:
        "All campaigns are thoroughly vetted and monitored. See real stories and measurable results from your generosity.",
      color: "from-red-500/20 to-red-500/5",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description:
        "Support causes worldwide from your home. Our platform connects you with communities in need across the globe.",
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description:
        "Join thousands of donors making a difference together. Share stories, celebrate impact, and inspire others.",
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
    },
  ];

  const impactStories = [
    {
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Clean Water for 500+ Families",
      description:
        "Your donations built 10 water wells in rural Kenya, providing clean drinking water to over 500 families.",
      impact: "500+ families now have access to clean water",
      category: "Water & Sanitation",
    },
    {
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80",
      title: "Education for 200 Children",
      description:
        "Supporting 200 children with school supplies, uniforms, and educational materials in underserved communities.",
      impact: "200 children can now attend school regularly",
      category: "Education",
    },
    {
      image:
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Healthcare for Remote Villages",
      description:
        "Mobile medical clinics providing essential healthcare services to 15 remote villages in Nepal.",
      impact: "15 villages now have access to healthcare",
      category: "Healthcare",
    },
  ];

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Real-time Tracking",
      description: "Monitor your donation's journey from start to finish",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Verified Campaigns",
      description: "All causes are thoroughly vetted and monitored",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Impact Reports",
      description: "Detailed reports showing the difference you make",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Updates",
      description: "Get notified about campaign progress and milestones",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Enhanced Hero Section */}
      <Hero
        heading="Transform Lives with Every Donation"
        description="Join a global community of changemakers. Your generosity creates real impact through transparent, verified campaigns that change lives worldwide."
        buttons={{
          primary: {
            text: "Start Making Impact",
            url: "/campaigns",
          },
          secondary: {
            text: "See Our Stories",
            url: "/about",
          },
        }}
      />

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-secondary/5 blur-2xl" />
        </div>

        <div className="container relative z-10">
          {/* Header */}
          <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              Why Choose Golden Door
            </div>

            <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Trust, Transparency, and Real Impact
            </h2>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              We believe in making charitable giving simple, secure, and
              meaningful. Every feature is designed to ensure your generosity
              creates the biggest possible impact.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {whyChooseUs.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30"
              >
                {/* Background Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 group-hover:border-primary/50 transition-all duration-500 ${feature.iconColor}`}
                  >
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Enhanced CTA */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 backdrop-blur-sm px-8 py-6 text-base text-muted-foreground border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">Ready to make a difference?</span>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Link href="/campaigns" className="flex items-center gap-2">
                  Explore Campaigns
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* Impact Stories Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
          <div className="absolute top-1/3 left-1/3 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
          <div className="absolute bottom-1/3 right-1/3 h-32 w-32 rounded-full bg-primary/10 blur-xl" />
        </div>

        <div className="container relative z-10">
          {/* Header */}
          <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              Real Impact Stories
            </div>

            <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              See Your Generosity in Action
            </h2>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Every donation has a story. Here are just a few examples of how
              your generosity transforms lives and communities around the world.
            </p>
          </div>

          {/* Stories Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {impactStories.map((story, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-primary/30"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-48 sm:h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground border border-border/50 shadow-lg">
                      {story.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-3 text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {story.title}
                  </h3>

                  <p className="mb-4 text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed">
                    {story.description}
                  </p>

                  {/* Impact Highlight */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        Impact Achieved
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {story.impact}
                    </p>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/campaigns" className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                Support More Causes
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Campaign Showcase */}
      {/* <CampaignShowcase /> */}

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 relative overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary border border-primary/20">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                Powerful Features
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
                Everything You Need to Make a Difference
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Our platform is built with donors in mind, providing powerful
                tools and features that make charitable giving simple,
                transparent, and impactful.
              </p>

              <div className="grid gap-3 sm:gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl" />
              <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <div className="h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="h-14 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-6">
                    <div className="h-14 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-accent" />
                    </div>
                    <div className="h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Teaser */}
      <Blog7
        tagline="Impact Stories"
        heading="See Your Donations at Work"
        description="Read inspiring stories from communities and individuals whose lives have been transformed by your generous donations. Every contribution makes a difference."
        buttonText="Read all stories"
        buttonUrl="/blog"
      />

      {/* Community Section */}
      <Community />

      {/* FAQ Section */}
      <FAQ pageType="home" />

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-3xl opacity-30" />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/10 px-6 py-3 text-sm font-medium text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
              Ready to Make a Difference?
            </div>

            <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              Join Thousands of Changemakers
            </h2>

            <p className="mb-8 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Your generosity has the power to transform lives, build
              communities, and create lasting change. Start your journey of
              impact today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white"
              >
                <Link href="/campaigns" className="flex items-center gap-3">
                  Start Donating Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                <Link href="/about" className="flex items-center gap-3">
                  Learn More About Us
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
