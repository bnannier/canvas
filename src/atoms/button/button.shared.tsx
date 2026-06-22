import { type ReactNode } from "react";
import { ActivityIndicator, type GestureResponderEvent } from "react-native";
import { Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type ButtonSkin, type Intent, type Size, FG_TOKEN } from "./button.styles.js";

// Shared Button shell. The structure (Pressable + optional loading spinner +
// leading icon + label + trailing icon), the accessibility, and the intent/size
// precedence live here once; a platform file supplies only its skin (shape,
// sizing, label weight, press feedback) and calls createButton.

export interface ButtonProps {
  children?: ReactNode;
  /**
   * An icon element rendered before the label (e.g. a lucide or Canvas `Icon`).
   * It renders directly (not wrapped in the label `Text`, which cannot host an
   * SVG), spaced from the label by the skin's gap. Pass `iconLeft` alone with
   * the `icon` size prop for an icon-only square button. The caller sizes and
   * colors the icon (use the intent's foreground for non-ghost intents).
   */
  iconLeft?: ReactNode;
  /** An icon element rendered after the label (e.g. a trailing chevron/arrow). */
  iconRight?: ReactNode;
  /** Accessibility label, required for an icon-only button (no text to read). */
  accessibilityLabel?: string;
  onPress?: (event: GestureResponderEvent) => void;
  // Intent (pick one; default is the primary action).
  primary?: boolean;
  secondary?: boolean;
  destructive?: boolean;
  outline?: boolean;
  ghost?: boolean;
  link?: boolean;
  // Size (pick one).
  small?: boolean;
  large?: boolean;
  icon?: boolean;
  // Layout and state.
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /**
   * Marks the Button as a disclosure/menu trigger and announces its open state to
   * assistive tech (aria-expanded, which react-native-web forwards and RN maps back
   * to the native expanded state). Pass the live open boolean; omit for a plain
   * button. So a Button that toggles a Dropdown/Popover stays accessible.
   */
  expanded?: boolean;
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// Intent precedence when more than one is passed: first match wins.
function intentOf(p: ButtonProps): Intent {
  if (p.primary) return "primary";
  if (p.destructive) return "destructive";
  if (p.secondary) return "secondary";
  if (p.outline) return "outline";
  if (p.ghost) return "ghost";
  if (p.link) return "link";
  return "primary";
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: ButtonProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "base";
}

/** Build a Button component from a platform skin. */
export function createButton(skin: ButtonSkin) {
  return function Button(props: ButtonProps) {
    const { children, iconLeft, iconRight, accessibilityLabel, onPress, loading, disabled, block, icon, style } = props;
    const { tokens } = useTheme();
    const intent = intentOf(props);
    const size = sizeOf(props);

    const container = skin.container(tokens, intent, size, { icon: !!icon, block: !!block, dim: !!(disabled || loading) });
    const ripple = skin.ripple ? skin.ripple(tokens, intent) : undefined;

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        aria-expanded={props.expanded}
        android_ripple={ripple}
        style={({ pressed }) => [
          container,
          skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          style,
        ]}
      >
        {loading ? <ActivityIndicator size="small" color={tokens[FG_TOKEN[intent]]} /> : null}
        {!loading && iconLeft != null ? iconLeft : null}
        {children != null ? <Text style={skin.label(tokens, intent, size)}>{children}</Text> : null}
        {!loading && iconRight != null ? iconRight : null}
      </Pressable>
    );
  };
}
