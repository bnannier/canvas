import { useState } from "react";
import { Platform, Pressable } from "react-native";
import { Stack, usePathname, useRouter, useIsFocused } from "expo-router";
import { Menu } from "lucide-react-native";
import { useTheme } from "@olympusoss/canvas";
import { titleFor } from "./topbar";
import { MOBILE_TABS, NAV_ROUTES } from "../data/nav";
import { TabOverflowMenu } from "./tab-overflow-menu";

// Which tab a route belongs to (the route groups are URL-transparent, so derive it from
// the path). Used to source the section's secondary nav for the native header menu.
function sectionFor(pathname: string): "home" | "components" | "utilities" {
  if (pathname.startsWith("/tokens") || pathname === "/utilities") return "utilities";
  if (pathname.startsWith("/components") || pathname.startsWith("/templates") || pathname.startsWith("/patterns")) return "components";
  return "home";
}

// Per-screen config for the NATIVE iOS/Android navigation bar (a real UINavigationBar,
// Liquid Glass on iOS 26; a Material top app bar on Android). Sets the title from the
// shared map and a section menu holding the secondary nav (the dropped inline pills +
// overflow, merged, so e.g. the Utilities token pages stay reachable). The Components tab
// has no secondary list (its body CatSubBar is the nav), so it gets no menu. Returns null
// on web — the web build keeps its own custom Topbar.
//
// usePathname() is global: a screen sitting BELOW the top of a push stack would otherwise
// re-render with the new top route's path and overwrite its own title (so the native back
// button reads the wrong label). Gating on focus means a backgrounded screen renders null
// and keeps the title it set while focused (expo-router's <Stack.Screen> never reverts).
export function NativeHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { tokens } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  if (Platform.OS === "web" || !isFocused) return null;

  const title = titleFor(pathname).title;
  const tab = MOBILE_TABS.find((t) => t.id === sectionFor(pathname));
  const menuKeys = [...(tab?.topbar?.inline ?? []), ...(tab?.topbar?.overflow ?? [])];
  const hasMenu = menuKeys.length > 0;

  // iOS: a native pull-down UIMenu attached to the nav bar's trailing slot. The trailing
  // items are ALWAYS declared (returning [] when this section has no menu): the native bar
  // merges options across the sibling tab stacks, so a bare omission would leave a previous
  // section's menu showing here, and an explicit [] clears it.
  if (Platform.OS === "ios") {
    const items = menuKeys.map((k) => ({
      type: "action" as const,
      label: NAV_ROUTES[k].label,
      onPress: () => router.push(NAV_ROUTES[k].href as never),
    }));
    return (
      <Stack.Screen
        options={{
          headerTitle: title,
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
          headerRight: hasMenu
            ? () => (
                <Pressable onPress={() => setMenuOpen(true)} hitSlop={8} style={{ paddingHorizontal: 8 }}>
                  <Menu size={22} color={tokens.foreground} />
                </Pressable>
              )
            : () => null,
        }}
      />
      {hasMenu ? <TabOverflowMenu visible={menuOpen} onClose={() => setMenuOpen(false)} routeKeys={menuKeys} /> : null}
    </>
  );
}
