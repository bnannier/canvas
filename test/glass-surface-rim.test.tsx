import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { PixelRatio } from "react-native";
import { RIM_BAND_OVERLAP, RIM_BAND_PIXELS, SPECULAR_RIM, SpecularRim, specularRim } from "../src/style/glass-surface/glass-surface.shared.tsx";

// The native frost's specular rim, React Native's inset boxShadow, which iOS draws as one Core
// Animation shadow over its whole view: past 8192 px on a side that shadow drew flat dark
// tiles over a tall frost (a docs Props table, 4158 pt at 3x; on the iOS 26 simulator a rim
// alone renders at 2700 pt and fails at 2780). SpecularRim draws it so no shadow it asks for
// is taller than RIM_BAND_PIXELS: one rim up to that height, bands past it, each clipped and
// running past the edges it does not own. Pinned: the single rim and its cap, the bands'
// clips, heights, offsets and corners, and that no shadow view is ever taller than a band
// plus its overlaps, at 3x and 2x.

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

    it("draws one rim, the surface's own, capped at a band, until the surface is taller than a band", () => {
      render(<SpecularRim style={SHAPE} dark={false} />);
      layOut(band - 1);
      expect(bands()).toHaveLength(1);
      const [only] = bands();
      // The single rim is specularRim's own style, with the band as its cap.
      const expected = specularRim(SHAPE, false);
      expect(only!.clip.style.boxShadow).toBe(SPECULAR_RIM.light);
      expect(only!.clip.style.borderTopLeftRadius).toBe(`${expected.borderTopLeftRadius}px`);
      expect(only!.clip.style.borderBottomRightRadius).toBe(`${expected.borderBottomRightRadius}px`);
      expect(px(only!.clip.style.maxHeight)).toBeCloseTo(band, 5);
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
