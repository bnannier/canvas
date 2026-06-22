import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";
import { type NumberInputSkin, type Size } from "./number-input.shared.js";

// Co-located NumberInput skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark). The BRAND survives on every
// platform: the ± glyphs are the indigo `primary`, never a platform default (no iOS
// system blue, no M3 default). Only the native SHAPE, sizing, and structure change:
//   iOS (HIG / iOS 27 kit Stepper): a segmented gray PILL of [ − | + ] with a
//     hairline divider between the two halves, ~32pt tall, ~8 radius, `secondary`
//     fill; the editable value sits in a field to its LEFT (HIG layout). Press dims
//     the pressed half (iOS opacity feedback).
//   Android (Material 3): two OUTLINED icon buttons (M3 has no stepper, so a custom
//     quantity control built from icon buttons) flanking the value, circular ~40dp,
//     1dp `border` outline, flat (no shadow), with an android_ripple on press.
//   Web: the established Canvas look — a single bordered group [ − | value | + ] with
//     1px divider lines between the slots (the shadcn-ish number field), 6 radius.
// Disabled dims the whole control (opacity in the shell) and softens the ± glyph to
// `muted` (handled in the shell).

// ---- shared field type scale (brand type, identical across platforms) ----
function fieldText(size: Size): TextStyle {
  if (size === "large") return { fontSize: 16, lineHeight: 24 };
  if (size === "small") return { fontSize: 12, lineHeight: 16 };
  return { fontSize: 14, lineHeight: 20 };
}

const ROW_CENTER: ViewStyle = { alignItems: "center", justifyContent: "center" };

// ============================ Web: the established Canvas look ============================
// A single bordered group [ − | value | + ] with 1px inner dividers, 6 radius, the
// background fill, and an opacity dim on a pressed ± button (mirrors the kit's other
// web skins). The glyph is the brand `primary`.
const WEB_HEIGHT: Record<Size, number> = { small: 32, base: 36, large: 40 };
const WEB_BTN_W: Record<Size, number> = { small: 32, base: 36, large: 40 };
const WEB_FIELD_W: Record<Size, number> = { small: 48, base: 56, large: 64 };

export const webSkin: NumberInputSkin = {
  group: (t, size) => ({
    flexDirection: "row",
    alignItems: "stretch",
    height: WEB_HEIGHT[size],
    borderWidth: 1,
    borderColor: t.input,
    borderRadius: 6,
    backgroundColor: t.background,
    overflow: "hidden",
  }),
  button: (_t, size, _side) => ({
    ...ROW_CENTER,
    width: WEB_BTN_W[size],
    height: "100%",
  }),
  field: (t, size) => ({
    ...fieldText(size),
    width: WEB_FIELD_W[size],
    height: "100%",
    textAlign: "center",
    color: t.foreground,
    paddingHorizontal: 4,
  }),
  divider: (t) => ({ width: 1, alignSelf: "stretch", backgroundColor: t.border }),
  glyph: (_t, size) => ({ color: "primary", size: size === "large" ? 18 : size === "small" ? 14 : 16 }),
  pressedOpacity: 0.6,
  ripple: null,
  fieldOnLeft: false,
};

// ============================ iOS (HIG / iOS 27 kit Stepper) ============================
// The segmented UIStepper pill: a `secondary` rounded rect of [ − | + ] with a single
// hairline divider between the halves, ~32pt tall, ~8 radius. The editable value sits
// in a transparent field to the LEFT of the pill (the HIG layout). The ± glyphs are
// the brand `primary` (replacing the iOS system blue), and a pressed half dims to 0.4.
const IOS_HEIGHT: Record<Size, number> = { small: 28, base: 32, large: 36 };
const IOS_BTN_W: Record<Size, number> = { small: 42, base: 48, large: 54 };
const IOS_FIELD_W: Record<Size, number> = { small: 44, base: 52, large: 60 };
const IOS_RADIUS: Record<Size, number> = { small: 7, base: 8, large: 9 };

export const iosSkin: NumberInputSkin = {
  group: (t, size) => ({
    flexDirection: "row",
    alignItems: "stretch",
    height: IOS_HEIGHT[size],
    borderRadius: IOS_RADIUS[size],
    backgroundColor: t.secondary,
    overflow: "hidden",
  }),
  button: (_t, size, _side) => ({
    ...ROW_CENTER,
    width: IOS_BTN_W[size],
    height: "100%",
  }),
  field: (t, size) => ({
    ...fieldText(size),
    width: IOS_FIELD_W[size],
    // The value sits to the left of the pill, right-aligned toward it, on a
    // transparent surface (no box) per the HIG inline layout.
    textAlign: "right",
    color: t.foreground,
    backgroundColor: "transparent",
    paddingRight: 10,
  }),
  // The hairline that splits the [ − | + ] pill into two halves.
  divider: (t) => ({ width: 1, alignSelf: "stretch", backgroundColor: t.border }),
  glyph: (_t, size) => ({ color: "primary", size: size === "large" ? 20 : size === "small" ? 16 : 18 }),
  pressedOpacity: 0.4,
  ripple: null,
  fieldOnLeft: true,
};

// ============================ Android (Material 3 quantity control) ============================
// M3 has no stepper, so this is the standard custom quantity control: two OUTLINED
// circular icon buttons (1dp `border`, ~40dp) flanking the value, flat (no shadow),
// with an android_ripple on press. The ± glyphs are the brand `primary`; the value
// sits inline between the buttons.
const M3_BTN: Record<Size, number> = { small: 32, base: 40, large: 48 };
const M3_FIELD_W: Record<Size, number> = { small: 48, base: 56, large: 64 };
const M3_GAP: Record<Size, number> = { small: 6, base: 8, large: 10 };

export const androidSkin: NumberInputSkin = {
  // The group is just a row; the M3 icon buttons carry their own outline, so the
  // group itself is transparent with a gap between slots.
  group: (_t, size) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: M3_GAP[size],
  }),
  button: (t, size, _side, disabled) => ({
    ...ROW_CENTER,
    width: M3_BTN[size],
    height: M3_BTN[size],
    borderRadius: 9999, // M3 icon button = circle
    borderWidth: 1,
    borderColor: disabled ? t["muted-foreground"] : t.border,
    backgroundColor: "transparent", // outlined, flat (no elevation/shadow per M3)
    overflow: "hidden", // clip the ripple to the circle
  }),
  field: (t, size) => ({
    ...fieldText(size),
    // M3 body input is 16sp; nudge the value type up.
    ...(size === "large" ? { fontSize: 18, lineHeight: 26 } : size === "small" ? { fontSize: 14, lineHeight: 20 } : { fontSize: 16, lineHeight: 24 }),
    width: M3_FIELD_W[size],
    textAlign: "center",
    color: t.foreground,
    backgroundColor: "transparent",
  }),
  divider: null, // no joining lines: the M3 buttons are separate outlined chips
  glyph: (_t, size) => ({ color: "primary", size: size === "large" ? 22 : size === "small" ? 18 : 20 }),
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: t.primary, borderless: false }),
  fieldOnLeft: false,
};
