import { type ViewStyle, type TextStyle } from "react-native";
import { alpha, shape, MONO_FONT, tabularNums, type ColorTokens } from "../../style/index.js";
import { fieldBorder } from "../../style/field-colors.js";
import { type StepperSkin, type Size } from "./stepper.shared.js";

// Co-located Stepper skins, one per platform, drawn in the Canvas v4 hand-off's colours
// (`K.def('stepper')` in tools/v4/handoff/cv-kit-controls.js, and its iOS and Android rows
// `K.PF.stepper` in cv-kit-platform.js). Only the native SHAPE, sizing, and structure
// change per OS:
//   Web: one bordered box [ − | value | + ] at the control corner, 32/40/48px tall,
//     the raised fill inside the field border, square ± cells with 15px foreground
//     glyphs (a hovered cell washes in the neutral fill), and the value in the 500 mono
//     face (14px, 16 large) in a 40px column. The 500 13px title sits 6px above in the
//     secondary ink, the 12px description 6px below in the subtle ink. Disabled at 0.4.
//   iOS (HIG / iOS 27 kit Stepper): a FULL-CAPSULE gray pill of [ − | + ]
//     (radius = height/2, continuous corner curve) with an inset hairline divider
//     (height − 8, self-centered) between the halves, 28/32/36pt tall, `secondary` fill;
//     the editable value sits in a field to its LEFT (HIG layout). Press paints a
//     quaternary-fill HIGHLIGHT on the pressed half (the glyph keeps full color). The
//     iOS 27 stepper has NO accent slot, so its glyphs are the foreground. The footnote
//     description sits under the control. Disabled at 0.5.
//   Android (Material 3): two OUTLINED icon buttons (M3 has no stepper, so a custom
//     quantity control built from icon buttons) flanking the value, circular 32/40/48dp,
//     a 1dp field-border outline (a FAINTER alpha outline at a bound, per the M3
//     disabled treatment), accent-ink glyphs, flat (no shadow), 12%-alpha ripple on
//     press, and hitSlop padding the touch target to the M3 48dp minimum. The
//     body-small description sits under the control. Disabled at 0.38.
// A button at its bound softens its glyph (the shell passes `off`).

const ROW_CENTER: ViewStyle = { alignItems: "center", justifyContent: "center" };

// ============================ Web: the bordered box ============================
const WEB_HEIGHT: Record<Size, number> = { small: 32, base: 40, large: 48 };

export const webSkin: StepperSkin = {
  liquid: true,
  // The box's resting `field-border` edge turns `ring` while the value field holds
  // focus: the field's keyboard focus indicator (the field suppresses the browser ring).
  group: (t, size, _disabled, focused) => ({
    flexDirection: "row",
    alignItems: "stretch",
    height: WEB_HEIGHT[size],
    borderWidth: 1,
    borderColor: focused ? t.ring : fieldBorder(t),
    borderRadius: shape.web.control,
    backgroundColor: t.popover,
    overflow: "hidden",
  }),
  groupShowsFocus: true,
  // Square cells: as wide as the box is tall, less its 1px edges.
  button: (_t, size) => ({
    ...ROW_CENTER,
    width: WEB_HEIGHT[size] - 2,
    height: "100%",
  }),
  buttonHover: (t) => ({ backgroundColor: t.secondary }),
  field: (t, size) => ({
    fontFamily: MONO_FONT,
    fontWeight: "500",
    fontSize: size === "large" ? 16 : 14,
    lineHeight: size === "large" ? 22 : 20,
    width: 40,
    height: "100%",
    textAlign: "center",
    color: t.foreground,
    paddingHorizontal: 0,
  }),
  divider: null,
  glyph: (t, _size, off) => ({ color: off ? t["muted-foreground"] : t.foreground, size: 15 }),
  pressedOpacity: 0.6,
  ripple: null,
  hitSlop: null,
  fieldOnLeft: false,
  disabledOpacity: 0.4,
  // The hand-off's field label: 500 13px in the secondary ink, at every size.
  labelAbove: (t) => ({ fontSize: 13, lineHeight: 17, fontWeight: "500", color: t["muted-foreground"] }),
  description: (t) => ({ fontSize: 12, lineHeight: 18, fontWeight: "400", color: t["subtle-foreground"] ?? t["muted-foreground"] }),
};

// ============================ iOS (HIG / iOS 27 kit Stepper) ============================
// The segmented UIStepper pill: a `secondary` FULL CAPSULE of [ − | + ] (iOS 27 kit
// Stepper root: border-radius infinity, continuous corner curve) with an inset
// hairline divider between the halves (1 × height − 8, self-centered, the kit's
// 1x24 separator on the 32pt control). The editable value sits in a transparent field
// to the LEFT of the pill (the HIG layout) at the iOS body role (17/22 base). The ±
// glyphs are NEUTRAL `foreground` (the stepper has no accent slot: its glyphs are
// label-colored), and a pressed half gets a quaternary-fill HIGHLIGHT
// (alpha(foreground, 0.1)) instead of a dim, so the glyph never fades mid-press.
const IOS_HEIGHT: Record<Size, number> = { small: 28, base: 32, large: 36 };
const IOS_BTN_W: Record<Size, number> = { small: 42, base: 48, large: 54 };
const IOS_GLYPH: Record<Size, number> = { small: 16, base: 18, large: 20 };
const IOS_VALUE: Record<Size, TextStyle> = {
  small: { fontSize: 15, lineHeight: 20 },
  base: { fontSize: 17, lineHeight: 22 },
  large: { fontSize: 20, lineHeight: 25 },
};
const NATIVE_LABEL: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  base: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};

