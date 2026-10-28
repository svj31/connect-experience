import type { Metadata } from "next";
import { Suspense } from "react";
import { Connections } from "@/components/app/Connections";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = { title: "Connections" };

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<PageLoader variant="hearts" caption="Gathering your people" />}>
      <Connections />
    </Suspense>
  );
}
