import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Select styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the trigger, the
// popover surface, and the option rows follow light/dark, and the popover reads
// as glass when the ThemeProvider's surface is "glass", since tokens.popover is
// swapped translucent at the theming level). The size axis (small/default/large)
// drives the trigger height and a shared type scale.

export type Size = "small" | "default" | "large";

// Trigger height per size; mirrors the Input control's footprint (h-8/h-9/h-10).
const TRIGGER_BOX: Record<Size, number> = {
  small: 32,
  default: 36,
  large: 40,
};

// Type scale per size, shared by the label, the trigger value, and the option
// rows (text-xs / text-sm / text-base).
const TEXT_SIZE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};

export function textType(size: Size): TextStyle {
  return TEXT_SIZE[size];
}

// --- outer ------------------------------------------------------------------

// The control owns the full width of its slot; the escape-hatch `style` (mainly
// width) is applied after this by the component.
export const root: ViewStyle = { width: "100%" };

// Stacked field label above the trigger.
export function labelText(tokens: ColorTokens, size: Size): TextStyle {
  return { marginBottom: 6, fontWeight: "500", color: tokens.foreground, ...TEXT_SIZE[size] };
}

// --- trigger ----------------------------------------------------------------

// The trigger row: value on the left, chevron on the right, bordered and padded,
// on the background fill. Height comes from the size axis.
export function trigger(tokens: ColorTokens, size: Size): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.input,
    backgroundColor: tokens.background,
    paddingHorizontal: 12,
    height: TRIGGER_BOX[size],
  };
}

// The leading cluster inside the trigger (optional icon + the value/placeholder).
export const triggerValue: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// The trigger value text: foreground when a value is selected, muted otherwise.
export function valueText(tokens: ColorTokens, size: Size, hasValue: boolean): TextStyle {
  return { color: hasValue ? tokens.foreground : tokens["muted-foreground"], ...TEXT_SIZE[size] };
}

// The trailing chevron glyph.
export function chevron(tokens: ColorTokens, size: Size): TextStyle {
  return { color: tokens["muted-foreground"], ...TEXT_SIZE[size] };
}

// --- popover ----------------------------------------------------------------

// The open option list: a bordered, padded popover surface lifted on shadow-lg,
// directly below the trigger.
export function panel(tokens: ColorTokens): ViewStyle {
  return {
    marginTop: 4,
    maxHeight: 240,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.popover,
    padding: 4,
    ...shadow("lg"),
  };
}

// An option row. Selected rows carry the accent fill; the old `active:bg-accent`
// press feedback is applied by the row's Pressable.
export function optionRow(tokens: ColorTokens, selected: boolean): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...(selected ? { backgroundColor: tokens.accent } : null),
  };
}

// The accent fill applied on press (the old `active:bg-accent`).
export function optionPressed(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// Option row text (the checkmark gutter and the label). On the popover foreground.
export function optionText(tokens: ColorTokens, size: Size): TextStyle {
  return { color: tokens["popover-foreground"], ...TEXT_SIZE[size] };
}
