import type { Metadata } from "next";
import { AdminProfile } from "@/components/admin/Audit";

export const metadata: Metadata = { title: "My profile" };

export default function Page() {
  return <AdminProfile />;
}
