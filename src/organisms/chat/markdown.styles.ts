import { type ColorTokens, type TextStyle, type ViewStyle } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
export interface MarkdownSkin {
  body: (tokens: ColorTokens, compact?: boolean) => TextStyle;
  heading: (tokens: ColorTokens, level: number, compact?: boolean) => TextStyle;
}
export const root: ViewStyle = { gap: 10, minWidth: 0, flexShrink: 1 };
export const list: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8, minWidth: 0 };
export const listText: TextStyle = { flex: 1, minWidth: 0 };
export const strong: TextStyle = { fontWeight: "700" };
export const emphasis: TextStyle = { fontStyle: "italic" };
export const code: TextStyle = { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 18 };
export const quote = (tokens: ColorTokens): ViewStyle => ({ borderStartWidth: 2, borderStartColor: tokens.border, paddingStart: 10 });
export const indent = (level = 0): ViewStyle => ({ paddingStart: Math.min(6, level) * 16 });
export const webSkin: MarkdownSkin = {
  body: (tokens, compact) => ({ fontSize: compact ? 12.5 : 14, lineHeight: compact ? 20 : 22, color: tokens.foreground }),
  heading: (tokens, level, compact) => ({ color: tokens.foreground, fontWeight: "700", fontSize: (compact ? [20, 17, 15, 14, 13, 12.5] : [24, 20, 17, 15, 14, 13])[level - 1], lineHeight: (compact ? [28, 25, 23, 22, 21, 20] : [32, 28, 25, 23, 22, 21])[level - 1] }),
};

// Document ink has no OS-specific shape; injected table and checklist parts retain theirs.
export const iosSkin = webSkin;
export const androidSkin = webSkin;
