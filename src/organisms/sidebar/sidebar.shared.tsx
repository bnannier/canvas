import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, GlassSurface, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Badge } from "../../atoms/badge/badge.js";
import { type Density, type Frame } from "./sidebar.styles.js";

// Shared Sidebar shell. The structure (the outer column, the titled sections, the
// nav rows with their leading icon / label / trailing badge, the single active
// highlight), the section normalization, the flat-index active matching, the
// density/frame precedence, the accessibility, and the select handler live here
// once; a platform file supplies only its skin (the row shape, the selected-row
// highlight + label/icon color, the section heading, the frame, the press
// feedback) and calls createSidebar.
//
// A sidebar is the vertical app-navigation panel that runs down the left of a
// layout: an optional list of titled sections, each holding nav rows. A row is a
// leading icon glyph + label, with at most one row carrying the active highlight
// and the rest sitting inactive. Rows may carry a trailing count <Badge>.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf).
//
// - Density axis (pick one; default is the comfortable row): `compact` tightens
//   each row's padding and drops the type a step for dense navigation.
// - Frame axis (pick one; default is the flush, right-bordered column that docks
//   against the page): `bordered`/`floating` lift the panel into a fully bordered,
//   rounded card surface. `bordered` wins over `floating` when both are passed.

// The platform-varying surface. Everything color/shape-bearing the rows, the
// frame, and the section heading need lives here, built from the active tokens
// (so each follows light/dark and the glass surface).
export interface SidebarSkin {
  /** Web paints the accent fill on a pressed (non-active) row; iOS/Android don't. */
  pressedFill: boolean;
  /** iOS dims the row on press; web/Android don't (null). */
  pressedOpacity: number | null;
  /** Android ripple over a pressed row; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Web-only focus-outline reset for the row Pressables. iOS sets this so the
   * react-native-web keyboard-focus blue ring (which a real iOS device never
   * shows on a sidebar nav row) is suppressed, leaving the press dim as the only
   * feedback. Undefined on web/Android, which keep their own focus treatment.
   * No-op natively, where `outlineStyle`/`outlineWidth` are not real CSS.
   */
  focusOutlineReset?: ViewStyle;

  /** The outer navigation column, per frame. */
  column: (t: ColorTokens, frame: Frame) => ViewStyle;
  /** A titled group of nav rows. */
  group: ViewStyle;
  /** The section heading above a group. */
  sectionTitle: (t: ColorTokens) => TextStyle;
  /** The nav-row container (shape + density padding). */
  row: (t: ColorTokens, density: Density) => ViewStyle;
  /** The selected-row highlight fill (null when not active). */
  rowFill: (t: ColorTokens, active: boolean) => ViewStyle | null;
  /** The row label (flex, type, color), per active state + density. */
  label: (t: ColorTokens, active: boolean, density: Density) => TextStyle;
  /** The leading icon glyph color/size, per active state. */
  icon: (t: ColorTokens, active: boolean) => TextStyle;
}

/** One nav row: a label, an optional leading icon glyph, an optional count. */
export interface SidebarItem {
  /**
   * Stable identity for this row, used as its React key so inserting or
   * reordering rows reconciles by item rather than by position. Falls back to
   * the row label when omitted, so supply an `id` when two rows can share a
   * label.
   */
  id?: string | number;
  /** Row label (e.g. "Dashboard"). */
  label: string;
  /** Leading icon glyph rendered before the label (e.g. an emoji or symbol). */
  icon?: string;
  /** Trailing count rendered as a <Badge> (e.g. "12"). */
  badge?: string;
}

/** A titled group of nav rows. */
export interface SidebarSection {
  /**
   * Stable identity for this section, used as its React key so inserting or
   * reordering sections reconciles by section rather than by position. Falls
   * back to the section title when omitted.
   */
  id?: string | number;
  /** Optional muted heading shown above the group. */
  title?: string;
  /** Rows in this group. */
  items: SidebarItem[];
}

export interface SidebarProps {
  /** Titled sections of nav rows. Use this or the flat `items` array. */
  sections?: SidebarSection[];
  /** Flat list of nav rows, wrapped into a single untitled section. */
  items?: SidebarItem[];
  /** The active row, by label or by flat index across all rows. */
  active?: string | number;
  /** Fired with the selected row and its flat index across all sections. */
  onSelect?: (item: SidebarItem, index: number, event: GestureResponderEvent) => void;
  // Density (pick one; default is the comfortable row).
  compact?: boolean;
  // Frame (pick one; default is the flush right-bordered column).
  bordered?: boolean;
  floating?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Density precedence when more than one is passed: first match wins.
function densityOf(p: SidebarProps): Density {
  if (p.compact) return "compact";
  return "default";
}

// Frame precedence when more than one is passed: first match wins.
function frameOf(p: SidebarProps): Frame {
  if (p.bordered) return "bordered";
  if (p.floating) return "bordered";
  return "flush";
}

/** Build a Sidebar component from a platform skin. */
export function createSidebar(skin: SidebarSkin) {
  return function Sidebar(props: SidebarProps) {
    const { sections, items, active, onSelect, style } = props;
    const density = densityOf(props);
    const frame = frameOf(props);
    const { tokens } = useTheme();

    // Normalize to a sections list; a flat `items` array becomes one untitled
    // section. Sections always win when both are supplied.
    const groups: SidebarSection[] = sections ?? (items ? [{ items }] : []);

    // Resolve the active row to a SINGLE flat index up front: scan the flattened
    // rows in order and pick the FIRST whose flat index (numeric `active`) or
    // label (string `active`) matches. Matching against this one resolved index
    // guarantees exactly one active row even when two rows share a label.
    const activeIndex = ((): number => {
      if (active == null) return -1;
      let scan = -1;
      for (const section of groups) {
        for (const item of section.items) {
          scan += 1;
          if (typeof active === "number" ? active === scan : active === item.label) {
            return scan;
          }
        }
      }
      return -1;
    })();

    // Running flat index so index matching and onSelect agree across groups.
    let flat = -1;

    // Sidebar joins the functional glass layer: GlassSurface paints native Liquid
    // Glass (iOS) or frost (web/Android) in glass mode and the solid skin
    // background in default mode.
    return (
      <GlassSurface
        style={[
          skin.column(tokens, frame),
          style,
        ]}
      >
        {groups.map((section, gi) => (
          <View key={section.id ?? section.title ?? gi} style={skin.group}>
            {section.title != null ? (
              <Text style={skin.sectionTitle(tokens)}>{section.title}</Text>
            ) : null}
            {section.items.map((item) => {
              flat += 1;
              const index = flat;
              const activeRow = index === activeIndex;
              return (
                <Pressable
                  key={item.id ?? item.label}
                  android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
                  style={({ pressed }) => [
                    skin.row(tokens, density),
                    // The active row carries its highlight persistently; on web a
                    // press paints it too (the old `active:bg-accent`).
                    skin.rowFill(tokens, activeRow || (skin.pressedFill && pressed)),
                    skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
                    // iOS suppresses the RNW keyboard-focus ring (no-op natively);
                    // undefined on web/Android.
                    skin.focusOutlineReset,
                  ]}
                  onPress={(event) => onSelect?.(item, index, event)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeRow }}
                  aria-selected={activeRow}
                >
                  {item.icon != null ? (
                    <Text style={skin.icon(tokens, activeRow)}>{item.icon}</Text>
                  ) : null}
                  <Text style={skin.label(tokens, activeRow, density)} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {item.badge != null ? <Badge secondary>{item.badge}</Badge> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </GlassSurface>
    );
  };
}
