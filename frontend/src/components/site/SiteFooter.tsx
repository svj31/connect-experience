import Link from "next/link";
import { SITE } from "@/lib/site";
import { LogoMark, Wordmark } from "../brand/Logo";

const COLS = [
  { title: "Product", links: [["How it works", "/#how"], ["Activities", "/#activities"], ["Bond levels", "/#bond"], ["Join free", "/signup"]] },
  { title: "Sign in", links: [["Member sign in", "/login"], ["Admin sign in", "/login?as=admin"], ["Create an account", "/signup"], ["Admin with invite", "/signup?as=admin"]] },
  { title: "Trust", links: [["Safety centre", "/safety"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Contact", "/contact"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface/70 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark size={48} title="" />
            <Wordmark />
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE.tagline} Meet by doing things together, and let your profile open up as your bond grows.</p>
          <p className="mt-4 text-sm text-muted">18+ only. Built for AFFECIO HACKS 2026.</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-bold text-ink">{c.title}</h2>
            <ul className="mt-3 space-y-2">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted hover:text-violet">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">SaathVerse {new Date().getFullYear()}. Two worlds. One connection.</p>
    </footer>
  );
}
