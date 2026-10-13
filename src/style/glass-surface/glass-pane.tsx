// GlassPane: the glass material as a layer BEHIND a node's own content, for the
// surfaces a component cannot hand to GlassSurface outright because the node that
// draws them also owns something else: a Pressable's tap, ripple and pressed dim, an
// alert's live-region semantics, a text field's native input. The parent keeps its
// layout, its accessibility and its interaction; under glass it drops its opaque fill
// and trades its resting border for padding (see `paneStyle`), and renders a GlassPane
// as its first child, which paints the layer's tint, material and rim across the
// parent's whole footprint, clipped to the parent's corners, with taps passing through.
// Wherever its material resolves solid it renders nothing at all: in solid mode, under
// Reduce Transparency or Increase Contrast, and where glass is requested but cannot
// render (a missing optional peer, a browser without a backdrop filter, an Android
// surface in the page, which has no capture plane it may safely sample). The parent
// reads the same decision through `useMaterialTheme`, keeps its complete solid skin
// there, and the solid tree is byte-identical to the pre-glass one.

import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { type ThemeValue } from "../theme.js";
import { isGlass } from "../glass-fill.js";
import { GlassSurface } from "./glass-surface.js";
import { borderSides, clearedPaint, contrastBorderFor, type BorderSides, type GlassLayer } from "./glass-surface.shared.js";
import { useMaterialResolution } from "./use-material-theme.js";

/**
 * The props of `GlassPane`: the layer and material options of the host it paints behind,
 * the host's shape, and its tint.
 */
export interface GlassPaneProps {
  /**
   * The layer of the glass model the host belongs to, which picks the pane's tint and
   * blur: `control` (fields, buttons, chips, badges, pucks), `content` (cards, alerts,
   * lists, charts), `functional` (bars, tracks) or `dense` (menus, tooltips). Defaults to
   * `control`.
   */
  layer?: GlassLayer;
  /**
   * Frost in place of Liquid Glass: on iOS 26 a pane renders Apple's Liquid Glass unless
   * it is static. Defaults to true on the `content` layer and false on the others.
   */
  static?: boolean;
  /** An unblurred translucent fill instead of the frost (a field on its pane), as Dark Factory draws its inputs on the web. */
  clear?: boolean;
  /**
   * The host's shape style. Only its corner radii and `borderCurve` are read: they shape
   * the pane's clip and rim. Its fill and border are the host's own.
   */
  shape?: StyleProp<ViewStyle>;
  /**
   * The host keeps its border over this pane: a border showing a state, `paneStyle`'s
   * third argument (a focused field, an open trigger, the current step). The pane fills
   * the host's padding box inside that border, and its corners take the shape's radii less
   * the border's width, so the material meets the border with no gap. Defaults to false,
   * where the host's resting border is padding under glass and the pane covers the host's
   * whole footprint with the shape's own radii.
   */
  stateBorder?: boolean;
  /** The under-fill in place of the layer's tint: a toned wash, held legible by `legibleWash`. */
  tint?: string;
  /** A brand colour for a brand-tinted puck (a primary Button, a checked Switch), its under-fill solved for the ink painted on it. */
  brand?: string;
  /** Interactive Liquid Glass on iOS 26 (see GlassSurface). */
  interactive?: boolean;
  /** E2E hook forwarded to the pane. */
  testID?: string;
}

/**
 * The glass material of a host's layer, painted as the host's first child: an absolutely
 * filled, pointer-transparent layer behind the host's content, clipped to the host's
 * corners, for a host that keeps its own node because it owns something else (a
 * Pressable's press and ripple, a live region, a native text input). It renders nothing
 * wherever its material resolves solid: in solid mode, under Reduce Transparency or
 * Increase Contrast, and where glass is requested but cannot render.
 *
 * Geometry: the pane fills the host's padding box. Under glass `paneStyle` turns a resting
 * border into padding of the same width, so that box is the host's whole solid footprint
 * and the material covers the control's full size, the material's rim its edge. A host
 * that keeps a state border passes `stateBorder`, and the pane sits flush inside that
 * border with concentric corners. A pane beside a text field (a sibling inside a
 * borderless wrapper the field fills) covers the wrapper, the field's whole footprint,
 * and the field's own state border paints over it.
 *
 * Accessibility: the pane adds nothing to the accessibility tree and takes nothing from
 * it. It has no role, no label and no focus stop, its material is hidden from VoiceOver
 * and TalkBack, and on the web its node is an empty, pointer-transparent box, so a screen
 * reader and the keyboard meet only the host, with the host's name, role and state as in
 * solid mode. Taps pass through it to the host and its hit slop. Under Reduce
 * Transparency and Increase Contrast it renders nothing and the host keeps its opaque
 * skin, with the contrasting border under Increase Contrast (`paneStyle`).
 */
