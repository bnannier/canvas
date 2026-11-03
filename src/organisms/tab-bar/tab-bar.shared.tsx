import { primaryText } from "../../style/primary-text.js";
import { type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable, GlassPane, paneHost, GlassSurface, paneRipple, useTheme, useControllableState, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { selectionTint } from "../../style/selection-tint.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import { AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";

// Shared TabBar shell. TabBar is the bottom app-navigation bar: a row of equal-width
// destinations, each an icon over a short label, with exactly one active. It is a
// functional-layer surface, so it renders through GlassSurface (real Liquid Glass on
// iOS 26, the frost on web and Android in glass mode, solid otherwise), matching
// the other bars. The structure, accessibility, and active state live here once; a
// platform file supplies the skin (bar shape, label type, press feedback, the active
// indicator) and calls createTabBar.
//
// Two bar anatomies, chosen by the skin:
//   - DOCKED (Android, Material 3): a full-bleed bar along the bottom edge whose
//     bottom padding grows by the safe-area inset so it covers the home indicator; the
//     active indicator is a fixed-size pill centred behind the glyph.
//   - FLOATING (iOS 26 and web): a capsule inset from the edges that hovers above the
//     content, which scrolls beneath it; the safe-area inset becomes the space under
//     the capsule. The active indicator is a capsule covering the whole destination
//     cell, and under glass it is a control-layer pane behind the glyph and label.
//
// TabBar is the bottom navigation idiom (iOS HIG tab bar / Material 3 navigation bar); it is
// app-level navigation, distinct from the top `Navbar` and the in-page `Tabs`.

export interface TabBarItem {
  /** Stable identity for the destination; passed to onSelect and compared to `active`. */
  key: string;
  label: string;
  /** Renders the tab's glyph; `active` lets the caller tint it (e.g. primary vs muted). */
  icon: (active: boolean) => ReactNode;
  /** Something new waits behind the destination: a small destructive dot over the cell's
   *  glyph, and ", unread" after the tab's accessible name. */
  unread?: boolean;
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
  /** Outer layout composition only. Use bottomInset for the safe area. */
  style?: StyleProp<ViewStyle>;
}

export interface TabBarSkin {
  /** Bar shape: hairline, radius, min height and padding (the fill/border colors come from `fill`). */
  bar: (tokens: ColorTokens) => ViewStyle;
  /**
   * Bar fill and border colors from the active tokens. Solid mode paints them; under
   * glass the material replaces the fill and the border is the rim. Defaults to the
   * card fill with the border hairline.
   */
  fill?: (tokens: ColorTokens) => { backgroundColor: string; borderColor?: string };
  /**
   * A floating capsule instead of a docked, full-bleed bar: `horizontal` is the inset
   * from the container's sides, `bottom` the least space kept under the capsule, and
   * `clearance` how far into the safe-area inset the capsule may reach (the bar sits
   * `max(bottom, bottomInset - clearance)` above the container's bottom edge, so it
   * floats over the home-indicator zone without touching the indicator itself, the
   * way the iOS 26 tab bar does). Undefined for a docked bar.
   */
  floating?: { horizontal: number; bottom: number; clearance: number };
  /** One destination cell: flex 1, centered, icon/label gap + vertical padding. */
  item: ViewStyle;
  /** Label type per active state (size/line-height/weight/tracking; the color is applied by shared). */
  label: (active: boolean) => TextStyle;
  /** The label's ink per active state; the accent's text ink active and `muted-foreground` at rest when left out. */
  labelColor?: (tokens: ColorTokens, active: boolean) => string;
  /** The space between the destination cells (none when left out). */
  cellGap?: number;
  /** Android press ripple (null on iOS/web, which dim instead). */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean; radius?: number }) | null;
  /** iOS/web press dim (null on Android, where the ripple carries it). */
  pressedOpacity: number | null;
  /**
   * The active indicator. With `pillCovers: "icon"` (the default) it is a fixed-size
   * pill centred behind the glyph, so the style carries a `width` and `height`
   * (Android's M3 dimensions). With `pillCovers: "cell"` it is a capsule filling the
   * whole destination cell, so the style carries only the fill and radius. `dark`
   * lets the fill follow the scheme. Returns the indicator's style; null for a bar
   * whose selection is the tint alone.
   */
  pill: ((tokens: ColorTokens, dark: boolean) => ViewStyle) | null;
  pillCovers?: "icon" | "cell";
  /** The `unread` dot, positioned in the destination cell over its glyph. */
  unread: (tokens: ColorTokens) => ViewStyle;
}

