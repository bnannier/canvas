import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shadow } from "../src/style/index.ts";
import { DISPLAY_FONT } from "../src/style/mono.ts";
import { webSkin, androidSkin, PANEL_MAX_WIDTH } from "../src/organisms/dialog/dialog.styles.ts";

// The v4 hand-off's Dialog renderer (tools/v4/handoff/cv-kit-overlays.js, K.def('dialog')).
describe("the v4 dialog panel", () => {
  it("is the overlay material at the dialog corner with 22 padding", () => {
    expect(webSkin.card(t)).toMatchObject({ borderRadius: 20, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.popover, padding: 22, boxShadow: shadow("lg", t).boxShadow });
    expect(webSkin.form?.card(t)).toEqual(webSkin.card(t));
    expect(androidSkin.card(t)).toMatchObject({ borderRadius: 28, padding: 22 });
  });

  it("sets an 18px display heading over the 14/1.5 muted description, 4 apart, and the actions 14 under", () => {
    expect(webSkin.title(t)).toMatchObject({ fontFamily: DISPLAY_FONT, fontSize: 18, lineHeight: 22.5, fontWeight: "600", letterSpacing: -0.27 });
    expect(webSkin.body(t)).toMatchObject({ fontSize: 14, lineHeight: 21, marginTop: 4, color: t["muted-foreground"] });
    expect(webSkin.footer(t)).toMatchObject({ justifyContent: "flex-end", gap: 8, marginTop: 14 });
    expect(androidSkin.title(t).fontFamily).toBeUndefined();
  });

  it("caps each size at the width step nearest the hand-off's", () => {
    expect(PANEL_MAX_WIDTH).toEqual({ xs: 320, small: 384, medium: 448, default: 448, large: 512, wide: 576 });
  });
});
