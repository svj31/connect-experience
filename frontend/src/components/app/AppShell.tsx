"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLive } from "@/lib/live";
import { useRequireUser } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { timeAgo } from "@/lib/labels";
import { LogoMark, Wordmark } from "../brand/Logo";
import { ThemeToggle } from "../site/ThemeToggle";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";
import { PageLoader } from "../ui/Loader";

export const NAV = [
  { href: "/app", label: "Home", icon: "home" },
  { href: "/app/discover", label: "Discover", icon: "discover" },
  { href: "/app/together", label: "Together", icon: "orbit" },
  { href: "/app/connections", label: "Connections", icon: "users" },
  { href: "/app/chats", label: "Chats", icon: "chat" },
  { href: "/app/moments", label: "Moments", icon: "star" },
  { href: "/app/profile", label: "My profile", icon: "user" },
];
const MOBILE = ["/app", "/app/discover", "/app/together", "/app/chats", "/app/profile"];

const isActive = (pathname: string, href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

function Bell() {
  const { notices, unread, markRead } = useLive();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          markRead();
        }}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-violet-soft hover:text-violet"
      >
        <Icon name="bell" size={20} label={unread ? `Notifications, ${unread} new` : "Notifications"} className={unread ? "animate-heartbeat" : ""} />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-on-primary">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 animate-pop rounded-2xl border border-line-strong bg-surface p-2 shadow-[var(--shadow)]">
          <p className="px-2 py-1.5 text-sm font-bold">Notifications</p>
          {notices.length === 0 ? (
            <p className="px-2 pb-3 text-sm text-muted">Nothing new. Requests, invites and matches show up here live.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link href={n.href ?? "#"} onClick={() => setOpen(false)} className="block rounded-xl p-2 hover:bg-violet-soft">
                    <span className="block text-sm font-semibold">{n.title}</span>
                    {n.body && <span className="block text-sm text-muted">{n.body}</span>}
                    <span className="text-xs text-muted">{timeAgo(new Date(n.at).toISOString())}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, logout } = useRequireUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  if (!user) return null;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Account menu" className="flex items-center gap-2 rounded-xl p-1 hover:bg-violet-soft">
        <Avatar name={user.displayName} config={user.avatar} size={34} decorative />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 animate-pop rounded-2xl border border-line-strong bg-surface p-2 shadow-[var(--shadow)]">
          <p className="truncate px-2 py-1.5 font-bold">{user.displayName}</p>
          {[["/app/profile", "user", "My profile"], ["/app/settings", "settings", "Settings and privacy"], ["/app/safety", "shield", "Safety centre"]].map(([href, icon, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold hover:bg-violet-soft">
              <Icon name={icon} size={17} /> {label}
            </Link>
          ))}
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-danger hover:bg-rose-soft"
          >
            <Icon name="logout" size={17} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** The signed in member area: a sidebar on wide screens, a bottom bar on phones. Rooms go full screen. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useRequireUser();
  const { connected } = useLive();
  const immersive = pathname.startsWith("/app/room/");
  const { setPrefs } = useTheme();
  const settings = user?.settings;
  // A signed in person's saved look follows them to any device.
  useEffect(() => {
    if (settings) setPrefs({ theme: settings.theme, cursor: settings.cursor, motion: settings.motion });
  }, [settings, setPrefs]);

  if (loading || !user) return <PageLoader variant="orbit" caption="Entering your verse" />;
  if (user.role === "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">You are signed in as an admin</h1>
        <p className="mt-2 text-muted">Admin accounts manage the community and do not have a dating profile.</p>
        <Link href="/admin" className="mt-6 inline-flex rounded-xl bg-violet px-4 py-2.5 font-semibold text-on-primary">Open the admin console</Link>
      </div>
    );
  }
  if (immersive) return <main id="main" className="flex-1">{children}</main>;

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/80 px-3 py-4 backdrop-blur-md lg:flex">
        <Link href="/app" className="flex items-center gap-2 px-2" aria-label="SaathVerse home">
          <LogoMark size={44} title="" />
          <Wordmark />
        </Link>
        <nav aria-label="App" className="mt-6 flex-1 space-y-1">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors ${active ? "bg-violet text-on-primary" : "text-muted hover:bg-violet-soft hover:text-violet"}`}
              >
                <Icon name={n.icon} size={20} className="transition-transform group-hover:scale-110" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-line pt-3">
          <Link href="/app/settings" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-violet-soft hover:text-violet"><Icon name="settings" size={18} /> Settings</Link>
          <Link href="/app/safety" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-violet-soft hover:text-violet"><Icon name="shield" size={18} /> Safety centre</Link>
          <p className="flex items-center gap-2 px-3 pt-2 text-xs text-muted">
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-mint" : "bg-sun"}`} aria-hidden="true" /> {connected ? "Live" : "Connecting"}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur-md sm:px-6">
          <Link href="/app" className="flex items-center gap-2 lg:hidden" aria-label="SaathVerse home">
            <LogoMark size={40} title="" />
            <Wordmark size="sm" />
          </Link>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Bell />
            <AccountMenu />
          </div>
        </header>
        {user.status !== "active" && (
          <p role="alert" className="bg-sun-soft px-4 py-2 text-center text-sm font-semibold text-sun">
            This account is {user.status === "banned" ? "removed" : "paused for now"}. Contact us if you think this is a mistake.
          </p>
        )}
        <main id="main" className="flex-1 px-4 pt-6 pb-28 sm:px-6 lg:pb-12">{children}</main>
      </div>

      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {NAV.filter((n) => MOBILE.includes(n.href)).map((n) => {
          const active = isActive(pathname, n.href);
          const center = n.href === "/app/together";
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold ${active ? "text-violet" : "text-muted"}`}>
              {center ? (
                <span className={`-mt-6 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-surface ${active ? "bg-rose" : "bg-violet"} text-on-primary shadow-[var(--shadow)]`}>
                  <Icon name="orbit" size={22} />
                </span>
              ) : (
                <Icon name={n.icon} size={22} />
              )}
              {n.label === "My profile" ? "Me" : n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
