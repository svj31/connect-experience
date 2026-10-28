const COLORS = ["var(--violet)", "var(--rose)", "var(--spark)", "var(--lilac)", "var(--sun)"];

/** A ring of small sparks and hearts flying outwards. Purely decorative. */
export function Burst({ count = 18, distance = 120, className = "" }: { count?: number; distance?: number; className?: string }) {
  return (
    <div className={`burst pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const heart = i % 3 === 0;
        return (
          <span
            key={i}
            style={{ ["--r" as string]: `${(360 / count) * i}deg`, ["--d" as string]: `${distance * (0.7 + ((i * 7) % 5) / 10)}px`, animationDelay: `${(i % 4) * 40}ms` }}
          >
            <svg viewBox="0 0 24 24" width="12" height="12" fill={COLORS[i % COLORS.length]}>
              {heart ? <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z" /> : <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />}
            </svg>
          </span>
        );
      })}
    </div>
  );
}
