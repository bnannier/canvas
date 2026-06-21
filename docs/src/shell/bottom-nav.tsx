import { View, Text, Pressable, Icon, GlassSurface, useTheme, type IconProps } from "@olympusoss/canvas";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { geist } from "../ui/fonts";

// The phone bottom tab bar (narrow web): the three top-level sections plus a Menu button
// as the 4th, bottom-right item that opens the full-nav drawer. Mirrors the native tab bar
// so the mobile nav lives at the bottom (thumb-reachable), not the top. Built from kit
// primitives on a GlassSurface (solid in solid mode, frost in frost mode), like the topbar.
type Item = { label: string; icon: string; href?: string; menu?: boolean; match?: (p: string) => boolean };

const ITEMS: Item[] = [
  { label: "Home", icon: "home", href: "/", match: (p) => p === "/" },
  {
    label: "Components",
    icon: "layoutGrid",
    href: "/components",
    match: (p) => p.startsWith("/components") || p.startsWith("/templates") || p.startsWith("/patterns"),
  },
  { label: "Utilities", icon: "palette", href: "/tokens/colors", match: (p) => p.startsWith("/tokens") || p === "/utilities" },
  { label: "Menu", icon: "menu", menu: true },
];

export function BottomNav({ onMenu }: { onMenu: () => void }) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <GlassSurface
      style={{
        flexDirection: "row",
        borderTopWidth: 1,
        borderColor: tokens.border,
        paddingBottom: insets.bottom,
        backgroundColor: tokens.background,
      }}
    >
      {ITEMS.map((item) => {
        const active = item.match?.(pathname) ?? false;
        // Map the dynamic glyph name + active color onto the kit Icon's boolean props; the
        // cast omits `key` (a glyph name that collides with React's reserved prop on a spread).
        const glyph = { [item.icon]: true, ...(active ? { primary: true } : { muted: true }) } as unknown as Omit<IconProps, "key">;
        return (
          <Pressable
            key={item.label}
            accessibilityLabel={item.label}
            onPress={() => (item.menu ? onMenu() : router.push(item.href as never))}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 8 }}
          >
            <Icon {...glyph} size={22} />
            <Text style={{ fontFamily: geist(active ? "600" : "500"), fontSize: 11, color: active ? tokens.primary : tokens["muted-foreground"] }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}
