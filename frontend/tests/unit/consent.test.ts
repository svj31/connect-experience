import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readConsent, track, writeConsent } from "@/lib/consent";

describe("analytics consent", () => {
  const beacon = vi.fn(() => true);

  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
    beacon.mockClear();
  });
  afterEach(() => window.localStorage.clear());

  it("sends nothing before the visitor chooses", () => {
    expect(readConsent()).toBeNull();
    track("page_view", "/");
    expect(beacon).not.toHaveBeenCalled();
  });

  it("sends nothing after the visitor declines", () => {
    writeConsent("declined");
    track("page_view", "/");
    expect(beacon).not.toHaveBeenCalled();
  });

  it("sends only the event name and a path with room codes removed after accepting", async () => {
    writeConsent("accepted");
    track("room_open", "/room/K7MQ2X");
    expect(beacon).toHaveBeenCalledOnce();
    const [url, blob] = beacon.mock.calls[0] as unknown as [string, Blob];
    expect(url).toBe("/api/analytics");
    expect(JSON.parse(await blob.text())).toEqual({ name: "room_open", path: "/room/:code" });
  });

  it("notifies listeners when the choice changes", () => {
    const listener = vi.fn();
    window.addEventListener("sv-consent-change", listener);
    writeConsent("accepted");
    expect(listener).toHaveBeenCalled();
    window.removeEventListener("sv-consent-change", listener);
  });
});
