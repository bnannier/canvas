import { fieldEyebrow } from "../../style/field-label.js";
import { primaryText } from "../../style/primary-text.js";
import { fieldBorder, fieldErrorFill, focusHaloColor } from "../../style/field-colors.js";
import { typeRoles } from "../../style/type-scale.js";
import { platformShape } from "../../style/platform-shape.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, FOCUS_RESET, MONO_FONT, activeIndicator, alpha, shape, type FloatingLabelStyles } from "../../style/index.js";

// Co-located Input skins, one per platform, drawn to the Canvas v4 hand-off
// (tools/v4/handoff/cv-kit-inputs.js `K.def('input')`, and its iOS and Android rows
// `P.input` in cv-kit-platform.js). The BRAND survives on every platform (the
// cursor/selection is always the brand `primary`, the focus accent is the `ring`),
// and only the native SHAPE, sizing, fill, border treatment, and press feedback
// change per OS. A text field is a job iOS and Android both ship a control for
// (UITextField, the M3 filled text field), so both keep their native shape:
//   Web: the hand-off's sunken well: a `surface-sunken` box at the web field corner
//     with a 1px `field-border` hairline (the hand-off's ln2, src/style/field-colors.ts),
//     40 tall (32 small, 48 large), a 12px inset and a 400 14px value (13 small). Hover
//     steps the hairline to `subtle-foreground`; focus paints the `ring` edge with a 4px
//     accent halo (the hand-off's ion-ring), error the `destructive` edge with its soft
//     halo while focused. A prefix is a `muted` box with a hairline divider and the
//     subtle ink; a passive suffix is inline mono text, then the clear button (a 20px
//     `surface-raised` disc under an 11px muted x); an action suffix is a `popover` box
//     at the edge. Read-only is a dashed hairline on no fill; disabled dims to 0.45. The
//     label above is the 500 13px `label` role in `muted-foreground`.
//   iOS: a `card` box, 44pt tall, at the iOS field corner, a 1pt `field-border`
//     hairline, 12pt inset, a 16pt value, a 14pt regular muted title above. Focus tints
//     the border, the glyph and the caret to the brand (`ring`/`primary`); error tints
//     the border and the glyph `destructive` and washes the box. A prefix/suffix is a
//     boxed `muted` addon with a state divider at the edge, after the clear button (a
//     17pt disc of the foreground at 32% under an 11pt `card` x); an action suffix is a
//     `popover` box with the 600 15pt brand label; press (action suffix) = opacity dim;
//     read-only drops the fill.
//   Android (Material 3 filled): a `muted` fill, the field corner on TOP and a flat
//     bottom, a bottom active indicator (1dp `muted-foreground` at rest -> 2dp `ring` on
//     focus, `destructive` on error), 56dp tall, the in-container floating label, 20dp
//     glyphs 12dp from the edge; the suffix is inline text before the circled-x clear
//     glyph, an errored field shows a trailing `destructive` alert glyph, the action
//     suffix is uppercase brand text with android_ripple; disabled opacity 0.38;
//     read-only drops the fill under a dashed `field-border` frame and a subtle underline.

export type Size = "small" | "base" | "large";

/** The interaction state a skin resolves colours for. */
export interface FieldState {
  focused: boolean;
  error: boolean;
  /** The trailing addon is the pressable action suffix (addonBox only). */
  action?: boolean;
}

