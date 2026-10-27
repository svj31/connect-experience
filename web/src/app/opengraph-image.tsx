import { ImageResponse } from "next/og";

export const alt = "Overlap: meet over something you both enjoy. Two overlapping circles, coral and teal.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "#fbf8f3", padding: 80, gap: 70 }}>
        <svg width="360" height="300" viewBox="0 0 48 40">
          <circle cx="18" cy="20" r="13" fill="#c2452d" />
          <circle cx="30" cy="20" r="13" fill="#1e6b66" />
          <path d="M24 8.47A13 13 0 0 1 24 31.53A13 13 0 0 1 24 8.47Z" fill="#1f1d1a" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", color: "#1f1d1a" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>Overlap</div>
          <div style={{ fontSize: 44, marginTop: 12, color: "#5c564e", maxWidth: 620 }}>Meet over something you both enjoy.</div>
          <div style={{ fontSize: 28, marginTop: 36, color: "#1e6b66" }}>Live games, drawing, stories and films for two</div>
        </div>
      </div>
    ),
    size,
  );
}
