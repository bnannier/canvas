import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, useTheme, alpha } from "@olympusoss/canvas";
import { usePathname, useRouter } from "expo-router";
import { NAV_GROUPS } from "../data/nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// The docs navigation rail: fixed groups (Overview, Tokens) always open; the component
// and guide groups are an accordion (one open at a time, the active group auto-opens).
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { tokens } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const activeGroup =
    NAV_GROUPS.find((g) => g.collapsible && g.items.some((i) => isActive(pathname, i.href)))?.title ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);
  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  const go = (href: string) => {
    router.push(href as never);
    onNavigate?.();
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.popover }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 17, fontWeight: "700", letterSpacing: -0.3, color: tokens.foreground }}>Canvas</Text>
        <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>design system</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: 40, gap: 2 }}>
        {NAV_GROUPS.map((group) => {
          const open = !group.collapsible || openGroup === group.title;
          return (
            <View key={group.title} style={{ marginTop: 6 }}>
              <Pressable
                disabled={!group.collapsible}
                onPress={() => setOpenGroup((o) => (o === group.title ? null : group.title))}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 0.6, color: tokens["muted-foreground"], textTransform: "uppercase" }}>
                  {group.title}
                </Text>
                {group.collapsible ? (
                  <Text style={{ fontSize: 10, color: tokens["muted-foreground"] }}>{open ? "▾" : "▸"}</Text>
                ) : null}
              </Pressable>

              {open
                ? group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <Pressable
                        key={item.href}
                        onPress={() => go(item.href)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          borderRadius: 8,
                          backgroundColor: active ? alpha(tokens.primary, 0.12) : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13.5,
                            color: active ? tokens.primary : tokens.foreground,
                            fontWeight: active ? "600" : "400",
                          }}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })
                : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
