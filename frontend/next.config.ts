import type { NextConfig } from "next";

// Server side only. The browser never sees this value; it calls /api on our own origin.
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:4000";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // A separate build folder lets end to end runs build without touching a running app.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Addresses from the first version of the app keep working.
  async redirects() {
    return [
      { source: "/lobby", destination: "/app/together", permanent: true },
      { source: "/profile", destination: "/app/profile", permanent: true },
      { source: "/moments", destination: "/app/moments", permanent: true },
      { source: "/room/:code", destination: "/app/room/:code", permanent: true },
    ];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
