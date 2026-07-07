import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { Pressable, View, Text, useTheme, useControllableState, type ColorTokens, type ViewStyle } from "../../style/index.js";

// Shared Switch shell. Uses React Native's primitives DIRECTLY (no engine className
// layer) and reads the active brand tokens via useTheme, so colors follow light/dark.
// The shared structure (label/description row, accessibility, toggle, sizing) lives
// here once; a platform file supplies only its track + thumb styles (a SwitchSkin)
// and calls createSwitch. Styles are plain RN objects, which work on iOS, Android,
// and web alike (a real .css file would only work on the web).

export interface SwitchProps {
  /** Controlled on/off state; omit for uncontrolled use. */
  checked?: boolean;
  /** Initial state for uncontrolled use (a bare <Switch /> is interactive). */
  defaultChecked?: boolean;
  /** Fired with the next checked value when the switch is toggled (both modes). */
  onChange?: (next: boolean) => void;
  /** Alias of onChange, for parity with RN's value-style callbacks. */
  onValueChange?: (next: boolean) => void;
  /** E2E hook forwarded to the pressable row. */
  testID?: string;
  // Size (pick one; default is the standard track).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Optional label, rendered to the left of the track. */
  children?: ReactNode;
  /** Optional muted description line, rendered under the label. */
  description?: ReactNode;
  /**
   * Accessible name for the switch when no visible `children` label is rendered
   * (e.g. a switch embedded in an Action Panel whose label sits in sibling Text).
   * Without it, a label-less switch announces only "switch, on/off".
   */
  accessibilityLabel?: string;
  /** Extra style on the row, applied last. */
  style?: ViewStyle;
}

export type Size = "small" | "base" | "large";

function sizeOf(p: SwitchProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// The only thing a platform skin owns: the track and thumb styles for a given
// on/off state and size, built from the active tokens. Everything else is the
// shell. `dark` is threaded in (like dropdown/badge) so a skin can pick a
// scheme-specific off-track gray that the generic `input` token does not provide
// (the iOS off track is a solid mid-gray in light mode, systemGray3).
export interface SwitchSkin {
  track: (tokens: ColorTokens, dark: boolean, checked: boolean, size: Size) => ViewStyle;
  thumb: (tokens: ColorTokens, checked: boolean, size: Size) => ViewStyle;
}

const LABEL_FONT: Record<Size, number> = { small: 12, base: 14, large: 16 };
const DESC_FONT: Record<Size, number> = { small: 11, base: 12, large: 14 };

/** Build a Switch component from a platform skin. */
export function createSwitch(skin: SwitchSkin) {
  return function Switch(props: SwitchProps) {
    const { onChange, onValueChange, disabled, children, description, accessibilityLabel, style } = props;
    const { tokens, dark } = useTheme();
    const size = sizeOf(props);

    // Controlled when `checked` is provided, self-managed otherwise, so a bare
    // <Switch /> toggles out of the box (the standard library contract).
    const [checked, setChecked] = useControllableState<boolean>(
      props.checked,
      props.defaultChecked ?? false,
      (next) => {
        onChange?.(next);
        onValueChange?.(next);
      },
    );

    const handlePress = (_event: GestureResponderEvent) => {
      setChecked(!checked);
    };

    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        testID={props.testID}
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
        accessibilityState={{ checked, disabled: !!disabled }}
        aria-checked={checked}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
            alignItems: description != null ? "flex-start" : "center",
          },
          disabled ? { opacity: 0.5 } : null,
          pressed ? { opacity: 0.9 } : null,
          style,
        ]}
      >
        {children != null || description != null ? (
          <View>
            {children != null ? (
              <Text style={{ fontWeight: "500", color: tokens.foreground, fontSize: LABEL_FONT[size] }}>{children}</Text>
            ) : null}
            {description != null ? (
              <Text style={{ color: tokens["muted-foreground"], fontSize: DESC_FONT[size] }}>{description}</Text>
            ) : null}
          </View>
        ) : null}
        <View style={skin.track(tokens, dark, checked, size)}>
          <View style={skin.thumb(tokens, checked, size)} />
        </View>
      </Pressable>
    );
  };
}
