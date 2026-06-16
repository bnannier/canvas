import { View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { usePathname } from "expo-router";
import { getComponent } from "docs-core/data/components";
import { useDocsTheme } from "../theme/docs-theme";

function titleize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const STATIC_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "Canvas", subtitle: "Design System" },
  "/components": { title: "All components", subtitle: "Overview" },
  "/tokens/colors": { title: "Colors & Theme", subtitle: "Tokens" },
  "/tokens/spacing": { title: "Spacing & Shape", subtitle: "Tokens" },
  "/tokens/typography": { title: "Typography", subtitle: "Tokens" },
  "/tokens/layout": { title: "Layout & Flexbox", subtitle: "Tokens" },
  "/theming": { title: "Theming", subtitle: "Foundations" },
  "/integration": { title: "Integration", subtitle: "Guides" },
  "/browser-support": { title: "Browser Support", subtitle: "Guides" },
  "/rn-primitives": { title: "React Native", subtitle: "Guides" },
};

function titleFor(pathname: string): { title: string; subtitle?: string } {
  if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname];
  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "components" && seg[1]) {
    const c = getComponent(seg[1]);
    if (c) return { title: c.name, subtitle: c.category };
  }
  if (seg[0] === "templates" && seg[1]) return { title: titleize(seg[1]), subtitle: "Templates" };
  if (seg[0] === "patterns" && seg[1]) return { title: titleize(seg[1]), subtitle: "Patterns" };
  return { title: "Canvas" };
}

function Toggle({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: active ? tokens.primary : "transparent",
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "600", color: active ? tokens["primary-foreground"] : tokens["muted-foreground"] }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Topbar({ showMenu, onMenu }: { showMenu: boolean; onMenu: () => void }) {
  const { tokens } = useTheme();
  const { scheme, surface, toggleScheme, setSurface } = useDocsTheme();
  const pathname = usePathname();
  const { title, subtitle } = titleFor(pathname);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        height: 56,
        borderBottomWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.popover,
      }}
    >
      {showMenu ? (
        <Pressable onPress={onMenu} hitSlop={10} style={{ paddingRight: 2 }}>
          <Text style={{ fontSize: 20, color: tokens.foreground }}>☰</Text>
        </Pressable>
      ) : null}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: tokens.foreground }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", borderRadius: 999, borderWidth: 1, borderColor: tokens.border, overflow: "hidden" }}>
        <Toggle active={surface === "default"} label="Solid" onPress={() => setSurface("default")} />
        <Toggle active={surface === "glass"} label="Glass" onPress={() => setSurface("glass")} />
      </View>

      <Pressable onPress={toggleScheme} hitSlop={10} style={{ paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 16 }}>{scheme === "dark" ? "☀︎" : "☾"}</Text>
      </Pressable>
    </View>
  );
}
