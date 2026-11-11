import { type ColorTokens, type ViewStyle, type TextStyle } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { destructiveText } from "../../style/destructive-text.js";
import { TERMINAL_FONT } from "../../style/mono.js";
import { shape, widths } from "../../style/tokens.js";

// The Chat skin, drawn to the Canvas v4 hand-off (`K.def('chat')` in
// tools/v4/handoff/cv-kit-data.js and its code-driven parts, cv-kit-code3.js `O('chat')`,
// `ChatThread`, `ChatMessage`, `ChatComposer` and `K.md`). Neither iOS nor Android ships a
// conversation control (PLATFORM-REFERENCES.md), so every platform draws this look, in its
// own face; injected controls (Button, Textarea, Chip) keep their platform shapes.
//
//   Frame: the `card` fill at the card corner on a `border` hairline, clipped; `flush`
//     drops it so the conversation sits on its host's fill. The thread is 16 in with its
//     messages 14 apart; a message's parts stack 6 apart.
//   Assistant: unframed 14 / 1.55 text; an author line only when the app names an author
//     or a provider, the 500 11 caption in the subtle ink.
//   User: the accent's soft wash at the bubble corner, its trailing bottom corner tucked to
//     the tail, 9 by 13 in, 86% of the thread at most.
//   Pending: three 5 px subtle dots 3 apart, then the 13 px label in the muted ink.
//   Composer: 10 in under a `border` hairline, the sunken well at the composer corner on a
//     `field-border` edge, 6 in (12 at the start), the draft and the 32 px round send
//     button on one row.
//
// `assistant` lays the conversation out like the Claude desktop window instead (reference
// card claude-desktop-chat in tools/native/liquid-motion.md), with corner roles of its own:
//   Column: one centered column whose composer box is 768 wide at most, assistant text 20
//     and the user bubble 16 in from its edges, turns that change speaker 40 apart and the
//     blocks of one turn 20 apart; narrower than 480, the gutters are 12.
//   Assistant: unframed 15 / 21 text, list items on the line rhythm and paragraphs 12 apart.
//   User: the neutral `muted` fill at the assistant bubble corner, 12 by 16 in, 80% of the
//     column at most.
//   Composer: no divider; one 44 px box in the column, the `surface-raised` fill at the
//     assistant composer corner on a `border` edge (the ring when focused) with a soft
//     shadow: a bare add icon, the draft, and the send control, quiet until there is
//     something to send. Under it, `meta` names the model in a right-aligned muted line.
export interface ChatSkin {
  message: (tokens: ColorTokens, user: boolean) => ViewStyle;
  body: (tokens: ColorTokens) => TextStyle;
  label: (tokens: ColorTokens) => TextStyle;
  muted: (tokens: ColorTokens, error?: boolean) => TextStyle;
  /** `assistant`: the user bubble (an assistant reply stays unframed). */
  assistantMessage: (tokens: ColorTokens) => ViewStyle;
  /** `assistant`: a turn's body text, and its replies' Markdown body. */
  assistantBody: (tokens: ColorTokens) => TextStyle;
}

// An auto basis honors an explicit composition height in an otherwise unbounded
// docs stage; a percentage zero basis resolves to content there and discards it.
export const root: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minHeight: 0, overflow: "hidden" };
export const thread: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minHeight: 0 };
export const content: ViewStyle = { flexGrow: 1, padding: 16, gap: 14 };
/** The conversation's frame: Chat, and a standalone ChatThread or ChatComposer. */
export const frame = (tokens: ColorTokens): ViewStyle => ({ backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border, borderRadius: shape.web.card, overflow: "hidden" });
/** `flush`: no frame, the host's fill shows through. */
export const flush: ViewStyle = { backgroundColor: "transparent", borderWidth: 0, borderRadius: 0 };
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
/** A folded activity line in the muted ink (a plain text action, no box); expanded details sit behind a start hairline. */
export const activity: ViewStyle = { alignItems: "flex-start", gap: 4, minWidth: 0 };
export const activityLabel = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 21, color: tokens["muted-foreground"] });
export const activityNested: ViewStyle = { alignItems: "flex-start", gap: 4, minWidth: 0 };
export const activityGroupBody: ViewStyle = { gap: 4 };
export const activityBody = (tokens: ColorTokens): ViewStyle => ({ borderStartWidth: 2, borderStartColor: tokens.border, paddingStart: 12, marginStart: 8, minWidth: 0, alignSelf: "stretch" });
// The hand-off's empty thread: `flex:1; display:grid; place-items:center`.
export const empty: ViewStyle = { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 16 };
export const thinking: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 24, flexWrap: "wrap" };
export const thinkingLabel = (tokens: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 18, color: tokens["muted-foreground"] });
export const dots: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 3 };
// A circle: the pill, which the renderer clamps to half the dot's size.
export const dot = (tokens: ColorTokens): ViewStyle => ({ width: 5, height: 5, borderRadius: 9999, backgroundColor: tokens["subtle-foreground"] ?? tokens["muted-foreground"] });

