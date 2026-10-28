import { ImageResponse } from "next/og";

export const alt = "SaathVerse: date by doing things together. A rose to orange app icon with two overlapping white hearts.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 90, background: "#09090c", color: "#ffffff" }}>
        <svg width="260" height="260" viewBox="0 0 64 64">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FF2E6A" />
              <stop offset="0.55" stopColor="#FF5A4E" />
              <stop offset="1" stopColor="#FF8A3D" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="18" fill="url(#g)" />
          <path d="M25 47c-6.5-5-13-10-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 38 30c0 7-6.5 12-13 17z" fill="#fff" opacity="0.55" />
          <path d="M39 49c-7-5.4-14-10.8-14-18.4a7.6 7.6 0 0 1 14-3.9 7.6 7.6 0 0 1 14 3.9C53 38.2 46 43.6 39 49z" fill="#fff" />
          <circle cx="50" cy="15" r="3" fill="#fff" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, letterSpacing: -4 }}>
            saath<span style={{ color: "#ff5a4e" }}>verse</span>
          </div>
          <div style={{ fontSize: 44, marginTop: 12, color: "#d4d4dc" }}>Don&apos;t just match. Do something together.</div>
        </div>
      </div>
    ),
    size,
  );
}
