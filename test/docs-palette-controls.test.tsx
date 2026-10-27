import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { ThemeProvider } from "../src/style/theme.tsx";

// The docs' palette controls (docs/src/shell/theme-toggles.tsx): the five hue swatches
// (a radio group of kit Swatch palette pickers) the narrow web drawer and the Android menu drawer render, and the Palette
// section of the iOS header menu. The docs theme provider reads the router and Expo's
// launch URL, so its hook is replaced by a plain state object the tests set; the
// controls under test are the real ones.

// The docs app has a separate Expo React installation. Its components must use the test
// renderer's React instance in this harness, just as Metro deduplicates React in the app.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);

type Palette = "violet" | "cyan" | "mint" | "rose" | "amber";
const LABELS = ["Violet", "Cyan", "Mint", "Rose", "Amber"];
const docsTheme = {
  scheme: "light" as "light" | "dark",
  surface: "solid" as "solid" | "glass",
  palette: "violet" as Palette,
  override: null,
  toggleScheme: () => {},
  setScheme: () => {},
  setSurface: () => {},
  setPalette: (_palette: Palette) => {},
};
mock.module(import.meta.resolve("../docs/src/theme/docs-theme.tsx"), () => ({ useDocsTheme: () => docsTheme }));
const { HueSwatches, PaletteRow, ThemeToggles, paletteMenuSection } = await import("../docs/src/shell/theme-toggles.tsx");

let picked: Palette[] = [];
beforeEach(() => {
  picked = [];
  Object.assign(docsTheme, { scheme: "light", palette: "violet", setPalette: (palette: Palette) => { picked.push(palette); } });
});
afterEach(cleanup);

function show(node: React.ReactNode) {
  return render(<ThemeProvider light solid>{node}</ThemeProvider>);
}

describe("the docs' palette control", () => {
  it("offers the five hues, marks the palette in force, and picks another", () => {
    show(<HueSwatches />);
    const group = screen.getByRole("radiogroup", { name: "Palette" });
    const radios = Array.from(group.querySelectorAll('[role="radio"]'));
    expect(radios.map((radio) => radio.getAttribute("aria-label"))).toEqual(LABELS);
    expect(screen.getByRole("radio", { name: "Violet" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "Rose" }));
    expect(picked).toEqual(["rose"]);
  });

  it("marks Mint when mint is in force", () => {
    docsTheme.palette = "mint";
    show(<HueSwatches />);
    expect(screen.getByRole("radio", { name: "Mint" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Violet" }).getAttribute("aria-checked")).toBe("false");
  });

  it("shows in the dark scheme too, since a palette paints its accent in both", () => {
    docsTheme.scheme = "dark";
    show(<HueSwatches />);
    expect(screen.getByRole("radiogroup", { name: "Palette" })).toBeDefined();
  });

  it("titles the Android drawer's footer row Palette", () => {
    show(<PaletteRow />);
    expect(screen.getByText("Palette")).toBeDefined();
    expect(screen.getByRole("radiogroup", { name: "Palette" })).toBeDefined();
  });

  it("keeps the palette in the labeled toggles in either scheme, and out of the compact bar form", () => {
    for (const scheme of ["light", "dark"] as const) {
      docsTheme.scheme = scheme;
      const { unmount } = show(<ThemeToggles />);
      expect(screen.getByRole("radiogroup", { name: "Palette" })).toBeDefined();
      unmount();
    }

    show(<ThemeToggles compact />);
    expect(screen.queryByRole("radiogroup", { name: "Palette" })).toBeNull();
    expect(screen.getByRole("button", { name: "Toggle color scheme" })).toBeDefined();
  });
});

describe("the iOS header menu's Palette section", () => {
  it("is one inline section of the five hues, the palette in force check-marked", () => {
    const sections = paletteMenuSection("violet", (palette) => picked.push(palette));
    expect(sections.map(({ type, label, inline }) => ({ type, label, inline }))).toEqual([{ type: "submenu", label: "Palette", inline: true }]);
    const rows = sections[0].items;
    expect(rows.map(({ type, label, state }) => ({ type, label, state }))).toEqual(
      LABELS.map((label, i) => ({ type: "action", label, state: i === 0 ? "on" : undefined })),
    );
    rows[2].onPress();
    rows[0].onPress();
    expect(picked).toEqual(["mint", "violet"]);
  });

  it("moves the check to Amber when amber is in force", () => {
    const rows = paletteMenuSection("amber", () => {})[0].items;
    expect(rows.map((row) => row.state)).toEqual([undefined, undefined, undefined, undefined, "on"]);
  });
});
