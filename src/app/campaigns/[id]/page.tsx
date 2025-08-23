"use client";

import { useState } from "react";
import {
  Heart,
  Share2,
  Calendar,
  MapPin,
  Users,
  Target,
  Clock,
  Shield,
  CheckCircle,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock data - in a real app, this would come from your database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCampaignDetails: { [key: string]: any } = {
  "1": {
    id: "1",
    title: "Emergency Water Wells for Rural Communities",
    description:
      "Providing clean, safe drinking water to remote villages in East Africa. Each well serves 500+ people and includes maintenance training for local communities.",
    fullDescription: `
      <p>Access to clean water is a fundamental human right, yet millions of people in rural East Africa continue to lack this basic necessity. Our Emergency Water Wells project aims to change this reality by drilling deep wells in underserved communities.</p>
      
      <h3>The Problem</h3>
      <p>In remote villages across East Africa, families often walk hours daily to collect water from contaminated sources. This leads to:</p>
      <ul>
        <li>Water-borne diseases affecting entire communities</li>
        <li>Children missing school to help with water collection</li>
        <li>Women spending up to 6 hours daily walking to water sources</li>
        <li>Limited agricultural and economic development</li>
      </ul>
      
      <h3>Our Solution</h3>
      <p>Each well we drill will:</p>
      <ul>
        <li>Serve 500+ community members with clean, safe water</li>
        <li>Include solar-powered pumping systems for reliability</li>
        <li>Provide comprehensive maintenance training to local technicians</li>
        <li>Establish community water committees for long-term sustainability</li>
      </ul>
      
      <h3>Impact Timeline</h3>
      <p>Phase 1 (Months 1-3): Site assessment and community engagement<br/>
      Phase 2 (Months 4-8): Well drilling and infrastructure setup<br/>
      Phase 3 (Months 9-12): Training programs and sustainability measures</p>
    `,
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    raised: 45000,
    goal: 75000,
    donors: 234,
    category: "Water & Sanitation",
    location: "East Africa",
    status: "active",
    urgency: "high",
    endDate: "2024-12-15",
    organizationName: "Water for Life Foundation",
    organizationVerified: true,
    updates: [
      {
        id: 1,
        date: "2024-10-15",
        title: "Site Assessment Complete",
        content:
          "We've completed our assessment of 12 potential well sites across 6 villages. Community leaders have been engaged and are excited about the project.",
        images: [
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
        ],
      },
      {
        id: 2,
        date: "2024-09-30",
        title: "Project Launch",
        content:
          "Thanks to your generous support, we're officially launching the Emergency Water Wells project. Our team is now on the ground conducting initial surveys.",
        images: [],
      },
    ],
    recentDonations: [
      { name: "Sarah M.", amount: 500, time: "2 hours ago", anonymous: false },
      { name: "Anonymous", amount: 100, time: "5 hours ago", anonymous: true },
      { name: "Michael K.", amount: 250, time: "1 day ago", anonymous: false },
      { name: "Anonymous", amount: 75, time: "2 days ago", anonymous: true },
      { name: "Emma L.", amount: 150, time: "3 days ago", anonymous: false },
    ],
  },
  // Add more campaign details as needed
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const campaign = mockCampaignDetails[campaignId];

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The campaign you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const predefinedAmounts = [25, 50, 100, 250, 500];

  return (
    <div className="flex flex-col">
      {/* Back Navigation */}
      <div className="py-4 px-10 border-b">
        <div className="container">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Link>
        </div>
      </div>

      {/* Campaign Header */}
      <section className="py-12 px-10">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Campaign Image */}
              <div className="relative mb-8">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(campaign.status)}`}
                  >
                    {campaign.status.charAt(0).toUpperCase() +
                      campaign.status.slice(1)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-800">
                    {campaign.category}
                  </span>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                      {campaign.title}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">
                          {campaign.organizationName}
                        </span>
                        {campaign.organizationVerified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{campaign.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          Ends {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold">
                      {formatCurrency(campaign.raised)}
                    </span>
                    <span className="text-muted-foreground">
                      of {formatCurrency(campaign.goal)} goal
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 mb-4">
                    <div
                      className="h-3 rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${getProgressPercentage(campaign.raised, campaign.goal)}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Donors</span>
                      </div>
                      <span className="text-xl font-semibold">
                        {campaign.donors}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">Funded</span>
                      </div>
                      <span className="text-xl font-semibold">
                        {Math.round(
                          getProgressPercentage(campaign.raised, campaign.goal)
                        )}
                        %
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Days Left</span>
                      </div>
                      <span className="text-xl font-semibold">
                        {Math.max(
                          0,
                          Math.ceil(
                            (new Date(campaign.endDate).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About This Campaign</h2>
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: campaign.fullDescription }}
                />
              </div>

              {/* Updates */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Updates</h2>
                <div className="space-y-6">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {campaign.updates.map((update: any) => (
                    <div key={update.id} className="border rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {update.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {update.content}
                      </p>
                      {update.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {update.images.map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Update ${index + 1}`}
                              className="rounded-lg h-32 w-full object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Donation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Donation Form */}
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Make a Donation</h3>

                  {/* Predefined Amounts */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={
                          donationAmount === amount.toString()
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setDonationAmount(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Custom Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Message (Optional)
                    </label>
                    <Textarea
                      placeholder="Leave a message of support..."
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Anonymous Option */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Donate anonymously</span>
                    </label>
                  </div>

                  <Button className="w-full" size="lg">
                    <Heart className="h-4 w-4 mr-2" />
                    Donate {donationAmount ? `$${donationAmount}` : "Now"}
                  </Button>

                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Your donation is secure and tax-deductible
                  </p>
                </div>

                {/* Recent Donations */}
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Donations
                  </h3>
                  <div className="space-y-3">
                    {campaign.recentDonations.map(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (donation: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {donation.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {donation.time}
                            </div>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(donation.amount)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Donations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
