import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { type ForwardedRef, type ReactNode } from "react";
import { PixelRatio, StyleSheet, View, type ViewProps } from "react-native";
import { RIM_BAND_OVERLAP, RIM_BAND_PIXELS, SPECULAR_RIM, SpecularRim, specularRim } from "../src/style/glass-surface/glass-surface.shared.tsx";

// The native frost's specular rim, React Native's inset boxShadow, which iOS draws as one Core
// Animation shadow over its whole view: past 8192 px on a side that shadow drew flat dark
// tiles over a tall frost (a docs Props table, 4158 pt at 3x; on the iPhone 17 Pro simulator's
// iOS 27 runtime a rim alone renders at 2700 pt and fails at 2780). SpecularRim draws it so no
// shadow it asks for is taller than RIM_BAND_PIXELS: one rim up to that height, bands past it,
// each clipped and running past the edges it does not own. Pinned: the single rim over the
// whole surface, the bands' clips, heights, offsets and corners, that no shadow view is ever
// taller than a band plus its overlaps, at 3x and 2x, and that no render draws an edge where
// the surface has none (glass-surface-rim-first-frame-1): the height is read in the commit
// that mounts the rim, and where none can be read the rim waits for the first layout.

let ratio: ReturnType<typeof spyOn>;
afterEach(() => { cleanup(); ratio?.mockRestore(); });

const SHAPE = { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 };

type LayoutHost = HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
function layOut(height: number) {
  const frame = screen.getByTestId("glass-rim") as LayoutHost;
  act(() => frame.__reactLayoutHandler!({ nativeEvent: { layout: { x: 0, y: 0, width: 354, height } }, timeStamp: 1 }));
}
const frame = () => screen.getByTestId("glass-rim");
/** Each band's clip and the rim inside it. */
const bands = () => Array.from(frame().children).map((clip) => ({ clip: clip as HTMLElement, rim: clip.firstElementChild as HTMLElement }));
const px = (value: string) => (value === "" ? undefined : parseFloat(value));

for (const scale of [3, 2]) {
  describe(`SpecularRim at ${scale}x`, () => {
    const band = RIM_BAND_PIXELS / scale;
    beforeEach(() => { ratio = spyOn(PixelRatio, "get").mockReturnValue(scale); });

    it("draws one rim, the surface's own and spanning it, until the surface is taller than a band", () => {
      render(<SpecularRim style={SHAPE} dark={false} />);
      layOut(band - 1);
      expect(bands()).toHaveLength(1);
      const [only] = bands();
      // The single rim is specularRim's own style: it fills the surface with no cap, so its
      // bottom edge is the surface's own while the surface grows ahead of its next layout.
      const expected = specularRim(SHAPE, false);
      expect(only!.clip.style.boxShadow).toBe(SPECULAR_RIM.light);
      expect(only!.clip.style.borderTopLeftRadius).toBe(`${expected.borderTopLeftRadius}px`);
      expect(only!.clip.style.borderBottomRightRadius).toBe(`${expected.borderBottomRightRadius}px`);
      expect([only!.clip.style.top, only!.clip.style.bottom]).toEqual(["0px", "0px"]);
      expect(only!.clip.style.maxHeight).toBe("");
    });

    it("draws a tall surface in bands, none of whose shadows is taller than a band and its overlaps", () => {
      render(<SpecularRim style={SHAPE} dark />);
      layOut(4158);
      const count = Math.ceil(4158 / band);
      expect(bands()).toHaveLength(count);
      bands().forEach(({ clip, rim }, index) => {
        const first = index === 0;
        const last = index === count - 1;
        expect([clip.style.overflowX, clip.style.overflowY]).toEqual(["hidden", "hidden"]);
        expect(px(clip.style.top)).toBeCloseTo(index * band, 5);
        if (last) {
          expect(clip.style.bottom).toBe("0px");
          expect(rim.style.bottom).toBe("0px");
        } else {
          expect(px(clip.style.height)).toBeCloseTo(band, 5);
          expect(px(rim.style.top)).toBe(first ? 0 : -RIM_BAND_OVERLAP);
        }
        const reach = px(rim.style.height)!;
        expect(reach).toBeCloseTo(band + (first || last ? RIM_BAND_OVERLAP : 2 * RIM_BAND_OVERLAP), 5);
        expect(reach * scale).toBeLessThanOrEqual(RIM_BAND_PIXELS + 2 * RIM_BAND_OVERLAP * scale);
        expect(rim.style.boxShadow).toBe(SPECULAR_RIM.dark);
        // The first band keeps the top corners, the last the bottom ones, and none between.
        expect(rim.style.borderTopLeftRadius).toBe(first ? "20px" : "0px");
        expect(rim.style.borderTopRightRadius).toBe(first ? "20px" : "0px");
        expect(rim.style.borderBottomLeftRadius).toBe(last ? "12px" : "0px");
        expect(rim.style.borderBottomRightRadius).toBe(last ? "12px" : "0px");
      });
    });

    it("goes back to one rim when the surface shrinks under a band", () => {
      render(<SpecularRim style={SHAPE} dark={false} />);
      layOut(band * 3 + 10);
      expect(bands()).toHaveLength(4);
      layOut(200);
      expect(bands()).toHaveLength(1);
      expect(bands()[0]!.clip.style.boxShadow).toBe(SPECULAR_RIM.light);
    });

    it("keeps a uniform radius on the outer bands only", () => {
      render(<SpecularRim style={{ borderRadius: 16 }} dark={false} />);
      layOut(band * 2 + 40);
      const [top, middle, bottom] = bands();
      expect([top!.rim.style.borderTopLeftRadius, top!.rim.style.borderBottomLeftRadius]).toEqual(["16px", "0px"]);
      expect([middle!.rim.style.borderTopLeftRadius, middle!.rim.style.borderBottomRightRadius]).toEqual(["0px", "0px"]);
      expect([bottom!.rim.style.borderTopRightRadius, bottom!.rim.style.borderBottomRightRadius]).toEqual(["0px", "16px"]);
    });
  });
}

