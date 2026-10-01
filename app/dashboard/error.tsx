"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-400">Something went wrong!</h2>
        <p className="text-white/70">
          We encountered an error loading your dashboard. If you are experiencing authentication issues, it may be due to your computer's clock being incorrect (clock skew).
        </p>
        <p className="text-white/70 font-mono text-sm break-words bg-black/20 p-2 rounded">
          {error.message}
        </p>
        <button
          onClick={() => reset()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
