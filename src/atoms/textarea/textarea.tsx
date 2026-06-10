import { useState } from "react";
import { TextInput, useTheme, type StyleProp, type TextStyle } from "../../style/index.js";
import * as s from "./textarea.styles.js";

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
  /** Error/validation state: a destructive border. `invalid` is an alias. */
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

export function Textarea(props: TextareaProps) {
  const { value, onChangeText, placeholder, rows, disabled, style } = props;
  const isError = !!props.error || !!props.invalid;
  const [focused, setFocused] = useState(false);
  const { tokens } = useTheme();

  // Border color precedence: error (destructive) wins; focus raises to the ring
  // color (RN has no box-shadow ring, so the border carries the focus cue);
  // otherwise the resting input border.
  const borderColor = isError ? tokens.destructive : focused ? tokens.ring : tokens.input;

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
        s.field(tokens, borderColor),
        s.sizeText(props),
        s.minHeight(rows),
        disabled ? { opacity: 0.5 } : null,
        style,
      ]}
    />
  );
}