// The contract a platform skin fulfills. Both layouts (bare field, grouped addon
// row) and the size/state inputs the shell resolves are passed in; the skin maps
// them to RN style objects. `borderColor` is a token key (error > focus > input)
// the shell already resolved; the skin reads tokens[borderColor].
export interface InputSkin extends FloatingLabelStyles<Size> {
  /** Clear material for the web skin. */
  liquid?: boolean;
  /** Type scale per size; the field and its addons share it so they line up. */
  text: (t: ColorTokens, size: Size) => TextStyle;
  /** Height of the single-line bare field. */
  bareBox: (size: Size) => TextStyle;
  /** Total (border-box) height of the grouped layout, matching the bare field.
   *  The shell enforces it as minHeight on the group container, so the row keeps
   *  its height even when no addon box is present (icon-only groups). */
  groupedHeight: (size: Size) => number;
  /** The bare field surface: shape, fill, border/underline for the active state. */
  bareField: (t: ColorTokens, borderColor: keyof ColorTokens, focused: boolean, error: boolean) => TextStyle;
  /** The grouped (addon) outer: the row that shares one border/underline. */
  groupContainer: (t: ColorTokens, borderColor: keyof ColorTokens, focused: boolean, error: boolean) => ViewStyle;
  /** The inner field inside the group (fills the field area; pads away from icons and
   *  from prefix/suffix affixes so the value hugs an inline affix — see groupField). */
  groupField: (t: ColorTokens, opts: { leadingIcon: boolean; trailingIcon: boolean; hasPrefix: boolean; hasSuffix: boolean; action?: boolean }) => TextStyle;
  /** A prefix/suffix addon box. Stretches to the row height (alignItems stretch);
   *  it must not set its own height, or it would re-inflate the container past
   *  groupedHeight by the border/indicator band. The iOS box follows the field's
   *  state (its divider and fill tint with focus and error); web and Android
   *  ignore the state. */
  addonBox: (t: ColorTokens, side: "left" | "right", state: FieldState) => ViewStyle;
  /** The addon's ink, and any type of its own (it is applied over the value type). */
  addonText: (t: ColorTokens, side?: "left" | "right") => TextStyle;
  /** The action suffix's label, applied over the value type. */
  actionText: (t: ColorTokens) => TextStyle;
  /** Glyph size (px) of the overlaid leading/trailing icon and the trailing action
   *  glyphs (the password eye, the clear button). */
  iconSize: number;
  /** The glyph colour by state. `action` is a pressable trailing glyph (eye, clear),
   *  which the hand-off draws a step darker than the passive leading glyph. */
  iconColor: (t: ColorTokens, state: FieldState & { action: boolean }) => string;
  /** Gap between the above-field label and the field (the Field/Form rhythm). */
  labelGap: number;
  /** The `search` field's own anatomy: the web's borderless toolbar row, the iOS
   *  search field, the Material 3 search bar. A container with a fill takes a pane
   *  under glass. */
  search?: {
    container: (tokens: ColorTokens) => ViewStyle;
    /** The magnifier: its size, stroke and ink. */
    icon: { size: number; bold: boolean; color: (tokens: ColorTokens) => string };
    field: (tokens: ColorTokens) => TextStyle;
    placeholder: (tokens: ColorTokens) => TextStyle;
  };
  referenceLabel?: (tokens: ColorTokens) => TextStyle;
  softFill?: (tokens: ColorTokens) => string;
  /** Overlaid icon position inside the field area (left or right gutter). The shell
   *  anchors it to the field-area wrapper — the container's CONTENT box — never to
   *  the bordered container itself: the Android active indicator changes the
   *  container's border/padding band on focus, and an overlay spanning that band
   *  would re-center and visibly shift its icon by half the change. */
  iconOverlay: (side: "left" | "right") => ViewStyle;
  /** Whether a pointer hover steps the resting edge to `subtle-foreground` (web only;
   *  native pointer hover waits on the owner, src/style/hover.tsx). */
  hover?: boolean;
  /** The halo around a focused box (a box-shadow spread), or null for none. */
  focusHalo?: (t: ColorTokens, error: boolean) => ViewStyle | null;
  /** What a read-only field changes on its box (bare and grouped), by the field's state. */
  readOnlyField?: (t: ColorTokens, state?: FieldState) => ViewStyle;
  /**
   * A frame drawn OVER a read-only field (the Android dashed edge with its subtle
   * underline just inside it), non-interactive and absolutely positioned, so it moves
   * neither the floating label nor the content box. The underline shows at rest; a
   * focused or errored field keeps its own active indicator instead.
   */
  readOnlyFrame?: (t: ColorTokens) => { frame: ViewStyle; underline: ViewStyle };
  /**
   * The clear button as a filled disc with an x (web, iOS): the disc's diameter, the x's
   * size and the two inks. Without it the clear button is the plain circled-x glyph at
   * `iconSize` (Android). The button's box is never smaller than `iconSize`, so a disc
   * smaller than the glyphs (iOS) keeps the glyphs' touch geometry, centered in it.
   */
  clearDisc?: { size: number; glyph: number; fill: (t: ColorTokens) => string; ink: (t: ColorTokens) => string };
  /**
   * The passive suffix is inline text in the field area, BEFORE the trailing glyphs (web,
   * Android). Without it the suffix is a boxed segment at the edge, after them (iOS).
   */
  inlineSuffix?: boolean;
  /** An errored field with no clear or eye button shows a trailing alert glyph (Android). */
  errorGlyph?: boolean;
  /** The placeholder ink. */
  placeholder: (t: ColorTokens) => string;
  /** Opacity applied to the field when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the action suffix on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the action suffix; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;

  // Label placement (the `label` prop) is contributed by FloatingLabelStyles<Size>:
  // `floatingLabel` (Android true / iOS+web false), `labelAbove` (below), and
  // `labelRest`/`labelFloated`/`labelReserve` (the Android M3 floating label geometry).
  // Shared verbatim with Autocomplete, Select, and Textarea so the four filled-field
  // controls float their label identically.

  /** The above-field label's whole type and ink: every skin supplies it, Android's too,
   *  for the fields that cannot float their label there (a grouped Input, PhoneInput). */
  labelAbove: NonNullable<FloatingLabelStyles<Size>["labelAbove"]>;
}

