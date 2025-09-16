"use client";
import { Footer } from "@/components/Footer";
import { Cookie, FileText } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Enhanced Hero Section with Animations */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16 py-16 sm:py-20 lg:py-24">
        {/* Background Elements - Enhanced version */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
          
          {/* Enhanced Animated Floating Elements */}
          <div className="absolute top-20 left-10 h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 h-12 w-12 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-secondary/30 to-secondary/5 blur-2xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/4 h-10 w-10 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-accent/30 to-accent/5 blur-2xl animate-pulse delay-2000" />
          <div className="absolute bottom-40 right-1/4 h-14 w-14 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 blur-2xl animate-pulse delay-3000" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-primary/10" />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-6 animate-fade-down animate-duration-700">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-md animate-pulse animate-duration-3000"></div>
                <div className="relative bg-background/80 backdrop-blur-sm rounded-full p-3 hover:scale-110 transition-transform duration-300">
                  <Cookie className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-4 animate-fade-up animate-duration-1000">
              Cookie Policy
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up animate-delay-300 animate-duration-1000">
              How we use cookies to improve your experience
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20" />
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-secondary/5 blur-2xl" />
        </div>

        <div className="container mx-auto max-w-4xl">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Effective Date */}
            <div className="mb-8 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
                <FileText className="h-4 w-4" />
                Effective Date: September 15, 2025
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary border border-secondary/20">
                <Cookie className="h-4 w-4" />
                Cookie Settings
              </div>
            </div>

            {/* Introduction */}
            <div className="mb-8">
              <p className="text-muted-foreground leading-relaxed">
                Golden Door Fund ("we," "our," or "us") uses cookies and similar technologies on 
                golendoorfund.org to improve your experience, analyze website traffic, and support the 
                functionality of our services. This Cookie Policy explains what cookies are, how we use 
                them, and how you can manage your preferences.
              </p>
            </div>

            {/* Cookie Policy Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">1</span>
                  What Are Cookies?
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies are small text files placed on your device (computer, tablet, or smartphone) when 
                    you visit a website. They help websites recognize your device and store certain information 
                    about your preferences or actions.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">2</span>
                  Types of Cookies We Use
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">We use the following types of cookies:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">
                      <span className="font-medium text-foreground">Essential Cookies:</span> Required for the website to function properly, such as enabling 
                      secure payment processing or remembering your donation form entries.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium text-foreground">Performance & Analytics Cookies:</span> Help us understand how visitors use our 
                      website so we can improve functionality and user experience.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium text-foreground">Functional Cookies:</span> Allow us to remember your preferences (like language or 
                      region settings).
                    </li>
                    <li className="pl-2">
                      <span className="font-medium text-foreground">Third-Party Cookies:</span> May be set by trusted third-party services (such as payment 
                      processors or analytics providers) to help us operate the website securely and 
                      efficiently.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">3</span>
                  Why We Use Cookies
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">We use cookies to:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">Ensure the website works as intended.</li>
                    <li className="pl-2">Process donations securely.</li>
                    <li className="pl-2">Analyze traffic and improve site performance.</li>
                    <li className="pl-2">Provide a more personalized user experience.</li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">4</span>
                  Managing Cookies
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">Most web browsers allow you to control cookies through your settings. You can:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">Accept or decline cookies.</li>
                    <li className="pl-2">Delete cookies already stored on your device.</li>
                    <li className="pl-2">Set preferences to block cookies from certain websites.</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground font-medium">
                    Please note: disabling cookies may affect the functionality of golendoorfund.org, 
                    including the ability to complete donations.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">5</span>
                  Updates to This Policy
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Cookie Policy from time to time. Any changes will be posted on this 
                    page with a revised effective date.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">6</span>
                  Contact Us
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about our use of cookies, please contact us at:
                  </p>
                  <div className="space-y-1 mt-2">
                    <p className="text-muted-foreground">goldendoor@goldendoorfund.org</p>
                    <p className="text-muted-foreground">golendoorfund.org</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}