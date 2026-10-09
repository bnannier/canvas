import { describe, expect, it } from "bun:test";
import {
  belowTarget,
  contrastOf,
  deriveRow,
  deriveText,
  flagsOf,
  flatten,
  isLargeText,
  overflowOf,
  parseCssColor,
  renderedWeight,
  requiredContrast,
  resolveContrast,
  summarizeProbe,
  type RawLayer,
  type RawRow,
  type RawText,
} from "./probe-math.ts";

const layer = (fill: string | null, groups: number[] = [], kinds: string[] = [], tag = "div"): RawLayer => ({ tag, fill, fillAlpha: 1, kinds, groups });

function text(overrides: Partial<RawText> = {}): RawText {
  return {
    text: "Label",
    box: { x: 0, y: 0, width: 40, height: 16 },
    size: 12.5,
    weight: 500,
    family: "Manrope",
    color: "rgb(0, 0, 0)",
    colorAlpha: 1,
    svg: false,
    ariaHidden: false,
    disabled: false,
    groups: [],
    selfOverflow: { x: 0, y: 0 },
    clipsSelf: false,
    ellipsis: false,
    clipper: null,
    stack: [layer("rgba(0, 0, 0, 0)"), layer("rgb(255, 255, 255)")],
    stackNote: null,
    covered: false,
    ...overrides,
  };
}

describe("reading computed colours", () => {
  it("reads what Chromium's computed style reports", () => {
    expect(parseCssColor("rgb(12, 34, 56)")).toEqual([12, 34, 56, 1]);
    expect(parseCssColor("rgba(12, 34, 56, 0.5)")).toEqual([12, 34, 56, 0.5]);
    expect(parseCssColor("rgb(12 34 56 / 25%)")).toEqual([12, 34, 56, 0.25]);
    expect(parseCssColor("color(srgb 1 0 0.5 / 0.4)")).toEqual([255, 0, 127.5, 0.4]);
    expect(parseCssColor("#fff")).toEqual([255, 255, 255, 1]);
    expect(parseCssColor("#00000080")![3]).toBeCloseTo(0.502, 3);
    expect(parseCssColor("transparent")).toEqual([0, 0, 0, 0]);
  });

  it("refuses what it cannot read rather than guessing", () => {
    expect(parseCssColor("oklab(0.5 0.1 0.1)")).toBeNull();
    expect(parseCssColor("currentcolor")).toBeNull();
    expect(parseCssColor("rgb(1, 2)")).toBeNull();
  });
});

