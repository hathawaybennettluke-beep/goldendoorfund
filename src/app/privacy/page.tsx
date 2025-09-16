"use client";
import { Footer } from "@/components/Footer";
import { Lock, FileText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with matching background effect */}
      {/* Enhanced Privacy Hero Section with Animations */}
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
                  <Lock className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-4 animate-fade-up animate-duration-1000">
              Your Privacy, Our Promise
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up animate-delay-300 animate-duration-1000">
              Protecting your data with transparency and care
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Privacy Content Section */}
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
                <Lock className="h-4 w-4" />
                Secure & Protected
              </div>
            </div>

            {/* Introduction */}
            <div className="mb-8">
              <p className="text-muted-foreground leading-relaxed">
                Golden Door Fund (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) values your privacy and is committed to 
                protecting your personal information. This Privacy Policy explains how we collect, use, and 
                safeguard the information you provide when you use golendoorfund.org.
              </p>
            </div>

            {/* Privacy Policy Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">1</span>
                  Information We Collect
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">When you interact with our website, we may collect:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">
                      <span className="font-medium text-foreground">Personal Information:</span> such as your name, email address, mailing address, and payment details when you make a donation.
                    </li>
                    <li className="pl-2">
                      <span className="font-medium text-foreground">Non-Personal Information:</span> such as your browser type, device information, and usage data collected automatically through cookies or analytics tools.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 2 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">2</span>
                  How We Use Your Information
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">We use the information we collect to:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">Process and acknowledge your donations.</li>
                    <li className="pl-2">Communicate with you about your donations, campaigns, or updates.</li>
                    <li className="pl-2">Improve and secure our website.</li>
                    <li className="pl-2">Comply with legal and regulatory requirements.</li>
                  </ul>
                  <p className="mt-3 font-medium text-foreground">We will never sell or rent your personal information to third parties.</p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">3</span>
                  Payment Processing
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground">
                    All donations are processed securely through trusted third-party payment providers. We do
                    not store your full payment details (such as credit card numbers).
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">4</span>
                  Cookies and Tracking
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground">
                    Golendoorfund.org may use cookies and similar technologies to improve your browsing
                    experience and analyze site traffic. You may choose to disable cookies in your browser
                    settings, but some features of the site may not work properly.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">5</span>
                  Information Sharing
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">We may share your information only in the following cases:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">With service providers who help us operate our website and donation system.</li>
                    <li className="pl-2">To comply with legal obligations, court orders, or enforce our Terms of Service.</li>
                    <li className="pl-2">To protect the safety, rights, or property of Golden Door Fund, our donors, or others.</li>
                  </ul>
                </div>
              </div>

              {/* Section 6 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">6</span>
                  Data Security
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground">
                    We use reasonable technical and organizational safeguards to protect your personal
                    information from unauthorized access, use, or disclosure. However, no method of online
                    transmission or storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">7</span>
                  Your Rights
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">Depending on your location, you may have rights to:</p>
                  <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                    <li className="pl-2">Access the personal information we hold about you.</li>
                    <li className="pl-2">Request corrections or updates to your information.</li>
                    <li className="pl-2">Request deletion of your information, subject to legal and operational requirements.</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    To exercise these rights, please contact us at <a href="mailto:goldendoor@goldendoorfund.org" className="text-primary hover:underline">goldendoor@goldendoorfund.org</a>.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">8</span>
                  Children&apos;s Privacy
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground">
                    Our website is not directed to individuals under the age of 13, and we do not knowingly
                    collect personal information from children.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">9</span>
                  Changes to This Policy
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. Updates will be posted on this page
                    with a revised effective date.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div className="group">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">10</span>
                  Contact Us
                </h2>
                <div className="pl-10 border-l-2 border-muted/50 group-hover:border-primary/30 transition-colors duration-300">
                  <p className="mb-3 text-muted-foreground">
                    If you have any questions about this Privacy Policy or how your data is handled, please
                    contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-foreground font-medium">
                      <a href="mailto:goldendoor@goldendoorfund.org" className="text-primary hover:underline">goldendoor@goldendoorfund.org</a>
                    </p>
                    <p className="text-foreground font-medium">
                      <a href="https://golendoorfund.org" className="text-primary hover:underline">golendoorfund.org</a>
                    </p>
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