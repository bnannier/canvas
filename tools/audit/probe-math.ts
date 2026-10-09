// The arithmetic behind the audit's in-page probe (e2e/support/audit-probes.ts): what a
// raw reading of one platform row means. The probe only reads the DOM (computed styles,
// boxes, the paint stack under a text); everything decided from those readings lives
// here, with no Playwright and no DOM, so it is unit tested and the analysis step
// (plan 1e) reads the same rules.
//
// What is decided here:
// - a text's background, composited from the layers painted under it with each opacity
//   group flattened the way the browser flattens it, or "indeterminate" with the reason
//   (a backdrop filter, a gradient, an image, a blend or a colour filter) when the DOM
//   cannot say what is under it; the analysis samples the photograph for those;
// - the size a text paints at: its computed size times the scale the transforms above it
//   paint its glyphs at (a floating label laid out at 16 px and floated to 12 by a
//   transform is 12 px to a reader);
// - its WCAG contrast against that background and the ratio it owes (3 for large text,
//   4.5 otherwise, by the painted size; a disabled control's text owes none, WCAG 1.4.3's
//   inactive exception);
// - the type floors, by the painted size (the 10 px source floor; 12 px body, which 11 px
//   small and 10 px caption text may sit under by role, so that one is a count, not a
//   failure);
// - whether a text that does not fit is cut, truncated on purpose, or scrolled (a text
//   field's own value scrolls: the caret reaches what does not fit);
// - the touch targets against 44 pt on the iOS row and 48 dp on the Android row, whose
//   visible box is all a browser can see ("hitSlop unobservable": a native skin may
//   extend its target past it), and against WCAG 2.5.8's 24 px on the web row;
// - which boxes overflow horizontally, and the flags a cell is filed under.

import { contrastRatio } from "../../src/style/color.ts";

export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];

/** A box in CSS pixels, relative to the preview card's top-left corner. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ROW_PLATFORMS = ["ios", "android", "web"] as const;
export type RowPlatform = (typeof ROW_PLATFORMS)[number];

/** Dark Factory's 10 px source floor: nothing renders smaller (CLAUDE.md, design language item 4). */
export const SOURCE_FLOOR = 10;
/** The body reading floor; small (11) and tiny or caption (10) roles may sit under it. */
export const BODY_FLOOR = 12;

/** The minimum target per row, and what a browser can and cannot see of it. */
export const TARGET_FLOORS: Record<RowPlatform, { size: number; unit: string; note: string }> = {
  ios: { size: 44, unit: "pt", note: "hitSlop unobservable: the visible box only; a native skin may extend its target past it" },
  android: { size: 48, unit: "dp", note: "hitSlop unobservable: the visible box only; a native skin may extend its target past it" },
  web: { size: 24, unit: "px", note: "WCAG 2.5.8 minimum; its spacing exception is not evaluated" },
};

/** How far a box may overflow before it counts: subpixel layout rounds by up to a pixel. */
export const OVERFLOW_TOLERANCE = 1;

// --- Colour -------------------------------------------------------------------

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

function channel(token: string): number | null {
  if (token.endsWith("%")) {
    const n = Number(token.slice(0, -1));
    return Number.isFinite(n) ? clamp((n / 100) * 255, 0, 255) : null;
  }
  const n = Number(token);
  return Number.isFinite(n) ? clamp(n, 0, 255) : null;
}

function alphaOf(token: string | undefined): number | null {
  if (token === undefined) return 1;
  if (token.endsWith("%")) {
    const n = Number(token.slice(0, -1));
    return Number.isFinite(n) ? clamp(n / 100, 0, 1) : null;
  }
  const n = Number(token);
  return Number.isFinite(n) ? clamp(n, 0, 1) : null;
}

/**
 * A computed CSS colour as [r, g, b, a] (channels 0..255, alpha 0..1), or null for one
 * this cannot read. Reads what Chromium's computed style reports: `rgb()` and `rgba()`
 * in the comma or the space syntax, `color(srgb r g b / a)`, hex, and `transparent`.
 */
