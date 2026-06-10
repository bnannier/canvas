import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./checkbox.styles.js";
import { type Size } from "./checkbox.styles.js";

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
  // Size (pick one; default is the base 16px box).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: CheckboxProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

export function Checkbox(props: CheckboxProps) {
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

  const row: StyleProp<ViewStyle> = [s.row, disabled ? { opacity: 0.5 } : null, style];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? "mixed" : !!checked, disabled: !!disabled }}
      style={({ pressed }) => [row, pressed ? { opacity: 0.9 } : null]}
    >
      <View style={[s.boxBase, s.boxSize(size), s.boxFill(tokens, filled)]}>
        {filled ? <Text style={s.glyph(tokens, size)}>{glyph}</Text> : null}
      </View>
      {children != null ? <Text style={s.label(tokens, size)}>{children}</Text> : null}
    </Pressable>
  );
}
