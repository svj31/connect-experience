"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      router.push(as === "admin" ? "/admin" : "/app/discover");
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

interface Persona { key: string; name: string; city: string; age: number; photo: string | null; bio: string }

/** Pick which seeded member to be: each has their own matches, likes and history to explore. */
export function DemoPicker() {
  const router = useRouter();
  const { setUser } = useSession();
  const [list, setList] = useState<Persona[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<{ personas?: Persona[] }>("/auth/demo").then((r) => setList(r.personas ?? [])).catch(() => setList([]));
  }, []);
  if (!list?.length) return null;
  async function go(key: string) {
    setBusy(key);
    setError(null);
    try {
      const { user } = await api<{ user: Me }>("/auth/demo", { body: { as: "user", key } });
      setUser(user);
      router.push("/app/discover");
    } catch (e) {
      setError(errorMessage(e));
      setBusy(null);
    }
  }
  return (
    <section id="demo" aria-labelledby="demo-title" className="mt-6">
      <h2 id="demo-title" className="text-sm font-semibold">Or try it as someone else</h2>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {list.map((p) => (
          <li key={p.key}>
            <button type="button" onClick={() => go(p.key)} disabled={busy !== null} aria-label={`Sign in as ${p.name}, ${p.age}, ${p.city}`} className="group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-paper-deep text-left disabled:opacity-60">
              {p.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pt-8 pb-2 text-white">
                <span className="block font-display text-lg leading-none">{p.name}, {p.age}</span>
                <span className="block truncate text-[11px] text-white/80">{p.city}</span>
              </span>
              {busy === p.key && <span className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" /></span>}
            </button>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </section>
  );
}
