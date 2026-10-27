import type { Metadata } from "next";
import { MomentsClient } from "@/components/MomentsClient";

export const metadata: Metadata = {
  title: "Moments",
  description: "Drawings, constellations and stories you made with others.",
  robots: { index: false, follow: false },
};

export default function MomentsPage() {
  return <MomentsClient />;
}
