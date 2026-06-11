import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

// Shared Checkbox shell. Uses React Native's primitives DIRECTLY and reads the
// active brand tokens via useTheme, so colors follow light/dark and the glass
// surface. The shared structure (the box + glyph + label row, the size precedence,
// accessibility, onChange/onValueChange, indeterminate) lives here once; a platform
// file supplies only its skin (box shape/sizing/border, glyph color, press feedback)
// and calls createCheckbox. iOS has no native checkbox, so every skin is hand-drawn
// from the brand tokens — no platform default color ever leaks in.

export interface CheckboxProps {
  children?: ReactNode;
  /** Controlled checked state. The component renders exactly this value. */
  checked?: boolean;
  /**
   * Mixed state: some-but-not-all selected. Shown as a dash, not a tick.
   * Takes visual precedence over `checked`.
   */
  indeterminate?: boolean;
  /** Fired with the next checked value when the row is pressed. */
  onChange?: (next: boolean) => void;
  /** Alias of onChange, for parity with RN's value-style callbacks. */
  onValueChange?: (next: boolean) => void;
  // Size (pick one; default is the base box).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<ViewStyle>;
}

export type Size = "small" | "base" | "large";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: CheckboxProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// The only thing a platform skin owns: the box, glyph, and label styles for a given
// state and size, plus the press/disabled feedback. Everything else is the shell.
export interface CheckboxSkin {
  /** The square box. `filled` = checked or indeterminate. */
  box: (tokens: ColorTokens, filled: boolean, size: Size) => ViewStyle;
  /** The check / dash glyph inside a filled box. */
  glyph: (tokens: ColorTokens, size: Size) => TextStyle;
  /** The label text to the right of the box. */
  label: (tokens: ColorTokens, size: Size) => TextStyle;
  /** Opacity applied to the row when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the row on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the box; null on iOS/web. */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean; radius?: number }) | null;
}

// The row: box + optional label, top-aligned so a multi-line label hangs from the box.
const ROW: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8 };

/** Build a Checkbox component from a platform skin. */
export function createCheckbox(skin: CheckboxSkin) {
  return function Checkbox(props: CheckboxProps) {
    const { children, checked, indeterminate, onChange, onValueChange, disabled, style } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();
    // Indeterminate reads as "selected-ish": fill the box like a checked state.
    const filled = indeterminate || !!checked;
    const glyph = indeterminate ? "–" : "✓"; // en dash : check mark

    const handlePress = (_event: GestureResponderEvent) => {
      const next = !checked;
      onChange?.(next);
      onValueChange?.(next);
    };

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: indeterminate ? "mixed" : !!checked, disabled: !!disabled }}
        android_ripple={ripple}
        style={({ pressed }) => [
          ROW,
          disabled ? { opacity: skin.disabledOpacity } : null,
          skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          style,
        ]}
      >
        <View style={skin.box(tokens, filled, size)}>
          {filled ? <Text style={skin.glyph(tokens, size)}>{glyph}</Text> : null}
        </View>
        {children != null ? <Text style={skin.label(tokens, size)}>{children}</Text> : null}
      </Pressable>
    );
  };
}