export const iosSkin: StepperSkin = {
  group: (t, size) => ({
    flexDirection: "row",
    alignItems: "stretch",
    height: IOS_HEIGHT[size],
    // Full capsule (9999 clamps to half the height) with Apple's smooth corner curve.
    // borderCurve is iOS-only (no-op elsewhere).
    borderRadius: 9999,
    borderCurve: "continuous",
    backgroundColor: t.secondary,
    overflow: "hidden",
  }),
  button: (t, size, _side, disabled, pressed) => ({
    ...ROW_CENTER,
    width: IOS_BTN_W[size],
    height: "100%",
    // iOS 27 stepper press feedback: the pressed half paints a quaternary-fill
    // segment highlight (like a segmented control) while the glyph stays at full
    // label color, never an opacity dim.
    backgroundColor: pressed && !disabled ? alpha(t.foreground, 0.1) : "transparent",
  }),
  field: (t, size) => ({
    // iOS body text is 17pt: the value takes the iOS type roles (subheadline 15/20,
    // body 17/22, title3 20/25) with tabular figures.
    ...IOS_VALUE[size],
    fontWeight: "400",
    ...tabularNums(),
    // The hand-off's 52pt value column, right-aligned toward the pill, padded 10 from it.
    width: 52,
    textAlign: "right",
    color: t.foreground,
    backgroundColor: "transparent",
    paddingRight: 10,
  }),
  // The hairline that splits the [ − | + ] pill into two halves: inset 4pt top and
  // bottom (1 × height − 8, the kit's 1x24 separator on the 32pt stepper) in a
  // tertiary-label-like ink that reads against the `secondary` fill in BOTH schemes.
  divider: (t) => ({
    width: 1,
    alignSelf: "stretch",
    marginVertical: 4,
    backgroundColor: alpha(t.foreground, 0.3),
  }),
  glyph: (t, size, off) => ({ color: off ? t["muted-foreground"] : t.foreground, size: IOS_GLYPH[size] }),
  pressedOpacity: null, // the pressed half highlights (see button), no dim on iOS
  ripple: null,
  hitSlop: null, // Apple's own UIStepper is a 32pt-tall control; no HIG finding here
  fieldOnLeft: true,
  disabledOpacity: 0.5,
  // The iOS field-label above the control: SF Pro Text tracking (letterSpacing
  // -0.15 at 14pt, Apple's SF tracking table) and semibold (600), the iOS
  // field-label convention (identical to Input's iOS label).
  labelAbove: (t, size) => ({ ...NATIVE_LABEL[size], fontWeight: "600", letterSpacing: -0.15, color: t.foreground }),
  // The footnote line under the control: iOS footnote 13pt with SF tracking.
  description: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "400", letterSpacing: -0.08, color: t["subtle-foreground"] ?? t["muted-foreground"] }),
};

// ============================ Android (Material 3 quantity control) ============================
// M3 has no stepper, so this is the standard custom quantity control: two OUTLINED
// circular icon buttons flanking the value, flat (no shadow), with a 12%-alpha brand
// android_ripple on press and hitSlop padding the touch target to the M3 48dp minimum.
// The ± glyphs are the accent ink; the value sits inline between the buttons.
const M3_BTN: Record<Size, number> = { small: 32, base: 40, large: 48 };
const M3_GAP: Record<Size, number> = { small: 6, base: 8, large: 10 };
const M3_GLYPH: Record<Size, number> = { small: 18, base: 20, large: 22 };
const M3_VALUE: Record<Size, TextStyle> = {
  small: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  large: { fontSize: 18, lineHeight: 26 },
};

export const androidSkin: StepperSkin = {
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
    // M3 disabled outlined treatment: the outline FADES (on-surface at 12% alpha),
    // always fainter than the enabled outline, or the at-bound button reads as the
    // emphasized one.
    borderColor: disabled ? alpha(t.foreground, 0.12) : fieldBorder(t),
    backgroundColor: "transparent", // outlined, flat (no elevation/shadow per M3)
    overflow: "hidden", // clip the ripple to the circle
  }),
  buttonHover: (t) => ({ backgroundColor: t["primary-soft"] ?? t.accent }),
  field: (t, size) => ({
    // M3 body input is 16sp, with tabular figures.
    ...M3_VALUE[size],
    fontWeight: "400",
    ...tabularNums(),
    width: 56,
    textAlign: "center",
    color: t.foreground,
    backgroundColor: "transparent",
  }),
  divider: null, // no joining lines: the M3 buttons are separate outlined circles
  glyph: (t: ColorTokens, size, off) => ({ color: off ? t["subtle-foreground"] ?? t["muted-foreground"] : t["primary-text"] ?? t.primary, size: M3_GLYPH[size] }),
  pressedOpacity: null, // Android uses a ripple instead
  // M3 state layer = 12% alpha ink (the accent here), per src/style/ripple.ts
  // conventions; bounded + the overflow clip above keeps it inside the circle.
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
  // Pad the 32/40dp circles out to the M3 48dp minimum touch target (large is 48dp
  // already): the standard M3 icon-button pattern of a 40dp container in a 48dp target.
  hitSlop: (size) => Math.max(0, (48 - M3_BTN[size]) / 2),
  fieldOnLeft: false,
  disabledOpacity: 0.38,
  // M3 has no stepper, so its custom quantity control carries a component-owned
  // title ABOVE (a ± button row has no filled field box to float an in-container
  // M3 label into). The M3 label type: medium (500) with M3 label tracking (0.1).
  labelAbove: (t, size) => ({ ...NATIVE_LABEL[size], fontWeight: "500", letterSpacing: 0.1, color: t.foreground }),
  // M3 supporting text: body-small (12sp) with body-small tracking (0.4), on-surface-variant.
  description: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", letterSpacing: 0.4, color: t["muted-foreground"] }),
};
