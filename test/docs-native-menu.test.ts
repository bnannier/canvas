import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, renderHook } from "@testing-library/react";
import * as React from "react";

// The docs' iOS header menu (docs/src/shell/native-menu.ts) carries two check marks at
// once: the page you are on and, in the light scheme, the palette in force. This follows
// the menu the way the app ships it: through expo-router's own header config (the real
// useHeaderConfigProps, which turns a header item's menu into react-native-screens' bar
// button config) and react-native-screens' own prepareHeaderBarButtonItems (the dicts
// RNSBarButtonItem.mm builds its UIMenu and UIActions from), and then holds the result to
// UIKit's single-selection rule.
//
// That rule, as react-native-screens states it beside its own menu builder
// (ios/gamma/stack/header/RNSStackHeaderMenuCoordinator.mm, "when singleSelection is set
// somewhere in the parent *chain*, only one toggle in the whole hierarchy can be turned on
// at any point in time", with an assert against a second initial "on" in one hierarchy):
// a menu with UIMenuOptionsSingleSelection and no single-selection ancestor is a group,
// and the whole tree under it, inline sections included, holds at most one element "on".
// Two "on" in one group is a menu UIKit cannot show as given; on device it kept the first
// (the current page) and the palette never showed its check.

// The docs app has a separate Expo React installation. Its modules must use the test
// renderer's React instance in this harness, just as Metro deduplicates React in the app.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);

// theme-toggles reads the docs theme, whose provider reads the router; the menu builder
// takes the theme as arguments, so the hook only needs to exist.
mock.module(import.meta.resolve("../docs/src/theme/docs-theme.tsx"), () => ({ useDocsTheme: () => ({}) }));

// expo-router's header config is a plain function apart from its two navigation hooks
// (the locale and the theme), which it reads from context. Supply them, and stub what it
// only renders into the header's children: react-native-screens' header subviews and the
// navigation elements. `FontProcessor.js` is the web build (it throws); the native one
// resolves the font families, which these items do not use.
const header = "../docs/node_modules/expo-router/build/react-navigation";
mock.module(import.meta.resolve(`${header}/native/index.js`), () => ({
  useLocale: () => ({ direction: "ltr" }),
  useTheme: () => ({
    dark: false,
    colors: { primary: "#000", text: "#000", card: "#fff", notification: "#f00" },
    fonts: { regular: {}, medium: {}, bold: {}, heavy: {} },
  }),
}));
mock.module(import.meta.resolve(`${header}/elements/index.js`), () => ({
  getHeaderTitle: (options: { title?: string }, name: string) => options.title ?? name,
  HeaderTitle: () => null,
}));
mock.module(import.meta.resolve(`${header}/native-stack/views/FontProcessor.js`), () => ({
  processFonts: (families: (string | undefined)[]) => families,
}));
const Subview = () => null;
mock.module(import.meta.resolve("../docs/node_modules/react-native-screens/lib/commonjs/index.js"), () => ({
  ScreenStackHeaderLeftView: Subview,
  ScreenStackHeaderRightView: Subview,
  ScreenStackHeaderCenterView: Subview,
  ScreenStackHeaderBackButtonImage: Subview,
  ScreenStackHeaderSearchBarView: Subview,
  SearchBar: Subview,
  isSearchBarAvailableForCurrentPlatform: false,
}));

const { useHeaderConfigProps } = await import(`${header}/native-stack/views/useHeaderConfigProps.js`);
const { prepareHeaderBarButtonItems } = await import("../docs/node_modules/react-native-screens/src/components/helpers/prepareHeaderBarButtonItems.ts");
const { nativeHeaderMenu } = await import("../docs/src/shell/native-menu.ts");
const { nativeMenuFor, sectionFor, getActiveGroup, getActiveSlug } = await import("../docs/src/data/nav.ts");

type Palette = "blush" | "mint";

/** The header menu NativeHeader declares on `pathname`, in `scheme` with `palette` in force. */
function headerMenu(pathname: string, scheme: "light" | "dark", palette: Palette, picked: Palette[] = []) {
  return nativeHeaderMenu({
    nodes: nativeMenuFor(sectionFor(pathname), getActiveGroup(pathname)),
    activeSlug: getActiveSlug(pathname),
    scheme,
    palette,
    setPalette: (p) => picked.push(p),
    navigate: () => {},
  });
}

