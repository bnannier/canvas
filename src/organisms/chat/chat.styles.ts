import { type ColorTokens, type ViewStyle, type TextStyle } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { destructiveText } from "../../style/destructive-text.js";
import { TERMINAL_FONT } from "../../style/mono.js";
import { shape } from "../../style/tokens.js";

// The Chat skin, drawn to the Canvas v4 hand-off (`K.def('chat')` in
// tools/v4/handoff/cv-kit-data.js and its code-driven parts, cv-kit-code3.js `O('chat')`,
// `ChatThread`, `ChatMessage`, `ChatComposer` and `K.md`). Neither iOS nor Android ships a
// conversation control (PLATFORM-REFERENCES.md), so every platform draws this look, in its
// own face; injected controls (Button, Textarea, Chip) keep their platform shapes.
//
//   Frame: the `card` fill at the card corner on a `border` hairline, clipped. The
//     conversation reads like a desktop assistant: one centered column at most 768 wide,
//     24 in, turns 28 apart; a message's parts stack 6 apart.
//   Assistant: unframed 14 / 1.55 text across the column; its author is the 500 11 caption
//     in the subtle ink.
//   User: no author line; the neutral `muted` fill at the bubble corner, 10 by 16 in, 80% of
//     the column at most.
//   Pending: three 5 px subtle dots 3 apart, then the 13 px label in the muted ink.
//   Composer: no divider; one raised box in the same column, the `surface-raised` fill at
//     the composer corner on a `border` edge (the ring when focused) with a soft shadow,
//     8 in: a round add button, the draft, and the 32 px round send button on one row.
export interface ChatSkin {
  message: (tokens: ColorTokens, user: boolean) => ViewStyle;
  body: (tokens: ColorTokens) => TextStyle;
  label: (tokens: ColorTokens) => TextStyle;
  muted: (tokens: ColorTokens, error?: boolean) => TextStyle;
}

// An auto basis honors an explicit composition height in an otherwise unbounded
// docs stage; a percentage zero basis resolves to content there and discards it.
export const root: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minHeight: 0, overflow: "hidden" };
export const thread: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minHeight: 0 };
/** The centered reading column shared by the thread and the composer. */
const column: ViewStyle = { width: "100%", maxWidth: 768, alignSelf: "center" };
export const content: ViewStyle = { ...column, flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24, gap: 28 };
/** Below this width (a phone, a side panel, a wizard body) the thread and the composer
 * trade their 24 px gutters for `narrowGutter`, so the composer's text keeps its room. */
