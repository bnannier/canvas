import { Slot, usePathname } from "expo-router";
import { useState, useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, OverlayProvider, useTheme, useFormFactor, alpha } from "@nannier/canvas";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { PageBackdrop, PageGrain } from "./page-backdrop";
import { PillNav, PILL_BAND } from "./pill-nav";
import { Rail } from "./rail";
import { ShellFrameProvider, useRailFits } from "./frame";
import { SearchModal } from "./search-modal";
import { SHELL } from "./page-look";
import { WebScrollbarTheme, WebScrollPadding } from "../ui/web-scrollbar";
import { MOBILE_TABS } from "../data/nav";
import { roomFor } from "../data/rooms";
import { Sidebar } from "./sidebar";
import { ThemeToggles } from "./theme-toggles";
import { MobileNavBar, MobileTabs } from "./mobile-nav";
import { ScrollEdgeProvider } from "./scroll-edge";
import { titleFor } from "./titles";

// The adaptive navigation component. Desktop web keeps the v4 pill and room rail;
// phone/tablet web restores the pre-v4 top bar, bottom tabs and navigation drawer
// using the current kit skins. On iOS and Android it is a native tab
// bar (real Liquid Glass on iOS 26, Material 3 on Android, native sidebar on tablets via
// sidebarAdaptable) over the route groups. Screen bodies are platform-agnostic; this is
// the single, user-authorized platform branch, scoped to navigation chrome.
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

// The owner restored the pre-v4 mobile-web navigation on 2026-11-15. As before,
// widths up to 1024 use mobile bars. Their measured bounds also govern overlays,
// focused controls and the last scrollable row; the desktop v4 layout stays intact.
function WebNav() {
  const wide = useFormFactor() === "desktop";
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [barHeight, setBarHeight] = useState(0);
  const place = roomFor(pathname);
  const railFits = useRailFits();
  const rail = wide && railFits && place != null;
  const top = wide ? PILL_BAND : headerHeight;
  const bottom = wide ? 0 : barHeight;
  useEffect(() => { setMenuOpen(false); }, [wide, pathname]);

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

  // The route's ancestor chain is the same at every width and on every page (the rail is
  // a sibling of the page, never its parent), so a resize or a route change never
  // remounts Slot, an open overlay or a form draft.
  return (
    // The shell's first child is the page (./page-backdrop.tsx), the hand-off's flat page
    // fixed to the window behind everything; a native screen mounts its own inside
    // ScreenFrame. Nothing above it paints a page fill, so the e2e paint check reads the
    // page off the backdrop itself; the marker stays for the tools that find the shell.
    <ScrollEdgeProvider>
      <ShellFrameProvider rail={rail} bottom={wide ? 0 : bottom + 16}>
        <SafeAreaView {...({ dataSet: { shellBackdrop: "" } } as object)} style={{ flex: 1 }} edges={["top"]}>
          <PageBackdrop />
          <WebScrollbarTheme />
          {/* Content scrolled into view parks below the pill, as the hand-off's sections
              keep their 72 px scroll margin. */}
          <WebScrollPadding top={wide ? top + SHELL.navTop : top} bottom={bottom} />
          {/* The banner and the rail lead the document, so a keyboard reaches the
              navigation first; they float over the page, which lies under them. */}
          {wide ? <PillNav /> : (
            <View role="banner" {...({ dataSet: { shellMobileTop: "" } } as object)}
              onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)} style={mobileChrome.top}>
              <MobileNavBar title={titleFor(pathname).title} pathname={pathname} onMenu={() => setMenuOpen(true)} />
            </View>
          )}
          {rail && place ? <Rail room={place.room} active={place.active} /> : null}
          {/* A landmark-free host: the main landmark is the page body (ui/page.tsx), so the
              footer that follows it is a top-level contentinfo, as the hand-off's component
              page puts <main> and <footer> side by side (Component.dc.html lines 131, 307-312). */}
          <View style={{ flex: 1 }}>
            <OverlayProvider viewport viewportInsets={{ top, bottom }}>
              <Slot />
            </OverlayProvider>
          </View>
          {!wide ? (
            <View role="navigation" accessibilityLabel="Primary" aria-label="Primary"
              {...({ dataSet: { shellMobileTabs: "" } } as object)}
              onLayout={(event) => setBarHeight(event.nativeEvent.layout.height)} style={mobileChrome.bottom}>
              <MobileTabs pathname={pathname} bottomInset={insets.bottom} onSearch={() => setSearchOpen(true)} />
            </View>
          ) : null}
          <Sidebar drawer sectionPages open={!wide && menuOpen} onOpenChange={setMenuOpen}
            onNavigate={() => setMenuOpen(false)} footer={<ThemeToggles />} />
          <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
          {/* Last, so it lies over the pill and the rail too (the hand-off's z-index 100). */}
          <PageGrain />
        </SafeAreaView>
      </ShellFrameProvider>
    </ScrollEdgeProvider>
  );
}

// The wrappers position the real kit bars. Registered box-none keeps the bottom
// capsule's margins transparent to clicks on the page beneath it on React Native Web.
const mobileChrome = StyleSheet.create({
  top: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 40 },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40, pointerEvents: "box-none" },
});