export function GlassPane({ layer = "control", shape, stateBorder = false, tint, brand, interactive, testID, static: stable, clear }: GlassPaneProps) {
  // A solid pane would paint a raw copy of the shape inside a host that already shows it.
  const { material } = useMaterialResolution({ static: stable, layer });
  if (material.renderer === "solid") return null;
  return <GlassSurface static={stable} clear={clear} layer={layer} tint={tint} brand={brand} interactive={interactive} pointerEvents="none" testID={testID} style={[StyleSheet.absoluteFill, paneShape(shape, stateBorder), BEHIND]} />;
}

// The pane paints beneath every sibling inside its host, on every platform: each host is
// a stacking context (a React Native Web View is `position: relative` with `z-index: 0`),
// so a negative order keeps it above the host's own background and below its content.
const BEHIND: ViewStyle = { zIndex: -1 };

const RADIUS_KEYS = [
  "borderRadius",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
  "borderTopStartRadius", "borderTopEndRadius", "borderBottomStartRadius", "borderBottomEndRadius",
] as const;
type RadiusKey = (typeof RADIUS_KEYS)[number];

/** The sides a corner meets (a physical left or right corner read as start or end, as `borderSides` reads a side). */
function cornerSides(key: RadiusKey): readonly (keyof BorderSides)[] {
  if (key === "borderRadius") return ["top", "bottom", "start", "end"];
  return [key.startsWith("borderTop") ? "top" : "bottom", /Left|Start/.test(key) ? "start" : "end"];
}

/**
 * The pane's own shape: the host's corner radii and `borderCurve`, and nothing else. Inside
 * a kept border each radius is less the narrower border it meets, the inner curve of that
 * border, so the pane's corner never leaves a gap and never pokes over the border.
 */
function paneShape(shape: StyleProp<ViewStyle>, inside: boolean): ViewStyle {
  const flat = (StyleSheet.flatten(shape) ?? {}) as ViewStyle;
  const sides = inside ? borderSides(flat) : null;
  const out: Record<string, unknown> = {};
  for (const key of RADIUS_KEYS) {
    const radius = flat[key];
    if (radius == null) continue;
    out[key] = sides && typeof radius === "number" ? Math.max(0, radius - Math.min(...cornerSides(key).map((side) => sides[side]))) : radius;
  }
  if (flat.borderCurve != null) out.borderCurve = flat.borderCurve;
  return out as ViewStyle;
}

/**
 * A surface style for a node that renders a GlassPane behind its content. In solid mode
 * it is returned unchanged (under Increase Contrast with the contrasting border, see
 * `contrastBorderFor`). Under glass the node's opaque fill is dropped, the pane's material
 * carries it, and so is its border's paint:
 *
 * - A resting border becomes padding of the same width on each side. The node keeps its
 *   size and its content stays where it was, while its padding box, the box the pane
 *   fills, grows to the node's whole footprint: the material covers the control's full
 *   solid size and the material's rim is its edge.
 * - A border that shows a state (`stateBorder`: a focused or errored field, an open
 *   trigger, the current step) stays a border, in its own colour, over the pane, as
 *   GlassBox keeps one over its material; give the pane `stateBorder` too, so it sits
 *   flush inside it. Under Increase Contrast the contrasting border does not overwrite it.
 *
 * Hand it the node's whole box, every style that sets its padding or its border: a padding
 * set after it would replace the padding a border became. An absolutely placed child of
 * the node counts its offsets from the grown padding box, so it takes `panePlaced` to keep
 * its place.
 *
 * `appearance` is the resolved material the pane mounts from, for the pane's layer and
 * `static`, so the node keeps its own fill and border exactly where the pane renders
 * nothing (the kit's components read it from their material resolution). A theme from
 * `useTheme()` is the requested surface: wherever requested glass resolves solid (an
 * Android surface in the page, a missing optional peer, a browser without a backdrop
 * filter) the node would drop its fill and border while its pane renders nothing.
 */
export function paneStyle(appearance: boolean | ThemeValue, style: StyleProp<ViewStyle>, stateBorder = false): StyleProp<ViewStyle> {
  const glass = typeof appearance === "boolean" ? appearance : isGlass(appearance);
  if (!glass) return typeof appearance !== "boolean" && appearance.increasedContrast
    ? [style, contrastBorderFor(appearance.tokens, style, stateBorder)] : style;
  return [style, stateBorder ? clearedPaint(style, true) : borderAsPadding(style)];
}

const NO_SIDES: BorderSides = { top: 0, bottom: 0, start: 0, end: 0 };

/**
 * Each side's border width and padding keys, the logical ones first, then for start and end
 * the physical left and right ones a style may name instead.
 */
const SIDE_KEYS: Readonly<Record<keyof BorderSides, readonly [border: string, padding: string, physicalBorder?: string, physicalPadding?: string]>> = {
  top: ["borderTopWidth", "paddingTop"],
  bottom: ["borderBottomWidth", "paddingBottom"],
  start: ["borderStartWidth", "paddingStart", "borderLeftWidth", "paddingLeft"],
  end: ["borderEndWidth", "paddingEnd", "borderRightWidth", "paddingRight"],
};
const SIDES = Object.keys(SIDE_KEYS) as (keyof BorderSides)[];
const PHYSICAL_KEYS = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"];

