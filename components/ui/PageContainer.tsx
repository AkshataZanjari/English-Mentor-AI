import { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
      {children}
    </div>
  );
}
