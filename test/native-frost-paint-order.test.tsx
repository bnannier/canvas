import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { Platform, Text, View } from "react-native";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";
import { lightColors, type ColorTokens, type GlassTokens } from "../src/style/tokens.ts";
import { GlassSurface as IosGlassSurface } from "../src/style/glass-surface/glass-surface.ios.tsx";
import { GlassSurface as AndroidGlassSurface } from "../src/style/glass-surface/glass-surface.android.tsx";
import { GlassSurface as FallbackGlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { GlassBlurTargetContext, SHEER_FILL_OPACITY, brandInk, brandTint, clearSurfaceTint, type GlassLayer, type GlassSurfaceProps } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { createCaptureTarget } from "../src/style/glass-surface/capture-target.ts";
import * as iosRuntime from "../src/style/glass-surface/material-runtime.ios.ts";
import * as androidRuntime from "../src/style/glass-surface/material-runtime.android.ts";
import * as captureRuntime from "../src/style/glass-surface/capture-runtime.ts";
import * as runtime from "../src/style/glass-surface/material-runtime.ts";
import type { MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";
import { LOOKS, lookProps } from "./fixtures/looks.ts";

// The native frost's paint order (glass-surface-native-frost-self-sample-1). A native blur
// samples whatever is painted beneath it: iOS's expo-blur BlurView (a UIVisualEffectView)
// blurs the views behind it in the window, its own surface's fill among them, and dyes them
// with its light or dark veil. The iOS frost and Android's expo-blur frost painted the
// layer's tint BENEATH their BlurView, so the frost sampled its own surface, which the
// materials law forbids (no material may sample itself) and which Dark Factory's native
// GlassSurface does not do: its BlurView first, its fill over it. Measured on the iPhone 17
// Pro simulator (iOS 27 runtime): a fill over the frost renders the fill composited on the
// fill-less frost within half a level, where the same fill beneath it read up to 53 levels a
// channel off (a red tint) and the dark Card's content tint up to 10.
//
// The rule held here, on every native frost path (iOS's frost, before iOS 26 and for the
// content layer and static surfaces after it; Android's canvas-blur capture frost and
// expo-blur's frost; the expo-blur frost of a platform with no host of its own): the frost
// is the first layer of the material, nothing beneath it paints (the material clip, the
// surface's own host), the fill comes after it and the rim after the fill, for every layer,
// a brand, a wash, a sheer pane, a state border and a clear surface, in blush, mint and dark.
// iOS 26's Liquid Glass keeps its own order (its fill beneath the glass, a brand as its
// tintColor), pinned below and in test/glass-surface-ios.test.tsx.

type Props = Record<string, unknown>;
let restore: (() => void)[] = [];
afterEach(() => { cleanup(); restore.forEach((undo) => undo()); restore = []; });

function stub<T extends object>(module: T, name: string, implementation: unknown) {
  const spy = spyOn(module as Record<string, unknown>, name as never).mockImplementation(implementation as never);
  restore.push(() => spy.mockRestore());
}
function capabilities(value: MaterialCapabilities) {
  const spy = spyOn(runtime, "useMaterialCapabilities").mockReturnValue(value);
  restore.push(() => spy.mockRestore());
}
const Frost = (_: Props) => <View testID="frost" />;
const Capture = (_: Props) => <View testID="capture-frost" />;
const Liquid = (_: Props) => <View testID="liquid-glass" />;

const EMPTY = /^(|transparent|rgba\(0, 0, 0, 0(\.0+)?\))$/;
const kind = (layer: HTMLElement) => {
  const id = layer.getAttribute("data-testid");
  if (id === "glass-rim") return "rim";
  if (id) return id;
  return EMPTY.test(layer.style.backgroundColor) ? "other" : "fill";
};

interface Case { id: string; props: GlassSurfaceProps; fill: (glass: GlassTokens, tokens: ColorTokens, dark: boolean) => string; opacity?: string }
const TINT: Record<GlassLayer, keyof GlassTokens> = { functional: "glass-tint", content: "glass-tint-content", control: "glass-tint-control", dense: "glass-tint-dense" };
const SHAPE = { backgroundColor: lightColors.card, borderRadius: 14, borderWidth: 1, borderColor: lightColors.border };
const CASES: Case[] = [
  ...(["functional", "content", "control", "dense"] as GlassLayer[]).map((layer): Case => ({ id: layer, props: { layer, static: true, style: SHAPE }, fill: (glass) => glass[TINT[layer]] })),
  { id: "brand", props: { layer: "control", static: true, brand: lightColors.primary, style: { borderRadius: 999 } }, fill: (_, tokens) => brandTint(lightColors.primary, tokens.background, brandInk(tokens, lightColors.primary)) },
  { id: "wash", props: { layer: "content", tint: "rgba(37, 99, 235, 0.12)", style: { borderRadius: 12 } }, fill: () => "rgba(37, 99, 235, 0.12)" },
  { id: "sheer", props: { layer: "content", sheer: true, style: { borderRadius: 12 } }, fill: (glass) => glass["glass-tint-content"], opacity: String(SHEER_FILL_OPACITY) },
  { id: "state", props: { layer: "content", stateBorder: true, style: { borderRadius: 12, borderWidth: 2, borderColor: lightColors.primary } }, fill: (glass) => glass["glass-tint-content"] },
  { id: "clear", props: { layer: "control", static: true, clear: true, style: { borderRadius: 999 } }, fill: (_, tokens, dark) => clearSurfaceTint(tokens, dark) },
];

/** Every case's surface inside one provider, with the theme it published for the expectations. */
function renderCases(Host: (props: GlassSurfaceProps) => ReactNode, look: (typeof LOOKS)[number], wrap: (node: ReactNode) => ReactNode = (node) => node) {
  let theme: ReturnType<typeof useTheme> | null = null;
  function Probe() { theme = useTheme(); return null; }
  const result = render(
    <ThemeProvider {...lookProps(look)} glass>
      <Probe />
      {wrap(<>{CASES.map((c) => <Host key={c.id} testID={c.id} {...c.props}><Text>{c.id}</Text></Host>)}</>)}
    </ThemeProvider>,
  );
  return { ...result, theme: theme! };
}

function expectFrostFirst(container: HTMLElement, theme: ReturnType<typeof useTheme>, frost: "frost" | "capture-frost", where: string) {
  for (const c of CASES) {
    const host = container.querySelector(`[data-testid="${c.id}"]`) as HTMLElement;
    const material = host.querySelector(':scope > [data-testid="glass-material"]') as HTMLElement;
    const what = `${where} ${c.id}`;
    expect(material, `${what}: a material`).not.toBeNull();
    const layers = Array.from(material.children) as HTMLElement[];
    expect(layers.map(kind), `${what}: the frost, the fill over it, the rim last`).toEqual([frost, "fill", "rim"]);
    // Nothing the frost could sample of its own surface: the clip and the host paint no fill.
    expect(EMPTY.test(material.style.backgroundColor), `${what}: the clip paints nothing`).toBe(true);
    expect(EMPTY.test(host.style.backgroundColor), `${what}: the host's fill gives way`).toBe(true);
    const fill = layers[1]!;
    expect(rgba(fill.style.backgroundColor), `${what}: the fill's colour`).toEqual(rgba(c.fill(theme.glass, theme.tokens, theme.dark)));
    expect(fill.style.opacity || "1", `${what}: the fill's opacity`).toBe(c.opacity ?? "1");
  }
}

describe("every native frost paints its fill over its blur, then the rim", () => {
  for (const look of LOOKS) {
    it(`iOS before iOS 26: the frost first, in ${look.name}`, () => {
      capabilities({ platform: "ios", frost: true, liquid: false, requiresTarget: false });
      stub(iosRuntime, "FrostView", Frost);
      stub(iosRuntime, "LiquidView", Liquid);
      const { container, theme } = renderCases(IosGlassSurface, look);
      expectFrostFirst(container, theme, "frost", `iOS 18 ${look.name}`);
    });

    it(`iOS 26: the content layer's and a static surface's frost first, in ${look.name}`, () => {
      capabilities({ platform: "ios", frost: true, liquid: true, requiresTarget: false });
      stub(iosRuntime, "FrostView", Frost);
      stub(iosRuntime, "LiquidView", Liquid);
      // Every case is static or on the content layer, so iOS 26 frosts each of them.
      const { container, theme } = renderCases(IosGlassSurface, look);
      expectFrostFirst(container, theme, "frost", `iOS 26 ${look.name}`);
    });

    it(`Android: expo-blur's frost first, in ${look.name}`, () => {
      capabilities({ platform: "android", frost: true, liquid: false, requiresTarget: false });
      stub(androidRuntime, "FrostView", Frost);
      const { container, theme } = renderCases(AndroidGlassSurface, look);
      expectFrostFirst(container, theme, "frost", `Android expo-blur ${look.name}`);
    });

    it(`Android: canvas-blur's capture frost first, in ${look.name}`, async () => {
      capabilities({ platform: "android", frost: true, liquid: false, requiresTarget: true });
      stub(androidRuntime, "FrostView", Frost);
      stub(captureRuntime, "NativeCaptureFrost", Capture);
      const page = document.body.appendChild(document.createElement("div"));
      restore.push(() => page.remove());
      const plane = createCaptureTarget();
      plane.attach(page as unknown as View);
      plane.setAvailable(page as unknown as View, true);
      const { container, theme } = renderCases(AndroidGlassSurface, look, (node) => <GlassBlurTargetContext.Provider value={plane.ref}>{node}</GlassBlurTargetContext.Provider>);
      // A capture plane resolves after mount.
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });
      expectFrostFirst(container, theme, "capture-frost", `Android capture ${look.name}`);
    });

    it(`a platform with no host of its own: expo-blur's frost first, in ${look.name}`, () => {
      const os = Object.getOwnPropertyDescriptor(Platform, "OS")!;
      Object.defineProperty(Platform, "OS", { configurable: true, value: "windows" });
      restore.push(() => Object.defineProperty(Platform, "OS", os));
      capabilities({ platform: "other", frost: true, liquid: false, requiresTarget: false });
      stub(runtime, "FrostView", Frost);
      const { container, theme } = renderCases(FallbackGlassSurface, look);
      for (const c of CASES) {
        const material = container.querySelector(`[data-testid="${c.id}"] > [data-testid="glass-material"]`) as HTMLElement;
        const layers = Array.from(material.children) as HTMLElement[];
        // This host's rim is a plain inset hairline rather than SpecularRim.
        expect(layers.map((layer) => layer.style.boxShadow.startsWith("inset") ? "rim" : kind(layer)), `fallback ${look.name} ${c.id}`).toEqual(["frost", "fill", "rim"]);
        expect(rgba(layers[1]!.style.backgroundColor)).toEqual(rgba(c.fill(theme.glass, theme.tokens, theme.dark)));
      }
    });
  }
});

