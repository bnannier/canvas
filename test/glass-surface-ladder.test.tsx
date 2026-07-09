import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { Text } from "react-native";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { GlassBox } from "../src/style/glass-surface/glass-surface.shared.tsx";

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

// A consumer-style surface: skins paint tokens.popover as the fill, exactly like the
// real overlay skins do, so the rendered background reflects the token reversion.
function GlassFillProbe({ testID }: { testID: string }) {
  const { tokens } = useTheme();
  return (
    <GlassSurface testID={testID} style={{ backgroundColor: tokens.popover, borderRadius: 12 }}>
      <Text>fill</Text>
    </GlassSurface>
  );
}

describe("GlassSurface reduce-transparency rung", () => {
  it("renders an OPAQUE surface under Reduce Transparency", async () => {
    const spy = mockMatchMedia((q) => q.includes("prefers-reduced-transparency"));
    try {
      render(
        <ThemeProvider surface="glass">
          <GlassFillProbe testID="rt" />
        </ThemeProvider>,
      );
      await waitFor(() => {
        const style = (screen.getByTestId("rt") as HTMLElement).getAttribute("style") ?? "";
        // The solid light popover (#ffffff), not the translucent 0.72 glass fill.
        expect(style).toMatch(/background-color: rgba?\(255, ?255, ?255(, ?1(\.0+)?)?\)/);
        expect(style).not.toContain("0.72");
      });
    } finally {
      spy.mockRestore();
    }
  });

  it("Increase Contrast wins when both settings are on (opaque + border)", async () => {
    const spy = mockMatchMedia((q) => q.includes("prefers-reduced-transparency") || q.includes("prefers-contrast"));
    try {
      render(
        <ThemeProvider surface="glass">
          <GlassSurface testID="both" style={{ borderRadius: 12 }}>
            <Text>x</Text>
          </GlassSurface>
        </ThemeProvider>,
      );
      await waitFor(() => {
        const node = screen.getByTestId("both") as HTMLElement;
        expect(node.style.borderWidth).toBe("1px");
      });
    } finally {
      spy.mockRestore();
    }
  });
});

// The real material path: GlassBox is what every glass surface renders when a material
// module is present (the expo peers are stubbed under test, so GlassSurface itself
// never reaches it — rendering GlassBox directly covers the two-box structure that the
// pure splitSurfaceStyle unit cannot).
describe("GlassBox structure (real material path)", () => {
  it("strips borders, rounds both boxes, clips the material, keeps padding", () => {
    render(
      <GlassBox
        testID="gbox"
        style={{ borderRadius: 16, borderWidth: 1, borderColor: "#e4e4e7", padding: 8, width: 200 }}
        material={<Text>material-layer</Text>}
      >
        <Text>surface content</Text>
      </GlassBox>,
    );
    const outer = screen.getByTestId("gbox") as HTMLElement;
    const clip = outer.firstElementChild as HTMLElement;
    // No border survives on either box: the material supplies the edge.
    expect(outer.getAttribute("style") ?? "").not.toContain("border-width");
    expect(clip.getAttribute("style") ?? "").not.toContain("border-width");
    // Radius lands on both boxes (rounded shadow on the outer, rounded clip inside).
    expect(outer.style.borderRadius).toBe("16px");
    expect(clip.style.borderRadius).toBe("16px");
    // The clip box clips the material and keeps the skin padding; the outer box owns
    // sizing. (react-native-web expands `overflow` to the two axis longhands.)
    expect(clip.style.overflowX).toBe("hidden");
    expect(clip.style.overflowY).toBe("hidden");
    expect(clip.style.padding).toBe("8px");
    expect(outer.style.width).toBe("200px");
    // The material renders behind (before) the content inside the clip box.
    expect(clip.firstElementChild?.textContent).toBe("material-layer");
    expect(screen.getByText("surface content")).toBeDefined();
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
