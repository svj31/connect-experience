import type { Metadata } from "next";
import { AdminReports } from "@/components/admin/Reports";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <AdminReports />;
}
