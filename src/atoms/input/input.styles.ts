import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, FOCUS_RESET } from "../../style/index.js";

// Co-located Input skins, one per platform. The BRAND survives on every platform
// (the cursor/selection is always the indigo `primary`, the focus accent is the
// `ring`, never a platform default), and only the native SHAPE, sizing, fill,
// border treatment, and press feedback change per OS:
//   iOS (HIG, iOS 26+/Liquid Glass): a PLAIN text field — the value text sits on
//     a TRANSPARENT surface with a single bottom HAIRLINE rule (1pt `border`
//     separator) and NO fill, NO surrounding box, NO rounded capsule. Focus
//     thickens/tints the hairline to the brand (`ring`), error to `destructive`;
//     press (action suffix) = opacity dim (~0.8). The cursor/selection stays the
//     indigo `primary`.
//   Android (Material 3 filled): a subtle fill (`muted`), TOP corners ~4 radius
//     and a flat bottom, a bottom active-indicator underline (1dp `border` at
//     rest -> 2dp `ring` on focus, `destructive` on error), ~56dp tall; the
//     action suffix uses android_ripple; disabled opacity 0.38.
//   Web: the established Canvas look (the current input, lifted verbatim) — full
//     1px border (error > focus > input), 6 radius, background fill, 36/32/40
//     tall, opacity 0.5 disabled, action press opacity 0.9.

export type Size = "small" | "base" | "large";

