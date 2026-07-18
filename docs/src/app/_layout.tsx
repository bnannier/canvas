import { SafeAreaProvider } from "react-native-safe-area-context";
import { OverlayProvider, ToastProvider } from "@nannier/canvas";
import { DocsThemeProvider } from "../theme/docs-theme";
import { useDocsFonts } from "../ui/fonts";
import { Navbar } from "../shell/navbar";

// On native the bottom tab triggers are declared (in nav.config.json's mobile.tabs order)
// as Home, Components, Utilities, Search — Search rightmost, mirroring the web shell. The
// app should still launch on Home: initialRouteName controls the initial focused route (not
// the visual order) and must match the route name literally, including the group parentheses.
export const unstable_settings = { initialRouteName: "(home)" };

// The whole app renders inside Canvas's ThemeProvider (via DocsThemeProvider) and a
// single adaptive Navbar: the sidebar/topbar shell on web, a native tab bar on iOS and
// Android. Everything below the providers is platform-agnostic screen content. The
// root OverlayProvider is the app-level overlay host: it is flex-sized (outside any
// scroller), so on Android it carries the window blur target for Modal frosts, and
// the ToastProvider's stack portals into its outlet, above every page. Page-level
// hosts still exist inside each scroller so anchored menus scroll with their triggers.
export default function RootLayout() {
  const [fontsLoaded] = useDocsFonts();
  return (
    <SafeAreaProvider>
      <DocsThemeProvider>
        {fontsLoaded ? (
          <OverlayProvider>
            <ToastProvider>
              <Navbar />
            </ToastProvider>
          </OverlayProvider>
        ) : null}
      </DocsThemeProvider>
    </SafeAreaProvider>
  );
}
