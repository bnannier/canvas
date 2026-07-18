import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@nannier/canvas";
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
// ToastProvider hosts the imperative toast() stack the live template demos fire.
export default function RootLayout() {
  const [fontsLoaded] = useDocsFonts();
  return (
    <SafeAreaProvider>
      <DocsThemeProvider>
        {fontsLoaded ? (
          <ToastProvider>
            <Navbar />
          </ToastProvider>
        ) : null}
      </DocsThemeProvider>
    </SafeAreaProvider>
  );
}
