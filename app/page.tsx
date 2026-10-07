"use client";

import GrammarChecker from "@/components/GrammarChecker";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/ui/PageContainer";

export default function Home() {
  return (
    <PageContainer>
      <PageHeader 
        title="Check Grammar"
        description="Instantly correct and improve your sentences."
      />
      <GrammarChecker />
    </PageContainer>
  );
}
