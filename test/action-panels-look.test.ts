import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { alpha, shape } from "../src/style/index.ts";
import { webSkin, iosSkin, androidSkin, panelColor, panelTint, titleColor } from "../src/molecules/action-panels/action-panels.styles.ts";

// The v4 hand-off's action panel (tools/v4/handoff/cv-kit-data.js K.def('action-panels'),
// with the code-driven embedded form, cv-kit-code6.js O('action-panels')).
describe("the v4 action panel", () => {
  it("is an 18 px panel at the card corner, 14 between its blocks", () => {
    expect(webSkin.container).toEqual({ borderRadius: shape.web.card, borderWidth: 1, padding: 18, gap: 14 });
    expect(panelColor(t, "neutral")).toEqual({ backgroundColor: t.card, borderColor: t.border });
  });

  it("washes the danger zone and edges it in the destructive colour at 35%", () => {
    expect(panelColor(t, "destructive")).toEqual({ backgroundColor: t["destructive-soft"], borderColor: alpha(t.destructive, 0.35) });
    expect(panelTint(t, "destructive")).toBe(t["destructive-soft"]);
    expect(panelTint(t, "neutral")).toBeUndefined();
    expect(titleColor(t, "destructive")).not.toBe(titleColor(t, "neutral"));
  });

  it("sets a 600 15 title over a 13 / 19.5 description, 4 apart", () => {
    expect(webSkin.titleType).toEqual({ fontSize: 15, lineHeight: 20, fontWeight: "600" });
    expect(webSkin.descriptionType).toEqual({ fontSize: 13, lineHeight: 19.5, fontWeight: "400" });
    expect(webSkin.copyGap).toBe(4);
  });

  it("pins the inline action 16 beside the copy, centred, wrapping under a 220 basis", () => {
    expect(webSkin.inlineGap).toBe(16);
    expect(webSkin.inlineCopyBasis).toBe(220);
    expect(webSkin.inlineAlign).toBe("center");
  });

  it("closes embedded content in a 12 rhythm with a right-aligned action over a hairline", () => {
    expect(webSkin.contentGap).toBe(12);
    expect(webSkin.footer).toEqual({ flexDirection: "row", justifyContent: "flex-end", paddingTop: 12, borderTopWidth: 1 });
  });

  it("draws the web panel on iOS and Android, which ship no action panel", () => {
    expect(iosSkin).toBe(webSkin);
    expect(androidSkin).toBe(webSkin);
  });
});
