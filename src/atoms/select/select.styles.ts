import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha, activeIndicator, shape, type FloatingLabelStyles } from "../../style/index.js";
import { fieldBorder, focusHaloColor } from "../../style/field-colors.js";
import { primaryText } from "../../style/primary-text.js";
import { platformShape } from "../../style/platform-shape.js";
import { typeRoles } from "../../style/type-scale.js";

// Co-located Select skins, one per platform, drawn to the Canvas v4 hand-off
// (tools/v4/handoff/cv-kit-inputs.js `K.def('select')` with its code-driven options in
// cv-kit-code2.js, and the iOS and Android rows `P.select` in cv-kit-platform.js). The
// option-list panel is an option list, so the shell asks AnchoredOverlay for the DENSE
// layer (`dense`): in solid mode the panel paints the skin's own fill, and under glass it
// takes the material under the model's densest tint. A select is a job iOS (the pop-up
// button and its menu) and Android (the Material 3 exposed dropdown menu) both ship a
// control for, so both keep their native shape, in the hand-off's colours:
//   Web: the hand-off's sunken field: a `surface-sunken` box at the web field corner with
//     the 1px `field-border` hairline, 40 tall (32 small, 48 large), a 12px inset (10
//     small), a 400 14px value (13 small) and a 16px `subtle-foreground` chevron-down
//     (14 small) that turns over while the list is open. Hover steps the hairline to
//     `subtle-foreground`; the open list and keyboard focus paint the `ring` edge, and
//     keyboard focus adds the 4px accent halo; `soft` is the `muted` fill with no edge.
//     The label above is the 500 13px `label` role in `muted-foreground`, 6px over the
//     field. The list is the hand-off's panel 6px below: the `card` fill, the `border`
//     hairline, the menu corner, the md shadow and a 4px inset around 34px rows, a 400
//     14px label, the chosen row on the `muted` wash with a trailing 14px check in the
//     accent ink. Disabled dims to 0.45. `dense` is the 32px field with a 600 13px value
//     and 30px rows, under the 10px eyebrow label.
//   iOS: the hand-off's field box (the Input's): a `card` box at the iOS field corner with
//     the 1pt `field-border` hairline (the open list does not tint it), 44pt tall (36
//     small, 50 large), a 16pt value, a 16pt `subtle-foreground` up-down chevron. The menu
//     is the iOS pop-up menu: 250pt wide, 6pt below the field, the iOS menu corner, the
//     `popover` fill, the `field-border` hairline and the lg shadow, 44pt rows of 17pt
//     labels with a 22pt leading slot holding the chosen row's 16pt check in the label's
//     ink; no separators and no row fill. Press dims (0.8); disabled dims to 0.5.
//   Android (Material 3 exposed dropdown): the filled field (the `muted` fill, the
//     Material 3 field corner on top, a flat bottom, the 1dp `muted-foreground` indicator
//     thickening to 2dp `primary` while open), 56dp tall (48 small, 60 large), 16dp in
//     from the start and 12dp from the end, the 24dp drop-down triangle in
//     `muted-foreground`, turned over while open. The menu is the M3 menu 4dp below: the
//     `popover` fill at the M3 menu corner, the md shadow, an 8dp vertical inset, 48dp
//     rows 12dp in with a 14sp label, the chosen row on the foreground's 10% state layer,
//     no check. The ripple is the press; disabled dims to 0.38.

export type Size = "small" | "default" | "large";

/** The trailing disclosure: which glyph, its size and ink, and whether it turns over while open. */
export interface SelectDisclosure {
  /** chevronDown (web), chevronsUpDown (iOS) or the Material drop-down triangle (Android). */
  glyph: "chevronDown" | "chevronsUpDown" | "triangle";
  /** The glyph's box (px); the triangle is drawn 10x5 centered in it. */
  size: (size: Size) => number;
  color: (t: ColorTokens, open: boolean) => string;
  /** The glyph turns over (180 degrees) while the list is open. */
  flips: boolean;
}

