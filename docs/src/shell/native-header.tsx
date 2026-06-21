import { useMemo, useState, type ReactNode } from "react";
import { Platform, type NativeSyntheticEvent, type TextInputFocusEventData } from "react-native";
import { Stack, usePathname, useRouter, useIsFocused } from "expo-router";
import { View, useTheme } from "@olympusoss/canvas";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { search } from "../core/data/search";
import { titleFor } from "./topbar";
import { SearchResults } from "./search-results";

// Wraps a screen's scroller so the native header + its search overlay can sit as a fixed
// sibling (the overlay must not scroll with content). On web this is a no-op passthrough:
// it renders the scroller exactly as before, with NO wrapping View, so the web build stays
// byte-identical (an extra flex wrapper there collapses onLayout-measured tile grids).
export function ScreenFrame({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") return <>{children}</>;
  return (
    <View style={{ flex: 1 }}>
      {children}
      <NativeHeader />
    </View>
  );
}

// Per-screen config for the NATIVE iOS/Android navigation bar (a real UINavigationBar,
// Liquid Glass on iOS 26; a Material top app bar on Android). It sets the title and an
// integrated search field, then renders the search results as a fixed overlay while a
// query is active. Returns null on web, where the build keeps its own custom Topbar +
// cmd-K modal.
//
// The section's secondary nav now lives in the bottom tab bar's Menu tab (the full nav),
// so the header carries no menu. usePathname() is global, so gating on focus keeps a
// backgrounded push screen from overwriting its own title (the native back button reads
// the right label) and stops its overlay from showing under the active screen.
export function NativeHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);
  if (Platform.OS === "web" || !isFocused) return null;

  const title = titleFor(pathname).title;

  // The native integrated search field (in the nav bar on iOS 26). placement is iOS-only;
  // Android renders its own Material search field with the default placement.
  const searchOptions = {
    headerSearchBarOptions: {
      ...(Platform.OS === "ios" ? { placement: "integrated" as const } : {}),
      placeholder: "Search components...",
      hideWhenScrolling: false,
      onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => setQuery(e.nativeEvent.text),
      onCancelButtonPress: () => setQuery(""),
    },
  };

  // The results, shown over the page while typing. Positioned below the search field; the
  // native nav bar renders on top, so the field and its cancel button stay interactive.
  const overlay = query ? (
    <View style={{ position: "absolute", top: insets.top + 52, left: 0, right: 0, bottom: 0, backgroundColor: tokens.background }}>
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
  ) : null;

  return (
    <>
      <Stack.Screen options={{ headerTitle: title, ...searchOptions }} />
      {overlay}
    </>
  );
}
