import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette } from "../../style/index.js";

// Co-located ActionPanel styles. Layout-only fragments are static objects; the
// title color is a function of the active tokens (neutral) or the dark scheme
// (the destructive danger-zone red, which rides the Tailwind palette so it stays
// fixed per scheme rather than following the semantic tokens).

export type Tone = "destructive" | "neutral";
export type Layout = "inline" | "stacked";

// The card surface caps its width; passed to the Card child via its `style` prop.
export const cardWidth: ViewStyle = { maxWidth: 560 };

// The copy block: title stacked above its consequence line. In the inline layout
// it grows to push the action to the right (flex-1); stacked, it stays natural.
export const copyBlock: ViewStyle = { gap: 4 };
export const copyGrow: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The action wrapper: pinned (shrink-0) in the inline/toggle layouts, or
// left-aligned (items-start) on its own line in the stacked layout.
export const actionPinned: ViewStyle = { flexShrink: 0 };
export const actionStacked: ViewStyle = { alignItems: "flex-start" };

// The two body layouts: a side-by-side row (inline/toggle) or a vertical stack.
export const inlineBody: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 24 };
export const stackedBody: ViewStyle = { gap: 16 };

// Title and description share Canvas's settings-row type scale (text-sm).
export function titleText(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  // Danger-zone red rides the palette (fixed per scheme); neutral follows the
  // semantic card foreground so it tracks light/dark/glass.
  const color = tone === "destructive" ? (dark ? palette["red-400"] : palette["red-700"]) : tokens["card-foreground"];
  return { fontSize: 14, lineHeight: 20, fontWeight: "600", color };
}

export function descriptionText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}
