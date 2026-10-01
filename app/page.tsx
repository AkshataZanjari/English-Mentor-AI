"use client";

import { useEffect } from "react";
import GrammarChecker from "@/components/GrammarChecker";

export default function Home() {
  useEffect(() => {
    fetch("/api/auth/sync-user", {
      method: "POST",
    }).catch(console.error);
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold text-center mb-8">English Mentor AI</h1>
      <GrammarChecker />
    </main>
  );
}
