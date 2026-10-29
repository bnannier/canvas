import { describe, expect, it } from "bun:test";
import { lightColors as t, darkColors, colorsFor } from "../src/style/tokens.ts";
import { contrastRatio, composite } from "../src/style/color.ts";
import { platformShape } from "../src/style/platform-shape.ts";
import { webSkin as s, iosSkin, androidSkin } from "../src/molecules/code-block/code-block.styles.ts";
import { syntaxColor, type TokenKind } from "../src/molecules/code-block/tokenize.ts";

// The v4 hand-off's code block: K.def('code-block') in tools/v4/handoff/cv-kit-data.js
// and its code-driven form, cv-kit-code3.js O('code-block').
describe("the v4 code block", () => {
  it("is the sunken well on a hairline at the 14 px code-card corner", () => {
    expect(platformShape.web.codeCard).toBe(14);
    expect(s.surface(t)).toMatchObject({ borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: t["surface-sunken"] });
  });
  it("sets 13 / 1.7 code (12 compact), 14 above and below (8), rows 16 in (12)", () => {
    expect(s.codeType).toEqual({ fontSize: 13, lineHeight: 22.1 });
    expect(s.codeTypeCompact).toEqual({ fontSize: 12, lineHeight: 20.4 });
    expect(s.bodyPad("default")).toEqual({ paddingVertical: 14 });
    expect(s.bodyPad("compact")).toEqual({ paddingVertical: 8 });
    expect(s.rowPad("default", false)).toMatchObject({ paddingStart: 16, paddingEnd: 16 });
    expect(s.gutterRow("default")).toMatchObject({ paddingEnd: 14 });
    expect(s.gutterText(t).color).toBe(t["subtle-foreground"]);
  });
  it("heads it with a 36 px row, 14 / 12 in, of 12 px mono labels in the subtle ink", () => {
    expect(s.headerBar(t)).toMatchObject({ minHeight: 36, paddingStart: 14, paddingEnd: 12 });
    expect(s.headerLabel(t)).toMatchObject({ fontSize: 12, color: t["subtle-foreground"] });
    expect(s.copyButton(t, false, false)).toMatchObject({ minHeight: 26, paddingHorizontal: 8, gap: 6, borderColor: t["field-border"] });
    expect(s.copyText(t, false)).toMatchObject({ fontSize: 12, fontWeight: "500", color: t["muted-foreground"] });
    expect(s.tabLabel(t, true, false)).toMatchObject({ fontSize: 12, fontWeight: "500", color: t.foreground });
    expect(s.tabItem(t, true, false)).toMatchObject({ paddingHorizontal: 10, borderBottomWidth: 2, borderBottomColor: t.primary });
  });
  it("draws the playground card as the hand-off page's JSX card: the card corner, a 40 px bar on the card fill 16 / 8 in, a 28 px Copy, code 16 by 18", () => {
    // Component.dc.html lines 171 to 174: the page's own card around the playground's JSX.
    expect(platformShape.web.copyButton).toBe(8);
    expect(s.surface(t, "playground")).toMatchObject({ borderRadius: 16, borderWidth: 1, borderColor: t.border, backgroundColor: t["surface-sunken"] });
    expect(s.headerBar(t, "playground")).toMatchObject({ minHeight: 40, paddingStart: 16, paddingEnd: 8, backgroundColor: t.card, borderTopStartRadius: 16 });
    expect(s.copyButton(t, false, false, "playground")).toMatchObject({ minHeight: 28, paddingHorizontal: 10, borderRadius: 8, gap: 6, borderColor: t["field-border"] });
    expect(s.bodyPad("playground")).toEqual({ paddingVertical: 16 });
    expect(s.rowPad("playground", false)).toMatchObject({ paddingStart: 18, paddingEnd: 18 });
    expect(s.expanderClip("playground")).toEqual({ borderBottomStartRadius: 15, borderBottomEndRadius: 15 });
    // The code keeps the default ramp; the compact ramp is compact's alone.
    expect(s.codeType).toEqual({ fontSize: 13, lineHeight: 22.1 });
  });
  it("washes a highlighted row in the accent and a diff row in its status", () => {
    expect(s.highlightRow(t, false)).toEqual({ backgroundColor: t["primary-soft"] });
    expect(s.diffRow("add", false)).toEqual({ backgroundColor: t["success-soft"] });
    expect(s.diffRow("del", true)).toEqual({ backgroundColor: darkColors["destructive-soft"] });
    expect(s.expanderLabel(t)).toMatchObject({ fontSize: 12, fontWeight: "500", color: t["primary-text"] });
  });
  it("draws the terminal as the dark page in every scheme, the prompt in green", () => {
    expect(s.terminalOuter(t)).toMatchObject({ borderRadius: 14, backgroundColor: darkColors.background });
    expect(s.terminalPrompt.color).toBe(darkColors.success);
    expect(s.trafficDot("red")).toMatchObject({ width: 9, height: 9 });
  });
  it("holds every light code ink to 4.5:1 on the well, and each hue ink on every palette's highlighted row", () => {
    // The comment is the kit's subtle ink, as the hand-off draws it: 4.9:1 on the well,
    // about 4.2:1 on a highlighted row (a recorded difference, not a solved ink).
    const kinds: TokenKind[] = ["string", "keyword", "number", "tag", "component", "attr", "text"];
    for (const palette of ["violet", "cyan", "mint", "rose", "amber"] as const) {
      const tokens = colorsFor(palette, "light");
      const beds = [tokens["surface-sunken"]!, composite(tokens["primary-soft"]!, tokens["surface-sunken"]!)];
      for (const kind of kinds) for (const bed of beds) expect(contrastRatio(syntaxColor(kind, tokens, false), bed)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(syntaxColor("comment", tokens, false), beds[0]!)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("paints the dark scheme's inks in the terminal of a light page", () => {
    expect(syntaxColor("string", t, true)).toBe(darkColors["chart-3"]!);
    expect(syntaxColor("keyword", t, true)).toBe(darkColors["primary-text"]!);
  });
  // The component page's `hl` (Component.dc.html line 324): the tag name in
  // var(--ion-tx), an attribute name in var(--cyan), a string in var(--mint), a comment
  // in var(--tx3).
  it("paints a component tag name in the accent's text ink, the jsx grammar's four inks", () => {
    expect(syntaxColor("component", darkColors, true)).toBe(darkColors["primary-text"]!);
    expect(syntaxColor("attr", darkColors, true)).toBe(darkColors["chart-2"]!);
    expect(syntaxColor("string", darkColors, true)).toBe(darkColors["chart-3"]!);
    expect(syntaxColor("comment", darkColors, true)).toBe(darkColors["subtle-foreground"]!);
    expect(syntaxColor("text", darkColors, true)).toBe(darkColors.foreground);
  });
  it("is one look on every platform", () => {
    expect(iosSkin).toBe(s);
    expect(androidSkin).toBe(s);
  });
});
