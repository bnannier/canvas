import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { DISPLAY_FONT } from "../src/style/mono.ts";
import { webSkin, androidSkin, webBeakStyle } from "../src/atoms/popover/popover.styles.tsx";

// The v4 hand-off's Popover renderer (tools/v4/handoff/cv-kit-overlays.js, K.def('popover')).
describe("the v4 popover panel", () => {
  it("is the hand-off's 280 card: menu corner, field-border hairline, popover fill, 16 padding", () => {
    expect(webSkin.cardWidth).toBe(280);
    expect(webSkin.card(t)).toMatchObject({ width: 280, borderRadius: 16, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.popover, padding: 16 });
    expect(webSkin.sectionGap).toBe(8);
  });

  it("sets the heading in the display face at 15/600 and the description at 14/1.5 muted, 8 apart", () => {
    expect(webSkin.title(t)).toMatchObject({ fontFamily: DISPLAY_FONT, fontSize: 15, lineHeight: 19, fontWeight: "600", letterSpacing: -0.225 });
    expect(webSkin.description(t)).toMatchObject({ marginTop: 8, fontSize: 14, lineHeight: 21, color: t["muted-foreground"] });
    expect(androidSkin.title(t).fontFamily).toBeUndefined();
  });

  it("draws the 12px diamond beak on the edge facing the trigger, 10 off it", () => {
    expect(webSkin.arrowGap).toBe(10);
    expect(webBeakStyle(t, "bottom")).toMatchObject({ top: -6, left: 24, width: 12, height: 12, borderTopWidth: 1, borderLeftWidth: 1, transform: [{ rotate: "45deg" }] });
    expect(webBeakStyle(t, "top")).toMatchObject({ bottom: -6, borderBottomWidth: 1, borderRightWidth: 1 });
    // Centered on the trigger, kept off the card's corners.
    expect(webBeakStyle(t, "bottom", { centerX: 140, cardWidth: 280 }).left).toBe(134);
    expect(webBeakStyle(t, "bottom", { centerX: 2, cardWidth: 280 }).left).toBe(16);
  });
});
