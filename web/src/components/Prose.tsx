import type { ReactNode } from "react";

/** Readable long form layout for legal and help pages. */
export function Prose({ title, updated, intro, children }: { title: string; updated?: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <header className="border-b border-line pb-6">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
        {updated && <p className="mt-2 text-sm text-muted">Last updated {updated}</p>}
        {intro && <div className="mt-4 text-lg text-muted">{intro}</div>}
      </header>
      <div className="mt-8 space-y-4 leading-relaxed text-ink [&_a]:font-semibold [&_a]:text-teal [&_a]:underline [&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  );
}
