import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Stepper styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so circles, glyphs,
// labels, and connectors follow light/dark and the glass surface). The State
// axis (completed / current / upcoming) maps each colored part to a token set.

export type State = "completed" | "current" | "upcoming";

// flex-1 (grow + shrink, zero basis) shared by connectors and the columns that
// fill the remaining row width.
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// --- circle (the numbered/check disc) ---------------------------------------

// h-8 w-8 shrink-0 flex-row items-center justify-center rounded-full border-2
export const circleBase: ViewStyle = {
  height: 32,
  width: 32,
  flexShrink: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
  borderWidth: 2,
};

// Completed fills primary; current is outlined in primary on a transparent fill;
// upcoming sits on the muted token behind a border-toned ring.
export function circleState(tokens: ColorTokens, state: State): ViewStyle {
  switch (state) {
    case "completed": return { borderColor: tokens.primary, backgroundColor: tokens.primary };
    case "current": return { borderColor: tokens.primary, backgroundColor: "transparent" };
    case "upcoming": return { borderColor: tokens.border, backgroundColor: tokens.muted };
  }
}

// --- glyph (the check / number inside the circle) ---------------------------

// text-sm font-medium
export const glyphBase: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };

export function glyphState(tokens: ColorTokens, state: State): TextStyle {
  switch (state) {
    case "completed": return { color: tokens["primary-foreground"] };
    case "current": return { color: tokens.primary };
    case "upcoming": return { color: tokens["muted-foreground"] };
  }
}

// --- step label -------------------------------------------------------------

// text-sm font-medium (vertical layout label).
export const labelBase: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };

// Upcoming steps drop to the muted foreground; completed/current stay foreground.
export function labelState(tokens: ColorTokens, state: State): TextStyle {
  switch (state) {
    case "completed": return { color: tokens.foreground };
    case "current": return { color: tokens.foreground };
    case "upcoming": return { color: tokens["muted-foreground"] };
  }
}

// text-xs font-medium (horizontal layout label), colored by labelState.
export const labelBaseXs: TextStyle = { fontSize: 12, lineHeight: 16, fontWeight: "500" };

// --- connector --------------------------------------------------------------

// A connector fills primary once the step it leads out of is completed, else it
// tracks the border token.
export function connectorBg(tokens: ColorTokens, done: boolean): ViewStyle {
  return { backgroundColor: done ? tokens.primary : tokens.border };
}

// --- progress layout --------------------------------------------------------

// w-full
export const fullWidth: ViewStyle = { width: "100%" };

// mb-1.5 flex-row items-center justify-between
export const progressHeader: ViewStyle = {
  marginBottom: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

// text-xs font-medium text-foreground (the caption left of the percentage).
export function progressCaption(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground };
}

// text-xs text-muted-foreground (the percentage).
export function progressPercent(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// h-1.5 overflow-hidden rounded-full bg-muted (the track).
export function progressTrack(tokens: ColorTokens): ViewStyle {
  return { height: 6, overflow: "hidden", borderRadius: 9999, backgroundColor: tokens.muted };
}

// h-full rounded-full bg-primary (the filled portion; width set inline as %).
export function progressFill(tokens: ColorTokens): ViewStyle {
  return { height: "100%", borderRadius: 9999, backgroundColor: tokens.primary };
}

// --- vertical layout --------------------------------------------------------

// flex-row gap-3 (the row pairing the rail with the content column).
export const verticalRow: ViewStyle = { flexDirection: "row", gap: 12 };

// items-center (the left rail: circle stacked over its connector).
export const verticalRail: ViewStyle = { alignItems: "center" };

// my-1 w-px flex-1 (the vertical connector) — color comes from connectorBg.
export const verticalConnector: ViewStyle = {
  marginVertical: 4,
  width: 1,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
};

// pb-6 (bottom inset on a content column that has a step after it).
export const verticalContentSpacing: ViewStyle = { paddingBottom: 24 };

// text-xs text-muted-foreground (the optional description line).
export function verticalDescription(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// --- horizontal layout ------------------------------------------------------

// flex-row items-start (the outer row and each step item).
export const horizontalRow: ViewStyle = { flexDirection: "row", alignItems: "flex-start" };

// items-center gap-1.5 (the circle + label column).
export const horizontalColumn: ViewStyle = { alignItems: "center", gap: 6 };

// mx-2 mt-4 h-px flex-1 (the horizontal connector) — color comes from connectorBg.
export const horizontalConnector: ViewStyle = {
  marginHorizontal: 8,
  marginTop: 16,
  height: 1,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
};
