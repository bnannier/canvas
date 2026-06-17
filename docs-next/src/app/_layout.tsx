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
import { GlassAurora, webFrost } from "../ui/glass";

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={["top", "bottom"]}>
      {glass ? <GlassAurora /> : null}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {wide ? (
          <View style={{ width: collapsed ? 56 : 240, borderRightWidth: 1, borderColor: tokens.border }}>
            <Sidebar collapsed={collapsed} collapsible onToggleCollapse={() => setCollapsed((c) => !c)} />
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Topbar showMenu onMenu={() => (wide ? setCollapsed((c) => !c) : setDrawerOpen(true))} onSearch={() => setSearchOpen(true)} />
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
        </View>
      </View>

      {!wide ? (
        <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
          <Pressable
            style={{ flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setDrawerOpen(false)}
          >
            <Pressable
              style={[{ width: 240, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: glass ? tokens.popover : tokens.card }, webFrost(glass)]}
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
