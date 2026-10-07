"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { shouldSyncUser } from "@/lib/auth/sync";

export function UserSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);
  const syncAttempts = useRef(0);
  const lastAttemptedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (shouldSyncUser(isLoaded, isSignedIn ?? false, userId, syncedUserId)) {
      if (lastAttemptedUserId.current !== userId) {
        lastAttemptedUserId.current = userId || null;
        syncAttempts.current = 0;
      }

      if (syncAttempts.current >= 3) {
        return; // Avoid infinite retry loops
      }

      syncAttempts.current += 1;

      fetch("/api/auth/sync-user", { method: "POST" })
        .then((res) => {
          if (res.ok) {
            setSyncedUserId(userId || null);
          } else {
            console.error("Failed to sync user: status", res.status);
          }
        })
        .catch((err) =>
          console.error("Failed to sync user:", err)
        );
    }
  }, [isLoaded, isSignedIn, userId, syncedUserId]);

  return null;
}
