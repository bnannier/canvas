import { describe, expect, it } from "bun:test";
import { cardSampler, CONTRAST_METHODS, type RawImage, type WebProbe } from "./analyze.ts";
import { emptyGlass, glassVerdicts, solidReadings, solidTwinId, summarizeSolid, twinOf, type SolidReading } from "./calibrate.ts";
import type { ProbeText } from "./probe-math.ts";

const PAINTED = CONTRAST_METHODS.paintedInk;
const PERCENTILES = CONTRAST_METHODS.percentiles;

/** A white image with gray blocks painted on it, three channels. */
function image(width: number, height: number, fills: { x: number; y: number; w: number; h: number; gray: number }[]): RawImage {
  const data = new Uint8Array(width * height * 3).fill(255);
  for (const { x, y, w, h, gray } of fills) {
    for (let row = y; row < y + h; row++) data.fill(gray, (row * width + x) * 3, (row * width + x + w) * 3);
  }
  return { data, width, height, channels: 3 };
}

function text(overrides: Partial<ProbeText> = {}): ProbeText {
  return {
    text: "Label", box: { x: 0, y: 0, width: 60, height: 20 }, size: 12, computedSize: 12, scale: 1, weight: 500, family: "Manrope_500Medium",
    color: "rgb(0, 0, 0)", opacity: 1, svg: false, ariaHidden: false, disabled: false, background: "rgb(255, 255, 255)", painted: "rgb(0, 0, 0)",
    contrast: 21, required: 4.5, contrastFails: false, belowSourceFloor: false, underBodyFloor: false, clipped: null, scrolled: null, truncated: false, covered: false,
    ...overrides,
  };
}

const reading = (dom: number, pixels: [number | null, number | null], required = 4.5): SolidReading => ({
  run: "r", cell: "c", row: "web", text: "t", required, dom, domFails: dom < required, pixels: { [PAINTED]: pixels[0], [PERCENTILES]: pixels[1] },
});

describe("calibration against the DOM", () => {
  it("reads every text the DOM resolved by both pixel methods, and leaves out what it cannot see", () => {
    // #767676 glyphs on white: 4.54 on the DOM.
    const img = image(60, 20, [{ x: 5, y: 4, w: 30, h: 12, gray: 0x76 }]);
    const probe: Pick<WebProbe, "rows"> = {
      rows: [{
        platform: "web", box: { x: 0, y: 0, width: 60, height: 20 }, interactive: [],
        texts: [
          text({ color: "rgb(118, 118, 118)", contrast: 4.54 }),
          text({ contrast: null, background: "indeterminate" }),
          text({ covered: true }),
          text({ disabled: true }),
        ],
      }],
    };
    const readings = solidReadings("run", "cell", probe, cardSampler(img, 1));
    expect(readings).toHaveLength(1);
    expect(readings[0]).toMatchObject({ dom: 4.54, domFails: false, pixels: { [PAINTED]: 4.54, [PERCENTILES]: 4.54 } });
  });

  it("counts each method's verdicts on the DOM's passes and fails, and how far it strays", () => {
    const summary = summarizeSolid([reading(8.59, [8.6, 2.74]), reading(5, [5, 4.2]), reading(3.87, [3.86, 3.86]), reading(4.36, [4.4, 4.4]), reading(6, [null, 6])]);
    expect(summary).toMatchObject({ texts: 5, domPasses: 3, domFails: 2 });
    expect(summary.methods[PAINTED].onPasses).toEqual({ texts: 3, pass: 2, review: 0, failLikely: 0, unread: 1 });
    expect(summary.methods[PAINTED].onFails).toEqual({ texts: 2, pass: 0, review: 1, failLikely: 1, unread: 0 });
    expect(summary.methods[PERCENTILES].onPasses).toEqual({ texts: 3, pass: 1, review: 1, failLikely: 1, unread: 0 });
    expect(summary.methods[PERCENTILES].error.under).toBeCloseTo((2.74 - 8.59) / 8.59, 3);
    expect(summary.methods[PAINTED].error.over).toBeCloseTo((4.4 - 4.36) / 4.36, 3);
  });

  it("finds a glass text's solid twin and what the DOM says of it", () => {
    expect(solidTwinId("web/alert/destructive/phone.blush.glass")).toBe("web/alert/destructive/phone.blush.solid");
    const solid: Pick<WebProbe, "rows"> = {
      rows: [{ platform: "web", box: { x: 0, y: 0, width: 1, height: 1 }, interactive: [], texts: [text({ text: "Title" }), text({ text: "Body", contrast: 3.2, contrastFails: true }), text({ text: "Faded", contrast: null })] }],
    };
    expect(twinOf(solid, "web", 0, "Title")).toBe("passes");
    expect(twinOf(solid, "web", 1, "Body")).toBe("fails");
    // Out of place, found by its words.
    expect(twinOf(solid, "web", 0, "Body")).toBe("fails");
    expect(twinOf(solid, "web", 2, "Faded")).toBe("unresolved");
    expect(twinOf(solid, "ios", 0, "Title")).toBe("no twin");
    expect(twinOf(null, "web", 0, "Title")).toBe("no twin");
  });

  it("files each flagged glass text by its twin", () => {
    // Two indeterminate texts on white: #a0a0a0 (2.6, fail-likely) and black (pass).
    const img = image(60, 40, [{ x: 5, y: 4, w: 30, h: 12, gray: 0xa0 }, { x: 5, y: 24, w: 30, h: 12, gray: 0 }]);
    const glass: Pick<WebProbe, "rows"> = {
      rows: [{
        platform: "web", box: { x: 0, y: 0, width: 60, height: 40 }, interactive: [],
        texts: [
          text({ text: "Faint", color: "rgb(160, 160, 160)", contrast: null, box: { x: 0, y: 0, width: 60, height: 20 } }),
          text({ text: "Dark", contrast: null, box: { x: 0, y: 20, width: 60, height: 20 } }),
        ],
      }],
    };
    const twin: Pick<WebProbe, "rows"> = { rows: [{ platform: "web", box: { x: 0, y: 0, width: 1, height: 1 }, interactive: [], texts: [text({ text: "Faint", contrast: 5 }), text({ text: "Dark" })] }] };
    const tallies = emptyGlass();
    glassVerdicts(glass, cardSampler(img, 1), twin, tallies);
    expect(tallies[PAINTED]).toEqual({ read: 2, failLikely: { passes: 1, fails: 0, unresolved: 0, "no twin": 0 }, review: { passes: 0, fails: 0, unresolved: 0, "no twin": 0 } });
  });
});
