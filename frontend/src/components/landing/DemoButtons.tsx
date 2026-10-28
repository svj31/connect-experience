"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { Me } from "@/lib/types";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

/** One click into a seeded demo account, so anyone can see the app in seconds. */
export function DemoButton({ as, children, variant = "secondary", size = "md", className = "" }: { as: "user" | "admin"; children: React.ReactNode; variant?: "primary" | "secondary" | "soft" | "ghost" | "accent"; size?: "sm" | "md" | "lg"; className?: string }) {
  const router = useRouter();
  const { setUser } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function go() {
    setBusy(true);
    setError(null);
    try {
      const { user } = await api<{ user: Me }>("/auth/demo", { body: { as } });
      setUser(user);
      router.push(as === "admin" ? "/admin" : "/app");
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }
  return (
    <span className={`inline-flex flex-col ${className}`}>
      <Button variant={variant} size={size} onClick={go} loading={busy}>
        {!busy && <Icon name={as === "admin" ? "shield" : "zap"} size={18} />} {children}
      </Button>
      {error && <span role="alert" className="mt-1 text-sm text-danger">{error}</span>}
    </span>
  );
}
