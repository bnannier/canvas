import { Slot, usePathname, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Icon, TabBar, useTheme, type IconProps } from "@olympusoss/canvas";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { SearchModal } from "./search-modal";
import { TabOverflowMenu } from "./tab-overflow-menu";
import { GlassAurora } from "../ui/glass";
import { WebScrollbarTheme, SCROLLBAR_W } from "../ui/web-scrollbar";
import { MOBILE_TABS, nativeMenuFor, sectionFor, getActiveGroup, getActiveSlug } from "../data/nav";

// The one adaptive navigation component. On the web it is the sidebar + topbar shell at
// desktop widths, and a mobile iOS-style shell (bottom tab bar + nav bar + category
// drill-down) at narrow widths; on iOS and Android it is a native tab bar (real Liquid
// Glass on iOS 26, Material 3 on Android, native sidebar on tablets via sidebarAdaptable)
// over the route groups. Screen bodies are platform-agnostic; this is the single,
// user-authorized platform branch, scoped to navigation chrome.
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

// The mobile-web bottom tab sections (the web counterpart of mobile.tabs): a kit Icon glyph
// + the section root href. The active section is derived from the path via sectionFor, so
// the bar highlights the right tab on any page within a section.
const MOBILE_SECTIONS = [
  { id: "home", label: "Home", icon: "home", href: "/" },
  { id: "components", label: "Components", icon: "layoutGrid", href: "/components" },
  { id: "utilities", label: "Utilities", icon: "palette", href: "/tokens/colors" },
];

// The kit Icon is styled by boolean glyph props; the section glyph is data, so it is built
// dynamically and cast to IconProps (the one place a name string drives the Icon).
function sectionIcon(name: string, active: boolean) {
  return { [name]: true, [active ? "primary" : "muted"]: true } as unknown as Omit<IconProps, "key">;
}

// Web (every width): desktop = sidebar + glass topbar; narrow = the mobile iOS shell (a
// bottom kit TabBar for the sections + the glass topbar whose hamburger drills into the
// current section's sub-nav, mirroring the native iOS app). cmd-K search modal, web
// scrollbar gutter, aurora wash in glass mode are shared.
function WebNav() {
  const { tokens, surface } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const wide = width >= 1024;
  const glass = surface === "glass";
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Narrow web: the mobile iOS shell. The glass topbar floats over the content (its
  // hamburger opens the current section's category drill-down), and the kit TabBar docks
  // at the bottom (thumb-reachable) to switch sections.
  if (!wide) {
    const section = sectionFor(pathname);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={["top"]}>
        <WebScrollbarTheme />
        {glass ? <GlassAurora /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
          <View style={{ position: "absolute", top: 0, left: 0, right: SCROLLBAR_W, zIndex: 10 }}>
            <Topbar showMenu onMenu={() => setMenuOpen(true)} onSearch={() => setSearchOpen(true)} />
          </View>
        </View>
        <TabBar
          items={MOBILE_SECTIONS.map((s) => ({
            key: s.id,
            label: s.label,
            icon: (active) => <Icon {...sectionIcon(s.icon, active)} size={22} />,
          }))}
          active={section}
          onSelect={(key) => {
            const s = MOBILE_SECTIONS.find((m) => m.id === key);
            if (s) router.push(s.href as never);
          }}
          style={{ paddingBottom: insets.bottom }}
        />
        <TabOverflowMenu
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          menu={nativeMenuFor(section)}
          activeGroup={getActiveGroup(pathname)}
          activeSlug={getActiveSlug(pathname)}
        />
        <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
      </SafeAreaView>
    );
  }

  // Desktop web: the fixed 240px sidebar rail + glass topbar.
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={["top"]}>
      <WebScrollbarTheme />
      {glass ? <GlassAurora /> : null}
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ width: collapsed ? 56 : 240, borderRightWidth: 1, borderColor: tokens.border }}>
          <Sidebar collapsed={collapsed} collapsible onToggleCollapse={() => setCollapsed((c) => !c)} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
          <View style={{ position: "absolute", top: 0, left: 0, right: SCROLLBAR_W, zIndex: 10 }}>
            <Topbar showMenu onMenu={() => setCollapsed((c) => !c)} onSearch={() => setSearchOpen(true)} />
          </View>
        </View>
      </View>
      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </SafeAreaView>
  );
}
