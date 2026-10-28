"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Scroll motion for the landing page only, after the scroll-craft approach: one rAF loop reads one
 * scroll value and moves elements that are already on the page. Nothing is added to or removed from
 * the layout, so the page reads the same with motion off (reduced motion, no JS).
 *
 * Mark elements with data-sm:
 *   parallax  data-speed="0.12"   drifts vertically against the scroll (depth)
 *   drift     data-x="-160"       slides sideways as it passes through the viewport
 *   zoom                          an image settles from 1.08 to 1 as it enters
 *   curtain                       a panel opens from a rounded inset card to full bleed (the peak)
 *   grow                          scales from 0.94 to 1 as it enters
 *   exit                          lifts and fades a little as it leaves through the top
 */
export function ScrollMotion() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced") return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-sm]")];
    const phone = () => window.innerWidth < 768;
    let frame = 0;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function read() {
      frame = 0;
      const vh = window.innerHeight;
      const scale = phone() ? 0.5 : 1;
      const doc = document.documentElement;
      if (bar.current) bar.current.style.transform = `scaleX(${clamp(window.scrollY / Math.max(1, doc.scrollHeight - vh))})`;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
        // Through: 0 as the top enters at the bottom, 1 as the bottom leaves at the top.
        const through = clamp((vh - r.top) / (vh + r.height));
        // Entry: 0 as it enters, 1 once its top reaches 35% of the screen.
        const entry = ease(clamp((vh - r.top) / (vh * 0.65)));
        switch (el.dataset.sm) {
          case "parallax":
            el.style.transform = `translate3d(0, ${((0.5 - through) * Number(el.dataset.speed ?? 0.12) * vh * scale).toFixed(1)}px, 0)`;
            break;
          case "drift":
            el.style.transform = `translate3d(${((through - 0.5) * Number(el.dataset.x ?? -160) * scale).toFixed(1)}px, 0, 0)`;
            break;
          case "zoom":
            el.style.transform = `scale(${(1.08 - 0.08 * entry).toFixed(4)})`;
            break;
          case "grow":
            el.style.transform = `scale(${(0.94 + 0.06 * entry).toFixed(4)})`;
            break;
          case "curtain": {
            const open = ease(clamp((vh - r.top) / (vh * 0.8)));
            const side = phone() ? 3 : 5;
            el.style.clipPath = `inset(0 ${((1 - open) * side).toFixed(2)}% round ${((1 - open) * 36).toFixed(1)}px)`;
            break;
          }
          case "exit": {
            const gone = clamp(-r.top / (r.height * 0.9));
            el.style.transform = `translate3d(0, ${(-gone * 60 * scale).toFixed(1)}px, 0)`;
            el.style.opacity = (1 - gone * 0.7).toFixed(3);
            break;
          }
        }
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      for (const el of els) {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.clipPath = "";
      }
    };
  }, []);

  // A thin plum line along the top that fills as you read down the page.
  return <div ref={bar} aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-violet" style={{ transform: "scaleX(0)" }} />;
}

/**
 * A heading whose words rise into place one after another when it first comes into view, like an
 * editorial title card. The words are the same text, only wrapped, so screen readers read it whole.
 */
export function Words({ as: Tag = "h2", text, className = "", id }: { as?: ElementType; text: ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  // "static" until the page has loaded: no JS, reduced motion and headings already on screen stay as is.
  const [phase, setPhase] = useState<"static" | "hidden" | "shown">("static");
  useEffect(() => {
    const el = ref.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
    if (reduced || !el || !("IntersectionObserver" in window) || el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const arm = setTimeout(() => setPhase("hidden"), 0);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setPhase("shown");
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => {
      clearTimeout(arm);
      io.disconnect();
    };
  }, []);
  const motion = phase !== "static";
  const shown = phase === "shown";

  // Split plain strings and the text inside simple <span> parts (for italic accents) into words.
  const parts: ReactNode[] = [];
  let i = 0;
  const push = (word: string, wrap?: (w: ReactNode) => ReactNode) => {
    const n = i++;
    const inner = (
      <span
        className="inline-block will-change-transform"
        style={motion ? { transform: shown ? "none" : "translateY(105%)", transition: `transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${n * 55}ms` } : undefined}
      >
        {word}
      </span>
    );
    parts.push(
      <span key={n} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        {wrap ? wrap(inner) : inner}
      </span>,
      " ",
    );
  };
  const walk = (node: ReactNode, wrap?: (w: ReactNode) => ReactNode) => {
    if (typeof node === "string") node.split(/\s+/).filter(Boolean).forEach((w) => push(w, wrap));
    else if (Array.isArray(node)) node.forEach((n) => walk(n, wrap));
    else if (node && typeof node === "object" && "props" in node) {
      const el = node as { type: ElementType; props: { className?: string; children?: ReactNode } };
      walk(el.props.children, (w) => <el.type className={el.props.className}>{w}</el.type>);
    }
  };
  walk(text);

  return (
    <Tag ref={ref} id={id} className={className}>
      {parts}
    </Tag>
  );
}
