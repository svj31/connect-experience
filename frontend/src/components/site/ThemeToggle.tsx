"use client";

import { useTheme } from "@/lib/theme";
import { Icon } from "../ui/Icon";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dark, setPrefs } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
      className={`flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-violet-soft hover:text-violet ${className}`}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      <span className="transition-transform duration-500" style={{ transform: dark ? "rotate(180deg)" : "none" }}>
        <Icon name={dark ? "sun" : "moon"} size={19} />
      </span>
    </button>
  );
}
