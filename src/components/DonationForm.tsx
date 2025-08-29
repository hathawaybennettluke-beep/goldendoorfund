import {
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { usePayment } from "@/hooks/usePayment";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface DonationFormProps {
  amount: number;
  campaignId: Id<"campaigns">;
  donorId: Id<"users">;
  message?: string;
  isAnonymous: boolean;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function DonationForm({
  amount,
  campaignId,
  donorId,
  message,
  isAnonymous,
  onSuccess,
  onError,
}: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { processDonation, isProcessing } = usePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError("Stripe not loaded");
      return;
    }

    try {
      const result = await processDonation({
        amount,
        campaignId,
        donorId,
        message,
        isAnonymous,
        elements,
        stripe,
      });

      if (result.success) {
        onSuccess();
      } else {
        onError(result.error || "Payment failed");
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Payment failed");
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
