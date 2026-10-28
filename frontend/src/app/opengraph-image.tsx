import { ImageResponse } from "next/og";

export const alt = "SaathVerse: date by doing things together. A black app icon with two worlds, cream and saffron, on crossing orbits around a heart.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 90, background: "#fbf9f6", color: "#161412" }}>
        <svg width="240" height="240" viewBox="30 -6 160 160">
          <rect x="31" y="-5" width="158" height="158" rx="42" fill="#161412" />
          <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(-32 110 76)" fill="none" stroke="#c4a8f0" strokeWidth="4.5" strokeDasharray="8 7" strokeLinecap="round" />
          <circle cx="54" cy="55" r="10" fill="#fbf9f6" />
          <ellipse cx="110" cy="76" rx="66" ry="42" transform="rotate(32 110 76)" fill="none" stroke="#8d6fd8" strokeWidth="4.5" />
          <circle cx="166" cy="97" r="10" fill="#f2a900" />
          <path d="M110 101 C99 90 76 75 76 59 C76 42 98 38 110 54 C122 38 144 42 144 59 C144 75 121 90 110 101Z" fill="#9b7be3" />
          <path d="M110 65 C103 57 93 64 100 73 L110 82 L120 73 C127 64 117 57 110 65Z" fill="#fbe9f4" />
          <path d="M110 14 L114 25 L125 29 L114 33 L110 44 L106 33 L95 29 L106 25Z" fill="#f2a900" />
          <circle cx="170" cy="36" r="4.5" fill="#f2a900" />
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
