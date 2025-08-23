import {
  Shield,
  CreditCard,
  Receipt,
  RefreshCw,
  Globe,
  Lock,
  Sparkles,
  CheckCircle,
  Zap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Bank-Level Security",
      description:
        "SSL encryption, PCI DSS compliance, and tokenization ensure your payment information is always protected.",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
    },
    {
      icon: <Receipt className="h-8 w-8" />,
      title: "Instant Tax Receipts",
      description:
        "Automatically generated tax-deductible receipts sent to your email immediately after donation.",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: "Recurring Donations",
      description:
        "Set up monthly, quarterly, or annual recurring donations to support causes you care about long-term.",
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multi-Currency Support",
      description:
        "Donate in your local currency with automatic conversion and transparent exchange rates.",
      color: "from-teal-500 to-teal-600",
      bgColor: "from-teal-50 to-teal-100",
      borderColor: "border-teal-200",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Anonymous Donations",
      description:
        "Choose to donate anonymously while still receiving receipts and tracking your impact privately.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200",
    },
  ];

  const paymentLogos = [
    {
      name: "Visa",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      color: "from-blue-600 to-blue-800",
    },
    {
      name: "Mastercard",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      color: "from-red-600 to-orange-600",
    },
    {
      name: "PayPal",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      color: "from-blue-600 to-blue-700",
    },
    {
      name: "Stripe",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      color: "from-purple-600 to-purple-800",
    },
    {
      name: "Apple Pay",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      color: "from-gray-800 to-gray-900",
    },
    {
      name: "Google Pay",
      src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      color: "from-blue-600 to-blue-700",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="mx-auto max-w-4xl text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent border border-accent/20 mb-6">
            <Zap className="h-4 w-4" />
            Payment & Security
          </div>
          
          <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            {heading}
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Icon Container */}
              <div className={`relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <h3 className="relative mb-4 text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="relative text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Payment Methods Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Accepted Payment Methods</h3>
            <p className="text-muted-foreground">Secure, fast, and convenient payment options</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {paymentLogos.map((logo, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${logo.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                
                <div className="relative flex flex-col items-center gap-3">
                  <div className="h-12 w-16 flex items-center justify-center">
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className="max-h-8 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {logo.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Compliance Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-6 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 p-6 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-green-700">PCI DSS Compliant</span>
            </div>
            
            <div className="h-8 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-blue-700">SSL Encrypted</span>
            </div>
            
            <div className="h-8 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-700">GDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary" />
            Trusted by 15,000+ donors worldwide
          </div>
        </div>
      </div>
    </section>
  );
};

export { PaymentFeatures };