export const NARROW_WIDTH = 480;
export const narrowGutter: ViewStyle = { paddingHorizontal: 12 };
/** The conversation's frame: Chat, and a standalone ChatThread or ChatComposer. */
export const frame = (tokens: ColorTokens): ViewStyle => ({ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: shape.web.card, overflow: "hidden" });
export const messageRow: ViewStyle = { flexDirection: "row", minWidth: 0 };
export const userRow: ViewStyle = { justifyContent: "flex-end", paddingStart: "20%" };
export const assistantRow: ViewStyle = {};
export const messageContent: ViewStyle = { flexShrink: 1, minWidth: 0, gap: 6 };
export const userContent: ViewStyle = { alignItems: "flex-end" };
export const questionContent: ViewStyle = { flexGrow: 1 };
export const identity: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" };
export const attachments: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 8, minWidth: 0 };
export const attachment: ViewStyle = { flexShrink: 1, minWidth: 0, maxWidth: "100%", gap: 4 };
export const questionActions: ViewStyle = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 };
export const questionButtons: ViewStyle = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 };
export const questionMode: ViewStyle = { marginStart: "auto", maxWidth: "100%" };
export const questions: ViewStyle = { gap: 20, minWidth: 0 };
export const blocks: ViewStyle = { gap: 28, minWidth: 0 };
export const composer = (_tokens: ColorTokens): ViewStyle => ({ ...column, flexShrink: 0, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 16, gap: 8 });
// Conversation parts draw the web look on every platform, so they read the web row's own roles.
export const composerSurface = (tokens: ColorTokens, focused: boolean): ViewStyle => ({
  borderRadius: platformShape.web.composer, borderWidth: 1, borderColor: focused ? tokens.ring : tokens.border, backgroundColor: tokens["surface-raised"] ?? tokens.card,
  padding: 8, gap: 8, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 2 },
});
export const composerRow: ViewStyle = { flexDirection: "row", gap: 8, alignItems: "flex-end" };
export const composerAttachments: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 6 };
export const editor: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0 };
export const editorHeight: TextStyle = { maxHeight: 160 };
export const footer: ViewStyle = { flexShrink: 0, minWidth: 0, gap: 8 };
export const pending: ViewStyle = { paddingVertical: 4 };
/** A folded activity line in the subtle ink; expanded details sit behind a start hairline. */
export const activity: ViewStyle = { alignItems: "flex-start", gap: 4, minWidth: 0, marginVertical: -12 };
export const activityLabel = (tokens: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 18, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] });
export const activityBody = (tokens: ColorTokens): ViewStyle => ({ borderStartWidth: 2, borderStartColor: tokens.border, paddingStart: 12, marginStart: 8, minWidth: 0, alignSelf: "stretch" });
export const empty: ViewStyle = { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 16 };
export const thinking: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 24, flexWrap: "wrap" };
export const thinkingLabel = (tokens: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 18, color: tokens["muted-foreground"] });
export const dots: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 3 };
// A circle: the pill, which the renderer clamps to half the dot's size.
export const dot = (tokens: ColorTokens): ViewStyle => ({ width: 5, height: 5, borderRadius: 9999, backgroundColor: tokens["subtle-foreground"] ?? tokens["muted-foreground"] });

export const webSkin: ChatSkin = {
  message: (tokens, user) => user ? {
    backgroundColor: tokens.muted, borderRadius: platformShape.web.bubble, paddingHorizontal: 16, paddingVertical: 10,
  } : {},
  body: (tokens) => ({ fontSize: 14, lineHeight: 21.7, color: tokens.foreground }),
  label: (tokens) => ({ fontSize: 11, lineHeight: 14, fontWeight: "500", color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
  muted: (tokens, error) => ({ fontSize: 11, lineHeight: 14, color: error ? destructiveText(tokens) : tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
};
// Conversation content has no OS-specific control shape; injected controls keep theirs.
export const iosSkin = webSkin;
export const androidSkin = webSkin;

/** Flat terminal transcript; the owning layout supplies its surface and bounds. */
export const terminalContent: ViewStyle = { flexGrow: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 10 };
export const terminalMessage: ViewStyle = { flexGrow: 1, minWidth: 0, gap: 4 };
export const terminalBlocks: ViewStyle = { gap: 12, minWidth: 0 };
export const terminalFace: TextStyle = { fontFamily: TERMINAL_FONT };
export const terminalBody = (tokens: ColorTokens): TextStyle => ({ fontFamily: TERMINAL_FONT, fontSize: 13, lineHeight: 20, color: tokens.foreground });
export const terminalLabel = (tokens: ColorTokens): TextStyle => ({ ...terminalBody(tokens), fontWeight: "600" });
export const terminalMuted = (tokens: ColorTokens, error?: boolean): TextStyle => ({ ...terminalBody(tokens), color: error ? destructiveText(tokens) : tokens["muted-foreground"] });
export const terminalComposer = (tokens: ColorTokens, focused: boolean): ViewStyle => ({ flexShrink: 0, gap: 8, borderTopWidth: 1, borderTopColor: focused ? tokens.ring : tokens.border });
export const terminalComposerSurface = (tokens: ColorTokens, focused: boolean): ViewStyle => ({ gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: focused ? tokens.ring : tokens.border });
export const terminalFooter: ViewStyle = { paddingHorizontal: 12, paddingBottom: 10 };
export const terminalComposerRow: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8 };
export const terminalPrompt = (tokens: ColorTokens, disabled?: boolean): TextStyle => ({ ...terminalBody(tokens), color: disabled ? tokens["muted-foreground"] : tokens.foreground, fontWeight: "600" });
