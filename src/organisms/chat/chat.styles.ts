import { type ColorTokens, type ViewStyle, type TextStyle } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { destructiveText } from "../../style/destructive-text.js";

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
export const content: ViewStyle = { flexGrow: 1, padding: 20, gap: 24 };
export const messageRow: ViewStyle = { flexDirection: "row", minWidth: 0 };
export const userRow: ViewStyle = { justifyContent: "flex-end", paddingStart: 40 };
export const assistantRow: ViewStyle = { paddingEnd: 20 };
export const messageContent: ViewStyle = { flexShrink: 1, minWidth: 0, gap: 10 };
export const questionContent: ViewStyle = { flexGrow: 1 };
export const identity: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" };
export const attachments: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 8, minWidth: 0 };
export const attachment: ViewStyle = { flexShrink: 1, minWidth: 0, maxWidth: "100%", gap: 4 };
export const questionActions: ViewStyle = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 };
export const questionButtons: ViewStyle = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 };
export const questionMode: ViewStyle = { marginStart: "auto", maxWidth: "100%" };
export const questions: ViewStyle = { gap: 20, minWidth: 0 };
export const blocks: ViewStyle = { gap: 10, minWidth: 0 };
export const heading: TextStyle = { fontWeight: "700", fontSize: 13.5, lineHeight: 20 };
export const composer: ViewStyle = { flexShrink: 0, padding: 16, paddingTop: 8, gap: 10 };
// Conversation parts draw the web look on every platform, so they read the web row's own roles.
export const composerSurface = (tokens: ColorTokens, focused: boolean): ViewStyle => ({ borderRadius: platformShape.web.composer, borderWidth: 1, borderColor: focused ? tokens.ring : tokens.border, backgroundColor: tokens.card, overflow: "hidden" });
export const composerRow: ViewStyle = { flexDirection: "row", gap: 8, alignItems: "center", paddingHorizontal: 8, paddingBottom: 8 };
export const composerAttachments: ViewStyle = { paddingHorizontal: 12, paddingTop: 12 };
export const actionSpace: ViewStyle = { flexGrow: 1 };
export const editorHeight: TextStyle = { maxHeight: 160 };
export const footer: ViewStyle = { flexShrink: 0, minWidth: 0, gap: 8 };
export const pending: ViewStyle = { paddingVertical: 4 };
export const empty: ViewStyle = { justifyContent: "center", paddingVertical: 16 };
export const thinking: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 24, flexWrap: "wrap" };
export const thinkingLabel = (tokens: ColorTokens): TextStyle => ({ fontSize: 12.5, lineHeight: 20, color: tokens["muted-foreground"] });
export const dots: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };
// A circle: the pill, which the renderer clamps to half the dot's size.
export const dot = (tokens: ColorTokens): ViewStyle => ({ width: 4, height: 4, borderRadius: 9999, backgroundColor: tokens["muted-foreground"] });

export const webSkin: ChatSkin = {
  message: (tokens, user) => user ? {
    backgroundColor: tokens.muted, borderRadius: platformShape.web.bubble, borderTopEndRadius: platformShape.web.bubbleTail, paddingHorizontal: 16, paddingVertical: 12,
  } : {},
  body: (tokens) => ({ fontSize: 14, lineHeight: 22, color: tokens.foreground }),
  label: (tokens) => ({ fontSize: 11.5, lineHeight: 16, fontWeight: "700", color: tokens.foreground }),
  muted: (tokens, error) => ({ fontSize: 11, lineHeight: 16, color: error ? destructiveText(tokens) : tokens["muted-foreground"] }),
};
// Conversation content has no OS-specific control shape; injected controls keep theirs.
export const iosSkin = webSkin;
export const androidSkin = webSkin;
