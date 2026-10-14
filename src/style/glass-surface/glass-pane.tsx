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

import { StyleSheet, type PressableAndroidRippleConfig, type StyleProp, type ViewStyle } from "react-native";
import { type ThemeValue } from "../theme.js";
import { isGlass } from "../glass-fill.js";
import { GlassSurface } from "./glass-surface.js";
import {
  NO_SIDES, borderAsPadding, clearedPaint, contrastBorderFor, materialCorners, placedInside, tradedSides,
  type BorderSides, type GlassLayer,
} from "./glass-surface.shared.js";
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
  /** A brand colour for a brand-tinted puck (a primary Button, a selected tab), its under-fill solved for the ink painted on it. */
  brand?: string;
  /**
   * @deprecated A no-op, kept so existing code compiles until a major. The pane passes every
   * tap through to its host (`pointerEvents="none"`), so iOS never delivers it the touch
   * Apple's interactive Liquid Glass responds to, and the host's own press feedback (its
   * dim, its Android ripple) carries the press. Omit it.
   */
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
 * solid mode. Taps pass through it to the host and its hit slop, and a Pressable host hands
 * its Android ripple to `paneRipple`, so the press draws over the pane. Under Reduce
 * Transparency and Increase Contrast it renders nothing and the host keeps its opaque
 * skin, with the contrasting border under Increase Contrast (`paneStyle`).
 */
export function GlassPane({ layer = "control", shape, stateBorder = false, tint, brand, testID, static: stable, clear }: GlassPaneProps) {
  // A solid pane would paint a raw copy of the shape inside a host that already shows it.
  const { material } = useMaterialResolution({ static: stable, layer });
  if (material.renderer === "solid") return null;
  // `interactive` is not forwarded: a surface under pointerEvents "none" never receives the
  // touch interactive Liquid Glass answers, so it only reinstalled the effect on each toggle.
  return <GlassSurface static={stable} clear={clear} layer={layer} tint={tint} brand={brand} pointerEvents="none" testID={testID} style={[StyleSheet.absoluteFill, paneShape(shape, stateBorder), BEHIND]} />;
}

// The pane paints beneath every sibling inside its host, on every platform: each host is
// a stacking context (a React Native Web View is `position: relative` with `z-index: 0`),
// so a negative order keeps it above the host's own background and below its content.
const BEHIND: ViewStyle = { zIndex: -1 };

/**
 * The pane's own shape: the host's corner radii and `borderCurve`, and nothing else. Inside
 * a kept border each radius is less the narrower border it meets (`materialCorners`).
 */
function paneShape(shape: StyleProp<ViewStyle>, inside: boolean): ViewStyle {
  const curve = ((StyleSheet.flatten(shape) ?? {}) as ViewStyle).borderCurve;
  return curve != null ? { ...materialCorners(shape, inside), borderCurve: curve } : materialCorners(shape, inside);
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

/**
 * The Android ripple of a Pressable whose press a GlassPane would hide: the host's own ripple
 * config moved to the foreground wherever the pane renders, and returned as given (the same
 * object) everywhere else, so the solid tree is byte-identical.
 *
 * A ripple is the Pressable's background drawable, which Android draws before the view's
 * children. A pane painting the Pressable's own surface is one of those children, so where
 * its frost renders (an overlay outlet, a bridged Modal) it covers a bounded ripple, and a
 * borderless ripple, which Android projects onto the nearest ancestor's background, lands
 * beneath the host and its pane alike: the press shows nothing. That holds for the host's
 * own Pressable and for a borderless control inside a pane host (an Alert's dismiss, a
 * field's clear and reveal buttons). `foreground: true` draws the ripple after the view's
 * children, over the pane and over the label, in the ripple's own translucent colour, as
 * Compose draws Material 3's state layer over a control's content; a borderless foreground
 * ripple is not projected and radiates on the Pressable's own canvas, clipped as its
 * children are.
 *
 * `appearance` is what the host mounts its pane on, as for `paneStyle`: the resolved
 * material of the pane's layer and `static` (the kit's components read it from their
 * material resolution), or the boolean the host already renders its pane on (a surfaced
 * puck, the active row). Never the requested surface from `useTheme()`: on Android in the
 * page, where glass resolves solid, the pane renders nothing and the ripple stays in the
 * background. iOS and the web ignore `android_ripple`.
 */
export function paneRipple(appearance: boolean | ThemeValue, ripple: PressableAndroidRippleConfig | null | undefined): PressableAndroidRippleConfig | null | undefined {
  const glass = typeof appearance === "boolean" ? appearance : isGlass(appearance);
  return glass && ripple != null ? { ...ripple, foreground: true } : ripple;
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
  return tradedSides(style);
}

/**
 * An absolutely placed child of a pane host (a Select's floating label, the Calendar's
 * fallback anchor), or of a GlassSurface whose resting border became padding the same way
 * (CodeBlock's floating copy chip), kept where solid places it: each side the child is
 * pinned to by a number gains the host's `paneEdges` there (a physical left or right read as
 * start or end). Returned unchanged where those are all zero, so the solid tree is
 * untouched. For a GlassSurface,
 * `appearance` is the host's resolved material (`useMaterialTheme` with the surface's
 * `layer` and `static`), as for a pane.
 */
export function panePlaced(appearance: boolean | ThemeValue, host: StyleProp<ViewStyle>, child: StyleProp<ViewStyle>, stateBorder = false): StyleProp<ViewStyle> {
  return placedInside(paneEdges(appearance, host, stateBorder), child);
}

/**
 * The style the kit gave a TextInput beside a GlassPane, `position: relative`, kept for
 * compatibility. It once restored the input's paint order over the pane on the web, where
 * React Native Web leaves a text input unpositioned and CSS paints positioned boxes after
 * in-flow ones. It changes nothing now: the pane orders itself behind its siblings on
 * every platform (`zIndex: -1` inside its host).
 */
export const PANE_SIBLING_INPUT: ViewStyle = { position: "relative" };
