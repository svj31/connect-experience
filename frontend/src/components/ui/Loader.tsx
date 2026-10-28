export type LoaderVariant = "orbit" | "hearts" | "chat" | "cards" | "stars" | "reel" | "shield" | "compass";

/** One animation per kind of wait, so a loading screen also hints at what is coming. */
function Art({ variant }: { variant: LoaderVariant }) {
  switch (variant) {
    case "hearts":
      return (
        <svg viewBox="0 0 100 100" className="ld-hearts h-full w-full" aria-hidden="true">
          <path d="M30 70c-6-6-12-10-12-16a6 6 0 0 1 12-3 6 6 0 0 1 12 3c0 6-6 10-12 16z" fill="var(--rose)" />
          <path d="M52 64c-8-8-16-13-16-21a8 8 0 0 1 16-4 8 8 0 0 1 16 4c0 8-8 13-16 21z" fill="var(--violet)" />
          <path d="M74 72c-5-5-10-8-10-13a5 5 0 0 1 10-3 5 5 0 0 1 10 3c0 5-5 8-10 13z" fill="var(--spark)" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 100 100" className="ld-chat h-full w-full" aria-hidden="true">
          <path d="M14 22h60a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H40l-16 12V64h-10a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z" fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth="3" />
          <circle cx="30" cy="43" r="5" fill="var(--violet)" />
          <circle cx="45" cy="43" r="5" fill="var(--rose)" />
          <circle cx="60" cy="43" r="5" fill="var(--spark)" />
        </svg>
      );
    case "cards":
      return (
        <svg viewBox="0 0 100 100" className="ld-cards h-full w-full" aria-hidden="true">
          <rect x="14" y="30" width="20" height="30" rx="4" fill="var(--violet)" />
          <rect x="40" y="30" width="20" height="30" rx="4" fill="var(--rose)" />
          <rect x="66" y="30" width="20" height="30" rx="4" fill="var(--lilac)" />
        </svg>
      );
    case "stars":
      return (
        <svg viewBox="0 0 100 100" className="ld-stars h-full w-full" aria-hidden="true">
          <g fill="var(--violet)">
            <circle cx="20" cy="70" r="4" />
            <circle cx="38" cy="38" r="4" />
            <circle cx="60" cy="56" r="4" />
            <circle cx="80" cy="24" r="4" />
            <circle cx="70" cy="80" r="3" />
          </g>
          <g stroke="var(--rose)" strokeWidth="2" fill="none">
            <line x1="20" y1="70" x2="38" y2="38" />
            <line x1="38" y1="38" x2="60" y2="56" />
            <line x1="60" y1="56" x2="80" y2="24" />
          </g>
        </svg>
      );
    case "reel":
      return (
        <svg viewBox="0 0 100 100" className="ld-reel h-full w-full" aria-hidden="true">
          <g className="spin">
            <circle cx="50" cy="50" r="30" fill="none" stroke="var(--violet)" strokeWidth="4" />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={50 + 17 * Math.cos((a * Math.PI) / 180)} cy={50 + 17 * Math.sin((a * Math.PI) / 180)} r="6" fill="var(--rose)" />
            ))}
          </g>
          <circle cx="50" cy="50" r="4" fill="var(--violet)" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 100 100" className="ld-shield h-full w-full" aria-hidden="true">
          <path d="M50 12 22 22v24c0 20 12 32 28 40 16-8 28-20 28-40V22z" fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth="3" />
          <rect className="scan" x="28" y="48" width="44" height="3" rx="1.5" fill="var(--rose)" />
        </svg>
      );
    case "compass":
      return (
        <svg viewBox="0 0 100 100" className="ld-compass h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r="32" fill="none" stroke="var(--line-strong)" strokeWidth="3" strokeDasharray="5 6" />
          <g className="needle">
            <path d="M50 22 57 50 50 54 43 50z" fill="var(--rose)" />
            <path d="M50 78 43 50 50 46 57 50z" fill="var(--violet)" />
          </g>
          <circle cx="50" cy="50" r="4" fill="var(--ink)" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className="ld-orbit h-full w-full" aria-hidden="true">
          <ellipse cx="50" cy="50" rx="38" ry="22" fill="none" stroke="var(--lilac)" strokeWidth="2.5" transform="rotate(-30 50 50)" strokeDasharray="5 5" />
          <ellipse cx="50" cy="50" rx="38" ry="22" fill="none" stroke="var(--line-strong)" strokeWidth="2.5" transform="rotate(30 50 50)" />
          <g className="w1"><circle cx="16" cy="38" r="6" fill="var(--violet)" /></g>
          <g className="w2"><circle cx="84" cy="62" r="6" fill="var(--rose)" /></g>
          <path className="core" d="M50 62c-7-6-14-10-14-17a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 7-7 11-14 17z" fill="var(--violet)" />
        </svg>
      );
  }
}

export function Loader({ variant = "orbit", caption, size = 96 }: { variant?: LoaderVariant; caption?: string; size?: number }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <div style={{ width: size, height: size }}>
        <Art variant={variant} />
      </div>
      <p className="text-sm font-medium text-muted">{caption ?? "Loading"}</p>
    </div>
  );
}

export function PageLoader({ variant = "orbit", caption }: { variant?: LoaderVariant; caption?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader variant={variant} caption={caption} size={120} />
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} aria-hidden="true" />;
}
