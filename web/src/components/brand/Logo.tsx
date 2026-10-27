/**
 * The Overlap mark: two circles, one for each person, and the lens where they meet.
 * The lens is the point of the product, so it is the darkest shape.
 * Circles of radius 13 at x=18 and x=30 intersect at (24, 12.47) and (24, 35.53).
 */
export const LENS_PATH = "M24 12.47A13 13 0 0 1 24 35.53A13 13 0 0 1 24 12.47Z";

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="18" cy="24" r="13" fill="#c2452d" />
      <circle cx="30" cy="24" r="13" fill="#1e6b66" />
      <path d={LENS_PATH} fill="#1f1d1a" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={30} />
      <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink">Overlap</span>
    </span>
  );
}
