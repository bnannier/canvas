import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { AccessibilityInfo, Text } from "react-native";
import { useReducedMotion } from "../src/style/motion.ts";

// useReducedMotion bridges the OS "Reduce Motion" setting (iOS/Android) and the web
// prefers-reduced-motion query (via react-native-web's AccessibilityInfo) into one
// cross-platform boolean. The decorative animations (skeleton shimmer, accordion /
// collapsible transitions, carousel scroll) read it to honor WCAG 2.3.3.

afterEach(cleanup);

function Probe() {
  const reduced = useReducedMotion();
  return <Text>{reduced ? "reduced" : "full"}</Text>;
}

describe("useReducedMotion", () => {
  it("reflects the OS setting once it resolves", async () => {
    const spy = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    render(<Probe />);
    await waitFor(() => expect(screen.getByText("reduced")).toBeDefined());
    spy.mockRestore();
  });

  it("defaults to full motion when the OS does not reduce", async () => {
    const spy = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(false));
    render(<Probe />);
    await waitFor(() => expect(screen.getByText("full")).toBeDefined());
    spy.mockRestore();
  });
});
