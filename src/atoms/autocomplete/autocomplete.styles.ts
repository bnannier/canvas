import { type ViewStyle, type TextStyle } from "react-native";
import { shadow, alpha, activeIndicator, shape, MONO_FONT, type ColorTokens, type FloatingLabelStyles } from "../../style/index.js";
import { fieldBorder, focusHaloColor } from "../../style/field-colors.js";
import { primaryText } from "../../style/primary-text.js";
import { platformShape } from "../../style/platform-shape.js";
import { typeRoles } from "../../style/type-scale.js";
import { type SelectDisclosure } from "../select/select.styles.js";

// Co-located Autocomplete skins, one per platform, drawn to the Canvas v4 hand-off
// (tools/v4/handoff/cv-kit-inputs.js `K.def('autocomplete')` with its code-driven options
// in cv-kit-code2.js). An Autocomplete is a searchable single-select: an editable field
// that filters an open option list. iOS ships no combo box (PLATFORM-REFERENCES.md), so
// its skin is the web look at the iOS field and card corners, in the platform's face; the
// Material 3 exposed dropdown menu is Android's control for the job, so Android keeps it,
// in the hand-off's colours:
//   Web: the hand-off's sunken field: a `surface-sunken` box at the web field corner with
//     the 1px `field-border` hairline, 40 tall (32 small, 48 large), a 12px inset, a
//     leading 16px search glyph and a 400 14px query (13 small) in the subtle ink when it
//     is the placeholder. Hover steps the hairline to `subtle-foreground`; the active
//     field (focused or open) paints the `ring` edge, and focus adds the 4px accent halo.
//     The label above is the 500 13px `label` role in `muted-foreground`, the helper the
//     400 12px line in the subtle ink. The list is the hand-off's panel 6px below: the
//     `card` fill, the `border` hairline, the menu corner, the md shadow and a 4px inset
//     around 34px rows (the menu-row corner) of a 400 14px label, the active and chosen rows on the `muted`
//     wash, the matched letters on the accent's soft wash in its ink. Disabled dims to 0.45.
//   iOS: the same look at the iOS field corner (44pt tall at every size but large, so the
//     toggle keeps a 44pt target) and the iOS card corner on the panel, its rows concentric
//     inside its inset.
//   Android (Material 3 exposed dropdown): the filled field (the `muted` fill, the Material 3
//     field corner on top, the 1dp `muted-foreground` indicator thickening to 2dp `primary`
//     while active), 56dp tall (48 small, 60 large), the 24dp drop-down triangle; the M3
//     menu 4dp below: the `popover` fill at the M3 menu corner, the md shadow, an 8dp
//     vertical inset, 48dp rows 12dp in with a 14sp label, the active and chosen rows on
//     the foreground's 10% state layer. The ripple is the press; disabled dims to 0.38.

export type Size = "small" | "default" | "large";