/**
 * The border widths a resting host trades for padding under glass, per side: each side's
 * own border, resolved as React Native resolves it (`borderSides`), except where that side's
 * padding is not a number (a percentage), which cannot take the border's width and keeps it.
 */
function tradedSides(flat: Readonly<Record<string, unknown>>): BorderSides {
  const sides = borderSides(flat as ViewStyle);
  const pads = paddingSides(flat);
  const out = { ...NO_SIDES };
  for (const side of SIDES) if (typeof pads[side] === "number") out[side] = sides[side];
  return out;
}

/**
 * A resting border traded for padding: every border width the style names becomes 0 and
 * each side's padding grows by that side's border width, with the fill and border colours
 * cleared (`clearedPaint`). A side whose padding is not a number keeps its border,
 * transparent. Where the style names a physical left or right width or padding, the
 * physical keys are restated beside the logical ones with the same values, so whichever of
 * the two a renderer ranks first gives the same box.
 */
function borderAsPadding(style: StyleProp<ViewStyle>): ViewStyle {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const out = clearedPaint(flat, false) as Record<string, unknown>;
  const traded = tradedSides(flat);
  if (!SIDES.some((side) => traded[side] > 0)) return out as ViewStyle;
  const sides = borderSides(flat as ViewStyle);
  const pads = paddingSides(flat);
  const physical = PHYSICAL_KEYS.some((key) => flat[key] != null);
  out.borderWidth = 0;
  for (const side of SIDES) {
    const [border, padding, physicalBorder, physicalPadding] = SIDE_KEYS[side];
    out[border] = sides[side] - traded[side];
    if (physical && physicalBorder) out[physicalBorder] = out[border];
    if (traded[side] === 0) continue;
    out[padding] = (pads[side] as number) + traded[side];
    if (physical && physicalPadding) out[physicalPadding] = out[padding];
  }
  return out as ViewStyle;
}

/**
 * How far a pane host's padding box reaches over its border under glass, per side: the
 * resting border `paneStyle` turns into padding. Absolute offsets count from that box, so an
 * absolutely placed child adds these to keep the place solid gives it (`panePlaced`). All
 * zero wherever `paneStyle` returns the host's style unchanged: in solid mode, and for a host
 * that keeps its border (`stateBorder`).
 */
export function paneEdges(appearance: boolean | ThemeValue, style: StyleProp<ViewStyle>, stateBorder = false): BorderSides {
  const glass = typeof appearance === "boolean" ? appearance : isGlass(appearance);
  if (!glass || stateBorder) return NO_SIDES;
  return tradedSides((StyleSheet.flatten(style) ?? {}) as Record<string, unknown>);
}

/**
 * An absolutely placed child of a pane host (a switch thumb, a label layer), kept where
 * solid places it: each side the child is pinned to by a number gains the host's
 * `paneEdges` there (a physical left or right read as start or end). Returned unchanged
 * where those are all zero, so the solid tree is untouched.
 */
export function panePlaced(appearance: boolean | ThemeValue, host: StyleProp<ViewStyle>, child: StyleProp<ViewStyle>, stateBorder = false): StyleProp<ViewStyle> {
  const edges = paneEdges(appearance, host, stateBorder);
  if (!SIDES.some((side) => edges[side] > 0)) return child;
  const flat = (StyleSheet.flatten(child) ?? {}) as Record<string, unknown>;
  const sideOf: Record<string, keyof BorderSides> = { top: "top", bottom: "bottom", start: "start", left: "start", end: "end", right: "end" };
  const moved: Record<string, number> = {};
  for (const [key, side] of Object.entries(sideOf)) {
    const offset = flat[key];
    if (typeof offset === "number" && edges[side] > 0) moved[key] = offset + edges[side];
  }
  return Object.keys(moved).length ? [child, moved as ViewStyle] : child;
}

/** A style's padding on each side, resolved as `borderSides` resolves the border. */
function paddingSides(flat: Readonly<Record<string, unknown>>): Record<keyof BorderSides, unknown> {
  const all = flat.padding ?? 0;
  const vertical = flat.paddingVertical ?? all;
  const horizontal = flat.paddingHorizontal ?? all;
  return {
    top: flat.paddingTop ?? vertical,
    bottom: flat.paddingBottom ?? vertical,
    start: flat.paddingStart ?? flat.paddingLeft ?? horizontal,
    end: flat.paddingEnd ?? flat.paddingRight ?? horizontal,
  };
}

/**
 * The style the kit gave a TextInput beside a GlassPane, `position: relative`, kept for
 * compatibility. It once restored the input's paint order over the pane on the web, where
 * React Native Web leaves a text input unpositioned and CSS paints positioned boxes after
 * in-flow ones. It changes nothing now: the pane orders itself behind its siblings on
 * every platform (`zIndex: -1` inside its host).
 */
export const PANE_SIBLING_INPUT: ViewStyle = { position: "relative" };
