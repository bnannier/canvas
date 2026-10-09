import { afterEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import type { A11ySnapshot } from "./native/a11y.ts";
import type { ProbeSummary, ProbeText } from "./probe-math.ts";
import {
  analyzeA11y,
  analyzeNativeCell,
  analyzeWebProbe,
  BACKGROUND_BIN,
  boxToRegion,
  cardSampler,
  CONTRAST_METHODS,
  contrastOfLuminance,
  decodeImage,
  firstDifference,
  inkOver,
  inkRegion,
  paintedInk,
  percentileIndex,
  pixelContrast,
  pixelVerdict,
  relativeLuminance,
  sampleBackground,
  sampleRegion,
  sampleText,
  structureOf,
  textContrast,
  type RawImage,
  type RGB,
  type WebProbe,
} from "./analyze.ts";

/** A white image of `width` x `height`, three channels, with `fill` rectangles painted on it. */
function image(width: number, height: number, fills: { x: number; y: number; w: number; h: number; gray: number }[] = [], background = 255): RawImage {
  const data = new Uint8Array(width * height * 3).fill(background);
  for (const { x, y, w, h, gray } of fills) {
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) data.fill(gray, (row * width + col) * 3, (row * width + col) * 3 + 3);
  }
  return { data, width, height, channels: 3 };
}

function text(overrides: Partial<ProbeText> = {}): ProbeText {
  return {
    text: "Label",
    box: { x: 0, y: 0, width: 40, height: 16 },
    size: 12,
    computedSize: 12,
    scale: 1,
    weight: 500,
    family: "Manrope_500Medium",
    color: "rgb(0, 0, 0)",
    opacity: 1,
    svg: false,
    ariaHidden: false,
    disabled: false,
    background: "rgb(255, 255, 255)",
    painted: "rgb(0, 0, 0)",
    contrast: 21,
    required: 4.5,
    contrastFails: false,
    belowSourceFloor: false,
    underBodyFloor: false,
    clipped: null,
    scrolled: null,
    truncated: false,
    covered: false,
    ...overrides,
  };
}

const indeterminate = (overrides: Partial<ProbeText> = {}) => text({ background: "indeterminate", indeterminate: "backdrop-filter on div", contrast: null, painted: undefined, ...overrides });

describe("WCAG contrast", () => {
  it("computes relative luminance and contrast the way WCAG 2 defines them", () => {
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 6);
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(relativeLuminance([0x77, 0x77, 0x77])).toBeCloseTo(0.1845, 3);
    expect(contrastOfLuminance(1, 0)).toBe(21);
    expect(contrastOfLuminance(0, 1)).toBe(21);
    expect(contrastOfLuminance(relativeLuminance([0x76, 0x76, 0x76]), 1)).toBeCloseTo(4.54, 2);
  });

  it("judges a sampled contrast against what the text owes, never failing it outright", () => {
    expect(pixelVerdict(3.99, 4.5)).toBe("fail-likely");
    expect(pixelVerdict(4.0, 4.5)).toBe("review");
    expect(pixelVerdict(4.49, 4.5)).toBe("review");
    expect(pixelVerdict(4.5, 4.5)).toBe("pass");
    expect(pixelVerdict(2.66, 3)).toBe("fail-likely");
    expect(pixelVerdict(2.67, 3)).toBe("review");
    expect(pixelVerdict(3, 3)).toBe("pass");
  });
});

