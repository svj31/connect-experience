import type { Metadata } from "next";
import { Discover } from "@/components/app/Discover";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return <Discover />;
}
