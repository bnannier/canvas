import { describe, expect, it } from "bun:test";
import { lightColors, darkColors } from "../src/style/tokens.ts";
import { shape } from "../src/style/index.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/select/select.styles.ts";

// The Select pinned to the Canvas v4 hand-off: the web field and its panel from
// `K.def('select')` (tools/v4/handoff/cv-kit-inputs.js) with K.panel and K.IN.menu, the
// iOS pop-up button and the Material 3 exposed dropdown from `P.select` in
// cv-kit-platform.js (PLATFORM-REFERENCES.md lists a real control on both).

describe("the web Select, the hand-off's sunken field", () => {
  for (const t of [lightColors, darkColors]) {
    const scheme = t === lightColors ? "light" : "dark";
    it(`draws the trigger 32/40/48 tall on the sunken fill, 12px in (10 small), in ${scheme}`, () => {
      expect([webSkin.trigger(t, "small", false), webSkin.trigger(t, "default", false), webSkin.trigger(t, "large", false)].map((s) => [s.height, s.paddingHorizontal])).toEqual([[32, 10], [40, 12], [48, 12]]);
      const rest = webSkin.trigger(t, "default", false);
      expect(rest.borderRadius).toBe(shape.web.field);
      expect(rest.borderWidth).toBe(1);
      expect(rest.backgroundColor).toBe(t["surface-sunken"]);
      expect(rest.borderColor).toBe(t["field-border"]);
    });

    it(`edges the trigger by state: ring open or focused, subtle ink hovered, in ${scheme}`, () => {
      expect(webSkin.trigger(t, "default", true).borderColor).toBe(t.ring);
      expect(webSkin.trigger(t, "default", false, false, true).borderColor).toBe(t.ring);
      expect(webSkin.trigger(t, "default", false, true).borderColor).toBe(t["subtle-foreground"]);
      expect(String(webSkin.focusHalo!(t).boxShadow)).toMatch(/^0 0 0 4px rgba\(/);
      expect(webSkin.hover).toBe(true);
    });

    it(`hangs the card panel 6px under the trigger, rows 34px on the muted wash, in ${scheme}`, () => {
      const panel = webSkin.panel(t);
      expect([panel.backgroundColor, panel.borderColor, panel.borderWidth, panel.borderRadius, panel.padding, panel.maxHeight]).toEqual([t.card, t.border, 1, shape.web.menu, 4, 280]);
      expect(webSkin.panelGap).toBe(6);
      const row = webSkin.optionRow(t, true);
      expect([row.minHeight, row.paddingHorizontal, row.gap, row.backgroundColor]).toEqual([34, 10, 8, t.muted]);
      expect(webSkin.optionRow(t, false).backgroundColor).toBeUndefined();
      expect(webSkin.optionText(t, "default")).toMatchObject({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: t.foreground });
      // The trailing 14px check in the accent ink.
      expect(webSkin.selectedSide).toBe("trailing");
      expect(webSkin.indicator(t, "default")).toMatchObject({ fontSize: 14, color: primaryText(t) });
    });
  }

  it("sets the value 400 14/20 (13/18 small), the chevron 16 (14 small) that turns over open, and dims disabled to 0.45", () => {
    expect([webSkin.text("small"), webSkin.text("default"), webSkin.text("large")]).toEqual([
      { fontSize: 13, lineHeight: 18, fontWeight: "400" },
      { fontSize: 14, lineHeight: 20, fontWeight: "400" },
      { fontSize: 14, lineHeight: 20, fontWeight: "400" },
    ]);
    expect(webSkin.disclosure.glyph).toBe("chevronDown");
    expect([webSkin.disclosure.size("small"), webSkin.disclosure.size("default")]).toEqual([14, 16]);
    expect(webSkin.disclosure.color(lightColors, false)).toBe(lightColors["subtle-foreground"]);
    expect(webSkin.disclosure.flips).toBe(true);
    expect(webSkin.disabledOpacity).toBe(0.45);
  });

  it("draws the dense reference trigger 32 tall with its 10px eyebrow label and 30px rows", () => {
    const r = webSkin.reference!;
    expect(r.trigger(lightColors, false)).toMatchObject({ height: 32, paddingHorizontal: 10 });
    expect(r.value(lightColors)).toMatchObject({ fontSize: 13, fontWeight: "600" });
    expect(r.label(lightColors)).toMatchObject({ fontSize: 10, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase" });
    expect(r.row(lightColors, true)).toMatchObject({ minHeight: 30, backgroundColor: lightColors.muted });
    expect(r.chevron).toBe(14);
  });
});

describe("the iOS Select, the pop-up button and its menu", () => {
  it("draws the field 36/44/50 on the card fill at the iOS field corner, and keeps its hairline open", () => {
    expect(["small", "default", "large"].map((s) => iosSkin.trigger(lightColors, s as never, false).height)).toEqual([36, 44, 50]);
    const open = iosSkin.trigger(lightColors, "default", true);
    expect([open.borderRadius, open.backgroundColor, open.borderColor, open.paddingHorizontal]).toEqual([shape.ios.field, lightColors.card, lightColors["field-border"], 12]);
    expect(iosSkin.disclosure).toMatchObject({ glyph: "chevronsUpDown", flips: false });
    expect(iosSkin.disclosure.size("default")).toBe(16);
  });

  it("opens a 250pt menu of 44pt rows with UIMenu's leading 16pt check in the label ink", () => {
    const panel = iosSkin.panel(lightColors);
    expect([panel.borderRadius, panel.backgroundColor, panel.paddingVertical]).toEqual([shape.ios.menu, lightColors.popover, 6]);
    expect([iosSkin.panelWidth, iosSkin.panelGap]).toEqual([250, 6]);
    expect(iosSkin.optionRow(lightColors, true)).toMatchObject({ minHeight: 44, paddingStart: 12, paddingEnd: 16, gap: 6 });
    expect(iosSkin.selectedSide).toBe("leading");
    expect(iosSkin.markSlot).toBe(22);
    expect(iosSkin.indicator(lightColors, "default")).toMatchObject({ fontSize: 16, color: lightColors.foreground });
    expect([iosSkin.disabledOpacity, iosSkin.pressedOpacity]).toEqual([0.5, 0.8]);
  });
});

describe("the Android Select, the Material 3 exposed dropdown", () => {
  it("draws the filled field 48/56/60 with the drop-down triangle and an indicator that turns primary open", () => {
    expect(["small", "default", "large"].map((s) => androidSkin.trigger(lightColors, s as never, false).minHeight)).toEqual([48, 56, 60]);
    const rest = androidSkin.trigger(lightColors, "default", false);
    expect([rest.backgroundColor, rest.paddingStart, rest.paddingEnd, rest.gap]).toEqual([lightColors.muted, 16, 12, 12]);
    expect(androidSkin.trigger(lightColors, "default", true).borderBottomColor).toBe(lightColors.primary);
    expect(androidSkin.disclosure).toMatchObject({ glyph: "triangle", flips: true });
    expect(androidSkin.disclosure.size("default")).toBe(24);
  });

  it("opens the M3 menu 4dp under the field, 48dp rows on the 10% state layer and no check", () => {
    const panel = androidSkin.panel(lightColors);
    expect([panel.borderRadius, panel.backgroundColor, panel.paddingVertical]).toEqual([shape.android.menu, lightColors.popover, 8]);
    expect(androidSkin.panelGap).toBe(4);
    expect(androidSkin.optionRow(lightColors, false)).toMatchObject({ minHeight: 48, paddingHorizontal: 12 });
    expect(androidSkin.optionRow(lightColors, true).backgroundColor).toMatch(/0\.1\)$/);
    expect(androidSkin.selectedSide).toBe("none");
    expect(androidSkin.disabledOpacity).toBe(0.38);
  });
});
