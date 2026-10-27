import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shape } from "../src/style/index.ts";
import { platformShape } from "../src/style/platform-shape.ts";
import * as acc from "../src/molecules/accordion/accordion.styles.ts";
import * as col from "../src/molecules/collapsible/collapsible.styles.ts";

// The v4 hand-off's disclosures: K.def('accordion') in tools/v4/handoff/cv-kit-data.js,
// and the code-driven collapsible, cv-kit-code3.js O('collapsible') with its states in
// cv-kit-code8.js.
describe("the v4 accordion", () => {
  const s = acc.webSkin;
  it("rows are 14 in, the 500 14 title 12 from a 16 px chevron that turns 180", () => {
    expect(s.header(t)).toMatchObject({ paddingVertical: 14, gap: 12 });
    expect(s.title(t)).toMatchObject({ fontSize: 14, fontWeight: "500", color: t.foreground });
    expect([s.chevronSize, s.chevronGlyph, s.chevronSpinTo]).toEqual([16, "chevronDown", 180]);
    expect(s.titleHover?.(t)).toEqual({ color: t["primary-text"] });
  });
  it("reads the panel 14 / 1.55 muted, 14 at the bottom, the description 12 subtle", () => {
    expect(s.contentText(t)).toMatchObject({ fontSize: 14, lineHeight: 21.7, color: t["muted-foreground"] });
    expect(s.content(t)).toEqual({ paddingBottom: 14 });
    expect(s.description(t)).toMatchObject({ fontSize: 12, color: t["subtle-foreground"] });
  });
  it("draws the card at the card corner, 18 in", () => {
    expect(s.cardContainer(t)).toMatchObject({ borderRadius: shape.web.card, borderWidth: 1, borderColor: t.border, backgroundColor: t.card });
    expect(s.cardHeaderInset).toEqual({ paddingHorizontal: 18 });
  });
  it("keeps the iOS disclosure group, and draws the web rows on Android with its ripple", () => {
    expect(acc.iosSkin.chevronGlyph).toBe("chevronRight");
    expect(acc.androidSkin.header(t)).toEqual(s.header(t));
    expect(acc.androidSkin.ripple).not.toBeNull();
  });
});

describe("the v4 collapsible", () => {
  const s = col.webSkin;
  it("is a 10 by 2 header with a trailing 16 px chevron that turns 180", () => {
    expect(s.header(t)).toMatchObject({ paddingVertical: 10, paddingHorizontal: 2, gap: 12, justifyContent: "space-between" });
    expect([s.chevronSize, s.chevronGlyph, s.chevronSpinTo]).toEqual([16, "chevronDown", 180]);
    expect(s.headerHover?.(t)).toEqual({ backgroundColor: t.secondary, borderRadius: platformShape.web.insetRow });
    expect(s.disabledOpacity).toBe(0.45);
  });
  it("draws the card at the disclosure corner, 14 by 16 in", () => {
    expect(s.cardContainer(t)).toMatchObject({ borderRadius: 14, borderWidth: 1, backgroundColor: t.card });
    expect(s.cardHeaderInset).toEqual({ paddingHorizontal: 16, paddingVertical: 14 });
    expect(s.cardContentInset).toEqual({ paddingHorizontal: 16, paddingBottom: 16 });
  });
  it("reads the panel 14 / 1.55 muted", () => {
    expect(s.contentText(t)).toMatchObject({ fontSize: 14, lineHeight: 21.7, color: t["muted-foreground"] });
    expect(s.content(t)).toEqual({ paddingHorizontal: 2, paddingBottom: 10 });
  });
  it("keeps the iOS disclosure group, and draws the web disclosure on Android", () => {
    expect(col.iosSkin.chevronGlyph).toBe("chevronRight");
    expect(col.androidSkin.header(t)).toEqual(s.header(t));
  });
});
