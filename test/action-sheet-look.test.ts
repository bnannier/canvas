import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shadow } from "../src/style/index.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { destructiveText } from "../src/style/destructive-text.ts";
import { webSkin, androidSkin } from "../src/organisms/action-sheet/action-sheet.styles.ts";

// The v4 hand-off's ActionSheet renderer (tools/v4/handoff/cv-kit-overlays.js, K.def('action-sheet')).
describe("the v4 action sheet", () => {
  it("draws two cards at the menu corner in the overlay material, 10 off the edges and 8 apart", () => {
    expect(webSkin.stack).toMatchObject({ paddingHorizontal: 10, paddingVertical: 10, gap: 8 });
    const card = { borderRadius: 16, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.popover, boxShadow: shadow("lg", t).boxShadow };
    expect(webSkin.actionsCard(t)).toMatchObject(card);
    expect(webSkin.cancelCard?.(t)).toMatchObject(card);
  });

  it("centers a 13px header over 54px rows in the accent's ink", () => {
    expect(webSkin.header).toMatchObject({ paddingVertical: 12, paddingHorizontal: 16 });
    expect(webSkin.headerTitle(t)).toMatchObject({ fontSize: 13, fontWeight: "600", color: t["muted-foreground"] });
    expect(webSkin.divider?.(t)).toEqual({ height: 1, backgroundColor: t["field-border"] });
    expect(webSkin.row.minHeight).toBe(54);
    expect(webSkin.rowLabel(t, false, false)).toMatchObject({ fontSize: 18, fontWeight: "400", color: primaryText(t) });
    expect(webSkin.rowLabel(t, true, false).color).toBe(destructiveText(t));
    expect(webSkin.cancelLabel(t)).toMatchObject({ fontSize: 18, fontWeight: "600", color: primaryText(t) });
  });

  it("draws the Android sheet: 28 on top under a hairline, a 32x4 handle, 52dp rows", () => {
    expect(androidSkin.actionsCard(t)).toMatchObject({ borderTopStartRadius: 28, borderTopWidth: 1, borderColor: t.border, backgroundColor: t.popover, paddingTop: 10, paddingHorizontal: 8, paddingBottom: 16 });
    expect(androidSkin.handle?.(t)).toMatchObject({ width: 32, height: 4, marginBottom: 14 });
    expect(androidSkin.headerTitle(t)).toMatchObject({ fontSize: 14, fontWeight: "500" });
    expect(androidSkin.row).toMatchObject({ minHeight: 52, paddingHorizontal: 16 });
    expect(androidSkin.rowLabel(t, false, false)).toMatchObject({ fontSize: 16, fontWeight: "400" });
  });
});
