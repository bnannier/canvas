// Shared internals of GlassSurface, the host every kit glass surface renders through. Each
// platform has its own host file, which resolves the surface's material
// (`useMaterialResolution`) and builds its layers: glass-surface.tsx is the web's (Dark
// Factory's plain frost, its numbers in web-frost.ts) and the fallback for a platform with
// no host of its own, glass-surface.ios.tsx iOS's (Apple's Liquid Glass through
// expo-glass-effect, or expo-blur's frost), glass-surface.android.tsx Android's
// (@nannier/canvas-blur's capture frost, or expo-blur's on releases before expo-blur 57).
// Each hands its layers to GlassBox, which lays them behind the content, or renders the
// skin's own surface where the material resolves solid.
//
// The content host keeps its children in every mode. A separate absolute material clip
// contains only decoration, preserving shadow, focus and child identity.

import { createContext, useCallback, useContext, useState, type ReactNode, type RefObject } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle, type ViewProps } from "react-native";
import { frameBedsFor, type ColorScheme, type ColorTokens, type GlassTokens, type Palette } from "../tokens.js";
import { alpha, composite, contrastRatio, inkOn } from "../color.js";
import { actionFill, actionInk } from "../action.js";
import { MaterialBehind } from "./material-behind.js";

/**
 * The layer of the glass model a surface belongs to, which picks its tint (see
 * GlassTokens): `functional` (bars, sheets, popovers, dialogs; the default),
 * `content` (cards, tables, lists, tiles, stages), `control` (fields, buttons,
 * chips, badges, pucks) and `dense` (option lists, alert dialogs, toasts).
 */
export type GlassLayer = "functional" | "content" | "control" | "dense";

export interface GlassSurfaceProps {
  /**
   * Which layer of the glass model this surface is, so it takes that layer's tint
   * and blur: nested glass reads as distinct planes only because a control puck is
   * brighter than the content pane it sits on, and a pane denser than the bar
   * floating over it. Defaults to `functional`.
   */
  layer?: GlassLayer;
  /** Stable frost independent of density. Content defaults to static material. */
  static?: boolean;
  /** Clear refractive material with restrained tint and minimal frost. */
  clear?: boolean;
  /**
   * Tint the material with a colour: the brand-tinted glass of a primary control (a
   * checked switch's track, a split button's call to action). On iOS 26's Liquid Glass it
   * is passed to the native glass as its tintColor and no fill is painted for it; on the
   * frost paths (the web, Android, iOS's frost) it is the fill, the colour at the sheerest
   * alpha at which the ink painted on it keeps 4.5:1 (`brandTint`), painted OVER the
   * material so the solved colour is the rendered one (`brandOverMaterial`). It wins over
   * the layer's tint, and `tint` wins over it.
   */
  brand?: string;
  /**
   * The skin's own surface style: shape, padding, border, shadow and its opaque fill, the
   * whole box solid mode renders. Under glass the fill gives way to the material and a
   * resting border becomes padding of the same width, so the host keeps its size and its
   * content's place while the material covers its whole solid footprint, the material's
   * rim its edge (the owner's GP-1 decision). It is the kit's skin style, not a styling
   * prop for an app: every kit surface hands it its own.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * The style's border currently shows a state (a selected card's primary border, a
   * pressed knob's halo): under glass it stays a border in its own colour over the
   * material, which sits flush inside it on concentric corners, where a resting border
   * becomes padding and gives way to the material's rim; and under Increase Contrast it
   * keeps its colour instead of taking the contrasting border (`contrastBorderFor`).
   * Defaults to false.
   */
  stateBorder?: boolean;
  children?: ReactNode;
  /**
   * Whether the surface and its children take touches, as React Native's `pointerEvents`
   * means it on every platform: `none` passes every tap through (a decorative puck),
   * `box-none` passes the surface's own taps through to what lies behind while its
   * children take theirs. Defaults to `auto`.
   */
  pointerEvents?: ViewProps["pointerEvents"];
  /** Layout callback forwarded to the ROOT element of every material branch, so
   *  a shell built on GlassSurface (a navbar measuring itself for its narrow
   *  collapse) can use the container-measurement hooks. */
  onLayout?: ViewProps["onLayout"];
  /** Native accessibility escape, handled by the existing outer content host. */
  onAccessibilityEscape?: ViewProps["onAccessibilityEscape"];
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /**
   * Landmark role for the root element, e.g. `"navigation"` for a sidebar shell or
   * `"banner"` for a top bar. Glass surfaces ARE the app's bar and sidebar shells, so
   * without this the chrome is an unlabelled stack of divs and every control inside it
   * fails axe's `region` rule for living outside a landmark. Spelled with RN's universal
   * `role` prop, which React Native Web turns into the matching HTML element and native
   * maps onto its own traits, so it needs no per-platform branch. Omit for decorative
   * surfaces such as popovers and menus, which already carry their own role.
   */
  role?: ViewProps["role"];
  /**
   * Ask iOS 26's Liquid Glass to answer touch with its own press response (Apple's
   * `isInteractive`, forwarded to the native glass view). The glass answers only a touch
   * delivered to the glass view itself, and it never is one: the material layer passes
   * every touch through to the surface's content, and a surface under
   * `pointerEvents="none"` takes none at all, where React Native disables user interaction
   * on the view. So no kit surface asks for it; a pressed control shows its own press
   * feedback (its dim, its Android ripple). Ignored on the frost and solid paths, which
   * have no interactive material. Defaults to false.
   */
  interactive?: boolean;
  /**
   * A sheer content pane: its layer's tint drawn thinner and, on the native frost, a
   * lighter blur, so what lies behind reads through it. It acts on the `content` layer
   * only and never thins a menu, dialog or other floating surface, which must occlude what
   * it opens over; no kit surface asks for it. Defaults to false (the full frost).
   */
  sheer?: boolean;
  /**
   * The translucent under-fill painted behind the material in place of the layer's own
   * tint (`glass-tint`, `glass-tint-content`, `glass-tint-control` or `glass-tint-dense`
   * for the surface's `layer`): a toned or selected pane's wash, or a control's own fill
   * (the Switch thumb and the Slider knob pass their knob colour, so the knob reads as a
   * bright puck). It wins over `brand`. Not painted where the material resolves solid,
   * where the skin's own opaque fill shows.
   */
  tint?: string;
  /**
   * A control's boundary drawn as its fill (an off Switch track, its thumb): the colour
   * solved for the 3:1 WCAG 1.4.11 asks of it (`legibleTrack`), painted OVER the frost as a
   * `brand` is, so the colour solved is the colour that renders (beneath a frost, the blur
   * pulls the surroundings into a small surface: an off web track read 2.8:1 against the page
   * where its fill solves to 3.35). On Liquid Glass it is the fill beneath the glass. It wins
   * over `tint` and `brand`.
   */
  boundaryFill?: string;
}

