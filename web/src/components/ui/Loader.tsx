/**
 * Loading states, one per kind of page, all drawn from the logo: two circles,
 * stars, cards and a pen line. Each comes with a short, specific caption.
 */
type Variant = "merge" | "orbit" | "stars" | "cards" | "draw";

function Art({ variant }: { variant: Variant }) {
  if (variant === "orbit") {
    return (
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r="26" fill="none" stroke="#e6dfd4" strokeWidth="2" strokeDasharray="4 6" />
        <g className="ovl-orbit">
          <circle cx="44" cy="18" r="9" fill="#c2452d" />
          <circle cx="44" cy="70" r="9" fill="#1e6b66" />
        </g>
        <circle cx="44" cy="44" r="5" fill="#1f1d1a" />
      </svg>
    );
  }
  if (variant === "stars") {
    return (
      <svg width="96" height="72" viewBox="0 0 96 72" className="ovl-twinkle" aria-hidden="true">
        <line x1="12" y1="54" x2="34" y2="22" stroke="#1e6b66" strokeWidth="1.5" />
        <line x1="34" y1="22" x2="58" y2="40" stroke="#1e6b66" strokeWidth="1.5" />
        <line x1="58" y1="40" x2="84" y2="14" stroke="#c2452d" strokeWidth="1.5" />
        <circle cx="12" cy="54" r="4" fill="#c2452d" />
        <circle cx="34" cy="22" r="4" fill="#1e6b66" />
        <circle cx="58" cy="40" r="4" fill="#c2452d" />
        <circle cx="84" cy="14" r="4" fill="#1e6b66" />
        <circle cx="70" cy="60" r="2.5" fill="#d99a1e" />
      </svg>
    );
  }
  if (variant === "cards") {
    return (
      <svg width="96" height="64" viewBox="0 0 96 64" className="ovl-cards" aria-hidden="true">
        <rect x="6" y="10" width="24" height="40" rx="4" fill="#c2452d" />
        <rect x="36" y="10" width="24" height="40" rx="4" fill="#1f1d1a" />
        <rect x="66" y="10" width="24" height="40" rx="4" fill="#1e6b66" />
      </svg>
    );
  }
  if (variant === "draw") {
    return (
      <svg width="96" height="64" viewBox="0 0 96 64" className="ovl-draw" aria-hidden="true">
        <path d="M8 44c12-26 24-26 30-6s20 20 30-4 16-8 20 0" fill="none" stroke="#c2452d" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="96" height="64" viewBox="0 0 96 64" className="ovl-loader" aria-hidden="true">
      <defs>
        <clipPath id="ovl-loader-clip">
          <circle className="c1" cx="38" cy="32" r="20" />
        </clipPath>
      </defs>
      <circle className="c1" cx="38" cy="32" r="20" fill="#c2452d" />
      <circle className="c2" cx="58" cy="32" r="20" fill="#1e6b66" />
      <g clipPath="url(#ovl-loader-clip)">
        <circle className="c2 lens" cx="58" cy="32" r="20" fill="#1f1d1a" />
      </g>
    </svg>
  );
}

export function Loader({ variant = "merge", caption = "Loading" }: { variant?: Variant; caption?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Art variant={variant} />
      <p className="text-sm font-medium text-muted">{caption}</p>
    </div>
  );
}

export function PageLoader(props: { variant?: Variant; caption?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader {...props} />
    </div>
  );
}
