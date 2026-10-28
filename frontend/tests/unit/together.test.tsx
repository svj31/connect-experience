import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LogoMark } from "@/components/brand/Logo";
import { LivePlans } from "@/components/app/LivePlans";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/live", () => ({ useLive: () => ({ socket: null, toast: vi.fn() }) }));

const avatar = { photo: null, shape: "circle", color: "rose", ring: "single", pattern: "plain", face: "smile", spin: "steady" };
const calls: string[] = [];
let live = {
  received: [{ id: 1, activity: "wyr", status: "pending", role: "guest", roomCode: "ABC234", createdAt: "2026-10-28 10:00:00", respondedAt: null, person: { id: 2, displayName: "Mira", avatar, online: true } }],
  sent: [{ id: 2, activity: "draw", status: "declined", role: "host", roomCode: "XYZ789", createdAt: "2026-10-28 10:00:00", respondedAt: null, person: { id: 3, displayName: "Rohan", avatar, online: false } }],
  tables: [],
};
vi.mock("@/lib/api", () => ({
  errorMessage: (e: Error) => e.message,
  api: vi.fn(async (path: string) => {
    calls.push(path);
    if (path === "/together/live") return live;
    if (path.endsWith("/decline")) live = { ...live, received: [] };
    return { ok: true };
  }),
}));

describe("Live in Together", () => {
  it("lets the invited person decline, and shows the host a decline", async () => {
    render(<LivePlans />);
    expect(await screen.findByText(/wants to play/)).toHaveTextContent("Mira wants to play Would You Rather");
    expect(screen.getByText("Rohan can't right now")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    await waitFor(() => expect(calls).toContain("/together/1/decline"));
    await waitFor(() => expect(screen.queryByText(/wants to play/)).not.toBeInTheDocument());
  });
});

describe("logo", () => {
  it("draws two worlds and a heart, labelled or hidden", () => {
    const { container, rerender } = render(<LogoMark />);
    expect(screen.getByRole("img", { name: "SaathVerse" })).toBeInTheDocument();
    expect(container.querySelectorAll(".orbit-a, .orbit-b, .heart")).toHaveLength(3);
    rerender(<LogoMark title="" live />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("svg")).toHaveClass("is-live");
  });
});
