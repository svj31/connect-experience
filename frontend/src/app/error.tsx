"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto max-w-xl flex-1 px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">A star slipped out of place</h1>
      <p className="mt-3 text-lg text-muted">That page hit an error on our side. Try again, or head back home.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonClass("secondary")}>Go home</Link>
      </div>
    </main>
  );
}
