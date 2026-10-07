import React from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 text-center space-y-1 sm:space-y-2">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">{description}</p>
    </div>
  );
}
