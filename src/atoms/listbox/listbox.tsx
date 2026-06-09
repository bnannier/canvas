import { cn } from "../../cn.js";
import { View, Pressable, Text } from "../../engine/index.js";
import { Checkbox } from "../checkbox/checkbox.js";

// An inline, selectable list of options rendered directly (not a popover). Each
// row is a Pressable. Two selection modes, mutually exclusive:
//
// 1. Single-select (default): the chosen row is filled with bg-accent and shows
//    a leading checkmark ("✓"); at most one row is the value.
// 2. Multi-select (`multi`): every row carries a leading Checkbox reflecting its
//    own selected state, and any number of rows may be selected at once.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). `multi` switches the
// selection mode; `bordered` wraps the list in a rounded popover-surface card.

export interface ListboxItem {
  /** The option's primary text. */
  label: string;
  /** Optional secondary text shown under the label in a muted tone. */
  detail?: string;
  /** Whether this option is currently selected. */
  selected?: boolean;
}

export interface ListboxProps {
  /** The options to render, top to bottom. */
  items: ListboxItem[];
  /** Multi-select: each row gets a leading Checkbox instead of a single ✓. */
  multi?: boolean;
  /** Wrap the list in a rounded, bordered popover-surface card. */
  bordered?: boolean;
  // Size (pick one; default is medium).
  /** Tighter rows with smaller text. */
  small?: boolean;
  /** Taller rows. */
  large?: boolean;
  /** Dim the list and block selection. */
  disabled?: boolean;
  /** Fired with the pressed option's index. */
  onSelect?: (index: number) => void;
  className?: string;
}

// Selection mode precedence when more than one axis prop is passed: first match
// wins. Only `multi` competes here; the default is single-select.
type Mode = "single" | "multi";
function modeOf(p: ListboxProps): Mode {
  if (p.multi) return "multi";
  return "single";
}

// Size precedence when more than one is passed: first match wins (small over
// large). The default is medium.
type Size = "small" | "medium" | "large";
function sizeOf(p: ListboxProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "medium";
}

// Per-row vertical padding by size: small reads like the legacy h-8 trigger,
// medium like h-9, large like h-10.
const ROW_SIZE: Record<Size, string> = {
  small: "px-2 py-1.5",
  medium: "px-2 py-2",
  large: "px-2 py-2.5",
};

// Label text size tracks the row size.
const LABEL_SIZE: Record<Size, string> = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-sm",
};

// A bordered container reads as a popover surface: rounded card, hairline
// border, popover fill, and a 4px inset so rows don't touch the edge.
const CONTAINER_BORDERED = "rounded-md border border-border bg-popover p-1";

// Each row: a horizontal Pressable with a leading control, the label/detail
// stack, and a subtle press-state fill. Size adds the vertical padding.
const ROW_BASE = "flex-row items-center gap-2 rounded-sm";

export function Listbox(props: ListboxProps) {
  const { items, bordered, disabled, onSelect, className } = props;
  const mode = modeOf(props);
  const size = sizeOf(props);

  const container = cn(bordered && CONTAINER_BORDERED, disabled && "opacity-50", className);

  return (
    <View className={container} accessibilityRole="list">
      {items.map((item, index) => {
        const selected = !!item.selected;
        // Single-select fills the chosen row; multi-select leaves the row plain
        // and reflects state in the leading Checkbox instead.
        const row = cn(
          ROW_BASE,
          ROW_SIZE[size],
          !disabled && "active:bg-accent",
          mode === "single" && selected && "bg-accent",
        );

        return (
          <Pressable
            key={index}
            className={row}
            onPress={disabled ? undefined : () => onSelect?.(index)}
            disabled={disabled}
            accessibilityRole={mode === "multi" ? "checkbox" : "menuitem"}
            accessibilityState={{ selected, disabled: !!disabled }}
          >
            {mode === "multi" ? (
              <Checkbox checked={selected} />
            ) : (
              // Reserve the checkmark column on every row so labels stay aligned
              // whether or not the row is selected.
              <Text className="w-4 text-sm font-medium text-foreground">
                {selected ? "✓" : ""}
              </Text>
            )}
            <View className="flex-1">
              <Text className={cn("text-foreground", LABEL_SIZE[size])}>{item.label}</Text>
              {item.detail != null ? (
                <Text className="text-xs text-muted-foreground">{item.detail}</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