describe("percentile sampling", () => {
  it("takes the nearest-rank percentile", () => {
    expect(percentileIndex(10, 10)).toBe(0);
    expect(percentileIndex(10, 90)).toBe(8);
    expect(percentileIndex(100, 10)).toBe(9);
    expect(percentileIndex(100, 90)).toBe(89);
    expect(percentileIndex(1, 90)).toBe(0);
  });

  it("reads the 10th and 90th luminance percentiles as the two colours", () => {
    // 8 of 40 columns black: 20% ink, so the 10th percentile is ink and the 90th paper.
    const sample = sampleRegion(image(40, 20, [{ x: 0, y: 0, w: 8, h: 20, gray: 0 }]), { left: 0, top: 0, width: 40, height: 20 })!;
    expect(sample.samples).toBe(800);
    expect(sample.low.rgb).toEqual([0, 0, 0]);
    expect(sample.high.rgb).toEqual([255, 255, 255]);
    expect(sample.contrast).toBe(21);
  });

  it("is not moved by a stray pixel or a band of antialiasing", () => {
    // Ink #767676 over 30% of the box, a 1 px antialiased edge, one stray black pixel.
    const img = image(50, 20, [{ x: 10, y: 0, w: 15, h: 20, gray: 0x76 }, { x: 25, y: 0, w: 1, h: 20, gray: 0xb8 }, { x: 45, y: 10, w: 1, h: 1, gray: 0 }]);
    const sample = sampleRegion(img, { left: 0, top: 0, width: 50, height: 20 })!;
    expect(sample.low.rgb).toEqual([0x76, 0x76, 0x76]);
    expect(sample.contrast).toBeCloseTo(4.54, 2);
  });

  it("misses ink under a tenth of its region, which is why the region is narrowed to the ink first", () => {
    // A 4 x 10 glyph in a 200 x 60 box: 0.3% ink.
    const img = image(200, 60, [{ x: 50, y: 20, w: 4, h: 10, gray: 0 }]);
    const whole = { left: 0, top: 0, width: 200, height: 60 };
    expect(sampleRegion(img, whole)!.contrast).toBe(1);
    expect(inkRegion(img, whole)).toEqual({ left: 49, top: 19, width: 6, height: 12 });
    expect(sampleRegion(img, inkRegion(img, whole))!.contrast).toBe(21);
  });

  it("samples a box with no ink whole, so text the colour of its background reads as no contrast", () => {
    const img = image(30, 30, [], 200);
    expect(inkRegion(img, { left: 5, top: 5, width: 10, height: 10 })).toEqual({ left: 5, top: 5, width: 10, height: 10 });
    expect(sampleRegion(img, { left: 5, top: 5, width: 10, height: 10 })!.contrast).toBe(1);
  });

  it("refuses a region with too few pixels and clamps one that runs off the image", () => {
    const img = image(20, 20);
    expect(sampleRegion(img, { left: 0, top: 0, width: 3, height: 3 })).toBeNull();
    expect(sampleRegion(img, { left: 15, top: 15, width: 30, height: 30 })!.samples).toBe(25);
  });

  it("maps a CSS box onto the image's device pixels, rounded outward", () => {
    expect(boxToRegion({ x: 10.3, y: 5.6, width: 20, height: 10 }, 2, { width: 100, height: 100 })).toEqual({ left: 20, top: 11, width: 41, height: 21 });
    expect(boxToRegion({ x: 45, y: 45, width: 20, height: 20 }, 2, { width: 100, height: 100 })).toEqual({ left: 90, top: 90, width: 10, height: 10 });
    expect(boxToRegion({ x: 60, y: 0, width: 5, height: 5 }, 2, { width: 100, height: 100 })).toBeNull();
  });

  it("separates review from fail-likely at the edge of 4.5 for normal text", () => {
    // #7f7f7f on white is 4.00, #808080 3.95.
    const review = sampleText(image(60, 20, [{ x: 5, y: 4, w: 30, h: 12, gray: 0x7f }]), { x: 0, y: 0, width: 60, height: 20 }, 1)!;
    const failing = sampleText(image(60, 20, [{ x: 5, y: 4, w: 30, h: 12, gray: 0x80 }]), { x: 0, y: 0, width: 60, height: 20 }, 1)!;
    expect(review.contrast).toBe(4);
    expect(pixelVerdict(review.contrast, 4.5)).toBe("review");
    expect(failing.contrast).toBe(3.95);
    expect(pixelVerdict(failing.contrast, 4.5)).toBe("fail-likely");
  });
});

/** An image of `background` with `ink` painted over it at `coverage(x, y)` (0 none, 1 solid), blended the way a browser antialiases glyphs. */
function inked(width: number, height: number, background: RGB, ink: RGB, coverage: (x: number, y: number) => number): RawImage {
  const data = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = coverage(x, y);
      for (let k = 0; k < 3; k++) data[(y * width + x) * 3 + k] = Math.round(background[k]! * (1 - c) + ink[k]! * c);
    }
  }
  return { data, width, height, channels: 3 };
}

