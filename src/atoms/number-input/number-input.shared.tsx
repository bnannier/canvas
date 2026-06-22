import { useState } from "react";
import { TextInput, type NativeSyntheticEvent, type TextInputEndEditingEventData } from "react-native";
import {
  View,
  Text,
  Pressable,
  useTheme,
  FOCUS_RESET,
  type ColorTokens,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";
import { Icon } from "../icon/icon.js";

// Shared NumberInput shell. A numeric value with a − button, an editable numeric
// center field, and a + button (the iOS UIStepper / web number-input idiom). ALL
// of the structure (the three slots), the clamping math, the direct-entry parsing,
// the disabled-at-bound logic, and the full accessibility (button roles + the
// cross-platform ARIA value props the container carries) live here ONCE. A platform
// file supplies only its skin (the per-OS shape, sizing, fill, divider, glyph color,
// and press feedback) and calls createNumberInput.
//
// Why the ARIA props are spelled out: react-native-web DROPS accessibilityValue, so
// the container View carries aria-valuenow/min/max directly (RN 0.71+ accepts these
// and RNW forwards them to the DOM) for web screen readers; native reads the value
// from the same numbers. The − / + buttons carry aria-disabled alongside
// accessibilityState so RNW marks them disabled too.

// Style axes (semantic boolean props, the prop name is the value):
//   - Size: small / large (omit for the default medium). Precedence: large > small.
//   - State: disabled (dims the whole control and blocks every slot).
// There is no string-enum styling; every visual variation is a boolean above.

export type Size = "small" | "base" | "large";

export interface NumberInputProps {
  /** Controlled numeric value (clamped to [min, max] for display). */
  value: number;
  /** Fired with the next clamped value when ±, or direct entry, changes it. */
  onChange: (next: number) => void;
  /** Lower bound. Default 0. The − button disables when value <= min. */
  min?: number;
  /** Upper bound. Default Number.MAX_SAFE_INTEGER. The + button disables when value >= max. */
  max?: number;
  /** Increment/decrement amount for the ± buttons. Default 1. */
  step?: number;
  /** Accessible name for the editable field. Default "Number". */
  label?: string;
  // Size (pick one; default is the medium control). Precedence: large > small.
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width/margins). */
  style?: StyleProp<ViewStyle>;
}

