import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { ScrollView, View, Text, Pressable, Icon, useTheme, GlassSurface, type IconProps } from "@olympusoss/canvas";
import { usePathname, useRouter } from "expo-router";
import { CanvasMark } from "../brand/canvas-mark";
import { NAV_GROUPS, COMPARE_ITEM, getActiveSlug, getActiveGroup, type NavItem } from "../data/nav";
import { geist } from "../ui/fonts";

// A nav glyph rendered by its kit `Icon` glyph key (the camelCase name the nav config
// carries, e.g. "keyRound"). The dynamic name maps onto the kit Icon's boolean glyph
// prop; active items ride the default foreground color, inactive ones go muted. The cast
// bridges the computed-key object to IconProps (a dynamic key is not statically
// assignable). No glyph name collides with React's reserved `key` prop: the credential
// glyph is `keyRound`, not `key`, precisely so a spread never carries a `key` member.
function NavGlyph({ name, active }: { name: string; active: boolean }) {
  return <Icon {...({ [name]: true, muted: !active, size: 16 } as unknown as IconProps)} />;
}

// The docs sidebar chrome: brand (CanvasMark + Canvas / design
// system), a pinned Overview, an always-open Tokens & Utilities section, the
// collapsible category groups (accordion), and a Compare footer. On wide viewports it
// can collapse to a 56px icon rail (the brand chevron / topbar hamburger toggle it).
export function Sidebar({
  onNavigate,
  collapsed = false,
  collapsible = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  collapsible?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { tokens } = useTheme();
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
    return (
      <Pressable
        onPress={() => go(item.href)}
        accessibilityLabel={collapsed ? item.label : undefined}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 8,
          paddingVertical: 6.4,
          paddingHorizontal: collapsed ? 6.4 : 10,
          borderRadius: 8,
          backgroundColor: active ? tokens.accent : "transparent",
        }}
      >
        <NavGlyph name={item.icon} active={active} />
        {collapsed ? null : (
          <Text style={{ fontFamily: geist(active ? "600" : "500"), fontSize: 13, color }}>{item.label}</Text>
        )}
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

  // A collapsed group renders just its icon; tapping it expands the rail and opens that
  // group.
  const CollapsedGroup = ({ group }: { group: (typeof NAV_GROUPS)[number] }) => {
    const groupHasActive = group.items.some((i) => i.slug === activeSlug);
    return (
      <Pressable
        onPress={() => {
          setOpenGroup(group.label);
          onToggleCollapse?.();
        }}
        accessibilityLabel={group.label}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 6.4,
          paddingHorizontal: 6.4,
          borderRadius: 8,
          backgroundColor: groupHasActive ? tokens.accent : "transparent",
        }}
      >
        <NavGlyph name={group.icon} active={groupHasActive} />
      </Pressable>
    );
  };

  return (
    <GlassSurface style={{ flex: 1, backgroundColor: tokens.card }}>
      {/* Brand row: full lockup when expanded (with the desktop collapse chevron), just the
          mark as an expand button when collapsed. */}
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          paddingHorizontal: collapsed ? 0 : 14,
          borderBottomWidth: 1,
          borderColor: tokens.border,
        }}
      >
        {collapsed ? (
          <Pressable onPress={onToggleCollapse} hitSlop={8} accessibilityLabel="Expand sidebar">
            <CanvasMark size={26.62} />
          </Pressable>
        ) : (
          <>
            <CanvasMark size={26.62} />
            <View>
              <Text style={{ fontFamily: geist("600"), fontSize: 14, letterSpacing: -0.14, color: tokens.foreground }}>Canvas</Text>
              <Text style={{ fontFamily: geist("500"), fontSize: 10, letterSpacing: 0.4, color: tokens["muted-foreground"], marginTop: 2 }}>
                design system
              </Text>
            </View>
            {collapsible ? (
              <>
                <View style={{ flex: 1 }} />
                <Pressable onPress={onToggleCollapse} hitSlop={8} accessibilityLabel="Collapse sidebar" style={{ padding: 4 }}>
                  <Icon chevronLeft size={14} muted />
                </Pressable>
              </>
            ) : null}
          </>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 8, paddingBottom: 16 }}>
        <View style={{ marginBottom: 2 }}>
          {NAV_GROUPS[0].items.map((it) => (
            <Item key={it.href} item={it} />
          ))}
        </View>

        <View style={{ marginBottom: 2 }}>
          {collapsed ? null : <GroupHeader label={NAV_GROUPS[1].label} />}
          <View style={{ marginTop: collapsed ? 0 : 2 }}>
            {NAV_GROUPS[1].items.map((it) => (
              <Item key={it.href} item={it} />
            ))}
          </View>
        </View>

        {NAV_GROUPS.slice(2).map((g) => {
          if (collapsed) return <CollapsedGroup key={g.label} group={g} />;
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
                  <Icon chevronRight size={11} muted />
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
    </GlassSurface>
  );
}
