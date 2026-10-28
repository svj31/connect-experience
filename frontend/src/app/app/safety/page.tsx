import type { Metadata } from "next";
import { SafetyCentre } from "@/components/app/SafetyCentre";

export const metadata: Metadata = { title: "Safety centre" };

export default function SafetyPage() {
  return <SafetyCentre />;
}
