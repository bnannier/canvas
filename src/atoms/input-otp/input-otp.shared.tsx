import { forwardRef, useEffect, useRef, useState } from "react";
import { type TextInput as RNTextInput } from "react-native";
import {
  View,
  Text,
  Pressable,
  TextInput,
  useTheme,
  FOCUS_RESET,
  type ColorTokens,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";

// Shared InputOTP shell. The whole structure, state, and accessibility live here
// ONCE; a platform file supplies only its skin (the cell shape/fill/border, the
// active-cell highlight, the digit type scale, the gap and group treatment) and
// calls createInputOTP.
//
// Architecture (the crux): the field is driven by ONE real <TextInput> so native
// SMS autofill, the one-time-code keyboard suggestion, and paste all flow into a
// single value. That input is positioned ABSOLUTELY to fill the whole row and is
// made visually invisible (transparent text + caret hidden), so tapping anywhere
// on the segmented row focuses it and autofill/paste land in it. The visible
// segment cells (a View + a Text per character) are laid out underneath and read
// from the controlled `value`; the "active" cell (index === value.length, clamped
// to the last cell) shows a caret/ring while the input is focused. Focus is tracked
// in local state for the active-cell highlight ONLY — the value stays controlled.

export type Size = "small" | "base" | "large";

export interface InputOTPProps {
  /** Number of segment cells (and the max code length). Default 6. */
  length?: number;
  /** Current code (controlled). Only the typed digits, e.g. "123". */
  value: string;
  /** Called with the new code (digits only, sliced to `length`) on each change. */
  onChange: (code: string) => void;
  /** Fired once when the code reaches `length` digits. */
  onComplete?: (code: string) => void;
  /** Disable input and dim the cells. */
  disabled?: boolean;
  /** Render a bullet (•) instead of the digit, for passcode entry. */
  masked?: boolean;
  // Size (pick one; default is the medium cell).
  small?: boolean;
  large?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Escape hatch for layout/positioning composition (mainly width/alignment). */
  style?: StyleProp<ViewStyle>;
}

// The contract a platform skin fulfills. The size and per-cell state (active while
// focused, whether the cell is filled) are passed in; the skin maps them to RN
// style objects built from the active brand tokens (so light/dark/glass follow).
export interface InputOTPSkin {
  /** Gap between cells. shadcn connects cells (gap 0, shared borders); iOS/M3 separate them. */
  gap: (size: Size) => number;
  /** Whether cells share borders as one connected group (web shadcn) — rounds only the outer corners. */
  connected: boolean;
  /** A single cell box: shape, fill, border, size. `index`/`count` let the connected web group round only its ends. */
  cell: (
    t: ColorTokens,
    size: Size,
    state: { active: boolean; filled: boolean; index: number; count: number },
  ) => ViewStyle;
  /** The digit (or bullet) text inside a cell. */
  digit: (t: ColorTokens, size: Size) => TextStyle;
  /** The blinking-style caret bar drawn in the active empty cell. */
  caret: (t: ColorTokens, size: Size) => ViewStyle;
  /** Opacity applied to the whole control when disabled. */
  disabledOpacity: number;
}

// Size precedence within the axis: large > small > default (first match wins),
// matching the other atoms.
function sizeOf(p: InputOTPProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

const DIGITS_ONLY = /\D/g;

/** Build an InputOTP component from a platform skin. */
export function createInputOTP(skin: InputOTPSkin) {
  const InputOTP = forwardRef<RNTextInput, InputOTPProps>(function InputOTP(props, ref) {
    const { length = 6, value, onChange, onComplete, disabled, masked, testID, style } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();
    const [focused, setFocused] = useState(false);

    // Fire onComplete exactly once per "reaches full length" transition: track the
    // last completed code so re-renders with the same full value don't re-fire.
    const completedRef = useRef<string | null>(null);
    useEffect(() => {
      if (value.length === length) {
        if (completedRef.current !== value) {
          completedRef.current = value;
          onComplete?.(value);
        }
      } else {
        completedRef.current = null;
      }
      // onComplete is intentionally read fresh on each call; value/length drive it.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, length]);

    const handleChange = (raw: string) => {
      const cleaned = raw.replace(DIGITS_ONLY, "").slice(0, length);
      onChange(cleaned);
    };

    const gap = skin.gap(size);
    const count = length;
    // The active cell is where the next digit lands: value.length, clamped to the
    // last cell so a full code keeps the last cell highlighted while focused.
    const activeIndex = Math.min(value.length, length - 1);

    return (
      <View
        testID={testID}
        style={[{ alignSelf: "flex-start" }, disabled ? { opacity: skin.disabledOpacity } : null, style]}
      >
        {/* The visible segmented row. Relatively positioned so the real input can
            overlay it absolutely. The connected web group shares borders (gap 0);
            iOS/M3 separate the cells with `gap`. */}
        <View
          style={{
            position: "relative",
            flexDirection: "row",
            alignItems: "center",
            ...(skin.connected ? null : { gap }),
          }}
        >
          {Array.from({ length }).map((_, index) => {
            const char = value[index];
            const filled = char != null;
            const active = focused && !disabled && index === activeIndex;
            const showCaret = active && !filled;
            return (
              <View
                key={index}
                style={skin.cell(tokens, size, { active, filled, index, count })}
                // The cells are decorative; the TextInput carries the a11y role/label.
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="none"
              >
                {filled ? (
                  <Text style={skin.digit(tokens, size)}>{masked ? "•" : char}</Text>
                ) : showCaret ? (
                  <View style={skin.caret(tokens, size)} />
                ) : null}
              </View>
            );
          })}

          {/* The real input: one transparent, caret-hidden field stretched over the
              whole row. It captures typing, paste, and one-time-code autofill, then
              the cells paint the value. A Pressable wrapper is NOT needed — the input
              itself fills the row, so a tap anywhere focuses it. */}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={handleChange}
            editable={!disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            caretHidden
            inputMode="numeric"
            keyboardType="number-pad"
            // When masked, obscure the value at the input layer so the platform
            // masks it for real: RN hides it natively and RNW emits a password
            // input, so a screen reader / the DOM value / password-manager UI no
            // longer expose the raw passcode (the cell bullets alone were purely
            // cosmetic). Keep `textContentType="oneTimeCode"` set regardless —
            // iOS still honors it for SMS autofill even with secure entry — so
            // one-time-code autofill keeps landing in both modes.
            secureTextEntry={!!masked}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={length}
            // Brand the (hidden) selection in case the OS still shows a selection band.
            selectionColor={tokens.primary}
            accessibilityLabel="One-time code"
            aria-label="One-time code"
            accessibilityState={{ disabled: !!disabled }}
            aria-disabled={disabled}
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                // Visually invisible: the cells render the value, this only captures input.
                color: "transparent",
                backgroundColor: "transparent",
                // Keep text out of view if any platform ignores the transparent color.
                textAlign: "center",
              },
              FOCUS_RESET,
            ]}
          />
        </View>
      </View>
    );
  });
  InputOTP.displayName = "InputOTP";
  return InputOTP;
}
