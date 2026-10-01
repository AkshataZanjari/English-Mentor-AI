"use client";
import { useAuth, useClerk, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SafeRedirect() {
  const { isLoaded, userId } = useAuth();
  const { signOut } = useClerk();
  const [isSignOutForced, setIsSignOutForced] = useState(false);
  
  useEffect(() => {
    if (isLoaded && userId) {
      // Split-brain: Client is authenticated but Server rejected the session.
      // Force a sign out to clear the stale/invalid client state.
      signOut().then(() => {
        setIsSignOutForced(true);
      });
    }
  }, [isLoaded, userId, signOut]);
  
  if ((isLoaded && !userId) || isSignOutForced) {
    return <RedirectToSignIn />;
  }
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-2xl font-bold text-white">Checking Authentication...</h2>
        <p className="text-white/70">
          Please wait while we verify your session.
        </p>
      </div>
    </main>
  );
}
