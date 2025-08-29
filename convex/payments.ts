import { v } from "convex/values";
import {
  mutation,
  query,
  action,
  internalMutation,
  internalAction,
  internalQuery,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import Stripe from "stripe";
import { internal } from "./_generated/api";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// Create a payment intent for a donation
export const createPaymentIntent = action({
  args: {
    amount: v.number(),
    campaignId: v.id("campaigns"),
    donorClerkId: v.string(),
    message: v.optional(v.string()),
    isAnonymous: v.boolean(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    clientSecret: string | null;
    donationId: Id<"donations">;
    paymentIntentId: string;
  }> => {
    const { amount, campaignId, donorClerkId, message, isAnonymous } = args;

    // Validate amount (minimum $1, maximum $10,000)
    if (amount * 100 < 100) {
      throw new Error("Minimum donation amount is $1.00");
    }
    if (amount * 100 > 1000000) {
      throw new Error("Maximum donation amount is $10,000.00");
    }

    // Get campaign details
    const campaign = await ctx.runQuery(internal.payments.getCampaign, {
      campaignId,
    });
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Get donor details
    const donor = await ctx.runQuery(internal.payments.getDonorByClerkId, {
      clerkId: donorClerkId,
    });

    if (!donor) {
      throw new Error("Donor not found");
    }

    // check if customer exists in stripe
    let customer = await stripe.customers
      .list({
        email: donor.email,
      })
      .then((res) => res.data[0]);

    if (!customer) {
      customer = await stripe.customers.create({
        email: donor.email,
      });
    }

    try {
      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Amount in cents
        currency: "usd",
        customer: customer.id,
        metadata: {
          campaignId: campaignId,
          donorId: donor._id,
          campaignTitle: campaign.title,
          donorEmail: donor.email,
          isAnonymous: isAnonymous.toString(),
          message: message || "",
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: donor.email,
      });

      // Create donation record in pending status
      const donationId = await ctx.runMutation(
        internal.payments.createDonation,
        {
          amount: amount,
          donorId: donor._id,
          campaignId: campaignId,
          message: message,
          isAnonymous: isAnonymous,
          stripePaymentIntentId: paymentIntent.id,
        }
      );

      return {
        clientSecret: paymentIntent.client_secret,
        donationId: donationId,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to create payment intent");
    }
  },
});

export const getCampaign = internalQuery({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.campaignId);
  },
});

// Internal query to get donor by Clerk ID
export const getDonorByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkId))
      .first();
  },
});

// Internal mutation to create donation
export const createDonation = internalMutation({
  args: {
    amount: v.number(),
    donorId: v.id("users"),
    campaignId: v.id("campaigns"),
    message: v.optional(v.string()),
    isAnonymous: v.boolean(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", {
      amount: args.amount,
      donorId: args.donorId,
      campaignId: args.campaignId,
      message: args.message,
      isAnonymous: args.isAnonymous,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Confirm payment and update donation status
export const confirmPayment = mutation({
  args: {
    paymentIntentId: v.string(),
    donationId: v.id("donations"),
  },
  handler: async (ctx, args) => {
    const { paymentIntentId, donationId } = args;

    try {
      // Retrieve payment intent from Stripe
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        // Update donation status to succeeded
        await ctx.db.patch(donationId, {
          status: "succeeded",
          updatedAt: Date.now(),
        });

        // Get donation details
        const donation = await ctx.db.get(donationId);
        if (!donation) {
          throw new Error("Donation not found");
        }

        // Update campaign current amount using internal mutation
        await ctx.scheduler.runAfter(
          0,
          internal.payments.updateCampaignAmount,
          {
            campaignId: donation.campaignId,
            amount: donation.amount,
          }
        );

        return { success: true, status: "succeeded" };
      } else if (paymentIntent.status === "canceled") {
        // Update donation status to canceled
        await ctx.db.patch(donationId, {
          status: "canceled",
          updatedAt: Date.now(),
        });
        return { success: false, status: "canceled" };
      } else if (paymentIntent.status === "requires_payment_method") {
        // Update donation status to failed
        await ctx.db.patch(donationId, {
          status: "failed",
          updatedAt: Date.now(),
        });
        return { success: false, status: "failed" };
      }

      return { success: false, status: paymentIntent.status };
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw new Error("Failed to confirm payment");
    }
  },
});

// Get donation by payment intent ID
export const getDonationByPaymentIntent = query({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (!donation) {
      return null;
    }

    // Get campaign and donor details
    const campaign = await ctx.db.get(donation.campaignId);
    const donor = await ctx.db.get(donation.donorId);

    return {
      ...donation,
      campaign,
      donor: donation.isAnonymous ? null : donor,
    };
  },
});

export const getReceiptUrl = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      args.paymentIntentId
    );

    console.log(paymentIntent.latest_charge);

    let latestCharge = null;
    if (paymentIntent.latest_charge) {
      latestCharge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
    }

    return latestCharge?.receipt_url;
  },
});