// The contract a platform skin fulfills. The shell resolves size + the open, hover,
// focus and selected states and passes them in; the skin maps them to RN style objects.
// `selectedSide` tells the shell where the selection mark goes (a trailing check on the
// web, a leading slot on iOS, none on Android, which marks the chosen row with its
// state layer), and `indicator` is that mark's ink and size.
export interface SelectSkin extends FloatingLabelStyles<Size> {
  /** The dense web field and its compact option rows. Native skins retain their platform control. */
  reference?: {
    trigger: (t: ColorTokens, open: boolean, hovered?: boolean, focused?: boolean) => ViewStyle;
    value: (t: ColorTokens) => TextStyle;
    label: (t: ColorTokens) => TextStyle;
    row: (t: ColorTokens, selected: boolean) => ViewStyle;
    option: (t: ColorTokens, selected: boolean) => TextStyle;
    /** The dense chevron's size (px). */
    chevron: number;
  };
  /** Type scale per size; the trigger value shares it. */
  text: (size: Size) => TextStyle;
  /** The stacked (above-trigger) label type and its gap to the trigger, used on iOS + web
   *  (`floatingLabel: false`). On Android the label FLOATS inside the trigger instead (see
   *  FloatingLabelStyles: `floatingLabel`, `labelRest`/`labelFloated`/`labelReserve`). */
  label: (t: ColorTokens, size: Size) => TextStyle;
  /** The INLINE label type: a muted label rendered as a leading cluster INSIDE the
   *  trigger row (before the value) when `inline` is set alongside `label`. */
  inlineLabel: (t: ColorTokens, size: Size) => TextStyle;
  /**
   * The trigger surface: shape, fill, border/underline. `open` lights the active state;
   * `hovered` and `focused` (keyboard focus) are read only by a skin that draws them (the
   * web's hover edge and focus edge).
   */
  trigger: (t: ColorTokens, size: Size, open: boolean, hovered?: boolean, focused?: boolean) => ViewStyle;
  /** The `soft` trigger's fill and edge, over the trigger; a skin that omits it fills with `field-fill`. */
  soft?: (t: ColorTokens) => ViewStyle;
  /** A pointer hover steps the resting edge (web only; native pointer hover waits on the owner). */
  hover?: boolean;
  /** The halo a keyboard-focused trigger wears in place of the kit's ring, or none (the platform owns focus). */
  focusHalo?: (t: ColorTokens) => ViewStyle;
  /** The leading cluster inside the trigger (optional icon + value/placeholder). */
  triggerValue: ViewStyle;
  /** The trigger value text: foreground when a value is selected, the placeholder ink otherwise. */
  valueText: (t: ColorTokens, size: Size, hasValue: boolean) => TextStyle;
  /** The trailing disclosure glyph. */
  disclosure: SelectDisclosure;
  /** The leading globe glyph's size (px) and ink, for `icon`. */
  icon: { size: number; color: (t: ColorTokens) => string };
  /** The open option list surface: card visuals only (fill, border, shadow, radius,
   *  padding, maxHeight). AnchoredOverlay paints it on the DENSE layer and supplies the
   *  on-page position; the inline no-host fallback adds PANEL_ANCHOR. */
  panel: (t: ColorTokens) => ViewStyle;
  /** The space between the trigger and the open list. */
  panelGap: number;
  /** A menu of its own width (the iOS pop-up menu); omitted, the list is at least the trigger's width. */
  panelWidth?: number;
  /** An option row. `selected` carries the chosen row's fill. */
  optionRow: (t: ColorTokens, selected: boolean) => ViewStyle;
  /** An optional hairline separator above every row after the first. */
  rowSeparator?: (t: ColorTokens) => ViewStyle;
  /** The fill applied on press (web/iOS; Android uses a ripple). */
  optionPressed: (t: ColorTokens) => ViewStyle;
  /** Option row text. */
  optionText: (t: ColorTokens, size: Size) => TextStyle;
  /** The selection mark's ink (`color`) and size (`fontSize`, the check glyph's px). */
  indicator: (t: ColorTokens, size: Size) => TextStyle;
  /** Where the selection mark renders; "none" marks the chosen row with its fill alone. */
  selectedSide: "leading" | "trailing" | "none";
  /** The leading mark's slot width (iOS), which every row reserves so labels line up. */
  markSlot?: number;
  /** Opacity applied to the trigger when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the trigger + rows on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the trigger and the rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// The control owns the full width of its slot; `relative` makes it the
// positioning context for the floating option list.
export const root: ViewStyle = { position: "relative", width: "100%" };

// When the list is open, the root is lifted into its own stacking context above
// sibling content. react-native-web gives every positioned View an implicit
// stacking context, so the panel's own `zIndex` is scoped INSIDE the `relative`
// root and cannot rise above a later sibling. Raising the root's zIndex while
// open lifts the whole control, trigger and panel together, above everything
// painted after it.
export const rootLifted: ViewStyle = { zIndex: 50 };

// --- shared layout fragments (identical across platforms) -------------------

const TRIGGER_ROW: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  // The hand-off's 8px gap between the value cluster and the trailing chevron (Android
  // takes M3's 12). In a fixed-width field `space-between` already pushes them apart;
  // when `fit` collapses the trigger to its content it keeps the chevron off the value.
  gap: 8,
};

// The inline-fallback anchor: with no OverlayProvider mounted the option list
// renders in place, absolutely positioned below the trigger (the kit's pre-portal
// behavior). With a provider, AnchoredOverlay portals the card over the page,
// anchors it below the trigger, and adds the outside-tap dismiss backdrop instead.
export const PANEL_ANCHOR: ViewStyle = { position: "absolute", top: "100%", start: 0, end: 0, zIndex: 50, marginTop: 4 };

/** The hand-off's tertiary ink (tx3): the placeholder, the chevron, the leading glyph. */
function subtleInk(t: ColorTokens): string {
  return t["subtle-foreground"] ?? t["muted-foreground"];
}

// ---------- Web: the hand-off's sunken field and its panel ----------
const WEB_TRIGGER_BOX: Record<Size, number> = { small: 32, default: 40, large: 48 };
// The hand-off's value: 400 14px, 13px on the small field (the large field keeps 14).
const WEB_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  default: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  large: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
};
// The edge by state: the open list or keyboard focus `ring`, a hovered field the subtle
// ink, else the `field-border` hairline.
function webEdge(t: ColorTokens, open: boolean, hovered = false, focused = false): string {
  return open || focused ? t.ring : hovered ? subtleInk(t) : fieldBorder(t);
}
// The hand-off's panel (K.panel): the `card` fill, the `border` hairline, the menu
// corner, the md shadow and a 4px inset.
function webPanel(t: ColorTokens): ViewStyle {
  return {
    maxHeight: 280,
    overflow: "hidden", // clip rows to the rounded card; the list scrolls inside
    borderRadius: shape.web.menu,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.card,
    padding: 4,
    ...shadow("md", t),
  };
}
// A 34px row (30 dense), 10px in, the hand-off's 8px row gap, at the web menu row's 8 corner.
function webRow(height: number): ViewStyle {
  return { flexDirection: "row", alignItems: "center", gap: 8, minHeight: height, borderRadius: platformShape.web.menuRow, paddingHorizontal: 10 };
}

