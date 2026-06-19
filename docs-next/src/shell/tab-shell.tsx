import { Platform } from "react-native";
import { Slot, Stack } from "expo-router";

// The one adaptive per-tab layout. On the web it returns a bare <Slot/> so the root
// WebNav shell owns the chrome. On native it is a native Stack whose header is the real
// iOS 26 Liquid Glass UINavigationBar (matching the native tab bar): headerTransparent so
// content scrolls behind it (the condition for automatic Liquid Glass). A regular (not
// large) left title reads like the web breadcrumb above each page's own H1, so there is no
// duplicate-title and no per-page surgery. Per-screen title / search / menu are set by
// <NativeHeader/> inside each screen; the screen scrollers use
// contentInsetAdjustmentBehavior="automatic" so iOS owns the top inset.
export function TabShell({ section: _section }: { section: "home" | "components" | "utilities" }) {
  if (Platform.OS === "web") return <Slot />;
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitleAlign: "left",
      }}
    />
  );
}
