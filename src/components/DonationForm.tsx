import { useState } from "react";
import {
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface DonationFormProps {
  amount: number;
  campaignId: Id<"campaigns">;
  donorId: Id<"users">;
  message?: string;
  isAnonymous: boolean;
  paymentIntentData: {
    clientSecret: string;
    donationId: Id<"donations">;
    paymentIntentId: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function DonationForm({
  amount,
  campaignId,
  paymentIntentData,
  onSuccess,
  onError,
}: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe not loaded");
      return;
    }

    setIsProcessing(true);

    try {
      // Submit the form data to Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || "Form validation failed");
      }

      // Confirm the payment with the existing payment intent
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret: paymentIntentData.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/campaigns/${campaignId}?payment=success&donationId=${paymentIntentData.donationId}`,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed");
      }

      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        <Heart className="h-4 w-4 mr-2" />
        {isProcessing ? "Processing..." : `Donate $${amount}`}
      </Button>
    </form>
  );
}