/**
 * Two wrapped lines of thin body text: in each glyph row a stroke every 8 px, antialiased
 * across three columns (30%, 80%, 30%), so not one pixel shows the ink at full strength and
 * the solid-looking 80% column is an eighth of a glyph row.
 */
const STROKES = [0, 0, 0.3, 0.8, 0.3, 0, 0, 0];
const thinText = (x: number, y: number) => {
  const line = y % 17;
  return line >= 3 && line < 14 ? STROKES[x % 8]! : 0;
};

describe("the painted ink over the photographed background", () => {
  it("takes the ink from the colour the probe recorded, its own alpha and its opacity", () => {
    expect(paintedInk(text({ color: "rgb(59, 60, 92)" }))).toEqual({ rgb: [59, 60, 92], alpha: 1 });
    const faded = paintedInk(text({ color: "rgba(0, 0, 0, 0.5)", opacity: 0.4 }));
    expect("alpha" in faded && faded.alpha).toBeCloseTo(0.2, 6);
    expect(paintedInk(text({ svg: true, colorAlpha: 0.5 }))).toEqual({ rgb: [0, 0, 0], alpha: 0.5 });
    expect(paintedInk(text({ field: { control: "input", part: "value" } }))).toEqual({ rgb: [0, 0, 0], alpha: 1 });
  });

  it("gives no ink, and says why, where the probe cannot say what paints the glyphs", () => {
    expect(paintedInk(text({ svg: true }))).toEqual({ none: "the probe predates the SVG fill-opacity it paints with" });
    expect(paintedInk(text({ field: { control: "input", part: "placeholder" } }))).toEqual({ none: "the probe predates the placeholder opacity it paints with" });
    expect(paintedInk(text({ color: "transparent" }))).toEqual({ none: "its colour is transparent, so something other than its colour paints its glyphs" });
    expect(paintedInk(text({ color: "oklch(0.5 0 0)" }))).toEqual({ none: "its colour oklch(0.5 0 0) cannot be read" });
  });

  it("reads thin antialiased body text at its true contrast, where the percentiles read the antialiasing as the ink", () => {
    // web/alert/destructive/phone.blush.glass: rgb(59, 60, 92) on the frost's #f3e4e8, 8.6 in truth.
    const background: RGB = [0xf3, 0xe4, 0xe8];
    const ink: RGB = [59, 60, 92];
    const img = inked(240, 34, background, ink, thinText);
    const truth = contrastOfLuminance(relativeLuminance(ink), relativeLuminance(background));
    const box = { x: 0, y: 0, width: 240, height: 34 };
    const glyphs = indeterminate({ color: "rgb(59, 60, 92)", box });
    const read = pixelContrast(glyphs, cardSampler(img, 1))!;
    expect(read).toMatchObject({ method: CONTRAST_METHODS.paintedInk, ink: "#3b3c5c", background: "#f3e4e8" });
    expect(read.contrast).toBeCloseTo(truth, 1);
    expect(pixelVerdict(read.contrast, 4.5)).toBe("pass");
    // The percentiles take the 10th-darkest pixel for the ink: a 30% blend, a fail-likely 1.9.
    const percentiles = sampleText(img, box, 1)!;
    expect(percentiles.contrast).toBeLessThan(4);
  });

  it("composites a translucent ink over the background it reads", () => {
    // rgba(0, 0, 0, 0.6) over gray 200 paints gray 80.
    const img = image(60, 20, [{ x: 5, y: 4, w: 30, h: 12, gray: 80 }], 200);
    const ink = paintedInk(text({ color: "rgba(0, 0, 0, 0.6)" }));
    if (!("rgb" in ink)) throw new Error("expected an ink");
    const background = sampleBackground(img, { left: 0, top: 0, width: 60, height: 20 }, ink)!;
    expect(background.rgb).toEqual([200, 200, 200]);
    expect(inkOver(ink, background.rgb)).toEqual([80, 80, 80]);
    const read = pixelContrast(indeterminate({ color: "rgba(0, 0, 0, 0.6)", box: { x: 0, y: 0, width: 60, height: 20 } }), cardSampler(img, 1))!;
    expect(read.contrast).toBeCloseTo(contrastOfLuminance(relativeLuminance([200, 200, 200]), relativeLuminance([80, 80, 80])), 2);
  });

  it("takes the dominant colour of a mixed background, gathered across a bin's edge", () => {
    // 70% of the box one wash, 30% an orb's edge, black ink: the wash is the background.
    const wash = image(50, 20, [{ x: 35, y: 0, w: 15, h: 20, gray: 120 }, { x: 4, y: 6, w: 20, h: 8, gray: 0 }], 230);
    const ink = { rgb: [0, 0, 0] as RGB, alpha: 1 };
    expect(sampleBackground(wash, { left: 0, top: 0, width: 50, height: 20 }, ink)!.rgb).toEqual([230, 230, 230]);
    // A wash dithered between 127 and 128, either side of a bin's edge, reads as one colour.
    const dithered = inked(40, 20, [127, 127, 127], [128, 128, 128], (x, y) => (x + y) % 2);
    const read = sampleBackground(dithered, { left: 0, top: 0, width: 40, height: 20 }, ink)!;
    expect(read.rgb[0]).toBeCloseTo(127.5, 6);
    expect(read.share).toBe(1);
    expect(BACKGROUND_BIN).toBe(16);
  });

  it("reads text the colour of its background as no contrast, and refuses a box too small to sample", () => {
    const flat = image(30, 30, [], 200);
    const read = pixelContrast(indeterminate({ color: "rgb(200, 200, 200)", box: { x: 0, y: 0, width: 30, height: 30 } }), cardSampler(flat, 1))!;
    expect(read.contrast).toBe(1);
    expect(sampleBackground(flat, { left: 0, top: 0, width: 3, height: 3 }, { rgb: [0, 0, 0], alpha: 1 })).toBeNull();
  });

  it("measures a text the DOM did resolve the same way, which is how the method is calibrated", () => {
    const img = image(60, 20, [{ x: 5, y: 4, w: 30, h: 12, gray: 0x76 }]);
    const read = pixelContrast(text({ color: "rgb(118, 118, 118)", box: { x: 0, y: 0, width: 60, height: 20 }, contrast: 4.54 }), cardSampler(img, 1))!;
    expect(read).toMatchObject({ method: CONTRAST_METHODS.paintedInk, contrast: 4.54, background: "#ffffff" });
  });
});

