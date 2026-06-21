import { Platform, View } from "react-native";
import { Redirect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sidebar } from "../shell/sidebar";

// The mobile "Menu" tab (native): a full-screen view of the whole navigation (the same
// sidebar tree the web drawer shows), reached as the 4th, bottom-right tab. Tapping an item
// navigates to it, which activates the right section tab. The web shell reaches the nav
// through the bottom bar's Menu button + drawer, so on web this route just redirects home.
export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  if (Platform.OS === "web") return <Redirect href="/" />;
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Sidebar />
    </View>
  );
}
