import { ImageResponse } from "next/og";

export const alt = "SaathVerse: date by doing things together. A black app icon with an S drawn as one thread, cream above and saffron below.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 90, background: "#fbf9f6", color: "#161412" }}>
        <svg width="240" height="240" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="17" fill="#161412" />
          <path d="M40.66 17 A10 10 0 1 0 32 32" fill="none" stroke="#fbf9f6" strokeWidth="4.6" strokeLinecap="round" />
          <path d="M32 32 A10 10 0 1 1 23.34 47" fill="none" stroke="#f2a900" strokeWidth="4.6" strokeLinecap="round" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 108, letterSpacing: -3, fontFamily: "Georgia, serif" }}>
            saath<span style={{ color: "#5b3a8c", fontStyle: "italic" }}>verse</span>
          </div>
          <div style={{ fontSize: 44, marginTop: 12, color: "#6b645c" }}>Don&apos;t just match. Do something together.</div>
        </div>
      </div>
    ),
    size,
  );
}
