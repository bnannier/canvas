import { Platform } from "react-native";
import { Slot, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabHeader } from "./tab-header";

// The one adaptive per-tab layout, used by each route group's _layout.tsx. On the web
// it returns a bare <Slot/> so the root WebNav shell owns the chrome (no double header).
// On native it stacks the tab's routes (native push + swipe-back) under a custom Liquid
// Glass contextual header, inside a top SafeAreaView so the header clears the notch.
export function TabShell({ section }: { section: "home" | "components" | "utilities" }) {
  if (Platform.OS === "web") return <Slot />;
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      <TabHeader section={section} />
    </SafeAreaView>
  );
}
