import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";
import { Button } from "./button.js";

// Dropdown: a trigger button plus a floating menu of action rows. The menu is a
// popover-surfaced card with item rows (each an optional leading icon glyph, a
// label, and an optional trailing keyboard shortcut), hairline separators
// between groups, and red-tinted destructive rows.
//
// Overlay note: a real dropdown portals its menu over the page and dismisses on
// outside click. Here, for the docs playground (which has no portal/Modal), the
// open menu renders INLINE directly below the trigger via a floating card so the
// preview is never covered. The `open` boolean (default true) keeps it shown.
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
  /** Label for the outline trigger button. */
  trigger: string;
  /** Optional muted section heading rendered above the rows (e.g. "Actions"). */
  label?: string;
  /** The menu rows, top to bottom. */
  items: DropdownItem[];
  /** Whether the menu is shown below the trigger. Open by default for the docs. */
  open?: boolean;
  /** Fired with the selected item and its index when a row is pressed. */
  onSelect?: (item: DropdownItem, index: number) => void;
  className?: string;
}

const MENU_CARD =
  "min-w-[200px] rounded-md border border-border bg-popover p-1 shadow-lg";
const ITEM_ROW =
  "flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent";

export function Dropdown(props: DropdownProps) {
  const { trigger, label, items, open = true, onSelect, className } = props;

  return (
    // self-start keeps the trigger from stretching; relative anchors the menu.
    <Box className={cn("relative self-start", className)}>
      <Button outline small>
        {trigger}
      </Button>

      {open ? (
        <Box className={cn(MENU_CARD, "mt-1")}>
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
                onPress={item.disabled ? undefined : () => onSelect?.(item, index)}
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
