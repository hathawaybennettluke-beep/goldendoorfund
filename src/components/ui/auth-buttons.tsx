"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/ui/user-button";

interface AuthButtonsProps {
  loginUrl?: string;
  signupUrl?: string;
  loginText?: string;
  signupText?: string;
  isMobile?: boolean;
}

export function AuthButtons({
  loginUrl = "/sign-in",
  signupUrl = "/sign-up",
  loginText = "Sign In",
  signupText = "Get Started",
  isMobile = false,
}: AuthButtonsProps) {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex gap-2">
        <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  // Show user button if authenticated
  if (isSignedIn) {
    return <UserButton />;
  }

  // Show sign in/get started buttons if not authenticated
  return (
    <div className={`flex gap-2 ${isMobile ? "flex-col" : ""}`}>
      <Button asChild variant="outline" size={isMobile ? "default" : "default"}>
        <a href={loginUrl}>{loginText}</a>
      </Button>
      <Button asChild size={isMobile ? "default" : "default"}>
        <a href={signupUrl}>{signupText}</a>
      </Button>
    </div>
  );
}