// Android materials sample an explicitly safe native plane. An ancestor target
// would create a render-node cycle, so OverlayProvider publishes its own content
// target only to its sibling outlet. GlassModalBlurTarget bridges a window-level
// target into a genuinely separate RN Modal window. Targetless surfaces resolve
// to their complete solid skin. The optional capture integration owns demand,
// readiness and resource release without changing the content host.
export const GlassBlurTargetContext = createContext<RefObject<View | null> | null>(null);

// The window-level Android capture plane: the OUTERMOST <OverlayProvider>'s page
// content (the @nannier/canvas-blur CaptureHost it mounts when it fills its window),
// published to its whole subtree, unlike GlassBlurTargetContext, which only ever wraps
// an outlet or a Modal's content. Surfaces in a SEPARATE native window (a React Native
// Modal: Drawer, ActionSheet, an app's own) take it through <GlassModalBlurTarget>.
// Nothing in the main window may consume it directly, since everything under the
// provider is a descendant of that plane; OverlayProvider and the bridge are its only
// readers (test/design-rules-source.test.ts). Outermost wins, so a Modal blurs the
// largest safe region: the page, not just the docs stage its trigger sits in.
export const GlassWindowBlurTargetContext = createContext<RefObject<View | null> | null>(null);

/** What a surface's frost reports when it refuses the plane it was handed. */
export type BlurTargetRejection = (refused: RefObject<View | null>) => void;

// Provided by a GlassModalBlurTarget for its own plane, and by nothing else. The Android
// host forwards canvas-blur's onTargetRejected here: the frost refuses only a plane that
// contains it, so a refusal means the bridge sits in the plane's own window, and the
// bridge stops publishing the plane to everything under it.
const GlassBlurTargetRejectionContext = createContext<BlurTargetRejection | null>(null);

