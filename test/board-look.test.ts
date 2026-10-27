import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shadow } from "../src/style/index.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { webSkin, iosSkin, androidSkin, plainLane } from "../src/organisms/board/board.styles.ts";

// The v4 hand-off's Board renderer (tools/v4/handoff/cv-kit-data.js K.def('board'), cv-kit-code3.js O('board')).
describe("the v4 board", () => {
  it("lays the lanes 12 apart as sunken wells at the lane corner, 10 in", () => {
    expect(webSkin.lanes(false)).toMatchObject({ gap: 12 });
    expect(webSkin.column(t, false)).toMatchObject({ backgroundColor: t["surface-sunken"], borderWidth: 1, borderColor: t.border, borderRadius: 14, padding: 10, gap: 8 });
    expect(webSkin.column(t, true)).toMatchObject({ padding: 10, gap: 6 });
  });

  it("heads a lane with a 600 12 muted label and the 11px mono count", () => {
    expect(webSkin.columnHeader).toMatchObject({ paddingVertical: 2, paddingHorizontal: 4, justifyContent: "space-between" });
    expect(webSkin.columnLabel(t)).toMatchObject({ fontSize: 12, fontWeight: "600", color: t["muted-foreground"] });
    expect(webSkin.columnCount(t)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 11, fontWeight: "500", color: t["subtle-foreground"] });
  });

  it("draws a card at the 10 corner, 12 in (8 compact), under the small shade", () => {
    expect(webSkin.card(t, false)).toMatchObject({ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 12, boxShadow: shadow("sm", t).boxShadow });
    expect(webSkin.card(t, true).padding).toBe(8);
    expect(webSkin.cardTitle(t, false)).toMatchObject({ fontSize: 13, lineHeight: 18.2, fontWeight: "500" });
    expect(webSkin.cardTitle(t, true).fontSize).toBe(12.5);
    expect(webSkin.cardDescription(t)).toMatchObject({ fontSize: 12, color: t["subtle-foreground"] });
    expect(webSkin.pressableBody.borderRadius).toBe(10);
  });

  it("shows an empty lane as a dashed field-border slot", () => {
    expect(webSkin.emptySlot(t)).toMatchObject({ borderWidth: 1.5, borderStyle: "dashed", borderColor: t["field-border"], borderRadius: 10, paddingVertical: 18, paddingHorizontal: 10 });
    expect(webSkin.emptyLabel(t)).toMatchObject({ fontSize: 12, textAlign: "center", color: t["subtle-foreground"] });
  });

  it("shares the web skin's parts on iOS and Android, keeping each platform's press feedback", () => {
    for (const skin of [iosSkin, androidSkin]) {
      expect(skin.column(t, false)).toEqual(webSkin.column(t, false));
      expect(skin.card(t, false)).toEqual(webSkin.card(t, false));
    }
    expect(iosSkin.pressedOpacity).toBe(0.8);
    expect(androidSkin.ripple).not.toBeNull();
  });

  it("spaces plain lanes 12 apart", () => {
    expect(plainLane(0, 0, 4)).toMatchObject({ gap: 12, width: 4 * 168 + 3 * 12 });
  });
});
