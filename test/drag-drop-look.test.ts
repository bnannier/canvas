import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { webSkin, iosSkin, androidSkin } from "../src/organisms/drag-drop/drag-drop.styles.ts";

// The v4 hand-off's drag-and-drop renderer (cv-kit-data.js K.def('drag-drop'), cv-kit-code3.js DropZone and DragHandle).
describe("the v4 drag and drop affordances", () => {
  it("draws a bordered zone as the sunken well on a 1.5 dashed edge at the lane corner", () => {
    expect(webSkin.zoneWell(t)).toMatchObject({ borderWidth: 1.5, borderStyle: "dashed", borderColor: t["field-border"], borderRadius: 14, backgroundColor: t["surface-sunken"], padding: 10, gap: 8 });
    expect(webSkin.zoneLabel(t)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 11, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase", color: t["subtle-foreground"] });
  });

  it("turns the zone a drag is over to the accent", () => {
    expect(webSkin.zoneWellActive(t)).toEqual({ borderColor: t.primary, backgroundColor: t["primary-soft"] });
    expect(webSkin.zoneActive(t)).toMatchObject({ borderStyle: "dashed", borderColor: t.primary, backgroundColor: t["primary-soft"], borderRadius: 14 });
  });

  it("draws the insertion line as a 3px glowing accent capsule", () => {
    expect(webSkin.indicatorThickness).toBe(3);
    expect(webSkin.indicator(t)).toMatchObject({ backgroundColor: t.primary, borderRadius: 9999, boxShadow: `0px 0px 10px ${t.glow}` });
  });

  it("sets the grip as the 15px glyph in the subtle ink on every platform", () => {
    for (const skin of [webSkin, iosSkin, androidSkin]) {
      expect(skin.handleIconSize).toBe(15);
      expect(skin.handleIconColor(t)).toBe(t["subtle-foreground"]!);
    }
    expect(androidSkin.handle).toMatchObject({ width: 40, height: 40 });
  });
});
