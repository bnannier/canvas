import { useState } from "react";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";

// RowMenu: the per-row "⋯" actions menu found in tables and lists. A small
// square icon-button trigger surfaces a floating card of action rows: each row
// carries an optional leading icon glyph and a label, destructive rows are
// red-tinted, and a hairline separator splits off groups (e.g. a trailing
// Delete). An optional muted section label heads the menu, and a `links` axis
// switches the rows to navigation links.
//
// Overlay note: a real row menu portals its card over the page and dismisses on
// outside click. Here, for the docs playground (which has no portal/Modal), the
// open menu renders INLINE directly below the trigger as a floating card so the
// preview is never covered. The `open` boolean (default true) keeps it shown.
//
// Style axes are limited: `links` selects the kind, `sectionLabel` toggles the
// heading. There is no two-flag stacking, so no per-axis precedence to resolve;
// the per-item `destructive` flag is the only row-level variant and it is scoped
// to its own row.

export interface RowMenuItem {
  label: string;
  /** Optional leading glyph rendered before the label (a single character). */
  icon?: string;
  /** Red-tinted row for destructive actions (e.g. Delete). */
  destructive?: boolean;
  /** Draw a hairline separator above this row to start a new group. */
  separatorBefore?: boolean;
}

export interface RowMenuProps {
  /** The menu rows, top to bottom. */
  items: RowMenuItem[];
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean;
  /** Fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Render rows as navigation links rather than action buttons. */
  links?: boolean;
  /** Show a muted section label heading the menu. */
  sectionLabel?: string;
  /** Fired with the selected item and its index when a row is pressed. */
  onSelect?: (item: RowMenuItem, index: number) => void;
  className?: string;
}

const TRIGGER =
  "w-8 h-8 items-center justify-center rounded-md active:bg-accent";
const MENU_CARD =
  "min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-lg";
const ITEM_ROW =
  "flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent";
const MENU_LABEL = "px-2 py-1.5 text-xs font-medium text-muted-foreground";

function rowTextColor(item: RowMenuItem, links: boolean): string {
  if (item.destructive) return "text-red-600 dark:text-red-400";
  return links ? "text-foreground" : "text-popover-foreground";
}

export function RowMenu(props: RowMenuProps) {
  const { items, links = false, sectionLabel, onSelect, onOpenChange, className } =
    props;
  // Uncontrolled by default: the ⋯ trigger toggles the menu (closed), a select
  // closes it; a controlled `open` prop overrides this.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = props.open ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (props.open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    // self-start keeps the trigger from stretching; relative anchors the menu.
    <View className={cn("relative self-start", className)}>
      <Pressable className={TRIGGER} onPress={() => setOpen(!open)} accessibilityRole="button">
        <Text className="text-base text-foreground">⋯</Text>
      </Pressable>

      {open ? (
        <View className={cn(MENU_CARD, "absolute top-full left-0 z-50 mt-1")}>
          {sectionLabel ? (
            <Text className={MENU_LABEL}>{sectionLabel}</Text>
          ) : null}
          {items.map((item, index) => (
            <View key={`${item.label}-${index}`}>
              {item.separatorBefore ? (
                <View className="my-1 h-px bg-border" />
              ) : null}
              <Pressable
                className={ITEM_ROW}
                onPress={() => { onSelect?.(item, index); setOpen(false); }}
                accessibilityRole={links ? "link" : "menuitem"}
              >
                {item.icon ? (
                  <Text className={cn("text-sm", rowTextColor(item, links))}>
                    {item.icon}
                  </Text>
                ) : null}
                <Text className={cn("text-sm", rowTextColor(item, links))}>
                  {item.label}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
