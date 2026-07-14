import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { useRadioGroup } from "./radio-context.js";

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
  /**
   * This option's value within a RadioGroup. When the radio sits inside a
   * `<RadioGroup>`, its checked state and selection are driven by the group
   * matching this value; ignored for a standalone radio.
   */
  value?: string | number;
  /** Whether this control is the selected option (controlled; standalone use). */
  checked?: boolean;
  /** Alias for `checked`, for callers that think in terms of "selected". */
  selected?: boolean;
  /** Fired on press with the next checked value (always true for a radio). */
  onChange?: (checked: boolean, event: GestureResponderEvent) => void;
  /** E2E hook forwarded to the pressable row. */
  testID?: string;
  /** Label text (the option's title) shown beside the control. */
  children?: ReactNode;
  /**
   * Optional muted secondary line rendered under the label, for the common
   * title-plus-description option (a plan picker, a settings choice). Supplying it
   * builds the stacked title/description layout inside the control, so the caller
   * never hand-composes a Row + Column + two Typography nodes per option.
   */
  description?: ReactNode;
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
  /** The muted secondary description line, rendered under the label when present. */
  description: (tokens: ColorTokens, size: Size, disabled: boolean) => TextStyle;
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

// Stacks the title over its description beside the ring. The 8px gap matches the
// kit's default column spacing (the arrangement callers used to hand-compose), so
// the built-in layout reproduces the established look. `flexShrink` lets a long
// description wrap within the row instead of forcing the row wider.
const TEXT_COLUMN: ViewStyle = { flexShrink: 1, gap: 8 };

/** Build a Radio component from a platform skin. */
export function createRadio(skin: RadioSkin) {
  return function Radio(props: RadioProps) {
    const { checked, selected, onChange, children, description, style } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();
    // Whether the control carries any text at all (title and/or description).
    const hasText = children != null || description != null;

    // Inside a RadioGroup the group owns selection: this radio reads checked from
    // the group matching its `value`, and pressing it tells the group to select
    // that value. Standalone, it stays a controlled radio driven by checked/
    // selected. The group can also disable the whole set.
    const group = useRadioGroup();
    const inGroup = group != null && props.value !== undefined;
    const isChecked = inGroup ? group.value === props.value : !!(checked ?? selected);
    const disabled = !!props.disabled || !!group?.disabled;

    const handlePress = (event: GestureResponderEvent) => {
      if (inGroup) group.select(props.value as string | number, event);
      onChange?.(true, event);
    };

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    // Roving-focus wiring from the group (web arrow-key nav): the group makes only
    // the selected radio a tab stop and the arrows move + select. `ref` passes
    // explicitly; `focusable`/`tabIndex`/`onKeyDown` ride through a cast (RN's
    // Pressable types omit onKeyDown). Undefined for a standalone radio.
    const roving = inGroup ? group.itemProps?.(props.value as string | number) : undefined;
    const rovingProps = roving
      ? { focusable: roving.focusable, tabIndex: roving.tabIndex, onKeyDown: roving.onKeyDown }
      : {};

    return (
      <Pressable
        ref={roving?.ref}
        {...(rovingProps as object)}
        onPress={handlePress}
        disabled={disabled}
        testID={props.testID}
        // Icon-only (no text): grow the small ring's tap target toward ~44pt.
        // With a label the whole row is already a generous target, so leave it.
        hitSlop={!hasText ? 8 : undefined}
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
        <View style={skin.ring(tokens, size, isChecked, hasText)}>
          {isChecked ? <View style={skin.dot(tokens, size)} /> : null}
        </View>
        {hasText ? (
          description != null ? (
            <View style={TEXT_COLUMN}>
              {children != null ? <Text style={skin.label(tokens, size, !!disabled)}>{children}</Text> : null}
              <Text style={skin.description(tokens, size, !!disabled)}>{description}</Text>
            </View>
          ) : (
            <Text style={skin.label(tokens, size, !!disabled)}>{children}</Text>
          )
        ) : null}
      </Pressable>
    );
  };
}