// Get recent donations for a campaign
export const getRecentDonations = query({
  args: {
    campaignId: v.id("campaigns"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .order("desc")
      .take(limit);

    // Get donor details for non-anonymous donations
    const donationsWithDonors = await Promise.all(
      donations.map(async (donation) => {
        const donor = donation.isAnonymous
          ? null
          : await ctx.db.get(donation.donorId);
        return {
          ...donation,
          donor,
        };
      })
    );

    return donationsWithDonors;
  },
});

// Get donation statistics for a campaign
export const getDonationStats = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .collect();

    const totalAmount = donations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );
    const totalDonors = new Set(donations.map((d) => d.donorId)).size;
    const anonymousDonations = donations.filter((d) => d.isAnonymous).length;
    const namedDonations = donations.filter((d) => !d.isAnonymous).length;

    return {
      totalAmount,
      totalDonors,
      anonymousDonations,
      namedDonations,
      totalDonations: donations.length,
    };
  },
});

// Get user's donation history
export const getUserDonations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_donor", (q) => q.eq("donorId", args.userId))
      .order("desc")
      .collect();

    // Get campaign details for each donation
    const donationsWithCampaigns = await Promise.all(
      donations.map(async (donation) => {
        const campaign = await ctx.db.get(donation.campaignId);
        return {
          ...donation,
          campaign,
        };
      })
    );

    return donationsWithCampaigns;
  },
});

// Get user's donation history by Clerk ID
export const getUserDonationsByClerkId = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("succeeded"),
        v.literal("failed"),
        v.literal("canceled")
      )
    ),
  },
  handler: async (ctx, args) => {
    // First get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const limit = args.limit || 50;
    let donationsQuery = ctx.db
      .query("donations")
      .withIndex("by_donor", (q) => q.eq("donorId", user._id))
      .order("desc");

    // Apply status filter if provided
    if (args.status) {
      donationsQuery = donationsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const donations = await donationsQuery.take(limit);

    // Get campaign details for each donation
    const donationsWithCampaigns = await Promise.all(
      donations.map(async (donation) => {
        const campaign = await ctx.db.get(donation.campaignId);
        return {
          ...donation,
          campaign,
        };
      })
    );

    return donationsWithCampaigns;
  },
});

// Get user donation statistics by Clerk ID
export const getUserDonationStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // First get the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_donor", (q) => q.eq("donorId", user._id))
      .collect();

    const succeededDonations = donations.filter(
      (d) => d.status === "succeeded"
    );
    const pendingDonations = donations.filter((d) => d.status === "pending");
    const failedDonations = donations.filter((d) => d.status === "failed");

    const totalDonated = succeededDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );
    const totalDonations = succeededDonations.length;

    // Count unique campaigns
    const uniqueCampaigns = new Set(
      succeededDonations.map((d) => d.campaignId)
    );
    const campaignsSupported = uniqueCampaigns.size;

    return {
      totalDonated,
      totalDonations,
      campaignsSupported,
      pendingDonations: pendingDonations.length,
      failedDonations: failedDonations.length,
    };
  },
});

// HTTP Action for Stripe webhook handling
// export const stripeWebhook = action({
//   args: {
//     body: v.string(),
//     signature: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

//     try {
//       // Verify webhook signature
//       const event = stripe.webhooks.constructEvent(
//         args.body,
//         args.signature,
//         webhookSecret
//       );

