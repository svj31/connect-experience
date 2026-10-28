import type { Metadata } from "next";
import { Suspense } from "react";
import { Together } from "@/components/app/Together";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = { title: "Together" };

export default function TogetherPage() {
  return (
    <Suspense fallback={<PageLoader variant="cards" caption="Setting out the games" />}>
      <Together />
    </Suspense>
  );
}