// glass-surface-rim-first-frame-1: the rim used to mount as one rim capped at a band and switch
// to bands from the surface's first layout, so for one frame a surface taller than a band drew
// the capped rim's bottom edge across itself at the band's height.
describe("SpecularRim's first frame", () => {
  /** Every shadow View rendered while `run` runs, flattened, in render order. */
  function shadowViews(run: () => void): Record<string, unknown>[] {
    const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };
    const original = component.render;
    const seen: Record<string, unknown>[] = [];
    const spy = spyOn(component, "render").mockImplementation((props, ref) => {
      const style = (StyleSheet.flatten(props.style) ?? {}) as Record<string, unknown>;
      if (style.boxShadow != null) seen.push(style);
      return original(props, ref);
    });
    try { run(); } finally { spy.mockRestore(); }
    return seen;
  }
  /** The height the rim's frame reports as its offsetHeight while `run` runs. */
  function frameHeight(height: number | undefined, run: () => void) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get(this: HTMLElement) { return this.getAttribute("data-testid") === "glass-rim" ? height : 0; },
    });
    try { run(); } finally {
      if (descriptor) Object.defineProperty(HTMLElement.prototype, "offsetHeight", descriptor);
    }
  }

  beforeEach(() => { ratio = spyOn(PixelRatio, "get").mockReturnValue(3); });
  const band = RIM_BAND_PIXELS / 3;

  it("mounts a tall surface in its bands: no render draws a rim cut off above the surface's end", () => {
    let views: Record<string, unknown>[] = [];
    frameHeight(4158, () => { views = shadowViews(() => { render(<SpecularRim style={SHAPE} dark={false} />); }); });
    expect(bands()).toHaveLength(Math.ceil(4158 / band));
    // Every shadow view rendered on the way is a band's rim, none the single rim (which would
    // have drawn its bottom edge at a band's height, or asked for a shadow past the limit).
    expect(views.length).toBeGreaterThan(0);
    for (const view of views) expect(view.height, "a rim with no band's height").toBeDefined();
  });

  it("mounts a short surface's whole rim at once", () => {
    let views: Record<string, unknown>[] = [];
    frameHeight(320, () => { views = shadowViews(() => { render(<SpecularRim style={SHAPE} dark={false} />); }); });
    expect(bands()).toHaveLength(1);
    expect(views.every((view) => view.top === 0 && view.bottom === 0 && view.maxHeight == null)).toBe(true);
  });

  it("draws nothing where no height can be read, until the first layout lands", () => {
    frameHeight(undefined, () => { render(<SpecularRim style={SHAPE} dark={false} />); });
    expect(frame().childElementCount).toBe(0);
    layOut(4158);
    expect(bands()).toHaveLength(Math.ceil(4158 / band));
  });
});
