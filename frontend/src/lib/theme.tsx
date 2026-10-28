"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeChoice = "light" | "dark" | "system";
interface Prefs { theme: ThemeChoice; cursor: boolean; motion: "full" | "reduced" }

const KEY = "sv_prefs";
const DEFAULTS: Prefs = { theme: "system", cursor: true, motion: "full" };

export function readPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(window.localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

/** Applies the theme to <html>. Runs before paint via the inline script in the layout too. */
export function applyPrefs(p: Prefs) {
  const root = document.documentElement;
  const dark = p.theme === "dark" || (p.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.motion = p.motion;
}

/** Inline script so the right theme is set before the first paint, with no flash. */
export const THEME_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${KEY}")||"{}");var t=p.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";document.documentElement.dataset.motion=p.motion||"full"}catch(e){}`;

const Ctx = createContext<{ prefs: Prefs; setPrefs: (p: Partial<Prefs>) => void; dark: boolean } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setState] = useState<Prefs>(DEFAULTS);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const initial = readPrefs();
    // Reading storage must wait for the browser, so this sync runs once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(initial);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      applyPrefs(readPrefs());
      setDark(document.documentElement.dataset.theme === "dark");
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Blocked storage just means the choice lasts for this visit.
      }
      applyPrefs(next);
      setDark(document.documentElement.dataset.theme === "dark");
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ prefs, setPrefs, dark }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
