import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, type NativeSyntheticEvent, type TextInputFocusEventData } from "react-native";
import { Redirect, Stack, useFocusEffect, useRouter } from "expo-router";
import type { SearchBarCommands } from "react-native-screens";
import { View, useTheme } from "@olympusoss/canvas";
import { search } from "../../core/data/search";
import { SearchResults } from "../../shell/search-results";

// The Search tab's screen. On native (iOS/Android) the rightmost bottom tab opens this:
// the nav bar hosts the system search field (a real UISearchController on iOS 26 / Material
// search on Android). Whenever the tab is opened it AUTO-FOCUSES the field (keyboard up,
// ready to type) and the live results render below. On web the Search tab opens the cmd-K
// modal instead (see WebNav), so a /search deep link just redirects home.
export default function SearchScreen() {
  if (Platform.OS === "web") return <Redirect href="/" />;
  return <NativeSearch />;
}

function NativeSearch() {
  const router = useRouter();
  const { tokens } = useTheme();
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);
  const searchRef = useRef<SearchBarCommands>(null);

  // Focus the search field every time the tab gains focus. The native search bar's
  // `autoFocus` prop is a no-op for the iOS UISearchController (and the tab screen
  // pre-mounts, so a mount-time focus would never re-fire), so we drive focus()
  // imperatively on each visit. A short delay lets the search controller present first.
  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => searchRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }, []),
  );

  return (
    <View style={{ flex: 1, backgroundColor: tokens.background }}>
      <Stack.Screen
        options={{
          headerTitle: "Search",
          headerSearchBarOptions: {
            ref: searchRef,
            autoFocus: true,
            placeholder: "Search components...",
            hideWhenScrolling: false,
            ...(Platform.OS === "ios" ? { placement: "integrated" as const } : {}),
            onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => setQuery(e.nativeEvent.text),
            onCancelButtonPress: () => setQuery(""),
          },
        }}
      />
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