// The contract a platform skin fulfills. Both layouts (bare field, grouped addon
// row) and the size/state inputs the shell resolves are passed in; the skin maps
// them to RN style objects. `borderColor` is a token key (error > focus > input)
// the shell already resolved; the skin reads tokens[borderColor].
export interface InputSkin {
  /** Type scale per size; the field and its addons share it so they line up. */
  text: (t: ColorTokens, size: Size) => TextStyle;
  /** Height (single line) or min-height (multiline) of the bare field. */
  bareBox: (size: Size, multiline: boolean) => TextStyle;
  /** Fixed row height for the grouped layout (addon boxes set it). */
  groupedHeight: (size: Size) => number;
  /** The bare field surface: shape, fill, border/underline for the active state. */
  bareField: (t: ColorTokens, borderColor: keyof ColorTokens, focused: boolean, error: boolean) => TextStyle;
  /** The grouped (addon) outer: the row that shares one border/underline. */
  groupContainer: (t: ColorTokens, borderColor: keyof ColorTokens, focused: boolean, error: boolean) => ViewStyle;
  /** The inner field inside the group (grows to fill; pads away from icons). */
  groupField: (t: ColorTokens, leadingIcon: boolean, trailingIcon: boolean) => TextStyle;
  /** A prefix/suffix addon box. */
  addonBox: (t: ColorTokens, side: "left" | "right", height: number) => ViewStyle;
  addonText: (t: ColorTokens) => TextStyle;
  actionText: (t: ColorTokens) => TextStyle;
  /** Overlaid icon position inside the field (left or right gutter). */
  iconOverlay: (side: "left" | "right") => ViewStyle;
  /** Opacity applied to the field when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the action suffix on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the action suffix; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- shared type scale (identical across platforms; brand type, not a face) --
function webText(_t: ColorTokens, size: Size): TextStyle {
  if (size === "large") return { fontSize: 16, lineHeight: 24 };
  if (size === "small") return { fontSize: 12, lineHeight: 16 };
  return { fontSize: 14, lineHeight: 20 };
}

// ---------- Web: the established Canvas look ----------
export const webSkin: InputSkin = {
  text: webText,
  bareBox: (size, multiline) => {
    if (multiline) return { minHeight: size === "large" ? 96 : size === "small" ? 64 : 80 };
    return { height: size === "large" ? 40 : size === "small" ? 32 : 36 };
  },
  groupedHeight: (size) => (size === "large" ? 40 : size === "small" ? 32 : 36),
  bareField: (t, borderColor) => ({
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: t[borderColor],
    backgroundColor: t.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: t.foreground,
  }),
  groupContainer: (t, borderColor) => ({
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    borderWidth: 1,
    borderColor: t[borderColor],
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: t.background,
  }),
  groupField: (t, leadingIcon, trailingIcon) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    height: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: t.foreground,
    ...(leadingIcon ? { paddingStart: 36 } : null),
    ...(trailingIcon ? { paddingEnd: 36 } : null),
  }),
  addonBox: (t, side, height) => ({
    justifyContent: "center",
    backgroundColor: t.muted,
    paddingHorizontal: 12,
    borderColor: t.border,
    ...(side === "left" ? { borderEndWidth: 1 } : { borderStartWidth: 1 }),
    height,
  }),
  addonText: (t) => ({ color: t["muted-foreground"] }),
  actionText: (t) => ({ fontWeight: "500", color: t.foreground }),
  iconOverlay: (side) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    ...(side === "left" ? { start: 0, paddingStart: 12 } : { end: 0, paddingEnd: 12 }),
  }),
  disabledOpacity: 0.5,
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- iOS (HIG, iOS 26+/Liquid Glass): plain field, transparent, bottom hairline ----------
// Apple's plain text field on iOS 26+: the value text sits directly on a
// TRANSPARENT surface with a single bottom HAIRLINE rule (1pt separator) and no
// fill, no surrounding box, no rounded capsule. Canvas keeps the brand by
// thickening + tinting that hairline to the brand `ring` on focus (and
// `destructive` on error); at rest it is the faint `border` separator. The
// cursor/selection is always the indigo `primary` (set in the shell).

// On iOS the plain field must show NO box at all on focus: only the bottom
// hairline reacts. react-native-web otherwise paints its default focus outline
// (a bright-blue rectangle) and a browser-default caret, which would turn the
// plain hairline field into a generic boxed input the instant it is focused.
// These web-only style props suppress that outline and pin the caret to the
// brand `primary`, matching `selectionColor`. They are iOS-skin-only (the web
// skin draws its own visible border and is left untouched) and are no-ops on
// real iOS, which has no CSS outline. `caretColor`/`cursorColor`/`outlineStyle`
// /`outlineWidth` are not in RN's TextStyle, hence the cast (as in the shell's
// FIELD_OUTLINE_RESET).
function iosWebFieldReset(t: ColorTokens): TextStyle {
  return {
    ...FOCUS_RESET, // shared outline-ring suppression (outlineStyle/outlineWidth)
    caretColor: t.primary, // brand indigo caret (RN Web), matching selectionColor
    cursorColor: t.primary, // brand indigo caret (RN Android prop, harmless on iOS)
  } as unknown as TextStyle;
}

function iosHairline(t: ColorTokens, borderColor: keyof ColorTokens, focused: boolean, error: boolean): ViewStyle {
  // Rest = the faint `border` separator; focus/error thicken to 2pt and tint to
  // the brand color the shell resolved (ring on focus, destructive on error).
  const active = focused || error;
  return {
    borderBottomWidth: active ? 2 : 1,
    borderBottomColor: active ? t[borderColor] : t.border,
  };
}
export const iosSkin: InputSkin = {
  text: webText,
  bareBox: (size, multiline) => {
    if (multiline) return { minHeight: size === "large" ? 110 : size === "small" ? 76 : 92 };
    return { height: size === "large" ? 50 : size === "small" ? 36 : 44 };
  },
  groupedHeight: (size) => (size === "large" ? 50 : size === "small" ? 36 : 44),
  bareField: (t, borderColor, focused, error) => ({
    width: "100%",
    // Plain field: transparent surface, no box/radius, only a bottom hairline.
    backgroundColor: "transparent",
    ...iosHairline(t, borderColor, focused, error),
    // Suppress the react-native-web focus outline box and pin the caret to the
    // brand `primary` (the bare + multiline path never got the shell's
    // FIELD_OUTLINE_RESET, so on focus it showed a browser-blue rectangle).
    ...iosWebFieldReset(t),
    // No horizontal inset so the value text aligns flush with the hairline edge,
    // as in the iOS 27 render.
    paddingHorizontal: 0,
    paddingTop: 10,
    // Reserve a constant 2pt below the content (hairline + this padding) so the
    // hairline's 1pt -> 2pt thickening on focus never reflows the centered value text.
    paddingBottom: focused || error ? 10 : 11,
    color: t.foreground,
  }),
  groupContainer: (t, borderColor, focused, error) => ({
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    // The whole row shares the single bottom hairline; no fill, no box, no radius.
    backgroundColor: "transparent",
    ...iosHairline(t, borderColor, focused, error),
    // Keep the row's content height constant as the shared hairline thickens on
    // focus, so the grouped field's centered value text does not shift.
    paddingBottom: focused || error ? 0 : 1,
  }),
  groupField: (t, leadingIcon, trailingIcon) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    height: "100%",
    paddingHorizontal: 0,
    paddingVertical: 10,
    color: t.foreground,
    // Brand caret + outline suppression on the inner grouped field too, so the
    // caret matches the bare field (the shell already adds FIELD_OUTLINE_RESET
    // to the grouped field, but not the caret color).
    ...iosWebFieldReset(t),
    ...(leadingIcon ? { paddingStart: 28 } : null),
    ...(trailingIcon ? { paddingEnd: 28 } : null),
  }),
  // Addons are inline on the transparent field (no filled box, no separator) so
  // the row reads as one plain line over the shared hairline.
  addonBox: (_t, side, height) => ({
    justifyContent: "center",
    backgroundColor: "transparent",
    ...(side === "left" ? { paddingEnd: 8 } : { paddingStart: 8 }),
    height,
  }),
  addonText: (t) => ({ color: t["muted-foreground"] }),
  actionText: (t) => ({ fontWeight: "600", color: t.primary }),
  iconOverlay: (side) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    ...(side === "left" ? { start: 0 } : { end: 0 }),
  }),
  disabledOpacity: 0.5,
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 filled): subtle fill, top radius, bottom active indicator ----------
// M3 filled text field: a ~56dp container with a subtle fill (`muted` ~
// surface-container-highest), the TOP corners rounded ~4dp and a flat bottom,
// and a bottom active-indicator underline — 1dp `border` at rest, 2dp `ring`
// (brand) on focus, `destructive` on error. The brand survives via the focused
// indicator color and the action suffix's primary label + ripple.
const ANDROID_TOP_RADIUS = 4;
function androidUnderline(t: ColorTokens, borderColor: keyof ColorTokens, focused: boolean, error: boolean): ViewStyle {
  // M3 active indicator: a VISIBLE baseline at rest (on-surface-variant ~ the
  // `muted-foreground` token), thickening to 2dp in the brand `ring` on focus /
  // `destructive` on error. The rest color must read clearly so the filled field is
  // distinct from the iOS lineless capsule (the regression this fixes).
  const active = focused || error;
  return {
    borderBottomWidth: active ? 2 : 1,
    borderBottomColor: active ? t[borderColor] : t["muted-foreground"],
  };
}
export const androidSkin: InputSkin = {
  // M3 body input is 16sp; nudge the base/large up, keep small readable.
  text: (_t, size) => {
    if (size === "large") return { fontSize: 18, lineHeight: 26 };
    if (size === "small") return { fontSize: 14, lineHeight: 20 };
    return { fontSize: 16, lineHeight: 24 };
  },
  bareBox: (size, multiline) => {
    if (multiline) return { minHeight: size === "large" ? 120 : size === "small" ? 88 : 104 };
    return { height: size === "large" ? 60 : size === "small" ? 48 : 56 };
  },
  groupedHeight: (size) => (size === "large" ? 60 : size === "small" ? 48 : 56),
  bareField: (t, borderColor, focused, error) => ({
    width: "100%",
    borderTopStartRadius: ANDROID_TOP_RADIUS,
    borderTopEndRadius: ANDROID_TOP_RADIUS,
    borderBottomStartRadius: 0,
    borderBottomEndRadius: 0,
    ...androidUnderline(t, borderColor, focused, error),
    backgroundColor: t.muted,
    paddingHorizontal: 16,
    paddingTop: 8,
    // Reserve a constant 2dp below the content (indicator + this padding) so the
    // indicator's 1dp -> 2dp thickening on focus never reflows the centered value text.
    paddingBottom: focused || error ? 8 : 9,
    color: t.foreground,
  }),
  groupContainer: (t, borderColor, focused, error) => ({
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    borderTopStartRadius: ANDROID_TOP_RADIUS,
    borderTopEndRadius: ANDROID_TOP_RADIUS,
    ...androidUnderline(t, borderColor, focused, error),
    overflow: "hidden",
    // Keep the row's content height constant as the indicator thickens on focus,
    // so the grouped field's centered value text does not shift.
    paddingBottom: focused || error ? 0 : 1,
    backgroundColor: t.muted,
  }),
  groupField: (t, leadingIcon, trailingIcon) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    height: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: t.foreground,
    ...(leadingIcon ? { paddingStart: 44 } : null),
    ...(trailingIcon ? { paddingEnd: 44 } : null),
  }),
  // The addon shares the field fill (M3 leading/trailing content sits inside the
  // filled container) with a hairline separator.
  addonBox: (t, side, height) => ({
    justifyContent: "center",
    backgroundColor: t.muted,
    paddingHorizontal: 16,
    borderColor: t.border,
    ...(side === "left" ? { borderEndWidth: 1 } : { borderStartWidth: 1 }),
    height,
  }),
  addonText: (t) => ({ color: t["muted-foreground"] }),
  actionText: (t) => ({ fontWeight: "500", color: t.primary, textTransform: "uppercase", letterSpacing: 0.5 }),
  iconOverlay: (side) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    ...(side === "left" ? { start: 0, paddingStart: 16 } : { end: 0, paddingEnd: 16 }),
  }),
  disabledOpacity: 0.38, // M3 disabled opacity
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: t.primary, borderless: false }),
};
