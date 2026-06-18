import { Slot } from "expo-router";
import { useState, useEffect } from "react";
import { Modal, Platform, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Pressable, useTheme } from "@olympusoss/canvas";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { SearchModal } from "./search-modal";
import { GlassAurora } from "../ui/glass";
import { WebScrollbarTheme, SCROLLBAR_W } from "../ui/web-scrollbar";
import { MOBILE_TABS } from "../data/nav";

// The one adaptive navigation component. On the web it is the sidebar + topbar shell;
// on iOS and Android it is a native tab bar (real Liquid Glass on iOS 26, Material 3 on
// Android, native sidebar on tablets via sidebarAdaptable) over the route groups. Screen
// bodies are platform-agnostic; this is the single, user-authorized platform branch,
// scoped to navigation chrome. It dispatches to two skin subcomponents (each owning its
// own hooks) so the rules of hooks hold.
export function Navbar() {
  return Platform.OS === "web" ? <WebNav /> : <NativeNav />;
}

// iOS + Android: the native tab bar, built from nav.config.json's mobile.tabs. Each tab
// maps to a root route group ((home)/(components)/(utilities)) or the search screen. The
// icon names are validated app data, cast through to the SF Symbol / Material props.
function NativeNav() {
  return (
    // NOTE: the iOS 26 system Liquid Glass tab bar ignores every appearance prop
    // (backgroundColor / blurEffect / disableTransparentOnScrollEdge) in
    // react-native-screens 4.25 — verified a red background had no effect. Its glass
    // material is fully system-controlled, so its clarity can't be tuned here.
    <NativeTabs sidebarAdaptable={Platform.OS === "ios"} minimizeBehavior="onScrollDown">
      {MOBILE_TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.id} name={tab.role === "search" ? "search" : `(${tab.id})`} role={tab.role}>
          <NativeTabs.Trigger.Icon sf={tab.icon.ios as never} md={tab.icon.android as never} />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

// Web (every width): the responsive sidebar + glass topbar shell (moved verbatim from
// the previous app/_layout.tsx Shell). Fixed 240px rail on wide viewports, hamburger
// drawer on phones, cmd-K search modal, web scrollbar gutter, aurora wash in glass mode.
function WebNav() {
  const { tokens, surface } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1024;
  const glass = surface === "glass";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Global cmd-K / ctrl-K to toggle search (web only; document/window are web globals).
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
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
          <View style={{ position: "absolute", top: 0, left: 0, right: Platform.OS === "web" ? SCROLLBAR_W : 0, zIndex: 10 }}>
            <Topbar showMenu onMenu={() => (wide ? setCollapsed((c) => !c) : setDrawerOpen(true))} onSearch={() => setSearchOpen(true)} />
          </View>
        </View>
      </View>

      {!wide ? (
        <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
          <Pressable style={{ flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.5)" }} onPress={() => setDrawerOpen(false)}>
            <Pressable style={{ width: 240, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: tokens.card }} onPress={() => {}}>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </SafeAreaView>
  );
}
