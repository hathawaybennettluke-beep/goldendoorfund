import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Mail, Phone, Sparkles } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  heading: string;
  description: string;
  items?: FaqItem[];
  supportHeading: string;
  supportDescription: string;
  supportButtonText: string;
  supportButtonUrl: string;
}

const faqItems = [
  {
    id: "faq-1",
    question: "How do I know my donation is being used effectively?",
    answer:
      "We provide complete transparency through detailed impact reports, regular updates, and real-time tracking of your donations. Every campaign includes progress updates, photos, and stories from the communities you're helping. You can also access our annual impact report showing exactly how funds were allocated and the results achieved.",
    category: "Transparency",
  },
  {
    id: "faq-2",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely with bank-level encryption and PCI DSS compliance. You can also set up recurring monthly donations for ongoing support.",
    category: "Payments",
  },
  {
    id: "faq-3",
    question: "Can I donate anonymously?",
    answer:
      "Yes, you can choose to donate anonymously while still receiving tax receipts and impact updates. Your privacy is important to us, and we never share your personal information without your explicit consent. Anonymous donors still contribute to our impact statistics and receive the same level of service.",
    category: "Privacy",
  },
  {
    id: "faq-4",
    question: "How much of my donation goes to the actual cause?",
    answer:
      "98.5% of your donation goes directly to the cause you choose. We keep our administrative costs low (only 1.5%) through efficient operations and technology. This includes payment processing fees, platform maintenance, and customer support. We're committed to maximizing the impact of every dollar donated.",
    category: "Transparency",
  },
  {
    id: "faq-5",
    question: "Can I cancel or modify a recurring donation?",
    answer:
      "Absolutely! You can easily manage your recurring donations through your account dashboard. Modify the amount, change the frequency, pause donations temporarily, or cancel at any time. Changes take effect immediately, and you'll receive email confirmation of any modifications.",
    category: "Account Management",
  },
  {
    id: "faq-6",
    question: "Do you provide tax receipts?",
    answer:
      "Yes, we automatically generate and email tax-deductible receipts for all donations immediately after processing. Receipts include all necessary information for tax purposes. You can also access your complete donation history and download receipts anytime through your account dashboard.",
    category: "Taxes",
  },
  {
    id: "faq-7",
    question: "How do you select and verify campaigns?",
    answer:
      "All campaigns undergo rigorous vetting including background checks, financial audits, and impact assessments. We work with established NGOs, local organizations, and community leaders. Each campaign must demonstrate clear goals, measurable outcomes, and sustainable long-term impact before being approved.",
    category: "Campaign Selection",
  },
];

const FAQ = ({
  heading = "Frequently asked questions",
  description = "Find answers to common questions about donating and making a difference. Can't find what you're looking for? Our support team is here to help.",
  items = faqItems,
  supportHeading = "Still have questions?",
  supportDescription = "Our dedicated support team is here to help you with any questions or concerns about donating and making an impact.",
  supportButtonText = "Contact Support",
  supportButtonUrl = "/contact",
}: FAQProps) => {
  return (
    <section className="py-24 px-10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-secondary/10 blur-2xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="mx-auto max-w-4xl text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
            <HelpCircle className="h-4 w-4" />
            Common Questions
          </div>
          
          <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            {heading}
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-4xl mb-20">
          <Accordion
            type="single"
            collapsible
            className="space-y-4"
          >
            {items.map((item) => (
              <AccordionItem 
                key={item.id} 
                value={item.id}
                className="group overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <AccordionTrigger className="px-6 py-6 hover:no-underline [&[data-state=open]>svg]:rotate-180 transition-all duration-300">
                  <div className="flex items-start gap-4 text-left">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mt-1 group-hover:bg-primary/20 transition-colors duration-300">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                        {item.question}
                      </div>
                      {item.category && (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {item.category}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-6 pb-6">
                  <div className="ml-12">
                    <div className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Support Section */}
        <div className="mx-auto max-w-4xl text-center">
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-12 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_25%,rgba(0,0,0,0.02)_75%,transparent_75%)] bg-[size:20px_20px]" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20 mb-6">
                <MessageCircle className="h-4 w-4" />
                Need Help?
              </div>
              
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                {supportHeading}
              </h3>
              
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {supportDescription}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  asChild 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <a href={supportButtonUrl} className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {supportButtonText}
                  </a>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary/30 transition-all duration-300"
                >
                  <a href="/contact" className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Call Support
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            We're here to help you make the biggest possible impact
          </div>
        </div>
      </div>
    </section>
  );
};

export { FAQ };
