"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/ui/PageContainer";
import { Tabs } from "@/components/ui/Tabs";
import { RewriteTab } from "./components/RewriteTab";
import { ReplyTab } from "./components/ReplyTab";
import { RoleplayTab } from "./components/RoleplayTab";

export default function POSPage() {
  const [activeTab, setActiveTab] = useState("rewrite");

  const tabs = [
    { id: "rewrite", label: "Rewrite" },
    { id: "reply", label: "Smart Reply" },
    { id: "roleplay", label: "Role-play" },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
        title="Practice Studio" 
        description="Improve your English in real-world scenarios."
      />
      
      <div className="flex justify-center mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mt-4">
        <div role="tabpanel" id="panel-rewrite" aria-labelledby="tab-rewrite" className={activeTab === "rewrite" ? "block" : "hidden"}><RewriteTab /></div>
        <div role="tabpanel" id="panel-reply" aria-labelledby="tab-reply" className={activeTab === "reply" ? "block" : "hidden"}><ReplyTab /></div>
        <div role="tabpanel" id="panel-roleplay" aria-labelledby="tab-roleplay" className={activeTab === "roleplay" ? "block" : "hidden"}><RoleplayTab /></div>
      </div>
      </div>
    </PageContainer>
  );
}