// --- the subtle ink: the hand-off's tx3 (placeholder, prefix, passive glyphs) ---
function subtleInk(t: ColorTokens): string {
  return t["subtle-foreground"] ?? t["muted-foreground"];
}

// --- web value type: the hand-off's 400 14px value, 13px on the small field ---
function webText(_t: ColorTokens, size: Size): TextStyle {
  if (size === "small") return { fontSize: 13, lineHeight: 18, fontWeight: "400" };
  return { fontSize: 14, lineHeight: 20, fontWeight: "400" };
}

// The web box's fill: the hand-off's sunken well (`--bg2`).
function webFill(t: ColorTokens): string {
  return t["surface-sunken"] ?? t["field-fill"] ?? t.card;
}

// ---------- Web: the hand-off's sunken field box ----------
// The border by state, shared by the web and iOS boxes: the shell resolves the token
// KEY (error > focus > hover > input); at rest the box reads the `field-border` hairline
// instead of the 3:1 `input` boundary (the disclosed trade-off in field-colors.ts).
function fieldEdge(t: ColorTokens, borderColor: keyof ColorTokens): string {
  return borderColor === "input" ? fieldBorder(t) : (t[borderColor] ?? t.input);
}

// The web glyph gutter: the 12px inset, the 16px glyph and the hand-off's 8px gap.
const WEB_INSET = 12;
const WEB_ICON = 16;
const WEB_ICON_GUTTER = WEB_INSET + WEB_ICON + 8;

