import { Slot } from "expo-router";
import { useState } from "react";
import { Modal, useWindowDimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Pressable, useTheme } from "@olympusoss/canvas";
import { DocsThemeProvider } from "../theme/docs-theme";
import { Sidebar } from "../shell/sidebar";
import { Topbar } from "../shell/topbar";

// The whole app renders inside Canvas's own ThemeProvider (via DocsThemeProvider), so
// every component AND the docs chrome are painted by the kit the docs document.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DocsThemeProvider>
        <Shell />
      </DocsThemeProvider>
    </SafeAreaProvider>
  );
}

// Responsive shell: a fixed sidebar rail on wide viewports (desktop web / tablet), a
// hamburger drawer on phones. The content area carries the topbar + the routed screen.
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
          <View style={{ width: 264, borderRightWidth: 1, borderColor: tokens.border }}>
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
            style={{ flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.45)" }}
            onPress={() => setDrawerOpen(false)}
          >
            <Pressable
              style={{ width: 286, maxWidth: "86%", paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: tokens.popover }}
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
