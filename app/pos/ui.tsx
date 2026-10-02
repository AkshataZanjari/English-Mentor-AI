import React from "react";

export function SectionShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a6f63] dark:text-slate-300">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[#5f554b] dark:text-slate-300">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-black/8 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SubtleChip({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] rounded-full border px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-slate-100 dark:text-slate-950"
          : "border-black/10 bg-white/70 text-[#3b3128] hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

export function ResultPanel({
  title,
  content,
  onCopy,
  isCopied,
  empty,
  children,
}: {
  title: string;
  content?: string;
  onCopy?: () => void;
  isCopied?: boolean;
  empty: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
        {content ? (
          <button
            onClick={onCopy}
            className="min-h-[44px] rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
          >
            {isCopied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>

      <div className="mt-4 rounded-[24px] border border-black/8 bg-slate-950/[0.02] p-4 dark:border-white/10 dark:bg-black/20">
        {content ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-900 dark:text-slate-100">
            {content}
          </p>
        ) : (
          <p className="text-sm leading-7 text-[#73685c] dark:text-slate-300">{empty}</p>
        )}
      </div>

      {children}
    </Card>
  );
}
