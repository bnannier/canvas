import { type ReactNode, useState } from "react";
import { useWindowDimensions } from "react-native";
import { View, Text, Pressable, useTheme, alpha } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { geist } from "../ui/fonts";

// One entry in the component catalog: a title, the route it links to, an optional double-width
// flag, and a Preview component (a small hand-authored mockup of the component, rendered in the
// tile's 16:9 stage). Mirrors the Vite components-index `<Tile>` children.
export type CatTile = { title: string; href: string; span?: boolean; Preview: () => ReactNode };

// A single catalog tile: a card with a centered 16:9 preview stage over a muted wash, and a
// footer with the title and a chevron. Matches the Vite `.docs-tile`.
export function Tile({ tile, width }: { tile: CatTile; width: number }) {
  const { tokens } = useTheme();
  const router = useRouter();
  const Preview = tile.Preview;
  return (
    <Pressable
      onPress={() => router.push(tile.href as never)}
      style={{
        width,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.card,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          aspectRatio: 16 / 9,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          backgroundColor: alpha(tokens.muted, 0.3),
          borderBottomWidth: 1,
          borderColor: tokens.border,
          overflow: "hidden",
        }}
      >
        <Preview />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 12 }}>
        <Text style={{ fontFamily: geist("500"), fontSize: 12.5, color: tokens.foreground }}>{tile.title}</Text>
        <ChevronRight size={12} color={tokens["muted-foreground"]} />
      </View>
    </Pressable>
  );
}

// The responsive tile grid: 3 columns when wide, 2 when medium, 1 when narrow. A `span` tile
// takes two cell widths (used by Data Tables), matching the Vite `.cat-tile-grid` + span2.
export function CatGrid({ tiles }: { tiles: CatTile[] }) {
  const { width: winW } = useWindowDimensions();
  const [measured, setMeasured] = useState(0);
  const gap = 12;
  // Seed the width from the viewport so tiles render on the first paint; onLayout then
  // refines it to the grid's exact width. Relying on onLayout alone hid every tile whenever
  // the web ResizeObserver did not fire until a later reflow (the grid sits in the centered
  // content column: viewport minus the sidebar on wide web, minus the 28px page gutters).
  const w = measured || Math.max(280, Math.min(1400, winW >= 1024 ? winW - 240 : winW) - 56);
  const cols = w >= 680 ? 3 : w >= 420 ? 2 : 1;
  const colW = (w - gap * (cols - 1)) / cols;
  return (
    <View onLayout={(e) => setMeasured(e.nativeEvent.layout.width)} style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
      {tiles.map((t) => (
        <Tile key={t.href} tile={t} width={t.span && cols > 1 ? colW * 2 + gap : colW} />
      ))}
    </View>
  );
}

// A category section: heading + "N components" count, then the tile grid. Matches the Vite
// `.cat-group` / `<CatGroup>`.
export function CatGroup({ label, count, tiles }: { label: string; count: number; tiles: CatTile[] }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: geist("600"), fontSize: 18, letterSpacing: -0.18, color: tokens.foreground }}>{label}</Text>
        <Text style={{ fontFamily: geist("500"), fontSize: 11, letterSpacing: 0.88, textTransform: "uppercase", color: tokens["muted-foreground"] }}>
          {count} components
        </Text>
      </View>
      <CatGrid tiles={tiles} />
    </View>
  );
}

// The category pill bar with the total component count, matching the Vite `.cat-subbar`.
export function CatSubBar({ categories, total }: { categories: string[]; total: number }) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        paddingBottom: 12,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderColor: tokens.border,
      }}
    >
      {categories.map((c) => (
        <View
          key={c}
          style={{
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: tokens.border,
            backgroundColor: tokens.card,
          }}
        >
          <Text style={{ fontFamily: geist("500"), fontSize: 12, color: tokens.foreground }}>{c}</Text>
        </View>
      ))}
      <View style={{ flex: 1, minWidth: 12 }} />
      <Text style={{ fontFamily: geist("400"), fontSize: 11, color: tokens["muted-foreground"] }}>{total} components</Text>
    </View>
  );
}

// Shared mini-mockup helpers used by the per-category preview files, rebuilding the docs CSS
// classes the Vite tiles use (.btn, .input, .badge, .avatar, ...) as small RN nodes.
export function MiniBtn({ label, variant = "default" }: { label: string; variant?: "default" | "outline" | "ghost" }) {
  const { tokens } = useTheme();
  const bg = variant === "default" ? tokens.primary : variant === "outline" ? tokens.background : "transparent";
  const fg = variant === "default" ? tokens["primary-foreground"] : tokens.foreground;
  const border = variant === "outline" ? tokens.input : "transparent";
  return (
    <View style={{ height: 28, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: border, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: geist("500"), fontSize: 11, color: fg }}>{label}</Text>
    </View>
  );
}

export function MiniInput({ placeholder, value, width = 170 }: { placeholder?: string; value?: string; width?: number }) {
  const { tokens } = useTheme();
  return (
    <View style={{ height: 32, width, maxWidth: "100%", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 10, justifyContent: "center" }}>
      <Text style={{ fontFamily: geist("400"), fontSize: 12, color: value ? tokens.foreground : tokens["muted-foreground"] }} numberOfLines={1}>
        {value ?? placeholder}
      </Text>
    </View>
  );
}

// An avatar disc with initials. The Vite tiles use brand gradients; RN keeps it simple with a
// solid brand-tinted fill so it reads at tile size on every platform.
export function MiniAvatar({ initials, size = 32, color, ring }: { initials: string; size?: number; color?: string; ring?: boolean }) {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? tokens.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: ring ? 2 : 0,
        borderColor: tokens.background,
      }}
    >
      <Text style={{ fontFamily: geist("600"), fontSize: size * 0.34, color: "#ffffff" }}>{initials}</Text>
    </View>
  );
}

// A labelled content row used by several previews.
export function previewWrap(children: ReactNode): ReactNode {
  return <View style={{ width: "100%", alignItems: "center", justifyContent: "center" }}>{children}</View>;
}
