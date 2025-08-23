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

  const paymentMethods = [
    {
      name: "Visa",
      icon: (
        <img 
          src="/visa.png" 
          alt="Visa" 
          className="w-40 h-24 object-contain"
        />
      ),
      color: "from-blue-600 to-blue-800",
      description: "Credit & Debit Cards",
    },
    {
      name: "Mastercard",
      icon: (
        <img 
          src="/mastercard.png" 
          alt="Mastercard" 
          className="w-40 h-24 object-contain"
        />
      ),
      color: "from-red-600 to-orange-600",
      description: "Credit & Debit Cards",
    },
    {
      name: "PayPal",
      icon: (
        <img 
          src="/paypal.png" 
          alt="PayPal" 
          className="w-40 h-24 object-contain"
        />
      ),
      color: "from-blue-600 to-blue-700",
      description: "Digital Wallet",
    },
    {
      name: "Stripe",
      icon: (
        <img 
          src="/stripe.png" 
          alt="Stripe" 
          className="w-40 h-24 object-contain"
        />
      ),
      color: "from-purple-600 to-purple-800",
      description: "Payment Processing",
    },
    {
      name: "Apple Pay",
      icon: (
        <img 
          src="/applepay.png" 
          alt="Apple Pay" 
          className="w-40 h-24 object-contain"
        />
      ),
      color: "from-gray-800 to-gray-900",
      description: "Mobile Payment",
    },
    {
      name: "Google Pay",
      icon: (
        <img 
          src="/googlepay.png" 
          alt="Google Pay" 
          className="w-40 h-24 object-contain"
        />
      ),
      color: "from-blue-600 to-blue-700",
      description: "Mobile Payment",
    },
  ];

  return (
    <section className="py-24 px-10 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
        
        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 h-16 w-16 rounded-full bg-primary/10 blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-20 h-12 w-12 rounded-full bg-secondary/10 blur-lg animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10">
        {/* Enhanced Header Section */}
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

        {/* Enhanced Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-primary/30"
            >
              {/* Enhanced Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Enhanced Icon Container */}
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

              {/* Enhanced Hover Effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Enhanced Payment Methods Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-4">
              <CreditCard className="h-4 w-4" />
              Payment Options
            </div>
            <h3 className="text-3xl font-bold mb-4">Accepted Payment Methods</h3>
            <p className="text-lg text-muted-foreground">Secure, fast, and convenient payment options for everyone</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="group relative p-12 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-primary/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                
                <div className="relative flex flex-col items-center gap-10 text-center">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {method.icon}
                  </div>
                  <div>
                    <span className="block text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {method.name}
                    </span>
                    <span className="block text-base text-muted-foreground mt-3">
                      {method.description}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Security & Compliance Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-8 rounded-3xl bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border border-green-200/50 p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-green-200 shadow-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <span className="block text-base font-bold text-green-700">PCI DSS Compliant</span>
                <span className="block text-xs text-green-600">Bank-level security</span>
              </div>
            </div>
            
            <div className="h-12 w-px bg-gradient-to-b from-green-200 to-blue-200" />
            
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-lg">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <span className="block text-base font-bold text-blue-700">SSL Encrypted</span>
                <span className="block text-xs text-blue-600">256-bit encryption</span>
              </div>
            </div>
            
            <div className="h-12 w-px bg-gradient-to-b from-blue-200 to-purple-200" />
            
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-purple-200 shadow-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <span className="block text-base font-bold text-purple-700">GDPR Compliant</span>
                <span className="block text-xs text-purple-600">Privacy protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Trust Indicators */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-8 py-4 text-base font-medium text-foreground border border-primary/20 shadow-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span>Trusted by <span className="font-bold text-primary">15,000+</span> donors worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export { PaymentFeatures };
