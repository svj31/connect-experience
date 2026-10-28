"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useRequireUser } from "@/lib/session";
import { LogoMark, Wordmark } from "../brand/Logo";
import { ThemeToggle } from "../site/ThemeToggle";
import { Icon } from "../ui/Icon";
import { PageLoader } from "../ui/Loader";

const NAV = [
  { href: "/admin", label: "Overview", icon: "chart" },
  { href: "/admin/reports", label: "Reports", icon: "flag" },
  { href: "/admin/users", label: "Members", icon: "users" },
  { href: "/admin/audit", label: "Audit log", icon: "list" },
  { href: "/admin/profile", label: "My profile", icon: "user" },
];

/** The admin console. Only accounts with the admin role get past the guard. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useRequireUser("admin");
  if (loading || !user || user.role !== "admin") return <PageLoader variant="shield" caption="Checking your admin pass" />;
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-line bg-surface/85 backdrop-blur-md lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:py-5">
          <Link href="/admin" className="flex items-center gap-2" aria-label="Admin overview">
            <LogoMark size={40} title="" />
            <span><Wordmark size="sm" /><span className="block text-[11px] font-bold tracking-widest text-rose uppercase">Admin</span></span>
          </Link>
          <div className="flex items-center gap-1 lg:hidden"><ThemeToggle /></div>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active(n.href) ? "bg-brand text-white" : "text-muted hover:bg-rose-soft hover:text-rose"}`}>
              <Icon name={n.icon} size={18} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-line p-3 lg:block">
          <div className="flex items-center justify-between"><span className="truncate text-sm font-bold">{user.displayName}</span><ThemeToggle /></div>
          <button onClick={async () => { await logout(); router.push("/"); }} className="mt-1 flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-danger hover:bg-rose-soft"><Icon name="logout" size={16} /> Sign out</button>
        </div>
      </aside>
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
