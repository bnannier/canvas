import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Radio styles. The ring/dot diameters and label type are layout-only
// per size; anything reading a color (the ring border, the dot fill, the label)
// is a function of the active tokens, so selection follows the primary token and
// the label follows light/dark.

export type Size = "small" | "default" | "large";

// The pressable row: control beside an optional label, control nudged to the
// first text line (the ring carries the mt-[3px] when a label is present).
export const root: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 8,
};

// Ring diameter per size. Default is the 16px form control; small pairs with
// dense rows, large with touch-first layouts.
const RING_BOX: Record<Size, { width: number; height: number }> = {
  small: { width: 14, height: 14 },
  default: { width: 16, height: 16 },
  large: { width: 20, height: 20 },
};

// Inner dot diameter per size, ~half the ring so the fill reads as a dot.
const DOT_BOX: Record<Size, { width: number; height: number }> = {
  small: { width: 6, height: 6 },
  default: { width: 8, height: 8 },
  large: { width: 10, height: 10 },
};

// Label type per size, matched to the surrounding body text scale.
const LABEL_TYPE: Record<Size, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};

// The circular control. Selected swaps the neutral input border for primary;
// unselected keeps a transparent fill so only the ring shows until a dot is
// revealed. `nudge` applies the mt-[3px] so the ring sits beside the label's
// title rather than the vertical middle of a wrapped label.
export function ring(tokens: ColorTokens, size: Size, checked: boolean, nudge: boolean): ViewStyle {
  return {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: checked ? tokens.primary : tokens.input,
    backgroundColor: "transparent",
    ...RING_BOX[size],
    ...(nudge ? { marginTop: 3 } : null),
  };
}

// The centered fill dot, shown only when selected.
export function dot(tokens: ColorTokens, size: Size): ViewStyle {
  return {
    borderRadius: 9999,
    backgroundColor: tokens.primary,
    ...DOT_BOX[size],
  };
}

// The label beside the control. Medium weight; dimmed to muted when disabled.
export function label(tokens: ColorTokens, size: Size, disabled: boolean): TextStyle {
  return {
    fontWeight: "500",
    color: disabled ? tokens["muted-foreground"] : tokens.foreground,
    ...LABEL_TYPE[size],
  };
}
