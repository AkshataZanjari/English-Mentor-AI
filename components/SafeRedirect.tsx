"use client";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";

export default function SafeRedirect() {
  const { isLoaded, userId } = useAuth();
  
  if (isLoaded && !userId) {
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
