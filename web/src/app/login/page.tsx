import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";
import { AuthShell } from "@/components/AuthShell";
import { Loader } from "@/components/ui/Loader";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Overlap and get back to your tables.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" intro="Your tables, moments and constellations are where you left them.">
      <Suspense fallback={<Loader caption="Preparing the form" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
