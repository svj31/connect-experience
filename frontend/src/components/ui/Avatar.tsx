import type { AvatarColor, AvatarConfig, AvatarShape } from "@/lib/types";
import { Planet } from "./Planet";

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

/**
 * A member's main photo in a circle. Members without a photo get their animated planet in the
 * colour they chose, so nobody has an empty grey silhouette.
 */
export function Avatar({
  color,
  name,
  size = 40,
  online,
  config,
  decorative = false,
}: {
  /** Kept for older callers; the planet's look now comes from its colour only. */
  shape?: AvatarShape | string;
  color?: AvatarColor | string;
  name: string;
  size?: number;
  online?: boolean | null;
  config?: Partial<AvatarConfig>;
  decorative?: boolean;
}) {
  const col = config?.color ?? color ?? "violet";
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

  // No photo: the member's animated planet with their chosen colour, shape, design, face and ring.
  return (
    <span className="relative inline-block shrink-0 rounded-full bg-paper-deep" style={{ width: size, height: size }}>
      <Planet config={{ ...config, color: col as AvatarConfig["color"] }} size={size} title={decorative ? undefined : `${name}'s planet avatar`} className="scale-[1.08]" />
      {dot}
    </span>
  );
}
