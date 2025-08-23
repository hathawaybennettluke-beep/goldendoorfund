import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaDiscord } from "react-icons/fa";
import { Heart, Globe, Shield, Mail, Phone, MapPin, ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Campaigns",
    links: [
      { name: "Active Campaigns", href: "/campaigns" },
      { name: "Emergency Relief", href: "/campaigns?urgency=high" },
      { name: "Education", href: "/campaigns?category=Education" },
      { name: "Healthcare", href: "/campaigns?category=Healthcare" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Payment Security", href: "/security" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "Our Mission", href: "/about" },
      { name: "Impact Stories", href: "/impact" },
      { name: "Transparency", href: "/transparency" },
      { name: "Careers", href: "/careers" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-4" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-4" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-4" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-4" />, href: "#", label: "LinkedIn" },
  { icon: <FaYoutube className="size-4" />, href: "#", label: "YouTube" },
];

const defaultLegalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/cookies" },
];

const Footer = ({
  logo = {
    url: "/",
    src: "/logo.png",
    alt: "Golden Door Foundation",
    title: "Golden Door Foundation",
  },
  sections = defaultSections,
  description = "Empowering communities worldwide through transparent, impactful donations.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2024 Golden Door Foundation. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: FooterProps) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-muted/50 border-t border-border/50">
      {/* Enhanced Beautiful Background */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8" />
        
        {/* Multiple floating elements for depth */}
        <div className="absolute top-8 left-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-2xl" />
        <div className="absolute top-16 right-16 h-20 w-20 rounded-full bg-gradient-to-br from-secondary/15 to-secondary/5 blur-xl" />
        <div className="absolute bottom-12 left-1/4 h-16 w-16 rounded-full bg-gradient-to-br from-accent/15 to-accent/5 blur-lg" />
        <div className="absolute bottom-8 right-1/3 h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-md" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Diagonal accent lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(0,0,0,0.02)_50%,transparent_52%)] bg-[size:100px_100px]" />
      </div>

      <div className="relative z-10 px-6">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center">
                <a href={logo.url} className="group">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-32 w-auto group-hover:scale-105 transition-transform duration-300"
                  />
                </a>
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
                {description}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>hello@goldendoor.org</span>
                </div>
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/30 pb-1">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a 
                        href={link.href}
                        className="text-base text-muted-foreground hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block transition-transform duration-300"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-border/50">
          <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-8 shadow-lg">
              {/* Enhanced background pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_25%,rgba(0,0,0,0.02)_75%,transparent_75%)] bg-[size:20px_20px]" />
              
              {/* Additional decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-xl" />
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-base font-medium text-primary border border-primary/20 mb-4">
                  <Sparkles className="h-5 w-5" />
                  Stay Updated
                </div>
                
                <h3 className="text-3xl font-bold mb-3 text-foreground">
                  Get Impact Updates & Stories
                </h3>
                
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Subscribe for campaign progress and impact stories.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 text-foreground placeholder-muted-foreground text-lg"
                  />
                  <Button 
                    size="sm"
                    className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <span>{copyright}</span>
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <span>for impact</span>
              </div>
            </div>
            
            {/* Legal Links */}
            <ul className="flex items-center gap-4 text-base text-muted-foreground">
              {legalLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="hover:text-primary transition-colors duration-300 hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="pb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                aria-label={social.label}
                className="group p-3 rounded-lg bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110 border border-border/50 hover:border-primary/30"
              >
                <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  {social.icon}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group border border-primary/20"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform duration-300" />
      </button>
    </footer>
  );
};

export { Footer };
