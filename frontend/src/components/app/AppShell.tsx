"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useLive } from "@/lib/live";
import type { Connection } from "@/lib/types";
import { useRequireUser } from "@/lib/session";
import { useTheme } from "@/lib/theme";
import { timeAgo } from "@/lib/labels";
import { LogoMark, Wordmark } from "../brand/Logo";
import { ThemeToggle } from "../site/ThemeToggle";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";
import { PageLoader } from "../ui/Loader";

export const NAV = [
  { href: "/app/discover", label: "Discover", icon: "fire" },
  { href: "/app/connections", label: "Likes", icon: "heart" },
  { href: "/app/together", label: "Together", icon: "orbit" },
  { href: "/app/chats", label: "Chats", icon: "chat" },
  { href: "/app/moments", label: "Moments", icon: "star" },
  { href: "/app", label: "Home", icon: "home" },
  { href: "/app/profile", label: "Profile", icon: "user" },
];
const MOBILE = ["/app/discover", "/app/connections", "/app/together", "/app/chats", "/app/profile"];

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
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-paper-deep hover:text-ink"
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
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Account menu" className="flex items-center gap-2 rounded-full p-1 hover:bg-paper-deep">
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

/** Tinder style side panel content: new matches as photos, then recent conversations. */
function MatchesPanel() {
  const pathname = usePathname();
  const { notices } = useLive();
  const [list, setList] = useState<Connection[] | null>(null);
  const [tab, setTab] = useState<"matches" | "messages">("matches");
  useEffect(() => {
    let live = true;
    api<{ connections: Connection[] }>("/connections")
      .then((r) => live && setList(r.connections))
      .catch(() => live && setList([]));
    return () => {
      live = false;
    };
  }, [pathname, notices.length]);
  const fresh = list?.filter((c) => !c.lastMessage) ?? [];
  const talking = [...(list?.filter((c) => c.lastMessage) ?? [])].sort((a, b) => (b.lastMessage!.at ?? "").localeCompare(a.lastMessage!.at ?? ""));
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex gap-6 border-b border-line px-5" role="tablist" aria-label="Your matches">
        {(["matches", "messages"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`relative py-3 text-sm font-extrabold capitalize ${tab === t ? "text-ink" : "text-muted hover:text-ink"}`}>
            {t}
            {tab === t && <span className="bg-brand absolute inset-x-0 -bottom-px h-[3px] rounded-full" />}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 no-scrollbar">
        {!list ? (
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton aspect-[3/4] rounded-xl" />)}</div>
        ) : tab === "matches" ? (
          list.length === 0 ? (
            <p className="px-1 text-sm text-muted">No matches yet. Start swiping in Discover; when you both like each other, they show up here.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2">
              {[...fresh, ...talking].map((c) => (
                <li key={c.id}>
                  <Link href={`/app/chats?c=${c.id}`} className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-paper-deep">
                    {c.person.avatar.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.person.avatar.photo} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="flex h-full items-center justify-center"><Avatar name={c.person.displayName} config={c.person.avatar} size={56} decorative /></span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-6 pb-1.5 text-xs font-bold text-white">{c.person.displayName}</span>
                    {!c.lastMessage && <span className="bg-brand absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white" aria-label="New match" />}
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : talking.length === 0 ? (
          <p className="px-1 text-sm text-muted">No conversations yet. Say hi to a match, or start a game together.</p>
        ) : (
          <ul className="-mx-2 space-y-0.5">
            {talking.map((c) => (
              <li key={c.id}>
                <Link href={`/app/chats?c=${c.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-paper-deep">
                  <Avatar name={c.person.displayName} config={c.person.avatar} size={52} online={c.person.online} decorative />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{c.person.displayName}</span>
                    <span className="block truncate text-sm text-muted">{c.lastMessage!.mine ? "You: " : ""}{c.lastMessage!.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
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

  if (loading || !user) return <PageLoader variant="hearts" caption="Getting your matches ready" />;
  if (user.role === "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">You are signed in as an admin</h1>
        <p className="mt-2 text-muted">Admin accounts manage the community and do not have a dating profile.</p>
        <Link href="/admin" className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2.5 font-semibold text-on-primary">Open the admin console</Link>
      </div>
    );
  }
  if (immersive) return <main id="main" className="flex-1">{children}</main>;

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-[340px] shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="bg-brand flex h-[72px] items-center gap-3 px-4">
          <Link href="/app/profile" className="flex min-w-0 flex-1 items-center gap-3 rounded-full py-1 pr-3 pl-1 transition-colors hover:bg-white/15">
            <span className="rounded-full ring-2 ring-white/80"><Avatar name={user.displayName} config={user.avatar} size={40} decorative /></span>
            <span className="truncate font-extrabold text-white">{user.displayName}</span>
          </Link>
          <Link href="/app/safety" className="flex h-10 w-10 items-center justify-center rounded-full bg-black/15 text-white hover:bg-black/25" aria-label="Safety centre"><Icon name="shield" size={19} /></Link>
          <Link href="/app/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-black/15 text-white hover:bg-black/25" aria-label="Settings"><Icon name="settings" size={19} /></Link>
        </div>
        <nav aria-label="App" className="grid grid-cols-4 gap-1 border-b border-line p-2">
          {NAV.slice(0, 4).map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-extrabold transition-colors ${active ? "text-violet" : "text-muted hover:bg-paper-deep hover:text-ink"}`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? "bg-brand text-white shadow-brand" : ""}`}><Icon name={n.icon} size={19} /></span>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <MatchesPanel />
        <div className="flex items-center gap-1 border-t border-line px-3 py-2 text-sm font-bold">
          {NAV.slice(4).map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${isActive(pathname, n.href) ? "bg-violet-soft text-violet" : "text-muted hover:text-ink"}`}>
              <Icon name={n.icon} size={15} /> {n.label}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted" title={connected ? "Live" : "Connecting"}>
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-mint" : "bg-sun"}`} aria-hidden="true" /> {connected ? "Live" : "..."}
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-paper">
        <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line px-4 sm:px-6">
          <Link href="/app" className="flex items-center gap-2 lg:hidden" aria-label="SaathVerse home">
            <LogoMark size={32} title="" />
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

      <nav aria-label="App" className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line pb-[env(safe-area-inset-bottom)] lg:hidden">
        {MOBILE.map((href) => NAV.find((n) => n.href === href)!).map((n) => {
          const active = isActive(pathname, n.href);
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} aria-label={n.label} className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-extrabold ${active ? "text-violet" : "text-muted"}`}>
              <span className={`flex h-9 w-12 items-center justify-center rounded-full transition-all ${active ? "bg-brand text-white shadow-brand" : ""}`}>
                <Icon name={n.icon} size={22} />
              </span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
