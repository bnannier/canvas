import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, type NativeSyntheticEvent, type TextInputFocusEventData } from "react-native";
import { Redirect, Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SearchBarCommands } from "react-native-screens";
import { View, Text, Pressable, GlassSurface, useTheme, alpha } from "@olympusoss/canvas";
import { search } from "../../core/data/search";
import type { SearchEntry } from "../../core/data/types";
import { geist } from "../../ui/fonts";

// The Search tab's screen. On native (iOS/Android) the rightmost bottom tab opens this and the
// nav bar hosts the system search field (a real UISearchController on iOS 26 / Material search on
// Android), auto-focused on open. On web the Search tab opens the cmd-K modal (see WebNav), so a
// /search deep link just redirects home.
//
// Results live in a Liquid Glass "bubble" anchored to the TOP of the search field: it stays
// hidden until you type, then rises above the bar with the matches. Matches are ranked so the
// CLOSEST one sits at the BOTTOM of the bubble, nearest the field (and bottom-aligned, so the
// bubble grows upward as more match). `obscureBackground:false` keeps iOS from dimming the
// screen over the bubble while searching.
export default function SearchScreen() {
  if (Platform.OS === "web") return <Redirect href="/" />;
  return <NativeSearch />;
}

// Rank matches so the closest sorts LAST (it renders at the bottom of the bubble, by the field):
// exact title > title prefix > title substring > weaker (description/keyword) match. Keep only
// the strongest few so the bubble stays a glance, not a full list.
function rankForBubble(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const score = (e: SearchEntry) => {
    const t = e.title.toLowerCase();
    return t === q ? 4 : t.startsWith(q) ? 3 : t.includes(q) ? 2 : 1;
  };
  return search(query)
    .slice()
    .sort((a, b) => score(a) - score(b) || b.title.localeCompare(a.title))
    .slice(-8);
}

function NativeSearch() {
  const router = useRouter();
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const results = useMemo(() => rankForBubble(query), [query]);
  const searchRef = useRef<SearchBarCommands>(null);

  // Focus the field every time the tab gains focus. The native bar's `autoFocus` is a no-op for
  // the iOS UISearchController (and the screen pre-mounts), so drive focus() imperatively.
  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => searchRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }, []),
  );

  const go = (path: string) => {
    setQuery("");
    searchRef.current?.setText("");
    router.push(path as never);
  };

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
            // Don't dim the screen while searching, or the dimming sheet would cover the bubble.
            obscureBackground: false,
            ...(Platform.OS === "ios" ? { placement: "integrated" as const } : {}),
            onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => setQuery(e.nativeEvent.text),
            onCancelButtonPress: () => setQuery(""),
            // Hide iOS's separate Cancel pill so the field reads as one control.
            onFocus: () => searchRef.current?.toggleCancelButton(false),
          },
        }}
      />
      {/* The Liquid Glass results bubble: anchored just above the field, grows upward, closest
          match at the bottom. box-none lets taps outside the bubble reach the field/content. */}
      {results.length > 0 ? (
        <View
          pointerEvents="box-none"
          style={{ position: "absolute", left: 10, right: 10, top: insets.top + 8, bottom: insets.bottom + 60 }}
        >
          {/* The bubble is a content-sized rounded box (the rows size it); GlassSurface fills
              BEHIND them as an absolute background, since a content-sized GlassSurface would
              collapse (its core puts flex:1 on the clip box). The list is capped so it fits. */}
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: alpha(tokens.border, 0.7) }}>
              <GlassSurface style={StyleSheet.absoluteFill} pointerEvents="none" />
              <View style={{ paddingVertical: 6 }}>
                {results.map((item, i) => {
                  const closest = i === results.length - 1;
                  return (
                    <Pressable
                      key={item.path}
                      onPress={() => go(item.path)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 16,
                        paddingVertical: 9,
                        backgroundColor: pressed ? alpha(tokens.foreground, 0.06) : "transparent",
                      })}
                    >
                      <Text numberOfLines={1} style={{ fontFamily: geist(closest ? "600" : "500"), fontSize: 14, color: tokens.foreground }}>
                        {item.title}
                      </Text>
                      <Text numberOfLines={1} style={{ fontFamily: geist("400"), fontSize: 12, color: tokens["muted-foreground"], marginTop: 1 }}>
                        {item.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
