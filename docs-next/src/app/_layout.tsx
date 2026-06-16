import { Slot } from "expo-router";
import { useState } from "react";
import { Modal, useWindowDimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Pressable, useTheme } from "@olympusoss/canvas";
import { DocsThemeProvider } from "../theme/docs-theme";
import { Sidebar } from "../shell/sidebar";
import { Topbar } from "../shell/topbar";
import { useDocsFonts } from "../ui/fonts";

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
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1024;
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={["top", "bottom"]}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {wide ? (
          <View style={{ width: 240, borderRightWidth: 1, borderColor: tokens.border }}>
            <Sidebar />
          </View>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Topbar showMenu={!wide} onMenu={() => setDrawerOpen(true)} />
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
              style={{ width: 240, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: tokens.card }}
              onPress={() => {}}
            >
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}
