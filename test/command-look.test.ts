import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shadow } from "../src/style/index.ts";
import { primaryText } from "../src/style/primary-text.ts";
import * as s from "../src/organisms/command/command.styles.ts";

// The v4 hand-off's Command renderer (tools/v4/handoff/cv-kit-overlays.js, K.def('command')).
describe("the v4 command palette", () => {
  it("is a 520 panel in the overlay material at its 18 corner, its rows at 9", () => {
    expect(s.CARD_WIDTH).toBe(520);
    expect(s.card(t)).toMatchObject({ width: 520, maxWidth: "100%", borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.popover, boxShadow: shadow("lg", t).boxShadow });
    expect(s.webSkin.cardShape).toEqual({ borderRadius: 18 });
    expect(s.webSkin.rowBase).toMatchObject({ borderRadius: 9, minHeight: 38 });
  });

  it("draws the 48 search row with 15px type and a 17px subtle glyph", () => {
    expect(s.webSkin.searchRow(t, false)).toMatchObject({ minHeight: 48, paddingHorizontal: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: t.border });
    expect(s.webSkin.searchGlyphSize).toBe(17);
    expect(s.webSkin.searchPlaceholder(t)).toMatchObject({ fontSize: 15, color: t["subtle-foreground"] });
  });

  it("draws 38 rows under mono eyebrows, the active row in the accent's soft wash", () => {
    expect(s.resultsContent).toEqual({ padding: 6 });
    expect(s.groupHeading(t)).toMatchObject({ fontSize: 11, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase", paddingTop: 8, paddingHorizontal: 10, paddingBottom: 4 });
    expect(s.webSkin.rowBase).toMatchObject({ minHeight: 38, paddingHorizontal: 10, gap: 10 });
    expect(s.webSkin.rowLabel(t)).toMatchObject({ fontSize: 14, lineHeight: 18 });
    expect(s.webSkin.rowAccent(t)).toEqual({ backgroundColor: t["primary-soft"] });
    expect(s.webSkin.iconSize).toBe(15);
    expect([s.webSkin.iconColor(t, false), s.webSkin.iconColor(t, true)]).toEqual([t["subtle-foreground"], primaryText(t)]);
    expect(s.webSkin.shortcut(t, false)).toMatchObject({ fontSize: 11, color: t["subtle-foreground"] });
    // On the active row's accent wash the shortcut steps up to the muted ink (4.5:1 in dark).
    expect(s.webSkin.shortcut(t, true)).toMatchObject({ fontSize: 11, color: t["muted-foreground"] });
  });

  it("closes on a 36 footer of mono hints", () => {
    expect(s.footerBar(t)).toMatchObject({ minHeight: 36, paddingHorizontal: 14, gap: 14, borderTopWidth: 1, borderColor: t.border });
    expect(s.footerText(t)).toMatchObject({ fontSize: 11, color: t["subtle-foreground"] });
  });

  it("keeps the platform minimum on the native rows", () => {
    expect(s.iosSkin.rowBase.minHeight).toBe(44);
    expect(s.androidSkin.rowBase.minHeight).toBe(48);
    expect(s.androidSkin.ripple).not.toBeNull();
  });
});
