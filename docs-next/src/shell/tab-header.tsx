import { useState } from "react";
import { ScrollView } from "react-native";
import { View, Text, Pressable, useTheme, GlassSurface } from "@olympusoss/canvas";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu } from "lucide-react-native";
import { MOBILE_TABS, NAV_ROUTES, getActiveSlug } from "../data/nav";
import { TOPBAR_HEIGHT } from "./topbar";
import { TabOverflowMenu } from "./tab-overflow-menu";
import { geist } from "../ui/fonts";

// The contextual top bar for a native tab. A Liquid Glass header (real material on
// iOS 26) with the tab's inline sub-nav links + a hamburger overflow, all sourced from
// nav.config.json's mobile.tabs[].topbar. Absolutely positioned at TOPBAR_HEIGHT so it
// overlays scrolling content exactly like the web Topbar (screens keep their existing
// top inset, no body edits).
export function TabHeader({ section }: { section: "home" | "components" | "utilities" }) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [overflowOpen, setOverflowOpen] = useState(false);

  const tab = MOBILE_TABS.find((t) => t.id === section);
  const inline = tab?.topbar?.inline ?? [];
  const overflow = tab?.topbar?.overflow ?? [];
  const categories = tab?.topbar?.categories ?? [];
  const activeSlug = getActiveSlug(pathname);

  const Pill = ({ label, onPress, active }: { label: string; onPress: () => void; active: boolean }) => (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: active ? tokens.accent : "transparent" }}>
      <Text style={{ fontFamily: geist(active ? "600" : "500"), fontSize: 13.5, color: active ? tokens.foreground : tokens["muted-foreground"] }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
      {/* The glass extends up under the status bar (paddingTop = top inset); the bar row
          sits below it, matching the iOS system nav-bar look. */}
      <GlassSurface style={{ paddingTop: insets.top, borderBottomWidth: 1, borderColor: tokens.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", height: TOPBAR_HEIGHT, paddingHorizontal: 10, gap: 6 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: 4 }} style={{ flex: 1 }}>
            {inline.map((key) => {
              const r = NAV_ROUTES[key];
              return <Pill key={key} label={r.label} active={activeSlug === getActiveSlug(r.href)} onPress={() => router.push(r.href as never)} />;
            })}
            {categories.map((cat) => (
              <Pill key={cat} label={cat} active={false} onPress={() => router.push("/components" as never)} />
            ))}
          </ScrollView>
          {overflow.length ? (
            <Pressable onPress={() => setOverflowOpen(true)} hitSlop={8} style={{ padding: 6 }}>
              <Menu size={20} color={tokens.foreground} />
            </Pressable>
          ) : null}
        </View>
      </GlassSurface>
      {overflow.length ? <TabOverflowMenu visible={overflowOpen} onClose={() => setOverflowOpen(false)} routeKeys={overflow} /> : null}
    </View>
  );
}
