import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { type ForwardedRef, type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { glassByScheme, lightColors } from "../src/style/tokens.ts";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.ios.tsx";
import { CLEAR_INTENSITY, CONTENT_INTENSITY, GLASS_INTENSITY, SPECULAR_RIM, brandTint, brandInk, materialCorners, type GlassLayer } from "../src/style/glass-surface/glass-surface.shared.tsx";
import * as iosRuntime from "../src/style/glass-surface/material-runtime.ios.ts";
import * as runtime from "../src/style/glass-surface/material-runtime.ts";
import type { MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";

// The iOS host's material paths, which otherwise only ever run on a device, though Liquid
// Glass is iOS 26's default appearance. expo-glass-effect's GlassView and expo-blur's
// BlurView are stand-ins that record their props and render a marked View, and the
// capabilities are iOS 26's by spy (the shared resolution reads the web runtime's hook under
// test). Pinned: which layers take Liquid Glass and which the frost; the layer's fill
// beneath the glass; a brand as the glass's tintColor with no fill of its own, and a tint
// painted with it; the specular rim on the frost only, with a brand fill over the blur;
// `clear`; and that solid and every accessibility rung mount neither view.

type Props = Record<string, unknown>;
const ios26: MaterialCapabilities = { platform: "ios", frost: true, liquid: true, requiresTarget: false };
const ios18: MaterialCapabilities = { platform: "ios", frost: true, liquid: false, requiresTarget: false };

let liquid: Props[] = [];
let frost: Props[] = [];
let restore: (() => void)[] = [];

function stubs(capabilities: MaterialCapabilities) {
  const Liquid = (props: Props) => { liquid.push(props); return <View testID="liquid-glass" />; };
  const Frost = (props: Props) => { frost.push(props); return <View testID="frost" />; };
  const spies = [
    spyOn(runtime, "useMaterialCapabilities").mockReturnValue(capabilities),
    spyOn(iosRuntime as unknown as { LiquidView: typeof Liquid }, "LiquidView").mockImplementation(Liquid),
    spyOn(iosRuntime as unknown as { FrostView: typeof Frost }, "FrostView").mockImplementation(Frost),
  ];
  restore = spies.map((spy) => () => spy.mockRestore());
}

beforeEach(() => { liquid = []; frost = []; });
afterEach(() => { cleanup(); restore.forEach((undo) => undo()); restore = []; });

/** The material's layers, in paint order: each child of the material clip. */
function layersOf(container: Element) {
  const material = container.querySelector('[data-testid="glass-material"]');
  return material ? Array.from(material.children) as HTMLElement[] : [];
}
// The rim is a frame (`glass-rim`) holding the rim's shadow, in one view or in bands (SpecularRim).
const kind = (layer: HTMLElement) => {
  const id = layer.getAttribute("data-testid");
  return id === "glass-rim" ? "rim" : id ?? (layer.style.backgroundColor ? "fill" : "other");
};
const rimShadow = (layer: HTMLElement) => (layer.firstElementChild as HTMLElement).style.boxShadow;
const channels = (color: string) => color.replace(/\s/g, "").replace(/^rgba?\(/, "").replace(/\)$/, "").split(",").slice(0, 3).join(",");
const hexChannels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");

const SHAPE = { borderRadius: 20, backgroundColor: "#ffffff" };

describe("the iOS host on iOS 26 (Liquid Glass available)", () => {
  for (const layer of ["functional", "control", "dense"] as GlassLayer[]) {
    it(`renders Liquid Glass for the ${layer} layer, its fill beneath the glass and no rim`, () => {
      stubs(ios26);
      const { container } = render(<ThemeProvider light glass><GlassSurface layer={layer} style={SHAPE} /></ThemeProvider>);
      expect(liquid).toHaveLength(1);
      expect(frost).toHaveLength(0);
      expect(layersOf(container).map(kind)).toEqual(["fill", "liquid-glass"]);
      const tint = { functional: "glass-tint", control: "glass-tint-control", dense: "glass-tint-dense" }[layer as "functional"] as keyof typeof glassByScheme.light;
      expect(channels(layersOf(container)[0]!.style.backgroundColor)).toBe(channels(glassByScheme.light[tint]));
      expect(liquid[0]).toMatchObject({ glassEffectStyle: "regular", isInteractive: false, tintColor: undefined, colorScheme: "light" });
    });
  }

  for (const [name, props] of [["the content layer", { layer: "content" as const }], ["a static surface", { static: true }]] as const) {
    it(`renders the frost with its rim for ${name}`, () => {
      stubs(ios26);
      const { container } = render(<ThemeProvider light glass><GlassSurface {...props} style={SHAPE} /></ThemeProvider>);
      expect(liquid).toHaveLength(0);
      expect(frost).toHaveLength(1);
      expect(layersOf(container).map(kind)).toEqual(["fill", "frost", "rim"]);
      expect(rimShadow(layersOf(container)[2]!)).toContain("inset");
      expect(frost[0]).toMatchObject({ intensity: "layer" in props ? CONTENT_INTENSITY : GLASS_INTENSITY, tint: "light" });
    });
  }

  it("passes a brand to the glass as its tintColor and paints no fill for it", () => {
    stubs(ios26);
    const { container } = render(<ThemeProvider light glass><GlassSurface layer="control" brand={lightColors.primary} style={SHAPE} /></ThemeProvider>);
    expect(liquid[0]!.tintColor).toBe(lightColors.primary);
    expect(layersOf(container).map(kind)).toEqual(["liquid-glass"]);
  });

  it("paints a tint beneath the glass beside a brand tintColor", () => {
    stubs(ios26);
    const { container } = render(<ThemeProvider light glass><GlassSurface layer="control" brand={lightColors.primary} tint="#ff0000" style={SHAPE} /></ThemeProvider>);
    expect(liquid[0]!.tintColor).toBe(lightColors.primary);
    expect(layersOf(container).map(kind)).toEqual(["fill", "liquid-glass"]);
    expect(channels(layersOf(container)[0]!.style.backgroundColor)).toBe("255,0,0");
  });

  it("maps clear to Apple's clear glass", () => {
    stubs(ios26);
    render(<ThemeProvider light glass><GlassSurface layer="control" clear style={SHAPE} /></ThemeProvider>);
    expect(liquid[0]!.glassEffectStyle).toBe("clear");
  });

  it("never asks the glass for interactive glass on a kit surface's behalf", () => {
    stubs(ios26);
    render(<ThemeProvider light glass><GlassSurface layer="control" pointerEvents="none" style={SHAPE} /></ThemeProvider>);
    expect(liquid[0]!.isInteractive).toBe(false);
  });
});

describe("the iOS host before iOS 26 (frost)", () => {
  it("paints a brand fill over the blur, solved for the brand's ink, with the rim on top", () => {
    stubs(ios18);
    const { container } = render(<ThemeProvider light glass><GlassSurface layer="control" brand={lightColors.primary} style={SHAPE} /></ThemeProvider>);
    expect(liquid).toHaveLength(0);
    expect(layersOf(container).map(kind)).toEqual(["frost", "fill", "rim"]);
    const solved = brandTint(lightColors.primary, lightColors.background, brandInk(lightColors, lightColors.primary));
    expect(channels(layersOf(container)[1]!.style.backgroundColor)).toBe(channels(solved));
    expect(rimShadow(layersOf(container)[2]!)).toBe(SPECULAR_RIM.light);
  });

  it("maps clear to the clear intensity", () => {
    stubs(ios18);
    render(<ThemeProvider light glass><GlassSurface layer="control" clear style={SHAPE} /></ThemeProvider>);
    expect(frost[0]!.intensity).toBe(CLEAR_INTENSITY);
  });

  it("takes the dark rim and the dark frost in dark mode", () => {
    stubs(ios18);
    const { container } = render(<ThemeProvider dark glass><GlassSurface layer="content" style={SHAPE} /></ThemeProvider>);
    expect(frost[0]!.tint).toBe("dark");
    expect(rimShadow(layersOf(container)[2]!)).toBe(SPECULAR_RIM.dark);
  });
});

describe("the iOS host where its material resolves solid", () => {
  function mockMedia(matching: (query: string) => boolean) {
    return spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: matching(query), media: query, onchange: null,
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => true,
    }) as unknown as MediaQueryList);
  }

  it("mounts neither view in solid mode, and renders the skin's style untouched", () => {
    stubs(ios26);
    const { getByTestId } = render(<ThemeProvider light solid><GlassSurface testID="surface" layer="control" style={SHAPE} /></ThemeProvider>);
    expect(liquid).toHaveLength(0);
    expect(frost).toHaveLength(0);
    expect(channels(getByTestId("surface").style.backgroundColor)).toBe(hexChannels("#ffffff"));
  });

  for (const [rung, query] of [["Reduce Transparency", "prefers-reduced-transparency"], ["Increase Contrast", "prefers-contrast"]] as const) {
    it(`mounts neither view under ${rung}`, async () => {
      stubs(ios26);
      const media = mockMedia((q) => q.includes(query));
      restore.push(() => media.mockRestore());
      const { getByTestId } = render(<ThemeProvider light glass><GlassSurface testID="surface" layer="functional" style={SHAPE} /></ThemeProvider>);
      // The provider reads the setting after its first render; once it has, neither view is mounted.
      await waitFor(() => expect(getByTestId("surface").querySelector('[data-testid="glass-material"]')).toBeNull());
      expect(getByTestId("surface").querySelector('[data-testid="liquid-glass"], [data-testid="frost"]')).toBeNull();
      expect(getByTestId("surface").style.borderWidth).toBe(rung === "Increase Contrast" ? "1px" : "");
    });
  }
});

