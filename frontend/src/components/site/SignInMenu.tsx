"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../ui/Icon";

/** "Sign in" with a choice between the people side and the admin side. */
export function SignInMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-ink hover:bg-violet-soft hover:text-violet"
      >
        Sign in <Icon name="chevronDown" size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 animate-pop rounded-2xl border border-line-strong bg-surface p-2 shadow-[var(--shadow)]">
          <Link role="menuitem" href="/login" onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-xl p-3 hover:bg-violet-soft">
            <span className="mt-0.5 text-violet"><Icon name="heart" /></span>
            <span>
              <span className="block font-semibold">Sign in as a member</span>
              <span className="block text-sm text-muted">Meet people, play, chat</span>
            </span>
          </Link>
          <Link role="menuitem" href="/login?as=admin" onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-xl p-3 hover:bg-violet-soft">
            <span className="mt-0.5 text-rose"><Icon name="shield" /></span>
            <span>
              <span className="block font-semibold">Sign in as an admin</span>
              <span className="block text-sm text-muted">Safety, reports, analytics</span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
