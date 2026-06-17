import { useWindowDimensions } from "react-native";
import { View, Text, Pressable, useTheme, GlassSurface, alpha } from "@olympusoss/canvas";
import { usePathname } from "expo-router";
import { Menu, Search, Sun, Moon } from "lucide-react-native";
import { getComponent } from "docs-core/data/components";
import { useDocsTheme } from "../theme/docs-theme";
import { geist } from "../ui/fonts";

// The topbar overlays the scrolling content (so its glass frost refracts what
// scrolls behind it). Content scrollers add this as a top inset so their first row
// starts below the bar.
export const TOPBAR_HEIGHT = 56;

function titleize(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
  "/compare": { title: "Platform comparison", subtitle: "QA" },
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

export function Topbar({ showMenu, onMenu, onSearch }: { showMenu: boolean; onMenu: () => void; onSearch?: () => void }) {
  const { tokens } = useTheme();
  const { scheme, surface, toggleScheme, setSurface } = useDocsTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { title, subtitle } = titleFor(pathname);
  const wideEnough = width >= 640;

  // GlassSurface paints the glass material in glass mode (native Liquid Glass on
  // iOS, expo-blur frost on web/Android) and the solid background otherwise.
  return (
    <GlassSurface
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: TOPBAR_HEIGHT,
        paddingHorizontal: wideEnough ? 24 : 16,
        borderBottomWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.background,
      }}
    >
      {showMenu ? (
        <Pressable onPress={onMenu} hitSlop={8} accessibilityLabel="Toggle menu" style={{ padding: 6, marginLeft: -2 }}>
          <Menu size={18} color={tokens.foreground} />
        </Pressable>
      ) : null}

      <View style={{ minWidth: 0, flexShrink: 1 }}>
        <Text style={{ fontFamily: geist("600"), fontSize: 14.5, color: tokens.foreground }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && wideEnough ? (
          <Text style={{ fontFamily: geist("400"), fontSize: 11, color: tokens["muted-foreground"] }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Two flex spacers around the search center it and pin the toggle + theme
          button to the right edge, so the bar fills the full width (Vite parity).
          The search is a fixed-width element, not the flexing one. */}
      <View style={{ flex: 1 }} />

      {wideEnough ? (
        <Pressable
          onPress={onSearch}
          style={{
            minWidth: 240,
            maxWidth: 360,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 7,
            paddingHorizontal: 14,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: tokens.border,
            backgroundColor: alpha(tokens.muted, 0.3),
          }}
        >
          <Search size={13} color={tokens["muted-foreground"]} />
          <Text style={{ flex: 1, fontFamily: geist("400"), fontSize: 12.5, color: tokens["muted-foreground"] }}>
            Search components...
          </Text>
          <View style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: tokens.border }}>
            <Text style={{ fontFamily: geist("500"), fontSize: 10, color: tokens["muted-foreground"] }}>⌘K</Text>
          </View>
        </Pressable>
      ) : null}

      <View style={{ flex: 1 }} />

      {wideEnough ? (
        <View
          style={{
            flexDirection: "row",
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: tokens.border,
            backgroundColor: tokens.card,
            padding: 2,
          }}
        >
          {(["default", "glass"] as const).map((s) => {
            const active = surface === s;
            return (
              <Pressable
                key={s}
                onPress={() => setSurface(s)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 9999,
                  backgroundColor: active ? tokens.foreground : "transparent",
                }}
              >
                <Text style={{ fontFamily: geist("500"), fontSize: 11, color: active ? tokens.background : tokens["muted-foreground"] }}>
                  {s === "default" ? "Solid" : "Glass"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Pressable onPress={toggleScheme} hitSlop={10} style={{ padding: 6 }}>
        {scheme === "dark" ? <Sun size={16} color={tokens.foreground} /> : <Moon size={16} color={tokens.foreground} />}
      </Pressable>
    </GlassSurface>
  );
}
