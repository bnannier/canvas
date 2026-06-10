import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Divider styles. The hairline rule is layout-only except for its
// fill, which reads a token (so it follows light/dark and the glass surface):
// `strong` tracks the standard border token, `soft` steps down to muted for a
// quieter rule. Layout fragments are static objects; the color is a function of
// the active tokens.

export type Orientation = "horizontal" | "vertical";
export type Emphasis = "soft" | "strong";

// The hairline fill color, token-backed. `strong` is the standard border;
// `soft` steps down to the muted token for a quieter rule (was bg-border / bg-muted).
export function ruleFill(tokens: ColorTokens, emphasis: Emphasis): ViewStyle {
  return { backgroundColor: emphasis === "strong" ? tokens.border : tokens.muted };
}

// Vertical rule: 1px wide, stretching to the row height it sits in (w-px self-stretch).
export const verticalRule: ViewStyle = { width: 1, alignSelf: "stretch" };

// Plain horizontal hairline spanning the full width (h-px w-full).
export const horizontalRule: ViewStyle = { height: 1, width: "100%" };

// The labeled/action row: a centered node flanked by two hairlines
// (flex-row items-center gap-3).
export const labelRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12 };

// A flanking hairline inside the labeled row: 1px tall, growing to fill (h-px flex-1).
export const flankRule: ViewStyle = { height: 1, flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The centered label text: xs muted (text-xs text-muted-foreground).
export function labelText(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}
