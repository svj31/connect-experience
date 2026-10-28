import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/Overview";

export const metadata: Metadata = { title: "Overview" };

export default function AdminPage() {
  return <AdminOverview />;
}