/** The nearest bridge's rejection report, or null outside a bridge (and once it has none to offer). */
export function useBlurTargetRejection(): BlurTargetRejection | null {
  return useContext(GlassBlurTargetRejectionContext);
}

/**
 * The Modal blur bridge: carries the page's Android capture plane into a React Native
 * `Modal`, so the glass surfaces inside it (a sheet, a drawer panel, your own Modal's
 * cards) frost the page behind the Modal. It renders no view, only context. Wrap the
 * Modal's content in it, outside any `<OverlayProvider separateWindow>`, as Drawer and
 * ActionSheet do:
 *
 * `<Modal transparent><GlassModalBlurTarget><OverlayProvider separateWindow>{content}</OverlayProvider></GlassModalBlurTarget></Modal>`
 *
 * - Android: with `@nannier/canvas-blur` in an Expo SDK 57 build on Android 12 or newer,
 *   and an app-root `OverlayProvider` that fills the window (its default `flex: 1`,
 *   outside any scroller), whose page content is the plane. The outermost provider
 *   wins, so a Modal opened from a nested host frosts the whole page, and so does a
 *   Modal opened over another Modal. The frost samples that page only: not the root
 *   outlet's toasts, a Modal beneath, or the Modal's own scrim and surfaces.
 * - iOS and the web provide nothing (their Liquid Glass and frost need no plane), and
 *   so does Android when no `OverlayProvider` published a plane: the surfaces render
 *   exactly as they would without the bridge, frost or their solid skin.
 * - Only directly inside a Modal's content, a separate native window that never
 *   contains the plane. Placed in the main window (around page content, or in a
 *   react-native-screens or expo-router modal screen, which shares the main window on
 *   Android) the plane contains its surfaces: canvas-blur 0.2 or newer refuses it and
 *   says so, and every surface under the bridge then resolves its complete solid skin.
 *   The refusal comes from the native frost once it has mounted, so the surfaces show
 *   a tint with no blur until it arrives; an older module refuses silently and leaves
 *   that tint in place.
 */
export function GlassModalBlurTarget({ children }: { children?: ReactNode }) {
  // A kit component resolves its material (useMaterialTheme) inside the bridge, never
  // around the Modal: the page's context offers no plane on Android, so a material read
  // there resolves solid while the component's own surfaces inside the Modal frost.
  const target = useContext(GlassWindowBlurTargetContext);
  // The verdict is per bridge and per plane: trusted until its frost refuses it, so a
  // legitimate Modal never flashes solid first. Only the native frost can tell that the
  // plane contains it, so a misplaced bridge shows its tint until that report lands. A
  // Modal is never inside the plane, so its bridge is never refused.
  const [refused, setRefused] = useState<RefObject<View | null> | null>(null);
  const plane = target !== refused ? target : null;
  const reject = useCallback<BlurTargetRejection>((rejected) => {
    // A plane this bridge did not publish (a nested provider's own) is not its verdict.
    if (rejected === target) setRefused(target);
  }, [target]);
  return (
    <GlassBlurTargetRejectionContext.Provider value={plane ? reject : null}>
      <GlassBlurTargetContext.Provider value={plane}>{children}</GlassBlurTargetContext.Provider>
    </GlassBlurTargetRejectionContext.Provider>
  );
}

// The contract between OverlayProvider and the per-platform GlassBlurTargetHost
// (glass-blur-target.tsx / .android.tsx): the provider hands over its wrapper
// style, the ref the Android fork attaches to its canvas-blur CaptureHost, and the
// outlet subtree, which every fork must keep OUTSIDE the target so outlet overlays
// can blur the content as a sibling.
export interface GlassBlurTargetHostProps {
  /** The provider wrapper's style (OverlayProvider's [FILL, style]). */
  style?: StyleProp<ViewStyle>;
  /** Attached to the optional native capture host on supported Android;
   *  left unattached (current stays null) everywhere else. */
  targetRef: RefObject<View | null>;
  /** The overlay outlet subtree; rendered after (and never inside) the target. */
  outlet: ReactNode;
  children?: ReactNode;
  /**
   * On a window layer, whether its page (the provider's children) is hidden from
   * VoiceOver and TalkBack while a modal anchored card is open; undefined on a host
   * that is not a window layer. iOS hides the page through the outlet itself
   * (`accessibilityViewIsModal` hides a view's siblings), so only Android needs the
   * page as a node of its own to hide.
   */
  pageHidden?: boolean;
}

