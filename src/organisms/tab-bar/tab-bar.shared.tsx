import { type ReactNode } from "react";
import { View, Text, Pressable, GlassSurface, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

// Shared TabBar shell. TabBar is the bottom app-navigation bar: a row of equal-width
// destinations, each an icon over a short label, with exactly one active. It is a
// functional-layer surface, so it renders through GlassSurface — real Liquid Glass on
// iOS 26, a frost on web/Android in glass mode, solid otherwise — matching the other bars.
// The structure, accessibility, and active state live here once; a platform file supplies
// the skin (bar height, label type, press feedback) and calls createTabBar.
//
// TabBar is the bottom navigation idiom (iOS HIG tab bar / Material 3 navigation bar); it is
// app-level navigation, distinct from the top `Navbar` and the in-page `Tabs`.

export interface TabBarItem {
  /** Stable identity for the destination; passed to onSelect and compared to `active`. */
  key: string;
  label: string;
  /** Renders the tab's glyph; `active` lets the caller tint it (e.g. primary vs muted). */
  icon: (active: boolean) => ReactNode;
}

export interface TabBarProps {
  items: TabBarItem[];
  /** The active item's key. */
  active: string;
  onSelect: (key: string) => void;
  /** Layout escape hatch, e.g. a safe-area bottom inset: `{ paddingBottom: insets.bottom }`. */
  style?: StyleProp<ViewStyle>;
}

export interface TabBarSkin {
  /** Bar shape: top hairline + min height + top padding (the fill/border color is applied by shared). */
  bar: ViewStyle;
  /** One destination cell: flex 1, centered, icon/label gap + vertical padding. */
  item: ViewStyle;
  /** Label type per active state (size/line-height/weight/tracking; the color is applied by shared). */
  label: (active: boolean) => TextStyle;
  /** Android press ripple (null on iOS/web, which dim instead). */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean; radius?: number }) | null;
  /** iOS/web press dim (null on Android, where the ripple carries it). */
  pressedOpacity: number | null;
}

export function createTabBar(skin: TabBarSkin) {
  return function TabBar({ items, active, onSelect, style }: TabBarProps) {
    const { tokens } = useTheme();
    return (
      <GlassSurface style={[skin.bar, { borderColor: tokens.border, backgroundColor: tokens.card }, style]}>
        <View accessibilityRole="tablist" style={{ flex: 1, flexDirection: "row" }}>
          {items.map((it) => {
            const isActive = it.key === active;
            return (
              <Pressable
                key={it.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                aria-selected={isActive}
                accessibilityLabel={it.label}
                onPress={() => onSelect(it.key)}
                android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
                style={({ pressed }) => [skin.item, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
              >
                {it.icon(isActive)}
                <Text style={[skin.label(isActive), { color: isActive ? tokens.primary : tokens["muted-foreground"] }]}>{it.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    );
  };
}
