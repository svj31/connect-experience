import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex max-w-xl flex-1 flex-col items-center px-4 py-24 text-center">
      <div className="animate-float">
        <LogoMark size={180} live title="A SaathVerse orbit with nobody in it" />
      </div>
      <p className="mt-6 text-sm font-bold tracking-widest text-rose uppercase">Error 404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Lost in the verse</h1>
      <p className="mt-3 text-lg text-muted">This page drifted out of orbit. It may have moved, or the link was mistyped.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass("primary")}>Back to home</Link>
        <Link href="/app" className={buttonClass("secondary")}>Open the app</Link>
      </div>
    </main>
  );
}