// The Android blur-method prop for expo-blur's frost, by the API generation installed. A
// release before expo-blur 57 (no BlurTargetView export) blurs the content behind the
// surface with the legacy `experimentalBlurMethod`. From 57 its Android blur samples only a
// blur target, and the kit never hands it one: the one safe target, a capture plane, exists
// only where @nannier/canvas-blur mounted its capture host, and there the Android host
// renders canvas-blur's own frost; without it a surface needing a target resolves its
// complete solid skin before any BlurView mounts (material-resolution.ts, `missing-target`).
// So from 57 it takes no method prop, and the web and iOS hosts never read one.
// Keep the return contract structural: an Expo type here leaks into Canvas's
// public declarations and forces consumers to install an otherwise optional peer.
export function frostMethodProps(supportsBlurTarget: boolean): { experimentalBlurMethod?: "dimezisBlurView" } {
  return supportsBlurTarget ? {} : { experimentalBlurMethod: "dimezisBlurView" };
}

// The native frost's strength, expo-blur's and canvas-blur's `intensity` (0 to 100), on
// iOS and Android; the web blurs at WEB_FROST.blur through a CSS backdrop filter and reads
// none of these. The frost brings its own light or dark tint at this intensity, under the
// layer's tint.
export const GLASS_INTENSITY = 80;

// A content pane blurs a touch less than the functional layer: its tint is denser, so the
// same blur would flatten what lies behind it to a wash, and the lighter blur keeps some of
// its shape through the pane.
export const CONTENT_INTENSITY = 64;
export const CLEAR_INTENSITY = 4;

/** A clear surface retains a light neutral veil while letting the backdrop read. */
export function clearSurfaceTint(tokens: ColorTokens, dark: boolean): string {
  return alpha(tokens.card, dark ? 0.28 : 0.22);
}

// The alpha at which a `brand` colour becomes the under-fill of a brand-tinted puck on
// the frost paths: as sheer as legibility allows. The puck carries the ink the
// skin paints on that brand (`brandInk`: the token pair the fill belongs to), and that
// ink must keep WCAG 4.5:1 over the puck as it composites on the PAGE, so `brandTint`
// starts at this floor and densifies the colour in small steps until the ink clears the
// bar: sky-400 stays at the floor in both schemes, the light-scheme destructive red
// (3.2:1 at the floor) climbs to 0.9. (test/glass-tint.test.tsx pins both.)
export const BRAND_TINT_ALPHA = 0.66;
export const BRAND_TINT_STEP = 0.02;
export const BRAND_INK_CONTRAST = 4.5;

/**
 * Whether a surface's fill is a brand colour that must render OVER its material.
 * `brandTint` solves the ink's contrast for the brand composited on the page, and
 * a frost is not colour-neutral over a fill painted beneath it: the
 * frost's scheme tint dyes it (expo-blur's dark BlurView halved the brand's
 * brightness on iOS, 2:1 for the ink where the solver promised 4.5:1) and a blur
 * pulls the surroundings into a small puck. Painted over the material, the brand
 * composites on the blurred page and the solved colour is the rendered colour;
 * the material still shows through its 34 percent. Layer tints stay beneath: they
 * are the material's own body, tuned in place. An explicit `tint` keeps its place
 * too (an opaque knob does not care; a translucent selection tint was tuned there).
 */
export function brandOverMaterial(brand: string | undefined, tint: string | undefined): boolean {
  return brand != null && tint == null;
}

/**
 * The fill a frost surface paints and whether it paints OVER the material: a `boundaryFill`
 * over it, else `surfaceUnderFill`'s colour, over it only for a brand (`brandOverMaterial`).
 */
export function frostFill(theme: { glass: GlassTokens; tokens: ColorTokens; dark: boolean; palette: Palette; scheme: ColorScheme }, props: Pick<GlassSurfaceProps, "layer" | "brand" | "tint" | "clear" | "boundaryFill">): { color: string; over: boolean } {
  const { layer = "functional", brand, tint, clear, boundaryFill } = props;
  if (boundaryFill != null) return { color: boundaryFill, over: true };
  const color = surfaceUnderFill(theme.glass, layer, brand, tint ?? (clear && brand == null ? clearSurfaceTint(theme.tokens, theme.dark) : undefined), theme.tokens, frameBedsFor(theme.palette, theme.scheme));
  return { color, over: brandOverMaterial(brand, tint) };
}

