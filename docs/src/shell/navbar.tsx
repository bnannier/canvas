import { Slot, usePathname } from "expo-router";
import { useState, useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, OverlayProvider, useTheme, alpha } from "@nannier/canvas";
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

// The one adaptive navigation component. On the web it is the v4 hand-off's shell at every
// width: the floating pill navbar, the room rail beside a room's pages in a window of
// 760 px or more, and the grain over everything; on iOS and Android it is a native tab
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

// Web (every width): the hand-off's shell (design-language item 8). The page fills the
// window under the chrome and scrolls itself (../ui/page.tsx); the pill floats over its
// top (./pill-nav.tsx), the rail stands at the frame's start edge on a room's pages
// (./rail.tsx), and the grain lies over all of it (./page-backdrop.tsx). The pill scrolls
// sideways where it does not fit, so it is the navigation at every width: the phone tab
// bar, the mobile top bar and their drawer are retired (S2), and the reference pages the
// pill does not name are linked from the rail of their room and the footer. The cmd-K
// search modal is shared, opened from the pill's search button too.
function WebNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const place = roomFor(pathname);
  const rail = useRailFits() && place != null;

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
    <ShellFrameProvider rail={rail}>
      <SafeAreaView {...({ dataSet: { shellBackdrop: "" } } as object)} style={{ flex: 1 }} edges={["top"]}>
        <PageBackdrop />
        <WebScrollbarTheme />
        {/* Content scrolled into view parks below the pill, as the hand-off's sections
            keep their 72 px scroll margin. */}
        <WebScrollPadding top={PILL_BAND + SHELL.navTop} bottom={0} />
        {/* The banner and the rail lead the document, so a keyboard reaches the
            navigation first; they float over the page, which lies under them. */}
        <PillNav onSearch={() => setSearchOpen(true)} />
        {rail && place ? <Rail room={place.room} active={place.active} /> : null}
        {/* The page content is the main landmark at every width. */}
        <View role="main" style={{ flex: 1 }}>
          <OverlayProvider viewport viewportInsets={{ top: PILL_BAND, bottom: 0 }}>
            <Slot />
          </OverlayProvider>
        </View>
        <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
        {/* Last, so it lies over the pill and the rail too (the hand-off's z-index 100). */}
        <PageGrain />
      </SafeAreaView>
    </ShellFrameProvider>
  );
}
