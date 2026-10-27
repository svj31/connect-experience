import type { Metadata } from "next";
import { RoomClient } from "@/components/room/RoomClient";

export const metadata: Metadata = {
  title: "Your table",
  description: "A live Overlap table for two.",
  robots: { index: false, follow: false },
};

export default async function RoomPage({ params }: PageProps<"/room/[code]">) {
  const { code } = await params;
  return <RoomClient code={code.toUpperCase()} />;
}