/**
 * The ink a skin paints on a brand fill: the foreground of the token pair the fill
 * belongs to (the call-to-action, primary, destructive, success or warning pair), else
 * the stronger of black and white. Solving the tint for a guessed ink failed where the
 * guess and the skin disagree: a fill both inks clear picks the stronger one, while the
 * skin paints its own pair's.
 */
export function brandInk(tokens: ColorTokens, brand: string): string {
  const is = (fill: string | undefined) => fill != null && fill.toLowerCase() === brand.toLowerCase();
  if (is(actionFill(tokens))) return actionInk(tokens);
  if (is(tokens.primary)) return tokens["primary-foreground"];
  if (is(tokens.destructive)) return tokens["destructive-foreground"];
  if (is(tokens.success)) return tokens["success-foreground"];
  if (is(tokens.warning)) return tokens["warning-foreground"];
  return inkOn(brand);
}

/** The brand colour as a translucent under-fill whose `ink` stays legible over `page`. */
export function brandTint(brand: string, page: string | readonly string[], ink: string = inkOn(brand)): string {
  const beds = typeof page === "string" ? [page] : page;
  for (let a = BRAND_TINT_ALPHA; a < 1; a += BRAND_TINT_STEP) {
    const fill = alpha(brand, Math.round(a * 100) / 100);
    if (beds.every((bed) => contrastRatio(composite(fill, bed), ink) >= BRAND_INK_CONTRAST)) return fill;
  }
  return alpha(brand, 1);
}

/** The under-fill a surface paints beneath its material: `tint`, else the `brand`
 *  colour tinted so the ink painted on it stays legible over the page (both read from
 *  `tokens`) and over every bed of the page's frosted frame (`beds`, `frameBedsFor`),
 *  else the layer's own token. */
export function surfaceUnderFill(glass: GlassTokens, layer: GlassLayer, brand?: string, tint?: string, tokens?: ColorTokens, beds: readonly string[] = []): string {
  if (tint != null) return tint;
  if (brand != null) return tokens != null ? brandTint(brand, [tokens.background, ...beds], brandInk(tokens, brand)) : alpha(brand, BRAND_TINT_ALPHA);
  switch (layer) {
    case "content": return glass["glass-tint-content"];
    case "control": return glass["glass-tint-control"];
    case "dense": return glass["glass-tint-dense"];
    default: return glass["glass-tint"];
  }
}

/** The frost blur strength for a layer (a sheer surface stays lighter still). */
export function surfaceIntensity(layer: GlassLayer, sheer: boolean | undefined): number {
  if (sheer) return SHEER_INTENSITY;
  return layer === "content" ? CONTENT_INTENSITY : GLASS_INTENSITY;
}

// The SHEER frost (GlassSurfaceProps.sheer): a lighter blur plus a thinner tint (the
// fill layer is drawn at SHEER_FILL_OPACITY, so the glass tint's effective alpha drops
// from 0.20 light / 0.30 dark to 0.15 / 0.225), so a live backdrop reads clearly through
// a content surface. The full frost keeps GLASS_INTENSITY + the whole tint for functional
// surfaces, whose material has to stay readable over whatever moves behind it.
export const SHEER_INTENSITY = 50;
export const SHEER_FILL_OPACITY = 0.75;

// Under the OS "Increase Contrast" setting, Apple makes Liquid Glass "predominantly
// black or white and highlights them with a contrasting border". The kit's material
// resolves solid there (`resolveMaterial`), so the surface renders its skin's opaque fill,
// plus this border in `foreground` (near-black on light, near-white on dark): a true
// contrasting edge, unlike the subtle `border` hairline token. Applied as a style-array
// override so it wins over (or adds to) a skin's own border (`contrastStyle`). Border-box
// in React Native, so it adds no external layout shift.
export const CONTRAST_BORDER_WIDTH = 1;

export function contrastBorder(tokens: ColorTokens): ViewStyle {
  return { borderWidth: CONTRAST_BORDER_WIDTH, borderColor: tokens.foreground };
}

/** A style's border width on each side. */
export interface BorderSides {
  top: number;
  bottom: number;
  start: number;
  end: number;
}

/**
 * A style's border width on each side, resolved as React Native resolves it: a side's own
 * key over `borderWidth`, the logical start and end keys over the physical left and right
 * ones, and a physical left or right key read as the start or end side (React Native swaps
 * left and right in a right-to-left layout by default).
 */
