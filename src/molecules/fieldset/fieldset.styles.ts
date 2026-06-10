import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Fieldset styles. Layout-only parts are static objects; anything that
// reads a color is a function of the active tokens (so the bordered surface
// follows light/dark and reads as glass when the ThemeProvider's surface is
// "glass", since tokens.card is swapped translucent at the theming level). The
// responsive collapse (two-column -> single column at the `sm` breakpoint) is
// driven by useResponsive in the component.

export type Surface = "bordered" | "plain";

// Outer container: full width, capped at 576px. (w-full max-w-[576px])
export const containerBase: ViewStyle = { width: "100%", maxWidth: 576 };

// Surface fill/border per axis. Bordered is a card-like section with border,
// radius, and padding (rounded-lg border border-border bg-card p-5); plain has
// no chrome.
export function surface(tokens: ColorTokens, s: Surface): ViewStyle {
  if (s === "bordered") {
    return {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.card,
      padding: 20,
    };
  }
  return {};
}

// The disabled dim applied to the whole group. (opacity-60)
export const disabledDim: ViewStyle = { opacity: 0.6 };

// --- header -----------------------------------------------------------------

// Header block above the controls. (mb-4)
export const header: ViewStyle = { marginBottom: 16 };

// Legend heading. (text-base font-semibold text-foreground)
export function legend(tokens: ColorTokens): TextStyle {
  return { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground };
}

// Muted supporting line under the legend. (mt-1 text-xs text-muted-foreground)
export function description(tokens: ColorTokens): TextStyle {
  return { marginTop: 4, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// --- field rows -------------------------------------------------------------

// A field's persistent label above its control. (mb-1.5 text-sm font-medium text-foreground)
export function fieldLabel(tokens: ColorTokens): TextStyle {
  return { marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// Muted help line beneath the control. (mt-1.5 text-xs text-muted-foreground)
export function fieldHelp(tokens: ColorTokens): TextStyle {
  return { marginTop: 6, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// Inline error beneath the control. (mt-1.5 text-xs text-destructive)
export function fieldError(tokens: ColorTokens): TextStyle {
  return { marginTop: 6, fontSize: 12, lineHeight: 16, color: tokens.destructive };
}

// A single field's wrapper. (w-full)
export const fieldWrap: ViewStyle = { width: "100%" };

// --- groups -----------------------------------------------------------------

// The checkbox group stack. (gap-2)
export const checkboxGroup: ViewStyle = { gap: 8 };

// The single-column field group. (flex-col gap-4)
export const groupColumn: ViewStyle = { flexDirection: "column", gap: 16 };

// `grow` on a two-column item. (grow)
export const itemGrow: ViewStyle = { flexGrow: 1 };
