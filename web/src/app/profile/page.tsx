import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileClient } from "@/components/ProfileClient";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Build your avatar and choose what you share.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageLoader variant="draw" caption="Sketching your avatar" />}>
      <ProfileClient />
    </Suspense>
  );
}
