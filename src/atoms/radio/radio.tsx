import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./radio.styles.js";
import { type Size } from "./radio.styles.js";

// A radio is a single circular control that fills with a centered dot when it is
// the chosen option in its group. It pairs with an optional label and supports a
// disabled state. The group (one selected option at a time) is the caller's job;
// this component renders one control in the state it is told to (controlled).
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf and Avatar's sizeOf).
// Selection is a controlled boolean (`checked`, aliased `selected`); size picks
// the ring/dot diameter and the label type; `disabled` dims and blocks the
// press. Selecting swaps the ring from the neutral input border to primary and
// reveals the primary dot.

export interface RadioProps {
  /** Whether this control is the selected option (controlled). */
  checked?: boolean;
  /** Alias for `checked`, for callers that think in terms of "selected". */
  selected?: boolean;
  /** Fired on press with the next checked value (always true for a radio). */
  onChange?: (checked: boolean, event: GestureResponderEvent) => void;
  /** Label text shown beside the control. */
  children?: ReactNode;
  // Size (pick one; default is the 16px control).
  small?: boolean;
  large?: boolean;
  /** Dim the control and block presses. */
  disabled?: boolean;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: RadioProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

export function Radio(props: RadioProps) {
  const { checked, selected, onChange, children, disabled, style } = props;
  const isChecked = !!(checked ?? selected);
  const size = sizeOf(props);
  const { tokens } = useTheme();

  return (
    <Pressable
      style={[s.root, disabled ? { opacity: 0.5 } : null, style]}
      onPress={(event) => onChange?.(true, event)}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled: !!disabled }}
    >
      <View style={s.ring(tokens, size, isChecked, children != null)}>
        {isChecked ? <View style={s.dot(tokens, size)} /> : null}
      </View>
      {children != null ? <Text style={s.label(tokens, size, !!disabled)}>{children}</Text> : null}
    </Pressable>
  );
}
