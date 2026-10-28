import { ImageResponse } from "next/og";

export const alt = "SaathVerse: two worlds, one connection. Two orbits around a violet heart with a pink spark.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 80, background: "#fbf8ff", color: "#211a38" }}>
        <svg width="360" height="246" viewBox="0 0 220 150">
          <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(-32 110 76)" fill="none" stroke="#9B83E8" strokeWidth="3.5" strokeDasharray="7 6" />
          <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(32 110 76)" fill="none" stroke="#C5B3F8" strokeWidth="3.5" />
          <circle cx="54" cy="55" r="8" fill="#7657D6" />
          <circle cx="166" cy="97" r="8" fill="#7657D6" />
          <path d="M110 99 C99 88 78 74 78 59 C78 43 98 39 110 55 C122 39 142 43 142 59 C142 74 121 88 110 99Z" fill="#7657D6" />
          <path d="M110 65 C103 57 93 64 100 73 L110 82 L120 73 C127 64 117 57 110 65Z" fill="#F9D9F0" />
          <path d="M110 20 L114 30 L125 34 L114 38 L110 49 L106 38 L95 34 L106 30Z" fill="#E5A2D5" />
          <circle cx="170" cy="39" r="4" fill="#E5A2D5" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
            Saath<span style={{ color: "#6343cc" }}>Verse</span>
          </div>
          <div style={{ fontSize: 40, marginTop: 12, color: "#5d5476" }}>Two worlds. One connection.</div>
          <div style={{ fontSize: 28, marginTop: 28, color: "#b4327a" }}>Play, talk, create and watch together.</div>
        </div>
      </div>
    ),
    size,
  );
}
