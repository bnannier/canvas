import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";

// Co-located Select skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and the glass surface, since
// tokens.popover is swapped translucent at the theming level). The BRAND survives
// on every platform (the open/focus accent and the selected-row indicator are the
// indigo `primary`, never a platform default); only the native SHAPE, sizing,
// fill, border/underline treatment, and press feedback change per OS:
//   iOS (HIG pop-up button): a rounded filled trigger (~10 radius) over a light
//     gray fill (the `secondary` token, like tertiarySystemFill), NO visible
//     border, ~44pt tall, with a trailing chevron-up-down glyph in `primary`;
//     press = opacity dim (~0.8). The menu is a rounded popover (12 radius,
//     `popover`, soft shadow, ~15pt rows); the selected row shows a TRAILING
//     brand checkmark.
//   Android (Material 3 exposed dropdown): a filled trigger (subtle `muted`
//     fill, TOP corners ~4 radius, flat bottom) with a bottom active-indicator
//     underline — 1dp `input` at rest -> 2dp `primary` when open — and a trailing
//     chevron-down; press = android_ripple. The menu is an elevated surface
//     (4 radius, `popover`, soft shadow); pressed rows tint with the ripple
//     (alpha(primary, 0.12) state layer) and the selected row is tinted.
//   Web: the established Canvas look (the current select, lifted verbatim) — a
//     full 1px `input` border, 6 radius, `background` fill, 32/36/40 tall, a
//     trailing ▾ chevron in `muted-foreground`; the menu is a bordered popover
//     (6 radius, `border`, shadow-lg) and the selected row carries the `accent`
//     fill with a LEADING ✓ in the gutter.

export type Size = "small" | "default" | "large";

// Type scale per size, shared by the label, the trigger value, and the option
// rows (text-xs / text-sm / text-base). Brand type, not a platform face.
const TEXT_SIZE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};
function textType(size: Size): TextStyle {
  return TEXT_SIZE[size];
}

