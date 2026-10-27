import type { Metadata } from "next";
import { LobbyClient } from "@/components/LobbyClient";

export const metadata: Metadata = {
  title: "Lobby",
  description: "Open tables, Quick Match and your own tables.",
  robots: { index: false, follow: false },
};

export default function LobbyPage() {
  return <LobbyClient />;
}
