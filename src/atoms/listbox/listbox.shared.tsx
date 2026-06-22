import { View, Pressable, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Checkbox } from "../checkbox/checkbox.js";

// Shared Listbox shell. An inline, selectable list of options rendered directly
// (not a popover). Each row is a Pressable. Two selection modes, mutually
// exclusive:
//
// 1. Single-select (default): the chosen row is filled with the accent and shows
//    a leading checkmark ("✓"); at most one row is the value.
// 2. Multi-select (`multi`): every row carries a leading Checkbox reflecting its
//    own selected state, and any number of rows may be selected at once.
//
// The structure (rows, leading control, label/detail stack), the boolean-prop
// axes (mode + size precedence, mirroring Button's intentOf), accessibility, and
// the semantic color logic live here once; a platform file supplies only its
// skin (shape, padding, label type, press feedback) and calls createListbox.
//
// Listbox is a "Shared" platform treatment: iOS has no native listbox control
// (one-of-a-list selection is a pop-up button / picker menu there) and Material 3
// has no listbox either (the exposed dropdown menu is the select idiom), so the
// single web look (Catalyst's listbox) is correct on every platform. The skin is
// therefore identical across iOS / Android / web.

export type Mode = "single" | "multi";
export type Size = "small" | "medium" | "large";

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

// The per-OS-varying style pieces a platform skin owns. For the Shared treatment
// these are identical across platforms, but they live in the skin so the file
// structure matches the rest of the kit and a future divergence is a one-line
// change. Color-bearing pieces are functions of the active tokens (so the
// bordered surface, the selected/press fill, and the label/detail colors follow
// light/dark and the glass surface via tokens.popover/accent); layout-only
// fragments are static objects. `ripple` / `pressedOpacity` express the press
// feedback (Android ripple vs. opacity dim) the platform applies.
export interface ListboxSkin {
  /** A bordered container reads as a popover surface: rounded card, hairline border, popover fill, inset. */
  containerBordered: (tokens: ColorTokens) => ViewStyle;
  /** Each row: a horizontal flex shell with a leading control + label stack. */
  rowBase: ViewStyle;
  /** Per-row vertical padding by size. */
  rowSize: Record<Size, ViewStyle>;
  /** The accent fill used for a selected single-select row and the press state. */
  rowSelected: (tokens: ColorTokens) => ViewStyle;
  /** Single-select checkmark column: a fixed-width gutter reserved on every row. */
  checkmark: (tokens: ColorTokens) => TextStyle;
  /** Label/detail stack: grows to fill the remaining row width. */
  textStack: ViewStyle;
  /** Label type + color per size. */
  label: (tokens: ColorTokens, size: Size) => TextStyle;
  /** Muted detail line type + color. */
  detail: (tokens: ColorTokens) => TextStyle;
  /** Android press ripple (a no-op off Android; null disables it). */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean }) | null;
  /** Pressed-row opacity dim (null leaves the look unchanged; the accent press fill carries the feedback). */
  pressedOpacity: number | null;
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

/** Build a Listbox component from a platform skin. */
export function createListbox(skin: ListboxSkin) {
  return function Listbox(props: ListboxProps) {
    const { items, bordered, disabled, onSelect, style } = props;
    const mode = modeOf(props);
    const size = sizeOf(props);
    const { tokens } = useTheme();

    const container: StyleProp<ViewStyle> = [
      bordered ? skin.containerBordered(tokens) : null,
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
            skin.rowBase,
            skin.rowSize[size],
            mode === "single" && selected ? skin.rowSelected(tokens) : null,
          ];

          return (
            <Pressable
              key={index}
              // Android shows the Material ripple (a no-op off Android). The
              // selected-style press fill (the old `active:bg-accent`) is the
              // accent, applied only when enabled; a skin may also add an opacity
              // dim via pressedOpacity.
              android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
              style={({ pressed }) => [
                rowBase,
                !disabled && pressed ? skin.rowSelected(tokens) : null,
                skin.pressedOpacity != null && !disabled && pressed ? { opacity: skin.pressedOpacity } : null,
              ]}
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
                <Text style={skin.checkmark(tokens)}>{selected ? "✓" : ""}</Text>
              )}
              <View style={skin.textStack}>
                <Text style={skin.label(tokens, size)}>{item.label}</Text>
                {item.detail != null ? <Text style={skin.detail(tokens)}>{item.detail}</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };
}
