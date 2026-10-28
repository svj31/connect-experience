import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/AuthForms";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = { title: "Create your account", description: "Create a free SaathVerse account and design your planet. 18+ only." };

export default function SignupPage() {
  return (
    <Suspense fallback={<PageLoader variant="orbit" caption="Preparing your planet" />}>
      <SignupForm />
    </Suspense>
  );
}
