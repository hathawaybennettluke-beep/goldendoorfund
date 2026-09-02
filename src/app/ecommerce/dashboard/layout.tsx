"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { StoreProvider, useStore } from "@/components/ecommerce/StoreProvider";
import { DashboardShell } from "@/components/ecommerce/DashboardShell";

function Gate({ children }: { children: React.ReactNode }) {
  const { stores, store, isLoading } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const onOnboarding = pathname.startsWith("/ecommerce/dashboard/onboarding");

  useEffect(() => {
    if (!isLoading && stores && stores.length === 0 && !onOnboarding) {
      router.replace("/ecommerce/dashboard/onboarding");
    }
  }, [isLoading, stores, onOnboarding, router]);

  if (onOnboarding) return <>{children}</>;

  if (isLoading || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your workspace…
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}

export default function EcommerceDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Gate>{children}</Gate>
    </StoreProvider>
  );
}