export const webSkin: InputSkin = {
  // The hand-off's toolbar search (cv-kit-code2.js): a borderless 36px row, a 15px
  // magnifier and 10px gap. The type is what the hand-off renders, not its renderer's
  // span (PLAN S10): its interactive layer (cv-kit-code7.js `toInput`) swaps the span
  // for an input whose `font: inherit; letter-spacing: inherit` resets the value and the
  // prompt to the page's 400 16px, untracked, while the prompt keeps the span's uppercase.
  search: {
    container: () => ({ flexDirection: "row", alignItems: "center", gap: 10, height: 36, paddingHorizontal: 4 }),
    icon: { size: 15, bold: true, color: subtleInk },
    field: (tokens) => ({ paddingVertical: 8, fontSize: 16, fontWeight: "400", color: tokens.foreground, backgroundColor: "transparent", borderWidth: 0 }),
    placeholder: (tokens) => ({ position: "absolute", left: 0, pointerEvents: "none", fontSize: 16, lineHeight: 20, fontWeight: "400", textTransform: "uppercase", color: subtleInk(tokens) }),
  },
  liquid: true,
  softFill: (tokens) => tokens["field-fill"] ?? webFill(tokens),
  text: webText,
  bareBox: (size) => ({ height: size === "large" ? 48 : size === "small" ? 32 : 40 }),
  groupedHeight: (size) => (size === "large" ? 48 : size === "small" ? 32 : 40),
  bareField: (t, borderColor) => ({
    width: "100%",
    borderRadius: shape.web.field,
    borderWidth: 1,
    borderColor: fieldEdge(t, borderColor),
    backgroundColor: webFill(t),
    paddingHorizontal: WEB_INSET,
    paddingVertical: 0,
    color: t.foreground,
  }),
  groupContainer: (t, borderColor) => ({
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    borderWidth: 1,
    borderColor: fieldEdge(t, borderColor),
    borderRadius: shape.web.field,
    overflow: "hidden",
    backgroundColor: webFill(t),
  }),
  // No vertical padding: the container's minHeight (groupedHeight) owns the row
  // height, the stretched input fills it, and a single line self-centers. Any
  // vertical padding would only inflate the row past the bare field's height.
  // Beside a passive suffix the value keeps the hand-off's 8px gap to the inline text.
  // `minWidth: 0` lets the value shrink below a text box's intrinsic width (the
  // browser sizes an <input> to 20 characters of its face), so a narrow field never
  // overflows its box and never resizes when the face changes on a keystroke
  // (PhoneInput sets its number in the mono face once there is one).
  groupField: (t, { leadingIcon, trailingIcon, hasSuffix, action }) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    paddingStart: leadingIcon ? WEB_ICON_GUTTER : WEB_INSET,
    paddingEnd: trailingIcon ? WEB_ICON_GUTTER : hasSuffix && !action ? 8 : WEB_INSET,
    color: t.foreground,
  }),
  // The prefix is a `muted` box with a hairline divider (10px inset); a passive suffix is
  // inline text with no box (12px to the edge); the action suffix a `popover` box.
  addonBox: (t, side, { action }) =>
    side === "left"
      ? { justifyContent: "center", backgroundColor: t.muted, paddingHorizontal: 10, borderColor: fieldBorder(t), borderEndWidth: 1 }
      : action
        ? { justifyContent: "center", backgroundColor: t.popover, paddingHorizontal: WEB_INSET, borderColor: fieldBorder(t), borderStartWidth: 1 }
        : { justifyContent: "center", paddingEnd: WEB_INSET },
  addonText: (t, side) => (side === "right" ? { color: subtleInk(t), fontFamily: MONO_FONT, fontSize: 13, lineHeight: 18 } : { color: subtleInk(t) }),
  actionText: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "500", color: t.foreground }),
  iconOverlay: (side) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    ...(side === "left" ? { start: 0, paddingStart: WEB_INSET } : { end: 0, paddingEnd: WEB_INSET }),
  }),
  iconSize: WEB_ICON,
  iconColor: (t) => subtleInk(t),
  // The hand-off's clear button: a 20px `surface-raised` disc under an 11px muted x.
  clearDisc: { size: 20, glyph: 11, fill: (t) => t["surface-raised"] ?? t.muted, ink: (t) => t["muted-foreground"] },
  // The passive suffix is inline mono text before the clear button.
  inlineSuffix: true,
  labelGap: 6,
  referenceLabel: fieldEyebrow,
  hover: true,
  focusHalo: (t, error) => ({ boxShadow: `0 0 0 4px ${error ? (t["destructive-soft"] ?? alpha(t.destructive, 0.14)) : focusHaloColor(t)}` }),
  readOnlyField: () => ({ borderStyle: "dashed", backgroundColor: "transparent" }),
  placeholder: subtleInk,
  disabledOpacity: 0.45,
  pressedOpacity: 0.9,
  ripple: null,
  // The hand-off's label above the field: the 500 13px `label` role, muted.
  floatingLabel: false,
  labelAbove: (t) => ({ ...typeRoles.label, color: t["muted-foreground"] }),
};

