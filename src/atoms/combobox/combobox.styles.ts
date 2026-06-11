import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Combobox skins, one per platform. A Combobox is a searchable
// single-select: an editable field that filters an open option list. The BRAND
// survives on every platform (the indigo `primary`/`accent` tokens stay; the
// focus accent is the `ring`, never a platform default) and only the native
// SHAPE, sizing, fill, border/underline treatment, popover elevation, and press
// feedback change per OS. The treatment mirrors Input/Select:
//   iOS (HIG): a rounded filled field (~10 radius) over the light gray
//     `secondary` fill, NO visible border at rest, a thin brand `ring` border on
//     open; the trailing chevron is `muted-foreground`; the open list is a
//     rounded `popover` card (~12 radius) with a soft shadow and ~8px gutter
//     rows. Press = opacity dim (~0.8).
//   Android (Material 3 filled): a subtle `muted` fill, TOP corners ~4 radius and
//     a flat bottom, a bottom active-indicator underline (1dp `border` at rest ->
//     2dp `ring` brand when open); the menu surface is a flat-cornered (~4)
//     elevated `popover` sheet (M3 elevation, no soft drop shadow), full-width
//     rows ~48dp tall; press = android_ripple.
//   Web: the established Canvas look (the current combobox, lifted verbatim) —
//     full 1px `input` border, 6 radius, `background` fill, h-8/9/10; the popover
//     is a 6-radius bordered `popover` card with `shadow-lg`, 4px padding, 2-radius
//     accent rows. Press dims nothing (the active accent fill is the feedback).

export type Size = "small" | "default" | "large";

