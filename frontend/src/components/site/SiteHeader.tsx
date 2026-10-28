"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Logo } from "../brand/Logo";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SignInMenu } from "./SignInMenu";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/#problem", label: "Why" },
  { href: "/#how", label: "How it works" },
  { href: "/#activities", label: "Activities" },
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
  const home = user ? (user.role === "admin" ? "/admin" : "/app") : null;

  return (
    <header className={`sticky top-0 z-40 transition-all ${scrolled ? "border-b border-line bg-paper/85 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-violet-soft hover:text-violet">
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
              <ButtonLink href="/signup" size="sm" className="hidden sm:inline-flex">Join free</ButtonLink>
            </>
          )}
          <button className="flex h-10 w-10 items-center justify-center rounded-xl lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? "close" : "menu"} label={open ? "Close menu" : "Open menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="animate-rise border-t border-line bg-surface px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold hover:bg-violet-soft">
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
