import type { Metadata } from "next";
import { Moments } from "@/components/app/Moments";

export const metadata: Metadata = { title: "Moments" };

export default function MomentsPage() {
  return <Moments />;
}
