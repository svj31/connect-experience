import Link from "next/link";

/**
 * The Saath mark: an "S" drawn as one thread in two halves, cream above and saffron below,
 * meeting in the middle: two stories becoming one. On hover the thread redraws itself, top half
 * first and then the saffron half (.sv-logo in globals.css).
 */
export function LogoMark({ size = 40, className = "", live = false, title = "SaathVerse" }: { size?: number; className?: string; live?: boolean; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={`sv-logo shrink-0 ${live ? "is-live" : ""} ${className}`}
    >
      <rect x="0.5" y="0.5" width="63" height="63" rx="17" fill="#161412" stroke="var(--line-strong, #3d3934)" />
      <path className="thread-a" pathLength={1} d="M40.66 17 A10 10 0 1 0 32 32" fill="none" stroke="#fbf9f6" strokeWidth="4.6" strokeLinecap="round" />
      <path className="thread-b" pathLength={1} d="M32 32 A10 10 0 1 1 23.34 47" fill="none" stroke="#f2a900" strokeWidth="4.6" strokeLinecap="round" />
      <circle className="knot" cx="32" cy="32" r="1.6" fill="#161412" />
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