/** One element of the UIMenu RNSBarButtonItem builds: an action (it carries a menuId) or a menu. */
interface MenuDict {
  title?: string;
  menuId?: string;
  state?: "on" | "off" | "mixed";
  singleSelection?: boolean;
  displayInline?: boolean;
  items?: MenuDict[];
}

/** The menu dict the native header receives for the trailing Menu item, built as the app builds it. */
function nativeMenuDict(menu: ReturnType<typeof headerMenu>): MenuDict {
  const { result } = renderHook(() =>
    useHeaderConfigProps({
      route: { key: "page", name: "page" },
      headerTitle: "Page",
      unstable_headerRightItems: () => [{ type: "menu", label: "Menu", icon: { type: "sfSymbol", name: "line.3.horizontal" }, menu }],
    }),
  );
  const [item] = prepareHeaderBarButtonItems(result.current.headerRightBarButtonItems, "right");
  return (item as unknown as { menu: MenuDict }).menu;
}

/** The titles of the actions in `menu`'s whole tree that are "on". */
function checked(menu: MenuDict): string[] {
  return (menu.items ?? []).flatMap((el) => (el.menuId != null ? (el.state === "on" ? [el.title!] : []) : checked(el)));
}

/** Every single-selection group in the tree: a single-selection menu with no single-selection ancestor. */
function selectionGroups(menu: MenuDict, path = "Menu", inGroup = false): { path: string; checked: string[] }[] {
  const opens = !inGroup && menu.singleSelection === true;
  const own = opens ? [{ path, checked: checked(menu) }] : [];
  const nested = (menu.items ?? []).filter((el) => el.menuId == null).flatMap((el) => selectionGroups(el, `${path} > ${el.title}`, inGroup || opens));
  return [...own, ...nested];
}

afterEach(cleanup);

describe("the docs' iOS header menu", () => {
  it("shows both the current page and the palette in force as checked, each in a group of its own", () => {
    for (const palette of ["blush", "mint"] as const) {
      const menu = nativeMenuDict(headerMenu("/components/chip", "light", palette));
      const label = palette === "mint" ? "Mint" : "Blush";
      expect(checked(menu)).toEqual(["Chip", label]);
      // No group asks UIKit to show two checks: the page's category and the Palette
      // section each hold their own one.
      const groups = selectionGroups(menu);
      for (const group of groups) expect(group.checked.length).toBeLessThanOrEqual(1);
      expect(groups.find((g) => g.path === "Menu > Palette")?.checked).toEqual([label]);
      expect(groups.find((g) => g.path === "Menu > Atoms")?.checked).toEqual(["Chip"]);
    }
  });

  it("is no single-selection group at its root, since the page and the palette are independent", () => {
    const menu = nativeMenuDict(headerMenu("/components/chip", "light", "mint"));
    expect(menu.singleSelection).toBe(false);
    // Each section stays a single-selection group, as the HIG marks the one choice of several.
    const palette = menu.items!.find((el) => el.title === "Palette")!;
    expect(palette).toMatchObject({ displayInline: true, singleSelection: true });
    expect(palette.items!.map((row) => [row.title, row.state])).toEqual([["Blush", undefined], ["Mint", "on"]]);
  });

  it("keeps the palette's check on every section's menu", () => {
    for (const pathname of ["/components/button", "/about", "/tokens/colors"]) {
      const menu = nativeMenuDict(headerMenu(pathname, "light", "mint"));
      expect(checked(menu)).toContain("Mint");
      for (const group of selectionGroups(menu)) expect(group.checked.length).toBeLessThanOrEqual(1);
    }
  });

  it("picks the palette from its rows and drops the section in the dark scheme", () => {
    const picked: Palette[] = [];
    const menu = headerMenu("/components/chip", "light", "blush", picked);
    const section = menu.items.find((el) => el.label === "Palette");
    if (section?.type !== "submenu") throw new Error("no Palette section in the light scheme");
    for (const row of section.items) if (row.type === "action") row.onPress();
    expect(picked).toEqual(["blush", "mint"]);
    expect(headerMenu("/components/chip", "dark", "mint").items.some((el) => el.label === "Palette")).toBe(false);
  });
});
