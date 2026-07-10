import { useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { Stack, usePathname, useRouter, useIsFocused } from "expo-router";
import { View, Pressable, Icon, useTheme, liquidGlassAvailable } from "@olympusoss/canvas";
import { titleFor } from "./topbar";
import { nativeMenuFor, sectionFor, getActiveGroup, getActiveSlug, type MenuLeaf, type MenuGroup } from "../data/nav";
import { TabOverflowMenu } from "./tab-overflow-menu";
import { ThemeToggles } from "./theme-toggles";
import { useDocsTheme } from "../theme/docs-theme";
import { Cosmos } from "../brand/cosmos";

// Wraps a screen's scroller so the native header (which drives the per-screen Stack title +
// menu, and hosts the Android overflow sheet) can sit as a sibling of the content. On web
// this is a no-op passthrough: it renders the scroller exactly as before, with NO wrapping
// View, so the web build stays byte-identical (an extra flex wrapper there collapses
// onLayout-measured tile grids). On native it also mounts the Canvas Universe backdrop
// behind the (transparent-in-glass) scroller, the native counterpart of the web shell's
// Cosmos mount.
export function ScreenFrame({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") return <>{children}</>;
  return (
    <View style={{ flex: 1 }}>
      <ScreenCosmos />
      {children}
      <NativeHeader />
    </View>
  );
}

// The per-screen native cosmos, glass-gated like the web mount. It renders even on
// unfocused screens: the singleton clock keeps every mounted sky phase-identical, and
// the composition is the same on every screen, so the flight a navigation or
// back-swipe reveals is pixel-continuous with the one you left.
function ScreenCosmos() {
  const { surface } = useTheme();
  if (surface !== "glass") return null;
  return <Cosmos />;
}

// Per-screen config for the NATIVE iOS/Android navigation bar (a real UINavigationBar,
// Liquid Glass on iOS 26; a Material top app bar on Android). It sets the title and the
// section menu. Search is NOT here: it lives in the bottom tab bar (the rightmost Search
// tab opens the full-screen search screen). Returns null on web, where the build keeps
// its own custom Topbar + cmd-K modal.
//
// MUST render as a sibling of (not inside) each screen's scroller (a no-op passthrough on
// web), so it can drive the per-screen Stack header options without wrapping the scroller.
//
// The menu is the section's secondary nav (the dropped inline pills + overflow, merged,
// so e.g. the Utilities token pages stay reachable). Components has no menu (its body
// CatSubBar is the nav). usePathname() is global, so gating on focus keeps a backgrounded
// push screen from overwriting its own title (the native back button reads the right
// label) and stops its overlay from showing under the active screen.
export function NativeHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [menuOpen, setMenuOpen] = useState(false);
  const { override, surface, setScheme, setSurface } = useDocsTheme();
  if (Platform.OS === "web" || !isFocused) return null;

  const title = titleFor(pathname).title;
  const model = nativeMenuFor(sectionFor(pathname));
  const hasMenu = model.kind === "flat" ? model.items.length > 0 : model.groups.length > 0;
  // Where we are now: the current page's category + slug, so the menu reopens reflecting it
  // instead of restarting at the base category list.
  const activeGroup = getActiveGroup(pathname);
  const activeSlug = getActiveSlug(pathname);

  // iOS: a native pull-down UIMenu in the trailing slot. Flat sections (Home/Utilities) are
  // action rows; Components is a list of category SUBMENUS, each holding its component pages,
  // so iOS slides over to the category's items natively. The current page is check-marked
  // (state "on"), and on a component page its category is surfaced FIRST as an inline section
  // (the native menu can't reopen pre-drilled into a submenu, so this reflects where you are);
  // the remaining categories stay as drill-in submenus. The trailing items are ALWAYS declared
  // (returning [] when this section has no menu): the native bar merges options across the
  // sibling tab stacks, so a bare omission would leave a previous section's menu showing here,
  // and an explicit [] clears it.
  if (Platform.OS === "ios") {
    const action = (leaf: MenuLeaf) => ({
      type: "action" as const,
      label: leaf.label,
      onPress: () => router.push(leaf.href as never),
      ...(leaf.slug === activeSlug ? { state: "on" as const } : {}),
    });
    const submenu = (g: MenuGroup) => ({ type: "submenu" as const, label: g.label, items: g.items.map(action) });
    const current = model.kind === "groups" && activeGroup ? model.groups.find((g) => g.label === activeGroup) : undefined;
    const items =
      model.kind === "flat"
        ? model.items.map(action)
        : [
            ...(current ? [{ type: "submenu" as const, label: current.label, inline: true, items: current.items.map(action) }] : []),
            ...model.groups.filter((g) => g !== current).map(submenu),
          ];
    // The Appearance submenu (web-toggle parity as native UIMenu rows): Light/Dark/System
    // with a check on the active choice, plus Solid/Frost only where glass is opt-in
    // (on iOS 26 the platform default is already glass, matching the OS).
    const schemeRow = (label: string, value: "light" | "dark" | null) => ({
      type: "action" as const,
      label,
      onPress: () => setScheme(value),
      ...(override === value ? { state: "on" as const } : {}),
    });
    const appearance = {
      type: "submenu" as const,
      label: "Appearance",
      icon: { type: "sfSymbol", name: "circle.lefthalf.filled" } as const,
      items: [
        schemeRow("Light", "light"),
        schemeRow("Dark", "dark"),
        schemeRow("System", null),
        ...(!liquidGlassAvailable()
          ? [
              {
                type: "action" as const,
                label: "Solid",
                onPress: () => setSurface("solid"),
                ...(surface === "solid" ? { state: "on" as const } : {}),
              },
              {
                type: "action" as const,
                label: "Frost",
                onPress: () => setSurface("glass"),
                ...(surface === "glass" ? { state: "on" as const } : {}),
              },
            ]
          : []),
      ],
    };
    return (
      <Stack.Screen
        options={{
          headerTitle: title,
          // The menu is always present now: section items when this section has them,
          // and the Appearance submenu on every screen.
          unstable_headerRightItems: () => [
            {
              type: "menu" as const,
              label: "Menu",
              icon: { type: "sfSymbol", name: "line.3.horizontal" } as const,
              menu: { items: [...items, appearance] },
            },
          ],
        }}
      />
    );
  }

  // Android: a Material header whose trailing hamburger opens the shared overflow sheet
  // (the full merged section list, plus the ThemeToggles footer for web parity). The
  // hamburger and sheet are always present now: even a section with no menu items still
  // offers the Appearance controls in the footer.
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: title,
          headerRight: () => (
            <Pressable onPress={() => setMenuOpen(true)} hitSlop={8} style={{ paddingHorizontal: 8 }}>
              <Icon menu size={22} />
            </Pressable>
          ),
        }}
      />
      <TabOverflowMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        menu={model}
        activeGroup={activeGroup}
        activeSlug={activeSlug}
        footer={<ThemeToggles />}
      />
    </>
  );
}
