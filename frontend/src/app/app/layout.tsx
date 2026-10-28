import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { LiveProvider } from "@/lib/live";

export const metadata: Metadata = { robots: { index: false } };

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiveProvider>
      <AppShell>{children}</AppShell>
    </LiveProvider>
  );
}
