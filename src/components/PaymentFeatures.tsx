import {
  Shield,
  CreditCard,
  Receipt,
  RefreshCw,
  Globe,
  Lock,
} from "lucide-react";

interface PaymentFeaturesProps {
  heading?: string;
  description?: string;
}

const PaymentFeatures = ({
  heading = "Secure & Flexible Payment Options",
  description = "We support multiple payment methods and currencies to make donating easy and accessible for everyone, anywhere in the world.",
}: PaymentFeaturesProps) => {
  const features = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Multiple Payment Methods",
      description:
        "Credit cards, debit cards, PayPal, bank transfers, and digital wallets - choose what works best for you.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Bank-Level Security",
      description:
        "SSL encryption, PCI DSS compliance, and tokenization ensure your payment information is always protected.",
    },
    {
      icon: <Receipt className="h-8 w-8" />,
      title: "Instant Tax Receipts",
      description:
        "Automatically generated tax-deductible receipts sent to your email immediately after donation.",
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: "Recurring Donations",
      description:
        "Set up monthly, quarterly, or annual recurring donations to support causes you care about long-term.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multi-Currency Support",
      description:
        "Donate in your local currency with automatic conversion and transparent exchange rates.",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Anonymous Donations",
      description:
        "Choose to donate anonymously while still receiving receipts and tracking your impact privately.",
    },
  ];

  const paymentLogos = [
    {
      name: "Visa",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    },
    {
      name: "Mastercard",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    },
    {
      name: "PayPal",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    },
    {
      name: "Stripe",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    },
    {
      name: "Apple Pay",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    },
    {
      name: "Google Pay",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16">
          <h3 className="mb-8 text-center text-xl font-semibold">
            Accepted Payment Methods
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            {paymentLogos.map((logo, index) => (
              <div
                key={index}
                className="flex h-12 w-16 items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-h-8 max-w-full object-contain filter grayscale transition-all hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 rounded-lg bg-muted p-4">
            <Shield className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">
              PCI DSS Compliant • SSL Encrypted • GDPR Compliant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export { PaymentFeatures };
