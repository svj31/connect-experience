export type Consent = "accepted" | "declined";

const KEY = "sv_consent";
const EVENT = "sv-consent-change";

export function readConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Consent) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage can be blocked. The banner will show again next visit, which is the safe default.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function onConsentChange(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/**
 * First party, cookieless analytics. Sends only an event name and the path,
 * never personal data, and only after the visitor accepts.
 */
export function track(name: string, path = window.location.pathname) {
  if (readConsent() !== "accepted") return;
  const safePath = path.replace(/\/room\/[A-Z0-9]+/i, "/room/:code").slice(0, 200);
  const body = JSON.stringify({ name, path: safePath });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
  } else {
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
  }
}
