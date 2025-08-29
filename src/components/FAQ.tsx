"use client";

import { useCMSContent } from "@/hooks/useCMS";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageSquare, HelpCircle } from "lucide-react";

interface FAQProps {
  pageType?: "home" | "about" | "contact";
  className?: string;
}

export function FAQ({ pageType = "home", className = "" }: FAQProps) {
  const faqContent = useCMSContent(pageType, "faq");

  // Find title content
  const titleContent = faqContent.find(
    (item) => item.contentType === "text" && item.identifier.includes("title")
  );

  // Get FAQ items (cards with questions and answers)
  const faqItems = faqContent
    .filter((item) => item.contentType === "card" && item.title && item.content)
    .sort((a, b) => a.order - b.order);

  if (faqItems.length === 0 && !titleContent) {
    return null;
  }

  return (
    <section
      className={`py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 ${className}`}
    >
      <div className="container max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium text-primary border border-primary/20 mb-6">
            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            {titleContent?.subtitle || "FAQ"}
          </div>

          <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent leading-tight">
            {titleContent?.title || "Frequently Asked Questions"}
          </h2>

          {titleContent?.description && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {titleContent.description}
            </p>
          )}
        </div>

        {/* FAQ Accordion */}
        {faqItems.length > 0 && (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((faq) => (
              <AccordionItem
                key={faq._id}
                value={faq.identifier}
                className="border border-border/50 rounded-lg px-6 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="text-left py-6 hover:no-underline">
                  <div className="flex items-start gap-3 pr-4">
                    <MessageSquare className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="font-semibold text-base sm:text-lg">
                      {faq.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <div className="ml-8 text-muted-foreground leading-relaxed">
                    {faq.content && (
                      <div dangerouslySetInnerHTML={{ __html: faq.content }} />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Contact Support */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg mb-1">
                Still have questions?
              </h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here to help you make a difference.
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
            >
              <MessageSquare className="h-4 w-4" />
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
