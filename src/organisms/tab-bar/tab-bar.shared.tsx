import { type ReactNode } from "react";
import { View, Text, Pressable, GlassSurface, useTheme, useControllableState, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

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
  /** The active item's key; omit for uncontrolled use. */
  active?: string;
  /** Initial active key for uncontrolled use (defaults to the first item's key). */
  defaultActive?: string;
  /** Called with the pressed destination's key (both modes). */
  onSelect?: (key: string) => void;
  /** E2E hook forwarded to the tablist row. */
  testID?: string;
  /**
   * Safe-area bottom inset, e.g. `insets.bottom`. It is added BELOW the bar's own symmetric
   * vertical padding (not in place of it), so the bar clears the home indicator without making
   * the bottom margin heavier than the top. Defaults to 0 (web desktop / no inset).
   */
  bottomInset?: number;
  /** Layout escape hatch for other overrides. Do NOT use this for the safe area — see `bottomInset`. */
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
  /**
   * Material 3 active-indicator pill drawn BEHIND the active item's icon (the icon
   * is on top). Returns the full absolute-positioned, self-centering pill style;
   * null on iOS/web, so only the Android skin renders it.
   */
  pill: ((tokens: ColorTokens) => ViewStyle) | null;
}

export function createTabBar(skin: TabBarSkin) {
  return function TabBar({ items, active, defaultActive, onSelect, bottomInset = 0, style, testID }: TabBarProps) {
    const { tokens } = useTheme();
    // Controlled when `active` is provided, self-managed otherwise, so a bare
    // <TabBar /> switches destinations out of the box (the standard library
    // contract). Uncontrolled use starts on the first item unless defaultActive
    // picks another.
    const [activeKey, setActiveKey] = useControllableState<string>(active, defaultActive ?? items[0]?.key ?? "", onSelect);
    // The skin's paddingTop is the bar's symmetric vertical base. Mirror it on the bottom and
    // add the safe-area inset there, so the item row stays vertically centered (top margin ==
    // bottom margin) while the bar still extends down to cover the home indicator.
    const basePad = typeof skin.bar.paddingTop === "number" ? skin.bar.paddingTop : 0;
    // A bottom tab bar is a full-bleed nav shell: it must fill its container's width, not
    // shrink-wrap to the icon column. `alignSelf: "stretch"` fills the cross axis in a normal
    // column screen; `width: "100%"` also fills a centering/shrink-wrapping parent (e.g. the
    // docs FitStage). Both route to GlassSurface's outer box, so glass and solid match. The
    // `style` escape hatch still overrides, since it is applied last.
    return (
      <GlassSurface
        style={[skin.bar, { borderColor: tokens.border, backgroundColor: tokens.card, alignSelf: "stretch", width: "100%", paddingBottom: basePad + bottomInset }, style]}
      >
        <View accessibilityRole="tablist" testID={testID} style={{ flex: 1, flexDirection: "row" }}>
          {items.map((it) => {
            const isActive = it.key === activeKey;
            return (
              <Pressable
                key={it.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                aria-selected={isActive}
                accessibilityLabel={it.label}
                onPress={() => setActiveKey(it.key)}
                android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
                style={({ pressed }) => [skin.item, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
              >
                {skin.pill ? (
                  // Android only: wrap the icon so the M3 active-indicator pill can center on it.
                  // The wrapper shrink-wraps to the icon; the absolute pill is drawn first (behind)
                  // and does not affect layout, so iOS/web (skin.pill === null) render the bare icon.
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    {isActive ? <View style={[skin.pill(tokens), { pointerEvents: "none" }]} /> : null}
                    {it.icon(isActive)}
                  </View>
                ) : (
                  it.icon(isActive)
                )}
                <Text numberOfLines={1} style={[skin.label(isActive), { color: isActive ? tokens.primary : tokens["muted-foreground"] }]}>{it.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    );
  };
}