// The contract a platform skin fulfills. The shell resolves the size and the
// open/active/hover/focus/selected state and asks the skin to map them to RN styles.
export interface AutocompleteSkin extends FloatingLabelStyles<Size> {
  /** Clear Liquid Glass text entry on the web appearance. */
  liquid?: boolean;
  /** Type scale per size; the field text shares it. */
  text: (size: Size) => TextStyle;
  /** Stacked (above-field) label type, used on iOS + web (`floatingLabel: false`). On
   *  Android the label FLOATS inside the field instead. */
  label: (t: ColorTokens, size: Size) => TextStyle;
  /**
   * The editable field surface: shape, fill, and the edge of its state. `active` (the
   * field holds focus or its list is open) is the field's own focus indicator; `hovered`
   * is read only by a skin that draws it (the web's hover edge).
   */
  field: (t: ColorTokens, size: Size, active: boolean, hovered?: boolean) => ViewStyle;
  /** A pointer hover steps the resting edge (web and the iOS skin that shares its look; native pointer hover waits on the owner). */
  hover?: boolean;
  /** The halo a focused field wears around its edge, or none. */
  focusHalo?: (t: ColorTokens) => ViewStyle;
  /** The leading search glyph, or none (the Material field, whose label floats there). */
  searchIcon?: { size: number; color: (t: ColorTokens) => string };
  /** The field's value text (foreground), or the placeholder ink. */
  fieldText: (t: ColorTokens, size: Size, muted: boolean) => TextStyle;
  /** The trailing disclosure glyph inside the toggle. */
  disclosure: SelectDisclosure;
  /** The disclosure's real layout/touch target, including the field's border band. */
  chevronTarget: (size: Size) => ViewStyle;
  /**
   * The open option list CARD: radius, fill, border, elevation/shadow, padding,
   * max-height. Positioning is owned by the shell (AnchoredOverlay portals and
   * anchors it; POPOVER_ANCHOR is the no-host inline fallback), so this returns
   * card visuals only, no position/top/zIndex.
   */
  popover: (t: ColorTokens) => ViewStyle;
  /** The space between the field and the open list. */
  popoverGap: number;
  /** The "No results" row box. */
  emptyRow: ViewStyle;
  emptyText: (t: ColorTokens, size: Size) => TextStyle;
  /** A single option row's layout (gutter, radius, padding). */
  row: ViewStyle;
  /** The fill of the SELECTED row at rest, or null for none. */
  rowSelected: (t: ColorTokens) => ViewStyle | null;
  /** The fill of the keyboard-active and the PRESSED row. */
  rowPressed: (t: ColorTokens) => ViewStyle;
  /** The option label. */
  optionText: (t: ColorTokens, size: Size) => TextStyle;
  /** An option's trailing detail (an `AutocompleteOption`'s `detail`), at the row's end. */
  optionDetail: (t: ColorTokens) => TextStyle;
  /** The letters of an option that match the query. */
  highlight: (t: ColorTokens) => TextStyle;
  /** Helper line below the field. */
  helper: (t: ColorTokens) => TextStyle;
  /** Opacity applied to the whole control when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the toggle on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the pressable surfaces; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// `relative w-full`: the positioning context for the absolutely-placed popover.
export const wrapper: ViewStyle = { position: "relative", width: "100%" };

// When the list is open, the wrapper is lifted into its own stacking context
// above sibling content. react-native-web gives every positioned View an
// implicit stacking context, so the popover's own `zIndex` is scoped INSIDE the
// `relative` wrapper and cannot rise above a later sibling. Raising the wrapper's
// zIndex while open lifts the whole control, field and popover together, above
// everything painted after it.
export const wrapperLifted: ViewStyle = { zIndex: 50 };

/** The hand-off's tertiary ink (tx3): the placeholder, the glyphs, the helper. */
function subtleInk(t: ColorTokens): string {
  return t["subtle-foreground"] ?? t["muted-foreground"];
}

// --- the hand-off's look, shared by the web and iOS skins ---
const HANDOFF_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  default: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  large: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
};
const ROW_TEXT: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "400" };
// An option's trailing detail: the hand-off's 400 11px mono note in the subtle ink, 8 from
// the label (Inputs.dc.html `#c-autocomplete`, "0.86", "web").
const OPTION_DETAIL: TextStyle = { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "400", flexShrink: 0, marginStart: 8 };
// The panel's inset around its rows.
const PANEL_INSET = 4;

function handoffField(t: ColorTokens, corner: number, height: number, active: boolean, hovered = false): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: corner,
    borderWidth: 1,
    borderColor: active ? t.ring : hovered ? subtleInk(t) : fieldBorder(t),
    backgroundColor: t["surface-sunken"] ?? t.card,
    paddingHorizontal: 12,
    height,
  };
}

function handoffPanel(t: ColorTokens, corner: number): ViewStyle {
  return {
    maxHeight: 280,
    overflow: "hidden", // clip rows to the rounded card; the list scrolls inside
    borderRadius: corner,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.card,
    padding: PANEL_INSET,
    ...shadow("md", t),
  };
}

function handoffRow(corner: number): ViewStyle {
  return { flexDirection: "row", alignItems: "center", minHeight: 34, borderRadius: corner, paddingHorizontal: 10 };
}