// ---------- iOS: the hand-off's iOS field ----------
// The hand-off's iOS row (cv-kit-platform.js `iBox`): a `card` box at the iOS field
// corner (`shape.ios.field`) and a 1pt border that resolves error (`destructive`) >
// focus (`ring`) > the resting `field-border` hairline (see src/style/field-colors.ts
// for the disclosed contrast trade-off). The error state also washes the box with the
// destructive hue. 44pt tall at the base size with a 16pt value, 12pt inset, and the
// leading glyph 20px with an 8pt gap to the text. The cursor/selection is the brand
// `primary` (set in the shell).

// react-native-web paints a default focus outline (a bright-blue rectangle) and a
// browser-default caret on the field. FOCUS_RESET suppresses that outline (the skin draws
// its own border; natively its zero width draws nothing), and the caret keys pin the
// caret to the brand `primary`, matching `selectionColor`. `caretColor` and `cursorColor`
// are not in RN's TextStyle, hence the cast.
function iosWebFieldReset(t: ColorTokens): TextStyle {
  return {
    ...FOCUS_RESET, // shared outline-ring suppression (outlineStyle/outlineWidth)
    caretColor: t.primary, // brand caret (RN Web), matching selectionColor
    cursorColor: t.primary, // brand caret (RN Android prop, harmless on iOS)
  } as unknown as TextStyle;
}

// The hand-off's type: SF Pro 16 regular in the box (the 44pt box holds a 24pt line
// between two 10pt insets); the small and large sizes step it by the same ladder.
function iosText(_t: ColorTokens, size: Size): TextStyle {
  if (size === "large") return { fontSize: 17, lineHeight: 26 };
  if (size === "small") return { fontSize: 13, lineHeight: 16 };
  return { fontSize: 16, lineHeight: 24 };
}

// The box fill: `card`, washed with the destructive hue in the error state.
function iosFill(t: ColorTokens, error: boolean): string {
  return error ? fieldErrorFill(t) : t.card;
}

const IOS_ICON = 20;
// Content inset, the glyph, and the 8pt glyph-to-text gap.
const IOS_INSET = 12;
const IOS_ICON_GUTTER = IOS_INSET + IOS_ICON + 8;

