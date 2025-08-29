"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Custom hook that automatically syncs Clerk user data with Convex database
 * Call this hook in components where you need to ensure user is synced
 */
export function useUserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUserFromClerk);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    // Only run if Clerk has loaded and user is authenticated
    if (!isLoaded || !user) {
      return;
    }

    // If user is already in our database, no need to sync again
    if (currentUser) {
      return;
    }

    // Sync user data from Clerk to Convex
    const syncUserData = async () => {
      try {
        await syncUser({
          clerkUserId: user.id,
          name:
            user.fullName ||
            user.firstName ||
            user.emailAddresses[0]?.emailAddress.split("@")[0] ||
            "User",
          role: "user",
          email: user.emailAddresses[0]?.emailAddress || "",
          profileImage: user.imageUrl,
        });
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    syncUserData();
  }, [user, isLoaded, currentUser, syncUser]);

  return {
    user,
    isLoaded,
    currentUser,
    isUserSynced: !!currentUser,
  };
}