describe("a text's contrast", () => {
  const sampler = (img: RawImage, dpr = 1) => cardSampler(img, dpr);

  it("takes the DOM's answer where it resolved", () => {
    expect(textContrast("web", text(), null)).toMatchObject({ method: "dom", contrast: 21, verdict: "pass" });
    expect(textContrast("ios", text({ contrast: 3.1, contrastFails: true }), null)).toMatchObject({ method: "dom", verdict: "fail", row: "ios" });
  });

  it("takes the painted ink where the DOM could not resolve the background, and reads only the background off the photograph", () => {
    // White text on a dark wash.
    const img = image(80, 30, [{ x: 10, y: 8, w: 40, h: 14, gray: 255 }], 0x30);
    const verdict = textContrast("web", indeterminate({ color: "rgb(255, 255, 255)", box: { x: 0, y: 0, width: 80, height: 30 } }), sampler(img));
    expect(verdict).toMatchObject({ method: CONTRAST_METHODS.paintedInk, verdict: "pass", ink: "#ffffff", background: "#303030", reason: "backdrop-filter on div" });
    expect(verdict.contrast).toBeCloseTo(contrastOfLuminance(1, relativeLuminance([0x30, 0x30, 0x30])), 2);
  });

  it("falls back to the percentiles, and says so, only for a text whose painted ink the probe cannot give", () => {
    // White text on a dark wash, its colour in a syntax the probe cannot read: the two percentiles, whichever is the ink.
    const img = image(80, 30, [{ x: 10, y: 8, w: 40, h: 14, gray: 255 }], 0x30);
    const verdict = textContrast("web", indeterminate({ color: "oklch(1 0 0)", box: { x: 0, y: 0, width: 80, height: 30 } }), sampler(img));
    expect(verdict).toMatchObject({ method: CONTRAST_METHODS.percentiles, verdict: "pass", reason: "backdrop-filter on div; no painted ink colour: its colour oklch(1 0 0) cannot be read" });
    expect([verdict.ink, verdict.background].sort()).toEqual(["#303030", "#ffffff"]);
    expect(verdict.contrast).toBeGreaterThan(12);
    const svg = textContrast("web", indeterminate({ svg: true, color: "rgb(0, 0, 0)", box: { x: 0, y: 0, width: 80, height: 30 } }), sampler(image(80, 30, [{ x: 10, y: 8, w: 40, h: 14, gray: 0 }])));
    expect(svg).toMatchObject({ method: CONTRAST_METHODS.percentiles, reason: "backdrop-filter on div; no painted ink colour: the probe predates the SVG fill-opacity it paints with" });
  });

  it("owes nothing for a disabled control and does not sample what it cannot see", () => {
    expect(textContrast("web", indeterminate({ disabled: true }), sampler(image(10, 10)))).toMatchObject({ verdict: "exempt", method: "none" });
    expect(textContrast("web", text({ disabled: true, contrast: 1.2 }), null)).toMatchObject({ verdict: "exempt", method: "dom" });
    expect(textContrast("web", indeterminate({ covered: true }), sampler(image(80, 30)))).toMatchObject({ verdict: "unmeasured", method: "none" });
    expect(textContrast("web", indeterminate({ scrolled: { overflow: "auto", excess: 30 } }), sampler(image(80, 30)))).toMatchObject({ verdict: "unmeasured" });
    expect(textContrast("web", indeterminate(), null)).toMatchObject({ verdict: "unmeasured", reason: "backdrop-filter on div; no card image to sample" });
    expect(textContrast("web", indeterminate({ box: { x: 0, y: 0, width: 2, height: 2 } }), sampler(image(80, 30)))).toMatchObject({ verdict: "unmeasured" });
  });

  let dir: string | null = null;
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = null;
  });

  it("decodes card.png flattened on white and samples a CSS box at its device scale", async () => {
    dir = mkdtempSync(join(tmpdir(), "audit-analyze-"));
    const path = join(dir, "card.png");
    // A transparent 200 x 100 card at DPR 2 with a #595959 glyph block at CSS (20, 10) 30 x 8.
    const glyph = await sharp({ create: { width: 60, height: 16, channels: 4, background: { r: 0x59, g: 0x59, b: 0x59, alpha: 1 } } }).png().toBuffer();
    await sharp({ create: { width: 200, height: 100, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: glyph, left: 40, top: 20 }]).png().toFile(path);
    const decoded = await decodeImage(path);
    expect([decoded.width, decoded.height, decoded.channels]).toEqual([200, 100, 3]);
    const sample = sampleText(decoded, { x: 10, y: 5, width: 60, height: 20 }, 2)!;
    expect(sample.region).toEqual({ left: 39, top: 19, width: 62, height: 18 });
    expect(sample.low.rgb).toEqual([0x59, 0x59, 0x59]);
    expect(sample.high.rgb).toEqual([255, 255, 255]);
    expect(sample.contrast).toBeCloseTo(7, 0);
  });
});

