import Link from "next/link";

/**
 * The Shared Orbit mark: two orbits for two worlds, a heart for the connection between
 * them and a spark for the excitement of meeting. On hover the worlds travel their
 * orbits, the heart beats and the spark twinkles (see .sv-logo in globals.css).
 */
export function LogoMark({ size = 40, className = "", live = false, title = "SaathVerse" }: { size?: number; className?: string; live?: boolean; title?: string }) {
  return (
    <svg
      width={size}
      height={(size * 150) / 220}
      viewBox="0 0 220 150"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={`sv-logo shrink-0 overflow-visible ${live ? "is-live" : ""} ${className}`}
    >
      <g className="orbit-a">
        <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(-32 110 76)" fill="none" stroke="#9B83E8" strokeWidth="3.5" strokeDasharray="7 6" />
      </g>
      <g className="orbit-b">
        <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(32 110 76)" fill="none" stroke="#C5B3F8" strokeWidth="3.5" />
      </g>
      <g className="worlds">
        <circle cx="54" cy="55" r="8" fill="#7657D6" />
        <circle cx="166" cy="97" r="8" fill="#7657D6" />
      </g>
      <g className="heart">
        <path d="M110 99 C99 88 78 74 78 59 C78 43 98 39 110 55 C122 39 142 43 142 59 C142 74 121 88 110 99Z" fill="#7657D6" />
        <path d="M110 65 C103 57 93 64 100 73 L110 82 L120 73 C127 64 117 57 110 65Z" fill="#F9D9F0" />
      </g>
      <g className="spark">
        <path d="M110 20 L114 30 L125 34 L114 38 L110 49 L106 38 L95 34 L106 30Z" fill="#E5A2D5" />
      </g>
      <circle className="dot" cx="170" cy="39" r="4" fill="#E5A2D5" />
    </svg>
  );
}

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <span className={`font-display ${text} font-semibold tracking-tight text-ink`}>
      Saath<span className="text-violet">Verse</span>
    </span>
  );
}

export function Logo({ href = "/", size = 44, wordmark = "md" }: { href?: string; size?: number; wordmark?: "sm" | "md" | "lg" }) {
  return (
    <Link href={href} className="group flex items-center gap-2 rounded-lg" aria-label="SaathVerse home">
      <LogoMark size={size} title="" />
      <Wordmark size={wordmark} />
    </Link>
  );
}
