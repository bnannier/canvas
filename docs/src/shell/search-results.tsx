import { useMemo } from "react";
import { ScrollView, Platform, type StyleProp, type ViewStyle } from "react-native";
import { View, Text, Pressable, useTheme, alpha } from "@olympusoss/canvas";
import type { SearchEntry } from "../core/data/types";
import { geist } from "../ui/fonts";

// The grouped search results list, shared by the web cmd-K modal and the native
// search tab. Presentational: the caller owns the query state and the search() call,
// and handles selection. Results group under uppercase category headers (first-seen
// order); each row navigates via onSelect.
export function SearchResults({
  query,
  results,
  selectedIndex,
  onSelect,
  onHover,
  style,
}: {
  query: string;
  results: SearchEntry[];
  selectedIndex: number;
  onSelect: (path: string) => void;
  onHover?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { tokens } = useTheme();

  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const r of results) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return [...map.entries()];
  }, [results]);

  return (
    <ScrollView style={style} keyboardShouldPersistTaps="handled">
      {!query ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ fontFamily: geist("400"), fontSize: 13, color: tokens["muted-foreground"], textAlign: "center" }}>
            Type to search components, tokens, and guides.
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ fontFamily: geist("400"), fontSize: 13, color: tokens["muted-foreground"] }}>No results found.</Text>
        </View>
      ) : (
        <View style={{ paddingVertical: 6 }}>
          {grouped.map(([category, items]) => (
            <View key={category} style={{ paddingBottom: 4 }}>
              <Text
                style={{
                  fontFamily: geist("600"),
                  fontSize: 10.5,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: tokens["muted-foreground"],
                  paddingHorizontal: 16,
                  paddingTop: 10,
                  paddingBottom: 4,
                }}
              >
                {category}
              </Text>
              {items.map((item) => {
                const idx = results.indexOf(item);
                const active = idx === selectedIndex;
                return (
                  <Pressable
                    key={item.path}
                    onPress={() => onSelect(item.path)}
                    onHoverIn={Platform.OS === "web" ? () => onHover?.(idx) : undefined}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      marginHorizontal: 6,
                      borderRadius: 8,
                      backgroundColor: active ? alpha(tokens.muted, 0.6) : "transparent",
                    }}
                  >
                    <Text style={{ fontFamily: geist("500"), fontSize: 13.5, color: tokens.foreground }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text
                      style={{ fontFamily: geist("400"), fontSize: 12, color: tokens["muted-foreground"], marginTop: 1 }}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
