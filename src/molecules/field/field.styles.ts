import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Field styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens, so the label/value text
// and the avatar-overflow chip follow light/dark (and the glass surface).

// --- shared text ------------------------------------------------------------

// The engine has no font-family utility, so request RN's cross-platform
// monospace alias via inline style (the same technique Badge uses for `mono`).
export const monoStyle: TextStyle = { fontFamily: "monospace" };

// Left-column label of a display row: a fixed 180px muted term.
export function fieldLabel(tokens: ColorTokens): TextStyle {
  return { width: 180, flexShrink: 0, fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// The default value shape: medium-weight foreground text.
export function fieldValue(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// --- display mode (rows) ----------------------------------------------------

// Outer stack of label/value rows.
export const displayStack: ViewStyle = { flexDirection: "column", gap: 12 };

// One row: label column + value, baseline-aligned.
export const displayRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 16 };

// The value column grows to fill the row beside the fixed label column.
export const valueFill: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// An overlapping avatar stack row.
export const avatarRow: ViewStyle = { flexDirection: "row", alignItems: "center" };

// Each avatar after the first overlaps the previous one.
export const avatarOverlap: ViewStyle = { marginLeft: -8 };

// The trailing "+N" overflow chip after an avatar stack.
export function overflowChip(tokens: ColorTokens): ViewStyle {
  return {
    marginLeft: -8,
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: tokens.background,
    backgroundColor: tokens.muted,
  };
}

export function overflowText(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["muted-foreground"] };
}

// A copyable value: the value text followed by a ghost Copy button.
export const copyRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// --- control mode -----------------------------------------------------------

// Outer stack of label / control / message.
export const controlStack: ViewStyle = { flexDirection: "column", gap: 6 };

// The dimmed look applied to the whole field when disabled.
export const dimmed: ViewStyle = { opacity: 0.5 };

// The control's label above the Input.
export function label(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// The destructive "*" appended to a required field's label.
export function requiredMark(tokens: ColorTokens): TextStyle {
  return { color: tokens.destructive };
}

// The helper / error line below the control. Error text is destructive, the
// resting helper is muted.
export function message(tokens: ColorTokens, error: boolean): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: error ? tokens.destructive : tokens["muted-foreground"] };
}
