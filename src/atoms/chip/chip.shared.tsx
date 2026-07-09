import { type ReactNode } from "react";
import { View, Text, Pressable, useTheme, useControllableState, controlRipple, pressDim, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
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
  /** A leading element (e.g. an `<Icon />` or a small `<Avatar />`). */
  icon?: ReactNode;
  /** A trailing element (e.g. a chevron for a menu trigger). Rendered after the label. */
  trailing?: ReactNode;
  /** Makes the whole chip tappable (e.g. toggling a filter). */
  onPress?: () => void;
  /** Adds a trailing "×" remove button firing this handler. */
  onRemove?: () => void;
  /**
   * Turns the chip into a filter toggle that owns its own selected state: pressing
   * it flips between its base tone and the active `primary` fill. Selection is
   * controlled via `selected`, uncontrolled via `defaultSelected`. Use a
   * non-primary base tone (`secondary`/`outline`) so the selected state reads.
   */
  selectable?: boolean;
  /** Selected state for a selectable chip (CONTROLLED). Omit for uncontrolled use. */
  selected?: boolean;
  /** Initial selected state for an uncontrolled selectable chip. */
  defaultSelected?: boolean;
  /** Fired with the next selected state when a selectable chip is pressed. */
  onSelectedChange?: (selected: boolean) => void;
  // Tone (pick one; default `secondary`). `primary` is the active/selected fill.
  secondary?: boolean;
  primary?: boolean;
  outline?: boolean;
  // Size (pick one; default medium).
  small?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
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
    const { children, icon, trailing, onPress, onRemove, small, disabled, accessibilityLabel, testID, style } = props;
    const { tokens } = useTheme();

    // A selectable chip is a filter toggle that owns its selected state (controlled
    // via `selected`, uncontrolled via `defaultSelected`). It is "selectable" when
    // asked explicitly or when any selection prop is passed. Selecting maps to the
    // active `primary` fill; the base tone is what shows when unselected.
    const selectable =
      props.selectable === true ||
      props.selected !== undefined ||
      props.defaultSelected !== undefined ||
      props.onSelectedChange !== undefined;
    const [selectedState, setSelected] = useControllableState<boolean>(
      props.selected,
      props.defaultSelected ?? false,
      props.onSelectedChange,
    );
    const baseTone = toneOf(props);
    const isSelected = selectable ? selectedState : baseTone === "primary";
    const tone: Tone = selectable && selectedState ? "primary" : baseTone;
    const primaryTone = tone === "primary";

    const handlePress = () => {
      if (selectable) setSelected(!selectedState);
      onPress?.();
    };

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
        {trailing}
        {onRemove ? (
          <Pressable
            onPress={onRemove}
            disabled={disabled}
            accessibilityRole="button"
            // Name the specific chip, not a bare "Remove", when the label is a string.
            accessibilityLabel={typeof children === "string" ? `Remove ${children}` : "Remove"}
            // Grow the ~14px glyph toward a ~44pt target; bias the slop away from the label (left).
            hitSlop={{ top: 15, bottom: 15, left: 8, right: 15 }}
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

    // Tappable chip (a filter toggle): the whole pill is the Pressable, kept even when
    // disabled so it holds its button role + disabled state (a plain View would drop
    // both). The remove button, when present, is a nested Pressable with its own handler.
    if (onPress || selectable) {
      return (
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          // Toggle state to AT: the active/selected chip reads as pressed. Announce
          // it natively via accessibilityState.selected and on the web via
          // aria-pressed (RNW drops accessibilityState at the DOM), the dual alias
          // the Switch uses.
          accessibilityState={{ selected: isSelected, disabled: !!disabled }}
          aria-pressed={isSelected}
          // A small pill is only ~22pt tall; grow its whole tap target toward ~44pt.
          hitSlop={small ? 11 : undefined}
          // Android shows a ripple state layer on press; iOS/web keep the opacity dim.
          android_ripple={controlRipple(tokens)}
          style={({ pressed }) => [container, pressDim(pressed, 0.85)]}
        >
          {inner}
        </Pressable>
      );
    }

    return (
      <View style={container} testID={testID} accessibilityLabel={accessibilityLabel}>
        {inner}
      </View>
    );
  };
}
