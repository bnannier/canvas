import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

// Shared Radio shell. Uses React Native's primitives DIRECTLY and reads the active
// brand tokens via useTheme, so colors follow light/dark and the glass surface. The
// shared structure (the ring + dot + label row, the size precedence, accessibility,
// the controlled checked/selected alias, the onChange handler) lives here once; a
// platform file supplies only its skin (ring shape/sizing/border, dot fill, press
// feedback) and calls createRadio. iOS has no native radio, so every skin is
// hand-drawn from the brand tokens — no platform default color ever leaks in.
//
// A radio is a single circular control that fills with a centered dot when it is the
// chosen option in its group. The group (one selected option at a time) is the
// caller's job; this component renders one control in the state it is told to
// (controlled). Selecting swaps the ring from the neutral input border to primary
// and reveals the primary dot.

export interface RadioProps {
  /** Whether this control is the selected option (controlled). */
  checked?: boolean;
  /** Alias for `checked`, for callers that think in terms of "selected". */
  selected?: boolean;
  /** Fired on press with the next checked value (always true for a radio). */
  onChange?: (checked: boolean, event: GestureResponderEvent) => void;
  /** E2E hook forwarded to the pressable row. */
  testID?: string;
  /** Label text shown beside the control. */
  children?: ReactNode;
  // Size (pick one; default is the 16px control).
  small?: boolean;
  large?: boolean;
  /** Dim the control and block presses. */
  disabled?: boolean;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

export type Size = "small" | "default" | "large";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: RadioProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// The only thing a platform skin owns: the ring, dot, and label styles for a given
// state and size, plus the press/disabled feedback. Everything else is the shell.
export interface RadioSkin {
  /** The circular control. `checked` swaps the neutral border for primary. `nudge` aligns the ring to a label's first line. */
  ring: (tokens: ColorTokens, size: Size, checked: boolean, nudge: boolean) => ViewStyle;
  /** The centered fill dot, rendered only when checked. */
  dot: (tokens: ColorTokens, size: Size) => ViewStyle;
  /** The label text to the right of the ring. */
  label: (tokens: ColorTokens, size: Size, disabled: boolean) => TextStyle;
  /** Opacity applied to the row when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the row on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the ring; null on iOS/web. */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean; radius?: number }) | null;
}

// The pressable row: control beside an optional label, control top-aligned so a
// multi-line label hangs from the ring's first line.
const ROW: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8 };

/** Build a Radio component from a platform skin. */
export function createRadio(skin: RadioSkin) {
  return function Radio(props: RadioProps) {
    const { checked, selected, onChange, children, disabled, style } = props;
    const isChecked = !!(checked ?? selected);
    const size = sizeOf(props);
    const { tokens } = useTheme();

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <Pressable
        onPress={(event) => onChange?.(true, event)}
        disabled={disabled}
        testID={props.testID}
        // Icon-only (no label): grow the small ring's tap target toward ~44pt.
        // With a label the whole row is already a generous target, so leave it.
        hitSlop={children == null ? 8 : undefined}
        accessibilityRole="radio"
        accessibilityState={{ checked: isChecked, disabled: !!disabled }}
        aria-checked={isChecked}
        android_ripple={ripple}
        style={({ pressed }) => [
          ROW,
          disabled ? { opacity: skin.disabledOpacity } : null,
          skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          style,
        ]}
      >
        <View style={skin.ring(tokens, size, isChecked, children != null)}>
          {isChecked ? <View style={skin.dot(tokens, size)} /> : null}
        </View>
        {children != null ? <Text style={skin.label(tokens, size, !!disabled)}>{children}</Text> : null}
      </Pressable>
    );
  };
}