export function parseCssColor(value: string): RGBA | null {
  const text = value.trim().toLowerCase();
  if (text === "transparent") return [0, 0, 0, 0];
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text);
  if (hex) {
    const h = hex[1]!;
    const full = h.length <= 4 ? h.split("").map((c) => c + c).join("") : h;
    const a = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16), a];
  }
  const rgb = /^rgba?\((.*)\)$/.exec(text);
  if (rgb) {
    const [body, slash] = rgb[1]!.split("/");
    const parts = body!.split(/[\s,]+/).filter(Boolean);
    const alphaToken = slash !== undefined ? slash.trim() : parts[3];
    if (parts.length < 3 || parts.length > (slash !== undefined ? 3 : 4)) return null;
    const [r, g, b] = parts.slice(0, 3).map(channel);
    const a = alphaOf(alphaToken);
    return r == null || g == null || b == null || a == null ? null : [r, g, b, a];
  }
  const srgb = /^color\(srgb\s+([^/)]+)(?:\/\s*([^)]+))?\)$/.exec(text);
  if (srgb) {
    const parts = srgb[1]!.trim().split(/\s+/);
    if (parts.length !== 3) return null;
    const values = parts.map((p) => (p.endsWith("%") ? Number(p.slice(0, -1)) / 100 : Number(p)));
    if (values.some((v) => !Number.isFinite(v))) return null;
    const a = alphaOf(srgb[2]?.trim());
    if (a == null) return null;
    return [clamp(values[0]! * 255, 0, 255), clamp(values[1]! * 255, 0, 255), clamp(values[2]! * 255, 0, 255), a];
  }
  return null;
}

/** `top` painted over the opaque `under` (source-over). */
export function over(top: RGBA, under: RGB): RGB {
  const a = top[3];
  return [top[0] * a + under[0] * (1 - a), top[1] * a + under[1] * (1 - a), top[2] * a + under[2] * (1 - a)];
}

