import type { Metadata } from "next";
import { RoomClient } from "@/components/room/RoomClient";

export const metadata: Metadata = { title: "Together", robots: { index: false } };

export default async function RoomPage({ params }: PageProps<"/app/room/[code]">) {
  const { code } = await params;
  return <RoomClient code={code.toUpperCase()} />;
}