export const iosSkin: InputSkin = {
  // The hand-off's iOS search field (cv-kit-code6.js): a 36pt `muted` well at the
  // search-field corner, 8pt inset, a 16pt subtle magnifier 6pt from a 17pt value.
  search: {
    container: (t) => ({ flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 8, borderRadius: platformShape.ios.searchField, borderCurve: "continuous", backgroundColor: t.muted }),
    icon: { size: 16, bold: false, color: subtleInk },
    field: (t) => ({ ...iosWebFieldReset(t), paddingVertical: 0, fontSize: 17, lineHeight: 22, color: t.foreground, backgroundColor: "transparent", borderWidth: 0 }),
    placeholder: (t) => ({ position: "absolute", left: 0, pointerEvents: "none", fontSize: 17, lineHeight: 22, color: subtleInk(t) }),
  },
  text: iosText,
  bareBox: (size) => ({ height: size === "large" ? 50 : size === "small" ? 36 : 44 }),
  groupedHeight: (size) => (size === "large" ? 50 : size === "small" ? 36 : 44),
  // The white box: 8pt corner, 1pt state border, the error wash.
  bareField: (t, borderColor, _focused, error) => ({
    width: "100%",
    borderRadius: shape.ios.field,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: fieldEdge(t, borderColor),
    backgroundColor: iosFill(t, error),
    ...iosWebFieldReset(t),
    paddingHorizontal: IOS_INSET,
    paddingVertical: 10,
    color: t.foreground,
  }),
  // The grouped (addon) row shares one box; joined edges are clipped.
  groupContainer: (t, borderColor, _focused, error) => ({
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    borderRadius: shape.ios.field,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: fieldEdge(t, borderColor),
    overflow: "hidden",
    backgroundColor: iosFill(t, error),
  }),
  // No vertical padding (see webSkin.groupField): minHeight + stretch own the
  // row height and the single-line value self-centers. The 12pt inset holds on
  // every side, including next to a boxed addon (the hand-off's value box keeps
  // its own inset after the addon's divider); an overlaid glyph widens it to the
  // glyph gutter (inset + 20 + 8).
  groupField: (t, { leadingIcon, trailingIcon }) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    color: t.foreground,
    // Brand caret + outline suppression on the inner grouped field too.
    ...iosWebFieldReset(t),
    paddingStart: leadingIcon ? IOS_ICON_GUTTER : IOS_INSET,
    paddingEnd: trailingIcon ? IOS_ICON_GUTTER : IOS_INSET,
  }),
  // The hand-off's boxed addon: a `muted` box with the 12pt
  // inset and a 1pt divider on the field side, both following the field's state
  // (the divider takes the state border, the box the error wash).
  // The action suffix sits on the `popover` fill instead, under the brand label.
  addonBox: (t, side, { focused, error, action }) => ({
    justifyContent: "center",
    paddingHorizontal: IOS_INSET,
    backgroundColor: error ? fieldErrorFill(t) : action && side === "right" ? t.popover : t.muted,
    borderColor: error ? t.destructive : focused ? t.ring : fieldBorder(t),
    ...(side === "left" ? { borderEndWidth: 1 } : { borderStartWidth: 1 }),
  }),
  addonText: (t) => ({ color: t["muted-foreground"] }),
  // The hand-off's action label: 600 15pt in the brand ink, at every field size.
  actionText: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "600", color: primaryText(t) }),
  iconOverlay: (side) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    ...(side === "left" ? { start: 0, paddingStart: IOS_INSET } : { end: 0, paddingEnd: IOS_INSET }),
  }),
  iconSize: IOS_ICON,
  // The hand-off's glyph tints: error red, focus the brand, otherwise a passive leading
  // glyph rests on the subtle ink and a pressable trailing glyph (eye, clear) on
  // `muted-foreground`, a step darker.
  iconColor: (t, { focused, error, action }) =>
    error ? t.destructive : focused ? t.ring : action ? t["muted-foreground"] : subtleInk(t),
  // The iOS clear button (UITextField's clear button): a 17pt disc of the foreground at
  // 32% under an 11pt x in the `card` ink, in every state. Its box stays the 20pt glyph
  // box, so the clear and eye targets keep their 44pt geometry.
  clearDisc: { size: 17, glyph: 11, fill: (t) => alpha(t.foreground, 0.32), ink: (t) => t.card },
  labelGap: 8,
  readOnlyField: () => ({ backgroundColor: "transparent" }),
  placeholder: subtleInk,
  disabledOpacity: 0.5,
  pressedOpacity: 0.8,
  ripple: null,
  // The label sits ABOVE the field: the hand-off's 14pt regular secondary title, with
  // SF Pro Text's tracking at that size (-0.15).
  floatingLabel: false,
  labelAbove: (t, size) => ({
    fontSize: size === "large" ? 16 : size === "small" ? 12 : 14,
    lineHeight: size === "large" ? 24 : size === "small" ? 16 : 20,
    fontWeight: "400",
    letterSpacing: -0.15,
    color: t["muted-foreground"],
  }),
};

