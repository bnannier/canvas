import { type ColorTokens, type ViewStyle, type TextStyle } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { destructiveText } from "../../style/destructive-text.js";
import { shape } from "../../style/tokens.js";

// The Chat skin, drawn to the Canvas v4 hand-off (`K.def('chat')` in
// tools/v4/handoff/cv-kit-data.js and its code-driven parts, cv-kit-code3.js `O('chat')`,
// `ChatThread`, `ChatMessage`, `ChatComposer` and `K.md`). Neither iOS nor Android ships a
// conversation control (PLATFORM-REFERENCES.md), so every platform draws this look, in its
// own face; injected controls (Button, Textarea, Chip) keep their platform shapes.
//
//   Frame: the `card` fill at the card corner on a `border` hairline, clipped. The thread is
//     16 in with its messages 14 apart; a message's parts stack 6 apart.
//   Assistant: unframed 14 / 1.55 text; its author is the 500 11 caption in the subtle ink.
//   User: the accent's soft wash at the bubble corner, its trailing bottom corner tucked to
//     the tail, 9 by 13 in, 86% of the thread at most.
//   Pending: three 5 px subtle dots 3 apart, then the 13 px label in the muted ink.
//   Composer: 10 in under a `border` hairline, the sunken well at the composer corner on a
//     `field-border` edge, 6 in (12 at the start), the draft and the 32 px round send
//     button on one row.
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
export const content: ViewStyle = { flexGrow: 1, padding: 16, gap: 14 };
/** The conversation's frame: Chat, and a standalone ChatThread or ChatComposer. */
export const frame = (tokens: ColorTokens): ViewStyle => ({ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: shape.web.card, overflow: "hidden" });
export const messageRow: ViewStyle = { flexDirection: "row", minWidth: 0 };
export const userRow: ViewStyle = { justifyContent: "flex-end", paddingStart: "14%" };
export const assistantRow: ViewStyle = { paddingEnd: "14%" };
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
export const blocks: ViewStyle = { gap: 14, minWidth: 0 };
export const composer = (tokens: ColorTokens): ViewStyle => ({ flexShrink: 0, padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: tokens.border });
// Conversation parts draw the web look on every platform, so they read the web row's own roles.
export const composerSurface = (tokens: ColorTokens, focused: boolean): ViewStyle => ({ borderRadius: platformShape.web.composer, borderWidth: 1, borderColor: focused ? tokens.ring : tokens["field-border"], backgroundColor: tokens["surface-sunken"], padding: 6, paddingStart: 12, gap: 8, overflow: "hidden" });
export const composerRow: ViewStyle = { flexDirection: "row", gap: 8, alignItems: "flex-end" };
export const composerAttachments: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 6 };
export const editor: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0 };
export const editorHeight: TextStyle = { maxHeight: 160 };
export const footer: ViewStyle = { flexShrink: 0, minWidth: 0, gap: 8 };
export const pending: ViewStyle = { paddingVertical: 4 };
export const empty: ViewStyle = { justifyContent: "center", paddingVertical: 16 };
export const thinking: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 24, flexWrap: "wrap" };
export const thinkingLabel = (tokens: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 18, color: tokens["muted-foreground"] });
export const dots: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 3 };
// A circle: the pill, which the renderer clamps to half the dot's size.
export const dot = (tokens: ColorTokens): ViewStyle => ({ width: 5, height: 5, borderRadius: 9999, backgroundColor: tokens["subtle-foreground"] ?? tokens["muted-foreground"] });

export const webSkin: ChatSkin = {
  message: (tokens, user) => user ? {
    backgroundColor: tokens["primary-soft"], borderRadius: platformShape.web.bubble, borderBottomEndRadius: platformShape.web.bubbleTail, paddingHorizontal: 13, paddingVertical: 9,
  } : {},
  body: (tokens) => ({ fontSize: 14, lineHeight: 21.7, color: tokens.foreground }),
  label: (tokens) => ({ fontSize: 11, lineHeight: 14, fontWeight: "500", color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
  muted: (tokens, error) => ({ fontSize: 11, lineHeight: 14, color: error ? destructiveText(tokens) : tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
};
// Conversation content has no OS-specific control shape; injected controls keep theirs.
export const iosSkin = webSkin;
export const androidSkin = webSkin;
