import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha, shadow } from "../../style/index.js";

// Co-located ButtonGroup styles. The group is laid out per segment in JS (the
// engine had no `first:`/`last:` variants, so the joined-corner and shared-
// border math is computed here). Layout-only fragments are static objects;
// anything reading a color is a function of the active tokens (so segments,
// borders, and the split dropdown follow light/dark and glass).

export type Kind = "segmented" | "split" | "stepper" | "spaced";
export type Size = "small" | "default" | "large";

// Height + horizontal padding per size, mirroring the docs segSize scale
// (h-8 px-3 / h-9 px-4 / h-10 px-5).
export const sizeContainer: Record<Size, ViewStyle> = {
  small: { height: 32, paddingHorizontal: 12 },
  default: { height: 36, paddingHorizontal: 16 },
  large: { height: 40, paddingHorizontal: 20 },
};

// Label type per size (text-xs for small, text-sm otherwise).
export const sizeLabel: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 14, lineHeight: 20 },
};

// Height-only per size, for cells whose padding differs from sizeContainer
// (the split chevron and the stepper's chevron cells: h-8 / h-9 / h-10).
export const sizeHeight: Record<Size, number> = {
  small: 32,
  default: 36,
  large: 40,
};

// Chevron glyph px per size (small gets the tighter 14px arrow).
export const chevronSize: Record<Size, number> = {
  small: 14,
  default: 16,
  large: 16,
};

// --- segment (segmented / spaced) -------------------------------------------

// Row of a centered label inside a bordered cell. Press feedback (the old
// `active:opacity-90`) is applied by the component's Pressable.
export const segmentBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
};

// Corner radii for an attached segment given its position in the row
// (joinCorners): a lone segment is fully rounded; the ends round their outer
// corners only; interior segments are square (rounded-md -> 6).
export function joinCorners(index: number, count: number): ViewStyle {
  if (count === 1) return { borderRadius: 6 };
  if (index === 0) return { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 };
  if (index === count - 1) return { borderTopRightRadius: 6, borderBottomRightRadius: 6 };
  return {};
}

// Selected vs. unselected segment fill/border. The selected segment lifts above
// its neighbors (z-10) so its primary border wins on the shared edges.
export function segmentSurface(tokens: ColorTokens, selected: boolean): ViewStyle {
  return selected
    ? { zIndex: 10, borderColor: tokens.primary, backgroundColor: tokens.primary }
    : { borderColor: tokens.input, backgroundColor: tokens.background };
}

// Segment label: medium weight, primary-foreground when selected else foreground.
export function segmentLabel(tokens: ColorTokens, selected: boolean): TextStyle {
  return { fontWeight: "500", color: selected ? tokens["primary-foreground"] : tokens.foreground };
}

// All but the leading segment overlap the previous border by 1px (-ml-px).
export const overlap: ViewStyle = { marginLeft: -1 };

// The dimmed look applied to a disabled group/segment (opacity-50).
export const dim: ViewStyle = { opacity: 0.5 };

// --- split kind -------------------------------------------------------------

// The split control's outer row, anchoring the (absolute) dropdown.
export const splitContainer: ViewStyle = {
  position: "relative",
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
};

// The primary action button: rounded on its leading edge only, primary fill.
export function splitPrimary(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    backgroundColor: tokens.primary,
  };
}

// Primary action label: medium weight on the primary surface.
export function splitPrimaryLabel(tokens: ColorTokens): TextStyle {
  return { fontWeight: "500", color: tokens["primary-foreground"] };
}

// Hairline divider so the chevron reads as a distinct trigger
// (w-px bg-primary-foreground/20).
export function splitDivider(tokens: ColorTokens, height: number): ViewStyle {
  return { width: 1, height, backgroundColor: alpha(tokens["primary-foreground"], 0.2) };
}

// The chevron trigger: rounded on its trailing edge only, primary fill, px-2.
export function splitTrigger(tokens: ColorTokens, height: number): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: tokens.primary,
    paddingHorizontal: 8,
    height,
  };
}

// The floating dropdown of related actions, overflowing the group (absolute).
export function splitMenu(tokens: ColorTokens): ViewStyle {
  return {
    position: "absolute",
    top: "100%",
    right: 0,
    zIndex: 50,
    marginTop: 4,
    minWidth: 180,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.popover,
    padding: 4,
    ...shadow("lg"),
  };
}

// A dropdown row: padded, rounded; the pressed branch tints it (active:bg-accent).
export const splitMenuItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 2,
  paddingHorizontal: 8,
  paddingVertical: 6,
};

export function splitMenuItemPressed(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

export function splitMenuText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] };
}

// --- stepper kind -----------------------------------------------------------

// The stepper's outer row.
export const stepperContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
};

// A chevron (prev/next) cell: bordered, background fill, px-2, fixed height.
export function stepperArrow(tokens: ColorTokens, height: number): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.input,
    backgroundColor: tokens.background,
    paddingHorizontal: 8,
    height,
  };
}

// The previous arrow rounds its leading edge only.
export const stepperArrowLeft: ViewStyle = { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 };

// The next arrow rounds its trailing edge only and overlaps the middle cell.
export const stepperArrowRight: ViewStyle = {
  marginLeft: -1,
  borderTopRightRadius: 6,
  borderBottomRightRadius: 6,
};

// The middle (current) cell: a passive bordered label, overlapping the prev arrow.
export function stepperMiddle(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginLeft: -1,
    borderColor: tokens.input,
    backgroundColor: tokens.background,
  };
}

// The current-item label: medium weight, foreground.
export function stepperLabel(tokens: ColorTokens): TextStyle {
  return { fontWeight: "500", color: tokens.foreground };
}

// --- spaced kind ------------------------------------------------------------

// A plain row of detached peers separated by a gap (gap-2).
export const spacedContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
};

// --- segmented kind ---------------------------------------------------------

// The attached-segment row (no gap; segments share borders).
export const segmentedContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};
