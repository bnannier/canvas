import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shadow } from "../src/style/index.ts";
import { DISPLAY_FONT } from "../src/style/mono.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { destructiveText } from "../src/style/destructive-text.ts";
import { webSkin, iosSkin, androidSkin } from "../src/molecules/alert-dialog/alert-dialog.styles.ts";

// The v4 hand-off's AlertDialog renderer (tools/v4/handoff/cv-kit-overlays.js, K.def('alert-dialog')).
describe("the v4 alert dialog", () => {
  it("is the overlay material with 24 padding, a tone tile 16 over a 20px display title", () => {
    expect(webSkin.card(t)).toMatchObject({ borderRadius: 24, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.popover, padding: 24, boxShadow: shadow("lg", t).boxShadow });
    expect(webSkin.emblem).toEqual({ marginBottom: 16 });
    expect(webSkin.title(t)).toMatchObject({ fontFamily: DISPLAY_FONT, fontSize: 20, fontWeight: "600" });
    expect(webSkin.description(t)).toMatchObject({ marginTop: 6, fontSize: 14, lineHeight: 21, color: t["muted-foreground"] });
  });

  it("closes on two equal Buttons, a secondary Cancel, 16 under the text", () => {
    expect(webSkin.actions).toMatchObject({ flexDirection: "row", gap: 8, marginTop: 16 });
    expect([webSkin.cancelButton, webSkin.blockButtons, webSkin.buttonSmall]).toEqual([{ secondary: true }, true, false]);
    expect(androidSkin.card(t)).toMatchObject({ borderRadius: 28, padding: 24 });
    expect(androidSkin.title(t).fontFamily).toBeUndefined();
  });

  it("draws the iOS alert: centered text over a 44pt two-cell action row under a hairline", () => {
    expect(iosSkin.content).toEqual({ paddingTop: 18, paddingHorizontal: 16, paddingBottom: 14 });
    // The UIAlertController corner, 14 (the hand-off's iOS row).
    expect(iosSkin.card(t).borderRadius).toBe(14);
    expect(iosSkin.title(t)).toMatchObject({ fontSize: 17, fontWeight: "600", textAlign: "center" });
    expect(iosSkin.description(t)).toMatchObject({ fontSize: 13, textAlign: "center" });
    expect(iosSkin.capsuleCell).toMatchObject({ flex: 1, minHeight: 44 });
    expect(iosSkin.capsuleRowColor?.(t)).toEqual({ borderTopColor: t["field-border"] });
    expect(iosSkin.cancelFill?.(t)).toEqual({ borderRightWidth: 1, borderRightColor: t["field-border"] });
    expect(iosSkin.cancelLabelStyle?.(t)).toMatchObject({ fontSize: 17, fontWeight: "400", color: primaryText(t) });
    expect(iosSkin.confirmLabelStyle?.(t, true)).toMatchObject({ fontWeight: "600", color: destructiveText(t) });
  });
});
