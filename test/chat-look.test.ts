import { afterEach, describe, expect, it } from "bun:test";
import { createElement, type ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { lightColors as t } from "../src/style/tokens.ts";
import { DISPLAY_FONT, MONO_FONT } from "../src/style/mono.ts";
import { ThemeProvider } from "../src/style/theme.tsx";
import * as chat from "../src/organisms/chat/chat.styles.ts";
import * as md from "../src/organisms/chat/markdown.styles.ts";
import { ChatMessage, ChatThread, type ChatMessageData } from "../src/organisms/chat/chat.tsx";
import { composerMinHeight } from "../src/atoms/textarea/textarea.styles.ts";

afterEach(cleanup);

const inLight = (node: ReactElement) => render(createElement(ThemeProvider, { light: true, solid: true }, node));
/** A user turn that names its author, as an app with several people in one conversation passes it. */
const namedUserTurn: ChatMessageData = { id: "ask", role: "user", author: "Ada", content: "Help me plan the release." };
const namedReply: ChatMessageData = { id: "plan", role: "assistant", author: "Planner", content: "Start with scope." };
const ranTests: ChatMessageData = { id: "ran", role: "system", activity: true, author: "Ran bun test", content: "42 passed" };
const readNotes: ChatMessageData = { id: "read", role: "system", activity: true, author: "Read the release notes", content: "CHANGELOG.md" };
/** The rendered size of an activity line's summary text. */
const summaryLook = (text: string) => {
  const style = getComputedStyle(screen.getByText(text));
  return { fontSize: style.fontSize, lineHeight: style.lineHeight };
};

// The v4 hand-off's Chat renderer (cv-kit-data.js K.def('chat'), cv-kit-code3.js O('chat'), its parts and K.md).
describe("the v4 chat", () => {
  it("frames the conversation as a card and spaces the thread 16 in, 14 apart", () => {
    expect(chat.frame(t)).toMatchObject({ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, overflow: "hidden" });
    expect(chat.content).toMatchObject({ padding: 16, gap: 14 });
    expect(chat.blocks.gap).toBe(14);
    expect(chat.messageContent.gap).toBe(6);
  });

  it("draws the user bubble in the accent's soft wash, its bottom end tucked to 4", () => {
    expect(chat.webSkin.message(t, true)).toMatchObject({ backgroundColor: t["primary-soft"], borderRadius: 16, borderBottomEndRadius: 4, paddingHorizontal: 13, paddingVertical: 9 });
    expect(chat.webSkin.message(t, false)).toEqual({});
    expect(chat.webSkin.body(t)).toMatchObject({ fontSize: 14, lineHeight: 21.7 });
    expect(chat.webSkin.label(t)).toMatchObject({ fontSize: 11, fontWeight: "500", color: t["subtle-foreground"] });
  });

  it("puts the composer's sunken well under a hairline, the draft and send on one row", () => {
    expect(chat.composer(t)).toMatchObject({ padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: t.border });
    expect(chat.composerSurface(t, false)).toMatchObject({ borderRadius: 16, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t["surface-sunken"], padding: 6, paddingStart: 12 });
    expect(chat.composerSurface(t, true).borderColor).toBe(t.ring);
    expect(chat.composerRow).toMatchObject({ flexDirection: "row", alignItems: "flex-end", gap: 8 });
  });

  it("shows pending as three 5px subtle dots 3 apart before a 13px muted label", () => {
    expect(chat.dot(t)).toMatchObject({ width: 5, height: 5, backgroundColor: t["subtle-foreground"] });
    expect(chat.dots.gap).toBe(3);
    expect(chat.thinkingLabel(t)).toMatchObject({ fontSize: 13, color: t["muted-foreground"] });
  });

  // msgH: `${!me&&(m.author||m.provider)?<the 500 11 author line>:''}`.
  it("draws an author line on a named reply but never on the person's own turn", () => {
    inLight(createElement(ChatMessage, { message: namedUserTurn }));
    expect(screen.queryByText("Ada")).toBeNull();
    cleanup();
    inLight(createElement(ChatMessage, { message: namedReply }));
    expect(screen.getByText("Planner")).toBeTruthy();
  });

  // The hand-off draws no activity line, so the default keeps the line 0d5af5fc introduced
  // (13 / 18 in the subtle ink), before e7a942aa set the desktop's 14 / 21 muted one on it.
  it("sets a folded activity line at 13 / 18 in the subtle ink", () => {
    expect(chat.activityLabel(t)).toEqual({ fontSize: 13, lineHeight: 18, color: t["subtle-foreground"] });
    inLight(createElement(ChatMessage, { message: ranTests }));
    expect(summaryLook("Ran bun test")).toEqual({ fontSize: "13px", lineHeight: "18px" });
    cleanup();
    inLight(createElement(ChatThread, { messages: [readNotes, ranTests] }));
    expect(summaryLook("Read the release notes, Ran bun test")).toEqual({ fontSize: "13px", lineHeight: "18px" });
  });

  it("sets document Markdown at 14 / 1.55 with 600 headings and mono inline code", () => {
    expect(md.webSkin.body(t)).toMatchObject({ fontSize: 14, lineHeight: 21.7 });
    expect(md.webSkin.heading(t, 1, false)).toMatchObject({ fontSize: 20, fontWeight: "600", fontFamily: DISPLAY_FONT });
    expect(md.webSkin.heading(t, 1, true).fontSize).toBe(17);
    expect(md.webSkin.heading(t, 2, true)).toMatchObject({ fontSize: 15, lineHeight: 19.5 });
    expect(md.webSkin.heading(t, 4, false).fontSize).toBe(14);
    expect(md.code(t)).toMatchObject({ fontFamily: MONO_FONT, backgroundColor: t.secondary });
    expect(md.root(true).gap).toBe(6);
    expect(md.root(false).gap).toBe(10);
  });
});

// Chat's `assistant` layout, drawn to the claude-desktop-chat reference card
// (tools/native/liquid-motion.md): the Claude desktop window's conversation.
describe("the assistant chat", () => {
  it("centers one column whose composer box is 768 at most, with the messages inset 16 and the replies 20", () => {
    expect(chat.ASSISTANT_COMPOSER_MAX).toBe(768);
    expect(chat.ASSISTANT_COLUMN_MAX).toBe(768 + 24 * 2);
    expect(chat.assistantContent).toEqual({ width: "100%", maxWidth: 816, alignSelf: "center", flexGrow: 1, paddingHorizontal: 24 + 16, paddingVertical: 24 });
    expect(chat.assistantAssistantRow).toEqual({ paddingStart: 4 });
    expect(chat.assistantUserRow).toMatchObject({ justifyContent: "flex-end", paddingStart: "20%" });
    expect(chat.assistantActivity).toMatchObject({ paddingStart: 4 });
    // Narrower than 480 (a phone, a side panel), the gutters are 12 and the messages keep their inset.
    expect(chat.NARROW_WIDTH).toBe(480);
    expect(chat.assistantNarrowGutter).toEqual({ paddingHorizontal: 12 });
    expect(chat.assistantNarrowContentGutter).toEqual({ paddingHorizontal: 12 + 4 });
  });

  it("sets turns that change speaker 40 apart and the blocks of one turn 20", () => {
    expect(chat.TURN_GAP).toBe(40);
    expect(chat.BLOCK_GAP).toBe(20);
    expect(chat.assistantBlocks.gap).toBeUndefined();
    expect(chat.REPLY_SPACING).toEqual({ block: 12, list: 0 });
  });

  it("draws the user bubble in the neutral muted fill at the 10 corner, 12 by 16 in, and replies at 15 / 21", () => {
    expect(chat.webSkin.assistantMessage(t)).toEqual({ backgroundColor: t.muted, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 });
    expect(chat.webSkin.assistantBody(t)).toMatchObject({ fontSize: 15, lineHeight: 21, color: t.foreground });
  });

  it("raises a 44 px composer box at the 12 corner in the column, with no divider, and a muted model line", () => {
    expect(chat.assistantComposer).toEqual({ width: "100%", maxWidth: 816, alignSelf: "center", flexShrink: 0, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 16, gap: 8 });
    expect(chat.assistantComposer.borderTopWidth).toBeUndefined();
    expect(chat.assistantComposerSurface(t, false)).toMatchObject({ borderRadius: 12, borderWidth: 1, borderColor: t.border, backgroundColor: t["surface-raised"], paddingVertical: 5, paddingHorizontal: 6, shadowOpacity: 0.08, shadowRadius: 12 });
    expect(chat.assistantComposerSurface(t, true).borderColor).toBe(t.ring);
    // The composer Textarea's one line (32 tall, as the 32 px controls beside it) 5 in, inside the 1 px edge: a 44 px box.
    const surface = chat.assistantComposerSurface(t, false);
    expect((composerMinHeight().minHeight as number) + (surface.paddingVertical as number) * 2 + (surface.borderWidth as number) * 2).toBe(44);
    expect(chat.assistantComposerRow).toMatchObject({ flexDirection: "row", alignItems: "flex-end", gap: 4 });
    expect(chat.meta(t)).toMatchObject({ alignSelf: "flex-end", fontSize: 12, color: t["muted-foreground"] });
  });

  it("draws an author line on any turn whose author the app names, the person's own included", () => {
    inLight(createElement(ChatMessage, { assistant: true, message: namedUserTurn }));
    expect(screen.getByText("Ada")).toBeTruthy();
    cleanup();
    inLight(createElement(ChatMessage, { assistant: true, message: { ...namedUserTurn, author: undefined } }));
    expect(screen.queryByText("You")).toBeNull();
  });

  it("sets a folded activity line at 14 / 21 in the muted ink", () => {
    expect(chat.assistantActivityLabel(t)).toEqual({ fontSize: 14, lineHeight: 21, color: t["muted-foreground"] });
    inLight(createElement(ChatMessage, { assistant: true, message: ranTests }));
    expect(summaryLook("Ran bun test")).toEqual({ fontSize: "14px", lineHeight: "21px" });
    cleanup();
    inLight(createElement(ChatThread, { assistant: true, messages: [readNotes, ranTests] }));
    expect(summaryLook("Read the release notes, Ran bun test")).toEqual({ fontSize: "14px", lineHeight: "21px" });
  });

  it("leaves the default chat on the hand-off's corners", () => {
    expect(chat.webSkin.message(t, true).borderRadius).toBe(16);
    expect(chat.composerSurface(t, false).borderRadius).toBe(16);
    expect(chat.webSkin.assistantMessage(t).borderRadius).not.toBe(chat.webSkin.message(t, true).borderRadius);
  });
});
