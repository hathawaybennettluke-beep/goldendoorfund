import { ArrowRight, Check, Sparkles, Heart, Users, Globe, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  items?: string[];
}

const defaultItems = [
  "Join 15,000+ donors worldwide",
  "98.5% of donations reach causes",
  "Real-time impact tracking",
  "Secure & transparent donations",
  "Tax-deductible receipts",
];

const Cta = ({
  title = "Ready to Make a Difference?",
  description = "Join thousands of donors who are already creating positive change in communities worldwide. Every donation, no matter the size, makes a real impact.",
  buttonText = "Start Donating Today",
  buttonUrl = "/campaigns",
  items = defaultItems,
}: CtaProps) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Main Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 right-20 h-24 w-24 rounded-full bg-secondary/10 blur-2xl" />
        <div className="absolute bottom-20 left-1/4 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Main CTA Card */}
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm p-12 lg:p-16 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_25%,rgba(0,0,0,0.02)_75%,transparent_75%)] bg-[size:30px_30px]" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
                  <Sparkles className="h-4 w-4" />
                  Join the Movement
                </div>
                
                <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
                  {title}
                </h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  {description}
                </p>
              </div>

              {/* Content Grid */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - CTA */}
                <div className="space-y-8">
                  {/* Impact Stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="text-3xl font-bold text-primary mb-2">15K+</div>
                      <div className="text-sm text-muted-foreground">Active Donors</div>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                      <div className="text-3xl font-bold text-secondary mb-2">$2.8M+</div>
                      <div className="text-sm text-muted-foreground">Total Raised</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center lg:text-left">
                    <Button 
                      asChild 
                      size="lg"
                      className="group px-10 py-8 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    >
                      <a href={buttonUrl} className="flex items-center gap-3">
                        <Heart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                        {buttonText}
                        <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                      </a>
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Trusted</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span>Global</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Benefits */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Why Choose Golden Door Foundation?
                  </h3>
                  
                  <ul className="space-y-4">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mt-1">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Additional CTA */}
                  <div className="pt-4">
                    <Button 
                      asChild 
                      variant="outline" 
                      size="lg"
                      className="w-full group border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary/30 transition-all duration-300"
                    >
                      <a href="/about" className="flex items-center justify-center gap-2">
                        <Users className="h-5 w-5" />
                        Learn More About Us
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Banner */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 rounded-2xl bg-gradient-to-r from-muted to-muted/80 border border-border/50 px-8 py-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-green-700">PCI DSS Compliant</span>
              </div>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Star className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-700">4.9/5 Rating</span>
              </div>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <Globe className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-purple-700">Global Impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Cta };
