import { Heart, Shield, Users, Globe, Target, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/Stats";

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
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Tech entrepreneur passionate about using technology to solve social problems and create positive change.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      bio: "Operations expert ensuring every donation reaches its intended destination efficiently and securely.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    },
    {
      name: "David Thompson",
      role: "Head of Partnerships",
      bio: "Building relationships with organizations worldwide to expand our impact and reach more communities.",
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-24 px-10 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About DonateNow
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We&apos;re on a mission to make charitable giving simple,
              transparent, and impactful. Since 2020, we&apos;ve helped
              thousands of donors support causes they care about while ensuring
              every contribution creates real, measurable change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/campaigns">View Our Impact</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We believe that everyone deserves the opportunity to make a
                positive impact in the world. Our platform removes the barriers
                between generous hearts and meaningful causes, creating a
                transparent, secure, and efficient way to support communities in
                need.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Through cutting-edge technology and partnerships with verified
                organizations worldwide, we ensure that your donations reach
                their intended recipients and create lasting change.
              </p>
              <div className="flex items-center gap-4">
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
                src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
                alt="Our mission"
                className="rounded-lg shadow-lg w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6" />
                  <span className="font-semibold">Certified B-Corp</span>
                </div>
                <p className="text-sm mt-1">Committed to social impact</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-10 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do and shape how we
              build relationships with donors, organizations, and communities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
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
            },
            {
              id: "active-donors",
              value: "15,000+",
              label: "active donors supporting campaigns",
            },
            {
              id: "campaigns-funded",
              value: "450+",
              label: "successful campaigns completed",
            },
            {
              id: "success-rate",
              value: "98.5%",
              label: "of donations reach their intended recipients",
            },
          ]}
        />
      </div>

      {/* Team Section */}
      <section className="py-24 px-10 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;re a diverse group of professionals united by our passion
              for creating positive change and making charitable giving more
              accessible to everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of donors who are already creating positive change
              in communities worldwide. Every donation, no matter the size,
              makes a real impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/campaigns">Browse Campaigns</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
