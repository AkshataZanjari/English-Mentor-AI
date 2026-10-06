import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "neutral" | "primary";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variants = {
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    neutral: "bg-slate-800 text-slate-300 border border-slate-700",
    primary: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