export function borderSides(style: StyleProp<ViewStyle>): BorderSides {
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  const all = flat.borderWidth ?? 0;
  return {
    top: flat.borderTopWidth ?? all,
    bottom: flat.borderBottomWidth ?? all,
    start: flat.borderStartWidth ?? flat.borderLeftWidth ?? all,
    end: flat.borderEndWidth ?? flat.borderRightWidth ?? all,
  };
}

/** The side each border width key sets, a physical left or right read as start or end (as `borderSides` reads it). */
const WIDTH_SIDE: Readonly<Record<string, keyof BorderSides | undefined>> = {
  borderTopWidth: "top", borderBottomWidth: "bottom",
  borderStartWidth: "start", borderLeftWidth: "start",
  borderEndWidth: "end", borderRightWidth: "end",
};

/**
 * The Increase Contrast border for one surface: on every side at least the hairline and
 * never thinner than the surface's own border there, so Increase Contrast only ever adds
 * weight (a 2 px radio ring or switch track stays 2 px), in `foreground`. A surface whose
 * border shows a STATE (`stateBorder`: a focused or errored field, an open trigger, a
 * focused slider knob, the current step) keeps every border colour its style names, since
 * that border is the state's only indicator (overwriting a field's `ring` focus border
 * would leave a keyboard user no focus cue at all): a full border keeps its colour all
 * round, and a Material 3 underline field its bottom edge, the active indicator, while the
 * sides it names no colour for take the contrasting border. A state style that names no
 * border colour has no state border to keep, so it takes the contrasting border.
 */
export function contrastBorderFor(tokens: ColorTokens, style: StyleProp<ViewStyle>, stateBorder = false): ViewStyle {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const sides = borderSides(flat as ViewStyle);
  const at = (side: keyof BorderSides) => Math.max(CONTRAST_BORDER_WIDTH, sides[side]);
  const out: Record<string, unknown> = { ...contrastBorder(tokens) };
  if (sides.top === sides.bottom && sides.top === sides.start && sides.top === sides.end) {
    out.borderWidth = at("top");
  } else {
    Object.assign(out, { borderTopWidth: at("top"), borderBottomWidth: at("bottom"), borderStartWidth: at("start"), borderEndWidth: at("end") });
  }
  // A side's own key outranks the shorthand, so every one the style names is restated: its
  // width as the side reads it, and its colour, in `foreground` unless it shows the state.
  for (const key of Object.keys(flat)) {
    const side = WIDTH_SIDE[key];
    if (side) out[key] = at(side);
    else if (key.startsWith("border") && key.endsWith("Color")) out[key] = stateBorder ? flat[key] : tokens.foreground;
  }
  return out as ViewStyle;
}

// A surface's `pointerEvents`, as registered styles. React Native Web compiles its box-none
// and box-only polyfill (the box itself `pointer-events: none` or its children so) only for
// a StyleSheet.create style and passes an inline value straight to CSS, which has no such
// value, so an inline `{ pointerEvents: "box-none" }` was dropped on the web (the outlet's
// note in portal.tsx); React Native Web deprecates the prop of that name for the style.
const POINTER = StyleSheet.create({
  auto: { pointerEvents: "auto" },
  none: { pointerEvents: "none" },
  "box-none": { pointerEvents: "box-none" },
  "box-only": { pointerEvents: "box-only" },
});

/**
 * The fill and border colours of a style turned transparent: what the material supplies
 * instead, under GlassBox and under a GlassPane's host (`paneStyle`). A border that shows a
 * state keeps its colours (CLAUDE.md, the glass model: a state border stays over the pane,
 * and only a resting hairline gives way to the rim).
 */
export function clearedPaint(style: StyleProp<ViewStyle>, stateBorder: boolean): ViewStyle {
  if (stateBorder) return { backgroundColor: "transparent" };
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const clear: Record<string, unknown> = { backgroundColor: "transparent", borderColor: "transparent" };
  for (const key of Object.keys(flat)) {
    if (key.startsWith("border") && key.endsWith("Color")) clear[key] = "transparent";
  }
  return clear as ViewStyle;
}

