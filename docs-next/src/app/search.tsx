import { useMemo, useState } from "react";
import { View, Platform } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { TextInput, useTheme, GlassSurface } from "@olympusoss/canvas";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { search } from "docs-core/data/search";
import { SearchResults } from "../shell/search-results";
import { geist } from "../ui/fonts";

// The native Search tab (iOS renders it as the system search tab via role="search").
// Web never surfaces this route in the UI (it keeps the cmd-K modal), so a stray
// /search deep link just redirects home, mirroring compare.tsx.
export default function SearchScreen() {
  if (Platform.OS === "web") return <Redirect href="/" />;
  return <NativeSearch />;
}

function NativeSearch() {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const results = useMemo(() => search(query), [query]);

  return (
    <View style={{ flex: 1, backgroundColor: tokens.background, paddingTop: insets.top }}>
      <GlassSurface
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 16,
          height: 52,
          borderBottomWidth: 1,
          borderColor: tokens.border,
        }}
      >
        <Search size={16} color={tokens["muted-foreground"]} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search components..."
          placeholderTextColor={tokens["muted-foreground"]}
          style={{ flex: 1, fontFamily: geist("400"), fontSize: 15, color: tokens.foreground }}
        />
      </GlassSurface>
      <SearchResults
        query={query}
        results={results}
        selectedIndex={selectedIndex}
        onHover={setSelectedIndex}
        onSelect={(path) => router.push(path as never)}
        style={{ flex: 1 }}
      />
    </View>
  );
}
