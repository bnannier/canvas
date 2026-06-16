import { View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { usePathname, useRouter } from "expo-router";
import { FLAT_PAGES } from "../data/nav";

// Prev / next links at the foot of each content page, following the nav order.
export function PageNav() {
  const { tokens } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const idx = FLAT_PAGES.findIndex((p) => p.href === pathname);
  if (idx === -1) return null;
  const prev = idx > 0 ? FLAT_PAGES[idx - 1] : undefined;
  const next = idx < FLAT_PAGES.length - 1 ? FLAT_PAGES[idx + 1] : undefined;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 12,
        paddingTop: 18,
        borderTopWidth: 1,
        borderColor: tokens.border,
      }}
    >
      {prev ? (
        <Pressable onPress={() => router.push(prev.href as never)} style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 13, color: tokens["muted-foreground"] }} numberOfLines={1}>
            ← {prev.label}
          </Text>
        </Pressable>
      ) : (
        <View />
      )}
      {next ? (
        <Pressable onPress={() => router.push(next.href as never)} style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }} numberOfLines={1}>
            {next.label} →
          </Text>
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
}
