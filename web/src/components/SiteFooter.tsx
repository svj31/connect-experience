"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./brand/Logo";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/room/")) return null;

  return (
    <footer className="mt-24 border-t border-line bg-paper-deep">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Meet over something you both enjoy. Built for AFFECIO HACKS &apos;26, Problem Statement 06.
          </p>
        </div>
        <nav aria-label="Product">
          <h2 className="text-sm font-bold text-ink">Product</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-muted hover:text-ink" href="/#how">How it works</Link></li>
            <li><Link className="text-muted hover:text-ink" href="/#activities">Activities</Link></li>
            <li><Link className="text-muted hover:text-ink" href="/safety">Safety</Link></li>
            <li><Link className="text-muted hover:text-ink" href="/contact">Contact</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h2 className="text-sm font-bold text-ink">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-muted hover:text-ink" href="/privacy">Privacy policy</Link></li>
            <li><Link className="text-muted hover:text-ink" href="/terms">Terms and conditions</Link></li>
            <li><Link className="text-muted hover:text-ink" href="/privacy#cookies">Cookie settings</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">&copy; {new Date().getFullYear()} Overlap. For people aged 18 and over.</p>
      </div>
    </footer>
  );
}
