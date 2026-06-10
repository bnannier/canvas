import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";

// Co-located AlertDialog styles. Layout-only fragments are static objects;
// anything that reads a color is a function of the active tokens (so the panel
// surface follows light/dark, and reads as glass when the ThemeProvider's
// surface is "glass", since tokens.popover is swapped translucent at the
// theming level). The width axis maps to an explicit max-width.

export type Width = "narrow" | "small" | "medium" | "large";

// The outer wrapper aligns the dialog (and its optional trigger) to the start.
export const root: ViewStyle = { alignSelf: "flex-start" };

// Gap between the trigger button and the modal when the trigger renders above it.
export const triggerGap: ViewStyle = { marginTop: 12 };

// The contained dim backdrop: a centered, rounded scrim with presence in the
// preview (the explicit minHeight is applied inline by the component) so the
// card reads as a modal within the preview area.
export const backdrop: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  backgroundColor: alpha("#000000", 0.5),
  padding: 32,
};

// The panel base: full-width within its max, bordered, padded, elevated.
export const panelBase: ViewStyle = {
  width: "100%",
  borderRadius: 8,
  borderWidth: 1,
  padding: 24,
  ...shadow("xl"),
};

// The panel surface fill + border. tokens.popover goes translucent under glass.
export function panelSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border, backgroundColor: tokens.popover };
}

// Panel max-width per width axis (mirroring Tailwind's max-w-xs..lg).
export const panelWidth: Record<Width, ViewStyle> = {
  narrow: { maxWidth: 320 },
  small: { maxWidth: 384 },
  medium: { maxWidth: 448 },
  large: { maxWidth: 512 },
};

export function title(tokens: ColorTokens): TextStyle {
  return { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens["popover-foreground"] };
}

export function description(tokens: ColorTokens): TextStyle {
  return { marginTop: 8, fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// The confirmation-field block ("Type DELETE to confirm" + input).
export const inputBlock: ViewStyle = { marginTop: 16 };

export function inputLabel(tokens: ColorTokens): TextStyle {
  return { marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// The right-aligned action row (cancel + confirm).
export const actions: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 24,
};