describe("structure invariance", () => {
  const snapshot = (button: string) => `- button "${button}"\n- text: Web`;

  it("flags the cells whose web row differs from the group's most common snapshot", () => {
    const cells = ["blush.solid", "blush.glass", "mint.solid", "mint.glass", "dark.solid", "dark.glass"].map((leaf) => ({ id: `web/x/default/phone.${leaf}`, aria: snapshot(leaf === "dark.glass" ? "Sav" : "Save") }));
    const result = structureOf(cells);
    expect(result.get("web/x/default/phone.blush.solid")).toMatchObject({ peers: 6, identical: true });
    expect(result.get("web/x/default/phone.blush.solid")!.agreesWith).toHaveLength(4);
    expect(result.get("web/x/default/phone.dark.glass")).toMatchObject({ identical: false, firstDifference: { line: 1, expected: '- button "Save"', found: '- button "Sav"' } });
  });

  it("breaks a tie toward the first cell's snapshot, and judges nothing alone or without a snapshot", () => {
    const tie = structureOf([{ id: "a", aria: "one" }, { id: "b", aria: "two" }]);
    expect(tie.get("a")!.identical).toBe(true);
    expect(tie.get("b")!.identical).toBe(false);
    expect(structureOf([{ id: "a", aria: "one" }]).get("a")!.identical).toBeNull();
    expect(structureOf([{ id: "a", aria: null }, { id: "b", aria: "x" }]).get("a")!.identical).toBeNull();
  });

  it("names the first line that differs, a missing line included", () => {
    expect(firstDifference("a\nb", "a\nb")).toBeNull();
    expect(firstDifference("a\nb", "a\nc")).toEqual({ line: 2, expected: "b", found: "c" });
    expect(firstDifference("a\nb", "a")).toEqual({ line: 2, expected: "b", found: "(end)" });
  });
});

