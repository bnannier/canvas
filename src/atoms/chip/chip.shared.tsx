import { type ReactNode } from "react";
import { View, Text, Pressable, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";

// Shared Chip shell. The interactive/removable pill, so no call site hand-composes
// a `borderRadius + backgroundColor + padding` Pressable to build a filter chip,
// tag, or token. A Chip carries an optional leading icon and label, becomes
// tappable with `onPress` (a filter toggle), and grows a trailing "×" remove
// button with `onRemove`. Tone is a boolean axis (secondary / primary / outline);
// `primary` reads as the active/selected state.
//
// Chip is a "Light" platform treatment: one structure and semantic colors (here),
// with per-OS touches limited to the label type (in the skin).

export type Tone = "secondary" | "primary" | "outline";

export interface ChipSkin {
  /** Pill shape + padding + gap (medium). */
  base: ViewStyle;
  /** Small-size overrides (padding + gap). */
  small: ViewStyle;
  /** Label type (medium / small). */
  labelType: TextStyle;
  labelTypeSmall: TextStyle;
  /** Remove "×" glyph size (medium / small). */
  removeSize: number;
  removeSizeSmall: number;
}

export interface ChipProps {
  /** The chip label. */
  children?: ReactNode;
  /** A leading `<Icon />` element. */
  icon?: ReactNode;
  /** Makes the whole chip tappable (e.g. toggling a filter). */
  onPress?: () => void;
  /** Adds a trailing "×" remove button firing this handler. */
  onRemove?: () => void;
  // Tone (pick one; default `secondary`). `primary` is the active/selected fill.
  secondary?: boolean;
  primary?: boolean;
  outline?: boolean;
  // Size (pick one; default medium).
  small?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** For layout composition only (not styling). */
  style?: StyleProp<ViewStyle>;
}

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: ChipProps): Tone {
  if (p.primary) return "primary";
  if (p.outline) return "outline";
  return "secondary";
}

function surfaceStyle(tokens: ColorTokens, tone: Tone): ViewStyle {
  switch (tone) {
    case "secondary":
      return { backgroundColor: tokens.secondary, borderColor: "transparent" };
    case "primary":
      return { backgroundColor: tokens.primary, borderColor: "transparent" };
    case "outline":
      return { backgroundColor: "transparent", borderColor: tokens.border };
  }
}

function labelColor(tokens: ColorTokens, tone: Tone): string {
  switch (tone) {
    case "secondary":
      return tokens["secondary-foreground"];
    case "primary":
      return tokens["primary-foreground"];
    case "outline":
      return tokens.foreground;
  }
}

/** Build a Chip from a platform skin. */
export function createChip(skin: ChipSkin) {
  return function Chip(props: ChipProps) {
    const { children, icon, onPress, onRemove, small, disabled, accessibilityLabel, style } = props;
    const { tokens } = useTheme();
    const tone = toneOf(props);
    const primaryTone = tone === "primary";

    const container: StyleProp<ViewStyle> = [
      skin.base,
      small ? skin.small : null,
      surfaceStyle(tokens, tone),
      disabled ? { opacity: 0.5 } : null,
      style,
    ];

    const inner = (
      <>
        {icon}
        {children != null ? (
          <Text style={[small ? skin.labelTypeSmall : skin.labelType, { color: labelColor(tokens, tone) }]}>
            {children}
          </Text>
        ) : null}
        {onRemove ? (
          <Pressable
            onPress={onRemove}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Remove"
            hitSlop={8}
          >
            <Icon
              x
              size={small ? skin.removeSizeSmall : skin.removeSize}
              muted={!primaryTone}
              primaryForeground={primaryTone}
            />
          </Pressable>
        ) : null}
      </>
    );

    // Tappable chip (a filter toggle): the whole pill is the Pressable. The remove
    // button, when present, is a nested Pressable that fires its own handler.
    if (onPress && !disabled) {
      return (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={({ pressed }) => [container, pressed ? { opacity: 0.85 } : null]}
        >
          {inner}
        </Pressable>
      );
    }

    return (
      <View style={container} accessibilityLabel={accessibilityLabel}>
        {inner}
      </View>
    );
  };
}
