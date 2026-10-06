import React from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 text-center space-y-2">
      <h1 className="text-3xl font-bold tracking-tight text-slate-100">
        {title}
      </h1>
      <p className="text-slate-400 max-w-xl mx-auto">{description}</p>
    </div>
  );
}