export const webSkin: SelectSkin = {
  reference: {
    trigger: (t, open, hovered, focused) => ({
      ...TRIGGER_ROW,
      height: 32,
      borderRadius: shape.web.field,
      borderWidth: 1,
      borderColor: webEdge(t, open, hovered, focused),
      backgroundColor: t["surface-sunken"] ?? t.card,
      paddingHorizontal: 10,
    }),
    value: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", color: t.foreground }),
    // The hand-off's eyebrow label: 700 10/13 at 0.16em, uppercase, the subtle ink, 4px over the field.
    label: (t) => ({ fontSize: 10, lineHeight: 13, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase", color: subtleInk(t), marginBottom: 4 }),
    row: (t, selected) => ({ ...webRow(30), ...(selected ? { backgroundColor: t.muted } : null) }),
    option: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "400", color: t.foreground, flex: 1 }),
    chevron: 14,
  },
  text: (size) => WEB_TEXT[size],
  label: (t) => ({ ...typeRoles.label, color: t["muted-foreground"], marginBottom: 6 }),
  // Inline (toolbar) label: the 500 13px label beside the value.
  inlineLabel: (t) => ({ ...typeRoles.label, color: t["muted-foreground"] }),
  trigger: (t, size, open, hovered, focused) => ({
    ...TRIGGER_ROW,
    borderRadius: shape.web.field,
    borderWidth: 1,
    borderColor: webEdge(t, open, hovered, focused),
    backgroundColor: t["surface-sunken"] ?? t.card,
    paddingHorizontal: size === "small" ? 10 : 12,
    height: WEB_TRIGGER_BOX[size],
  }),
  // The hand-off's soft field: the `muted` fill with no edge.
  soft: (t) => ({ backgroundColor: t.muted, borderColor: "transparent" }),
  hover: true,
  focusHalo: (t) => ({ boxShadow: `0 0 0 4px ${focusHaloColor(t)}` }),
  triggerValue: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: (t, size, hasValue) => ({ color: hasValue ? t.foreground : subtleInk(t), ...WEB_TEXT[size] }),
  disclosure: { glyph: "chevronDown", size: (size) => (size === "small" ? 14 : 16), color: (t) => subtleInk(t), flips: true },
  icon: { size: 16, color: subtleInk },
  panel: webPanel,
  panelGap: 6,
  // The chosen row sits on the `muted` wash (the hand-off's sf3).
  optionRow: (t, selected) => ({ ...webRow(34), ...(selected ? { backgroundColor: t.muted } : null) }),
  optionPressed: (t) => ({ backgroundColor: t.muted }),
  optionText: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: t.foreground }),
  // The trailing 14px check in the accent ink.
  indicator: (t) => ({ fontSize: 14, lineHeight: 20, color: primaryText(t) }),
  selectedSide: "trailing",
  disabledOpacity: 0.45,
  pressedOpacity: 0.9,
  ripple: null,
  floatingLabel: false,
};

