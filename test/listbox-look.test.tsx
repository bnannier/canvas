import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { lightColors, darkColors } from "../src/style/tokens.ts";
import { shape } from "../src/style/index.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/listbox/listbox.styles.ts";

// The Listbox pinned to the Canvas v4 hand-off's `K.def('listbox')`
// (tools/v4/handoff/cv-kit-inputs.js and its cv-kit-code2.js items). Neither iOS nor
// Material 3 ships a listbox (PLATFORM-REFERENCES.md), so every platform draws it.

afterEach(cleanup);

describe("the Listbox, the hand-off's option list", () => {
  it("is one look on every platform", () => {
    expect(iosSkin).toBe(webSkin);
    expect(androidSkin).toBe(webSkin);
  });

  for (const t of [lightColors, darkColors]) {
    const scheme = t === lightColors ? "light" : "dark";
    it(`boxes a bordered list in the popover fill at the tile corner with a 4px inset, in ${scheme}`, () => {
      const box = webSkin.containerBordered(t);
      expect([box.borderRadius, box.borderWidth, box.borderColor, box.backgroundColor, box.padding]).toEqual([shape.web.tile, 1, t["field-border"], t.popover, 4]);
    });

    it(`sets a chosen row on the accent's soft wash with a 16px check in the accent ink, in ${scheme}`, () => {
      expect(webSkin.rowChosen(t)).toEqual({ backgroundColor: t["primary-soft"] });
      expect(webSkin.check.size).toBe(16);
      expect(webSkin.check.color(t)).toBe(primaryText(t));
      expect(webSkin.rowPressed(t)).toEqual({ backgroundColor: t.muted });
    });
  }

  it("draws rows 10px in, 6/9/12 above and below, concentric inside the inset", () => {
    expect([webSkin.rowSize.small, webSkin.rowSize.medium, webSkin.rowSize.large]).toEqual([
      { paddingHorizontal: 10, paddingVertical: 6 },
      { paddingHorizontal: 10, paddingVertical: 9 },
      { paddingHorizontal: 10, paddingVertical: 12 },
    ]);
    expect(webSkin.rowBase).toMatchObject({ gap: 10, borderRadius: shape.web.tile - 4 });
    expect(webSkin.rowGap).toBe(0);
  });

  it("sets a 500 14/20 label (13/18 small) over a 400 12/16 detail in the subtle ink, and dims disabled to 0.45", () => {
    expect(webSkin.label(lightColors, "small")).toMatchObject({ fontSize: 13, lineHeight: 18, fontWeight: "500" });
    expect(webSkin.label(lightColors, "medium")).toMatchObject({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: lightColors.foreground });
    expect(webSkin.detail(lightColors)).toEqual({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: lightColors["subtle-foreground"] });
    expect(webSkin.disabledOpacity).toBe(0.45);
  });

  it("keeps the chosen row's soft accent wash under glass, a toned wash rather than the ink tint", () => {
    render(<ThemeProvider light glass><Listbox accessibilityLabel="Team" items={[{ label: "One" }, { label: "Two" }]} defaultSelected={0} /></ThemeProvider>);
    const [chosen] = screen.getAllByRole("option");
    expect(chosen.style.backgroundColor).toBe(lightColors["primary-soft"]!.replace("0.1)", "0.10)"));
  });
});