// glass-surface-border-curve-1: a skin with iOS's continuous corner (`borderCurve:
// "continuous"`: Card, the lists, the Drawer sheet) kept it on its host while the material
// under it took the radii alone, so the clip and the rim drew the circular corner (read on
// the simulator through lldb: the Card host's layer continuous, its material's circular).
// The material carries the host's curve on every layer: the clip, the fill, the frost or
// the Liquid Glass, and the rim, in one view or in bands. React Native Web drops the key, so
// the props are read as the native build receives them.
describe("the material keeps the host's continuous corner", () => {
  const CONTINUOUS = { borderRadius: 20, borderCurve: "continuous" as const, backgroundColor: "#ffffff" };

  /** The style of every View rendered while `run` runs, flattened, as a native build receives it. */
  function viewStyles(run: () => void): Record<string, unknown>[] {
    const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };
    const original = component.render;
    const seen: Record<string, unknown>[] = [];
    const spy = spyOn(component, "render").mockImplementation((props, ref) => {
      seen.push((StyleSheet.flatten(props.style) ?? {}) as Record<string, unknown>);
      return original(props, ref);
    });
    try { run(); } finally { spy.mockRestore(); }
    return seen;
  }

  it("carries the curve with the radii, inside a kept border too", () => {
    expect(materialCorners(CONTINUOUS)).toEqual({ borderRadius: 20, borderCurve: "continuous" });
    expect(materialCorners({ ...CONTINUOUS, borderWidth: 2 }, true)).toEqual({ borderRadius: 18, borderCurve: "continuous" });
    expect(materialCorners({ borderRadius: 20 })).toEqual({ borderRadius: 20 });
  });

  for (const [name, capabilities, props] of [
    ["Liquid Glass", ios26, { layer: "dense" as const }],
    ["the frost and its rim", ios26, { layer: "content" as const }],
  ] as const) {
    it(`gives ${name} the host's curve on every layer`, () => {
      stubs(capabilities);
      const styles = viewStyles(() => { render(<ThemeProvider light glass><GlassSurface {...props} style={CONTINUOUS} /></ThemeProvider>); });
      const material = [...liquid, ...frost].map((p) => StyleSheet.flatten(p.style as object) as Record<string, unknown>);
      expect(material).toHaveLength(1);
      expect(material[0]!.borderCurve).toBe("continuous");
      // Every rounded View the host draws under it (the clip, the fill, the rim) takes the curve.
      const rounded = styles.filter((style) => style.borderRadius === 20 && style.backgroundColor !== "#ffffff");
      expect(rounded.length).toBeGreaterThan(1);
      for (const style of rounded) expect(style.borderCurve).toBe("continuous");
      if (props.layer === "content") expect(styles.some((style) => style.boxShadow != null && style.borderCurve === "continuous")).toBe(true);
    });
  }
});