describe("iOS 26's Liquid Glass keeps its own order", () => {
  for (const look of LOOKS) {
    it(`paints a fill beneath the glass, and a brand as its tintColor, in ${look.name}`, () => {
      capabilities({ platform: "ios", frost: true, liquid: true, requiresTarget: false });
      stub(iosRuntime, "FrostView", Frost);
      const tints: unknown[] = [];
      stub(iosRuntime, "LiquidView", (props: Props) => { tints.push(props.tintColor); return <View testID="liquid-glass" />; });
      const { container } = render(
        <ThemeProvider {...lookProps(look)} glass>
          <IosGlassSurface testID="layer" layer="functional" style={SHAPE} />
          <IosGlassSurface testID="brand" layer="control" brand={lightColors.primary} style={SHAPE} />
          <IosGlassSurface testID="wash" layer="control" brand={lightColors.primary} tint="#ff0000" style={SHAPE} />
        </ThemeProvider>,
      );
      const order = (id: string) => Array.from((container.querySelector(`[data-testid="${id}"] > [data-testid="glass-material"]`) as HTMLElement).children).map((layer) => kind(layer as HTMLElement));
      expect(order("layer")).toEqual(["fill", "liquid-glass"]);
      expect(order("brand")).toEqual(["liquid-glass"]);
      expect(order("wash")).toEqual(["fill", "liquid-glass"]);
      expect(tints).toEqual([undefined, lightColors.primary, lightColors.primary]);
    });
  }
});

// react-native-web stores an alpha as an 8-bit channel and prints it with two decimals, so
// colours compare as numbers quantized the way it does.
function rgba(value: string): number[] | string {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(value);
  if (hex) return [parseInt(hex[1]!, 16), parseInt(hex[2]!, 16), parseInt(hex[3]!, 16), Number(((hex[4] == null ? 255 : parseInt(hex[4], 16)) / 255).toFixed(2))];
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(value);
  if (!m) return value;
  const a = m[4] == null ? 1 : Number(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number((Math.round(a * 255) / 255).toFixed(2))];
}
