"use client";
import { useAuth, useClerk, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SafeRedirect() {
  const { isLoaded, userId } = useAuth();
  const { signOut } = useClerk();
  
  useEffect(() => {
    if (isLoaded && userId) {
      // Split-brain: Client is authenticated but Server rejected the session.
      // Force a sign out to clear the stale/invalid client state.
      signOut();
    }
  }, [isLoaded, userId, signOut]);
  
  if (!isLoaded) return null;
  
  return <RedirectToSignIn />;
}