// The glyph's wrapper over an icon pill: positioned, so it paints after the pill.
const ICON_OVER_PILL: ViewStyle = { position: "relative" };

export function createTabBar(skin: TabBarSkin) {
  return function TabBar({ items, active, defaultActive, onSelect, bottomInset = 0, style, testID }: TabBarProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Bar, Item, Active indicator, Label. Each registers on the first
    // destination that draws it (the active one for the indicator), taken before the
    // tree's AnatomyScope so the caller's icons register nothing of their own.
    const barPart = useAnatomyPart("Bar");
    const itemPart = useAnatomyPart("Item");
    const indicatorPart = useAnatomyPart("Active indicator");
    const labelPart = useAnatomyPart("Label");
    const { tokens } = useTheme();
    const material = useMaterialTheme({ layer: "control" });
    const glass = material.surface === "glass";
    // Controlled when `active` is provided, self-managed otherwise, so a bare
    // <TabBar /> switches destinations out of the box (the standard library
    // contract). Uncontrolled use starts on the first item unless defaultActive
    // picks another.
    const [activeKey, setActiveKey] = useControllableState<string>(active, defaultActive ?? items[0]?.key ?? "", onSelect);
    const pill = skin.pill?.(tokens, material.dark);
    const cellPill = skin.pillCovers === "cell";
    // A capsule indicator is the active destination's whole cell, so its part rides that
    // cell's Pressable, shared with the Item part when the active one is the first.
    const activeIndex = items.findIndex((it) => it.key === activeKey);
    const firstCellRef = useComposedRefs(itemPart?.ref, cellPill && activeIndex === 0 ? indicatorPart?.ref : undefined);
    // Under glass the active indicator is a CONTROL-layer material in the pill's own
    // shape: the cell capsule is a GlassPane filling the active destination's cell
    // (the Pressable keeps its tap, ripple and dim), the icon pill a GlassSurface of
    // the skin's fixed size centred on the glyph. Its under-fill keeps the skin's hue at
    // selectionTint's translucent ceiling, so the ink stays readable over the material;
    // the icon pill is already a translucent tint and passes through unchanged. In
    // solid mode the indicator is the skin's own fill, painted by a plain View.
    const pillTint = pill ? (cellPill ? selectionTint(pill, material.dark) : typeof pill.backgroundColor === "string" ? pill.backgroundColor : undefined) : undefined;
    const fill = skin.fill ? skin.fill(tokens) : { backgroundColor: tokens.card, borderColor: tokens.border };
    // The skin's paddingTop is the bar's symmetric vertical base. A docked bar mirrors it on
    // the bottom and adds the safe-area inset there, so the item row stays vertically centered
    // (top margin == bottom margin) while the bar still extends down to cover the home
    // indicator. A floating capsule keeps its symmetric padding and puts the inset UNDER it.
    const barBase = skin.bar(tokens);
    const basePad = typeof barBase.paddingTop === "number" ? barBase.paddingTop : 0;
    const floating = skin.floating;
    const barStyle: StyleProp<ViewStyle> = [
      barBase,
      { borderColor: fill.borderColor ?? tokens.border, backgroundColor: fill.backgroundColor },
      floating ? { paddingBottom: basePad } : { alignSelf: "stretch", width: "100%", paddingBottom: basePad + bottomInset },
    ];
    const bar = (
      <GlassSurface floating style={floating ? barStyle : [barStyle, style]}>
        {/* The Bar part's node inside a docs provider: a pass-through fill of the surface. */}
        {barPart ? <View ref={barPart.ref} onLayout={barPart.onLayout} style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]} /> : null}
        <View accessibilityRole="tablist" testID={testID} style={{ flex: 1, flexDirection: "row", gap: skin.cellGap ?? 0 }}>
          {items.map((it, index) => {
            const isActive = it.key === activeKey;
            const first = index === 0;
            const cellIndicator = cellPill && index === activeIndex ? indicatorPart : undefined;
            const cellItem = first ? itemPart : undefined;
            const cellRef = first ? firstCellRef : cellIndicator?.ref;
            // An icon pill is drawn on the active destination only.
            const iconIndicator = !cellPill && isActive ? indicatorPart : undefined;
            return (
              <Pressable
                key={it.key}
                ref={cellRef}
                onLayout={cellItem || cellIndicator ? () => { cellItem?.onLayout(); cellIndicator?.onLayout(); } : undefined}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                aria-selected={isActive}
                accessibilityLabel={it.unread ? `${it.label}, unread` : it.label}
                onPress={() => setActiveKey(it.key)}
                // The active indicator's material is a child of this Pressable, which the
                // borderless ripple, projected onto an ancestor's background, lands beneath:
                // where it renders the ripple draws in the foreground (`paneRipple`).
                android_ripple={paneRipple(glass && isActive && pill != null, skin.ripple ? skin.ripple(tokens) : undefined)}
                style={({ pressed }) => [skin.item, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null, paneHost(glass && isActive && pill != null && cellPill)]}
              >
                {/* The cell capsule, behind the glyph and label alike. */}
                {pill && cellPill && isActive ? (
                  glass
                    ? <GlassPane layer="control" shape={pill} tint={pillTint} />
                    : <View style={[StyleSheet.absoluteFill, pill, { pointerEvents: "none" }]} />
                ) : null}
                {pill ? (
                  // Wrap the icon so the icon pill can centre on it: the wrapper shrink-wraps
                  // to the glyph and the absolute pill is drawn first (behind) without
                  // affecting layout. Labels and safe-area spacing stay untouched.
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    {!cellPill && isActive ? (
                      glass
                        ? <GlassSurface layer="control" tint={pillTint} pointerEvents="none" style={pill} />
                        : <View ref={iconIndicator?.ref} onLayout={iconIndicator?.onLayout} style={[pill, { pointerEvents: "none" }]} />
                    ) : null}
                    {/* Under glass the pill is a GlassSurface with no node to measure: a docs
                        provider measures a transparent View of the pill's own box instead. */}
                    {iconIndicator && glass ? <View ref={iconIndicator.ref} onLayout={iconIndicator.onLayout} style={[pill, { pointerEvents: "none", backgroundColor: "transparent" }]} /> : null}
                    {/* The absolute pill is positioned, so on the web it paints over an in-flow
                        glyph (its frost would blur the glyph away); a positioned glyph after it
                        paints on top, as later siblings do natively. */}
                    {!cellPill && isActive ? <View style={ICON_OVER_PILL}>{it.icon(isActive)}</View> : it.icon(isActive)}
                  </View>
                ) : (
                  it.icon(isActive)
                )}
                {it.unread ? <View style={[skin.unread(tokens), { pointerEvents: "none" }]} /> : null}
                <Text ref={first ? labelPart?.ref : undefined} onLayout={first ? labelPart?.onLayout : undefined} numberOfLines={1} style={[skin.label(isActive), { color: skin.labelColor ? skin.labelColor(tokens, isActive) : isActive ? primaryText(tokens) : tokens["muted-foreground"] }]}>{it.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    );
    if (!floating) return <AnatomyScope>{bar}</AnatomyScope>;
    // The floating capsule's frame: full width like the docked bar (so it reads the
    // container's bounds the same way, `alignSelf: "stretch"` plus `width: "100%"`),
    // insetting the capsule from the sides and keeping the safe-area space under it.
    // Touches pass through the frame's margins to whatever scrolls beneath.
    return (
      <AnatomyScope>
        <View
          style={[
            { alignSelf: "stretch", width: "100%", pointerEvents: "box-none", paddingHorizontal: floating.horizontal, paddingBottom: Math.max(floating.bottom, bottomInset - floating.clearance) },
            style,
          ]}
        >
          {bar}
        </View>
      </AnatomyScope>
    );
  };
}
