"use client";

import dynamic from "next/dynamic";
import { LogoMark } from "../brand/Logo";

const HeroScene = dynamic(() => import("../three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <LogoMark size={260} live title="" />
    </div>
  ),
});

export function HeroCanvas() {
  return (
    <div className="relative h-[340px] w-full sm:h-[460px]" role="img" aria-label="Two small worlds orbiting a violet heart, the SaathVerse logo in 3D">
      <HeroScene />
    </div>
  );
}
