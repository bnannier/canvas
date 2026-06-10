import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";

// Co-located Dialog styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the panel surface
// follows light/dark, and reads as glass when the ThemeProvider's surface is
// "glass", since tokens.popover is swapped translucent at the theming level).

export type Size = "xs" | "small" | "medium" | "default" | "large" | "wide";

// The dialog card's max width per size, narrowest to widest. The default sits
// one step wider than `medium`, roomy enough for a short form; `xs`/`small`
// tighten the panel for a terse message, `large`/`wide` open it up for a longer
// form. Pixel widths mirror Tailwind's max-w-xs..2xl scale.
export const PANEL_MAX_WIDTH: Record<Size, number> = {
  xs: 320,
  small: 384,
  medium: 448,
  default: 512,
  large: 576,
  wide: 672,
};

// --- outer shell ------------------------------------------------------------

// The outermost wrapper shrinks to its content so the inline trigger sits flush.
export const root: ViewStyle = { alignSelf: "flex-start" };

// Inset between the trigger button and the backdrop when a trigger is rendered.
export const backdropTriggerGap: ViewStyle = { marginTop: 12 };

// The contained dim backdrop: a centered, rounded scrim with presence in the
// preview (explicit minHeight) so the panel reads as a modal within the area.
// bg-black/50 -> a 50% black scrim.
export const backdrop: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  backgroundColor: alpha("#000000", 0.5),
  padding: 32,
  minHeight: 220,
};

// --- panel ------------------------------------------------------------------

// The panel layout box: full width up to its per-size cap, rounded, bordered,
// lifted with the xl shadow. Color comes from panelSurface below.
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

// Per-size max width cap.
export function panelWidth(size: Size): ViewStyle {
  return { maxWidth: PANEL_MAX_WIDTH[size] };
}

// --- content ----------------------------------------------------------------

export function title(tokens: ColorTokens): TextStyle {
  return { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens["popover-foreground"] };
}

export function description(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"], marginTop: 8 };
}

// --- body (the data-driven Amount + Reason form) ----------------------------

export const body: ViewStyle = { marginTop: 20 };

// Field label above the Amount input.
export function amountLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6 };
}

// The Amount row: currency glyph beside the input.
export const amountRow: ViewStyle = { flexDirection: "row", alignItems: "center" };

// The leading currency glyph.
export function currency(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"], marginRight: 8 };
}

// The Amount input grows to fill the row (flex-1).
export const amountInput: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// Field label above the Reason input (extra top inset from the Amount field).
export function reasonLabel(tokens: ColorTokens): TextStyle {
  return {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: tokens.foreground,
    marginBottom: 6,
    marginTop: 16,
  };
}

// --- actions ----------------------------------------------------------------

// The right-aligned confirm/cancel row.
export const actions: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 24,
};
