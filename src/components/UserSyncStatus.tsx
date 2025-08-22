"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Debug component to show user sync status
 * Only for development - remove in production
 */
export function UserSyncStatus() {
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);

  if (!isLoaded) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg text-sm">
        Loading user data...
      </div>
    );
  }

  if (!clerkUser) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">
        No user authenticated
      </div>
    );
  }

  const isSynced = !!convexUser;

  return (
    <div
      className={`fixed bottom-4 right-4 border px-4 py-2 rounded-lg text-sm ${
        isSynced
          ? "bg-green-100 border-green-300 text-green-800"
          : "bg-yellow-100 border-yellow-300 text-yellow-800"
      }`}
    >
      <div className="font-semibold">User Sync Status</div>
      <div>Clerk: {clerkUser.emailAddresses[0]?.emailAddress}</div>
      <div>Database: {isSynced ? "✅ Synced" : "⏳ Syncing..."}</div>
      {convexUser && (
        <div className="text-xs mt-1">DB ID: {convexUser._id}</div>
      )}
    </div>
  );
}
