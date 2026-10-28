import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { safeNext } from "@/components/AuthForms";
import { timeAgo } from "@/lib/labels";
import { ConnectFour } from "@/components/activities/ConnectFour";
import { MemoryMatch } from "@/components/activities/MemoryMatch";
import { WouldYouRather } from "@/components/activities/WouldYouRather";
import { BondExplorer, RevealDemo, VibeDemo, WyrDemo } from "@/components/landing/Playground";
import { DeepTalk } from "@/components/activities/DeepTalk";
import { ChatPanel, looksUnkind } from "@/components/room/ChatPanel";
import { BarChart } from "@/components/app/charts";
import { VibeBreakdown, VibeRing } from "@/components/app/widgets";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/ui/Field";
import { Loader } from "@/components/ui/Loader";
import { ACTIVITIES } from "@/lib/activities";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));

const noop = async () => ({ ok: true });

describe("safeNext", () => {
  it("only allows same site paths", () => {
    expect(safeNext("/app/room/ABC234", "/app")).toBe("/app/room/ABC234");
    expect(safeNext("https://evil.example", "/app")).toBe("/app");
    expect(safeNext("//evil.example", "/app")).toBe("/app");
    expect(safeNext(null, "/app")).toBe("/app");
  });
});

describe("shared UI", () => {
  it("labels planet avatars and shows presence", () => {
    render(<Avatar name="Mira" config={{ shape: "star", color: "rose", ring: "double", pattern: "spots", face: "wink" }} online />);
    expect(screen.getByRole("img", { name: "Mira's planet avatar" })).toBeInTheDocument();
    expect(screen.getByTitle("Online")).toBeInTheDocument();
  });

  it("hides decorative avatars from screen readers", () => {
    const { container } = render(<Avatar name="Ava" decorative />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    render(<Avatar name="Mira" color="plum" />);
    expect(screen.getByRole("img", { name: "Mira's planet avatar" }).querySelector("image")).toHaveAttribute("href", "/planets/plum.svg");
  });

  it("connects field errors to the input for screen readers", () => {
    render(<Field label="Email" error="Enter a valid email address" defaultValue="" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address");
  });

  it("announces loaders politely", () => {
    render(<Loader variant="stars" caption="Gathering your moments" />);
    expect(screen.getByRole("status")).toHaveTextContent("Gathering your moments");
  });

  it("describes all ten activities without em dashes", () => {
    expect(ACTIVITIES).toHaveLength(10);
    for (const a of ACTIVITIES) expect(`${a.name} ${a.short} ${a.long}`).not.toMatch(/—/);
  });
});

describe("landing demos", () => {
  it("reveals the sample partner's pick only after you choose", () => {
    render(<WyrDemo />);
    expect(screen.queryByText("Mira", { selector: "span.animate-pop" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Late night walk/ }));
    expect(screen.getByText(/Same pick/)).toBeInTheDocument();
    expect(screen.getByText("Mira", { selector: "span.animate-pop" })).toBeInTheDocument();
  });

  it("updates the Vibe preview and its reasons as interests change", () => {
    render(<VibeDemo />);
    const before = Number(screen.getByText(/^\d+$/).textContent);
    fireEvent.click(screen.getByRole("button", { name: "astronomy" }));
    fireEvent.click(screen.getByRole("button", { name: "travel" }));
    const after = Number(screen.getByText(/^\d+$/).textContent);
    expect(after).toBeGreaterThan(before);
    expect(screen.getByText(/You both love music and travel and astronomy|You both love/)).toBeInTheDocument();
  });

  it("walks through bond levels", () => {
    render(<BondExplorer />);
    fireEvent.click(screen.getByRole("tab", { name: /Galaxy/ }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Your own shared universe");
  });

  it("unlocks profile sections as the slider moves", () => {
    render(<RevealDemo />);
    expect(screen.getAllByLabelText("Hidden")).toHaveLength(2);
    fireEvent.change(screen.getByLabelText(/How close are you/), { target: { value: "3" } });
    expect(screen.queryAllByLabelText("Hidden")).toHaveLength(0);
  });
});

describe("Vibe and charts", () => {
  it("shows a question mark when there is not enough to compare", () => {
    render(<VibeRing score={null} />);
    expect(screen.getByText(/not available yet/)).toBeInTheDocument();
  });

  it("lists every part of a Vibe Match score", () => {
    render(<VibeBreakdown vibe={{ score: 82, reasons: ["Two night owls"], sharedInterests: [], parts: [{ key: "interests", label: "Shared interests", score: 100, weight: 30 }, { key: "intent", label: "Looking for", score: 60, weight: 20 }] }} />);
    expect(screen.getByText("Strong vibe")).toBeInTheDocument();
    expect(screen.getByText("Shared interests")).toBeInTheDocument();
    expect(screen.getByText("Two night owls")).toBeInTheDocument();
  });

  it("gives every chart a table for screen readers", () => {
    render(<BarChart label="Sign ups" data={[{ label: "Mon", value: 3 }, { label: "Tue", value: 5 }]} />);
    expect(screen.getByRole("table", { name: "Sign ups" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Tue 5" })).toBeInTheDocument();
  });

  it("formats relative times", () => {
    const now = Date.parse("2026-10-28T12:00:00Z");
    expect(timeAgo("2026-10-28 11:59:30", now)).toBe("just now");
    expect(timeAgo("2026-10-28 09:00:00", now)).toBe("3h ago");
    expect(timeAgo("2026-10-26 12:00:00", now)).toBe("2d ago");
  });
});

describe("chat", () => {
  const props = { messages: [], me: 1, partnerName: "Rohan", partnerTyping: false, disabled: false, onTyping: vi.fn(), onReact: vi.fn() };

  it("spots unkind words without flagging innocent ones", () => {
    expect(looksUnkind("you are stupid")).toBe(true);
    expect(looksUnkind("I studied in Sussex")).toBe(false);
  });

  it("asks for a second look before sending an unkind message", async () => {
    const onSend = vi.fn(async () => ({ tip: null }));
    render(<ChatPanel {...props} onSend={onSend} />);
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "you are stupid" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Does this feel kind?")).toBeInTheDocument();
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Send anyway" }));
    await vi.waitFor(() => expect(onSend).toHaveBeenCalledWith("you are stupid"));
  });

  it("shows the safety tip the server returns", async () => {
    render(<ChatPanel {...props} onSend={async () => ({ tip: "Tip: take your time" })} />);
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "my number is 9876543210" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Tip: take your time")).toBeInTheDocument();
  });
});

describe("activities", () => {
  const base = { me: 1, hostId: 1, partnerName: "Rohan", restart: noop };

  it("Would You Rather sends a pick and waits for the partner", () => {
    const act = vi.fn(noop);
    const game = { round: 0, total: 5, question: { id: "q", a: "Tea", b: "Coffee" }, myPick: null, partnerPicked: true, partnerPick: null, revealed: false, agreed: 0, done: false };
    render(<WouldYouRather {...base} game={game} act={act} />);
    expect(screen.getByText(/Rohan has picked/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tea/ }));
    expect(act).toHaveBeenCalledWith({ type: "pick", choice: "a" });
  });

  it("Connect Four only lets you drop on your turn", () => {
    const act = vi.fn(noop);
    const board = Array.from({ length: 6 }, () => Array(7).fill(0));
    const { rerender } = render(<ConnectFour {...base} act={act} game={{ board, turn: 2, winner: null, line: null, draw: false, wins: {}, starter: 1 }} />);
    expect(screen.getByRole("button", { name: "Drop in column 1" })).toBeDisabled();
    rerender(<ConnectFour {...base} act={act} game={{ board, turn: 1, winner: null, line: null, draw: false, wins: {}, starter: 1 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Drop in column 4" }));
    expect(act).toHaveBeenCalledWith({ type: "drop", col: 3 });
  });

  it("Deep Talk keeps the partner's answer hidden until both answer", () => {
    const act = vi.fn(noop);
    const game = { round: 0, total: 6, card: { id: "dt-01", level: 1, text: "What makes your day?" }, myAnswer: null, partnerAnswered: true, partnerAnswer: null, revealed: false, done: false };
    render(<DeepTalk {...base} game={game} act={act} />);
    expect(screen.getByText("Warm up", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText(/Rohan has answered/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "Good coffee" } });
    fireEvent.click(screen.getByRole("button", { name: "Lock in my answer" }));
    expect(act).toHaveBeenCalledWith({ type: "answer", text: "Good coffee" });
  });

  it("Memory Match hides face down cards from assistive tech too", () => {
    const cards = Array.from({ length: 16 }, (_, i) => ({ symbol: i === 0 ? "sun" : null, matched: false }));
    render(<MemoryMatch {...base} act={noop} game={{ cards, open: [0], turn: 1, moves: 0, pairs: 0, found: {}, done: false }} />);
    expect(screen.getByRole("button", { name: "Card 1: sun" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Card 2, face down" })).toBeInTheDocument();
  });
});
