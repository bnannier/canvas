import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { AccessibilityInfo } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Card } from "../src/molecules/card/card.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { badgeSlot, body, descriptionSlot, imageHeader, single, titleSlot } from "../src/molecules/card/card.board.layout.ts";

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
    expect(shape).toEqual(["40px", "36px", "18px", "18px", "18px"]);
    expect(baseline.getByTestId("ticket-priority").textContent).toBe("High");
    expect(baseline.getByTestId("ticket-type").textContent).toBe("Task");
    expect(baseline.getByTestId("ticket-text").style.gap).toBe("6px");
    expect(baseline.queryByTestId("ticket-reason")).toBeNull();
    expect(baseline.getByTestId("ticket-progress").textContent).toBe("");
    baseline.unmount();
    const active = ui({ blocked: true, blockedReason: "Discovery", aiActive: true });
    expect(bodyShape(active.getByTestId)).toEqual(shape);
    expect(active.getByTestId("ticket-status").textContent).toBe("Blocked by Discovery");
    expect(active.queryByTestId("ticket-reason")).toBeNull();
    expect(active.getByTestId("ticket-progress").getAttribute("aria-hidden")).toBeNull();
  });

  it("uses compact rounded pills with contextual accessible names", () => {
    const { getByTestId, getByLabelText } = ui();
    for (const [part, label] of [["priority", "Priority: High"], ["type", "Type: Task"]]) {
      const metadata = getByTestId(`ticket-${part}`);
      expect(getByLabelText(label)).toBe(metadata);
      const pill = metadata.firstElementChild as HTMLElement;
      expect(pill.style.height).toBe("18px");
      expect(Number.parseInt(pill.style.borderRadius)).toBeGreaterThanOrEqual(9);
      expect(metadata.parentElement?.style.height).toBe("18px");
    }
    expect(badgeSlot.height).toBe(18);
    const row = getByTestId("ticket-metadata");
    expect([...row.children]).toEqual([getByTestId("ticket-type"), getByTestId("ticket-priority")]);
    expect(row.style.flexDirection).toBe("row");
    expect(row.style.gap).toBe("6px");
    expect(getByTestId("ticket-header").contains(getByTestId("ticket-priority"))).toBe(false);
    expect(getByTestId("ticket-number").parentElement?.parentElement?.parentElement?.childElementCount).toBe(1);
    expect(getByTestId("ticket-type").parentElement?.previousElementSibling?.contains(getByTestId("ticket-status"))).toBe(true);
  });

  it("keeps omitted metadata slots without rendering empty pills", () => {
    const baseline = ui();
    const shape = bodyShape(baseline.getByTestId);
    baseline.unmount();
    const { getByTestId, queryByTestId } = ui({ priorityLabel: undefined, typeLabel: undefined });
    expect(bodyShape(getByTestId)).toEqual(shape);
    expect(queryByTestId("ticket-priority")).toBeNull();
    expect(queryByTestId("ticket-type")).toBeNull();
    expect(getByTestId("ticket-text").children[3]?.childElementCount).toBe(0);
    expect(getByTestId("ticket-metadata").childElementCount).toBe(0);
  });

  it("shows either remaining pill without an empty sibling", () => {
    for (const hidden of ["priorityLabel", "typeLabel"]) {
      const card = ui({ [hidden]: undefined });
      expect(card.getByTestId("ticket-metadata").childElementCount).toBe(1);
      expect(card.getByTestId("ticket-metadata").textContent).toBe(hidden === "priorityLabel" ? "Task" : "High");
      card.unmount();
    }
  });

  it("preserves severity tones and follows the active theme", () => {
    const backgrounds = (dark: boolean) => {
      const colors: string[] = [];
      for (const priorityLabel of ["High", "Critical", "Medium", "Low"]) {
        const card = render(<ThemeProvider dark={dark}><Card {...ticket} priorityLabel={priorityLabel} /></ThemeProvider>);
        const pill = card.getByTestId("ticket-priority").firstElementChild as HTMLElement;
        colors.push(pill.style.backgroundColor);
        card.unmount();
      }
      expect(colors[0]).toBe(colors[1]);
      expect(new Set(colors).size).toBe(3);
      expect(colors.every(Boolean)).toBe(true);
      return colors;
    };
    expect(backgrounds(true)).not.toEqual(backgrounds(false));
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

  it("opens active AI work independently with native button keyboard semantics", () => {
    let opened = 0;
    let inspected = 0;
    const { getByRole, getByTestId, queryByRole } = ui({ aiActive: true, onPress: () => { opened++; }, interactiveContents: true, onAIProgressPress: () => { inspected++; } });
    const progress = getByRole("button", { name: "View AI work in progress" });
    expect(progress.getAttribute("tabindex")).toBe("0");
    expect(queryByRole("progressbar")).toBeNull();
    fireEvent.click(progress);
    expect(inspected).toBe(1);
    expect(opened).toBe(0);
    expect(progress.tagName).toBe("BUTTON");
    act(() => { progress.focus(); });
    expect(document.activeElement).toBe(progress);
    // Native buttons synthesize a detail=0 click for keyboard activation.
    fireEvent.click(progress, { detail: 0 });
    expect(inspected).toBe(2);
    expect(opened).toBe(0);
    fireEvent.click(getByTestId("ticket-title"));
    expect(opened).toBe(1);
  });

  it("keeps passive progress semantics and omits the action while idle", () => {
    const active = ui({ aiActive: true });
    expect(active.getByRole("progressbar", { name: "AI work in progress" }).getAttribute("aria-busy")).toBe("true");
    expect(active.queryByRole("button", { name: "View AI work in progress" })).toBeNull();
    active.unmount();
    const idle = ui({ onAIProgressPress: () => {} });
    expect(idle.queryByRole("button", { name: "View AI work in progress" })).toBeNull();
  });

  it("keeps the AI action available with reduced motion", async () => {
    const spy = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    let inspected = 0;
    try {
      const { getByRole, getByTestId } = ui({ aiActive: true, onAIProgressPress: () => { inspected++; } });
      await waitFor(() => expect(getByTestId("ticket-progress").textContent).toBe("AI work in progress..."));
      expect(getByTestId("ticket-progress").querySelector('[style*="animation-delay"]')).toBeNull();
      fireEvent.click(getByRole("button", { name: "View AI work in progress" }));
      expect(inspected).toBe(1);
    } finally { spy.mockRestore(); }
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
