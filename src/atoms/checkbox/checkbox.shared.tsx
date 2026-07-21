import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, useControllableState, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

// Shared Checkbox shell. Uses React Native's primitives DIRECTLY and reads the
// active brand tokens via useTheme, so colors follow light/dark and the glass
// surface. The shared structure (the box + glyph + label row, the size precedence,
// accessibility, onChange/onValueChange, indeterminate) lives here once; a platform
// file supplies only its skin (box shape/sizing/border, glyph color, press feedback)
// and calls createCheckbox. iOS has no native checkbox, so every skin is hand-drawn
// from the brand tokens — no platform default color ever leaks in.

export interface CheckboxProps {
  /** Label text (the option's title) shown beside the box. */
  children?: ReactNode;
  /**
   * Optional muted secondary line rendered under the label, for the common
   * title-plus-description option (a notification setting, a consent row).
   * Supplying it builds the stacked title/description layout inside the control,
   * so the caller never hand-composes a Row + Column + two Typography nodes and
   * the whole row stays tappable.
   */
  description?: ReactNode;
  /** Controlled checked state; omit for uncontrolled use. */
  checked?: boolean;
  /** Initial state for uncontrolled use (a bare <Checkbox /> is interactive). */
  defaultChecked?: boolean;
  /**
   * Mixed state: some-but-not-all selected. Shown as a dash, not a tick.
   * Takes visual precedence over `checked`.
   */
  indeterminate?: boolean;
  /** Fired with the next checked value when the row is pressed (both modes). */
  onChange?: (next: boolean) => void;
  /** Alias of onChange, for parity with RN's value-style callbacks. */
  onValueChange?: (next: boolean) => void;
  /**
   * Accessible name for a LABEL-LESS checkbox (one with no `children`, e.g. a
   * row selector in a table). With a visible label the label itself is the name;
   * without one this is what a screen reader announces.
   */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the pressable row. */
  testID?: string;
  // Size (pick one; default is the base box).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

export type Size = "small" | "base" | "large";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: CheckboxProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// The only thing a platform skin owns: the box, glyph, and label styles for a given
// state and size, plus the press/disabled feedback. Everything else is the shell.
export interface CheckboxSkin {
  /** The square box. `filled` = checked or indeterminate. `nudge` aligns the box to a label's first line. */
  box: (tokens: ColorTokens, filled: boolean, size: Size, nudge: boolean) => ViewStyle;
  /** The check / dash glyph inside a filled box. */
  glyph: (tokens: ColorTokens, size: Size) => TextStyle;
  /** The label text to the right of the box. */
  label: (tokens: ColorTokens, size: Size) => TextStyle;
  /** The muted secondary description line, rendered under the label when present. */
  description: (tokens: ColorTokens, size: Size) => TextStyle;
  /** Opacity applied to the row when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the row on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the box; null on iOS/web. */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean; radius?: number }) | null;
}

// The row: box + optional label, top-aligned so a multi-line label hangs from the box.
const ROW: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8 };

// Stacks the title over its description beside the box. The 8px gap mirrors
// Radio's TEXT_COLUMN (the kit's title+description precedent) and the kit's
// default snug column spacing, so every such control stacks its text the same
// way. `flexShrink` lets a long description wrap within the row instead of
// forcing the row wider.
const TEXT_COLUMN: ViewStyle = { flexShrink: 1, gap: 8 };

// The glyph sits on its own absolutely-positioned layer that fills the box and
// centers the check/dash with flexbox. This is deliberate: on native Android
// (Fabric) an IN-FLOW <Text> child drives its parent View's main-axis size and
// overrides the box's explicit `width`, collapsing the box to the glyph's measured
// width (~5dp) while the cross-axis `height` is honored — an 18dp square renders as
// a thin vertical sliver. (The Radio never hits this: its checked child is a <View>
// dot, not text.) Taking the glyph out of flow removes it from the box's content
// measurement, so `width` wins. Absolute + flex-center behaves identically on iOS,
// react-native-web, and native Android, so this is a cross-platform fix, not a
// per-platform escape hatch — the look is unchanged everywhere.
const GLYPH_LAYER: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none", // the Pressable owns the touch; keep this layer inert
};

/** Build a Checkbox component from a platform skin. */
export function createCheckbox(skin: CheckboxSkin) {
  return function Checkbox(props: CheckboxProps) {
    const { children, description, indeterminate, onChange, onValueChange, disabled, style } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();
    // Whether the control carries any text at all (title and/or description).
    const hasText = children != null || description != null;

    // Controlled when `checked` is provided, self-managed otherwise, so a bare
    // <Checkbox /> toggles out of the box (the standard library contract).
    const [checked, setChecked] = useControllableState<boolean>(
      props.checked,
      props.defaultChecked ?? false,
      (next) => {
        onChange?.(next);
        onValueChange?.(next);
      },
    );

    // Indeterminate reads as "selected-ish": fill the box like a checked state.
    const filled = indeterminate || checked;
    const glyph = indeterminate ? "–" : "✓"; // en dash : check mark

    const handlePress = (_event: GestureResponderEvent) => {
      setChecked(!checked);
    };

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        testID={props.testID}
        // Icon-only (no text): grow the small box's tap target toward ~44pt.
        // With a label the whole row is already a generous target, so leave it.
        hitSlop={!hasText ? 8 : undefined}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled: !!disabled }}
        aria-checked={indeterminate ? "mixed" : checked}
        // Dual alias (RNW forwards aria-label, native reads accessibilityLabel).
        accessibilityLabel={props.accessibilityLabel}
        aria-label={props.accessibilityLabel}
        android_ripple={ripple}
        style={({ pressed }) => [
          ROW,
          disabled ? { opacity: skin.disabledOpacity } : null,
          skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          style,
        ]}
      >
        <View style={skin.box(tokens, filled, size, hasText)}>
          {filled ? (
            <View style={GLYPH_LAYER}>
              <Text style={skin.glyph(tokens, size)}>{glyph}</Text>
            </View>
          ) : null}
        </View>
        {hasText ? (
          description != null ? (
            <View style={TEXT_COLUMN}>
              {children != null ? <Text style={skin.label(tokens, size)}>{children}</Text> : null}
              <Text style={skin.description(tokens, size)}>{description}</Text>
            </View>
          ) : (
            <Text style={skin.label(tokens, size)}>{children}</Text>
          )
        ) : null}
      </Pressable>
    );
  };
}
