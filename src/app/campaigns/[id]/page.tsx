"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  Heart,
  Share2,
  Calendar,
  MapPin,
  Users,
  Target,
  Clock,
  Shield,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import DonationForm from "@/components/DonationForm"; // We'll create this component
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Load Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// For now, we'll use a placeholder image for campaigns without images
const getCampaignImage = (imageUrl?: string) => {
  return (
    imageUrl ||
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
  );
};

export default function CampaignDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const { user } = useUser();
  const { toast, toasts } = useToast();

  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIntentData, setPaymentIntentData] = useState<{
    clientSecret: string;
    donationId: Id<"donations">;
    paymentIntentId: string;
  } | null>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);

  // Actions
  const createPaymentIntent = useAction(api.payments.createPaymentIntent);

  // Fetch campaign data from Convex
  const campaign = useQuery(api.campaigns.get, {
    id: campaignId as Id<"campaigns">,
  });

  // Fetch recent donations
  const recentDonations = useQuery(api.payments.getRecentDonations, {
    campaignId: campaignId as Id<"campaigns">,
    limit: 5,
  });

  // Handle payment status from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast({
        title: "Donation Successful!",
        description: "Thank you for your generous donation.",
        type: "success",
      });
      // Reset form
      setDonationAmount("");
      setDonationMessage("");
      setIsAnonymous(false);
      setShowPaymentForm(false);
      setPaymentIntentData(null);
    } else if (paymentStatus === "canceled") {
      toast({
        title: "Donation Canceled",
        description: "Your donation was not completed.",
        type: "info",
      });
    }
  }, [searchParams, toast]);

  if (campaign === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading campaign...</p>
      </div>
    );
  }

  if (campaign === null) {
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

  const handleDonateClick = async () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to make a donation.",
        type: "error",
      });
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        type: "error",
      });
      return;
    }

    // Create payment intent when transitioning to payment form
    setIsCreatingPaymentIntent(true);
    try {
      const paymentData = await createPaymentIntent({
        amount: amount,
        campaignId: campaignId as Id<"campaigns">,
        donorClerkId: user.id,
        message: donationMessage || undefined,
        isAnonymous: isAnonymous,
      });

      if (!paymentData.clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      setPaymentIntentData({
        clientSecret: paymentData.clientSecret,
        donationId: paymentData.donationId,
        paymentIntentId: paymentData.paymentIntentId,
      });
      setShowPaymentForm(true);
    } catch (error) {
      toast({
        title: "Payment Setup Failed",
        description:
          error instanceof Error ? error.message : "Failed to set up payment",
        type: "error",
      });
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {toast.type === "error" && <AlertCircle className="h-4 w-4" />}
              <div>
                <p className="font-medium">{toast.title}</p>
                {toast.description && (
                  <p className="text-sm opacity-90">{toast.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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
                <Image
                  width={400}
                  height={400}
                  src={getCampaignImage(campaign.imageUrl)}
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
                        <span className="text-sm">{campaign.organization}</span>
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
                      {formatCurrency(campaign.currentAmount)}
                    </span>
                    <span className="text-muted-foreground">
                      of {formatCurrency(campaign.goalAmount)} goal
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 mb-4">
                    <div
                      className="h-3 rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${getProgressPercentage(campaign.currentAmount, campaign.goalAmount)}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Donors</span>
                      </div>
                      <span className="text-xl font-semibold">0</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">Funded</span>
                      </div>
                      <span className="text-xl font-semibold">
                        {Math.round(
                          getProgressPercentage(
                            campaign.currentAmount,
                            campaign.goalAmount
                          )
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
                <div className="prose prose-gray max-w-none">
                  <p>{campaign.description}</p>
                </div>
              </div>
            </div>

            {/* Donation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Donation Form */}
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Make a Donation</h3>

                  {!showPaymentForm ? (
                    <>
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

                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <Button
                            className="w-full"
                            size="lg"
                            disabled={
                              !donationAmount ||
                              !user ||
                              isCreatingPaymentIntent
                            }
                            onClick={handleDonateClick}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {isCreatingPaymentIntent
                              ? "Setting up payment..."
                              : `Continue to Payment ${donationAmount ? `($${donationAmount})` : ""}`}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {!user
                              ? "Please login first to donate"
                              : !donationAmount
                                ? "Please select or enter a donation amount"
                                : isAnonymous
                                  ? "Your donation will be anonymous"
                                  : "Your donation will be attributed to your name"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      {/* Payment Form with Stripe Elements */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold">Payment Details</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowPaymentForm(false);
                              setPaymentIntentData(null);
                            }}
                          >
                            ← Back
                          </Button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded mb-4">
                          <div className="flex justify-between">
                            <span>Donation Amount:</span>
                            <span className="font-semibold">
                              ${donationAmount}
                            </span>
                          </div>
                          {donationMessage && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Message: {donationMessage}
                            </div>
                          )}
                          {isAnonymous && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              Anonymous donation
                            </div>
                          )}
                        </div>
                      </div>

                      {paymentIntentData ? (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret: paymentIntentData.clientSecret,
                            appearance: {
                              theme: "stripe",
                            },
                          }}
                        >
                          <DonationForm
                            amount={parseFloat(donationAmount)}
                            campaignId={campaignId as Id<"campaigns">}
                            donorId={user?.id as Id<"users">}
                            message={donationMessage || undefined}
                            isAnonymous={isAnonymous}
                            paymentIntentData={paymentIntentData}
                            onSuccess={() => {
                              toast({
                                title: "Payment Processing",
                                description:
                                  "Your payment is being processed...",
                                type: "success",
                              });
                            }}
                            onError={(error: string) => {
                              toast({
                                title: "Payment Failed",
                                description: error,
                                type: "error",
                              });
                            }}
                          />
                        </Elements>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Setting up payment...</span>
                        </div>
                      )}
                    </>
                  )}

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
                    {recentDonations && recentDonations.length > 0 ? (
                      recentDonations.map((donation) => (
                        <div
                          key={donation._id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {donation.isAnonymous
                                ? "Anonymous"
                                : donation.donor?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(
                                donation.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(donation.amount)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <p className="text-sm">No donations yet</p>
                        <p className="text-xs">Be the first to donate!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
