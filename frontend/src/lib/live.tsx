"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { Celebration } from "@/components/fx/Celebration";
import { activityById } from "./activities";
import { useSession } from "./session";
import { openSocket } from "./socket";
import type { AvatarConfig } from "./types";

export interface Notice {
  id: number;
  kind: "request" | "accepted" | "invite" | "warning" | "info";
  title: string;
  body?: string;
  href?: string;
  at: number;
  read: boolean;
}

interface Live {
  socket: Socket | null;
  connected: boolean;
  notices: Notice[];
  unread: number;
  markRead: () => void;
  toast: (title: string, body?: string, kind?: Notice["kind"]) => void;
  celebrate: (c: { title: string; message: string; them?: { name: string; avatar?: Partial<AvatarConfig> }; href?: string; cta?: string }) => void;
}

const LiveContext = createContext<Live | null>(null);
let nextId = 1;

/**
 * One Socket.IO connection for the whole signed in app. Pages share it, the room joins
 * its table through it, and app-wide events (requests, invites, matches) arrive here.
 */
export function LiveProvider({ children }: { children: ReactNode }) {
  const { user, refresh } = useSession();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [toasts, setToasts] = useState<Notice[]>([]);
  const [party, setParty] = useState<Parameters<Live["celebrate"]>[0] | null>(null);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const push = useCallback((n: Omit<Notice, "id" | "at" | "read">, keep = true) => {
    const notice = { ...n, id: nextId++, at: Date.now(), read: false };
    if (keep) setNotices((prev) => [notice, ...prev].slice(0, 30));
    setToasts((prev) => [...prev, notice].slice(-3));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== notice.id)), 6000);
  }, []);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const s = openSocket();
    // The socket is created once per signed in user and handed to every page below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(s);
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("connection:request", (p: { name: string; note?: string }) =>
      push({ kind: "request", title: `${p.name} wants to connect`, body: p.note || "Open Connections to say yes.", href: "/app/connections?tab=requests" }),
    );
    s.on("connection:accepted", (p: { name: string; roomCode: string; mutual: boolean; avatar?: Partial<AvatarConfig> }) => {
      push({ kind: "accepted", title: p.mutual ? `It's a Saath with ${p.name}` : `${p.name} accepted your request`, body: "Your shared space is open.", href: `/app/room/${p.roomCode}` });
      setParty({ title: "It's a Saath!", message: `You and ${p.name} are connected. Your shared space is ready whenever you are.`, them: { name: p.name, avatar: p.avatar }, href: `/app/room/${p.roomCode}`, cta: "Say hello" });
    });
    s.on("room:invite", (p: { name: string; roomCode: string; activity: string }) =>
      push({ kind: "invite", title: `${p.name} invited you to ${activityById(p.activity).name}`, body: "Accept or decline it in Together.", href: "/app/together" }),
    );
    s.on("together:update", (p: { name: string; status: string; activity: string; roomCode: string }) => {
      const what = activityById(p.activity).name;
      if (p.status === "accepted") push({ kind: "accepted", title: `${p.name} said yes to ${what}`, body: "They are on their way to your shared space.", href: `/app/room/${p.roomCode}` });
      else if (p.status === "declined") push({ kind: "info", title: `${p.name} can't do ${what} right now`, body: "No pressure. Try another time or another activity.", href: "/app/together" });
      else push({ kind: "info", title: `${p.name} called off ${what}`, body: "The plan is closed. Your shared space is still there.", href: "/app/together" });
    });
    s.on("account:warning", (p: { note: string }) => push({ kind: "warning", title: "A note from the SaathVerse team", body: p.note }));
    s.on("account:status", () => void refresh());
    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId, push, refresh]);

  const value: Live = {
    socket,
    connected,
    notices,
    unread: notices.filter((n) => !n.read).length,
    markRead: () => setNotices((prev) => prev.map((n) => ({ ...n, read: true }))),
    toast: (title, body, kind = "info") => push({ kind, title, body }, false),
    celebrate: setParty,
  };

  return (
    <LiveContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-3 bottom-24 z-[70] flex w-[min(360px,calc(100%-1.5rem))] flex-col gap-2 lg:bottom-4" aria-live="polite">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => t.href && router.push(t.href)}
            className="pointer-events-auto animate-pop rounded-2xl border border-line-strong bg-surface p-3 text-left shadow-[var(--shadow)]"
          >
            <p className="flex items-center gap-2 text-sm font-bold">
              <span className={`h-2 w-2 rounded-full ${t.kind === "warning" ? "bg-sun" : t.kind === "accepted" ? "bg-rose" : "bg-brand"}`} aria-hidden="true" />
              {t.title}
            </p>
            {t.body && <p className="mt-0.5 text-sm text-muted">{t.body}</p>}
          </button>
        ))}
      </div>
      <Celebration
        open={Boolean(party)}
        title={party?.title ?? ""}
        message={party?.message ?? ""}
        me={user ? { name: user.displayName, avatar: user.avatar } : undefined}
        them={party?.them}
        primary={party?.href ? { label: party.cta ?? "Open", onClick: () => { const h = party.href!; setParty(null); router.push(h); } } : undefined}
        onClose={() => setParty(null)}
      />
    </LiveContext.Provider>
  );
}

export function useLive(): Live {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLive must be used inside LiveProvider");
  return ctx;
}
