import { Platform } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "@olympusoss/canvas";
import { DocsSearch } from "../../shell/docs-search";

// The Search tab's screen. On native (iOS/Android) the rightmost bottom tab opens this and the
// kit `Command` palette fills the screen: an editable field on top, grouped best-match-first
// results below. This dogfoods the kit's own search component (no native UISearchController, no
// hand-rolled results bubble). On web the Search action opens the same `Command` as a cmd-K
// overlay (see WebNav), so a /search deep link just redirects home.
export default function SearchScreen() {
  if (Platform.OS === "web") return <Redirect href="/" />;
  return <NativeSearch />;
}

function NativeSearch() {
  const insets = useSafeAreaInsets();
  // No nav header here: the Command's own field IS the search affordance, so hide the header and
  // inset the palette below the status bar (the screen would otherwise start at the viewport top,
  // under the transparent bar). The bottom tab bar marks this as the Search tab.
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <DocsSearch />
    </View>
  );
}
