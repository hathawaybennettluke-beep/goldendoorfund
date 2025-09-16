"use client";
import { Footer } from "@/components/Footer";
import { FileText, Lock } from "lucide-react";

export default function TermsPage() {
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
                  <FileText className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-4 animate-fade-up animate-duration-1000">
              Terms of Service
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up animate-delay-300 animate-duration-1000">
              Guidelines for using our platform
            </p>
          </div>
        </div>
      </section>

      {/* Terms of Service Content Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="container mx-auto max-w-4xl">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Effective Date */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Effective Date: September 15, 2025</span>
              </div>
            </div>

            {/* Introduction */}
            <div className="mb-8">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to goldendoorfund.org. By accessing or using our website, you agree to follow 
                these Terms of Service. Please read them carefully.
              </p>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">1</span>
                  Purpose of Our Website
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    Goldendoorfund.org is a platform that allows individuals and organizations to make 
                    donations to support immigrants facing immigration-related challenges in the United 
                    States. All donations are used solely for the charitable purposes described on our website.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">2</span>
                  Eligibility
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    By using this website, you confirm that you are at least 18 years old or have the consent of 
                    a parent or guardian.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">3</span>
                  Donations
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">
                      All donations made through our website are voluntary and non-refundable.
                    </li>
                    <li className="pl-2">
                      We do not guarantee tax-deductibility of your donation. Please consult your tax 
                      advisor to determine if your donation is eligible for deduction.
                    </li>
                    <li className="pl-2">
                      You are responsible for providing accurate information when making a donation.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">4</span>
                  Use of Website
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">You agree to use this website only for lawful purposes. You may not:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">
                      Misuse the site to harm others, spread harmful content, or commit fraud.
                    </li>
                    <li className="pl-2">
                      Attempt to disrupt or interfere with the security or functionality of the website.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">5</span>
                  Privacy
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    We respect your privacy. Personal information collected through this site will be handled in 
                    accordance with our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">6</span>
                  Intellectual Property
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    All content on this website, including text, graphics, and logos, is owned by Golden Door Fund 
                    or its partners and may not be copied or used without permission.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">7</span>
                  Limitation of Liability
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    We make every effort to keep our website secure and reliable, but we cannot guarantee 
                    uninterrupted service or error-free operation. Goldendoorfund.org is not liable for any 
                    damages or losses resulting from your use of this website.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">8</span>
                  Changes to These Terms
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    We may update these Terms of Service from time to time. Any changes will be posted on 
                    this page with a revised effective date.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">9</span>
                  Contact Us
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">goldendoor@goldendoorfund.org</p>
                    <p className="text-muted-foreground">goldendoorfund.org</p>
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