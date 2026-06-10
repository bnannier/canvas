import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Input styles. Field fragments are TextStyle (TextInput's style);
// the grouped-layout container and addon boxes are ViewStyle. The border color
// is resolved by the component (error > focus > default) and passed in.

type SizeProps = { small?: boolean; large?: boolean; multiline?: boolean };

// Type scale per size; the field and its addons share it so they line up.
export function textType(p: SizeProps): TextStyle {
  if (p.large) return { fontSize: 16, lineHeight: 24 };
  if (p.small) return { fontSize: 12, lineHeight: 16 };
  return { fontSize: 14, lineHeight: 20 };
}

// Height (or min-height for multiline) of the bare field.
export function bareBox(p: SizeProps): TextStyle {
  if (p.multiline) return { minHeight: p.large ? 96 : p.small ? 64 : 80 };
  return { height: p.large ? 40 : p.small ? 32 : 36 };
}

// Fixed row height for the grouped layout (addon boxes set it; field stretches).
export function groupedHeight(p: SizeProps): number {
  return p.large ? 40 : p.small ? 32 : 36;
}

// The bare field surface: full width, bordered, padded, on the background fill.
export function bareField(tokens: ColorTokens, borderColor: string): TextStyle {
  return {
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor,
    backgroundColor: tokens.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: tokens.foreground,
  };
}

// The grouped (addon) outer: a row sharing one border, clipping the joined edges.
export function groupContainer(tokens: ColorTokens, borderColor: string): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    borderWidth: 1,
    borderColor,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: tokens.background,
  };
}

// The inner field inside the group: grows to fill, full height, padded; an
// overlaid icon pads its side away (pl-9 / pr-9).
export function groupField(tokens: ColorTokens, leadingIcon: boolean, trailingIcon: boolean): TextStyle {
  return {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    height: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: tokens.foreground,
    ...(leadingIcon ? { paddingLeft: 36 } : null),
    ...(trailingIcon ? { paddingRight: 36 } : null),
  };
}

// A prefix/suffix addon box. "left" is a leading prefix (separator on its right),
// "right" is a trailing suffix (separator on its left).
export function addonBox(tokens: ColorTokens, side: "left" | "right", height: number): ViewStyle {
  return {
    justifyContent: "center",
    backgroundColor: tokens.muted,
    paddingHorizontal: 12,
    borderColor: tokens.border,
    ...(side === "left" ? { borderRightWidth: 1 } : { borderLeftWidth: 1 }),
    height,
  };
}

export function addonText(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}

export function actionText(tokens: ColorTokens): TextStyle {
  return { fontWeight: "500", color: tokens.foreground };
}

// Overlaid icon position inside the field (left or right gutter), behind input.
export function iconOverlay(side: "left" | "right"): ViewStyle {
  return {
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    ...(side === "left" ? { left: 0, paddingLeft: 12 } : { right: 0, paddingRight: 12 }),
  };
}
