"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/consent";

/** Records a page view on each navigation. `track` does nothing without consent. */
export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    track("page_view", pathname);
  }, [pathname]);
  return null;
}
