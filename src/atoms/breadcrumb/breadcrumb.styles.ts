import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";

// Co-located Breadcrumb styles. Layout-only fragments are static objects; the
// label/divider colors read the active tokens (so the trail follows light/dark
// and the glass surface). The press-dim for links is applied by the component's
// Pressable, matching the old `active:opacity-70`.

// The nav row: wrapping horizontal trail, centered, with a tight gap (gap-1.5).
export const nav: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
};

// A crumb cell (and the homeIcon cell): the icon/label sits next to its divider.
export const crumb: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
};

// A muted ancestor link (text-sm text-muted-foreground). Press feedback (the old
// `active:opacity-70`) is applied by the component's Pressable.
export function link(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// The current page: emphasized foreground text, not a link
// (text-sm font-medium text-foreground).
export function current(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// The divider glyph: quieter than the labels so it reads as a path divider
// (text-sm text-muted-foreground/60).
export function separator(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) };
}
