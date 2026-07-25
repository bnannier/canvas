import { Slot, usePathname, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Icon, Button, ButtonGroup, TabBar, useTheme, liquidGlassAvailable, alpha, type IconProps } from "@nannier/canvas";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Sidebar } from "./sidebar";
import { Topbar, titleFor } from "./topbar";
import { MobileNavBar } from "./mobile-nav-bar";
import { SearchModal } from "./search-modal";
import { Cosmos } from "../brand/cosmos";
import { WebScrollbarTheme, SCROLLBAR_W } from "../ui/web-scrollbar";
import { useDocsTheme } from "../theme/docs-theme";
import { geist } from "../ui/fonts";
import { MOBILE_TABS, sectionFor } from "../data/nav";

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
  const { tokens } = useTheme();
  // The iOS 26 Liquid Glass tab bar is system-painted and ignores every appearance prop
  // (backgroundColor / blurEffect — verified a red background had no effect in
  // react-native-screens 4.25), so theme ONLY Android's Material navigation bar to the app's
  // scheme. Without this it renders on a light surface even in dark mode. (Its M3 height +
  // gesture inset is system-controlled and stays the native bar's.)
  const androidTheme =
    Platform.OS === "android"
      ? {
          backgroundColor: tokens.card,
          iconColor: { default: tokens["muted-foreground"], selected: tokens.primary },
          labelStyle: { default: { color: tokens["muted-foreground"] }, selected: { color: tokens.primary } },
          indicatorColor: alpha(tokens.primary, 0.16),
          rippleColor: alpha(tokens.primary, 0.12),
        }
      : {};
  return (
    <NativeTabs sidebarAdaptable={Platform.OS === "ios"} minimizeBehavior="onScrollDown" {...androidTheme}>
      {MOBILE_TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.id} name={`(${tab.id})`} role={tab.role}>
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

// The bottom tab bar's rightmost tab key: an action (opens search), not a section.
const SEARCH_TAB = "search";

// The kit Icon is styled by boolean glyph props; the section glyph is data, so it is built
// dynamically and cast to IconProps (the one place a name string drives the Icon).
function sectionIcon(name: string, active: boolean) {
  return { [name]: true, [active ? "primary" : "muted"]: true } as unknown as Omit<IconProps, "key">;
}

// The scheme + frost toggles live in ./theme-toggles now, shared with the native Android
// overflow sheet (iOS hosts the same controls as native UIMenu rows instead).

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
    const sectionRoot = MOBILE_SECTIONS.find((s) => s.id === section)?.href ?? "/";
    const atRoot = MOBILE_SECTIONS.some((s) => s.href === pathname);
    const goBack = () => (router.canGoBack() ? router.back() : router.push(sectionRoot as never));
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={["top"]}>
        <WebScrollbarTheme />
        {glass ? <Cosmos /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* The page content is the main landmark, so a screen-reader user can skip the
              nav shell and jump straight to it. `role` is the universal spelling: React
              Native accepts "main" and React Native Web renders a real <main> element,
              so this needs no web-only branch. It labels the wrapper that already
              existed rather than adding a node, keeping the flex layout identical. */}
          <View role="main" style={{ flex: 1 }}>
            <Slot />
          </View>
          <View style={{ position: "absolute", top: 0, left: 0, right: SCROLLBAR_W, zIndex: 10 }}>
            <MobileNavBar
              title={titleFor(pathname).title}
              showBack={!atRoot}
              onBack={goBack}
              onMenu={() => setMenuOpen(true)}
            />
          </View>
        </View>
        <TabBar
          items={[
            ...MOBILE_SECTIONS.map((s) => ({
              key: s.id,
              label: s.label,
              icon: (active: boolean) => <Icon {...sectionIcon(s.icon, active)} size={22} />,
            })),
            // Search is the rightmost tab (the iOS App Store pattern): it opens the
            // search modal instead of navigating, so it never reads as "active".
            { key: SEARCH_TAB, label: "Search", icon: () => <Icon search muted size={22} /> },
          ]}
          active={section}
          onSelect={(key) => {
            if (key === SEARCH_TAB) {
              setSearchOpen(true);
              return;
            }
            const s = MOBILE_SECTIONS.find((m) => m.id === key);
            if (s) router.push(s.href as never);
          }}
          bottomInset={insets.bottom}
        />
        {/* The hamburger opens the responsive Sidebar as a start-edge navigation drawer — the
            same kit Sidebar the desktop rail uses, drilled down for the phone. Its Modal covers
            the bars while open (a full-takeover side drawer). */}
        <Sidebar responsive open={menuOpen} onOpenChange={setMenuOpen} onNavigate={() => setMenuOpen(false)} />
        <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
      </SafeAreaView>
    );
  }

  // Desktop web: the fixed 240px sidebar rail + glass topbar.
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }} edges={["top"]}>
      <WebScrollbarTheme />
      {glass ? <Cosmos /> : null}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* The kit Sidebar's column owns the 240/56 width and the flush right hairline now;
            this wrapper is just the column context so the sidebar's shell fills the row height. */}
        <View>
          <Sidebar collapsed={collapsed} collapsible onToggleCollapse={() => setCollapsed((c) => !c)} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* The desktop counterpart of the mobile main landmark above. */}
          <View role="main" style={{ flex: 1 }}>
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
