"use client";

/* eslint-disable @next/next/no-img-element -- member photos come from any https host or an upload */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AvatarConfig } from "@/lib/types";
import { Planet } from "./Planet";

export { planetSrc } from "./Planet";

const HOVER_DELAY = 900;
const IDLE_DELAY = 4500;
const PLANET_MS = 2800;
const FLIP = "transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)";

/**
 * A member's photo with their planet on the back, like a card that turns over.
 * Hover: after a moment the card flips to the planet, then back to the photo; leaving flips back.
 * Idle (Discover only, opt in with trigger "both"): when the viewer has not touched anything for a
 * few seconds, cards flip on their own, briefly. Everywhere else photos flip on hover only.
 * Without a photo the planet shows on its own. Styles are inline so the effect never depends on a
 * stylesheet being fresh; reduced motion swaps without the turn.
 */
export function PhotoPlanet({
  photo,
  planet: config,
  alt,
  trigger = "hover",
  className = "",
  loading,
}: {
  photo?: string | null;
  /** The member's planet options (colour, shape, design, face, ring, spin). */
  planet?: Partial<AvatarConfig> | null;
  alt: string;
  trigger?: "hover" | "idle" | "both" | "none";
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [flipped, setFlipped] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [idle, setIdle] = useState(false);
  const [reduced, setReduced] = useState(false);
  const useHover = trigger === "hover" || trigger === "both";
  const useIdle = trigger === "idle" || trigger === "both";

  useEffect(() => {
    const q = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const read = () => setReduced(Boolean(q?.matches) || document.documentElement.dataset.motion === "reduced");
    read();
    q?.addEventListener("change", read);
    return () => q?.removeEventListener("change", read);
  }, []);

  // Alternate photo and planet while hovered or idle; the first turn waits a moment.
  const cycling = Boolean(photo) && ((useHover && hovering) || (useIdle && idle));
  useEffect(() => {
    if (!cycling) return;
    let showing = false;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      showing = !showing;
      setFlipped(showing);
      t = setTimeout(step, showing ? PLANET_MS : hovering ? HOVER_DELAY + 1200 : IDLE_DELAY);
    };
    // Idle cards turn at slightly different moments, so a page of photos never flips in unison.
    t = setTimeout(step, hovering ? HOVER_DELAY : 300 + Math.random() * 1400);
    return () => {
      clearTimeout(t);
      setFlipped(false);
    };
  }, [cycling, hovering]);
  // Leaving or waking up always shows the photo again, whatever the timer was doing.
  const showPlanet = cycling && flipped;

  // Idle watch: any pointer, key, scroll or touch resets it. Only state changes re-render.
  const idleRef = useRef(false);
  useEffect(() => {
    if (!useIdle || !photo) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        idleRef.current = true;
        setIdle(true);
      }, IDLE_DELAY);
    };
    const wake = () => {
      if (idleRef.current) {
        idleRef.current = false;
        setIdle(false);
      }
      arm();
    };
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    // Capture, so scrolling inside panels (not just the page) also counts as activity.
    events.forEach((e) => window.addEventListener(e, wake, { passive: true, capture: true }));
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake, { capture: true }));
    };
  }, [useIdle, photo]);

  // Callers may position the card absolutely; only default to relative when they do not.
  const pos = /\b(absolute|fixed)\b/.test(className) ? "" : "relative";
  const side: CSSProperties = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const glow = "radial-gradient(65% 60% at 50% 45%, color-mix(in srgb, var(--saffron) 18%, var(--bg-deep)), var(--bg-deep))";
  const center: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", background: glow };

  if (!photo) {
    return (
      <div className={`${pos} overflow-hidden ${className}`}>
        <div style={{ ...side, ...center }}>
          <Planet config={config ?? undefined} title={alt || undefined} style={{ width: "82%", height: "82%" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${pos} overflow-hidden ${className}`}
      style={{ perspective: "1400px", background: "var(--bg-deep)" }}
      data-flipped={showPlanet || undefined}
      onPointerEnter={useHover ? () => setHovering(true) : undefined}
      onPointerLeave={useHover ? () => setHovering(false) : undefined}
    >
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transition: reduced ? "none" : FLIP, transform: showPlanet ? "rotateY(180deg)" : "none" }}>
        <img src={photo} alt={alt} draggable={false} loading={loading} style={{ ...side, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ ...side, ...center, transform: "rotateY(180deg)" }} aria-hidden="true">
          <Planet config={config ?? undefined} style={{ width: "82%", height: "82%" }} />
        </div>
      </div>
    </div>
  );
}
