"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onConsentChange, readConsent, track, writeConsent } from "@/lib/consent";
import { buttonClass } from "./ui/Button";

/**
 * Asks before any analytics run. Essential storage (the sign in cookie) does not need consent;
 * everything else waits for "Accept".
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === null);
    sync();
    return onConsentChange(sync);
  }, []);

  if (!visible) return null;

  function choose(value: "accepted" | "declined") {
    writeConsent(value);
    if (value === "accepted") track("page_view");
  }

  return (
    <section
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl animate-rise rounded-lg border border-line-strong bg-surface p-4 shadow-[0_8px_30px_rgba(31,29,26,0.12)] sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <h2 className="font-display text-lg font-semibold">Cookies and analytics</h2>
      <p className="mt-1 text-sm text-muted">
        We use one essential cookie to keep you signed in. With your permission we also count page visits,
        without names or emails, to see which activities people enjoy. Read the{" "}
        <Link href="/privacy#cookies" className="font-semibold text-teal underline underline-offset-2">privacy policy</Link>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={buttonClass("primary", "sm")} onClick={() => choose("accepted")}>Accept analytics</button>
        <button className={buttonClass("secondary", "sm")} onClick={() => choose("declined")}>Essential only</button>
      </div>
    </section>
  );
}

/** Re-opens the consent choice, for the privacy page. */
export function CookieSettingsButton() {
  return (
    <button
      className={buttonClass("secondary", "sm")}
      onClick={() => {
        try {
          window.localStorage.removeItem("ovl_consent");
        } catch {
          // ignore
        }
        window.dispatchEvent(new Event("ovl-consent-change"));
      }}
    >
      Change cookie choice
    </button>
  );
}