// The only thing a platform skin owns: the group shape, the ± button geometry and
// press feedback, the center field surface, the divider, and the glyph color/size.
// The fill/structure stay the brand on every OS; the skin never injects a platform
// default color (no iOS system blue, no M3 default).
export interface NumberInputSkin {
  /** The outer group container (the [ − | value | + ] shell shape). */
  group: (t: ColorTokens, size: Size, disabled: boolean) => ViewStyle;
  /** One ± button cell; `side` lets the skin round the matching outer corner. */
  button: (t: ColorTokens, size: Size, side: "left" | "right", disabled: boolean, pressed: boolean) => ViewStyle;
  /** The editable center field surface (and its type scale). */
  field: (t: ColorTokens, size: Size, disabled: boolean) => TextStyle;
  /** Divider line between a button and the value (null = no separator on this skin). */
  divider: ((t: ColorTokens, disabled: boolean) => ViewStyle) | null;
  /** The ± glyph color token and px size for a given size/state. */
  glyph: (t: ColorTokens, size: Size, disabled: boolean) => { color: keyof ColorTokens; size: number };
  /** iOS/web dim a ± button on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a ± button; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /** Layout order: the iOS HIG puts the value field to the LEFT of the [ − | + ] pill. */
  fieldOnLeft: boolean;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// Map a glyph color token to the Icon atom's boolean color prop. A disabled (at-bound)
// button dims its glyph to `muted` regardless of the skin's active color, so the
// disabled state reads on every platform.
function glyphColorProps(token: keyof ColorTokens, disabled: boolean): Record<string, boolean> {
  if (disabled) return { muted: true };
  if (token === "primary") return { primary: true };
  if (token === "muted-foreground") return { muted: true };
  if (token === "destructive") return { destructive: true };
  // `foreground` is the Icon default (no color boolean needed).
  return {};
}

// Size precedence when more than one is passed: first match wins (large > small).
function sizeOf(p: NumberInputProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

/** Build a NumberInput component from a platform skin. */
export function createNumberInput(skin: NumberInputSkin) {
  return function NumberInput(props: NumberInputProps) {
    const {
      value,
      onChange,
      min = 0,
      max = Number.MAX_SAFE_INTEGER,
      step = 1,
      label = "Number",
      disabled,
      style,
    } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);

    const current = clamp(value, min, max);
    const atMin = disabled || current <= min;
    const atMax = disabled || current >= max;

    // Direct-entry draft. While the field is focused the user may type a transient
    // value (empty, "-", a partial number); we keep that raw text locally and only
    // coerce/clamp on each numeric change and on commit (blur), so the cursor never
    // jumps and a half-typed number is not clobbered. When not editing, the field
    // shows the controlled value.
    const [draft, setDraft] = useState<string | null>(null);
    const shown = draft != null ? draft : String(current);

    const emit = (next: number) => {
      const clamped = clamp(next, min, max);
      if (clamped !== current) onChange(clamped);
    };

    const decrement = () => {
      if (atMin) return;
      emit(current - step);
    };
    const increment = () => {
      if (atMax) return;
      emit(current + step);
    };

    // Parse on every keystroke: ignore non-numeric input, allow an empty/partial
    // transient draft, and emit the clamped number whenever the draft parses.
    const onChangeText = (raw: string) => {
      // Keep only characters that can form a (possibly negative/decimal) number.
      const cleaned = raw.replace(/[^0-9.-]/g, "");
      setDraft(cleaned);
      if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return; // transient
      const parsed = Number(cleaned);
      if (!Number.isNaN(parsed)) emit(parsed);
    };

    // Commit on blur: coerce an empty/partial draft to a real number (clamped),
    // then drop the draft so the field re-syncs to the controlled value.
    const commit = (_e?: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      if (draft != null) {
        const parsed = Number(draft);
        const next = Number.isNaN(parsed) ? min : clamp(parsed, min, max);
        if (next !== current) onChange(next);
      }
      setDraft(null);
    };

    const glyph = skin.glyph(tokens, size, !!disabled);
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    const MinusButton = (
      <Pressable
        onPress={decrement}
        disabled={atMin}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        accessibilityState={{ disabled: atMin }}
        aria-disabled={atMin}
        android_ripple={ripple}
        style={({ pressed }) => [
          skin.button(tokens, size, "left", atMin, pressed),
          skin.pressedOpacity != null && pressed && !atMin ? { opacity: skin.pressedOpacity } : null,
        ]}
      >
        <Icon minus {...glyphColorProps(glyph.color, atMin)} size={glyph.size} />
      </Pressable>
    );

    const PlusButton = (
      <Pressable
        onPress={increment}
        disabled={atMax}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        accessibilityState={{ disabled: atMax }}
        aria-disabled={atMax}
        android_ripple={ripple}
        style={({ pressed }) => [
          skin.button(tokens, size, "right", atMax, pressed),
          skin.pressedOpacity != null && pressed && !atMax ? { opacity: skin.pressedOpacity } : null,
        ]}
      >
        <Icon plus {...glyphColorProps(glyph.color, atMax)} size={glyph.size} />
      </Pressable>
    );

    const Field = (
      <TextInput
        value={shown}
        onChangeText={onChangeText}
        onBlur={() => commit()}
        onEndEditing={commit}
        editable={!disabled}
        inputMode="numeric"
        keyboardType="number-pad"
        selectionColor={tokens.primary}
        accessibilityLabel={label}
        aria-label={label}
        style={[skin.field(tokens, size, !!disabled), FOCUS_RESET]}
      />
    );

    const makeDivider = (key: string) =>
      skin.divider ? <View key={key} pointerEvents="none" style={skin.divider(tokens, !!disabled)} /> : null;

    // The [ − | + ] pill is one piece; the field sits beside it (LEFT on iOS per HIG,
    // RIGHT-of-minus / inline on the others). The dividers sit between adjacent slots.
    return (
      <View
        // Cross-platform ARIA value props: RNW DROPS accessibilityValue, so the
        // numbers are forwarded directly (RN 0.71+ accepts them; RNW maps them to
        // aria-valuenow/min/max on the DOM node) for web screen readers.
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: current }}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        accessibilityState={{ disabled: !!disabled }}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {skin.fieldOnLeft ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {Field}
            <View style={skin.group(tokens, size, !!disabled)}>
              {MinusButton}
              {makeDivider("d")}
              {PlusButton}
            </View>
          </View>
        ) : (
          <View style={skin.group(tokens, size, !!disabled)}>
            {MinusButton}
            {makeDivider("d1")}
            {Field}
            {makeDivider("d2")}
            {PlusButton}
          </View>
        )}
      </View>
    );
  };
}
