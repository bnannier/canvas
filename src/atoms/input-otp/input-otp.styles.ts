import { type ViewStyle, type TextStyle } from "react-native";
import { alpha, type ColorTokens } from "../../style/index.js";
import { type InputOTPSkin, type Size } from "./input-otp.shared.js";

// Co-located InputOTP skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark). The BRAND survives on every
// platform: the active/focused cell always lights up in the indigo `primary`/`ring`,
// never a platform default (no iOS system blue, no M3 default). Only the native
// SHAPE, sizing, and structure of the segmented field change per OS:
//   iOS (HIG): rounded-square cells (~12 radius) on a `secondary` field fill, SEPARATED
//     by a small gap; the active cell is ring-highlighted in `primary` (a 2pt brand
//     border). Base cell ~44x52.
//   Android (Material 3): OUTLINED cells (1dp `border`), SEPARATED by a gap, M3 medium
//     corner (~12 radius); the active cell border thickens to 2dp in `primary`. M3 type
//     scale. Base cell ~52x56.
//   Web: the established Canvas look, matched to shadcn input-otp — a CONNECTED group of
//     bordered cells that share borders (gap 0), only the outer corners rounded (md/6),
//     active cell tinted `ring` with a soft 3px ring at 50% alpha. Base cell ~36x36.
// Disabled dims the whole control (opacity in the shell). Each cell centers its digit;
// the empty active cell draws a thin `foreground` caret bar.

// ---- shared geometry helpers ----
const CELL_BASE: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
};

// Digit type scale per size (the digit is the value; size scales it with the box).
function digitText(t: ColorTokens, size: Size, weight: TextStyle["fontWeight"]): TextStyle {
  const fontSize = size === "large" ? 22 : size === "small" ? 15 : 18;
  return {
    fontSize,
    lineHeight: Math.round(fontSize * 1.2),
    fontWeight: weight,
    color: t.foreground,
    textAlign: "center",
  };
}

// The caret bar: a thin vertical rule centered in the empty active cell, sized to
// the digit cap height per size (matches shadcn's h-4 w-px caret).
function caretBar(t: ColorTokens, size: Size): ViewStyle {
  const height = size === "large" ? 22 : size === "small" ? 15 : 18;
  return { width: 1.5, height, borderRadius: 1, backgroundColor: t.foreground };
}

// ---------- iOS (HIG): rounded-square filled cells, separated, primary ring on active ----------
const IOS_RADIUS = 12;
const IOS_W: Record<Size, number> = { small: 38, base: 44, large: 52 };
const IOS_H: Record<Size, number> = { small: 44, base: 52, large: 60 };

export const iosSkin: InputOTPSkin = {
  gap: (size) => (size === "large" ? 10 : size === "small" ? 6 : 8),
  connected: false,
  cell: (t, size, { active }) => ({
    ...CELL_BASE,
    width: IOS_W[size],
    height: IOS_H[size],
    borderRadius: IOS_RADIUS,
    // HIG field-style fill so the empty cells read as tappable slots on both schemes.
    backgroundColor: t.secondary,
    // Active cell gets a brand ring; resting cells are borderless (the fill defines them).
    borderWidth: active ? 2 : 0,
    borderColor: active ? t.primary : "transparent",
  }),
  digit: (t, size) => digitText(t, size, "600"),
  caret: caretBar,
  disabledOpacity: 0.5,
};

// ---------- Android (Material 3): outlined cells, separated, 2dp primary on active ----------
const M3_RADIUS = 12; // M3 medium-component corner
const M3_W: Record<Size, number> = { small: 44, base: 52, large: 60 };
const M3_H: Record<Size, number> = { small: 48, base: 56, large: 64 };

export const androidSkin: InputOTPSkin = {
  gap: (size) => (size === "large" ? 12 : size === "small" ? 6 : 8),
  connected: false,
  cell: (t, size, { active }) => ({
    ...CELL_BASE,
    width: M3_W[size],
    height: M3_H[size],
    borderRadius: M3_RADIUS,
    backgroundColor: "transparent",
    // M3 outlined field: 1dp outline at rest, thickening to a 2dp brand outline when active.
    borderWidth: active ? 2 : 1,
    borderColor: active ? t.primary : t.border,
  }),
  // M3 body-large digit scale.
  digit: (t, size) => digitText(t, size, "500"),
  caret: caretBar,
  disabledOpacity: 0.38, // M3 disabled opacity
};

// ---------- Web: the established Canvas look (shadcn input-otp) ----------
// Connected group of bordered cells sharing borders (gap 0): the left edge is drawn
// only on the first cell, every cell draws top/right/bottom, and only the outer
// corners are rounded (md). The active cell tints to `ring` with a soft 3px ring.
const WEB_RADIUS = 6; // rounded-md
const WEB_SIZE: Record<Size, number> = { small: 32, base: 36, large: 44 };

export const webSkin: InputOTPSkin = {
  gap: () => 0,
  connected: true,
  cell: (t, size, { active, index, count }) => {
    const d = WEB_SIZE[size];
    const isFirst = index === 0;
    const isLast = index === count - 1;
    return {
      ...CELL_BASE,
      width: d,
      height: d,
      position: "relative",
      backgroundColor: t.background,
      // Shared borders: every cell draws top/right/bottom; only the first draws the left.
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderEndWidth: 1,
      borderStartWidth: isFirst ? 1 : 0,
      borderColor: active ? t.ring : t.input,
      // Only the outer corners are rounded (first-left / last-right).
      borderTopStartRadius: isFirst ? WEB_RADIUS : 0,
      borderBottomStartRadius: isFirst ? WEB_RADIUS : 0,
      borderTopEndRadius: isLast ? WEB_RADIUS : 0,
      borderBottomEndRadius: isLast ? WEB_RADIUS : 0,
      // shadcn's data-[active]: a 3px ring at 50% alpha + raised z so it overlaps neighbors.
      ...(active
        ? {
            zIndex: 10,
            shadowColor: alpha(t.ring, 0.5),
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 0,
            // RN Web: a uniform 3px outer ring via boxShadow spread (filter prop unused here).
            boxShadow: `0 0 0 3px ${alpha(t.ring, 0.5)}`,
          }
        : null),
    } as ViewStyle;
  },
  digit: (t, size) => digitText(t, size, "500"),
  caret: caretBar,
  disabledOpacity: 0.5,
};
