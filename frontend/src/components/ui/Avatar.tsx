import type { AvatarColor, AvatarConfig, AvatarShape } from "@/lib/types";

/** Planet colors. Each pairs a body color with a deeper shade for patterns and rings. */
export const AVATAR_HEX: Record<string, [string, string]> = {
  violet: ["#7657d6", "#5a3fb8"],
  lilac: ["#b39cf5", "#8a70e0"],
  rose: ["#e07ab8", "#b84a8e"],
  plum: ["#8e4fa8", "#6b3582"],
  peach: ["#f4a582", "#d97c58"],
  mint: ["#5cc4a4", "#3b9a7d"],
  sky: ["#6aa7ef", "#4580c9"],
  sun: ["#f2bf4f", "#cf9a25"],
  coral: ["#ee7a63", "#c8553f"],
  teal: ["#3aa5a0", "#257a76"],
  leaf: ["#7cbf5e", "#579a3c"],
  ink: ["#3d3560", "#28214a"],
};

const SHAPE_PATHS: Record<string, string> = {
  square: "M14 14h36v36H14z",
  triangle: "M32 10 54 50H10z",
  diamond: "M32 8 56 32 32 56 8 32z",
  hexagon: "M32 9 52 20.5v23L32 55 12 43.5v-23z",
  star: "M32 8l6.6 13.4 14.8 2.2-10.7 10.4 2.5 14.7L32 41.8l-13.2 6.9 2.5-14.7L10.6 23.6l14.8-2.2z",
};

function Face({ face, dark }: { face: string; dark: boolean }) {
  const c = dark ? "#ffffff" : "#211a38";
  if (face === "none") return null;
  const eyes =
    face === "wink" ? (
      <>
        <circle cx="26" cy="31" r="2.2" fill={c} />
        <path d="M35.5 31h5" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </>
    ) : face === "calm" ? (
      <>
        <path d="M23.5 31.5q2.5 -2 5 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M35.5 31.5q2.5 -2 5 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="26" cy="31" r="2.2" fill={c} />
        <circle cx="38" cy="31" r="2.2" fill={c} />
      </>
    );
  const mouth =
    face === "grin" ? <path d="M26 37q6 6 12 0z" fill={c} /> : face === "shy" ? <path d="M29 38.5q3 1.5 6 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" /> : <path d="M26.5 37q5.5 4.5 11 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />;
  return (
    <g>
      {eyes}
      {mouth}
      {(face === "shy" || face === "smile") && (
        <>
          <ellipse cx="21.5" cy="36" rx="2.6" ry="1.6" fill="#f9a8d4" opacity="0.8" />
          <ellipse cx="42.5" cy="36" rx="2.6" ry="1.6" fill="#f9a8d4" opacity="0.8" />
        </>
      )}
    </g>
  );
}

/**
 * A member's main photo in a circle. Members without a photo get a little planet they design
 * (shape, color, rings, pattern, face), so nobody has an empty grey silhouette.
 */
export function Avatar({
  shape,
  color,
  name,
  size = 40,
  online,
  config,
  decorative = false,
}: {
  shape?: AvatarShape | string;
  color?: AvatarColor | string;
  name: string;
  size?: number;
  online?: boolean | null;
  config?: Partial<AvatarConfig>;
  decorative?: boolean;
}) {
  const s = config?.shape ?? shape ?? "circle";
  const col = config?.color ?? color ?? "violet";
  const ring = config?.ring ?? "single";
  const pattern = config?.pattern ?? "plain";
  const face = config?.face ?? "smile";
  const [body, deep] = AVATAR_HEX[col] ?? AVATAR_HEX.violet;
  const darkFace = col === "ink" || col === "plum" || col === "violet";
  const clipId = `clip-${s}-${col}-${pattern}`;
  const bodyEl = s === "circle" || !SHAPE_PATHS[s] ? <circle cx="32" cy="32" r="21" /> : <path d={SHAPE_PATHS[s]} />;
  const ringTilt = ring === "tilted" ? -24 : -8;
  const dot =
    online !== undefined && online !== null ? (
      <span
        className={`absolute right-0 bottom-0 block rounded-full border-2 border-surface ${online ? "bg-mint" : "bg-line-strong"}`}
        style={{ width: Math.max(10, size / 5), height: Math.max(10, size / 5) }}
        title={online ? "Online" : "Away"}
      >
        <span className="sr-only">{online ? "Online" : "Away"}</span>
      </span>
    ) : null;

  if (config?.photo) {
    return (
      <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- member photos come from any https host or an upload */}
        <img src={config.photo} alt={decorative ? "" : `${name}'s photo`} width={size} height={size} loading="lazy" className="h-full w-full rounded-full bg-paper-deep object-cover" />
        {dot}
      </span>
    );
  }

  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : `${name}'s planet avatar`} aria-hidden={decorative || undefined}>
        <defs>
          <clipPath id={clipId}>{bodyEl}</clipPath>
        </defs>
        {ring !== "none" && (
          <ellipse cx="32" cy="34" rx="30" ry="8" fill="none" stroke={deep} strokeWidth="2.5" transform={`rotate(${ringTilt} 32 34)`} opacity="0.85" />
        )}
        <g fill={body}>{bodyEl}</g>
        <g clipPath={`url(#${clipId})`} fill={deep} opacity="0.55">
          {pattern === "bands" && (<><rect x="0" y="18" width="64" height="5" /><rect x="0" y="42" width="64" height="4" /></>)}
          {pattern === "spots" && (<><circle cx="20" cy="22" r="4" /><circle cx="44" cy="44" r="5" /><circle cx="46" cy="20" r="2.5" /></>)}
          {pattern === "swirl" && <path d="M8 26q24 -14 48 4M8 44q22 -12 48 2" stroke={deep} strokeWidth="4" fill="none" />}
          {pattern === "craters" && (<><circle cx="22" cy="44" r="4.5" /><circle cx="44" cy="22" r="3.5" /><circle cx="46" cy="46" r="2.5" /></>)}
        </g>
        {ring !== "none" && (
          <path d="M3 37.5 A30 8 0 0 0 61 30.5" fill="none" stroke={deep} strokeWidth="2.5" transform={`rotate(${ringTilt} 32 34)`} opacity="0.85" />
        )}
        {ring === "double" && <ellipse cx="32" cy="34" rx="25" ry="5.5" fill="none" stroke={body} strokeWidth="1.5" transform={`rotate(${ringTilt} 32 34)`} opacity="0.7" />}
        <Face face={face} dark={darkFace} />
      </svg>
      {dot}
    </span>
  );
}
