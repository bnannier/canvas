import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Modal,
  ScrollView,
  Platform,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import { View, Text, Pressable, TextInput, useTheme, GlassSurface, alpha } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { search } from "../core/data/search";
import type { SearchEntry } from "../core/data/types";
import { geist } from "../ui/fonts";

// The docs search modal: a transparent fade Modal with a centered panel, a cmd-K
// dialog. A TextInput drives a case-insensitive search over the docs core
// index; results group under uppercase category headers, each row navigates and closes.
// Keyboard up/down/enter/esc nav is wired through the web build (RN-Web surfaces the key
// via onKeyPress); on native the Modal's onRequestClose handles Android back / dismiss.
export function SearchModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const results = useMemo(() => search(query), [query]);

  // Reset the query and selection each time the modal opens.
  useEffect(() => {
    if (visible) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [visible]);

  // Keep the selected index in range as results change.
  useEffect(() => {
    setSelectedIndex((i) => (i >= results.length ? 0 : i));
  }, [results.length]);

  const go = useCallback(
    (path: string) => {
      onClose();
      router.push(path as never);
    },
    [onClose, router],
  );

  // Web keyboard navigation. RN-Web reports the key on nativeEvent.key; native builds
  // never emit these arrow / enter events from the soft keyboard, so the guard keeps
  // behavior identical there (touch only).
  const onKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (Platform.OS !== "web") return;
      const key = e.nativeEvent.key;
      if (key === "Escape") {
        onClose();
      } else if (key === "ArrowDown") {
        (e as unknown as { preventDefault?: () => void }).preventDefault?.();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (key === "ArrowUp") {
        (e as unknown as { preventDefault?: () => void }).preventDefault?.();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (key === "Enter" && results[selectedIndex]) {
        go(results[selectedIndex].path);
      }
    },
    [results, selectedIndex, go, onClose],
  );

  // Group results by category, preserving first-seen category order.
  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const r of results) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return [...map.entries()];
  }, [results]);

  const panelWidth = Math.min(560, width - 32);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 96,
          paddingHorizontal: 16,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onPress={onClose}
      >
        <Pressable style={{ width: panelWidth, maxHeight: 480 }} onPress={() => {}}>
          <GlassSurface
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: tokens.border,
              backgroundColor: tokens.card,
            }}
          >
          {/* Search input row */}
          <View
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
              onKeyPress={onKeyPress}
              placeholder="Search components..."
              placeholderTextColor={tokens["muted-foreground"]}
              style={{
                flex: 1,
                fontFamily: geist("400"),
                fontSize: 14.5,
                color: tokens.foreground,
                // Strip the RN-Web default input outline; the panel border frames it.
                ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null),
              }}
            />
          </View>

          {/* Results list */}
          <ScrollView ref={scrollRef} style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled">
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
                          onPress={() => go(item.path)}
                          onHoverIn={Platform.OS === "web" ? () => setSelectedIndex(idx) : undefined}
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
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
