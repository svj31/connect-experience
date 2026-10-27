"use client";

import dynamic from "next/dynamic";
import { LogoMark } from "../brand/Logo";

// three.js only runs in the browser. Until it loads, the flat logo holds the space.
const HeroScene = dynamic(() => import("../three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <LogoMark size={180} className="opacity-90" />
    </div>
  ),
});

export function HeroCanvas() {
  return (
    <div className="h-full w-full" role="img" aria-label="Two spheres, coral and teal, drifting together until they overlap">
      <HeroScene />
    </div>
  );
}
