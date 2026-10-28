"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Logo } from "../brand/Logo";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SignInMenu } from "./SignInMenu";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Vibe Match" },
  { href: "/#activities", label: "Together" },
  { href: "/#bond", label: "Bonds" },
  { href: "/#safety", label: "Safety" },
];

export function SiteHeader() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Over the dark landing hero the header starts transparent with light text.
  const overHero = usePathname() === "/" && !scrolled && !open;
  const home = user ? (user.role === "admin" ? "/admin" : "/app") : null;

  return (
    <header className={`sticky top-0 z-40 transition-all ${overHero ? "dark-hero bg-transparent text-white" : "glass border-b border-line"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo size={34} className={overHero ? "[&_span.text-ink]:text-white" : ""} />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${overHero ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-paper-deep hover:text-ink"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {home ? (
            <ButtonLink href={home} size="sm">
              {user?.role === "admin" ? "Admin console" : "Open SaathVerse"} <Icon name="arrowRight" size={16} />
            </ButtonLink>
          ) : (
            <>
              <div className="hidden sm:block"><SignInMenu /></div>
              <span className="hidden sm:block"><ButtonLink href="/signup" size="sm">Join free</ButtonLink></span>
            </>
          )}
          <button className="flex h-10 w-10 items-center justify-center rounded-full lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? "close" : "menu"} label={open ? "Close menu" : "Open menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="animate-rise border-t border-line bg-surface px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-bold hover:bg-paper-deep">
              {n.label}
            </Link>
          ))}
          {!user && (
            <div className="mt-2 grid gap-2 border-t border-line pt-3">
              <ButtonLink href="/signup">Join free</ButtonLink>
              <ButtonLink href="/login" variant="secondary">Member sign in</ButtonLink>
              <ButtonLink href="/login?as=admin" variant="ghost">Admin sign in</ButtonLink>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
