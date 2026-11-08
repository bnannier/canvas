import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { DISPLAY_FONT, MONO_FONT } from "../src/style/mono.ts";
import * as chat from "../src/organisms/chat/chat.styles.ts";
import * as md from "../src/organisms/chat/markdown.styles.ts";

// The v4 hand-off's Chat renderer (cv-kit-data.js K.def('chat'), cv-kit-code3.js O('chat'), its parts and K.md).
describe("the v4 chat", () => {
  it("frames the conversation as a card around one centered column 24 in, turns 28 apart", () => {
    expect(chat.frame(t)).toMatchObject({ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 16, overflow: "hidden" });
    expect(chat.content).toMatchObject({ width: "100%", maxWidth: 768, alignSelf: "center", paddingHorizontal: 24, paddingVertical: 24, gap: 28 });
    expect(chat.blocks).toMatchObject({ gap: 28 });
    expect(chat.messageContent.gap).toBe(6);
  });

  it("draws the user bubble in the neutral muted fill at the bubble corner, 10 by 16 in", () => {
    expect(chat.webSkin.message(t, true)).toEqual({ backgroundColor: t.muted, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 });
    expect(chat.webSkin.message(t, false)).toEqual({});
    expect(chat.webSkin.body(t)).toMatchObject({ fontSize: 14, lineHeight: 21.7 });
    expect(chat.webSkin.label(t)).toMatchObject({ fontSize: 11, fontWeight: "500", color: t["subtle-foreground"] });
  });

  it("raises the composer as one rounded box in the reading column, with no divider", () => {
    expect(chat.composer(t)).toEqual({ width: "100%", maxWidth: 768, alignSelf: "center", flexShrink: 0, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 16, gap: 8 });
    expect(chat.composerSurface(t, false)).toMatchObject({ borderRadius: 16, borderWidth: 1, borderColor: t.border, backgroundColor: t["surface-raised"], padding: 8 });
    expect(chat.composerSurface(t, true)).toMatchObject({ borderColor: t.ring });
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
