import type { MenuNode } from "../data/nav";
import { paletteMenuSection, type Palette } from "./theme-toggles";

// The iOS header's trailing UIMenu, as data: the section's site map with the current page
// check-marked, then (in the light scheme) the Palette section with the palette in force
// check-marked. NativeHeader hands it to expo-router's `unstable_headerRightItems`, which
// react-native-screens turns into a native UIMenu; it lives apart from the header so its
// selection groups can be tested without the native stack.
//
// The menu holds TWO independent check marks, the page you are on and the palette in
// force, so its root is declared `multiselectable`. expo-router marks every menu it is
// handed as single-selection unless told otherwise (its header config sets
// `singleSelection: !multiselectable` on the root menu and on every submenu), and UIKit
// applies a single-selection menu's rule to the whole tree under it, its inline sections
// included: one element "on" in all of it. With the root single-selection, the current
// page and the palette were one group, so UIKit kept the first check (the page, in the
// inline category section) and dropped the palette's. Declaring the root multiselectable
// leaves each section its own single-selection group: a category holds the current page,
// the Palette section holds the one palette in force, as the HIG marks the one choice of
// several.

/** A native menu-item image: a bundled template PNG (its Metro module id) iOS tints to the label color. */
export type MenuIcon = { type: "image"; source: number; tinted: true };

/** One element of the header's UIMenu, in the shape expo-router's header items take. */
export type NativeMenuItem =
  | { type: "action"; label: string; icon?: MenuIcon; onPress: () => void; state?: "on" }
  | { type: "submenu"; label: string; icon?: MenuIcon; inline?: boolean; items: NativeMenuItem[] };

/** The header's trailing menu: two independent selections, so the root is multiselectable. */
export interface NativeHeaderMenu {
  multiselectable: true;
  items: NativeMenuItem[];
}

export interface NativeHeaderMenuOptions {
  /** The section's menu tree (`nativeMenuFor`). */
  nodes: MenuNode[];
  /** The current page's slug (`getActiveSlug`); its row is check-marked. */
  activeSlug: string;
  scheme: "light" | "dark";
  palette: Palette;
  setPalette: (palette: Palette) => void;
  /** Opens a page row's route. */
  navigate: (href: string) => void;
  /** The row image for a glyph key, or undefined for none. */
  icon?: (glyph: string) => MenuIcon | undefined;
}

/**
 * The iOS header menu: the menu tree mapped to native UIMenu items (a leaf becomes an
 * action, check-marked when it is the current page; a submenu becomes a native submenu
 * that slides over, nested arbitrarily deep), followed by the Palette section in the
 * light scheme.
 */
export function nativeHeaderMenu({ nodes, activeSlug, scheme, palette, setPalette, navigate, icon }: NativeHeaderMenuOptions): NativeHeaderMenu {
  const toItems = (ns: MenuNode[]): NativeMenuItem[] =>
    ns.map((n): NativeMenuItem =>
      n.kind === "leaf"
        ? { type: "action", label: n.label, icon: icon?.(n.icon), onPress: () => navigate(n.href), ...(n.slug === activeSlug ? { state: "on" as const } : {}) }
        : { type: "submenu", label: n.label, icon: icon?.(n.icon), ...(n.inline ? { inline: true as const } : {}), items: toItems(n.items) },
    );
  return { multiselectable: true, items: [...toItems(nodes), ...paletteMenuSection(scheme, palette, setPalette)] };
}
