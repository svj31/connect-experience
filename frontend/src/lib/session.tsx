"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Me } from "./types";

interface Session {
  user: Me | null;
  loading: boolean;
  setUser: (user: Me | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api<{ user: Me | null }>("/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    api<{ user: Me | null }>("/auth/me")
      .then(({ user }) => active && setUser(user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return <SessionContext.Provider value={{ user, loading, setUser, refresh, logout }}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

/**
 * For signed in pages: sends visitors without a valid session to sign in, then back here.
 * Admin pages pass "admin"; a regular account is sent to its own dashboard instead.
 */
export function useRequireUser(role: "user" | "admin" = "user"): Session {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) router.replace(`/login?${role === "admin" ? "as=admin&" : ""}next=${encodeURIComponent(pathname)}`);
    else if (role === "admin" && session.user.role !== "admin") router.replace("/app/discover");
  }, [session.loading, session.user, router, pathname, role]);
  return session;
}
