import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { Pressable, View, Text, useTheme, type ColorTokens, type ViewStyle } from "../../style/index.js";

// Shared Switch shell. Uses React Native's primitives DIRECTLY (no engine className
// layer) and reads the active brand tokens via useTheme, so colors follow light/dark.
// The shared structure (label/description row, accessibility, toggle, sizing) lives
// here once; a platform file supplies only its track + thumb styles (a SwitchSkin)
// and calls createSwitch. Styles are plain RN objects, which work on iOS, Android,
// and web alike (a real .css file would only work on the web).

export interface SwitchProps {
  /** Controlled on/off state. The component renders exactly this value. */
  checked?: boolean;
  /** Fired with the next checked value when the switch is toggled. */
  onChange?: (next: boolean) => void;
  /** Alias of onChange, for parity with RN's value-style callbacks. */
  onValueChange?: (next: boolean) => void;
  // Size (pick one; default is the standard track).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Optional label, rendered to the left of the track. */
  children?: ReactNode;
  /** Optional muted description line, rendered under the label. */
  description?: ReactNode;
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
// on/off state and size, built from the active tokens. Everything else is the shell.
export interface SwitchSkin {
  track: (tokens: ColorTokens, checked: boolean, size: Size) => ViewStyle;
  thumb: (tokens: ColorTokens, checked: boolean, size: Size) => ViewStyle;
}

const LABEL_FONT: Record<Size, number> = { small: 12, base: 14, large: 16 };
const DESC_FONT: Record<Size, number> = { small: 11, base: 12, large: 14 };

/** Build a Switch component from a platform skin. */
export function createSwitch(skin: SwitchSkin) {
  return function Switch(props: SwitchProps) {
    const { checked = false, onChange, onValueChange, disabled, children, description, style } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);

    const handlePress = (_event: GestureResponderEvent) => {
      const next = !checked;
      onChange?.(next);
      onValueChange?.(next);
    };

    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked, disabled: !!disabled }}
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
        <View style={skin.track(tokens, checked, size)}>
          <View style={skin.thumb(tokens, checked, size)} />
        </View>
      </Pressable>
    );
  };
}
