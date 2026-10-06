import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ className = "", error, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        className={`w-full p-3 rounded-lg bg-slate-950/50 border ${
          error ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-purple-500"
        } text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
