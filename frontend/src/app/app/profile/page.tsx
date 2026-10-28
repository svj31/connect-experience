import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileEditor } from "@/components/app/ProfileEditor";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = { title: "My profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoader variant="orbit" caption="Polishing your planet" />}>
      <ProfileEditor />
    </Suspense>
  );
}
