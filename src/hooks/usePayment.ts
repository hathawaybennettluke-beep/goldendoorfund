import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Stripe, StripeElements } from "@stripe/stripe-js";

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useAction(api.payments.createPaymentIntent);

  const processDonation = async ({
    amount,
    campaignId,
    donorId,
    message,
    isAnonymous,
    elements,
    stripe,
  }: {
    amount: number;
    campaignId: Id<"campaigns">;
    donorId: Id<"users">;
    message?: string;
    isAnonymous: boolean;
    elements: StripeElements;
    stripe: Stripe;
  }) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const { clientSecret, donationId } = await createPaymentIntent({
        amount: amount,
        campaignId,
        donorClerkId: donorId,
        message,
        isAnonymous,
      });

      if (!clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // Submit the form data to Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || "Form validation failed");
      }

      // Confirm the payment with Elements
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/campaigns/${campaignId}?payment=success&donationId=${donationId}`,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed");
      }

      return { success: true, donationId };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processDonation,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
}
