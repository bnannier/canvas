import { Slot } from "expo-router";
import { useState, useEffect } from "react";
import { Modal, Platform, useWindowDimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Pressable, useTheme } from "@olympusoss/canvas";
import { DocsThemeProvider } from "../theme/docs-theme";
import { Sidebar } from "../shell/sidebar";
import { Topbar } from "../shell/topbar";
import { SearchModal } from "../shell/search-modal";
import { useDocsFonts } from "../ui/fonts";
import { GlassAurora } from "../ui/glass";
import { WebScrollbarTheme, SCROLLBAR_W } from "../ui/web-scrollbar";

// The whole app renders inside Canvas's ThemeProvider (via DocsThemeProvider), so the
// components AND the docs chrome are painted by the kit, and once the Geist faces load
// the typography matches the original site on every platform.
export default function RootLayout() {
  const [fontsLoaded] = useDocsFonts();
  return (
    <SafeAreaProvider>
      <DocsThemeProvider>{fontsLoaded ? <Shell /> : null}</DocsThemeProvider>
    </SafeAreaProvider>
  );
}

// Responsive shell mirroring the Vite docs: a fixed 240px sidebar rail on wide
// viewports (desktop web / tablet), a hamburger drawer on phones, the topbar + routed
// content in the main column.
function Shell() {
  const { tokens, surface } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1024;
  const glass = surface === "glass";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Desktop sidebar collapse (Vite parity): the topbar hamburger toggles it on wide
  // viewports, the sidebar chevron collapses it, and the rail shrinks to an icon strip.
  const [collapsed, setCollapsed] = useState(false);

  // Global cmd-K / ctrl-K to toggle search, web only (the soft keyboard on native has
  // no such shortcut and document/window are web-only globals).
  useEffect(() => {
    if (Platform.OS !== "web") return;
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Top edge only: the content scrolls edge-to-edge to the bottom of the screen
  // (under the home indicator) rather than stopping above it. Each content scroller
  // adds the bottom safe-area inset to its own padding so the last row clears it.
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={["top"]}>
      <WebScrollbarTheme />
      {glass ? <GlassAurora /> : null}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {wide ? (
          <View style={{ width: collapsed ? 56 : 240, borderRightWidth: 1, borderColor: tokens.border }}>
            <Sidebar collapsed={collapsed} collapsible onToggleCollapse={() => setCollapsed((c) => !c)} />
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* Content fills the column and scrolls BEHIND the topbar, which overlays
              the top as a glass bar (each page scroll insets its top by TOPBAR_HEIGHT
              so its first row clears the bar). This is what lets the navbar frost
              refract live content, matching the Vite chrome. */}
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
          {/* On web the content scroller reserves a SCROLLBAR_W gutter on its right;
              inset the bar by that so the scrollbar sits in the gutter BESIDE it (visible
              from the top), like the Vite docs, instead of being covered by the bar.
              Native has no persistent scrollbar, so no inset there. */}
          <View style={{ position: "absolute", top: 0, left: 0, right: Platform.OS === "web" ? SCROLLBAR_W : 0, zIndex: 10 }}>
            <Topbar showMenu onMenu={() => (wide ? setCollapsed((c) => !c) : setDrawerOpen(true))} onSearch={() => setSearchOpen(true)} />
          </View>
        </View>
      </View>

      {!wide ? (
        <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
          <Pressable
            style={{ flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setDrawerOpen(false)}
          >
            {/* The Sidebar is itself a GlassSurface, so it provides the glass/frost;
                this panel just sizes it and catches taps. Solid card fills the safe-
                area insets above/below the frosted body. */}
            <Pressable
              style={{ width: 240, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: tokens.card }}
              onPress={() => {}}
            >
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </SafeAreaView>
  );
}
