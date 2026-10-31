import { forwardRef, type ReactNode } from "react";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import { useSpaceActivation } from "../../style/use-space-activation.js";
import { type GestureResponderEvent } from "react-native";
import { useSeededMinTargetSlop, styleBox } from "../../style/touch-target-seed.js";
import { Pressable, View, Text, useControllableState, useTheme, type ColorTokens, type ViewStyle, type TextStyle, type TouchTargetSkin, type LayoutStyle } from "../../style/index.js";
import { contrastStyle, PlainSurface } from "../../style/glass-surface/glass-surface.shared.js";
import { useHover } from "../../style/hover.js";
import { useReducedMotion } from "../../style/motion.js";

// Shared Switch shell. Uses React Native's primitives DIRECTLY (no engine className
// layer) and reads the active brand tokens via so colors follow light/dark.
// The shared structure (label/description row, accessibility, toggle, sizing) lives
// here once; a platform file supplies only its track + thumb styles (a SwitchSkin)
// and calls createSwitch. Styles are plain RN objects, which work on iOS, Android,
// and web alike (a real .css file would only work on the web).

export interface SwitchProps {
  /** Controlled on/off state; omit for uncontrolled use. */
  checked?: boolean;
  /** Initial state for uncontrolled use (a bare <Switch /> is interactive). */
  defaultChecked?: boolean;
  /** Fired with the next checked value when the switch is toggled (both modes). Web keyboard activation supports Space on release and Enter. */
  onChange?: (next: boolean) => void;
  /** Alias of onChange, for parity with RN's value-style callbacks. */
  onValueChange?: (next: boolean) => void;
  /** E2E hook forwarded to the pressable row. */
  testID?: string;
  // Size (pick one; default is the standard track). The web track scales;
  // <!-- only: web -->
  // iOS and
  // Android draw their platform switch, which comes in one size.
  // <!-- /only -->
  // <!-- only: ios -->
  // iOS draws its platform switch, which comes in one size.
  // <!-- /only -->
  // <!-- only: android -->
  // Android draws its platform switch, which comes in one size.
  // <!-- /only -->
  small?: boolean;
  large?: boolean;
  /** A compact bordered capsule with its label after the switch, for a toolbar setting. */
  chip?: boolean;
  /**
   * A row of a settings list: 10 px above and below the row, so a stack of switches reads
   * as a list rather than a form (stack them in a `Column tight`). Pair with `divided` on
   * every row after the first.
   */
  listed?: boolean;
  /** A hairline above the row in the `border` ink: a settings list's separator from the row before. */
  divided?: boolean;
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
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

export type Size = "small" | "base" | "large";

export function sizeOf(p: SwitchProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// The only thing a platform skin owns: the track and thumb styles for a given
// on/off state and size, built from the active tokens. Everything else is the
// shell. `dark` is threaded in (like dropdown/badge) for a skin whose track needs a
// scheme-specific value the tokens do not carry; the v4 skins read tokens only.
export interface SwitchSkin extends TouchTargetSkin {
  track: (tokens: ColorTokens, dark: boolean, checked: boolean, size: Size) => ViewStyle;
  thumb: (tokens: ColorTokens, checked: boolean, size: Size) => ViewStyle;
  /** The track's look under a hovering pointer (the web's glow on an on switch); omit for none. */
  hover?: (tokens: ColorTokens, checked: boolean, size: Size) => ViewStyle | null;
  /** Compact toolbar form, where the platform offers one. */
  chip?: {
    root: (tokens: ColorTokens) => ViewStyle;
    track: (tokens: ColorTokens, checked: boolean) => ViewStyle;
    thumb: (tokens: ColorTokens, checked: boolean) => ViewStyle;
    label: (tokens: ColorTokens, checked: boolean) => TextStyle;
  };
}

// The hand-off's switch row: a 500 14px title over a 12px description in the subtle ink,
// the same type at every size (only the track scales), and the whole row at 0.4 when
// disabled. Line heights are the hand-off's ratios exactly (cv-kit-controls.js `switch`
// 1.3 on the title, `K.sub` 1.45 on the description): 18.2 and 17.4.
const LABEL_TYPE = { fontSize: 14, lineHeight: 18.2, fontWeight: "500" } as const;
const DESCRIPTION_TYPE = { fontSize: 12, lineHeight: 17.4, fontWeight: "400" } as const;
const DISABLED_OPACITY = 0.4;
// The label takes the space left by the fixed-size track and wraps within it.
// Without shrink, a long description makes the whole switch wider than its parent.
const TEXT_COLUMN: ViewStyle = { flexShrink: 1, minWidth: 0 };
// The settings-list row (the Controls page's switch list, `c-switch`: `padding:10px 0` on
// each row, `border-top:1px solid var(--ln)` on every row after the first).
const LISTED: ViewStyle = { paddingVertical: 10 };

/** Build a Switch component from a platform skin.
 * @ref Ref to the interactive switch row, including its label. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs.
 */
export function createSwitch(skin: SwitchSkin) {
  const Switch = forwardRef<View, SwitchProps>(function Switch(props, ref) {
    const hostRef = useComposedRefs(ref);
    const { onChange, onValueChange, disabled, children, description, accessibilityLabel, style } = props;
    const theme = useTheme();
    const { tokens, dark } = theme;
    const reducedMotion = useReducedMotion();
    const size = sizeOf(props);
    // A switch is a small mark inside content, not a surface: it draws the skin's own track
    // and knob in every mode, glass included, with no pane and no rim on any platform, its
    // checked track the skin's solid brand fill (the owner's GS-5 decision). Under Increase
    // Contrast the track and the knob take the contrasting border (`contrastStyle`).

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
    const chip = props.chip ? skin.chip : undefined;
    const { hovered, target: hoverTarget } = useHover(skin.hover != null && !disabled && !chip);
    const trackShape = chip ? chip.track(tokens, checked) : skin.track(tokens, dark, checked, size);
    const trackHover = hovered && !chip ? skin.hover?.(tokens, checked, size) ?? null : null;
    const thumbShape = chip ? chip.thumb(tokens, checked) : skin.thumb(tokens, checked, size);

    const handlePress = (_event: GestureResponderEvent) => {
      setChecked(!checked);
    };
    const keyboard = useSpaceActivation(!!disabled, handlePress);

    // The whole row is the control, and a base iOS track is 28pt tall, so the row is
    // short of the platform minimum even though it is wide. The touch area grows to
    // meet it; nothing moves (see src/style/touch-target.ts). The slop is seeded from the
    // track, the least the row renders at, so it is in place before the first layout
    // (src/style/touch-target-seed.ts).
    const target = useSeededMinTargetSlop(skin.minTarget, styleBox(trackShape));
    const label = children != null || description != null ? (
      <View style={TEXT_COLUMN}>
        {children != null ? <Text style={[LABEL_TYPE, { color: tokens.foreground }, chip?.label(tokens, checked)]}>{children}</Text> : null}
        {description != null ? <Text style={{ ...DESCRIPTION_TYPE, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }}>{description}</Text> : null}
      </View>
    ) : null;

    return (
      <Pressable
        ref={hostRef}
        {...(keyboard as object)}
        {...target}
        {...hoverTarget}
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
            gap: 24,
            alignItems: "center",
          },
          props.listed ? LISTED : null,
          props.divided ? { borderTopWidth: 1, borderColor: tokens.border } : null,
          chip?.root(tokens),
          disabled ? { opacity: DISABLED_OPACITY } : null,
          pressed ? { opacity: 0.9 } : null,
          style,
        ]}
      >
        {!chip ? label : null}
        <View style={contrastStyle(theme, trackHover ? { ...trackShape, ...trackHover } : trackShape)}>
          <PlainSurface pointerEvents="none" style={[contrastStyle(theme, thumbShape), reducedMotion ? { transitionDuration: "0ms" } as ViewStyle : null]} />
        </View>
        {chip ? label : null}
      </Pressable>
    );
  });
  Switch.displayName = "Switch";
  return Switch;
}
