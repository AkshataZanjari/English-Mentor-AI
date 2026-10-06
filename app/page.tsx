"use client";

import { useEffect } from "react";
import GrammarChecker from "@/components/GrammarChecker";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Home() {
  useEffect(() => {
    fetch("/api/auth/sync-user", {
      method: "POST",
    }).catch(console.error);
  }, []);

  return (
    <>
      <PageHeader 
        title="Check Grammar"
        description="Instantly correct and improve your sentences."
      />
      <GrammarChecker />
    </>
  );
}