describe("contrast", () => {
  it("is WCAG's ratio", () => {
    expect(contrastOf([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastOf([119, 119, 119], [255, 255, 255])).toBeCloseTo(4.48, 2);
  });

  it("reads the rendered weight off a per-weight family", () => {
    expect(renderedWeight("Manrope_800ExtraBold", 400)).toBe(800);
    expect(renderedWeight("Manrope_400Regular", 400)).toBe(400);
    expect(renderedWeight("Menlo", 700)).toBe(700);
    expect(deriveText(text({ family: "Manrope_700Bold", size: 19 }), []).required).toBe(3);
  });

  it("owes 3 for large text and 4.5 otherwise", () => {
    expect(isLargeText(24, 400)).toBe(true);
    expect(isLargeText(19, 700)).toBe(true);
    expect(isLargeText(19, 600)).toBe(false);
    expect(requiredContrast(12.5, 500)).toBe(4.5);
    expect(requiredContrast(28, 400)).toBe(3);
  });
});

describe("compositing the paint stack", () => {
  it("flattens an opacity group the way the browser does", () => {
    // A disabled (0.4) violet button on a white card, white text inside it: the text
    // pixel is the group (white over violet, i.e. white) mixed 40% over the card, not
    // white faded over an already faded violet.
    const violet = [124, 58, 237, 1] as [number, number, number, number];
    const card = [255, 255, 255, 1] as [number, number, number, number];
    const groups = [0.4];
    const bg = flatten([{ color: card, groups: [] }, { color: violet, groups: [0] }], groups, [0, 0, 0]);
    const ink = flatten([{ color: card, groups: [] }, { color: violet, groups: [0] }, { color: [255, 255, 255, 1], groups: [0] }], groups, [0, 0, 0]);
    expect(bg.map(Math.round)).toEqual([203, 176, 248]);
    expect(ink.map(Math.round)).toEqual([255, 255, 255]);
  });

  it("stops at the first opaque layer outside every group", () => {
    const result = resolveContrast({ color: "rgb(0, 0, 0)", alpha: 1, groups: [] }, [
      layer("rgba(0, 0, 0, 0)"),
      layer("rgb(255, 255, 255)"),
      layer(null, [], ["backdrop-filter"]),
    ], []);
    expect(result).toEqual({ background: [255, 255, 255], text: [0, 0, 0], contrast: 21 });
  });

  it("composites a translucent wash over the floor under it", () => {
    const result = resolveContrast({ color: "rgb(0, 0, 0)", alpha: 1, groups: [] }, [layer("rgba(0, 0, 0, 0.5)"), layer("rgb(255, 255, 255)")], []);
    expect("background" in result && result.background.map(Math.round)).toEqual([128, 128, 128]);
  });

  it("is indeterminate under a backdrop filter, a gradient or an image above the floor", () => {
    expect(resolveContrast({ color: "rgb(0, 0, 0)", alpha: 1, groups: [] }, [layer("rgba(255, 255, 255, 0.6)", [], ["backdrop-filter"]), layer("rgb(255, 255, 255)")], []))
      .toEqual({ indeterminate: "backdrop-filter on div" });
    expect(resolveContrast({ color: "rgb(0, 0, 0)", alpha: 1, groups: [] }, [layer("rgba(0, 0, 0, 0)", [], ["gradient"], "span")], []))
      .toEqual({ indeterminate: "gradient on span" });
  });

  it("is indeterminate with no opaque layer or an unread colour", () => {
    expect(resolveContrast({ color: "rgb(0, 0, 0)", alpha: 1, groups: [] }, [layer("rgba(255, 255, 255, 0.5)")], [])).toEqual({ indeterminate: "no opaque layer under it" });
    expect(resolveContrast({ color: "oklab(0.5 0 0)", alpha: 1, groups: [] }, [layer("rgb(255, 255, 255)")], [])).toEqual({ indeterminate: "unread text colour oklab(0.5 0 0)" });
  });

  it("applies an SVG text's fill-opacity to its ink", () => {
    const result = resolveContrast({ color: "rgb(0, 0, 0)", alpha: 0.5, groups: [] }, [layer("rgb(255, 255, 255)")], []);
    expect("text" in result && result.text.map(Math.round)).toEqual([128, 128, 128]);
  });
});

describe("a text leaf", () => {
  it("carries its contrast, what it owes, and the floors", () => {
    const derived = deriveText(text({ color: "rgb(119, 119, 119)", size: 9.5 }), []);
    expect(derived.background).toBe("rgb(255, 255, 255)");
    expect(derived.contrast).toBe(4.48);
    expect(derived.required).toBe(4.5);
    expect(derived.contrastFails).toBe(true);
    expect(derived.belowSourceFloor).toBe(true);
    expect(derived.underBodyFloor).toBe(true);
  });

  it("lets a disabled control's text off contrast (WCAG 1.4.3 inactive components)", () => {
    expect(deriveText(text({ color: "rgb(200, 200, 200)", disabled: true }), []).contrastFails).toBe(false);
  });

  it("says why its background is indeterminate", () => {
    const derived = deriveText(text({ stack: null, stackNote: "not-hit" }), []);
    expect(derived).toMatchObject({ background: "indeterminate", indeterminate: "not-hit", contrast: null, contrastFails: false });
  });

  it("tells clipping from truncation and from scrolling", () => {
    expect(deriveText(text({ selfOverflow: { x: 0, y: 3 }, clipsSelf: true }), []).clipped).toEqual({ by: "self", overflow: "self", excess: 3 });
    const truncated = deriveText(text({ selfOverflow: { x: 30, y: 0 }, clipsSelf: true, ellipsis: true }), []);
    expect(truncated.clipped).toBeNull();
    expect(truncated.truncated).toBe(true);
    expect(deriveText(text({ clipper: { overflow: "hidden", excess: 6 } }), []).clipped).toEqual({ by: "ancestor", overflow: "hidden", excess: 6 });
    const scrolled = deriveText(text({ clipper: { overflow: "auto", excess: 120 } }), []);
    expect(scrolled.clipped).toBeNull();
    expect(scrolled.scrolled).toEqual({ overflow: "auto", excess: 120 });
    expect(deriveText(text({ selfOverflow: { x: 1, y: 1 }, clipsSelf: true }), []).clipped).toBeNull();
  });

  it("multiplies its opacity groups", () => {
    expect(deriveText(text({ groups: [0, 1] }), [0.5, 0.4]).opacity).toBe(0.2);
  });
});

describe("a platform row", () => {
  const raw = (platform: RawRow["platform"], width: number, height: number): RawRow => ({
    platform,
    box: { x: 0, y: 0, width: 400, height: 100 },
    scroll: { scrollWidth: 412, clientWidth: 400, scrollHeight: 100, clientHeight: 100 },
    groupOpacity: [],
    texts: [text()],
    interactive: [{ role: "button", name: "Save", tag: "div", box: { x: 0, y: 0, width, height }, state: {}, focusable: true }],
  });

  it("holds each row's targets to its platform's floor and says what it cannot see", () => {
    expect(belowTarget("ios", 44, 44)).toBe(false);
    expect(belowTarget("ios", 60, 43)).toBe(true);
    expect(belowTarget("android", 48, 47.6)).toBe(false);
    expect(belowTarget("android", 47, 60)).toBe(true);
    expect(belowTarget("web", 24, 24)).toBe(false);
    const ios = deriveRow(raw("ios", 80, 36));
    expect(ios.interactive[0]).toMatchObject({ target: 44, unit: "pt", belowTarget: true });
    expect(ios.interactive[0]!.note).toContain("hitSlop unobservable");
    expect(deriveRow(raw("android", 80, 36)).interactive[0]).toMatchObject({ target: 48, belowTarget: true });
    expect(deriveRow(raw("web", 80, 36)).interactive[0]).toMatchObject({ target: 24, belowTarget: false });
    expect(ios.overflowX).toBe(12);
  });

  it("reports which boxes overflow and files the cell under its flags", () => {
    const rows = [deriveRow(raw("ios", 80, 36)), deriveRow(raw("web", 80, 36))];
    const overflow = overflowOf({
      viewport: { width: 390, height: 844 },
      document: { scrollWidth: 390, clientWidth: 390 },
      page: { scrollWidth: 391, clientWidth: 390 },
      card: { scrollWidth: 358, clientWidth: 358, left: 16, right: 402 },
    }, rows);
    expect(overflow.boxes).toEqual({ document: 0, page: 1, card: 12, "row:ios": 12, "row:web": 12 });
    expect(overflow.overflowing).toEqual(["card", "row:ios", "row:web"]);
    const summary = summarizeProbe(rows, overflow.overflowing, { axeViolations: 0, problems: 0, renderFailed: false });
    expect(summary).toMatchObject({ texts: 2, contrastFailures: 0, textUnderBodyFloor: 0, smallTargets: { ios: 1, android: 0, web: 0 } });
    expect(flagsOf(summary)).toEqual(["small-visible-target", "overflow"]);
    expect(flagsOf({ ...summary, smallTargets: { ios: 0, android: 0, web: 1 } })).toEqual(["small-target", "overflow"]);
    expect(flagsOf({ ...summary, smallTargets: { ios: 0, android: 0, web: 0 }, overflowing: [], renderFailed: true, axeViolations: 2 })).toEqual(["render-failed", "axe"]);
  });
});
