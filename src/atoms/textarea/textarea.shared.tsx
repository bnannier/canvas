import { forwardRef, useState } from "react";
import { type TextInput as RNTextInput } from "react-native";
import { TextInput, useTheme, FOCUS_RESET, type StyleProp, type TextStyle } from "../../style/index.js";
import { type TextareaSkin, type Size, sizeText, minHeight } from "./textarea.styles.js";

// react-native-web paints the browser's blue focus outline on a focused multiline
// <textarea>; real iOS/Android have no such outline. The shared FOCUS_RESET suppresses
// it so the skin's own focus cue (the bottom hairline thickening to the brand ring) is
// the only treatment, matching the sibling Input. It is web-only and a no-op natively.

// Shared Textarea shell. The structure (a multiline TextInput), the public
// boolean-prop API, the size precedence, the error/focus state resolution, the
// accessibility, the handlers, and the disabled dim live here once; a platform
// file supplies only its skin (fill, shape, border/underline, focus feedback)
// and calls createTextarea.

export interface TextareaProps {
  /** Controlled text value. */
  value?: string;
  /** Fired with the next text value on each edit. */
  onChangeText?: (next: string) => void;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /**
   * Visible rows the field sizes to. Sets the min height (rows * ~22px + 16px
   * padding); the field still grows with content past this floor.
   */
  rows?: number;
  // State (pick one; orthogonal to size).
  /** Error/validation state: a destructive cue. `invalid` is an alias. */
  error?: boolean;
  invalid?: boolean;
  // Size (pick one; default is the base text-sm field).
  small?: boolean;
  large?: boolean;
  /** Blocks editing and focus, and dims the field. */
  disabled?: boolean;
  /**
   * Borderless: drop the field's own border and radius so it sits flush inside a
   * framed container (e.g. a Card with a formatting toolbar above it).
   */
  flush?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<TextStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: TextareaProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

/** Build a Textarea component from a platform skin. */
export function createTextarea(skin: TextareaSkin) {
  const Textarea = forwardRef<RNTextInput, TextareaProps>(function Textarea(props, ref) {
    const { value, onChangeText, placeholder, rows, disabled, flush, style } = props;
    const isError = !!props.error || !!props.invalid;
    const size = sizeOf(props);
    const [focused, setFocused] = useState(false);
    const { tokens } = useTheme();

    // Surface the validation problem programmatically, not just as a red border
    // (the border alone fails WCAG 1.4.1 / 4.1.2). `aria-invalid` is the
    // cross-platform alias react-native-web forwards to the DOM textarea as
    // aria-invalid="true" so web screen readers announce the field as invalid;
    // it mirrors the sibling Input exactly. Undefined when valid so the attribute
    // is omitted rather than emitting aria-invalid="false". Spread (not a direct
    // JSX attribute) because `aria-invalid` is outside RN's typed prop set.
    const a11y = { "aria-invalid": isError || undefined };

    return (
      <TextInput
        ref={ref}
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens["muted-foreground"]}
        selectionColor={tokens.primary} // brand cursor / selection on every platform
        editable={!disabled}
        textAlignVertical="top"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          skin.field(tokens, { error: isError, focused }),
          sizeText(size),
          minHeight(rows),
          disabled ? { opacity: 0.5 } : null,
          // Flush: strip the field's own border + radius so it sits flush inside a
          // framed container (a toolbar Card). Zero every edge so it works whether
          // the skin draws a full border or a bottom underline.
          flush
            ? { borderWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderRadius: 0 }
            : null,
          FOCUS_RESET,
          style,
        ]}
        {...a11y}
      />
    );
  });
  Textarea.displayName = "Textarea";
  return Textarea;
}
