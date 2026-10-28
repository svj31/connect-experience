import type { CSSProperties, ReactNode } from "react";
import type { AvatarConfig } from "@/lib/types";

/**
 * A member's planet: the animated artwork from design_components (one file per colour in
 * public/planets) with options layered on top, so planets can differ in more than colour.
 * Coordinates match the planet files' viewBox; the body is a circle at (1019, 1101), r 288.
 * Stored option values are the original avatar enums; LABELS gives their names in the UI.
 */
const VIEW = { x: 455, y: 530, size: 1140 };
const C = { x: 1019, y: 1101, r: 288 };
const PIVOT = "1025 1100";

export const PLANET_COLORS = ["violet", "lilac", "rose", "plum", "peach", "mint", "sky", "sun", "coral", "teal", "leaf", "ink"];
export const planetSrc = (color?: string | null) => `/planets/${color && PLANET_COLORS.includes(color) ? color : "violet"}.svg`;

export const PLANET_LABELS = {
  shape: { circle: "Classic", square: "Wide", triangle: "Tilted", diamond: "Upright", hexagon: "Little", star: "Giant" },
  pattern: { plain: "Original", bands: "Bands", spots: "Spots", swirl: "Swirl", craters: "Craters" },
  face: { smile: "Smile", grin: "Grin", wink: "Wink", calm: "Calm", shy: "Shy", none: "No face" },
  ring: { single: "Classic ring", double: "Double ring", tilted: "Tilted ring", none: "Moons" },
  spin: { steady: "Steady", wobble: "Wobble", float: "Float", turn: "Slow turn", breathe: "Breathe" },
} as const;

/** How the whole planet moves, on top of its own rotating surface. SVG animation, no CSS needed. */
function Spin({ kind, children }: { kind: string; children: ReactNode }) {
  const ease = { calcMode: "spline", keyTimes: "0;0.5;1", keySplines: "0.45 0 0.55 1;0.45 0 0.55 1" } as const;
  if (kind === "wobble")
    return <g><animateTransform attributeName="transform" type="rotate" values={`-7 ${PIVOT};7 ${PIVOT};-7 ${PIVOT}`} dur="3.4s" repeatCount="indefinite" {...ease} />{children}</g>;
  if (kind === "float")
    return <g><animateTransform attributeName="transform" type="translate" values="0 -22;0 22;0 -22" dur="4.2s" repeatCount="indefinite" {...ease} />{children}</g>;
  if (kind === "turn")
    return <g><animateTransform attributeName="transform" type="rotate" values={`0 ${PIVOT};360 ${PIVOT}`} dur="26s" repeatCount="indefinite" />{children}</g>;
  if (kind === "breathe")
    return (
      <g transform="translate(1025 1100)">
        <g><animateTransform attributeName="transform" type="scale" values="0.94;1.04;0.94" dur="3.8s" repeatCount="indefinite" {...ease} />
          <g transform="translate(-1025 -1100)">{children}</g>
        </g>
      </g>
    );
  return <>{children}</>;
}

const SHAPE: Record<string, string> = {
  circle: "",
  square: `translate(1025 1100) scale(1.12 0.9) translate(-1025 -1100)`,
  triangle: `rotate(-22 ${PIVOT})`,
  diamond: `rotate(18 ${PIVOT})`,
  hexagon: `translate(1025 1100) scale(0.8) translate(-1025 -1100)`,
  star: `translate(1025 1100) scale(1.12) translate(-1025 -1100)`,
};

/** Overlays live on the upper planet only, above the ring that crosses its lower half. */
const UPPER = `M${C.x - C.r - 20} ${C.y - C.r - 20} H${C.x + C.r + 20} V1040 L${C.x - C.r - 20} 1215 Z`;

function Pattern({ kind }: { kind: string }) {
  const ink = "rgb(0 0 0 / 0.32)";
  const light = "rgb(255 255 255 / 0.42)";
  const drift = <animateTransform attributeName="transform" type="translate" values="-26 0; 26 0; -26 0" dur="7s" repeatCount="indefinite" />;
  if (kind === "bands")
    return <g>{drift}<path d="M600 900 C800 860 1200 860 1420 900 L1420 960 C1200 920 800 920 600 960 Z" fill={ink} /><path d="M600 1010 C800 975 1200 975 1420 1010 L1420 1050 C1200 1015 800 1015 600 1050 Z" fill={light} /></g>;
  if (kind === "spots")
    return <g>{drift}{[[850, 900, 26], [1130, 880, 18], [960, 960, 14], [1200, 990, 24], [800, 1040, 16], [1080, 1030, 12]].map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={light} />)}</g>;
  if (kind === "swirl")
    return <g fill="none" stroke={light} strokeWidth="18" strokeLinecap="round">{drift}<path d="M760 930 C860 870 960 990 1060 930 S1240 880 1300 940" /><path d="M740 1030 C840 980 940 1080 1040 1020" /></g>;
  if (kind === "craters")
    return <g fill={ink} stroke={light} strokeWidth="6">{drift}<circle cx="880" cy="930" r="34" /><circle cx="1180" cy="960" r="24" /><circle cx="1010" cy="870" r="16" /></g>;
  return null;
}

