import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <svg width="160" height="96" viewBox="0 0 160 96" aria-hidden="true">
        <circle cx="48" cy="48" r="34" fill="#c2452d" />
        <circle cx="112" cy="48" r="34" fill="#1e6b66" />
      </svg>
      <p className="mt-6 text-sm font-bold tracking-widest text-muted uppercase">Error 404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">No overlap here</h1>
      <p className="mt-3 text-lg text-muted">This page does not exist, or the table you followed has closed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass("primary")}>Go home</Link>
        <Link href="/lobby" className={buttonClass("secondary")}>Find a table</Link>
      </div>
    </div>
  );
}
