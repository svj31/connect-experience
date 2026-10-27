import type { ReactNode } from "react";
import { LogoMark } from "./brand/Logo";

export function AuthShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl items-start gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.1fr] md:py-20">
      <div className="hidden md:block">
        <LogoMark size={88} />
        <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">{title}</h1>
        <p className="mt-3 text-lg text-muted">{intro}</p>
      </div>
      <div className="animate-rise rounded-lg border border-line bg-surface p-6 sm:p-8">
        <h1 className="mb-6 font-display text-3xl font-semibold md:hidden">{title}</h1>
        {children}
      </div>
    </div>
  );
}
