import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Badge } from "../../atoms/badge/badge.js";
import * as s from "./sidebar.styles.js";
import { type Density, type Frame } from "./sidebar.styles.js";

// A sidebar is the vertical app-navigation panel that runs down the left of a
// layout: an optional list of titled sections, each holding nav rows. A row is
// a leading icon glyph + label, with at most one row carrying the active
// highlight (bg-accent text-foreground font-medium) and the rest sitting muted
// (text-muted-foreground). Rows may carry a trailing count <Badge>.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf).
//
// - Density axis (pick one; default is the comfortable row): `compact` tightens
//   each row's padding and drops the type a step for dense navigation.
// - Frame axis (pick one; default is the flush, right-bordered column that
//   docks against the page): `bordered`/`floating` lift the panel into a fully
//   bordered, rounded card surface. `bordered` wins over `floating` when both
//   are passed.

/** One nav row: a label, an optional leading icon glyph, an optional count. */
export interface SidebarItem {
  /** Row label (e.g. "Dashboard"). */
  label: string;
  /** Leading icon glyph rendered before the label (e.g. an emoji or symbol). */
  icon?: string;
  /** Trailing count rendered as a <Badge> (e.g. "12"). */
  badge?: string;
}

/** A titled group of nav rows. */
export interface SidebarSection {
  /** Optional uppercase muted heading shown above the group. */
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

export function Sidebar(props: SidebarProps) {
  const { sections, items, active, onSelect, style } = props;
  const density = densityOf(props);
  const frame = frameOf(props);
  const { tokens } = useTheme();

  // Normalize to a sections list; a flat `items` array becomes one untitled
  // section. Sections always win when both are supplied.
  const groups: SidebarSection[] = sections ?? (items ? [{ items }] : []);

  // Active match is by label or by flat index across every row in order.
  const isActive = (item: SidebarItem, flatIndex: number): boolean => {
    if (active == null) return false;
    if (typeof active === "number") return active === flatIndex;
    return active === item.label;
  };

  // Running flat index so label/index matching and onSelect agree across groups.
  let flat = -1;

  return (
    <View style={[s.column(tokens, frame), style]}>
      {groups.map((section, gi) => (
        <View key={gi} style={s.group}>
          {section.title != null ? (
            <Text style={s.sectionTitle(tokens)}>{section.title}</Text>
          ) : null}
          {section.items.map((item) => {
            flat += 1;
            const index = flat;
            const activeRow = isActive(item, index);
            return (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  s.rowBase,
                  s.rowDensity[density],
                  // The active row carries the accent fill persistently; a press
                  // applies it too (the old `active:bg-accent`).
                  activeRow || pressed ? s.rowAccentFill(tokens) : null,
                ]}
                onPress={(event) => onSelect?.(item, index, event)}
                accessibilityRole="button"
                accessibilityState={{ selected: activeRow }}
              >
                {item.icon != null ? (
                  <Text style={s.iconText(tokens, activeRow)}>{item.icon}</Text>
                ) : null}
                <Text style={[s.labelBase, s.labelDensity[density], s.labelColor(tokens, activeRow)]} numberOfLines={1}>
                  {item.label}
                </Text>
                {item.badge != null ? <Badge secondary>{item.badge}</Badge> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
