import React from "react";
import { motion } from "framer-motion";

export interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex w-full sm:w-auto gap-1 sm:gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 sm:flex-none relative px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors outline-none whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              isActive ? "text-slate-100" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-slate-800 rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
