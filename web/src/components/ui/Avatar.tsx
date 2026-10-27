import type { AvatarColor, AvatarShape } from "@/lib/types";

export const AVATAR_HEX: Record<AvatarColor, string> = {
  coral: "#c2452d",
  teal: "#1e6b66",
  sun: "#d99a1e",
  ink: "#1f1d1a",
  leaf: "#3d7a3a",
  sky: "#2f5f9e",
};

const SHAPES: Record<AvatarShape, string> = {
  circle: "M24 6a18 18 0 1 1 0 36a18 18 0 1 1 0-36z",
  square: "M8 8h32v32H8z",
  triangle: "M24 6 43 40H5z",
  diamond: "M24 4 44 24 24 44 4 24z",
  hexagon: "M24 4 41 14v20L24 44 7 34V14z",
  star: "M24 4l5.9 12 13.1 1.9-9.5 9.3 2.2 13.1L24 34.1l-11.7 6.2 2.2-13.1L5 17.9 18.1 16z",
};

/**
 * Overlap avatars are generated marks, never photos. Faces are revealed in
 * conversation, not judged in a grid. The initial makes people easy to tell apart.
 */
export function Avatar({
  shape,
  color,
  name,
  size = 40,
  online,
}: {
  shape: AvatarShape;
  color: AvatarColor;
  name: string;
  size?: number;
  online?: boolean;
}) {
  const fill = AVATAR_HEX[color] ?? AVATAR_HEX.coral;
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={`${name}'s avatar`}>
        <rect width="48" height="48" rx="10" fill="#fff" stroke="#e6dfd4" />
        <path d={SHAPES[shape] ?? SHAPES.circle} fill={fill} transform="translate(4.8 4.8) scale(0.8)" />
        <text x="24" y="29.5" textAnchor="middle" fontSize="15" fontWeight="700" fill={color === "sun" ? "#1f1d1a" : "#fff"} fontFamily="system-ui, sans-serif">
          {initial}
        </text>
      </svg>
      {online !== undefined && (
        <span
          className={`absolute -right-0.5 -bottom-0.5 block h-3 w-3 rounded-full border-2 border-white ${online ? "bg-leaf" : "bg-line-strong"}`}
          title={online ? "Online" : "Away"}
        />
      )}
    </span>
  );
}
