import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { alpha } from "../src/style/color.ts";
import { shadow } from "../src/style/index.ts";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import * as dropdownSkins from "../src/atoms/dropdown/dropdown.styles.ts";
import * as rowMenuSkins from "../src/organisms/row-menu/row-menu.styles.ts";
import { menuDetail, menuPanel, menuRow, menuRowHover, menuRowLabel, menuSection, menuSeparator, MENU_ICON, MENU_ROW_GAP } from "../src/style/menu-look.ts";
import { View } from "react-native";

// The web Dropdown and RowMenu take the v4 hand-off's menu through one recipe
// (src/style/menu-look.ts): its panel, rows, eyebrow, shortcut, rule and washes; each keeps
// its renderer's row height, glyph gap and standoff. iOS and Android keep their platform menus.

afterEach(cleanup);

const t = lightColors;
const flat = (value: string) => value.replace(/\s/g, "");
const rgbaOf = (hex: string) => flat(alpha(hex, 1)).replace(/,1\)$/, ",1.00)");
const ITEMS = [
  { label: "Rename", icon: "pencil" as const },
  { label: "Archive", disabled: true },
  { label: "Delete", destructive: true, separatorBefore: true },
];

describe("the v4 menu on the web", () => {
  it("gives the Dropdown and the RowMenu one recipe", () => {
    for (const s of [dropdownSkins.webSkin, rowMenuSkins.webSkin]) {
      expect(s.menuCard(t)).toEqual(menuPanel(t));
      expect(s.menuLabel(t)).toEqual(menuSection(t));
      expect(s.separator?.(t)).toEqual(menuSeparator(t));
      expect(s.itemHover).toBe(menuRowHover);
      expect(s.itemRow).toMatchObject(menuRow);
      expect([s.iconSize, s.rowGap]).toEqual([MENU_ICON, MENU_ROW_GAP]);
    }
    expect(dropdownSkins.webSkin.itemTextType).toEqual(menuRowLabel);
    expect(rowMenuSkins.webSkin.rowTextSize).toEqual(menuRowLabel);
    expect(dropdownSkins.webSkin.shortcut(t)).toEqual(menuDetail(t));
  });

  it("draws the v4 hand-off's menu for the web Dropdown (its `dropdown` renderer)", () => {
    const s = dropdownSkins.webSkin;
    // The panel: K.panel, sf on the ln hairline at the menu corner, the md shade, inset 4.
    expect(s.menuCard(t)).toMatchObject({ borderRadius: 16, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, padding: 4, boxShadow: shadow("md", t).boxShadow });
    // The rows: 36 tall (30 compact), inset 10, gap 10, at 8, 400 14 labels, 15px tx3 glyphs.
    expect(s.itemRow).toMatchObject({ minHeight: 36, paddingHorizontal: 10, gap: 10, borderRadius: 8 });
    expect(s.reference?.row).toEqual({ minHeight: 30 });
    expect(s.itemTextType).toEqual({ fontSize: 14, lineHeight: 18, fontWeight: "400" });
    expect([s.iconSize, s.iconColor?.(t)]).toEqual([15, t["subtle-foreground"]]);
    // The mono eyebrow, the mono shortcut, the inset rule, the sf3 hover.
    expect(s.menuLabel(t)).toMatchObject({ fontSize: 11, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase", paddingTop: 6, paddingHorizontal: 10, paddingBottom: 4, color: t["subtle-foreground"] });
    expect(s.shortcut(t)).toMatchObject({ fontSize: 11, fontWeight: "400", color: t["subtle-foreground"] });
    expect(s.separator?.(t)).toEqual({ height: 1, marginTop: 4, marginBottom: 4, marginHorizontal: 6, backgroundColor: t.border });
    expect(s.itemHover?.(t)).toEqual({ backgroundColor: t.secondary });
    // 6 below the trigger, the rows touching.
    expect([s.menuGap, s.rowGap]).toEqual([6, 0]);
  });

  it("draws the v4 hand-off's row menu on the web (its `row-menu` renderer)", () => {
    const s = rowMenuSkins.webSkin;
    // The trigger: a 32px square at 8 on the 1px ln2 edge, a 16px glyph in tx, sf3 while open.
    expect(s.trigger).toMatchObject({ width: 32, height: 32, borderWidth: 1, borderRadius: 8 });
    expect(s.triggerEdge?.(t)).toEqual({ borderColor: t["field-border"] });
    expect(s.triggerOpen?.(t)).toEqual({ backgroundColor: t.secondary });
    expect([s.triggerIconSize, s.triggerIconColor(t)]).toEqual([16, t.foreground]);
    // The panel: sf on the ln hairline, inset 4, the md shade, 220 wide, 8 below the trigger.
    expect(s.menuCard(t)).toMatchObject({ borderWidth: 1, borderColor: t.border, backgroundColor: t.card, padding: 4, boxShadow: shadow("md", t).boxShadow });
    expect([s.menuMinWidth, s.menuGap, s.rowGap]).toEqual([220, 8, 0]);
    // The rows: 34 tall at 8, inset 10, a 15px tx3 glyph 8 from a 400 14px label.
    expect(s.itemRow).toMatchObject({ minHeight: 34, paddingHorizontal: 10, gap: 8, borderRadius: 8 });
    expect(s.rowTextSize).toEqual({ fontSize: 14, lineHeight: 18, fontWeight: "400" });
    expect([s.iconSize, s.iconColor?.(t)]).toEqual([15, t["subtle-foreground"]]);
  });

  it("draws the hand-off's panel and rows (K.panel and its menu rows)", () => {
    // K.panel: sf on the ln hairline at the menu corner (16), the md shade, inset 4.
    expect(menuPanel(t)).toEqual({ borderRadius: 16, padding: 4, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, ...shadow("md", t) });
    // The Popover's compact card draws the hairline as an outside ring instead.
    expect(menuPanel(t, true)).toMatchObject({ borderWidth: 0, boxShadow: `${shadow("md", t).boxShadow}, 0 0 0 1px ${t.border}` });
    expect(menuRow).toEqual({ flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10 });
    expect(menuRowLabel).toEqual({ fontSize: 14, lineHeight: 18, fontWeight: "400" });
    expect(menuSection(t)).toMatchObject({ fontSize: 11, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase", color: t["subtle-foreground"] });
    expect(menuDetail(t)).toMatchObject({ fontSize: 11, fontWeight: "400", color: t["subtle-foreground"] });
    expect(menuSeparator(t)).toEqual({ height: 1, marginTop: 4, marginBottom: 4, marginHorizontal: 6, backgroundColor: t.border });
    expect([MENU_ICON, MENU_ROW_GAP]).toEqual([15, 0]);
  });

  it("washes a resting Dropdown row at once on hover, never a disabled one, and mutes a disabled row instead of dimming it", () => {
    render(<ThemeProvider light solid><Dropdown trigger="Actions" items={ITEMS} /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const [rename, archive] = screen.getAllByRole("menuitem");
    const sf3 = rgbaOf(t.secondary);
    expect(rename.style.getPropertyValue("transition-property")).toBe("");
    fireEvent.pointerEnter(rename, { pointerType: "mouse" });
    expect(flat(rename.style.backgroundColor)).toBe(sf3);
    fireEvent.pointerLeave(rename);
    expect(flat(rename.style.backgroundColor)).not.toBe(sf3);
    fireEvent.pointerEnter(archive, { pointerType: "mouse" });
    expect(flat(archive.style.backgroundColor)).not.toBe(sf3);
    expect(archive.style.opacity).toBe("");
    const label = screen.getByText("Archive");
    expect(flat(label.style.color)).toBe(rgbaOf(t["muted-foreground"]));
  });

  it("gives the RowMenu the same hover wash on its rows, and the hand-off's edged icon button as its trigger", () => {
    render(<ThemeProvider light solid><RowMenu items={ITEMS} /></ThemeProvider>);
    const trigger = screen.getByRole("button", { name: "More options" });
    expect(trigger.style.width).toBe("32px");
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    expect(flat(trigger.style.backgroundColor)).toBe(rgbaOf(t.secondary));
    fireEvent.click(trigger);
    const [rename, archive] = screen.getAllByRole("menuitem");
    fireEvent.pointerEnter(rename, { pointerType: "mouse" });
    expect(flat(rename.style.backgroundColor)).toBe(rgbaOf(t.secondary));
    expect(archive.style.opacity).toBe("");
  });
});

describe("the hover wash", () => {
  it("is the `secondary` fill, the hand-off's sf3 active row", () => {
    expect(menuRowHover(t)).toEqual({ backgroundColor: t.secondary });
  });
});

describe("the platform menus", () => {
  it("keep their own look on iOS and Android: no hover wash, the platform's dim on a disabled row", () => {
    for (const skins of [dropdownSkins, rowMenuSkins]) {
      expect(skins.iosSkin.itemHover).toBeNull();
      expect(skins.androidSkin.itemHover).toBeNull();
      expect(skins.iosSkin.disabledRow).toEqual({ opacity: 0.4, muted: false });
      expect(skins.androidSkin.disabledRow).toEqual({ opacity: 0.38, muted: false });
      expect(skins.webSkin.disabledRow).toEqual({ opacity: 1, muted: true });
    }
    expect(rowMenuSkins.iosSkin.triggerHover).toBeNull();
    expect(rowMenuSkins.androidSkin.triggerHover).toBeNull();
    // The two iOS menus share the kit's iOS menu corner.
    expect(rowMenuSkins.iosSkin.menuCard(t).borderRadius).toBe(dropdownSkins.iosSkin.menuCard(t).borderRadius);
  });

  it("keeps the RowMenu trigger its own size in any parent, with no static alignSelf in any skin", () => {
    for (const skin of [rowMenuSkins.webSkin, rowMenuSkins.iosSkin, rowMenuSkins.androidSkin]) {
      expect(skin.anchor).toEqual({ position: "relative", alignItems: "flex-start" });
    }
    // Inside a plain View (a stretching parent that is not a kit layout container, like a
    // table cell) the anchor may stretch, but it starts the trigger, so the trigger and
    // its hover target keep the 32px box.
    render(<ThemeProvider light solid><View style={{ width: 300 }}><RowMenu items={ITEMS} testID="menu" /></View></ThemeProvider>);
    const root = screen.getByTestId("menu");
    expect(root.style.alignItems).toBe("flex-start");
    expect(root.style.alignSelf).toBe("");
    const trigger = screen.getByRole("button", { name: "More options" });
    expect(trigger.style.width).toBe("32px");
    expect(trigger.parentElement).not.toBe(root.parentElement);
  });
});
