import { View, Pressable, Text, useTheme, surfaceRipple, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Checkbox } from "../checkbox/checkbox.js";
import * as s from "./listbox.styles.js";
import { type Mode, type Size } from "./listbox.styles.js";

// An inline, selectable list of options rendered directly (not a popover). Each
// row is a Pressable. Two selection modes, mutually exclusive:
//
// 1. Single-select (default): the chosen row is filled with the accent and shows
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
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Selection mode precedence when more than one axis prop is passed: first match
// wins. Only `multi` competes here; the default is single-select.
function modeOf(p: ListboxProps): Mode {
  if (p.multi) return "multi";
  return "single";
}

// Size precedence when more than one is passed: first match wins (small over
// large). The default is medium.
function sizeOf(p: ListboxProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "medium";
}

export function Listbox(props: ListboxProps) {
  const { items, bordered, disabled, onSelect, style } = props;
  const mode = modeOf(props);
  const size = sizeOf(props);
  const { tokens } = useTheme();

  const container: StyleProp<ViewStyle> = [
    bordered ? s.containerBordered(tokens) : null,
    disabled ? { opacity: 0.5 } : null,
    style,
  ];

  return (
    <View style={container} accessibilityRole="list">
      {items.map((item, index) => {
        const selected = !!item.selected;
        // Single-select fills the chosen row; multi-select leaves the row plain
        // and reflects state in the leading Checkbox instead.
        const rowBase: StyleProp<ViewStyle> = [
          s.rowBase,
          s.rowSize[size],
          mode === "single" && selected ? s.rowSelected(tokens) : null,
        ];

        return (
          <Pressable
            key={index}
            // Android shows the Material ripple; the press fill (the old
            // `active:bg-accent`) is the accent, applied only when enabled.
            android_ripple={surfaceRipple(tokens)}
            style={({ pressed }) => [rowBase, !disabled && pressed ? s.rowSelected(tokens) : null]}
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
              <Text style={s.checkmark(tokens)}>{selected ? "✓" : ""}</Text>
            )}
            <View style={s.textStack}>
              <Text style={s.label(tokens, size)}>{item.label}</Text>
              {item.detail != null ? <Text style={s.detail(tokens)}>{item.detail}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
