import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { DISPLAY_FONT, MONO_FONT } from "../src/style/mono.ts";
import * as chat from "../src/organisms/chat/chat.styles.ts";
import * as md from "../src/organisms/chat/markdown.styles.ts";
import { composerMinHeight } from "../src/atoms/textarea/textarea.styles.ts";

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

  it("leaves the default chat on the hand-off's corners", () => {
    expect(chat.webSkin.message(t, true).borderRadius).toBe(16);
    expect(chat.composerSurface(t, false).borderRadius).toBe(16);
    expect(chat.webSkin.assistantMessage(t).borderRadius).not.toBe(chat.webSkin.message(t, true).borderRadius);
  });
});