// The contract a platform skin fulfills. The shell resolves size + the open and
// hasValue/selected states and passes them in; the skin maps them to RN style
// objects. `selectedSide` tells the shell where to render the selection
// indicator (a leading gutter glyph on web, a trailing brand check on iOS), and
// `selectedGlyph` is the character it draws there.
export interface SelectSkin {
  /** Type scale per size; label, trigger value, and rows share it so they line up. */
  text: (size: Size) => TextStyle;
  /** The stacked field label above the trigger. */
  label: (t: ColorTokens, size: Size) => TextStyle;
  /** The trigger surface: shape, fill, border/underline; `open` lights the active state. */
  trigger: (t: ColorTokens, size: Size, open: boolean) => ViewStyle;
  /** The leading cluster inside the trigger (optional icon + value/placeholder). */
  triggerValue: ViewStyle;
  /** The trigger value text: foreground when a value is selected, muted otherwise. */
  valueText: (t: ColorTokens, size: Size, hasValue: boolean) => TextStyle;
  /** The trailing chevron glyph. Different character per platform; `open` lets
   *  Android tint it with the brand `primary` when the menu is expanded. */
  chevron: (t: ColorTokens, size: Size, open: boolean) => TextStyle;
  /** The chevron character (▾ on web, ⌄ on Android, chevron-up-down on iOS). */
  chevronGlyph: string;
  /** The open option list surface. */
  panel: (t: ColorTokens) => ViewStyle;
  /** An option row. `selected` carries the active tint. */
  optionRow: (t: ColorTokens, selected: boolean) => ViewStyle;
  /** The fill applied on press (web/iOS dim via this; Android uses a ripple). */
  optionPressed: (t: ColorTokens) => ViewStyle;
  /** Option row text (label + the indicator glyph). */
  optionText: (t: ColorTokens, size: Size) => TextStyle;
  /** The selected-row indicator glyph (✓) styled in the platform's accent. */
  indicator: (t: ColorTokens, size: Size) => TextStyle;
  /** Which side the selection indicator renders on. */
  selectedSide: "leading" | "trailing";
  /** Opacity applied to the trigger when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the trigger + rows on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the trigger and the rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// The control owns the full width of its slot; the escape-hatch `style` (mainly
// width) is applied after this by the shell.
export const root: ViewStyle = { width: "100%" };

// --- shared layout fragments (identical across platforms) -------------------

const TRIGGER_ROW: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// Trigger height per size; mirrors the Input control's footprint (h-8/h-9/h-10).
const WEB_TRIGGER_BOX: Record<Size, number> = { small: 32, default: 36, large: 40 };
export const webSkin: SelectSkin = {
  text: textType,
  label: (t, size) => ({ marginBottom: 6, fontWeight: "500", color: t.foreground, ...TEXT_SIZE[size] }),
  trigger: (t, size) => ({
    ...TRIGGER_ROW,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: t.input,
    backgroundColor: t.background,
    paddingHorizontal: 12,
    height: WEB_TRIGGER_BOX[size],
  }),
  triggerValue: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: (t, size, hasValue) => ({ color: hasValue ? t.foreground : t["muted-foreground"], ...TEXT_SIZE[size] }),
  chevron: (t, size) => ({ color: t["muted-foreground"], ...TEXT_SIZE[size] }),
  chevronGlyph: "▾",
  panel: (t) => ({
    marginTop: 4,
    maxHeight: 240,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.popover,
    padding: 4,
    ...shadow("lg"),
  }),
  optionRow: (t, selected) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...(selected ? { backgroundColor: t.accent } : null),
  }),
  optionPressed: (t) => ({ backgroundColor: t.accent }),
  optionText: (t, size) => ({ color: t["popover-foreground"], ...TEXT_SIZE[size] }),
  indicator: (t, size) => ({ color: t["popover-foreground"], ...TEXT_SIZE[size] }),
  selectedSide: "leading",
  disabledOpacity: 0.5,
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- iOS (HIG pop-up button): rounded filled trigger, gray fill, no border ----------
// Apple's pop-up button: a rounded rect (~10pt) over a light gray fill
// (tertiarySystemFill ~ the `secondary` token) with NO visible border, ~44pt
// tall, a trailing chevron-up-down disclosure glyph tinted with the brand
// `primary`. The menu is a rounded popover (12pt) over `popover` with a soft
// shadow and ~15pt rows; the SELECTED row shows a trailing brand checkmark.
const IOS_RADIUS = 10;
const IOS_TRIGGER_BOX: Record<Size, number> = { small: 36, default: 44, large: 50 };
const IOS_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 13, lineHeight: 18 },
  default: { fontSize: 15, lineHeight: 20 },
  large: { fontSize: 17, lineHeight: 22 },
};
export const iosSkin: SelectSkin = {
  text: (size) => IOS_TEXT[size],
  label: (t, size) => ({ marginBottom: 6, fontWeight: "600", color: t.foreground, ...IOS_TEXT[size] }),
  trigger: (t, size) => ({
    ...TRIGGER_ROW,
    borderRadius: IOS_RADIUS,
    backgroundColor: t.secondary,
    paddingHorizontal: 14,
    height: IOS_TRIGGER_BOX[size],
  }),
  triggerValue: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: (t, size, hasValue) => ({ color: hasValue ? t.foreground : t["muted-foreground"], ...IOS_TEXT[size] }),
  // The trailing disclosure is the brand indigo, the iOS pop-up button tint.
  // "⇅" reads as the chevron-up-down pop-up disclosure inline.
  chevron: (t, size) => ({ color: t.primary, fontWeight: "600", ...IOS_TEXT[size] }),
  chevronGlyph: "⇅",
  panel: (t) => ({
    marginTop: 6,
    maxHeight: 280,
    borderRadius: 12,
    backgroundColor: t.popover,
    paddingVertical: 6,
    ...shadow("lg"),
  }),
  // No row tint at rest on iOS; the selection is shown by the trailing check.
  optionRow: (_t, _selected) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  }),
  optionPressed: (t) => ({ backgroundColor: t.secondary }),
  optionText: (t, _size) => ({ color: t["popover-foreground"], ...IOS_TEXT["default"] }),
  // The selected-row checkmark is the brand indigo, trailing-aligned (HIG).
  indicator: (t, _size) => ({ color: t.primary, fontWeight: "600", ...IOS_TEXT["default"] }),
  selectedSide: "trailing",
  disabledOpacity: 0.5,
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 exposed dropdown): filled field, top radius, active indicator ----------
// M3 exposed dropdown menu: a filled trigger (subtle `muted` fill ~
// surface-container-highest), the TOP corners rounded ~4dp and a flat bottom,
// with a bottom active-indicator underline — 1dp `input` at rest, 2dp `primary`
// (brand) when open — and a trailing dropdown arrow (chevron-down). The menu is
// an elevated surface (4dp, `popover`, soft shadow); pressed rows tint with the
// ripple (alpha(primary, 0.12) state layer) and the selected row is tinted.
const ANDROID_TOP_RADIUS = 4;
const ANDROID_TRIGGER_BOX: Record<Size, number> = { small: 48, default: 56, large: 60 };
const ANDROID_TEXT: Record<Size, TextStyle> = {
  small: { fontSize: 14, lineHeight: 20 },
  default: { fontSize: 16, lineHeight: 24 },
  large: { fontSize: 18, lineHeight: 26 },
};
// M3 supporting-text label scale, a notch below the field type.
const ANDROID_LABEL: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 12, lineHeight: 16 },
  large: { fontSize: 14, lineHeight: 20 },
};
export const androidSkin: SelectSkin = {
  text: (size) => ANDROID_TEXT[size],
  label: (t, size) => ({ marginBottom: 6, fontWeight: "500", color: t.foreground, ...ANDROID_LABEL[size] }),
  trigger: (t, size, open) => ({
    ...TRIGGER_ROW,
    borderTopLeftRadius: ANDROID_TOP_RADIUS,
    borderTopRightRadius: ANDROID_TOP_RADIUS,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: open ? 2 : 1,
    // Rest baseline reads clearly (on-surface-variant ~ muted-foreground) so the M3
    // filled trigger is distinct from the iOS lineless capsule.
    borderBottomColor: open ? t.primary : t["muted-foreground"],
    backgroundColor: t.muted,
    paddingHorizontal: 16,
    height: ANDROID_TRIGGER_BOX[size],
  }),
  triggerValue: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: (t, size, hasValue) => ({ color: hasValue ? t.foreground : t["muted-foreground"], ...ANDROID_TEXT[size] }),
  // The trailing dropdown arrow tints with the brand `primary` when open, muted at rest.
  chevron: (t, size, open) => ({ color: open ? t.primary : t["muted-foreground"], ...ANDROID_TEXT[size] }),
  chevronGlyph: "⌄",
  panel: (t) => ({
    marginTop: 2,
    maxHeight: 280,
    borderRadius: 4,
    backgroundColor: t.popover,
    paddingVertical: 8,
    ...shadow("md"),
  }),
  optionRow: (t, selected) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    ...(selected ? { backgroundColor: alpha(t.primary, 0.12) } : null),
  }),
  // The M3 pressed state layer: the brand primary at ~12% alpha (the ripple tint).
  optionPressed: (t) => ({ backgroundColor: alpha(t.primary, 0.12) }),
  optionText: (t, _size) => ({ color: t["popover-foreground"], ...ANDROID_TEXT["small"] }),
  indicator: (t, _size) => ({ color: t.primary, fontWeight: "700", ...ANDROID_TEXT["small"] }),
  selectedSide: "leading",
  disabledOpacity: 0.38, // M3 disabled opacity
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
