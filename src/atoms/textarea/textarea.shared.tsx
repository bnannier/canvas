import { useState } from "react";
import { TextInput, useTheme, type StyleProp, type TextStyle } from "../../style/index.js";
import { type TextareaSkin, type Size, sizeText, minHeight } from "./textarea.styles.js";

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
  return function Textarea(props: TextareaProps) {
    const { value, onChangeText, placeholder, rows, disabled, style } = props;
    const isError = !!props.error || !!props.invalid;
    const size = sizeOf(props);
    const [focused, setFocused] = useState(false);
    const { tokens } = useTheme();

    return (
      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens["muted-foreground"]}
        editable={!disabled}
        textAlignVertical="top"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          skin.field(tokens, { error: isError, focused }),
          sizeText(size),
          minHeight(rows),
          disabled ? { opacity: 0.5 } : null,
          style,
        ]}
      />
    );
  };
}