// The contract a platform skin fulfills. The shell resolves the size and the
// open/selected/pressed/muted state and asks the skin to map them to RN style
// objects. The skin owns shape, fill, border/underline, popover elevation, the
// row layout, and the press-feedback channel (iOS/web opacity vs Android ripple).
export interface ComboboxSkin {
  /** Type scale per size; the field text and the option rows share it. */
  text: (size: Size) => TextStyle;
  /** Stacked field label above the field. */
  label: (t: ColorTokens, size: Size) => TextStyle;
  /** The editable field surface: shape, fill, border/underline for the open state. */
  field: (t: ColorTokens, size: Size, open: boolean) => ViewStyle;
  /** The field's value text (foreground), or muted for the placeholder. */
  fieldText: (t: ColorTokens, size: Size, muted: boolean) => TextStyle;
  /** The trailing disclosure chevron. */
  chevron: (t: ColorTokens, size: Size) => TextStyle;
  /** The open option list surface (radius, elevation/shadow, padding). */
  popover: (t: ColorTokens) => ViewStyle;
  /** The "No results" row box. */
  emptyRow: ViewStyle;
  emptyText: (t: ColorTokens, size: Size) => TextStyle;
  /** A single option row's layout (gutter, radius, padding). */
  row: ViewStyle;
  /** The accent surface for the selected row and the pressed/active row. */
  rowAccent: (t: ColorTokens) => ViewStyle;
  /** The leading check column. */
  check: (t: ColorTokens, size: Size) => TextStyle;
  /** The option label. */
  optionText: (t: ColorTokens, size: Size) => TextStyle;
  /** Helper line below the option list. */
  helper: (t: ColorTokens) => TextStyle;
  /** Opacity applied to the whole control when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the field on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the pressable surfaces; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// `relative w-full`: the positioning context for the absolutely-placed popover.
export const wrapper: ViewStyle = { position: "relative", width: "100%" };

// --- shared type scale (identical across platforms; brand type, not a face) --
const TEXT_SIZE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};
function webText(size: Size): TextStyle {
  return TEXT_SIZE[size];
}

// Field height per size; mirrors Input's footprint per platform.
const WEB_FIELD_BOX: Record<Size, number> = { small: 32, default: 36, large: 40 };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
export const webSkin: ComboboxSkin = {
  text: webText,
  label: (t, size) => ({ marginBottom: 6, fontWeight: "500", color: t.foreground, ...TEXT_SIZE[size] }),
  field: (t, size) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: t.input,
    backgroundColor: t.background,
    paddingHorizontal: 12,
    height: WEB_FIELD_BOX[size],
  }),
  fieldText: (t, size, muted) => ({ color: muted ? t["muted-foreground"] : t.foreground, ...TEXT_SIZE[size] }),
  chevron: (t, size) => ({ color: t["muted-foreground"], ...TEXT_SIZE[size] }),
  popover: (t) => ({
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 50,
    marginTop: 4,
    maxHeight: 240,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.popover,
    padding: 4,
    ...shadow("lg"),
  }),
  emptyRow: { paddingHorizontal: 8, paddingVertical: 6 },
  emptyText: (t, size) => ({ color: t["muted-foreground"], ...TEXT_SIZE[size] }),
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  rowAccent: (t) => ({ backgroundColor: t.accent }),
  check: (t, size) => ({ width: 14, color: t["popover-foreground"], ...TEXT_SIZE[size] }),
  optionText: (t, size) => ({ color: t["popover-foreground"], ...TEXT_SIZE[size] }),
  helper: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  disabledOpacity: 0.5,
  pressedOpacity: null, // web shows press via the active accent fill, not opacity
  ripple: null,
};

// ---------- iOS (HIG): rounded filled field, gray fill, brand ring on open, rounded popover card ----------
// The iOS combo box reads like the iOS Input: a continuous-corner rounded rect
// (~10pt) over the light gray `secondary` fill with no visible border at rest;
// opening the list lights a thin brand `ring`. The open list is a grouped,
// rounded `popover` card (~12 radius) floating on a soft shadow, with roomier
// rows. Press dims the surface (~0.8); no ripple.
const IOS_FIELD_RADIUS = 10;
const IOS_FIELD_BOX: Record<Size, number> = { small: 36, default: 44, large: 50 };
export const iosSkin: ComboboxSkin = {
  text: webText,
  label: (t, size) => ({ marginBottom: 6, fontWeight: "600", color: t.foreground, ...TEXT_SIZE[size] }),
  field: (t, size, open) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: IOS_FIELD_RADIUS,
    // No visible border at rest; opening lights a thin brand ring.
    borderWidth: open ? 1.5 : 0,
    borderColor: open ? t.ring : "transparent",
    backgroundColor: t.secondary,
    paddingHorizontal: 14,
    height: IOS_FIELD_BOX[size],
  }),
  fieldText: (t, size, muted) => ({ color: muted ? t["muted-foreground"] : t.foreground, ...TEXT_SIZE[size] }),
  chevron: (t, size) => ({ color: t["muted-foreground"], ...TEXT_SIZE[size] }),
  popover: (t) => ({
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 50,
    marginTop: 6,
    maxHeight: 260,
    borderRadius: 12,
    backgroundColor: t.popover,
    padding: 6,
    ...shadow("lg"),
  }),
  emptyRow: { paddingHorizontal: 12, paddingVertical: 10 },
  emptyText: (t, size) => ({ color: t["muted-foreground"], ...TEXT_SIZE[size] }),
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowAccent: (t) => ({ backgroundColor: t.accent }),
  check: (t, size) => ({ width: 16, color: t.primary, ...TEXT_SIZE[size] }),
  optionText: (t, size) => ({ color: t["popover-foreground"], ...TEXT_SIZE[size] }),
  helper: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  disabledOpacity: 0.5,
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 filled): subtle fill, top radius, bottom indicator, elevated menu ----------
// M3 exposed dropdown: the anchor is a filled field (`muted`) with the TOP
// corners rounded ~4dp and a flat bottom, plus a bottom active-indicator
// underline — 1dp `border` at rest, 2dp `ring` (brand) when open. The menu is a
// flat-cornered (~4) elevated `popover` sheet (M3 elevation via `elevation`, no
// soft iOS drop shadow), full-width rows ~48dp tall whose active/selected state
// is the `accent` state layer. The action feedback is android_ripple.
const ANDROID_TOP_RADIUS = 4;
const ANDROID_FIELD_BOX: Record<Size, number> = { small: 48, default: 56, large: 60 };
export const androidSkin: ComboboxSkin = {
  // M3 body text is 16sp; nudge base/large up, keep small readable.
  text: (size) => {
    if (size === "large") return { fontSize: 18, lineHeight: 26 };
    if (size === "small") return { fontSize: 14, lineHeight: 20 };
    return { fontSize: 16, lineHeight: 24 };
  },
  label: (t, size) => ({ marginBottom: 6, fontWeight: "500", color: t.foreground, ...TEXT_SIZE[size] }),
  field: (t, size, open) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: ANDROID_TOP_RADIUS,
    borderTopRightRadius: ANDROID_TOP_RADIUS,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: open ? 2 : 1,
    // Rest baseline reads clearly (on-surface-variant ~ muted-foreground) so the M3
    // filled field is distinct from the iOS lineless capsule.
    borderBottomColor: open ? t.ring : t["muted-foreground"],
    backgroundColor: t.muted,
    paddingHorizontal: 16,
    height: ANDROID_FIELD_BOX[size],
  }),
  fieldText: (t, size, muted) => ({ color: muted ? t["muted-foreground"] : t.foreground, ...TEXT_SIZE[size] }),
  chevron: (t, size) => ({ color: t["muted-foreground"], ...TEXT_SIZE[size] }),
  // M3 menu surface: flat 4dp corners, elevated (no soft drop shadow), zero
  // padding so the full-bleed rows reach the edges.
  popover: (t) => ({
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 50,
    marginTop: 4,
    maxHeight: 280,
    borderRadius: 4,
    backgroundColor: t.popover,
    paddingVertical: 8,
    elevation: 8,
  }),
  emptyRow: { paddingHorizontal: 16, paddingVertical: 12 },
  emptyText: (t, size) => ({ color: t["muted-foreground"], ...TEXT_SIZE[size] }),
  // Full-bleed M3 list rows: square corners, ~48dp tall, 16dp gutter.
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 0,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowAccent: (t) => ({ backgroundColor: t.accent }),
  check: (t, size) => ({ width: 16, color: t.primary, ...TEXT_SIZE[size] }),
  optionText: (t, size) => ({ color: t["popover-foreground"], ...TEXT_SIZE[size] }),
  helper: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  disabledOpacity: 0.38, // M3 disabled opacity
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: t.accent, borderless: false }),
};
