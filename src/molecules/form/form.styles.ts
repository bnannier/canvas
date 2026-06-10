import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Form styles. The responsive collapse (side-by-side -> stacked at the
// `sm` breakpoint) is driven by useResponsive in the component; these are the
// static fragments and the token-colored text it composes.

export function label(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

export function helper(tokens: ColorTokens): TextStyle {
  return { marginTop: 6, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

export function sectionDescription(tokens: ColorTokens): TextStyle {
  return { marginTop: 4, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// The hairline under every section except the last.
export function sectionDivider(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border, paddingBottom: 24 };
}

// Field-label inset above its input.
export const labelSpacing: TextStyle = { marginBottom: 6 };

// Section/sidebar heading: bumps the label weight from medium to semibold.
export const headingWeight: TextStyle = { fontWeight: "600" };

// flex-1 vs flex-auto (the two-column item basis, base vs sm).
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };
export const flexAuto: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto" };

export const actions: ViewStyle = { marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 8 };

// Outer stacks, by layout.
export const stackGap4: ViewStyle = { gap: 16 };
export const stackGap6: ViewStyle = { gap: 24 };
