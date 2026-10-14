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
// that mounts the rim, and where none can be read the rim waits for the first layout. And the
// growth contract (glass-surface-rim-growth-1): every shadow view is bounded by its own style
// (the single rim capped at a band), so a surface that outgrows two bands before React hears
// of it never asks for a shadow past the limit, and the height is read again in every commit
// the rim renders in, so a surface that grows with its host's re-render draws its bands from
// that commit.

let ratio: ReturnType<typeof spyOn>;
// The height the rim's frame reports as its offsetHeight, which a native layout read returns in
// the commit (the layout effect's read) and which its onLayout then reports too: `layOut` moves
// both. undefined is a host that reports no offsetHeight. Every other element reports 0.
let reported: number | undefined = 0;
const OFFSET_HEIGHT = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
beforeEach(() => {
  reported = 0;
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get(this: HTMLElement) { return this.getAttribute("data-testid") === "glass-rim" ? reported : 0; },
  });
});
afterEach(() => {
  cleanup();
  ratio?.mockRestore();
  if (OFFSET_HEIGHT) Object.defineProperty(HTMLElement.prototype, "offsetHeight", OFFSET_HEIGHT);
});

const SHAPE = { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 };

type LayoutHost = HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
function layOut(height: number) {
  reported = height;
  const frame = screen.getByTestId("glass-rim") as LayoutHost;
  act(() => frame.__reactLayoutHandler!({ nativeEvent: { layout: { x: 0, y: 0, width: 354, height } }, timeStamp: 1 }));
}
const frame = () => screen.getByTestId("glass-rim");
/** Each band's clip and the rim inside it. */
const bands = () => Array.from(frame().children).map((clip) => ({ clip: clip as HTMLElement, rim: clip.firstElementChild as HTMLElement }));
const px = (value: string) => (value === "" ? undefined : parseFloat(value));
/** Every shadow view under the rim's frame. */
const shadows = () => Array.from(frame().querySelectorAll("*")).filter((el) => (el as HTMLElement).style.boxShadow !== "") as HTMLElement[];
/**
 * The tallest a view can ever lay out, from its own style alone: its height, else its
 * maxHeight, else unbounded. A view pinned top and bottom with neither spans whatever its
 * frame becomes, which is what Core Animation drew grey past 8192 px.
 */
const ownBound = (style: { height?: unknown; maxHeight?: unknown }) => {
  const value = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v !== "" ? parseFloat(v) : undefined);
  return value(style.height) ?? value(style.maxHeight) ?? Infinity;
};

for (const scale of [3, 2]) {
  describe(`SpecularRim at ${scale}x`, () => {
    const band = RIM_BAND_PIXELS / scale;
    beforeEach(() => { ratio = spyOn(PixelRatio, "get").mockReturnValue(scale); });

    it("draws one rim, the surface's own and spanning it, until the surface is taller than a band", () => {
      render(<SpecularRim style={SHAPE} dark={false} />);
      layOut(band - 1);
      expect(bands()).toHaveLength(1);
      const [only] = bands();
      // The single rim is specularRim's own style, pinned to the surface's four edges, with a
      // band as its cap: a surface no taller than a band never reaches the cap, so its rim is
      // the surface's own, corners and bottom edge included.
      const expected = specularRim(SHAPE, false);
      expect(only!.clip.style.boxShadow).toBe(SPECULAR_RIM.light);
      expect(only!.clip.style.borderTopLeftRadius).toBe(`${expected.borderTopLeftRadius}px`);
      expect(only!.clip.style.borderBottomRightRadius).toBe(`${expected.borderBottomRightRadius}px`);
      expect([only!.clip.style.top, only!.clip.style.bottom]).toEqual(["0px", "0px"]);
      expect(px(only!.clip.style.maxHeight)).toBeCloseTo(band, 5);
    });

    it("bounds every shadow view by its own style, so no surface outgrows the limit before its next layout", () => {
      // Whatever the surface does before React hears of it (a child's own state, a reflow, a
      // DataTable going from a few rows to a long page), no shadow view can lay out taller than
      // a band and its overlaps: the single rim at a band by its cap, each band's rim by its
      // height. The uncapped single rim spanned whatever the surface grew to.
      render(<SpecularRim style={SHAPE} dark={false} />);
      for (const height of [320, band - 1, band + 1, 4158, band * 3 + 10, 200]) {
        layOut(height);
        expect(shadows().length).toBeGreaterThan(0);
        for (const view of shadows()) {
          expect(ownBound(view.style) * scale, `a shadow view at ${height} pt`).toBeLessThanOrEqual(RIM_BAND_PIXELS + 2 * RIM_BAND_OVERLAP * scale);
        }
      }
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
    reported = height;
    run();
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
    // Pinned to the surface's edges, its cap a band, which a 320 pt surface never reaches.
    expect(views.length).toBeGreaterThan(0);
    expect(views.every((view) => view.top === 0 && view.bottom === 0 && view.maxHeight === band)).toBe(true);
  });

  it("draws nothing where no height can be read, until the first layout lands", () => {
    frameHeight(undefined, () => { render(<SpecularRim style={SHAPE} dark={false} />); });
    expect(frame().childElementCount).toBe(0);
    layOut(4158);
    expect(bands()).toHaveLength(Math.ceil(4158 / band));
  });

  // glass-surface-rim-growth-1: the height was read only in the commit that mounted the rim, so
  // a surface that grew past a band with its host's re-render (a DataTable given a long page)
  // kept its single rim until onLayout landed, a frame or two later, and that rim, uncapped,
  // spanned the new height: past two bands, Core Animation's grey tiles.
  it("reads the height again in a commit that re-renders it: a surface grown past two bands draws its bands from that commit", () => {
    reported = 320;
    const { rerender } = render(<SpecularRim style={SHAPE} dark={false} />);
    expect(bands()).toHaveLength(1);
    reported = 9000;
    const views = shadowViews(() => { rerender(<SpecularRim style={SHAPE} dark={false} />); });
    expect(bands()).toHaveLength(Math.ceil(9000 / band));
    // Every shadow view the commit rendered on the way, the single rim it re-rendered first
    // included, is bounded by its own style.
    expect(views.length).toBeGreaterThan(0);
    for (const view of views) expect(ownBound(view) * 3).toBeLessThanOrEqual(RIM_BAND_PIXELS + 2 * RIM_BAND_OVERLAP * 3);
    // And back: a shrink in a commit that re-renders it is read the same way.
    reported = 300;
    rerender(<SpecularRim style={SHAPE} dark={false} />);
    expect(bands()).toHaveLength(1);
  });
});
