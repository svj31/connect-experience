import Link from "next/link";
import { useId } from "react";

/**
 * The Ember mark: an app icon squircle in the brand gradient holding two hearts that overlap,
 * two people becoming "saath" (together). On hover the hearts lean in and beat (see .sv-logo).
 */
export function LogoMark({ size = 40, className = "", live = false, title = "SaathVerse" }: { size?: number; className?: string; live?: boolean; title?: string }) {
  const id = useId().replace(/:/g, "");
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
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF2E6A" />
          <stop offset="0.55" stopColor="#FF5A4E" />
          <stop offset="1" stopColor="#FF8A3D" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#g${id})`} />
      <g className="heart-a">
        <path d="M25 47c-6.5-5-13-10-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 38 30c0 7-6.5 12-13 17z" fill="#fff" opacity="0.55" />
      </g>
      <g className="heart-b">
        <path d="M39 49c-7-5.4-14-10.8-14-18.4a7.6 7.6 0 0 1 14-3.9 7.6 7.6 0 0 1 14 3.9C53 38.2 46 43.6 39 49z" fill="#fff" />
      </g>
      <circle className="spark" cx="50" cy="15" r="3" fill="#fff" />
    </svg>
  );
}

export function Wordmark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <span className={`font-display ${text} font-extrabold tracking-[-0.04em] text-ink ${className}`}>
      saath<span className="text-brand">verse</span>
    </span>
  );
}

export function Logo({ href = "/", size = 36, wordmark = "md", className = "" }: { href?: string; size?: number; wordmark?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <Link href={href} className={`group flex items-center gap-2 rounded-lg ${className}`} aria-label="SaathVerse home">
      <LogoMark size={size} title="" />
      <Wordmark size={wordmark} />
    </Link>
  );
}