// ---------- iOS: the pop-up button and its menu ----------
// The hand-off's iOS row (cv-kit-platform.js `P.select.ios`): the Input's field box with
// an up-down chevron, and the pop-up menu.
const IOS_TRIGGER_BOX: Record<Size, number> = { small: 36, default: 44, large: 50 };
// The hand-off's field type (the Input's iOS ladder).
const IOS_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 13, lineHeight: 16 },
  default: { fontSize: 16, lineHeight: 24 },
  large: { fontSize: 17, lineHeight: 26 },
};
// The above-trigger label: the hand-off's 14pt regular secondary title, 8pt over the field.
const IOS_LABEL: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};
// Menu rows hold the iOS body size (17pt) whatever the trigger's size.
const IOS_ROW_TEXT: TextStyle = { fontSize: 17, lineHeight: 22 };
export const iosSkin: SelectSkin = {
  text: (size) => IOS_TEXT[size],
  label: (t, size) => ({ marginBottom: 8, fontWeight: "400", letterSpacing: -0.15, color: t["muted-foreground"], ...IOS_LABEL[size] }),
  inlineLabel: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "500", color: t["muted-foreground"] }),
  // The field box: `card`, the 8pt corner, the resting hairline (the open menu leaves it).
  trigger: (t, size) => ({
    ...TRIGGER_ROW,
    borderRadius: shape.ios.field,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: fieldBorder(t),
    backgroundColor: t.card,
    paddingHorizontal: 12,
    height: IOS_TRIGGER_BOX[size],
  }),
  triggerValue: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: (t, size, hasValue) => ({ color: hasValue ? t.foreground : subtleInk(t), ...IOS_TEXT[size] }),
  disclosure: { glyph: "chevronsUpDown", size: () => 16, color: (t) => subtleInk(t), flips: false },
  icon: { size: 18, color: subtleInk },
  // The pop-up menu: the iOS menu corner, the `popover` fill (the material under glass),
  // the `field-border` hairline, the lg shadow, a 6pt vertical inset, clipped to its corners.
  panel: (t) => ({
    maxHeight: 320,
    overflow: "hidden",
    borderRadius: shape.ios.menu,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: fieldBorder(t),
    backgroundColor: t.popover,
    paddingVertical: 6,
    ...shadow("lg", t),
  }),
  panelGap: 6,
  panelWidth: 250,
  // 44pt rows, 12pt in at the start and 16 at the end, a 6pt gap after the mark slot.
  optionRow: () => ({ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingStart: 12, paddingEnd: 16 }),
  optionPressed: (t) => ({ backgroundColor: t.secondary }),
  optionText: (t) => ({ color: t.foreground, ...IOS_ROW_TEXT }),
  // The chosen row's 16pt check, in the label's ink.
  indicator: (t) => ({ fontSize: 16, lineHeight: 22, color: t.foreground }),
  selectedSide: "leading",
  markSlot: 22,
  disabledOpacity: 0.5,
  pressedOpacity: 0.8,
  ripple: null,
  floatingLabel: false,
};

