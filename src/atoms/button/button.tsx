import { type ReactNode } from "react";
import { ActivityIndicator, Platform, type GestureResponderEvent } from "react-native";
import { Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import {
  type Intent,
  type Size,
  FG_TOKEN,
  containerBase,
  sizePad,
  intentContainer,
  labelBase,
  sizeLabel,
  intentLabel,
} from "./button.styles.js";

export interface ButtonProps {
  children?: ReactNode;
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

// Intents with a dark fill take a light ripple; the rest (light/transparent fills)
// take a dark one, so the Android press ripple reads on every variant.
const DARK_FILL = new Set<Intent>(["primary", "destructive"]);

export function Button(props: ButtonProps) {
  const { children, onPress, loading, disabled, block, icon, style } = props;
  const intent = intentOf(props);
  const size = sizeOf(props);
  const { tokens } = useTheme();

  // Native Android press feedback (the Material ripple), brand look otherwise.
  // No-op on iOS/web, which get the pressed-opacity swap below.
  const androidRipple =
    Platform.OS === "android"
      ? { color: DARK_FILL.has(intent) ? "rgba(255, 255, 255, 0.24)" : "rgba(0, 0, 0, 0.1)", borderless: false }
      : undefined;

  const container: StyleProp<ViewStyle> = [
    containerBase,
    sizePad(size, !!icon),
    intentContainer(tokens, intent),
    block ? { width: "100%" } : null,
    disabled || loading ? { opacity: 0.5 } : null,
    style,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      android_ripple={androidRipple}
      style={({ pressed }) => [container, pressed ? { opacity: 0.9 } : null]}
    >
      {loading ? <ActivityIndicator size="small" color={tokens[FG_TOKEN[intent]]} /> : null}
      {children != null ? (
        <Text style={[labelBase, sizeLabel(size), intentLabel(tokens, intent)]}>{children}</Text>
      ) : null}
    </Pressable>
  );
}
