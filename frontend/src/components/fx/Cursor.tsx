"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

const INTERACTIVE = "a, button, [role='button'], label, select, summary, [data-cursor='hover']";
const TEXT = "input:not([type='checkbox']):not([type='radio']):not([type='range']), textarea, [contenteditable='true']";

/**
 * A playful cursor: a small violet world with an orbit ring that follows a little behind.
 * Over anything you can press, the ring grows rose and a heart appears; over text it becomes a caret;
 * clicking throws a few sparks. Only for fine pointers, off for reduced motion, and switchable in Settings.
 */
export function Cursor() {
  const { prefs } = useTheme();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || prefs.motion === "reduced";
    const el = root.current;
    if (!el || !fine || reduced || !prefs.cursor) return;

    document.documentElement.classList.add("sv-cursor-on");
    const dot = el.querySelector<HTMLElement>(".dot")!;
    const ring = el.querySelector<HTMLElement>(".ring")!;
    let x = -100, y = -100, rx = -100, ry = -100;
    let frame = 0;
    let lastTrail = 0;

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const spawn = (px: number, py: number, color: string, big = false) => {
      const s = document.createElement("span");
      s.className = "sv-trail";
      s.style.left = `${px + (Math.random() - 0.5) * (big ? 30 : 6)}px`;
      s.style.top = `${py + (Math.random() - 0.5) * (big ? 30 : 6)}px`;
      s.innerHTML = `<svg viewBox="0 0 24 24" width="${big ? 10 : 6}" height="${big ? 10 : 6}" fill="${color}"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    };

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
      const target = e.target as Element | null;
      el.classList.toggle("is-text", Boolean(target?.closest?.(TEXT)));
      el.classList.toggle("is-hover", Boolean(target?.closest?.(INTERACTIVE)) && !target?.closest?.(TEXT));
      const now = performance.now();
      if (now - lastTrail > 70) {
        lastTrail = now;
        spawn(x, y, Math.random() > 0.5 ? "var(--spark)" : "var(--lilac)");
      }
    };
    const down = (e: PointerEvent) => {
      el.classList.add("is-down");
      for (let i = 0; i < 6; i++) spawn(e.clientX, e.clientY, i % 2 ? "var(--rose)" : "var(--violet)", true);
    };
    const up = () => el.classList.remove("is-down");
    const leave = () => (el.style.opacity = "0");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("sv-cursor-on");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, [prefs.cursor, prefs.motion]);

  return (
    <div ref={root} className="sv-cursor" aria-hidden="true" style={{ opacity: 0 }}>
      <span className="ring">
        <svg className="heart" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" />
        </svg>
      </span>
      <span className="dot" />
    </div>
  );
}
