"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { Logo } from "./brand/Logo";
import { Avatar } from "./ui/Avatar";
import { buttonClass } from "./ui/Button";
import { Icon } from "./ui/Icon";

const APP_LINKS = [
  { href: "/lobby", label: "Lobby" },
  { href: "/moments", label: "Moments" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  const { user, loading, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  // The menu remembers the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  // The room has its own top bar, so the site header stays out of the way there.
  if (pathname.startsWith("/room/")) return null;

  async function signOut() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Overlap home" className="rounded-md">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {user &&
            APP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${pathname.startsWith(link.href) ? "bg-paper-deep text-ink" : "text-muted hover:text-ink"}`}
              >
                {link.label}
              </Link>
            ))}
          {!user && (
            <>
              <Link href="/#how" className="rounded-md px-3 py-2 text-sm font-semibold text-muted hover:text-ink">How it works</Link>
              <Link href="/#activities" className="rounded-md px-3 py-2 text-sm font-semibold text-muted hover:text-ink">Activities</Link>
              <Link href="/safety" className="rounded-md px-3 py-2 text-sm font-semibold text-muted hover:text-ink">Safety</Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <span className="h-9 w-24" />
          ) : user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-paper-deep">
                <Avatar shape={user.avatarShape} color={user.avatarColor} name={user.displayName} size={30} />
                <span className="text-sm font-semibold">{user.displayName}</span>
              </Link>
              <button onClick={signOut} className={buttonClass("ghost", "sm")}>
                <Icon name="logout" size={16} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClass("ghost", "sm")}>Sign in</Link>
              <Link href="/signup" className={buttonClass("primary", "sm")}>Start a table</Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpenOn(open ? null : pathname)}
        >
          <Icon name={open ? "close" : "menu"} label={open ? "Close menu" : "Open menu"} />
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-paper px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {(user ? APP_LINKS : [{ href: "/#how", label: "How it works" }, { href: "/#activities", label: "Activities" }, { href: "/safety", label: "Safety" }]).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-md px-2 py-3 font-semibold text-ink hover:bg-paper-deep">{link.label}</Link>
              </li>
            ))}
          </ul>
          {user ? (
            <button onClick={signOut} className={buttonClass("secondary", "md", "w-full")}>Sign out</button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" className={buttonClass("secondary")}>Sign in</Link>
              <Link href="/signup" className={buttonClass("primary")}>Start a table</Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