/** No border width on any side. */
export const NO_SIDES: Readonly<BorderSides> = { top: 0, bottom: 0, start: 0, end: 0 };

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
 * The border widths a resting host trades for padding under glass, per side: each side's
 * own border, resolved as React Native resolves it (`borderSides`), except where that side's
 * padding is not a number (a percentage), which cannot take the border's width and keeps it.
 */
export function tradedSides(style: StyleProp<ViewStyle>): BorderSides {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
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
 * the two a renderer ranks first gives the same box. The node keeps its size and its
 * content stays where it was, while its padding box grows to its whole footprint: under
 * GlassBox and under a GlassPane's host (`paneStyle`) the material fills that box, so it
 * covers the control's whole solid size (the owner's GP-1 decision).
 */
export function borderAsPadding(style: StyleProp<ViewStyle>): ViewStyle {
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
 * An absolutely placed child of a host whose resting border became padding, kept where solid
 * places it: absolute offsets count from the padding box, which grew over the border, so each
 * side the child is pinned to by a number gains the border width traded there (`edges`, a
 * physical left or right read as start or end). Returned unchanged where nothing was traded.
 */
export function placedInside(edges: BorderSides, child: StyleProp<ViewStyle>): StyleProp<ViewStyle> {
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

const CORNER_KEYS = [
  "borderRadius",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
  "borderTopStartRadius", "borderTopEndRadius", "borderBottomStartRadius", "borderBottomEndRadius",
] as const;
type CornerKey = (typeof CORNER_KEYS)[number];

/** The sides a corner meets (a physical left or right corner read as start or end, as `borderSides` reads a side). */
function cornerSides(key: CornerKey): readonly (keyof BorderSides)[] {
  if (key === "borderRadius") return ["top", "bottom", "start", "end"];
  return [key.startsWith("borderTop") ? "top" : "bottom", /Left|Start/.test(key) ? "start" : "end"];
}

/**
 * The material's corners: the host's corner radii, and where the material sits inside a kept
 * border (`inside`) each radius less the narrower border it meets, the inner curve of that
 * border, so the material's corner never leaves a gap and never pokes over the border.
 */
export function materialCorners(shape: StyleProp<ViewStyle>, inside = false): ViewStyle {
  const flat = (StyleSheet.flatten(shape) ?? {}) as ViewStyle;
  const sides = inside ? borderSides(flat) : null;
  const out: Record<string, unknown> = {};
  for (const key of CORNER_KEYS) {
    const radius = flat[key];
    if (radius == null) continue;
    out[key] = sides && typeof radius === "number" ? Math.max(0, radius - Math.min(...cornerSides(key).map((side) => sides[side]))) : radius;
  }
  return out as ViewStyle;
}

/**
 * The host every glass surface renders: one View wearing the skin's style, whose children
 * never move between modes. Its material, when it has one, is its first child, an
 * absolutely filled, pointer-transparent layer hidden from assistive technology.
 *
 * Geometry under glass (the owner's GP-1 decision, the same as GlassPane's): the host drops
 * its opaque fill and trades its resting border for padding of the same width
 * (`borderAsPadding`), so it keeps its size, its content stays where it was, and the material,
 * which fills its padding box, covers its whole solid footprint with the shape's own radii,
 * the material's rim its edge. A border that shows a state (`stateBorder`) stays a border in
 * its own colour, and the material sits flush inside it on concentric corners
 * (`materialCorners`). In solid mode (`solid`) the host is the skin's style untouched.
 *
 * It publishes whether its material renders to everything inside it (`MaterialBehind`), so a
 * borderless Android ripple there draws in front of the frost instead of beneath it.
 */
export function GlassBox({
  style, children, pointerEvents, testID, role, onLayout, onAccessibilityEscape, stateBorder = false,
  material, solid = false,
}: GlassSurfaceProps & { material: ReactNode; solid?: boolean }) {
  const host = solid ? null : stateBorder ? clearedPaint(style, true) : borderAsPadding(style);
  // A box that paints a material keeps its native view (collapsable false). The material
  // sits at zIndex -1 inside it, and Fabric hoists a flattened view's children into the
  // nearest view it keeps, where a negative zIndex sorts them beneath everything earlier in
  // that view: the docs' frame lost its frost behind the page backdrop on iOS that way. Only
  // a stacking context of its own holds the material inside the box. React Native Web drops
  // the prop before the DOM.
  return (
    <View style={[style, host, pointerEvents ? POINTER[pointerEvents] : null]} testID={testID} role={role} onLayout={onLayout} onAccessibilityEscape={onAccessibilityEscape} collapsable={material || onAccessibilityEscape ? false : undefined}>
      {material ? (
        <View testID="glass-material" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[materialFill(style, stateBorder), { overflow: "hidden", zIndex: -1 }]}>
          {material}
        </View>
      ) : null}
      <MaterialBehind rendered={material != null}>{children}</MaterialBehind>
    </View>
  );
}

// One plain View wearing the skin's style untouched, which is what GlassBox renders where the
// material resolves solid: AnchoredOverlay's opaque card (`opaque`, a card that never takes
// glass) renders it, so an option list looks and lays out the same under either surface.
export function PlainSurface({ style, children, pointerEvents, testID, role, onLayout, onAccessibilityEscape }: GlassSurfaceProps) {
  return (
    <View style={[style, pointerEvents ? POINTER[pointerEvents] : null]} testID={testID} role={role} onLayout={onLayout} onAccessibilityEscape={onAccessibilityEscape} collapsable={onAccessibilityEscape ? false : undefined}>
      {children}
    </View>
  );
}

/**
 * The style a host hands GlassBox: the skin's style, with the contrasting border
 * (`contrastBorderFor`) under Increase Contrast. Every platform host reads it, so the
 * accessibility ladder is one: under Reduce Transparency or Increase Contrast the material
 * resolves solid (`resolveMaterial`, Increase Contrast first) and GlassBox renders the
 * skin's own opaque fill, a semantic surface token glass never rewrites, and Increase
 * Contrast adds this border, keeping a state border's colour.
 */
export function contrastStyle(theme: { increasedContrast: boolean; tokens: ColorTokens }, style: StyleProp<ViewStyle>, stateBorder = false): StyleProp<ViewStyle> {
  return theme.increasedContrast ? [style, contrastBorderFor(theme.tokens, style, stateBorder)] : style;
}

// The absolute-fill style for material layers, with taps passing through (the
// content sits on top; the dismiss backdrop, when present, is a portal sibling).
// A full-bleed cover layer (all four edges pinned), so it is direction-agnostic
// and stays physical left and right: the RTL sweep converts reading-direction edges,
// not symmetric full covers.
export const MATERIAL_FILL: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  pointerEvents: "none",
};

