"use client";

import { Heart, Shield, Users, Globe, Target, Award, Sparkles, CheckCircle, Star, PiggyBank, UserCheck, Trophy, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";


export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Compassion First",
      description:
        "Every decision we make is guided by empathy and the desire to create meaningful change in people's lives.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Transparency",
      description:
        "We believe in complete openness about how donations are used, with real-time tracking and detailed impact reports.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description:
        "Our platform is built by and for people who want to make a difference, fostering connections between donors and causes.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Impact",
      description:
        "We support causes worldwide, breaking down barriers to help communities regardless of location or size.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former nonprofit director with 15+ years of experience in charitable organizations and social impact.",
      image:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Tech entrepreneur passionate about using technology to solve social problems and create positive change.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      bio: "Operations expert ensuring every donation reaches its intended destination efficiently and securely.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      name: "David Thompson",
      role: "Head of Partnerships",
      bio: "Building relationships with organizations worldwide to expand our impact and reach more communities.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
  ];

  const achievements = [
    {
      number: "4+",
      label: "Years of Impact",
      description: "Serving communities since 2020"
    },
    {
      number: "50+",
      label: "Countries Reached",
      description: "Global presence and impact"
    },
    {
      number: "98.5%",
      label: "Success Rate",
      description: "Of donations reach recipients"
    },
    {
      number: "24/7",
      label: "Support Available",
      description: "Always here when you need us"
    }
  ];

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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-semibold text-primary border border-primary/20 mb-8 shadow-lg backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Making a Difference Since 2020
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
              About DonateNow
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              We&apos;re on a mission to make charitable giving simple,
              transparent, and impactful. Join thousands of donors supporting causes they care about while ensuring
              every contribution creates real, measurable change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
                <Link href="/campaigns">View Our Impact</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300" asChild>
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mission Section */}
      <section className="py-32 px-10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                Empowering Change Through Technology
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that everyone deserves the opportunity to make a
                positive impact in the world. Our platform removes the barriers
                between generous hearts and meaningful causes, creating a
                transparent, secure, and efficient way to support communities in
                need.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Through cutting-edge technology and partnerships with verified
                organizations worldwide, we ensure that your donations reach
                their intended recipients and create lasting change.
              </p>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Target className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Our Goal</h3>
                  <p className="text-muted-foreground">
                    To facilitate $100M in donations by 2025, supporting 1
                    million beneficiaries worldwide.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Our mission - people working together for positive change"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8" />
                  <div>
                    <div className="font-bold text-lg">Certified B-Corp</div>
                    <p className="text-sm opacity-90">Committed to social impact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Values Section */}
      <section className="py-32 px-10 bg-gradient-to-br from-muted/30 to-muted/50">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Star className="h-4 w-4" />
              Our Values
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Core Principles That Guide Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              These fundamental values shape everything we do and define how we
              build relationships with donors, organizations, and communities worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group text-center p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30 hover:bg-card/80">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-500 shadow-lg">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Achievements Section */}
      <section className="py-24 px-10">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-3">{achievement.number}</div>
                <div className="text-lg font-semibold mb-2">{achievement.label}</div>
                <div className="text-sm text-muted-foreground">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="px-10">
        <Stats
          heading="Our Impact in Numbers"
          description="Real results from our community of donors and partner organizations"
          link={{
            text: "View detailed impact report",
            url: "/impact-report",
          }}
          stats={[
            {
              id: "total-raised",
              value: "$2.8M+",
              label: "total funds raised for causes worldwide",
              icon: <PiggyBank className="h-12 w-12" />,
            },
            {
              id: "active-donors",
              value: "15,000+",
              label: "active donors supporting campaigns",
              icon: <UserCheck className="h-12 w-12" />,
            },
            {
              id: "campaigns-funded",
              value: "450+",
              label: "successful campaigns completed",
              icon: <Trophy className="h-12 w-12" />,
            },
            {
              id: "success-rate",
              value: "98.5%",
              label: "of donations reach their intended recipients",
              icon: <ShieldCheck className="h-12 w-12" />,
            },
          ]}
        />
      </div>

      {/* Enhanced Team Section */}
      <section className="py-32 px-10 bg-gradient-to-br from-muted/30 to-muted/50">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Users className="h-4 w-4" />
              Meet Our Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              The People Behind Our Mission
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We&apos;re a diverse group of professionals united by our passion
              for creating positive change and making charitable giving more
              accessible to everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group text-center p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30 hover:bg-card/80">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{member.name}</h3>
                <p className="text-primary font-semibold mb-4">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4" />
              Ready to Make a Difference?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Join Our Mission Today
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of donors who are already creating positive change
              in communities worldwide. Every donation, no matter the size,
              makes a real impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
                <Link href="/campaigns">Browse Campaigns</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300" asChild>
                <Link href="/sign-up">Create Account</Link>
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
