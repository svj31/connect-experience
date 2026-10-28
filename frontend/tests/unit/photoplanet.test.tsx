import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoPlanet, planetSrc } from "@/components/ui/PhotoPlanet";
import { Planet } from "@/components/ui/Planet";

describe("photo and planet", () => {
  afterEach(() => vi.useRealTimers());

  it("shows only the planet when there is no photo", () => {
    render(<PhotoPlanet planet={{ color: "mint" }} alt="Neel's planet" />);
    const planet = screen.getByRole("img", { name: "Neel's planet" });
    expect(planet.querySelector("image")).toHaveAttribute("href", "/planets/mint.svg");
  });

  it("falls back to violet for unknown colours", () => {
    expect(planetSrc("neon")).toBe("/planets/violet.svg");
  });

  it("layers face, design and moons over the planet art", () => {
    const { container, rerender } = render(<Planet config={{ color: "rose", face: "grin", pattern: "bands", ring: "none" }} />);
    expect(container.querySelectorAll("ellipse").length).toBeGreaterThan(1);
    expect(container.querySelectorAll("animateMotion")).toHaveLength(2);
    rerender(<Planet config={{ color: "rose", face: "none", ring: "single" }} />);
    expect(container.querySelectorAll("animateMotion")).toHaveLength(0);
  });

  it("flips to the planet after a moment of hover, back to the photo, and back at once on leave", () => {
    vi.useFakeTimers();
    const { container } = render(<PhotoPlanet photo="https://example.com/a.jpg" planet={{ color: "sky", spin: "wobble" }} alt="Ava" trigger="hover" />);
    const box = container.firstChild as HTMLElement;
    expect(box).not.toHaveAttribute("data-flipped");
    fireEvent.pointerEnter(box);
    act(() => void vi.advanceTimersByTime(1000));
    expect(box).toHaveAttribute("data-flipped");
    act(() => void vi.advanceTimersByTime(2900));
    expect(box).not.toHaveAttribute("data-flipped");
    act(() => void vi.advanceTimersByTime(2200));
    expect(box).toHaveAttribute("data-flipped");
    fireEvent.pointerLeave(box);
    expect(box).not.toHaveAttribute("data-flipped");
  });

  it("flips on its own when the viewer is idle", () => {
    vi.useFakeTimers();
    const { container } = render(<PhotoPlanet photo="https://example.com/a.jpg" planet={{ color: "sky" }} alt="Ava" trigger="idle" />);
    const box = container.firstChild as HTMLElement;
    act(() => void vi.advanceTimersByTime(4600));
    act(() => void vi.advanceTimersByTime(1800));
    expect(box).toHaveAttribute("data-flipped");
    act(() => void fireEvent.pointerMove(window));
    expect(box).not.toHaveAttribute("data-flipped");
  });

});
