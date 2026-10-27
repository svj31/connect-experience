import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";
import { Loader } from "@/components/ui/Loader";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join Overlap to meet people by playing, drawing, writing and watching together.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <AuthShell title="Pull up a chair" intro="No photos to upload and no profile essay. A name, an avatar you build from shapes, and you are ready to sit down at a table.">
      <Suspense fallback={<Loader caption="Preparing the form" />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
