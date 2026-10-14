import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { PixelRatio, View } from "react-native";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.android.tsx";
import { GlassBlurTargetContext, RIM_BAND_OVERLAP, RIM_BAND_PIXELS, SPECULAR_RIM } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { createCaptureTarget } from "../src/style/glass-surface/capture-target.ts";
import * as androidRuntime from "../src/style/glass-surface/material-runtime.android.ts";
import * as captureRuntime from "../src/style/glass-surface/capture-runtime.ts";
import * as runtime from "../src/style/glass-surface/material-runtime.ts";
import type { MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";

// The Android host's frost paths, which otherwise only ever run on a device: canvas-blur's
// capture frost where a capture plane is ready (an overlay outlet, a bridged Modal), and
// expo-blur's frost on its releases before 57. Both frost views are stand-ins that record
// their props and render a marked View, and the capabilities are Android's by spy (the shared
// resolution reads the web runtime's hook under test). Pinned: each path's paint order (the
// capture frost under the fill, which paints over it since it samples a separate plane; the
// fill under expo-blur's frost), and that the host draws its specular rim through SpecularRim
// as iOS's does: a surface taller than a band (a long DataTable, a Props table, 4158 pt) in
// bands from its first render, none of whose shadows is taller than a band and its overlaps,
// and a short one whole (glass-surface-ios-grey-1, glass-surface-rim-first-frame-1).

type Props = Record<string, unknown>;
const overlay: MaterialCapabilities = { platform: "android", frost: true, liquid: false, requiresTarget: true };
const expoBlur: MaterialCapabilities = { platform: "android", frost: true, liquid: false, requiresTarget: false };

let capture: Props[] = [];
let frost: Props[] = [];
let restore: (() => void)[] = [];

function stubs(capabilities: MaterialCapabilities) {
  const Capture = (props: Props) => { capture.push(props); return <View testID="capture-frost" />; };
  const Frost = (props: Props) => { frost.push(props); return <View testID="frost" />; };
  const spies = [
    spyOn(runtime, "useMaterialCapabilities").mockReturnValue(capabilities),
    spyOn(androidRuntime as unknown as { FrostView: typeof Frost }, "FrostView").mockImplementation(Frost),
    spyOn(PixelRatio, "get").mockReturnValue(3),
  ];
  if (capabilities.requiresTarget) {
    spies.push(spyOn(captureRuntime as unknown as { NativeCaptureFrost: typeof Capture }, "NativeCaptureFrost").mockImplementation(Capture));
  }
  restore = spies.map((spy) => () => spy.mockRestore());
}

/** The height the rim's frame reports as its offsetHeight, as a native layout read does in the commit that mounts it. */
function rimHeight(height: number) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get(this: HTMLElement) { return this.getAttribute("data-testid") === "glass-rim" ? height : 0; },
  });
  restore.push(() => { if (descriptor) Object.defineProperty(HTMLElement.prototype, "offsetHeight", descriptor); });
}

/** An overlay outlet's capture plane: a page element attached and ready to sample. */
function outlet(): (node: ReactNode) => ReactNode {
  const page = document.body.appendChild(document.createElement("div"));
  const plane = createCaptureTarget();
  plane.attach(page as unknown as View);
  plane.setAvailable(page as unknown as View, true);
  restore.push(() => page.remove());
  return (node) => <GlassBlurTargetContext.Provider value={plane.ref}>{node}</GlassBlurTargetContext.Provider>;
}

beforeEach(() => { capture = []; frost = []; });
afterEach(() => { cleanup(); restore.forEach((undo) => undo()); restore = []; });

/** The material's layers, in paint order: each child of the material clip. */
function layersOf(container: Element) {
  const material = container.querySelector('[data-testid="glass-material"]');
  return material ? Array.from(material.children) as HTMLElement[] : [];
}
const kind = (layer: HTMLElement) => {
  const id = layer.getAttribute("data-testid");
  return id === "glass-rim" ? "rim" : id ?? (layer.style.backgroundColor ? "fill" : "other");
};
/** The rim's frame and each of its children: one rim, or a band's clip around its rim. */
function rimOf(container: Element) {
  const frame = container.querySelector('[data-testid="glass-rim"]') as HTMLElement;
  return Array.from(frame.children) as HTMLElement[];
}

const SHAPE = { borderRadius: 12, backgroundColor: "#ffffff" };
const BAND = RIM_BAND_PIXELS / 3;

async function mount(wrap: (node: ReactNode) => ReactNode = (node) => node) {
  const result = render(<ThemeProvider light glass>{wrap(<GlassSurface layer="content" style={SHAPE} />)}</ThemeProvider>);
  // A capture plane resolves after mount, so let the material settle before reading.
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });
  return result;
}

describe("the Android host's frost paths and their rim", () => {
  for (const [name, capabilities, order] of [
    ["canvas-blur's capture frost in an overlay", overlay, ["capture-frost", "fill", "rim"]],
    ["expo-blur's frost", expoBlur, ["fill", "frost", "rim"]],
  ] as const) {
    it(`draws a tall surface's rim in bands over ${name}`, async () => {
      stubs(capabilities);
      rimHeight(4158);
      const { container } = await mount(capabilities.requiresTarget ? outlet() : undefined);
      expect(capture).toHaveLength(capabilities.requiresTarget ? 1 : 0);
      expect(frost).toHaveLength(capabilities.requiresTarget ? 0 : 1);
      expect(layersOf(container).map(kind)).toEqual([...order]);
      const bands = rimOf(container);
      expect(bands).toHaveLength(Math.ceil(4158 / BAND));
      for (const clip of bands) {
        expect([clip.style.overflowX, clip.style.overflowY]).toEqual(["hidden", "hidden"]);
        const rim = clip.firstElementChild as HTMLElement;
        expect(rim.style.boxShadow).toBe(SPECULAR_RIM.light);
        expect(parseFloat(rim.style.height) * 3).toBeLessThanOrEqual(RIM_BAND_PIXELS + 2 * RIM_BAND_OVERLAP * 3);
      }
    });

    it(`draws a short surface's rim whole over ${name}`, async () => {
      stubs(capabilities);
      rimHeight(320);
      const { container } = await mount(capabilities.requiresTarget ? outlet() : undefined);
      expect(layersOf(container).map(kind)).toEqual([...order]);
      const [only, ...rest] = rimOf(container);
      expect(rest).toHaveLength(0);
      expect(only!.style.boxShadow).toBe(SPECULAR_RIM.light);
      expect([only!.style.top, only!.style.bottom]).toEqual(["0px", "0px"]);
    });
  }

  it("renders no rim, and no frost, where an overlay's surface has no ready plane", async () => {
    stubs(overlay);
    rimHeight(4158);
    const { container } = await mount();
    expect(capture).toHaveLength(0);
    expect(container.querySelector('[data-testid="glass-rim"]')).toBeNull();
  });
});

