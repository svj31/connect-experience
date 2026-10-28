"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { Connection } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";

/**
 * Instagram style row: your matches as rings. A gradient ring means a new match you have not
 * talked to yet; a plain ring means you are already chatting. First bubble edits your profile.
 */
export function StoryRow() {
  const { user } = useSession();
  const [list, setList] = useState<Connection[] | null>(null);
  useEffect(() => {
    api<{ connections: Connection[] }>("/connections")
      .then((r) => setList(r.connections))
      .catch(() => setList([]));
  }, []);
  if (!user) return null;
  const sorted = [...(list ?? [])].sort((a, b) => Number(Boolean(a.lastMessage)) - Number(Boolean(b.lastMessage)));
  return (
    <nav aria-label="Your matches" className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-4">
        <li className="shrink-0">
          <Link href="/app/profile" className="flex w-[76px] flex-col items-center gap-1.5 text-center">
            <span className="relative rounded-full p-[3px] ring-1 ring-line">
              <Avatar name={user.displayName} config={user.avatar} size={64} decorative />
              <span className="bg-brand absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-paper"><Icon name="plus" size={14} /></span>
            </span>
            <span className="w-full truncate text-xs font-semibold text-muted">Your profile</span>
          </Link>
        </li>
        {list === null
          ? [0, 1, 2, 3].map((i) => <li key={i} className="skeleton h-[70px] w-[70px] shrink-0 rounded-full" />)
          : sorted.map((c) => (
              <li key={c.id} className="shrink-0">
                <Link href={`/app/chats?c=${c.id}`} className="group flex w-[76px] flex-col items-center gap-1.5 text-center">
                  <span className={`rounded-full p-[3px] ${c.lastMessage ? "bg-line-strong" : "bg-brand"}`}>
                    <span className="block rounded-full bg-paper p-[2px] transition-transform group-hover:scale-105">
                      <Avatar name={c.person.displayName} config={c.person.avatar} size={60} decorative />
                    </span>
                  </span>
                  <span className={`w-full truncate text-xs ${c.lastMessage ? "font-semibold text-muted" : "font-extrabold text-ink"}`}>{c.person.displayName}</span>
                </Link>
              </li>
            ))}
      </ul>
    </nav>
  );
}