/** `from` toward `to` by `t` (0 keeps `from`). */
export function lerp(from: RGB, to: RGB, t: number): RGB {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

export function rgbString(color: RGB): string {
  return `rgb(${color.map((c) => Math.round(c)).join(", ")})`;
}

/** WCAG 2 contrast between two opaque colours, through the kit's own WCAG math. */
export function contrastOf(a: RGB, b: RGB): number {
  return contrastRatio(rgbString(a), rgbString(b));
}

/**
 * The weight a text renders at. The kit loads one family per weight (`Manrope_600SemiBold`)
 * and sets no CSS weight on it, so the face's own weight, named in the family, wins over
 * the computed `font-weight` (400); any other family renders at its CSS weight.
 */
export function renderedWeight(family: string, cssWeight: number): number {
  const named = /_(\d)00[A-Za-z]*$/.exec(family);
  return named ? Number(named[1]) * 100 : cssWeight;
}

/** WCAG's large text: 24 px and up, or 18.66 px (14 pt) and up at a bold weight. */
export function isLargeText(sizePx: number, weight: number): boolean {
  return sizePx >= 24 || (sizePx >= 18.66 && weight >= 700);
}

/** The contrast a text owes: 3 for large text, 4.5 otherwise (WCAG 1.4.3). */
export function requiredContrast(sizePx: number, weight: number): number {
  return isLargeText(sizePx, weight) ? 3 : 4.5;
}

// --- The paint stack ------------------------------------------------------------

/** One layer painted at a text's sample point, as the probe read it. */
export interface RawLayer {
  /** The element's local name, for a reader. */
  tag: string;
  /** The colour it paints at that point (its background, or an SVG shape's fill), or null for none. */
  fill: string | null;
  /** An SVG shape's fill-opacity; 1 for everything else. */
  fillAlpha: number;
  /** Why the DOM cannot say what this layer paints: "backdrop-filter", "gradient", "image", "blend", "filter". */
  kinds: string[];
  /** The opacity groups it paints inside, outermost first, as ids into the row's group table. */
  groups: number[];
}

interface Layer {
  color: RGBA;
  groups: number[];
}

/**
 * Composite `layers` (bottom to top) over the opaque `under`, flattening each opacity
 * group the way the browser does: a group's layers are composited over what lies under
 * the group, then the group is mixed in at its opacity. For source-over that is exactly
 * the isolated-group result, and it keeps a disabled button's text and its fill fading
 * together instead of the text fading over an already faded fill.
 */
export function flatten(layers: Layer[], opacity: readonly number[], under: RGB, depth = 0): RGB {
  let out = under;
  for (let i = 0; i < layers.length; ) {
    const group = layers[i]!.groups[depth];
    if (group === undefined) {
      out = over(layers[i]!.color, out);
      i += 1;
      continue;
    }
    let end = i;
    while (end < layers.length && layers[end]!.groups[depth] === group) end += 1;
    out = lerp(out, flatten(layers.slice(i, end), opacity, out, depth + 1), opacity[group] ?? 1);
    i = end;
  }
  return out;
}

export type Resolution =
  | { background: RGB; text: RGB; contrast: number }
  | { indeterminate: string };

/**
 * The background a text sits on and its contrast against it.
 *
 * `below` is the paint stack under the text, topmost first, starting with the text's
 * own element (its own background). The walk stops at the first opaque layer outside
 * every opacity group, since nothing under it shows; any layer down to there that the
 * DOM cannot resolve makes the answer indeterminate, with its reason.
 */
export function resolveContrast(
  text: { color: string; alpha: number; groups: number[] },
  below: RawLayer[],
  opacity: readonly number[],
): Resolution {
  const relevant: Layer[] = [];
  let floored = false;
  for (const layer of below) {
    if (layer.kinds.length) return { indeterminate: `${layer.kinds[0]} on ${layer.tag}` };
    if (layer.fill === null) continue;
    const parsed = parseCssColor(layer.fill);
    if (!parsed) return { indeterminate: `unread colour ${layer.fill} on ${layer.tag}` };
    const color: RGBA = [parsed[0], parsed[1], parsed[2], parsed[3] * layer.fillAlpha];
    if (color[3] === 0) continue;
    relevant.push({ color, groups: layer.groups });
    if (color[3] >= 0.999 && layer.groups.length === 0) {
      floored = true;
      break;
    }
  }
  if (!floored) return { indeterminate: "no opaque layer under it" };
  const ink = parseCssColor(text.color);
  if (!ink) return { indeterminate: `unread text colour ${text.color}` };
  const stack = relevant.reverse();
  const base: RGB = [255, 255, 255];
  const background = flatten(stack, opacity, base);
  const painted = flatten([...stack, { color: [ink[0], ink[1], ink[2], ink[3] * text.alpha], groups: text.groups }], opacity, base);
  return { background, text: painted, contrast: Math.round(contrastOf(painted, background) * 100) / 100 };
}

// --- One row --------------------------------------------------------------------

/** Which of a form control's own texts a text is: the DOM holds these in no text node. */
export interface FieldPart {
  control: "input" | "textarea" | "select";
  /** A field's value (a select's chosen label), or its placeholder while that shows. */
  part: "value" | "placeholder";
}

/** A text leaf as the probe read it: an element with text of its own, or a form control's. */
export interface RawText {
  text: string;
  box: Box;
  /** The computed font size, CSS px (an SVG text's in its user units). */
  size: number;
  /**
   * The scale its glyphs paint at vertically: every transform above it composed (an SVG
   * text's screen CTM, its viewBox included). 1 when nothing scales it.
   */
  scale: number;
  weight: number;
  family: string;
  /** The computed text colour (an SVG text's fill). */
  color: string;
  /** An SVG text's fill-opacity; 1 for HTML text. */
  colorAlpha: number;
  svg: boolean;
  /** Set when the text is a form control's value or placeholder rather than a text node. */
  field: FieldPart | null;
  ariaHidden: boolean;
  disabled: boolean;
  /** The opacity groups it paints inside, outermost first. */
  groups: number[];
  /** How far its own content overflows its box, or null for a box with no client size. */
  selfOverflow: { x: number; y: number } | null;
  /** Whether its own box clips (any overflow but visible). */
  clipsSelf: boolean;
  /** Whether it truncates on purpose (an ellipsis or a line clamp). */
  ellipsis: boolean;
  /** The first ancestor, up to the row, whose clipping box the text runs out of. */
  clipper: { overflow: string; excess: number } | null;
  /** The paint stack under it, topmost first from its own element, or null when it could not be read. */
  stack: RawLayer[] | null;
  /** Why there is no stack: "offscreen", or "not-hit" when the point shows something else. */
  stackNote: string | null;
  /** Whether something not inside it paints over its sample point. */
  covered: boolean;
}

export interface RawInteractive {
  role: string;
  name: string;
  tag: string;
  box: Box;
  state: Record<string, string>;
  focusable: boolean;
}

export interface RawRow {
  platform: RowPlatform;
  box: Box;
  scroll: { scrollWidth: number; clientWidth: number; scrollHeight: number; clientHeight: number };
  /** Opacity by group id. */
  groupOpacity: number[];
  texts: RawText[];
  interactive: RawInteractive[];
}

export interface ProbeText {
  text: string;
  box: Box;
  /**
   * The size it paints at, CSS px: `computedSize` times `scale`, to 1/100. The floors and
   * the large-text threshold are judged on this.
   */
  size: number;
  /** The computed font size, before any transform. */
  computedSize: number;
  /** The scale its glyphs paint at (1 when nothing scales it). */
  scale: number;
  weight: number;
  family: string;
  color: string;
  /**
   * The alpha its glyphs paint with beside the colour's own: an SVG text's fill-opacity, a
   * placeholder's own opacity, 1 for every other text. With `color` and `opacity` it is the
   * ink as painted, which the analysis composites over the photographed background where the
   * DOM could not resolve one. Absent from probes written before it was recorded.
   */
  colorAlpha?: number;
  /** The opacity it paints at: every group it is inside, multiplied. */
  opacity: number;
  svg: boolean;
  /** A form control's value or placeholder, when that is what the text is. */
  field?: FieldPart;
  ariaHidden: boolean;
  disabled: boolean;
  /** The resolved background as `rgb(...)`, or "indeterminate". */
  background: string;
  indeterminate?: string;
  /** The text colour as painted (its opacity and alpha composited), when the background resolved. */
  painted?: string;
  contrast: number | null;
  required: number;
  contrastFails: boolean;
  belowSourceFloor: boolean;
  underBodyFloor: boolean;
  /** Cut by a box that hides overflow (its own, without an ellipsis, or an ancestor's). */
  clipped: { by: "self" | "ancestor"; overflow: string; excess: number } | null;
  /**
   * Reachable by scrolling, so counted, not flagged: running out of a scrolling ancestor, or
   * a text field's value running past its content box (`overflow: "field"`).
   */
  scrolled: { overflow: string; excess: number } | null;
  truncated: boolean;
  covered: boolean;
}

export interface ProbeTarget extends RawInteractive {
  target: number;
  unit: string;
  belowTarget: boolean;
  note: string;
}

export interface ProbeRow {
  platform: RowPlatform;
  box: Box;
  overflowX: number;
  texts: ProbeText[];
  interactive: ProbeTarget[];
}

const SCROLLING = new Set(["auto", "scroll"]);

/** The size a text paints at: its computed size times its glyph scale, to 1/100 px. */
export function paintedSize(computedSize: number, scale: number): number {
  return Math.round(computedSize * scale * 100) / 100;
}

/**
 * Whether a control's text that runs past its content box can still be reached: a text
 * field's value scrolls under the caret, while a placeholder and a select's label are cut.
 */
export function fieldScrolls(field: FieldPart | null): boolean {
  return field !== null && field.part === "value" && field.control !== "select";
}

export function deriveText(raw: RawText, groupOpacity: readonly number[]): ProbeText {
  const opacity = raw.groups.reduce((product, id) => product * (groupOpacity[id] ?? 1), 1);
  const weight = renderedWeight(raw.family, raw.weight);
  const size = paintedSize(raw.size, raw.scale);
  const required = requiredContrast(size, weight);
  const resolution: Resolution = raw.stack
    ? resolveContrast({ color: raw.color, alpha: raw.colorAlpha, groups: raw.groups }, raw.stack, groupOpacity)
    : { indeterminate: raw.stackNote ?? "no paint stack" };
  const resolved = "contrast" in resolution ? resolution : null;
  const selfExcess = raw.selfOverflow ? Math.max(raw.selfOverflow.x, raw.selfOverflow.y) : 0;
  const selfCut = raw.clipsSelf && selfExcess > OVERFLOW_TOLERANCE;
  const scrollsItself = fieldScrolls(raw.field);
  const clipper = raw.clipper && raw.clipper.excess > OVERFLOW_TOLERANCE ? raw.clipper : null;
  let clipped: ProbeText["clipped"] = null;
  if (selfCut && !raw.ellipsis && !scrollsItself) clipped = { by: "self", overflow: "self", excess: selfExcess };
  else if (clipper && !SCROLLING.has(clipper.overflow)) clipped = { by: "ancestor", overflow: clipper.overflow, excess: clipper.excess };
  let scrolled: ProbeText["scrolled"] = null;
  if (selfCut && scrollsItself) scrolled = { overflow: "field", excess: selfExcess };
  else if (clipper && SCROLLING.has(clipper.overflow)) scrolled = { overflow: clipper.overflow, excess: clipper.excess };
  return {
    text: raw.text,
    box: raw.box,
    size,
    computedSize: raw.size,
    scale: raw.scale,
    weight,
    family: raw.family,
    color: raw.color,
    colorAlpha: raw.colorAlpha,
    opacity: Math.round(opacity * 1000) / 1000,
    svg: raw.svg,
    ...(raw.field ? { field: raw.field } : {}),
    ariaHidden: raw.ariaHidden,
    disabled: raw.disabled,
    background: resolved ? rgbString(resolved.background) : "indeterminate",
    ...(resolved ? { painted: rgbString(resolved.text) } : { indeterminate: (resolution as { indeterminate: string }).indeterminate }),
    contrast: resolved ? resolved.contrast : null,
    required,
    contrastFails: resolved !== null && !raw.disabled && resolved.contrast < required,
    belowSourceFloor: size < SOURCE_FLOOR,
    underBodyFloor: size < BODY_FLOOR,
    clipped,
    scrolled,
    truncated: selfCut && raw.ellipsis && !scrollsItself,
    covered: raw.covered,
  };
}

/** A visible box below the target on either axis; half a pixel of rounding is forgiven. */
export function belowTarget(platform: RowPlatform, width: number, height: number): boolean {
  const floor = TARGET_FLOORS[platform].size;
  return Math.min(width, height) < floor - 0.5;
}

export function deriveRow(raw: RawRow): ProbeRow {
  const floor = TARGET_FLOORS[raw.platform];
  return {
    platform: raw.platform,
    box: raw.box,
    overflowX: raw.scroll.scrollWidth - raw.scroll.clientWidth,
    texts: raw.texts.map((text) => deriveText(text, raw.groupOpacity)),
    interactive: raw.interactive.map((item) => ({
      ...item,
      target: floor.size,
      unit: floor.unit,
      belowTarget: belowTarget(raw.platform, item.box.width, item.box.height),
      note: floor.note,
    })),
  };
}

// --- The page around the card -----------------------------------------------------

export interface RawPageOverflow {
  viewport: { width: number; height: number };
  document: { scrollWidth: number; clientWidth: number };
  /** The docs page scroller (`[data-page-scroll]`), or null on a page without one. */
  page: { scrollWidth: number; clientWidth: number } | null;
  card: { scrollWidth: number; clientWidth: number; left: number; right: number };
}

/**
 * How far each box overflows horizontally, in CSS px: the document, the page scroller,
 * the card (its own content, or the card itself past either viewport edge) and each
 * row, and the ones past the tolerance.
 */
export function overflowOf(page: RawPageOverflow, rows: ProbeRow[]): { boxes: Record<string, number>; overflowing: string[] } {
  const boxes: Record<string, number> = {
    document: page.document.scrollWidth - page.document.clientWidth,
    ...(page.page ? { page: page.page.scrollWidth - page.page.clientWidth } : {}),
    card: Math.round(Math.max(page.card.scrollWidth - page.card.clientWidth, page.card.right - page.viewport.width, -page.card.left) * 10) / 10,
  };
  for (const row of rows) boxes[`row:${row.platform}`] = row.overflowX;
  return { boxes, overflowing: Object.entries(boxes).filter(([, by]) => by > OVERFLOW_TOLERANCE).map(([box]) => box) };
}

// --- The cell's summary -----------------------------------------------------------

export interface ProbeSummary {
  texts: number;
  textBelowSourceFloor: number;
  textUnderBodyFloor: number;
  contrastFailures: number;
  contrastIndeterminate: number;
  clippedText: number;
  scrolledText: number;
  truncatedText: number;
  coveredText: number;
  targets: number;
  smallTargets: Record<RowPlatform, number>;
  overflowing: string[];
  axeViolations: number;
  problems: number;
  renderFailed: boolean;
}

export function summarizeProbe(
  rows: ProbeRow[],
  overflowing: string[],
  extra: { axeViolations: number; problems: number; renderFailed: boolean },
): ProbeSummary {
  const texts = rows.flatMap((row) => row.texts);
  const smallTargets = { ios: 0, android: 0, web: 0 } as Record<RowPlatform, number>;
  for (const row of rows) smallTargets[row.platform] = row.interactive.filter((item) => item.belowTarget).length;
  return {
    texts: texts.length,
    textBelowSourceFloor: texts.filter((t) => t.belowSourceFloor).length,
    textUnderBodyFloor: texts.filter((t) => t.underBodyFloor && !t.belowSourceFloor).length,
    contrastFailures: texts.filter((t) => t.contrastFails).length,
    contrastIndeterminate: texts.filter((t) => t.contrast === null).length,
    clippedText: texts.filter((t) => t.clipped).length,
    scrolledText: texts.filter((t) => t.scrolled).length,
    truncatedText: texts.filter((t) => t.truncated).length,
    coveredText: texts.filter((t) => t.covered).length,
    targets: rows.reduce((n, row) => n + row.interactive.length, 0),
    smallTargets,
    overflowing,
    ...extra,
  };
}

/**
 * The flags a cell is filed under, in a fixed order: the things a reviewer must look at.
 * A web row's target under 24 px is `small-target`; an iOS or Android row's visible box
 * under 44 or 48 is `small-visible-target`, since the hitSlop that may make up the rest is
 * not observable in a browser. Counts that are legitimate by role or by design (text under
 * the body floor, scrolled text, indeterminate contrast that the analysis samples from the
 * photograph) are in the summary but raise no flag.
 */
export function flagsOf(summary: ProbeSummary): string[] {
  const flags: string[] = [];
  if (summary.renderFailed) flags.push("render-failed");
  if (summary.problems) flags.push("problems");
  if (summary.textBelowSourceFloor) flags.push("text-floor");
  if (summary.contrastFailures) flags.push("contrast");
  if (summary.clippedText) flags.push("clipped-text");
  if (summary.smallTargets.web) flags.push("small-target");
  if (summary.smallTargets.ios || summary.smallTargets.android) flags.push("small-visible-target");
  if (summary.overflowing.length) flags.push("overflow");
  if (summary.axeViolations) flags.push("axe");
  return flags;
}
