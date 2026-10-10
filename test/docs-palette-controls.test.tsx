import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { ThemeProvider } from "../src/style/theme.tsx";

// The docs' palette controls (docs/src/shell/theme-toggles.tsx): the Blush/Mint segmented
// control the narrow web drawer and the Android menu drawer render, and the Palette
// section of the iOS header menu. The docs theme provider reads the router and Expo's
// launch URL, so its hook is replaced by a plain state object the tests set; the
// controls under test are the real ones.

// The docs app has a separate Expo React installation. Its components must use the test
// renderer's React instance in this harness, just as Metro deduplicates React in the app.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);

type Palette = "blush" | "mint";
const docsTheme = {
  scheme: "light" as "light" | "dark",
  surface: "solid" as "solid" | "glass",
  palette: "blush" as Palette,
  override: null,
  toggleScheme: () => {},
  setScheme: () => {},
  setSurface: () => {},
  setPalette: (_palette: Palette) => {},
};
mock.module(import.meta.resolve("../docs/src/theme/docs-theme.tsx"), () => ({ useDocsTheme: () => docsTheme }));
const { PaletteRow, PaletteToggle, ThemeToggles, paletteMenuSection } = await import("../docs/src/shell/theme-toggles.tsx");

let picked: Palette[] = [];
beforeEach(() => {
  picked = [];
  Object.assign(docsTheme, { scheme: "light", palette: "blush", setPalette: (palette: Palette) => { picked.push(palette); } });
});
afterEach(cleanup);

function show(node: React.ReactNode) {
  return render(<ThemeProvider light solid>{node}</ThemeProvider>);
}

describe("the docs palette control", () => {
  it("offers Blush and Mint in the light scheme, marks the palette in force, and picks the other", () => {
    show(<PaletteToggle />);
    const group = screen.getByRole("tablist", { name: "Palette" });
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Blush", "Mint"]);
    expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual(["true", "false"]);
    fireEvent.click(screen.getByRole("tab", { name: "Mint" }));
    expect(picked).toEqual(["mint"]);
  });

  it("marks Mint when mint is in force", () => {
    docsTheme.palette = "mint";
    show(<PaletteToggle />);
    expect(screen.getByRole("tab", { name: "Mint" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Blush" }).getAttribute("aria-selected")).toBe("false");
  });

  it("renders nothing in the dark scheme, which has one palette", () => {
    docsTheme.scheme = "dark";
    show(<PaletteToggle />);
    expect(screen.queryByRole("tablist", { name: "Palette" })).toBeNull();
  });

  it("titles the Android drawer's footer row Palette", () => {
    show(<PaletteRow />);
    expect(screen.getByText("Palette")).toBeDefined();
    expect(screen.getByRole("tablist", { name: "Palette" })).toBeDefined();
  });

  it("keeps the palette in the labeled toggles in light only, and out of the compact bar form", () => {
    const { unmount } = show(<ThemeToggles />);
    expect(screen.getByRole("tablist", { name: "Palette" })).toBeDefined();
    unmount();

    docsTheme.scheme = "dark";
    const dark = show(<ThemeToggles />);
    expect(screen.queryByRole("tablist", { name: "Palette" })).toBeNull();
    dark.unmount();

    docsTheme.scheme = "light";
    show(<ThemeToggles compact />);
    expect(screen.queryByRole("tablist", { name: "Palette" })).toBeNull();
    expect(screen.getByRole("button", { name: "Toggle color scheme" })).toBeDefined();
  });
});

describe("the iOS header menu's Palette section", () => {
  it("is one inline section of Blush and Mint rows, the palette in force check-marked", () => {
    const sections = paletteMenuSection("light", "blush", (palette) => picked.push(palette));
    expect(sections.map(({ type, label, inline }) => ({ type, label, inline }))).toEqual([{ type: "submenu", label: "Palette", inline: true }]);
    const rows = sections[0].items;
    expect(rows.map(({ type, label, state }) => ({ type, label, state }))).toEqual([
      { type: "action", label: "Blush", state: "on" },
      { type: "action", label: "Mint", state: undefined },
    ]);
    rows[1].onPress();
    rows[0].onPress();
    expect(picked).toEqual(["mint", "blush"]);
  });

  it("moves the check to Mint when mint is in force", () => {
    const rows = paletteMenuSection("light", "mint", () => {})[0].items;
    expect(rows.map((row) => row.state)).toEqual([undefined, "on"]);
  });

  it("leaves the menu in the dark scheme, mint chosen or not", () => {
    expect(paletteMenuSection("dark", "blush", () => {})).toEqual([]);
    expect(paletteMenuSection("dark", "mint", () => {})).toEqual([]);
  });
});
