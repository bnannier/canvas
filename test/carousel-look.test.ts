import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shape } from "../src/style/index.ts";
import { platformShape } from "../src/style/platform-shape.ts";
import { DISPLAY_FONT } from "../src/style/mono.ts";
import * as car from "../src/organisms/carousel/carousel.styles.ts";

// The v4 hand-off's carousel: cv-kit-code3.js O('carousel'), with K.def('carousel') in
// tools/v4/handoff/cv-kit-data.js.
describe("the v4 carousel", () => {
  const s = car.webSkin;
  it("draws the slide at the card corner on a hairline over the popover fill, 20 in", () => {
    expect(s.slide(t)).toMatchObject({ borderRadius: shape.web.card, borderWidth: 1, borderColor: t.border, backgroundColor: t.popover });
    expect(s.slide(t).shadowOpacity).toBeUndefined();
    expect(s.slidePadding).toBe(20);
  });
  it("sets a string slide in 500 22 display type, centred", () => {
    expect(s.slideText(t)).toMatchObject({ fontFamily: DISPLAY_FONT, fontSize: 22, lineHeight: 28, fontWeight: "500", textAlign: "center", color: t.foreground });
  });
  it("draws 32 px arrow circles on the field hairline over the card fill, with a 16 px chevron", () => {
    expect(s.arrow(t)).toMatchObject({ width: 32, height: 32, borderRadius: 9999, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.card });
    expect(s.arrow(t).shadowOpacity).toBeUndefined();
    expect(s.arrowIconSize).toBe(16);
  });
  it("sets the dots 10 under the slides, 6 apart: 6 px raised circles and an 18 px accent pill", () => {
    expect(s.dotsRow(t)).toMatchObject({ gap: 6, paddingTop: 10 });
    expect(s.dot(t, false)).toMatchObject({ height: 6, width: 6, backgroundColor: t["surface-raised"] });
    expect(s.dot(t, true)).toMatchObject({ height: 6, width: 18, backgroundColor: t.primary });
  });
  it("draws the web parts on iOS in SF Pro, with 44 pt targets and the arrows off by default", () => {
    expect(car.iosSkin.slide(t)).toEqual(s.slide(t));
    expect(car.iosSkin.slideText(t).fontFamily).toBeUndefined();
    expect(car.iosSkin.defaultShowArrows).toBe(false);
    expect(car.iosSkin.dotsRow(t).gap).toBe(0);
    expect(32 + 2 * (car.iosSkin.arrowHitSlop ?? 0)).toBe(44);
  });
  it("keeps the M3 carousel item on Android", () => {
    expect(car.androidSkin.slide(t).borderRadius).toBe(platformShape.android.carouselItem);
    expect([car.androidSkin.defaultShowArrows, car.androidSkin.defaultShowDots]).toEqual([false, false]);
  });
});
