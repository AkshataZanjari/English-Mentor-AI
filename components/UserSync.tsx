"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { shouldSyncUser } from "@/lib/auth/sync";

export function UserSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (shouldSyncUser(isLoaded, isSignedIn ?? false, userId, hasSynced.current)) {
      hasSynced.current = true;
      fetch("/api/auth/sync-user", { method: "POST" }).catch((err) =>
        console.error("Failed to sync user:", err)
      );
    }
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