function Face({ kind }: { kind: string }) {
  if (kind === "none") return null;
  const ink = "#1a0f0a";
  const Y = 1028;
  const blink = <animate attributeName="ry" values="26;26;3;26;26" keyTimes="0;0.9;0.94;0.98;1" dur="4.6s" repeatCount="indefinite" />;
  const eye = (x: number, closed = false) =>
    closed ? (
      <path d={`M${x - 26} ${Y} Q${x} ${Y + 22} ${x + 26} ${Y}`} fill="none" stroke={ink} strokeWidth="11" strokeLinecap="round" />
    ) : (
      <g>
        <ellipse cx={x} cy={Y} rx="20" ry="26" fill={ink}>{blink}</ellipse>
        <circle cx={x + 7} cy={Y - 9} r="7" fill="#fff" />
      </g>
    );
  const m = 1088;
  const mouth = {
    smile: <path d={`M972 ${m - 6} Q1019 ${m + 30} 1066 ${m - 6}`} fill="none" stroke={ink} strokeWidth="12" strokeLinecap="round" />,
    grin: <path d={`M962 ${m - 12} Q1019 ${m + 60} 1076 ${m - 12} Z`} fill={ink} />,
    wink: <path d={`M975 ${m - 4} Q1019 ${m + 24} 1063 ${m - 4}`} fill="none" stroke={ink} strokeWidth="12" strokeLinecap="round" />,
    calm: <path d={`M985 ${m} H1053`} stroke={ink} strokeWidth="12" strokeLinecap="round" />,
    shy: <path d={`M990 ${m} Q1019 ${m + 16} 1048 ${m}`} fill="none" stroke={ink} strokeWidth="11" strokeLinecap="round" />,
  }[kind as "smile"];
  return (
    <g>
      {eye(955, kind === "calm")}
      {eye(1083, kind === "wink" || kind === "calm")}
      {(kind === "shy" || kind === "smile") && (
        <g fill="#ff8fa3" opacity="0.6">
          <ellipse cx="912" cy={Y + 48} rx="34" ry="18" />
          <ellipse cx="1126" cy={Y + 48} rx="34" ry="18" />
        </g>
      )}
      {mouth}
    </g>
  );
}

export function Planet({ config, size, title, className = "", style }: { config?: Partial<AvatarConfig>; size?: number | string; title?: string; className?: string; style?: CSSProperties }) {
  const shape = config?.shape ?? "circle";
  const pattern = config?.pattern ?? "plain";
  const face = config?.face ?? "smile";
  const ring = config?.ring ?? "single";
  const clip = `pl-upper-${shape}`;
  const tilt = ring === "tilted" ? `rotate(-14 ${PIVOT})` : "";
  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.size} ${VIEW.size}`}
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={style}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx={C.x} cy={C.y} r={C.r - 6} />
        </clipPath>
        <clipPath id={`${clip}-top`}>
          <path d={UPPER} />
        </clipPath>
      </defs>
      <Spin kind={config?.spin ?? "steady"}>
      <g transform={`${SHAPE[shape] ?? ""} ${tilt}`}>
        {ring === "double" && <ellipse cx="1025" cy="1110" rx="560" ry="170" transform={`rotate(-17 ${PIVOT})`} fill="none" stroke="#ffce3f" strokeWidth="14" opacity="0.75" />}
        <image href={planetSrc(config?.color)} x={VIEW.x} y={VIEW.y} width={VIEW.size} height={VIEW.size} />
        <g clipPath={`url(#${clip}-top)`}>
          <g clipPath={`url(#${clip})`}>
            <Pattern kind={pattern} />
          </g>
          <Face kind={face} />
        </g>
        {ring === "none" &&
          [0, 1].map((i) => (
            <circle key={i} r={i ? 26 : 38} fill={i ? "#c892ff" : "#f2a900"} stroke="#fff" strokeWidth="8">
              <animateMotion dur={i ? "6s" : "9s"} repeatCount="indefinite" begin={i ? "-3s" : "0s"} path="M1025 960 A420 140 0 1 1 1024.9 960" />
            </circle>
          ))}
      </g>
      </Spin>
    </svg>
  );
}
