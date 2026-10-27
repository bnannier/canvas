import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { DISPLAY_FONT, MONO_FONT } from "../src/style/mono.ts";
import * as chat from "../src/organisms/chat/chat.styles.ts";
import * as md from "../src/organisms/chat/markdown.styles.ts";

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
