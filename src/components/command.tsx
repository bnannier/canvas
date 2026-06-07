import { useState } from "react";
import { cn } from "../cn.js";
import { Box, Text, Pressable } from "../engine/index.js";
import { Icon } from "./icon.js";
import { Kbd } from "./kbd.js";

// Command: a Cmd+K style command palette rendered as a floating card. A search
// row sits at the top (a leading magnifier glyph + a muted placeholder), then
// one or more groups of result rows. Each group can carry an optional uppercase
// heading; each row is a leading icon glyph + a label + an optional trailing
// shortcut rendered as a Kbd cap. The active row (a flat index across all
// groups) is highlighted with the accent surface.
//
// This is the OPEN, INLINE palette card on its own: no full-screen portal,
// Modal, or backdrop. `open` (default true) gates whether the card renders, so
// the docs playground can show the palette in its open state.
//
// Style is configured through semantic boolean props (Canvas's only styling
// API); there are no string-enum props.

export interface CommandItem {
  /** The row's primary text. */
  label: string;
  /** Optional leading glyph (e.g. an emoji or single character). */
  icon?: string;
  /** Optional trailing keyboard shortcut, rendered in a Kbd cap. */
  shortcut?: string;
}

export interface CommandGroup {
  /** Optional uppercase section heading above the group's rows. */
  heading?: string;
  /** The rows in this group. */
  items: CommandItem[];
}

export interface CommandProps {
  /** Placeholder shown in the (non-editable, display-only) search row. */
  placeholder?: string;
  /** Grouped result rows. */
  groups?: CommandGroup[];
  /** Flat index of the highlighted row, counted across all groups. */
  active?: number;
  /** Controlled open state. Omit for uncontrolled (the search trigger toggles it). */
  open?: boolean;
  /** Fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Render a collapsed full-width search trigger above the palette (a search
   * glyph + "Search..." + a trailing kbd cap). The palette card still renders
   * inline below the trigger (gated by `open`), mirroring how Dropdown shows
   * its trigger plus the open menu in the docs.
   */
  trigger?: boolean;
  /**
   * Append a footer hint bar below the list (↑ ↓ to navigate, ↵ to select,
   * esc to close).
   */
  footer?: boolean;
  /** Called with the chosen item and its flat index when a row is pressed. */
  onSelect?: (item: CommandItem, index: number) => void;
  className?: string;
}

const CARD =
  "w-[420px] rounded-lg border border-border bg-popover shadow-xl overflow-hidden";
const SEARCH_ROW = "flex-row items-center gap-2 border-b border-border px-3 py-3";
const SEARCH_GLYPH = "text-sm text-muted-foreground";
const SEARCH_PLACEHOLDER = "text-sm text-muted-foreground";
const GROUP_HEADING = "uppercase text-xs text-muted-foreground px-3 pt-3 pb-1";
const ROW_BASE = "flex-row items-center gap-3 px-3 py-2 active:bg-accent";
const ROW_ACTIVE = "bg-accent";
const ROW_ICON = "text-sm text-foreground";
const ROW_LABEL = "text-sm text-foreground flex-1";

const TRIGGER_ROW =
  "flex-row items-center gap-2 w-full justify-start rounded-md border border-input bg-transparent px-3 py-1.5";
const TRIGGER_LABEL = "text-sm text-foreground";
const FOOTER_BAR =
  "flex-row items-center gap-3 border-t border-border px-4 py-2.5";
const FOOTER_HINT = "flex-row items-center gap-1";
const FOOTER_TEXT = "text-xs text-muted-foreground";

export function Command(props: CommandProps) {
  const {
    placeholder = "Type a command or search...",
    groups = [],
    active = 0,
    open: openProp,
    trigger,
    footer,
    onOpenChange,
    onSelect,
    className,
  } = props;

  // Uncontrolled by default: in trigger mode the palette starts closed and the
  // collapsed search trigger toggles it; the bare card (no trigger) starts open.
  const [internalOpen, setInternalOpen] = useState(() => !trigger);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // In trigger mode the collapsed search button is always shown; the palette
  // card below it is still gated by `open`. Otherwise the bare card is gated by
  // `open` and renders nothing when closed.
  if (!trigger && !open) return null;

  // Walk a flat counter across every group so `active` indexes the whole list.
  let flat = -1;

  const card =
    open ? (
      <Box className={cn(CARD, trigger && "absolute top-full left-0 z-50 mt-3")}>
        <Box className={SEARCH_ROW}>
          <Text className={SEARCH_GLYPH}>🔍</Text>
          <Text className={SEARCH_PLACEHOLDER}>{placeholder}</Text>
        </Box>

        {groups.map((group, gi) => (
          <Box key={`group-${gi}`}>
            {group.heading != null ? (
              <Text className={GROUP_HEADING}>{group.heading}</Text>
            ) : null}
            {group.items.map((item, ii) => {
              flat += 1;
              const index = flat;
              const isActive = index === active;
              return (
                <Pressable
                  key={`item-${gi}-${ii}`}
                  className={cn(ROW_BASE, isActive && ROW_ACTIVE)}
                  onPress={() => { onSelect?.(item, index); setOpen(false); }}
                >
                  {item.icon != null ? (
                    <Text className={ROW_ICON}>{item.icon}</Text>
                  ) : null}
                  <Text className={ROW_LABEL}>{item.label}</Text>
                  {item.shortcut != null ? <Kbd>{item.shortcut}</Kbd> : null}
                </Pressable>
              );
            })}
          </Box>
        ))}

        {footer ? (
          <Box className={FOOTER_BAR}>
            <Box className={FOOTER_HINT}>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Text className={FOOTER_TEXT}>to navigate</Text>
            </Box>
            <Box className={FOOTER_HINT}>
              <Kbd>↵</Kbd>
              <Text className={FOOTER_TEXT}>to select</Text>
            </Box>
            <Box className={FOOTER_HINT}>
              <Kbd>esc</Kbd>
              <Text className={FOOTER_TEXT}>to close</Text>
            </Box>
          </Box>
        ) : null}
      </Box>
    ) : null;

  if (!trigger) return card;

  return (
    <Box className={cn("relative w-full", className)}>
      <Pressable className={TRIGGER_ROW} onPress={() => setOpen(!open)}>
        <Icon search muted size={14} />
        <Text className={TRIGGER_LABEL}>Search...</Text>
        <Kbd className="ml-auto">⌘K</Kbd>
      </Pressable>
      {card}
    </Box>
  );
}