// ---------- Android (Material 3 exposed dropdown) ----------
// The hand-off's Android row (cv-kit-platform.js `aField` and `P.select.android`).
const ANDROID_TOP_RADIUS = shape.android.field;
const ANDROID_TRIGGER_BOX: Record<Size, number> = { small: 48, default: 56, large: 60 };
// M3 body type with its 0.5 tracking, per size.
const ANDROID_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 14, lineHeight: 20, letterSpacing: 0.5 },
  default: { fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  large: { fontSize: 18, lineHeight: 26, letterSpacing: 0.5 },
};
export const androidSkin: SelectSkin = {
  text: (size) => ANDROID_TEXT[size],
  label: (t, size) => ({ marginBottom: 6, fontWeight: "500", color: t.foreground, ...ANDROID_TEXT[size] }),
  inlineLabel: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t["muted-foreground"] }),
  trigger: (t, size, open) => ({
    ...TRIGGER_ROW,
    gap: 12,
    borderTopStartRadius: ANDROID_TOP_RADIUS,
    borderTopEndRadius: ANDROID_TOP_RADIUS,
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
    // Clip the Material ripple to the rounded top outline.
    overflow: "hidden",
    // The M3 active indicator: the `muted-foreground` baseline thickening to `primary`
    // while open; activeIndicator keeps a constant band so the value never reflows.
    ...activeIndicator({ active: open, restColor: t["muted-foreground"], activeColor: t.primary }),
    backgroundColor: t.muted,
    paddingStart: 16,
    paddingEnd: 12,
    // A floor, not a height: the trigger grows when a larger text size needs it.
    minHeight: ANDROID_TRIGGER_BOX[size],
  }),
  triggerValue: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: (t, size, hasValue) => ({ color: hasValue ? t.foreground : t["muted-foreground"], ...ANDROID_TEXT[size] }),
  // The Material drop-down triangle in its 24dp box, turned over while open.
  disclosure: { glyph: "triangle", size: () => 24, color: (t) => t["muted-foreground"], flips: true },
  icon: { size: 18, color: subtleInk },
  // The M3 menu: the `popover` fill at the M3 menu corner, the md shadow, an 8dp inset.
  panel: (t) => ({
    maxHeight: 280,
    overflow: "hidden",
    borderRadius: shape.android.menu,
    backgroundColor: t.popover,
    paddingVertical: 8,
    ...shadow("md", t),
  }),
  panelGap: 4,
  // 48dp rows 12dp in; the chosen row sits on the foreground's 10% state layer.
  optionRow: (t, selected) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    ...(selected ? { backgroundColor: alpha(t.foreground, 0.1) } : null),
  }),
  optionPressed: (t) => ({ backgroundColor: alpha(t.foreground, 0.1) }),
  optionText: (t) => ({ fontSize: 14, lineHeight: 20, letterSpacing: 0.25, color: t.foreground }),
  indicator: (t) => ({ fontSize: 16, lineHeight: 20, color: t.primary }),
  selectedSide: "none",
  disabledOpacity: 0.38,
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.foreground, 0.1), borderless: false }),
  // The IN-CONTAINER FLOATING label, the M3 Input's geometry: centered like the
  // placeholder at rest, floating to body-small (12sp) once the menu opens or a value is
  // chosen; `labelReserve` is the top padding the value gives up for it.
  floatingLabel: true,
  labelRest: (_t, size) => ANDROID_TEXT[size],
  labelFloated: () => ({ fontSize: 12, lineHeight: 16, letterSpacing: 0.4 }),
  labelReserve: (size) => ({ paddingTop: size === "large" ? 26 : size === "small" ? 20 : 24 }),
};
