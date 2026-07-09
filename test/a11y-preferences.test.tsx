import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, waitFor, screen, act } from "@testing-library/react";
import { AccessibilityInfo, Text } from "react-native";
import { useReducedTransparency, useIncreasedContrast } from "../src/style/a11y-preferences.ts";

// The two hooks bridge the OS "Reduce Transparency" / "Increase Contrast" settings
// (iOS/Android native, web prefers-* media queries) into cross-platform booleans that
// drive the glass surface's opaque degradation. Under the RNW test harness the native
// AccessibilityInfo methods are undefined, so the hooks fall back to matchMedia; each
// path is exercised below.

afterEach(cleanup);

function RTProbe() {
  return <Text>{useReducedTransparency() ? "reduced" : "full"}</Text>;
}
function ICProbe() {
  return <Text>{useIncreasedContrast() ? "high" : "normal"}</Text>;
}

// A stub matchMedia whose result depends on the queried media string, capturing the
// change listeners so a test can fire a live update.
function mockMatchMedia(matching: (query: string) => boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const spy = spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matching(query),
        media: query,
        addEventListener: (_event: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
        removeEventListener: (_event: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
        addListener: (cb: (e: { matches: boolean }) => void) => listeners.add(cb),
        removeListener: (cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
        onchange: null,
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  );
  const fire = (matches: boolean) => act(() => listeners.forEach((cb) => cb({ matches })));
  return { spy, fire };
}

describe("useReducedTransparency", () => {
  it("reads the native setting when AccessibilityInfo exposes it (iOS)", async () => {
    const ai = AccessibilityInfo as unknown as Record<string, unknown>;
    ai.isReduceTransparencyEnabled = () => Promise.resolve(true);
    try {
      render(<RTProbe />);
      await waitFor(() => expect(screen.getByText("reduced")).toBeDefined());
    } finally {
      delete ai.isReduceTransparencyEnabled;
    }
  });

  it("falls back to prefers-reduced-transparency on the web and tracks changes", async () => {
    const { spy, fire } = mockMatchMedia((q) => q.includes("prefers-reduced-transparency"));
    try {
      render(<RTProbe />);
      await waitFor(() => expect(screen.getByText("reduced")).toBeDefined());
      expect(spy).toHaveBeenCalledWith("(prefers-reduced-transparency: reduce)");
      fire(false);
      await waitFor(() => expect(screen.getByText("full")).toBeDefined());
    } finally {
      spy.mockRestore();
    }
  });

  it("defaults to false when nothing indicates reduced transparency", async () => {
    render(<RTProbe />);
    await waitFor(() => expect(screen.getByText("full")).toBeDefined());
  });
});

describe("useIncreasedContrast", () => {
  it("reads the native setting when AccessibilityInfo exposes it", async () => {
    // On web the hook picks isDarkerSystemColorsEnabled (the non-Android query).
    const ai = AccessibilityInfo as unknown as Record<string, unknown>;
    ai.isDarkerSystemColorsEnabled = () => Promise.resolve(true);
    try {
      render(<ICProbe />);
      await waitFor(() => expect(screen.getByText("high")).toBeDefined());
    } finally {
      delete ai.isDarkerSystemColorsEnabled;
    }
  });

  it("falls back to prefers-contrast: more on the web and tracks changes", async () => {
    const { spy, fire } = mockMatchMedia((q) => q.includes("prefers-contrast"));
    try {
      render(<ICProbe />);
      await waitFor(() => expect(screen.getByText("high")).toBeDefined());
      expect(spy).toHaveBeenCalledWith("(prefers-contrast: more)");
      fire(false);
      await waitFor(() => expect(screen.getByText("normal")).toBeDefined());
    } finally {
      spy.mockRestore();
    }
  });

  it("defaults to false when nothing indicates increased contrast", async () => {
    render(<ICProbe />);
    await waitFor(() => expect(screen.getByText("normal")).toBeDefined());
  });
});
