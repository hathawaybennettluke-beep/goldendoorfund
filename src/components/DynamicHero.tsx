"use client";

import { useCMSContent } from "@/hooks/useCMS";
import { Hero } from "@/components/Hero";

interface DynamicHeroProps {
  pageType: "home" | "about" | "contact";
  fallback?: {
    heading?: string;
    description?: string;
    buttons?: {
      primary: { text: string; url: string };
      secondary: { text: string; url: string };
    };
  };
}

export function DynamicHero({ pageType, fallback }: DynamicHeroProps) {
  const heroContent = useCMSContent(pageType, "hero");

  // Find the main hero content
  const mainHero = heroContent.find(
    (item) => item.contentType === "hero" && item.identifier.includes("main")
  );

  // Fallback to static content if no CMS content is found
  const heroProps = {
    heading: mainHero?.title || fallback?.heading || "Welcome",
    description:
      mainHero?.description ||
      fallback?.description ||
      "Welcome to our platform",
    buttons: {
      primary: {
        text:
          mainHero?.buttonText ||
          fallback?.buttons?.primary.text ||
          "Get Started",
        url: mainHero?.buttonUrl || fallback?.buttons?.primary.url || "/",
      },
      secondary: {
        text:
          mainHero?.secondaryButtonText ||
          fallback?.buttons?.secondary.text ||
          "Learn More",
        url:
          mainHero?.secondaryButtonUrl ||
          fallback?.buttons?.secondary.url ||
          "/about",
      },
    },
  };

  return <Hero {...heroProps} />;
}

// Example usage:
// <DynamicHero
//   pageType="home"
//   fallback={{
//     heading: "Transform Lives with Every Donation",
//     description: "Join a global community of changemakers.",
//     buttons: {
//       primary: { text: "Start Donating", url: "/campaigns" },
//       secondary: { text: "Learn More", url: "/about" }
//     }
//   }}
// />
