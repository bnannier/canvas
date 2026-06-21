import { useMemo, useState, type ReactNode } from "react";
import { Platform, type NativeSyntheticEvent, type TextInputFocusEventData } from "react-native";
import { Stack, usePathname, useRouter, useIsFocused } from "expo-router";
import { View, Pressable, Icon, useTheme } from "@olympusoss/canvas";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { search } from "../core/data/search";
import { titleFor } from "./topbar";
import { nativeMenuFor, getActiveGroup, getActiveSlug, type MenuLeaf, type MenuGroup } from "../data/nav";
import { TabOverflowMenu } from "./tab-overflow-menu";
import { SearchResults } from "./search-results";

// Wraps a screen's scroller so the native header + its search overlay can sit as a fixed
// sibling (the overlay must not scroll with content). On web this is a no-op passthrough:
// it renders the scroller exactly as before, with NO wrapping View, so the web build stays
// byte-identical (an extra flex wrapper there collapses onLayout-measured tile grids).
export function ScreenFrame({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") return <>{children}</>;
  return (
    <View style={{ flex: 1 }}>
      {children}
      <NativeHeader />
    </View>
  );
}

// Which tab a route belongs to (the route groups are URL-transparent, so derive it from
// the path). Used to source the section's secondary nav for the native header menu.
function sectionFor(pathname: string): "home" | "components" | "utilities" {
  if (pathname.startsWith("/tokens") || pathname === "/utilities") return "utilities";
  if (pathname.startsWith("/components") || pathname.startsWith("/templates") || pathname.startsWith("/patterns")) return "components";
  return "home";
}

// Per-screen config for the NATIVE iOS/Android navigation bar (a real UINavigationBar,
// Liquid Glass on iOS 26; a Material top app bar on Android). It sets the title, an
// integrated search field, and a section menu, then renders the search results as a
// fixed overlay while a query is active. Returns null on web, where the build keeps its
// own custom Topbar + cmd-K modal.
//
// MUST render as a sibling of (not inside) each screen's scroller, so the results overlay
// covers the content instead of scrolling with it. The native nav bar (with the search
// field) draws above this RN content, so the overlay starts just below it and the field
// stays usable.
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
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);
  if (Platform.OS === "web" || !isFocused) return null;

  const title = titleFor(pathname).title;
  const model = nativeMenuFor(sectionFor(pathname));
  const hasMenu = model.kind === "flat" ? model.items.length > 0 : model.groups.length > 0;
  // Where we are now: the current page's category + slug, so the menu reopens reflecting it
  // instead of restarting at the base category list.
  const activeGroup = getActiveGroup(pathname);
  const activeSlug = getActiveSlug(pathname);

  // The native integrated search field (in the nav bar on iOS 26). placement is iOS-only;
  // Android renders its own Material search field with the default placement.
  const searchOptions = {
    headerSearchBarOptions: {
      ...(Platform.OS === "ios" ? { placement: "integrated" as const } : {}),
      placeholder: "Search components...",
      hideWhenScrolling: false,
      onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => setQuery(e.nativeEvent.text),
      onCancelButtonPress: () => setQuery(""),
    },
  };

  // The results, shown over the page while typing. Positioned below the search field; the
  // native nav bar renders on top, so the field and its cancel button stay interactive.
  const overlay = query ? (
    <View style={{ position: "absolute", top: insets.top + 52, left: 0, right: 0, bottom: 0, backgroundColor: tokens.background }}>
      <SearchResults
        query={query}
        results={results}
        selectedIndex={-1}
        onSelect={(path) => {
          setQuery("");
          router.push(path as never);
        }}
        style={{ flex: 1 }}
      />
    </View>
  ) : null;

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
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: title,
            ...searchOptions,
            unstable_headerRightItems: () =>
              hasMenu
                ? [
                    {
                      type: "menu" as const,
                      label: "Menu",
                      icon: { type: "sfSymbol", name: "line.3.horizontal" } as const,
                      menu: { items },
                    },
                  ]
                : [],
          }}
        />
        {overlay}
      </>
    );
  }

  // Android: a Material header whose trailing hamburger opens the shared overflow sheet
  // (the full merged section list, since the inline pill row is gone here too). headerRight
  // is always declared (a no-op node when there is no menu) for the same clear-on-switch
  // reason as the iOS trailing items.
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: title,
          ...searchOptions,
          headerRight: hasMenu
            ? () => (
                <Pressable onPress={() => setMenuOpen(true)} hitSlop={8} style={{ paddingHorizontal: 8 }}>
                  <Icon menu size={22} />
                </Pressable>
              )
            : () => null,
        }}
      />
      {hasMenu ? <TabOverflowMenu visible={menuOpen} onClose={() => setMenuOpen(false)} menu={model} activeGroup={activeGroup} activeSlug={activeSlug} /> : null}
      {overlay}
    </>
  );
}
