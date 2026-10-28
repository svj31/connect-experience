import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to SaathVerse as a member or as an admin." };

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader variant="hearts" caption="Opening the door" />}>
      <LoginForm />
    </Suspense>
  );
}
