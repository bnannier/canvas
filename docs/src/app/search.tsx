import { useMemo, useState } from "react";
import { Platform } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Input, useTheme } from "@olympusoss/canvas";
import { search } from "../core/data/search";
import { SearchResults } from "../shell/search-results";

// The Search tab's screen. On native (iOS/Android) the rightmost bottom tab opens this
// full-screen search: a field at the top over the live results. On web the Search tab
// opens the cmd-K modal instead (see WebNav), so a /search deep link just redirects home.
export default function SearchScreen() {
  if (Platform.OS === "web") return <Redirect href="/" />;
  return <NativeSearch />;
}

function NativeSearch() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens } = useTheme();
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);
  return (
    <View style={{ flex: 1, backgroundColor: tokens.background, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Input
          leadingIcon
          icon="search"
          placeholder="Search components..."
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search components"
        />
      </View>
      <SearchResults
        query={query}
        results={results}
        selectedIndex={-1}
        onSelect={(path) => {
          setQuery("");
          router.push(path as never);
        }}
        style={{ flex: 1 }}
      />
    </View>
  );
}