// `assistant`: the Claude desktop window's conversation (reference claude-desktop-chat).
/** The composer box's widest: the width scale's 768 step. */
export const ASSISTANT_COMPOSER_MAX = widths.xxxl;
/** The gutters either side of the composer, and the column they make (the composer box plus both gutters). */
export const ASSISTANT_GUTTER = 24;
export const ASSISTANT_COLUMN_MAX = ASSISTANT_COMPOSER_MAX + ASSISTANT_GUTTER * 2;
/** The messages' inset from the composer's edge: the user bubble ends 16 in. */
export const MESSAGE_INSET = 16;
/** Assistant text starts 20 in from the composer's edge, 4 more than the bubble's inset. */
export const ASSISTANT_INSET = 4;
/** Space above a message: a turn that changes speaker, or the next block of the same turn. */
export const TURN_GAP = 40;
export const BLOCK_GAP = 20;
/** A reply's Markdown: list items on the line rhythm, paragraphs 12 apart. */
export const REPLY_SPACING = { block: 12, list: 0 } as const;
/** Below this width (a phone, a side panel, a wizard body) the thread and the composer trade
 * their gutters for `assistantNarrowGutter`, so the composer's text keeps its room. */
export const NARROW_WIDTH = 480;
const ASSISTANT_NARROW_GUTTER = 12;
/** The centered reading column shared by the thread and the composer. */
const assistantColumn: ViewStyle = { width: "100%", maxWidth: ASSISTANT_COLUMN_MAX, alignSelf: "center" };
export const assistantContent: ViewStyle = { ...assistantColumn, flexGrow: 1, paddingHorizontal: ASSISTANT_GUTTER + MESSAGE_INSET, paddingVertical: 24 };
export const assistantNarrowGutter: ViewStyle = { paddingHorizontal: ASSISTANT_NARROW_GUTTER };
/** The messages keep their inset from the composer on a narrow column too. */
export const assistantNarrowContentGutter: ViewStyle = { paddingHorizontal: ASSISTANT_NARROW_GUTTER + ASSISTANT_INSET };
export const assistantUserRow: ViewStyle = { justifyContent: "flex-end", paddingStart: "20%" };
export const assistantAssistantRow: ViewStyle = { paddingStart: ASSISTANT_INSET };
/** The turns carry their own space above them (TURN_GAP, BLOCK_GAP). */
export const assistantBlocks: ViewStyle = { minWidth: 0 };
/** A question form's own stack. */
export const questionStack: ViewStyle = { gap: 14, minWidth: 0 };
export const assistantQuestionStack: ViewStyle = { gap: 28, minWidth: 0 };
export const assistantActivity: ViewStyle = { ...activity, paddingStart: ASSISTANT_INSET };
export const assistantComposer: ViewStyle = { ...assistantColumn, flexShrink: 0, paddingHorizontal: ASSISTANT_GUTTER, paddingTop: 4, paddingBottom: 16, gap: 8 };
// The reference's composer box: the assistant composer corner (12), measured on the Claude desktop window.
export const assistantComposerSurface = (tokens: ColorTokens, focused: boolean): ViewStyle => ({
  borderRadius: platformShape.web.assistantComposer, borderWidth: 1, borderColor: focused ? tokens.ring : tokens.border, backgroundColor: tokens["surface-raised"] ?? tokens.card,
  paddingVertical: 5, paddingHorizontal: 6, gap: 8, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 2 },
});
export const assistantComposerRow: ViewStyle = { flexDirection: "row", gap: 4, alignItems: "flex-end" };
/** The model line under the composer, at its end. */
export const meta = (tokens: ColorTokens): TextStyle => ({ alignSelf: "flex-end", fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"], paddingHorizontal: 4 });

export const webSkin: ChatSkin = {
  message: (tokens, user) => user ? {
    backgroundColor: tokens["primary-soft"], borderRadius: platformShape.web.bubble, borderBottomEndRadius: platformShape.web.bubbleTail, paddingHorizontal: 13, paddingVertical: 9,
  } : {},
  body: (tokens) => ({ fontSize: 14, lineHeight: 21.7, color: tokens.foreground }),
  label: (tokens) => ({ fontSize: 11, lineHeight: 14, fontWeight: "500", color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
  muted: (tokens, error) => ({ fontSize: 11, lineHeight: 14, color: error ? destructiveText(tokens) : tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
  // The reference's user bubble: the assistant bubble corner (10), measured on the Claude desktop window.
  assistantMessage: (tokens) => ({ backgroundColor: tokens.muted, borderRadius: platformShape.web.assistantBubble, paddingHorizontal: 16, paddingVertical: 12 }),
  assistantBody: (tokens) => ({ fontSize: 15, lineHeight: 21, color: tokens.foreground }),
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
