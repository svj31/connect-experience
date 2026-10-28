import type { Metadata } from "next";
import { Standouts } from "@/components/app/Standouts";

export const metadata: Metadata = { title: "Standouts" };

export default function StandoutsPage() {
  return <Standouts />;
}
