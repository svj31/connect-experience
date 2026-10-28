import type { Metadata } from "next";
import { AdminMembers } from "@/components/admin/Members";

export const metadata: Metadata = { title: "Members" };

export default function Page() {
  return <AdminMembers />;
}
