import { SafeAreaProvider } from "react-native-safe-area-context";
import { DocsThemeProvider } from "../theme/docs-theme";
import { useDocsFonts } from "../ui/fonts";
import { Navbar } from "../shell/navbar";

// On native the tab triggers are declared in the order Search, Home, Components,
// Utilities (Search leftmost), but the app should launch on Home. initialRouteName
// controls the initial focused route (not the visual order) and must match the route
// name literally, including the group parentheses.
export const unstable_settings = { initialRouteName: "(home)" };

// The whole app renders inside Canvas's ThemeProvider (via DocsThemeProvider) and a
// single adaptive Navbar: the sidebar/topbar shell on web, a native tab bar on iOS and
// Android. Everything below the providers is platform-agnostic screen content.
export default function RootLayout() {
  const [fontsLoaded] = useDocsFonts();
  return (
    <SafeAreaProvider>
      <DocsThemeProvider>{fontsLoaded ? <Navbar /> : null}</DocsThemeProvider>
    </SafeAreaProvider>
  );
}