//       // Handle the event
//       switch (event.type) {
//         case "payment_intent.succeeded":
//         case "payment_intent.payment_failed":
//         case "payment_intent.canceled":
//           // Process the webhook event
//           await ctx.runMutation(internal.payments.handleStripeWebhook, {
//             event: event,
//           });
//           break;

//         default:
//           console.log(`Unhandled event type: ${event.type}`);
//       }

//       return { success: true };
//     } catch (error) {
//       console.error("Webhook error:", error);
//       throw new Error("Webhook handler failed");
//     }
//   },
// });

// Internal mutation to update campaign amount
export const updateCampaignAmount = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await ctx.db.patch(args.campaignId, {
      currentAmount: campaign.currentAmount + args.amount,
      updatedAt: Date.now(),
    });
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async ({ runMutation }, { signature, payload }) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    try {
      const event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        webhookSecret
      );

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await runMutation(internal.payments.handlePaymentSuccess, {
          paymentIntentId: paymentIntent.id,
        });
      } else if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await runMutation(internal.payments.handlePaymentFailure, {
          paymentIntentId: paymentIntent.id,
        });
      } else if (event.type === "payment_intent.canceled") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await runMutation(internal.payments.handlePaymentCanceled, {
          paymentIntentId: paymentIntent.id,
        });
      }

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});

export const handlePaymentSuccess = internalMutation({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (donation) {
      await ctx.db.patch(donation._id, {
        status: "succeeded",
        updatedAt: Date.now(),
      });

      await ctx.scheduler.runAfter(0, internal.payments.updateCampaignAmount, {
        campaignId: donation.campaignId,
        amount: donation.amount,
      });
    }
  },
});

export const handlePaymentFailure = internalMutation({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (donation) {
      await ctx.db.patch(donation._id, {
        status: "failed",
        updatedAt: Date.now(),
      });
    }
  },
});

export const handlePaymentCanceled = internalMutation({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (donation) {
      await ctx.db.patch(donation._id, {
        status: "canceled",
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal webhook handler for Stripe events
// export const handleStripeWebhook = internalMutation({
//   args: {
//     event: v.any(),
//   },
//   handler: async (ctx, args) => {
//     const event = args.event as Stripe.Event;

//     switch (event.type) {
//       case "payment_intent.succeeded":
//         const paymentIntent = event.data.object as Stripe.PaymentIntent;

//         // Find donation by payment intent ID
//         const donation = await ctx.db
//           .query("donations")
//           .withIndex("by_payment_intent", (q) =>
//             q.eq("stripePaymentIntentId", paymentIntent.id)
//           )
//           .first();

//         if (donation) {
//           // Update donation status
//           await ctx.db.patch(donation._id, {
//             status: "succeeded",
//             updatedAt: Date.now(),
//           });

//           // Update campaign current amount
//           await ctx.scheduler.runAfter(
//             0,
//             internal.payments.updateCampaignAmount,
//             {
//               campaignId: donation.campaignId,
//               amount: donation.amount,
//             }
//           );
//         }
//         break;

//       case "payment_intent.payment_failed":
//         const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;

//         const failedDonation = await ctx.db
//           .query("donations")
//           .withIndex("by_payment_intent", (q) =>
//             q.eq("stripePaymentIntentId", failedPaymentIntent.id)
//           )
//           .first();

//         if (failedDonation) {
//           await ctx.db.patch(failedDonation._id, {
//             status: "failed",
//             updatedAt: Date.now(),
//           });
//         }
//         break;

//       case "payment_intent.canceled":
//         const canceledPaymentIntent = event.data.object as Stripe.PaymentIntent;

//         const canceledDonation = await ctx.db
//           .query("donations")
//           .withIndex("by_payment_intent", (q) =>
//             q.eq("stripePaymentIntentId", canceledPaymentIntent.id)
//           )
//           .first();

//         if (canceledDonation) {
//           await ctx.db.patch(canceledDonation._id, {
//             status: "canceled",
//             updatedAt: Date.now(),
//           });
//         }
//         break;
//     }

//     return { success: true };
//   },
// });
