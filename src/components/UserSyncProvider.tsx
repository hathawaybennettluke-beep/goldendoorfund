"use client";

import { useUserSync } from "@/hooks/useUserSync";

/**
 * Component that automatically syncs users when they visit the app
 * This ensures any authenticated user gets added to our database
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  // This hook will automatically sync the user if they're authenticated
  useUserSync();

  return <>{children}</>;
}