// The parts the web and iOS skins share outright.
const HANDOFF: Pick<AutocompleteSkin, "text" | "label" | "hover" | "focusHalo" | "searchIcon" | "fieldText" | "disclosure" | "popoverGap" | "emptyRow" | "emptyText" | "rowSelected" | "rowPressed" | "optionText" | "optionDetail" | "highlight" | "helper" | "disabledOpacity" | "ripple" | "floatingLabel"> = {
  text: (size) => HANDOFF_TEXT[size],
  label: (t) => ({ ...typeRoles.label, color: t["muted-foreground"], marginBottom: 6 }),
  hover: true,
  focusHalo: (t) => ({ boxShadow: `0 0 0 4px ${focusHaloColor(t)}` }),
  searchIcon: { size: 16, color: subtleInk },
  fieldText: (t, size, muted) => ({ color: muted ? subtleInk(t) : t.foreground, ...HANDOFF_TEXT[size] }),
  disclosure: { glyph: "chevronDown", size: (size) => (size === "small" ? 14 : 16), color: (t) => subtleInk(t), flips: true },
  popoverGap: 6,
  emptyRow: { paddingHorizontal: 10, paddingVertical: 7 },
  emptyText: (t) => ({ ...ROW_TEXT, color: subtleInk(t) }),
  // The active and chosen rows sit on the `muted` wash (the hand-off's sf3).
  rowSelected: (t) => ({ backgroundColor: t.muted }),
  rowPressed: (t) => ({ backgroundColor: t.muted }),
  optionText: (t) => ({ ...ROW_TEXT, color: t.foreground }),
  optionDetail: (t) => ({ ...OPTION_DETAIL, color: subtleInk(t) }),
  // The matched letters: the accent's soft wash under its ink.
  highlight: (t) => ({ backgroundColor: t["primary-soft"] ?? alpha(t.primary, 0.14), color: primaryText(t) }),
  helper: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 17, fontWeight: "400", color: subtleInk(t) }),
  disabledOpacity: 0.45,
  ripple: null,
  floatingLabel: false,
};

// ---------- Web ----------
const WEB_FIELD_BOX: Record<Size, number> = { small: 32, default: 40, large: 48 };
// The hand-off's Autocomplete card (Inputs.dc.html `#c-autocomplete`, the only source: the
// renderer draws no trailing glyph) ends the field in a 15 px chevrons-up-down, 10 px from
// the field's end. The toggle keeps its 24 px target and holds the glyph at its end edge,
// so the glyph lands on that inset while the target reaches back toward the value.
export const webSkin: AutocompleteSkin = {
  ...HANDOFF,
  liquid: true,
  field: (t, size, active, hovered) => {
    const { paddingHorizontal, ...box } = handoffField(t, shape.web.field, WEB_FIELD_BOX[size], active, hovered);
    return { ...box, paddingStart: paddingHorizontal, paddingEnd: 10 };
  },
  disclosure: { glyph: "chevronsUpDown", size: (size) => (size === "small" ? 14 : 15), color: (t) => subtleInk(t), flips: false },
  chevronTarget: () => ({
    alignSelf: "stretch", alignItems: "flex-end", justifyContent: "center", flexShrink: 0,
    width: 24, minHeight: 24,
  }),
  popover: (t) => handoffPanel(t, shape.web.menu),
  // The hand-off's row at the web menu row's 8 corner.
  row: handoffRow(platformShape.web.menuRow),
  pressedOpacity: null, // the `muted` wash is the press feedback
};

// ---------- iOS: the web look at the iOS corners ----------
// Small keeps the 44pt field: its toggle's 44pt target cannot reach past its parent.
const IOS_FIELD_BOX: Record<Size, number> = { small: 44, default: 44, large: 48 };
// The rows are concentric inside the panel's inset.
const IOS_ROW_CORNER = shape.ios.card - PANEL_INSET;
export const iosSkin: AutocompleteSkin = {
  ...HANDOFF,
  // Native pointer hover waits on the owner (src/style/hover.tsx).
  hover: false,
  field: (t, size, active) => ({ ...handoffField(t, shape.ios.field, IOS_FIELD_BOX[size], active), borderCurve: "continuous" }),
  chevronTarget: () => ({
    alignSelf: "stretch", alignItems: "center", justifyContent: "center", flexShrink: 0,
    width: 44, minHeight: 44,
    // Include the 1pt field borders in the actual hit box and use the trailing
    // gutter for the target instead of taking all 44pt from editable text.
    marginVertical: -1, marginEnd: -12,
  }),
  popover: (t) => ({ ...handoffPanel(t, shape.ios.card), borderCurve: "continuous" }),
  row: handoffRow(IOS_ROW_CORNER),
  pressedOpacity: 0.8,
};

