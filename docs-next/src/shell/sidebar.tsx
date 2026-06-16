import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { ScrollView, View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { usePathname, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { CanvasMark } from "../brand/canvas-mark";
import { NAV_GROUPS, COMPARE_ITEM, getActiveSlug, getActiveGroup, type NavItem } from "../data/nav";
import { geist } from "../ui/fonts";
import { webFrost } from "../ui/glass";

// The docs sidebar, matching the Vite chrome: brand (CanvasMark + Canvas / design
// system), a pinned Overview, an always-open Tokens & Utilities section, the
// collapsible category groups (accordion), and a Compare footer.
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { tokens, surface } = useTheme();
  const glass = surface === "glass";
  const pathname = usePathname();
  const router = useRouter();
  const activeSlug = getActiveSlug(pathname);
  const activeGroup = getActiveGroup(pathname);

  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);
  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup, pathname]);

  const go = (href: string) => {
    router.push(href as never);
    onNavigate?.();
  };

  const Item = ({ item }: { item: NavItem }) => {
    const active = item.slug === activeSlug;
    const color = active ? tokens.foreground : tokens["muted-foreground"];
    const Icon = item.icon;
    return (
      <Pressable
        onPress={() => go(item.href)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 6.4,
          paddingHorizontal: 10,
          borderRadius: 8,
          backgroundColor: active ? tokens.accent : "transparent",
        }}
      >
        <Icon size={16} color={color} />
        <Text style={{ fontFamily: geist(active ? "600" : "500"), fontSize: 13, color }}>{item.label}</Text>
      </Pressable>
    );
  };

  const GroupHeader = ({ label }: { label: string }) => (
    <Text
      style={{
        paddingVertical: 6,
        paddingHorizontal: 10,
        fontFamily: geist("500"),
        fontSize: 11,
        letterSpacing: 0.66,
        textTransform: "uppercase",
        color: tokens["muted-foreground"],
      }}
    >
      {label}
    </Text>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: glass ? tokens.popover : tokens.card }, webFrost(glass)]}>
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 14,
          borderBottomWidth: 1,
          borderColor: tokens.border,
        }}
      >
        <CanvasMark size={26.62} />
        <View>
          <Text style={{ fontFamily: geist("600"), fontSize: 14, letterSpacing: -0.14, color: tokens.foreground }}>Canvas</Text>
          <Text style={{ fontFamily: geist("500"), fontSize: 10, letterSpacing: 0.4, color: tokens["muted-foreground"], marginTop: 2 }}>
            design system
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: 16 }}>
        <View style={{ marginBottom: 2 }}>
          {NAV_GROUPS[0].items.map((it) => (
            <Item key={it.href} item={it} />
          ))}
        </View>

        <View style={{ marginBottom: 2 }}>
          <GroupHeader label={NAV_GROUPS[1].label} />
          <View style={{ marginTop: 2 }}>
            {NAV_GROUPS[1].items.map((it) => (
              <Item key={it.href} item={it} />
            ))}
          </View>
        </View>

        {NAV_GROUPS.slice(2).map((g) => {
          const isOpen = openGroup === g.label;
          return (
            <View key={g.label} style={{ marginBottom: 2 }}>
              <Pressable
                onPress={() => setOpenGroup((o) => (o === g.label ? null : g.label))}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10 }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontFamily: geist("500"),
                    fontSize: 11,
                    letterSpacing: 0.66,
                    textTransform: "uppercase",
                    color: tokens["muted-foreground"],
                  }}
                >
                  {g.label}
                </Text>
                {isOpen ? (
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: tokens.primary, marginRight: 6 }} />
                ) : null}
                <View style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}>
                  <ChevronRight size={11} color={tokens["muted-foreground"]} />
                </View>
              </Pressable>
              {isOpen ? (
                <View style={{ marginTop: 2 }}>
                  {g.items.map((it) => (
                    <Item key={it.href} item={it} />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      {/* /compare is a web-only QA harness (reference imagery); on native it redirects
          home, so the link is only surfaced on web to avoid a dead-end. */}
      {Platform.OS === "web" ? (
        <View style={{ padding: 8, borderTopWidth: 1, borderColor: tokens.border }}>
          <Item item={COMPARE_ITEM} />
        </View>
      ) : null}
    </View>
  );
}