const summary = (overrides: Partial<ProbeSummary> = {}): ProbeSummary => ({
  texts: 2, textBelowSourceFloor: 0, textUnderBodyFloor: 1, contrastFailures: 0, contrastIndeterminate: 0, clippedText: 0, scrolledText: 0, truncatedText: 0, coveredText: 0,
  targets: 1, smallTargets: { ios: 0, android: 0, web: 0 }, overflowing: [], axeViolations: 0, problems: 0, renderFailed: false, ...overrides,
});

describe("a web cell's analysis", () => {
  it("rolls the probe, the sampled contrast and the structure verdict into its flags", () => {
    const probe: WebProbe = {
      dpr: 1,
      rows: [{
        platform: "web",
        box: { x: 0, y: 0, width: 100, height: 40 },
        aria: "- button",
        texts: [
          text({ text: "Fails", contrast: 3.2, contrastFails: true, size: 11 }),
          indeterminate({ text: "Faint", color: "rgb(160, 160, 160)", box: { x: 0, y: 0, width: 60, height: 20 }, size: 12.5 }),
        ],
        interactive: [{ role: "button", name: "Go", tag: "button", box: { x: 0, y: 0, width: 20, height: 20 }, state: {}, focusable: true, target: 24, unit: "px", belowTarget: true, note: "" }],
      }],
      overflow: { document: 0 },
      axe: { scanned: true, violations: [{ id: "color-contrast", impact: "serious", help: "", nodes: 2 }, { id: "label", impact: "critical", help: "", nodes: 1 }] },
      problems: ["console error: x"],
      summary: summary({ contrastFailures: 1, axeViolations: 2, problems: 1, smallTargets: { ios: 0, android: 0, web: 1 } }),
    };
    const faint = image(100, 40, [{ x: 5, y: 4, w: 40, h: 12, gray: 0xa0 }]);
    const analysis = analyzeWebProbe(
      { id: "web/x/default/phone.blush.glass", status: "ok", flags: [], run: "r", capturedAt: "t" },
      probe,
      cardSampler(faint, 1),
      { peers: 6, identical: false, agreesWith: [] },
      new Date("2026-10-09T00:00:00Z"),
    );
    expect(analysis.flags).toEqual(["problems", "contrast", "small-target", "axe", "contrast-likely", "structure-varies"]);
    expect(analysis.contrast.dom).toEqual({ checked: 1, fails: 1 });
    expect(analysis.contrast.pixels).toEqual({ sampled: 1, failLikely: 1, review: 0, passed: 0, percentiles: 0 });
    expect(analysis.contrast.texts.map((t) => [t.text, t.verdict])).toEqual([["Fails", "fail"], ["Faint", "fail-likely"]]);
    expect(analysis.fonts).toMatchObject({ min: 11, minText: "Fails", minRow: "web", underBodyFloor: 1 });
    expect(analysis.targets.web!.small).toEqual([{ role: "button", name: "Go", width: 20, height: 20 }]);
    expect(analysis.axe.byImpact).toEqual({ critical: 1, serious: 1, moderate: 0, minor: 0 });
    expect(analysis.problems).toBe(1);
  });

  it("files a cell its record says failed under failed, though a probe was left behind", () => {
    const probe: WebProbe = {
      dpr: 1,
      rows: [{ platform: "web", box: { x: 0, y: 0, width: 100, height: 40 }, aria: "- button", texts: [text()], interactive: [] }],
      overflow: { document: 0 },
      axe: { scanned: false, violations: [] },
      problems: [],
      summary: summary(),
    };
    const cell = { id: "web/x/default/phone.blush.solid", flags: [], run: "r", capturedAt: "t" };
    const now = new Date("2026-10-09T00:00:00Z");
    const failed = analyzeWebProbe({ ...cell, status: "failed" }, probe, null, undefined, now);
    expect(failed.flags).toEqual(["failed"]);
    expect(failed.status).toBe("failed");
    expect(analyzeWebProbe({ ...cell, status: "ok" }, probe, null, undefined, now).flags).toEqual([]);
  });
});