// ---------- Android (Material 3 exposed dropdown) ----------
const ANDROID_TOP_RADIUS = shape.android.field;
const ANDROID_FIELD_BOX: Record<Size, number> = { small: 48, default: 56, large: 60 };
// M3 body type with its 0.5 tracking, per size.
const ANDROID_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 14, lineHeight: 20, letterSpacing: 0.5 },
  default: { fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  large: { fontSize: 18, lineHeight: 26, letterSpacing: 0.5 },
};
const ANDROID_ROW_TEXT: TextStyle = { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 };
export const androidSkin: AutocompleteSkin = {
  text: (size) => ANDROID_TEXT[size],
  label: (t, size) => ({ marginBottom: 6, fontWeight: "500", color: t.foreground, ...ANDROID_TEXT[size] }),
  field: (t, size, active) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopStartRadius: ANDROID_TOP_RADIUS,
    borderTopEndRadius: ANDROID_TOP_RADIUS,
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
    // The M3 active indicator: the `muted-foreground` baseline thickening to `primary`
    // while active; activeIndicator keeps the content box fixed across the change.
    ...activeIndicator({ active, restColor: t["muted-foreground"], activeColor: t.primary }),
    backgroundColor: t.muted,
    paddingHorizontal: 16,
    // A floor, not a height: the field grows when a larger text size needs it.
    minHeight: ANDROID_FIELD_BOX[size],
    // The disclosure includes the indicator's border band in its hit target, so the
    // field does not clip; its Pressable owns the rounded ripple clip instead.
    overflow: "visible",
  }),
  fieldText: (t, size, muted) => ({ color: muted ? t["muted-foreground"] : t.foreground, ...ANDROID_TEXT[size] }),
  // The Material drop-down triangle in its 24dp box, centered 24dp from the end edge.
  disclosure: { glyph: "triangle", size: () => 24, color: (t) => t["muted-foreground"], flips: true },
  chevronTarget: () => ({
    alignSelf: "stretch", alignItems: "center", justifyContent: "center", flexShrink: 0,
    width: 48, minHeight: 48, marginEnd: -16,
    // activeIndicator always reserves 2dp for its border + padding. Include
    // that band so the small 48dp field contains a complete 48dp target.
    marginBottom: -2,
    borderTopEndRadius: ANDROID_TOP_RADIUS,
    overflow: "hidden",
  }),
  // The M3 menu: the `popover` fill at the M3 menu corner, the md shadow, an 8dp inset.
  popover: (t) => ({
    maxHeight: 280,
    overflow: "hidden",
    borderRadius: shape.android.menu,
    backgroundColor: t.popover,
    paddingVertical: 8,
    ...shadow("md", t),
  }),
  popoverGap: 4,
  emptyRow: { paddingHorizontal: 12, paddingVertical: 14 },
  emptyText: (t) => ({ ...ANDROID_ROW_TEXT, color: t["muted-foreground"] }),
  // Full-bleed M3 rows: 48dp, 12dp in.
  row: { flexDirection: "row", alignItems: "center", minHeight: 48, paddingHorizontal: 12 },
  // The active and chosen rows sit on the foreground's 10% state layer.
  rowSelected: (t) => ({ backgroundColor: alpha(t.foreground, 0.1) }),
  rowPressed: (t) => ({ backgroundColor: alpha(t.foreground, 0.1) }),
  optionText: (t) => ({ ...ANDROID_ROW_TEXT, color: t.foreground }),
  // The M3 menu item's trailing supporting text: the row's type in the muted ink.
  optionDetail: (t) => ({ ...ANDROID_ROW_TEXT, flexShrink: 0, marginStart: 12, color: t["muted-foreground"] }),
  highlight: (t) => ({ backgroundColor: t["primary-soft"] ?? alpha(t.primary, 0.14), color: primaryText(t) }),
  helper: (t) => ({ marginTop: 4, paddingHorizontal: 16, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t["muted-foreground"] }),
  disabledOpacity: 0.38,
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.foreground, 0.1), borderless: false }),
  // The IN-CONTAINER FLOATING label, the M3 Input's geometry.
  floatingLabel: true,
  labelRest: (_t, size) => ANDROID_TEXT[size],
  labelFloated: () => ({ fontSize: 12, lineHeight: 16, letterSpacing: 0.4 }),
  labelReserve: (size) => ({ paddingTop: size === "large" ? 26 : size === "small" ? 20 : 24 }),
};
