import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, type NativeSyntheticEvent, type TextInputFocusEventData } from "react-native";
import { Redirect, Stack, useFocusEffect, useRouter } from "expo-router";
import type { SearchBarCommands } from "react-native-screens";
import { View, useTheme } from "@olympusoss/canvas";
import { search, ALL_ENTRIES } from "../../core/data/search";
import { SearchResults } from "../../shell/search-results";

// The Search tab's screen. On native (iOS/Android) the rightmost bottom tab opens this:
// the nav bar hosts the system search field (a real UISearchController on iOS 26 / Material
// search on Android). Whenever the tab is opened it AUTO-FOCUSES the field (keyboard up,
// ready to type) and the live results render below. On web the Search tab opens the cmd-K
// modal instead (see WebNav), so a /search deep link just redirects home.
//
// The content layer is the full browseable catalog (ALL_ENTRIES) until the user types, then
// it narrows to matches. That keeps a real, scrollable list behind the field at all times:
// it is the iOS 26 search pattern (a content list under the bar) AND it is what gives the
// field its Liquid Glass refraction. The system dims the background during search by default
// (obscureBackground), which would cover that content with a flat sheet and leave the glass
// nothing to refract, so we turn the dimming off and let the themed catalog show through.
export default function SearchScreen() {
  if (Platform.OS === "web") return <Redirect href="/" />;
  return <NativeSearch />;
}

function NativeSearch() {
  const router = useRouter();
  const { tokens } = useTheme();
  const [query, setQuery] = useState("");
  // Empty query browses the whole catalog; a real query narrows to matches. Either way the
  // content layer is populated, so the Liquid Glass field always has a list to refract.
  const results = useMemo(() => (query.trim() ? search(query) : ALL_ENTRIES), [query]);
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
            // Don't dim/cover the screen while searching: the themed catalog stays visible
            // behind the field so the iOS 26 Liquid Glass material has content to refract.
            obscureBackground: false,
            ...(Platform.OS === "ios" ? { placement: "integrated" as const } : {}),
            onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => setQuery(e.nativeEvent.text),
            onCancelButtonPress: () => setQuery(""),
            // iOS floats a separate Cancel button (its own Liquid Glass pill) next to the
            // field whenever it is editing, which reads as a second object. Hide it as soon
            // as the field focuses so the search reads as ONE cohesive control; the leading
            // nav capsule (return-to-previous-tab) remains the way out of search.
            onFocus: () => searchRef.current?.toggleCancelButton(false),
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