describe("native accessibility", () => {
  const node = (role: string, name: string, bounds: { x: number; y: number; width: number; height: number }, depth: number, states: Record<string, boolean> = {}, value?: string) =>
    ({ role, name, ...(value ? { value } : {}), states, bounds, depth });

  it("counts an Android control named by its own label or by a named node inside it, and flags one with neither", () => {
    const snapshot: A11ySnapshot = {
      source: "uiautomator",
      region: { x: 0, y: 0, width: 400, height: 200 },
      total: 10,
      nodes: [
        node("android.widget.Button", "", { x: 10, y: 10, width: 120, height: 48 }, 3, { clickable: true }),
        node("android.widget.TextView", "Save", { x: 20, y: 20, width: 60, height: 20 }, 4),
        node("android.view.ViewGroup", "", { x: 10, y: 80, width: 40, height: 40 }, 3, { clickable: true }),
        node("android.widget.Switch", "Wi-Fi", { x: 200, y: 80, width: 52, height: 32 }, 3, { checkable: true, clickable: true }),
      ],
    };
    const result = analyzeA11y("android", snapshot);
    expect(result.interactive).toBe(3);
    expect(result.unnamed).toEqual([{ role: "android.view.ViewGroup", bounds: { x: 10, y: 80, width: 40, height: 40 } }]);
    expect(result.smallTargets.map((t) => t.role)).toEqual(["android.view.ViewGroup", "android.widget.Switch"]);
  });

  it("flags an iOS element announced only by its value", () => {
    const result = analyzeA11y("ios", {
      source: "maestro",
      region: { x: 0, y: 0, width: 400, height: 200 },
      total: 5,
      nodes: [node("", "Available to chat", { x: 0, y: 0, width: 300, height: 31 }, 20, {}, "1"), node("", "", { x: 0, y: 40, width: 51, height: 31 }, 20, {}, "0")],
    });
    expect(result.interactive).toBeNull();
    expect(result.unnamed).toEqual([{ role: "", value: "0", bounds: { x: 0, y: 40, width: 51, height: 31 } }]);
  });

  it("files a native cell under unstable, problems and a dump that failed", () => {
    const base = { id: "android/x/default/blush.solid", status: "unstable", platform: "android" as const, run: "r", capturedAt: "t" };
    const now = new Date();
    expect(analyzeNativeCell(base, { status: "unstable", a11y: { error: "dump timed out" }, problems: [{}], segments: [{ stable: false }] }, null, now).flags).toEqual(["unstable", "problems", "a11y-error"]);
    const quiet = analyzeNativeCell({ ...base, status: "ok" }, { status: "ok", a11y: "not requested", problems: [], segments: [{ stable: true }] }, null, now);
    expect(quiet.flags).toEqual([]);
    expect(quiet.a11y!.source).toBe("not requested");
    expect(quiet.targets).toEqual({});
  });
});
