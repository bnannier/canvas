import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors, darkColors } from "../src/style/tokens.ts";
import { shape } from "../src/style/index.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/autocomplete/autocomplete.styles.ts";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";

// The Autocomplete pinned to the Canvas v4 hand-off's `K.def('autocomplete')`
// (tools/v4/handoff/cv-kit-inputs.js) with K.panel: the sunken search field and its
// card of matches. iOS ships no combo box, so it takes the same look at the iOS corners;
// Android keeps the Material 3 exposed dropdown (PLATFORM-REFERENCES.md).

afterEach(cleanup);

describe("the web Autocomplete, the hand-off's search field", () => {
  for (const t of [lightColors, darkColors]) {
    const scheme = t === lightColors ? "light" : "dark";
    it(`draws the field 32/40/48 on the sunken fill, edged by state, in ${scheme}`, () => {
      expect(["small", "default", "large"].map((s) => webSkin.field(t, s as never, false).height)).toEqual([32, 40, 48]);
      const rest = webSkin.field(t, "default", false);
      expect([rest.borderRadius, rest.borderWidth, rest.backgroundColor, rest.borderColor, rest.paddingHorizontal, rest.gap]).toEqual([shape.web.field, 1, t["surface-sunken"], t["field-border"], 12, 8]);
      expect(webSkin.field(t, "default", true).borderColor).toBe(t.ring);
      expect(webSkin.field(t, "default", false, true).borderColor).toBe(t["subtle-foreground"]);
      expect(String(webSkin.focusHalo!(t).boxShadow)).toMatch(/^0 0 0 4px rgba\(/);
    });

    it(`hangs the card of 34px matches 6px under the field, the match on the accent's soft wash, in ${scheme}`, () => {
      const panel = webSkin.popover(t);
      expect([panel.backgroundColor, panel.borderColor, panel.borderWidth, panel.borderRadius, panel.padding, panel.maxHeight]).toEqual([t.card, t.border, 1, shape.web.menu, 4, 280]);
      expect(webSkin.popoverGap).toBe(6);
      expect([webSkin.row.minHeight, webSkin.row.paddingHorizontal]).toEqual([34, 10]);
      expect(webSkin.rowSelected(t)).toEqual({ backgroundColor: t.muted });
      expect(webSkin.highlight(t)).toEqual({ backgroundColor: t["primary-soft"], color: primaryText(t) });
    });
  }

  it("leads with the 16px search glyph and sets the value 400 14/20 (13/18 small)", () => {
    expect(webSkin.searchIcon!.size).toBe(16);
    expect(webSkin.searchIcon!.color(lightColors)).toBe(lightColors["subtle-foreground"]);
    expect([webSkin.text("small"), webSkin.text("default")]).toEqual([
      { fontSize: 13, lineHeight: 18, fontWeight: "400" },
      { fontSize: 14, lineHeight: 20, fontWeight: "400" },
    ]);
    expect(webSkin.helper(lightColors)).toMatchObject({ fontSize: 12, lineHeight: 17, marginTop: 6 });
    expect(webSkin.disabledOpacity).toBe(0.45);
  });

  it("marks the typed match inside each suggestion", () => {
    render(<ThemeProvider light solid><Autocomplete accessibilityLabel="Fruit" options={["Banana", "Apple"]} open defaultQuery="an" /></ThemeProvider>);
    const option = screen.getAllByRole("option", { hidden: true })[0];
    const mark = [...option.querySelectorAll("span, div")].find((node) => node.textContent === "an") as HTMLElement;
    expect(mark).toBeDefined();
    expect(mark.style.backgroundColor).not.toBe("");
  });
});

describe("the iOS Autocomplete, the hand-off's look at the iOS corners", () => {
  it("keeps a 44pt field (48 large) and a concentric row corner inside the card panel", () => {
    expect(["small", "default", "large"].map((s) => iosSkin.field(lightColors, s as never, false).height)).toEqual([44, 44, 48]);
    expect(iosSkin.field(lightColors, "default", false).borderRadius).toBe(shape.ios.field);
    const panel = iosSkin.popover(lightColors);
    expect([panel.borderRadius, panel.padding]).toEqual([shape.ios.card, 4]);
    expect(iosSkin.row.borderRadius).toBe(shape.ios.card - 4);
    expect(iosSkin.hover).toBe(false);
  });
});

describe("the Android Autocomplete, the Material 3 exposed dropdown", () => {
  it("draws the filled field 48/56/60 with the triangle, the menu 4dp under it and 48dp rows", () => {
    expect(["small", "default", "large"].map((s) => androidSkin.field(lightColors, s as never, false).minHeight)).toEqual([48, 56, 60]);
    expect(androidSkin.field(lightColors, "default", false).backgroundColor).toBe(lightColors.muted);
    expect(androidSkin.disclosure).toMatchObject({ glyph: "triangle", flips: true });
    const panel = androidSkin.popover(lightColors);
    expect([panel.borderRadius, panel.backgroundColor, panel.paddingVertical]).toEqual([shape.android.menu, lightColors.popover, 8]);
    expect(androidSkin.popoverGap).toBe(4);
    expect([androidSkin.row.minHeight, androidSkin.row.paddingHorizontal]).toEqual([48, 12]);
    expect(androidSkin.disabledOpacity).toBe(0.38);
  });
});