// ---------- Android (Material 3 filled): subtle fill, top radius, bottom active indicator ----------
// M3 filled text field, the hand-off's Android row (cv-kit-platform.js `aField`): a
// 56dp container with a subtle fill (`muted`, the hand-off's sf3), the TOP corners rounded ~4dp and a flat bottom,
// and a bottom active-indicator underline — 1dp `border` at rest, 2dp `ring`
// (brand) on focus, `destructive` on error. The brand survives via the focused
// indicator color and the action suffix's primary label + ripple.
const ANDROID_TOP_RADIUS = shape.android.field;
// The side inset beside an overlaid glyph (the hand-off's aField pads 12dp there, not 16).
const ANDROID_GLYPH_INSET = 12;
// M3 active indicator: a VISIBLE baseline at rest (on-surface-variant ~ `muted-foreground`,
// so the filled field stays distinct from the iOS lineless capsule), thickening to 2dp in the
// shell-resolved brand color (ring on focus / destructive on error) when active. `gap` is the
// padding kept below the content so the thickening reserves a constant band (see activeIndicator).
function androidUnderline(t: ColorTokens, borderColor: keyof ColorTokens, focused: boolean, error: boolean, gap: number): ViewStyle {
  return activeIndicator({ active: focused || error, restColor: t["muted-foreground"], activeColor: t[borderColor] ?? t.ring, gap });
}
// The M3 body type the Android label rests at in the field (body-large per size), and
// so the type of its foreground title above a field that cannot float it.
function androidLabelRest(size: Size): TextStyle {
  if (size === "large") return { fontSize: 18, lineHeight: 26, letterSpacing: 0.5 };
  if (size === "small") return { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 };
  return { fontSize: 16, lineHeight: 24, letterSpacing: 0.5 };
}
export const androidSkin: InputSkin = {
  // The hand-off's Material 3 search bar (cv-kit-code6.js): a 56dp `muted` stadium,
  // 16dp inset, a 22dp magnifier 16dp from a 16sp value, the placeholder muted.
  search: {
    container: (t) => ({ flexDirection: "row", alignItems: "center", gap: 16, height: 56, paddingHorizontal: 16, borderRadius: shape.android.pill, backgroundColor: t.muted }),
    icon: { size: 22, bold: false, color: (t) => t["muted-foreground"] },
    field: (t) => ({ ...FOCUS_RESET, paddingVertical: 0, fontSize: 16, lineHeight: 24, color: t.foreground, backgroundColor: "transparent", borderWidth: 0 }),
    placeholder: (t) => ({ position: "absolute", left: 0, pointerEvents: "none", fontSize: 16, lineHeight: 24, color: t["muted-foreground"] }),
  },
  // M3 body input is 16sp; nudge the base/large up, keep small readable.
  text: (_t, size) => {
    if (size === "large") return { fontSize: 18, lineHeight: 26 };
    if (size === "small") return { fontSize: 14, lineHeight: 20 };
    return { fontSize: 16, lineHeight: 24 };
  },
  bareBox: (size) => ({ height: size === "large" ? 60 : size === "small" ? 48 : 56 }),
  groupedHeight: (size) => (size === "large" ? 60 : size === "small" ? 48 : 56),
  bareField: (t, borderColor, focused, error) => ({
    width: "100%",
    borderTopStartRadius: ANDROID_TOP_RADIUS,
    borderTopEndRadius: ANDROID_TOP_RADIUS,
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
    // The bottom indicator + its no-reflow padding. M3 counts the indicator inside the
    // 8dp bottom padding, so the band is 8 in all (gap 6 + the 2dp active indicator).
    // Then the content box is exactly the value's line (56 - 24 label reserve - 8 = 24):
    // with gap 8 it was 2dp shorter, so a filled field was vertically scrollable and kept
    // a page swipe that started on it (ReactEditText holds the parent while it can scroll).
    ...androidUnderline(t, borderColor, focused, error, 6),
    backgroundColor: t.muted,
    paddingHorizontal: 16,
    paddingTop: 8,
    color: t.foreground,
  }),
  groupContainer: (t, borderColor, focused, error) => ({
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    borderTopStartRadius: ANDROID_TOP_RADIUS,
    borderTopEndRadius: ANDROID_TOP_RADIUS,
    // The shared bottom indicator + its no-reflow padding (gap 0).
    ...androidUnderline(t, borderColor, focused, error, 0),
    overflow: "hidden",
    backgroundColor: t.muted,
  }),
  // No vertical padding (see webSkin.groupField): minHeight + stretch own the
  // row height and the single-line value self-centers.
  groupField: (t, { leadingIcon, trailingIcon, hasPrefix, hasSuffix }) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    color: t.foreground,
    // Content inset is 16dp per side, EXCEPT when a prefix/suffix affix already
    // supplies that inset plus a tight gap: there the field drops its padding so
    // the value hugs the affix (M3 inline prefix/suffix text, not a padded box).
    // An overlaid icon uses a 44dp gutter instead.
    paddingStart: leadingIcon ? 44 : hasPrefix ? 0 : 16,
    paddingEnd: trailingIcon ? 44 : hasSuffix ? 0 : 16,
  }),
  // M3 prefix/suffix is inline affix text inside the filled container: it shares
  // the field surface (no separate fill, no divider) and the value follows it
  // directly. The affix owns the 16dp container inset and keeps an 8dp gap to the
  // value; the field zeroes its padding on that side (see groupField).
  addonBox: (_t, side) => ({
    justifyContent: "center",
    ...(side === "left" ? { paddingStart: 16, paddingEnd: 8 } : { paddingStart: 8, paddingEnd: 16 }),
  }),
  addonText: (t) => ({ color: t["muted-foreground"] }),
  // The hand-off's M3 text action: 500 14/20, uppercase, 0.5 tracking, the brand ink.
  actionText: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: primaryText(t), textTransform: "uppercase", letterSpacing: 0.5 }),
  iconOverlay: (side) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    ...(side === "left" ? { start: 0, paddingStart: ANDROID_GLYPH_INSET } : { end: 0, paddingEnd: ANDROID_GLYPH_INSET }),
  }),
  // The hand-off's 20dp glyphs: the 44dp gutter is the 12dp inset, the glyph and the
  // 12dp gap to the value (aField's 12dp side padding beside a glyph and its 12dp gap).
  iconSize: 20,
  iconColor: (t) => t["muted-foreground"],
  // The passive suffix is inline text before the trailing glyphs, and an errored field
  // with no clear or eye button shows the 20dp `destructive` circled alert.
  inlineSuffix: true,
  errorGlyph: true,
  labelGap: 6,
  // Read-only (the hand-off's cv-kit-code6.js): no fill, a 1dp dashed `field-border` frame
  // around the field and a 1dp subtle underline just inside it. The frame draws the
  // underline, so the field's own resting indicator goes clear; focus and error keep it.
  readOnlyField: (_t, state) => (state?.focused || state?.error ? { backgroundColor: "transparent" } : { backgroundColor: "transparent", borderBottomColor: "transparent" }),
  readOnlyFrame: (t) => ({
    frame: {
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: fieldBorder(t),
      borderTopStartRadius: ANDROID_TOP_RADIUS,
      borderTopEndRadius: ANDROID_TOP_RADIUS,
    },
    underline: { position: "absolute", start: 0, end: 0, bottom: 0, height: 1, backgroundColor: subtleInk(t) },
  }),
  // The hand-off's tx3 placeholder is about 4.2:1 on the dark `muted` fill, so the M3
  // field keeps `muted-foreground`, which clears 4.5:1 on it.
  placeholder: (t) => t["muted-foreground"],
  disabledOpacity: 0.38, // M3 disabled opacity
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: t.primary, borderless: false }),
  // Android (Material 3): the IN-CONTAINER FLOATING label. At rest it sits
  // vertically centered like a placeholder (body-large, matching the field text
  // per size); when the field is focused OR populated it floats to the top,
  // shrinking to body-small (12sp). The shell renders the label at `labelRest`
  // and drives translateY + scale on the transform driver; `labelFloated`'s
  // fontSize only supplies the scale ratio (12 / restFontSize). `labelReserve`
  // is the constant top padding the value field gives up so the floated label
  // clears the value. M3 body tracking: body-large 0.5, body-medium 0.25,
  // body-small 0.4.
  floatingLabel: true,
  labelRest: (_t, size) => androidLabelRest(size),
  labelFloated: (_t, _size) => ({ fontSize: 12, lineHeight: 16, letterSpacing: 0.4 }),
  labelReserve: (size) => ({ paddingTop: size === "large" ? 26 : size === "small" ? 20 : 24 }),
  // Where the label cannot float (a grouped Input, whose addons share the box, and
  // PhoneInput, which reads this skin), it is a foreground title above the field at
  // the resting type, medium weight.
  labelAbove: (t, size) => ({ ...androidLabelRest(size), fontWeight: "500", color: t.foreground }),
};
