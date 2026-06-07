import { useState, type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";
import { Button } from "./button.js";

// Dropdown: a trigger plus a floating menu of action rows. The menu is a
// popover-surfaced card with item rows (each an optional leading icon glyph, a
// label, and an optional trailing keyboard shortcut), hairline separators
// between groups, and red-tinted destructive rows.
//
// The trigger defaults to an outline button labelled by `trigger`. Pass
// `children` to supply a CUSTOM trigger instead (e.g. an avatar account chip in
// a topbar): the children render in place of the button, inside a Pressable that
// toggles the menu. Either way the menu rows still come from `items`.
//
// Overlay note: a real dropdown portals its menu over the page and dismisses on
// outside click. Here, for the docs playground (which has no portal/Modal), the
// open menu renders as a floating card positioned absolutely below the trigger
// (the wrapper is `relative`), so it overflows its container, e.g. the playground
// stage, instead of growing it.
//
// There are no visual style axes on the menu itself, so there is no boolean-prop
// precedence to resolve; the per-item `destructive` flag is the only variant and
// it is scoped to its own row.

export interface DropdownItem {
  label: string;
  /** Optional leading glyph rendered before the label (a single character). */
  icon?: string;
  /** Optional trailing keyboard shortcut, right-aligned and muted. */
  shortcut?: string;
  /** Red-tinted row for destructive actions (e.g. Delete). */
  destructive?: boolean;
  /** Dimmed, non-interactive row: skips onSelect and renders at reduced opacity. */
  disabled?: boolean;
  /** Draw a hairline separator above this row to start a new group. */
  separatorBefore?: boolean;
}

export interface DropdownProps {
  /** Label for the default outline trigger button. Omit when supplying a custom
   *  trigger via `children`. */
  trigger?: string;
  /** A custom trigger rendered in place of the default outline button, e.g. an
   *  avatar account chip. It is wrapped in a Pressable that toggles the menu;
   *  the menu itself still comes from `items`. */
  children?: ReactNode;
  /** Optional muted section heading rendered above the rows (e.g. "Actions"). */
  label?: string;
  /** The menu rows, top to bottom. */
  items: DropdownItem[];
  /** Controlled open state. Omit for uncontrolled (the trigger opens/closes it). */
  open?: boolean;
  /** Fired when the open state changes (trigger press, select, etc.). */
  onOpenChange?: (open: boolean) => void;
  /** Fired with the selected item and its index when a row is pressed. */
  onSelect?: (item: DropdownItem, index: number) => void;
  className?: string;
}

// The menu's width floor. A menu under a small trigger (e.g. an outline button)
// stays at least this wide; a wider trigger (an account chip) sets the width.
const MENU_MIN_WIDTH = 200;
const MENU_CARD = "rounded-md border border-border bg-popover p-1 shadow-lg";
const ITEM_ROW =
  "flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent";

export function Dropdown(props: DropdownProps) {
  const { trigger, children, label, items, open: openProp, onOpenChange, onSelect, className } = props;
  // Uncontrolled by default (Headless-UI style): the trigger opens/closes the
  // menu and a select closes it; a controlled `open` prop overrides this.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // Match the menu width to the trigger (and let longer rows grow past it), so a
  // wide trigger like a topbar account chip gets a menu of the same width.
  // Measured via the wrapper's layout; the menu is absolute, so it never feeds
  // back into this width.
  const [triggerWidth, setTriggerWidth] = useState(0);

  return (
    // self-start keeps the trigger from stretching; relative anchors the menu.
    <Box
      className={cn("relative self-start", className)}
      onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)}
    >
      {children != null ? (
        <Pressable
          className="self-start"
          onPress={() => setOpen(!open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
        >
          {children}
        </Pressable>
      ) : (
        <Button outline small onPress={() => setOpen(!open)}>
          {trigger}
        </Button>
      )}

      {open ? (
        <Box
          className={cn(MENU_CARD, "absolute top-full left-0 z-50 mt-1")}
          style={{ minWidth: Math.max(triggerWidth, MENU_MIN_WIDTH) }}
        >
          {label ? (
            <Text className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {label}
            </Text>
          ) : null}
          {items.map((item, index) => (
            <Box key={`${item.label}-${index}`}>
              {item.separatorBefore ? (
                <Box className="my-1 h-px bg-border" />
              ) : null}
              <Pressable
                className={cn(ITEM_ROW, item.disabled && "opacity-50")}
                onPress={item.disabled ? undefined : () => { onSelect?.(item, index); setOpen(false); }}
                disabled={item.disabled}
                accessibilityRole="menuitem"
                accessibilityState={{ disabled: item.disabled }}
              >
                {item.icon ? (
                  <Text
                    className={cn(
                      "text-sm",
                      item.destructive
                        ? "text-red-600 dark:text-red-400"
                        : "text-popover-foreground",
                    )}
                  >
                    {item.icon}
                  </Text>
                ) : null}
                <Text
                  className={cn(
                    "text-sm",
                    item.destructive
                      ? "text-red-600 dark:text-red-400"
                      : "text-popover-foreground",
                  )}
                >
                  {item.label}
                </Text>
                {item.shortcut ? (
                  <Text className="ml-auto text-xs tracking-widest text-muted-foreground">
                    {item.shortcut}
                  </Text>
                ) : null}
              </Pressable>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
