import { Platform } from "react-native";
import { Slot, Stack } from "expo-router";
import { useTheme } from "@olympusoss/canvas";

// The one adaptive per-tab layout. On the web it returns a bare <Slot/> so the root
// WebNav shell owns the chrome. On native it is a native Stack whose header is the real
// system navigation bar (matching the native tab bar). A regular (not large) left title
// reads like the web breadcrumb above each page's own H1, so there is no duplicate-title
// and no per-page surgery. Per-screen title / search / menu are set by <NativeHeader/>
// inside each screen.
//
// iOS 26: headerTransparent so content scrolls behind the bar (the condition for the system
// to paint Liquid Glass); the screen scrollers add contentInsetAdjustmentBehavior="automatic"
// so iOS owns the inset. Android has no such auto-inset, so it uses a solid Material top app
// bar (themed to match) that occupies its own space, and the content sits below it.
export function TabShell({ section: _section }: { section: "home" | "components" | "utilities" }) {
  const { tokens } = useTheme();
  if (Platform.OS === "web") return <Slot />;
  const ios = Platform.OS === "ios";
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: ios,
        headerTitleAlign: "left",
        ...(ios
          ? {}
          : {
              headerStyle: { backgroundColor: tokens.background },
              headerTintColor: tokens.foreground,
              headerShadowVisible: false,
            }),
      }}
    />
  );
}
