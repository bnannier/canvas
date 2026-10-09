import { describe, expect, it } from "bun:test";
import {
  belowTarget,
  contrastOf,
  deriveRow,
  deriveText,
  fieldScrolls,
  flagsOf,
  flatten,
  isLargeText,
  overflowOf,
  paintedSize,
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
    scale: 1,
    weight: 500,
    family: "Manrope",
    color: "rgb(0, 0, 0)",
    colorAlpha: 1,
    svg: false,
    field: null,
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

  it("records the ink as painted where the background is indeterminate: its colour, its own alpha and its opacity", () => {
    const glass = deriveText(text({ svg: true, colorAlpha: 0.6, groups: [0], stack: [layer("rgba(255, 255, 255, 0.4)", [], ["backdrop-filter"])] }), [0.5]);
    expect(glass).toMatchObject({ color: "rgb(0, 0, 0)", colorAlpha: 0.6, opacity: 0.5, ownOpacity: 0.5, contrast: null, indeterminate: "backdrop-filter on div" });
    expect(glass.painted).toBeUndefined();
  });

  it("tells the opacity that dims its ink from the opacity it shares with its backdrop", () => {
    // A pressed button dimmed to 0.9 as a whole (the run's Button pressed state): the label and its fill dim together.
    const pressed = deriveText(text({ color: "rgb(255, 255, 255)", groups: [0], stack: [layer("rgba(0, 0, 0, 0)", [0], [], "span"), layer("rgb(33, 128, 75)", [0], [], "button"), layer("rgb(255, 255, 255)")] }), [0.9]);
    expect(pressed).toMatchObject({ opacity: 0.9, ownOpacity: 1 });
    // A faded label on a card: its ink alone is dimmed.
    expect(deriveText(text({ groups: [0], stack: [layer("rgba(0, 0, 0, 0)", [0]), layer("rgb(255, 255, 255)")] }), [0.6])).toMatchObject({ opacity: 0.6, ownOpacity: 0.6 });
    // Nested: the outer group holds the fill too, the inner one the label alone.
    expect(deriveText(text({ groups: [0, 1], stack: [layer("rgb(240, 240, 240)", [0]), layer("rgb(255, 255, 255)")] }), [0.5, 0.8])).toMatchObject({ opacity: 0.4, ownOpacity: 0.8 });
    // No stack read: nothing to tell them apart by.
    expect(deriveText(text({ groups: [0], stack: null, stackNote: "offscreen" }), [0.5]).ownOpacity).toBeUndefined();
  });
});

describe("the size a text paints at", () => {
  it("is the computed size times the scale its glyphs paint at, to 1/100 px", () => {
    expect(paintedSize(16, 0.75)).toBe(12);
    expect(paintedSize(16, 0.7501)).toBe(12);
    expect(paintedSize(12.5, 1)).toBe(12.5);
  });

  it("is what a floated label is read at: 16 px computed, 12 px painted, the computed size kept", () => {
    const label = deriveText(text({ text: "Country", size: 16, scale: 0.75 }), []);
    expect(label).toMatchObject({ size: 12, computedSize: 16, scale: 0.75, belowSourceFloor: false, underBodyFloor: false });
    const scaledSmall = deriveText(text({ size: 12, scale: 0.75 }), []);
    expect(scaledSmall).toMatchObject({ size: 9, computedSize: 12, belowSourceFloor: true, underBodyFloor: true });
  });

  it("decides the large-text threshold from the painted size, not the computed one", () => {
    expect(deriveText(text({ size: 24, scale: 0.5 }), []).required).toBe(4.5);
    expect(deriveText(text({ size: 16, scale: 1.5 }), []).required).toBe(3);
    expect(deriveText(text({ size: 24, scale: 1 }), []).required).toBe(3);
  });
});

describe("a form control's own text", () => {
  const value = { control: "input", part: "value" } as const;
  const placeholder = { control: "input", part: "placeholder" } as const;

  it("is judged on the control's own background, with a placeholder's colour and opacity", () => {
    // A placeholder in muted ink on the field's white fill, inside a page painted dark: the
    // field's fill is the floor, so the page under it does not count.
    const derived = deriveText(text({
      text: "you@example.com",
      field: placeholder,
      color: "rgb(119, 119, 119)",
      colorAlpha: 0.5,
      stack: [layer("rgb(255, 255, 255)", [], [], "input"), layer("rgb(0, 0, 0)")],
    }), []);
    expect(derived.field).toEqual(placeholder);
    expect(derived.background).toBe("rgb(255, 255, 255)");
    expect(derived.painted).toBe("rgb(187, 187, 187)");
    expect(derived.contrastFails).toBe(true);
  });

  it("carries no field marker on an ordinary text", () => {
    expect("field" in deriveText(text(), [])).toBe(false);
  });

  it("scrolls a field's value that runs past its box, and cuts a placeholder or a select's label", () => {
    expect(fieldScrolls(value)).toBe(true);
    expect(fieldScrolls({ control: "textarea", part: "value" })).toBe(true);
    expect(fieldScrolls(placeholder)).toBe(false);
    expect(fieldScrolls({ control: "select", part: "value" })).toBe(false);
    expect(fieldScrolls(null)).toBe(false);

    const long = deriveText(text({ field: value, selfOverflow: { x: 307, y: 0 }, clipsSelf: true }), []);
    expect(long.clipped).toBeNull();
    expect(long.truncated).toBe(false);
    expect(long.scrolled).toEqual({ overflow: "field", excess: 307 });

    const cut = deriveText(text({ field: placeholder, selfOverflow: { x: 42, y: 0 }, clipsSelf: true }), []);
    expect(cut.clipped).toEqual({ by: "self", overflow: "self", excess: 42 });
    expect(cut.scrolled).toBeNull();

    const ellipsis = deriveText(text({ field: placeholder, selfOverflow: { x: 42, y: 0 }, clipsSelf: true, ellipsis: true }), []);
    expect(ellipsis).toMatchObject({ clipped: null, truncated: true, scrolled: null });

    const select = deriveText(text({ field: { control: "select", part: "value" }, selfOverflow: { x: 8, y: 0 }, clipsSelf: true }), []);
    expect(select.clipped).toEqual({ by: "self", overflow: "self", excess: 8 });
  });

  it("counts a scrolled field value in the summary without flagging the cell", () => {
    const row = deriveRow({
      platform: "web",
      origin: { x: 0, y: 0 },
      box: { x: 0, y: 0, width: 400, height: 100 },
      scroll: { scrollWidth: 400, clientWidth: 400, scrollHeight: 100, clientHeight: 100 },
      groupOpacity: [],
      texts: [text({ field: value, selfOverflow: { x: 307, y: 0 }, clipsSelf: true })],
      interactive: [],
    });
    const summary = summarizeProbe([row], [], { axeViolations: 0, problems: 0, renderFailed: false });
    expect(summary).toMatchObject({ scrolledText: 1, clippedText: 0 });
    expect(flagsOf(summary)).toEqual([]);
  });
});

describe("a platform row", () => {
  const raw = (platform: RawRow["platform"], width: number, height: number): RawRow => ({
    platform,
    origin: { x: 248, y: 316 },
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
    // Where the boxes are measured from passes through, for the photograph that places them.
    expect(ios.origin).toEqual({ x: 248, y: 316 });
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
