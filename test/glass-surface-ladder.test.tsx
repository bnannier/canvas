import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { Text } from "react-native";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";

// The glass accessibility ladder: under Reduce Transparency / Increase Contrast the
// theme reverts the translucent `popover` token to its solid value (opaque surface for
// every consumer at once), and Increase Contrast additionally paints a contrasting
// foreground border on the surface. expo-blur is stubbed in the test setup, so
// GlassSurface renders its PlainSurface path — which is exactly where these rungs apply.

afterEach(cleanup);

function mockMatchMedia(matching: (query: string) => boolean) {
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const spy = spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: matching(query),
        media: query,
        addEventListener: (_e: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
        removeEventListener: (_e: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
        addListener: (cb: (e: { matches: boolean }) => void) => listeners.add(cb),
        removeListener: (cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
        onchange: null,
        dispatchEvent: () => true,
      }) as unknown as MediaQueryList,
  );
  return spy;
}

function PopoverTokenProbe() {
  const { tokens, reducedTransparency, increasedContrast } = useTheme();
  return <Text>{`${tokens.popover}|rt:${reducedTransparency}|ic:${increasedContrast}`}</Text>;
}

describe("glass token reversion", () => {
  it("uses the translucent popover fill in glass mode by default", async () => {
    render(
      <ThemeProvider surface="glass">
        <PopoverTokenProbe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText(/rgba\(255, 255, 255, 0\.72\)\|rt:false\|ic:false/)).toBeDefined());
  });

  it("reverts popover to a solid fill under Reduce Transparency", async () => {
    const spy = mockMatchMedia((q) => q.includes("prefers-reduced-transparency"));
    try {
      render(
        <ThemeProvider surface="glass">
          <PopoverTokenProbe />
        </ThemeProvider>,
      );
      await waitFor(() => expect(screen.getByText(/#ffffff\|rt:true\|ic:false/)).toBeDefined());
    } finally {
      spy.mockRestore();
    }
  });

  it("reverts popover to a solid fill under Increase Contrast", async () => {
    const spy = mockMatchMedia((q) => q.includes("prefers-contrast"));
    try {
      render(
        <ThemeProvider surface="glass">
          <PopoverTokenProbe />
        </ThemeProvider>,
      );
      await waitFor(() => expect(screen.getByText(/#ffffff\|rt:false\|ic:true/)).toBeDefined());
    } finally {
      spy.mockRestore();
    }
  });
});

describe("GlassSurface increase-contrast border", () => {
  it("adds a 1px foreground border under Increase Contrast", async () => {
    const spy = mockMatchMedia((q) => q.includes("prefers-contrast"));
    try {
      render(
        <ThemeProvider surface="glass">
          <GlassSurface testID="gs" style={{ borderRadius: 12 }}>
            <Text>content</Text>
          </GlassSurface>
        </ThemeProvider>,
      );
      await waitFor(() => {
        const node = screen.getByTestId("gs") as HTMLElement;
        expect(node.style.borderWidth).toBe("1px");
        // foreground token #09090b => rgb(9, 9, 11)
        expect(node.getAttribute("style")).toContain("border-color: rgba(9, 9, 11");
      });
    } finally {
      spy.mockRestore();
    }
  });

  it("paints no border in ordinary glass mode", async () => {
    render(
      <ThemeProvider surface="glass">
        <GlassSurface testID="gs" style={{ borderRadius: 12 }}>
          <Text>content</Text>
        </GlassSurface>
      </ThemeProvider>,
    );
    await waitFor(() => {
      const node = screen.getByTestId("gs") as HTMLElement;
      expect(node.style.borderWidth).toBe("");
    });
  });
});

describe("iOS glass-surface platform file", () => {
  it("imports and renders without throwing (falls back to PlainSurface under the stubbed peers)", async () => {
    const mod = await import("../src/style/glass-surface/glass-surface.ios.tsx");
    render(
      <ThemeProvider surface="glass">
        <mod.GlassSurface testID="ios-gs" style={{ borderRadius: 26 }}>
          <Text>ios</Text>
        </mod.GlassSurface>
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("ios-gs")).toBeDefined());
  });
});
