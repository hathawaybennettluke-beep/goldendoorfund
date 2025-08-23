"use client";
import { Blog7 } from "@/components/BlogTeaser";
import { CampaignShowcase } from "@/components/CampaignShowcase";
import { Community } from "@/components/Community";
import { Cta } from "@/components/CTA";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { InvertedSection } from "@/components/InvertedTheme";
import { PaymentFeatures } from "@/components/PaymentFeatures";
import { Stats } from "@/components/Stats";

export default function Home() {
  return (
    <div className={`flex flex-col`}>
      <div className="px-10 py-10">
        <Hero
          heading="Make a Difference with Every Donation"
          description="Join thousands of donors making a positive impact worldwide. Support causes you care about with secure, transparent donations that create real change in communities."
          buttons={{
            primary: {
              text: "Start Donating",
              url: "/donate",
            },
            secondary: {
              text: "View Campaigns",
              url: "/campaigns",
            },
          }}
          reviews={{
            count: 15000,
            rating: 4.9,
            avatars: [
              {
                src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
                alt: "Donor 1",
              },
              {
                src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
                alt: "Donor 2",
              },
              {
                src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
                alt: "Donor 3",
              },
              {
                src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
                alt: "Donor 4",
              },
              {
                src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
                alt: "Donor 5",
              },
            ],
          }}
        />
      </div>

      <div className="px-10">
        <Stats
          heading="Our Impact in Numbers"
          description="Transparent reporting on how your donations create meaningful change"
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

      <div className="px-10">
        <CampaignShowcase />
      </div>

      <div className="px-10">
        <PaymentFeatures />
      </div>

      <div className="px-10">
        <Gallery />
      </div>

      <div className="px-10">
        <FAQ
          heading="Frequently Asked Questions"
          description="Find answers to common questions about donating, campaigns, and how we ensure your contributions make an impact."
          supportHeading="Still have questions?"
          supportDescription="Our support team is available 24/7 to help with donations, account issues, or campaign inquiries."
          supportButtonText="Contact Support"
          supportButtonUrl="/contact"
        />
      </div>
      <div className="px-10">
        <Blog7
          tagline="Impact Stories"
          heading="See Your Donations at Work"
          description="Read inspiring stories from communities and individuals whose lives have been transformed by your generous donations. Every contribution makes a difference."
          buttonText="Read all stories"
          buttonUrl="/stories"
        />
      </div>
      <div className="px-10">
        <Cta
          title="Ready to Make an Impact?"
          description="Join our community of donors and start making a difference today. Every donation, no matter the size, helps create positive change."
          buttonText="Start Donating Now"
          buttonUrl="/donate"
          items={[
            "100% Secure Payments",
            "Tax-Deductible Receipts",
            "Real-Time Impact Tracking",
            "Multiple Payment Options",
            "Transparent Fund Usage",
          ]}
        />
      </div>

      <div className="px-10">
        <Community />
      </div>
      <div className="px-10">
        <Footer
          logo={{
            url: "/",
            src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
            alt: "DonateNow Logo",
            title: "DonateNow",
          }}
          sections={[
            {
              title: "Donate",
              links: [
                { name: "Active Campaigns", href: "/campaigns?status=active" },
                { name: "Emergency Relief", href: "/campaigns?urgency=high" },
                { name: "Education", href: "/campaigns?category=Education" },
                { name: "Healthcare", href: "/campaigns?category=Healthcare" },
              ],
            },
            {
              title: "Support",
              links: [
                { name: "How It Works", href: "/how-it-works" },
                { name: "Payment Security", href: "/security" },
                { name: "Impact Reports", href: "/impact" },
                { name: "Contact Us", href: "/contact" },
              ],
            },
            {
              title: "Account",
              links: [
                { name: "Sign In", href: "/sign-in" },
                { name: "Register", href: "/sign-up" },
                { name: "Donation History", href: "/history" },
                { name: "Tax Receipts", href: "/receipts" },
              ],
            },
          ]}
          description="Making charitable giving simple, secure, and transparent. Join thousands of donors creating positive change worldwide."
          copyright="© 2024 DonateNow. All rights reserved."
          legalLinks={[
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
            { name: "Cookie Policy", href: "/cookies" },
          ]}
        />
      </div>
    </div>
  );
}
