import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl backdrop-blur-lg text-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}
