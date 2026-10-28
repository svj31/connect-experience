import Link from "next/link";

/**
 * The Saath mark: two worlds on crossing orbits, cream and saffron, with a heart where the paths
 * meet, on the ink tile. On hover the orbits swing round in opposite directions, the heart beats
 * and the spark twinkles (.sv-logo in globals.css). Drawn in one coordinate space so every part
 * can turn about the same centre.
 */
export function LogoMark({ size = 40, className = "", live = false, title = "SaathVerse" }: { size?: number; className?: string; live?: boolean; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="30 -6 160 160"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={`sv-logo shrink-0 ${live ? "is-live" : ""} ${className}`}
    >
      <rect x="31" y="-5" width="158" height="158" rx="42" fill="#161412" stroke="var(--line-strong, #3d3934)" strokeWidth="2" />
      <g className="orbit-a">
        <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(-32 110 76)" fill="none" stroke="#c4a8f0" strokeWidth="4.5" strokeDasharray="8 7" strokeLinecap="round" />
        <circle cx="54" cy="55" r="10" fill="#fbf9f6" />
      </g>
      <g className="orbit-b">
        <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(32 110 76)" fill="none" stroke="#8d6fd8" strokeWidth="4.5" />
        <circle cx="166" cy="97" r="10" fill="#f2a900" />
      </g>
      <g className="heart">
        <path d="M110 101 C99 90 76 75 76 59 C76 42 98 38 110 54 C122 38 144 42 144 59 C144 75 121 90 110 101Z" fill="#9b7be3" />
        <path d="M110 65 C103 57 93 64 100 73 L110 82 L120 73 C127 64 117 57 110 65Z" fill="#fbe9f4" />
      </g>
      <path className="spark" d="M110 14 L114 25 L125 29 L114 33 L110 44 L106 33 L95 29 L106 25Z" fill="#f2a900" />
      <circle className="spark-dot" cx="170" cy="36" r="4.5" fill="#f2a900" />
    </svg>
  );
}

export function Wordmark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const text = size === "lg" ? "text-4xl" : size === "sm" ? "text-2xl" : "text-[1.7rem]";
  return (
    <span className={`font-display ${text} leading-none text-ink ${className}`}>
      saath<span className="italic text-violet">verse</span>
    </span>
  );
}

export function Logo({ href = "/", size = 34, wordmark = "md", className = "" }: { href?: string; size?: number; wordmark?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <Link href={href} className={`group flex items-center gap-2 rounded-lg ${className}`} aria-label="SaathVerse home">
      <LogoMark size={size} title="" />
      <Wordmark size={wordmark} />
    </Link>
  );
}
