import { type ColorTokens, type TextStyle, type ViewStyle } from "../../style/index.js";
import { DISPLAY_FONT, MONO_FONT, TERMINAL_FONT } from "../../style/mono.js";

// Document Markdown, drawn to the Canvas v4 hand-off's `K.md` (tools/v4/handoff/cv-kit-code3.js):
// 14 / 1.55 paragraphs in the foreground ink, blocks 10 apart (6 compact), 600 headings at a
// 1.3 leading (the first level in the display face at 20, 17 compact; then 17 / 15, then 14),
// list markers in the subtle ink 8 from their text, and inline code in the mono face at 0.9 of
// the body on the `secondary` wash. Document ink has no OS-specific shape; injected table
// and checklist parts keep theirs.

export interface MarkdownSkin {
  body: (tokens: ColorTokens, compact?: boolean) => TextStyle;
  heading: (tokens: ColorTokens, level: number, compact?: boolean) => TextStyle;
  /** Space above a block instead of the uniform root gap: `list` between consecutive list
   * items, `block` everywhere else. A conversation sets it (the Claude desktop reply: list
   * items on the line rhythm, paragraphs 12 apart); documents keep the uniform gap. */
  spacing?: { block: number; list: number };
}
export const root = (compact?: boolean): ViewStyle => ({ gap: compact ? 6 : 10, minWidth: 0, flexShrink: 1 });
export const spacedRoot: ViewStyle = { gap: 0 };
export const list: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8, minWidth: 0 };
export const listText: TextStyle = { flex: 1, minWidth: 0 };
export const marker = (tokens: ColorTokens): TextStyle => ({ color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] });
export const strong: TextStyle = { fontWeight: "600" };
export const emphasis: TextStyle = { fontStyle: "italic" };
export const code = (tokens: ColorTokens): TextStyle => ({ fontFamily: MONO_FONT, fontSize: 12.6, backgroundColor: tokens.secondary });
export const quote = (tokens: ColorTokens): ViewStyle => ({ borderStartWidth: 2, borderStartColor: tokens.border, paddingStart: 10 });
export const indent = (level = 0): ViewStyle => ({ paddingStart: Math.min(6, level) * 16 });

const HEADING: Record<"default" | "compact", readonly number[]> = { default: [20, 17, 14], compact: [17, 15, 14] };

export const webSkin: MarkdownSkin = {
  body: (tokens) => ({ fontSize: 14, lineHeight: 21.7, color: tokens.foreground }),
  heading: (tokens, level, compact) => {
    const size = HEADING[compact ? "compact" : "default"][Math.min(level, 3) - 1]!;
    return { color: tokens.foreground, fontWeight: "600", fontSize: size, lineHeight: Math.round(size * 1.3 * 10) / 10, ...(level === 1 ? { fontFamily: DISPLAY_FONT } : null) };
  },
};

// Document ink has no OS-specific shape; injected table and checklist parts retain theirs.
export const iosSkin = webSkin;
export const androidSkin = webSkin;

/** Transcript typography keeps semantic structure at one terminal reading size. */
export const terminalBody = (tokens: ColorTokens): TextStyle => ({ fontFamily: TERMINAL_FONT, fontSize: 13, lineHeight: 20, color: tokens.foreground });
export const terminalHeading: TextStyle = { fontWeight: "700" };
export const terminalCode: TextStyle = { fontFamily: TERMINAL_FONT, fontSize: 13, lineHeight: 20 };
export const terminalTable: ViewStyle = { minWidth: "100%", flexGrow: 1 };
export const terminalTableRow: ViewStyle = { flexDirection: "row" };
export const terminalTableCell = (width: number): ViewStyle => ({ width, paddingEnd: 16, paddingVertical: 2 });
export const terminalTableHeader = (tokens: ColorTokens): ViewStyle => ({ borderBottomWidth: 1, borderBottomColor: tokens.border });