// The native frost's specular edge, on iOS's and Android's frost: light catches the TOP
// edge, a faint hairline defines the whole rim, and the bottom edge takes a soft shade.
// Painted with React Native's `boxShadow` style prop. iOS 26's Liquid Glass carries its own
// edge and is never decorated, and the web draws Dark Factory's plain 1 px hairline instead
// (`WEB_FROST`, `webRimColor`). Once a resting border becomes padding under glass, this rim
// is the surface's edge.
export const SPECULAR_RIM = {
  light:
    "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 0 0 0.5px rgba(255,255,255,0.40), inset 0 -1px 1.5px rgba(0,0,0,0.06)",
  dark:
    "inset 0 1px 1px rgba(255,255,255,0.16), inset 0 0 0 0.5px rgba(255,255,255,0.10), inset 0 -1px 1.5px rgba(0,0,0,0.22)",
} as const;

// The absolute-fill specular-rim overlay style for a frost surface: the skin's radii
// (so the rim follows the rounded corners) plus the scheme's inset boxShadow. Render as
// `<View style={specularRim(style, dark)} pointerEvents="none" />` on top of the blur,
// below the content.
export function specularRim(style: StyleProp<ViewStyle>, dark: boolean, inside = false): ViewStyle {
  return { ...materialFill(style, inside), boxShadow: dark ? SPECULAR_RIM.dark : SPECULAR_RIM.light };
}

// The absolute-fill style for the fill / blur / glass material layers, carrying the
// skin's corner radii like specularRim does. The radii are load-bearing on web: a
// browser clips a backdrop-filter's result to the FILTERED ELEMENT's own border-box,
// not the ancestor's rounded overflow clip, so a radius-0 blur layer paints a square
// halo outside a rounded surface (glaring on a circle, e.g. the Avatar glass
// fallback). On native the parent clip already shapes these layers; the radii just
// keep the material's own shape (and iOS 26's Liquid Glass corner) in agreement.
export function materialFill(style: StyleProp<ViewStyle>, inside = false): ViewStyle {
  return { ...MATERIAL_FILL, ...materialCorners(style, inside) };
}
