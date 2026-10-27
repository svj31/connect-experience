import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { safeNext } from "@/components/AuthForms";
import { ConnectFour } from "@/components/activities/ConnectFour";
import { MemoryMatch } from "@/components/activities/MemoryMatch";
import { WouldYouRather } from "@/components/activities/WouldYouRather";
import { TableDemo } from "@/components/landing/TableDemo";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/ui/Field";
import { Loader } from "@/components/ui/Loader";
import { ACTIVITIES } from "@/lib/activities";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }));

const noop = async () => ({ ok: true });

describe("safeNext", () => {
  it("only allows same site paths", () => {
    expect(safeNext("/room/ABC234", "/lobby")).toBe("/room/ABC234");
    expect(safeNext("https://evil.example", "/lobby")).toBe("/lobby");
    expect(safeNext("//evil.example", "/lobby")).toBe("/lobby");
    expect(safeNext(null, "/lobby")).toBe("/lobby");
  });
});

describe("shared UI", () => {
  it("labels avatars and shows presence", () => {
    render(<Avatar shape="star" color="teal" name="Mira" online />);
    expect(screen.getByRole("img", { name: "Mira's avatar" })).toBeInTheDocument();
    expect(screen.getByTitle("Online")).toBeInTheDocument();
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

  it("describes all nine activities without em dashes", () => {
    expect(ACTIVITIES).toHaveLength(9);
    for (const a of ACTIVITIES) expect(`${a.name} ${a.short} ${a.long}`).not.toMatch(/—/);
  });
});

describe("landing demo", () => {
  it("reveals the example pick only after you choose", () => {
    render(<TableDemo />);
    expect(screen.queryByText("Example player", { selector: "span.animate-pop" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Late night walk/ }));
    expect(screen.getByText(/Same pick/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Handle" }));
    expect(screen.getByText("@example.player")).toBeInTheDocument();
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

  it("Memory Match hides face down cards from assistive tech too", () => {
    const cards = Array.from({ length: 16 }, (_, i) => ({ symbol: i === 0 ? "sun" : null, matched: false }));
    render(<MemoryMatch {...base} act={noop} game={{ cards, open: [0], turn: 1, moves: 0, pairs: 0, found: {}, done: false }} />);
    expect(screen.getByRole("button", { name: "Card 1: sun" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Card 2, face down" })).toBeInTheDocument();
  });
});
