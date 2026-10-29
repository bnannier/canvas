import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { AccessibilityInfo } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Card } from "../src/molecules/card/card.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { body, descriptionSlot, imageHeader, single, titleSlot } from "../src/molecules/card/card.board.styles.ts";

const ticket = { board: true, compact: true, title: "A long title ".repeat(30), description: "A long description ".repeat(30), ticketNumber: "ARGUS-123", priorityLabel: "High", statusLabel: "In Progress", typeLabel: "Task", testID: "ticket" };
const ui = (props = {}) => render(<ThemeProvider><Card {...ticket} {...props} /></ThemeProvider>);
afterEach(cleanup);

function bodyShape(get: (id: string) => HTMLElement) {
  return [...get("ticket-text").children].map((el) => (el as HTMLElement).style.height);
}

describe("Card board anatomy", () => {
  it("keeps text slots identical for short, long, blocked and active tickets", () => {
    const baseline = ui({ title: "Short", description: "Short" });
    const shape = bodyShape(baseline.getByTestId);
    expect(shape).toEqual(["40px", "36px", "18px", "18px", "18px", "18px"]);
    expect(baseline.getByTestId("ticket-priority").textContent).toBe("High");
    expect(baseline.getByTestId("ticket-type").textContent).toBe("Task");
    expect(baseline.getByTestId("ticket-text").style.gap).toBe("6px");
    expect(baseline.getByTestId("ticket-reason").textContent).toBe("");
    expect(baseline.getByTestId("ticket-progress").textContent).toBe("");
    baseline.unmount();
    const active = ui({ blocked: true, blockedReason: "Discovery", aiActive: true });
    expect(bodyShape(active.getByTestId)).toEqual(shape);
    expect(active.getByTestId("ticket-status").textContent).toBe("Blocked by Discovery");
    expect(active.getByTestId("ticket-reason").textContent).toBe("");
    expect(active.getByTestId("ticket-progress").getAttribute("aria-hidden")).toBeNull();
  });

  it("bounds both summaries at two lines with tail truncation", () => {
    const { getByTestId } = ui();
    for (const part of ["title", "description"]) {
      const text = getByTestId(`ticket-${part}`);
      expect(text.style.getPropertyValue("-webkit-line-clamp") || (text.style as unknown as { WebkitLineClamp: string }).WebkitLineClamp).toBe("2");
      expect((text.parentElement as HTMLElement).style.overflowX).toBe("hidden");
    }
    expect(titleSlot.height).toBe(40);
    expect(descriptionSlot.height).toBe(36);
    expect(single.height).toBe(18);
    expect(body.minWidth).toBe(0);
  });

  it("keeps provided move bindings in the number row, independent of card press", () => {
    let moved = 0;
    let opened = 0;
    const { getByRole, getByTestId } = ui({ onPress: () => { opened++; }, interactiveContents: true, moveHandle: <Button accessibilityLabel="Move ticket" onPress={() => { moved++; }}>Move</Button> });
    const move = getByRole("button", { name: "Move ticket" });
    expect(getByTestId("ticket-move").contains(move)).toBe(true);
    expect(getByTestId("ticket-move").parentElement?.contains(getByTestId("ticket-number"))).toBe(true);
    fireEvent.click(move);
    expect(moved).toBe(1);
    expect(opened).toBe(0);
  });

  it("adds only the optional image header and keeps rounded top corners", () => {
    const baseline = ui();
    expect(baseline.queryByTestId("ticket-image")).toBeNull();
    const shape = bodyShape(baseline.getByTestId);
    baseline.unmount();
    const { getByTestId } = ui({ imageSource: { uri: "https://example.com/design.png", headers: { Authorization: "Bearer test" } }, imageLabel: "Current design mockup", smallCorners: true });
    expect(bodyShape(getByTestId)).toEqual(shape);
    expect(getByTestId("ticket-header").style.height).toBe(`${imageHeader.height}px`);
    expect(getByTestId("ticket-header").style.borderTopLeftRadius).toBe(getByTestId("ticket").style.borderRadius);
    expect(getByTestId("ticket-header").style.borderTopRightRadius).toBe(getByTestId("ticket").style.borderRadius);
    expect(getByTestId("ticket-header").style.overflowX).toBe("hidden");
    expect(getByTestId("ticket-image").getAttribute("aria-label")).toBe("Current design mockup");
    expect(getByTestId("ticket-header").contains(getByTestId("ticket-number"))).toBe(true);
  });

  it("collapses a failed image header and retries a replacement source", () => {
    const OriginalImage = window.Image;
    const requested: HTMLImageElement[] = [];
    // Capture the actual RNW ImageLoader's detached browser image request.
    window.Image = function Image() {
      const image = new OriginalImage();
      requested.push(image);
      return image;
    } as unknown as typeof window.Image;
    try {
      const { getByTestId, queryByTestId, rerender } = ui({ imageSource: { uri: "https://example.com/missing-board.png" } });
      const request = requested.find((image) => image.src.includes("missing-board.png"));
      expect(request).toBeDefined();
      act(() => { request!.onerror?.(new Event("error")); });
      expect(queryByTestId("ticket-image")).toBeNull();
      expect(getByTestId("ticket-header").style.height).toBe("");
      rerender(<ThemeProvider><Card {...ticket} imageSource={{ uri: "https://example.com/missing-board.png" }} /></ThemeProvider>);
      expect(queryByTestId("ticket-image")).toBeNull();
      rerender(<ThemeProvider><Card {...ticket} imageSource={{ uri: "https://example.com/new-board.png" }} /></ThemeProvider>);
      expect(getByTestId("ticket-header").style.height).toBe("176px");
      expect(queryByTestId("ticket-image")).not.toBeNull();
    } finally { window.Image = OriginalImage; }
  });

  it("uses compositor/native loop tracks for text shimmer and three dot states", async () => {
    const { getByTestId } = ui({ aiActive: true });
    await waitFor(() => expect(getByTestId("ticket-progress").querySelectorAll('[aria-busy="true"]').length).toBe(1));
    const motion = getByTestId("ticket-progress").querySelectorAll('[style*="animation-delay"]');
    expect(motion.length).toBe("AI work in progress".length + 3);
    expect(getByTestId("ticket-progress").querySelector('[aria-label="AI work in progress"]')).not.toBeNull();
  });

  it("leaves progress readable and stops shimmer and cycling under reduced motion", async () => {
    const spy = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    try {
      const { getByTestId } = ui({ aiActive: true });
      await waitFor(() => expect(getByTestId("ticket-progress").textContent).toBe("AI work in progress..."));
      expect(getByTestId("ticket-progress").querySelector('[style*="animation-delay"]')).toBeNull();
      expect(getByTestId("ticket-progress").querySelector('[role="progressbar"][aria-busy="true"]')).not.toBeNull();
    } finally { spy.mockRestore(); }
  });
});
