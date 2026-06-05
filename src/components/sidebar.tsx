import { type GestureResponderEvent } from "react-native";
import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";
import { Badge } from "./badge.js";

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
  className?: string;
}

type Density = "default" | "compact";
type Frame = "flush" | "bordered";

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

// Fixed-width navigation column. The flush frame docks against the page with a
// single right hairline; the bordered/floating frame lifts it into a fully
// ruled, rounded card.
const COLUMN_BASE = "w-[240px] bg-background";
const COLUMN_FRAME: Record<Frame, string> = {
  flush: "border-r border-border",
  bordered: "rounded-lg border border-border overflow-hidden",
};

// Row padding per density. The comfortable row matches the documented px-3 py-2;
// compact tightens it for dense navigation.
const ROW_DENSITY: Record<Density, string> = {
  default: "px-3 py-2",
  compact: "px-3 py-1.5",
};

// Label type per density.
const LABEL_DENSITY: Record<Density, string> = {
  default: "text-sm",
  compact: "text-xs",
};

export function Sidebar(props: SidebarProps) {
  const { sections, items, active, onSelect, className } = props;
  const density = densityOf(props);
  const frame = frameOf(props);

  // Normalize to a sections list; a flat `items` array becomes one untitled
  // section. Sections always win when both are supplied.
  const groups: SidebarSection[] =
    sections ?? (items ? [{ items }] : []);

  const container = cn(COLUMN_BASE, COLUMN_FRAME[frame], className);

  // Active match is by label or by flat index across every row in order.
  const isActive = (item: SidebarItem, flatIndex: number): boolean => {
    if (active == null) return false;
    if (typeof active === "number") return active === flatIndex;
    return active === item.label;
  };

  // Running flat index so label/index matching and onSelect agree across groups.
  let flat = -1;

  return (
    <Box className={cn("gap-4 p-2", container)}>
      {groups.map((section, gi) => (
        <Box key={gi} className="gap-1">
          {section.title != null ? (
            <Text className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {section.title}
            </Text>
          ) : null}
          {section.items.map((item) => {
            flat += 1;
            const index = flat;
            const activeRow = isActive(item, index);
            const row = cn(
              "flex-row items-center gap-3 rounded-md active:bg-accent",
              ROW_DENSITY[density],
              activeRow ? "bg-accent" : null,
            );
            const label = cn(
              "flex-1",
              LABEL_DENSITY[density],
              activeRow ? "font-medium text-foreground" : "text-muted-foreground",
            );
            return (
              <Pressable
                key={index}
                className={row}
                onPress={(event) => onSelect?.(item, index, event)}
                accessibilityRole="button"
                accessibilityState={{ selected: activeRow }}
              >
                {item.icon != null ? (
                  <Text
                    className={cn(
                      "text-base",
                      activeRow ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.icon}
                  </Text>
                ) : null}
                <Text className={label} numberOfLines={1}>
                  {item.label}
                </Text>
                {item.badge != null ? <Badge secondary>{item.badge}</Badge> : null}
              </Pressable>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
