"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";
import { buttonClass } from "../ui/Button";
import { Icon } from "../ui/Icon";

/** The one call to action on the page. Signed in visitors go straight to the lobby. */
export function PrimaryCta({ size = "lg" }: { size?: "md" | "lg" }) {
  const { user } = useSession();
  return (
    <Link href={user ? "/lobby" : "/signup"} className={buttonClass("accent", size)}>
      Start a table <Icon name="arrowRight" size={18} />
    </Link>
  );
}
