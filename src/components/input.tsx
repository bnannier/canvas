import { useState } from "react";
import { TextInput, type TextStyle } from "react-native";
import { cn } from "../cn.js";
import { useStyles, useTheme } from "../engine/index.js";

export interface InputProps {
  /** Current text value (controlled). */
  value?: string;
  /** Called with the new text on each keystroke. */
  onChangeText?: (text: string) => void;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  // State (orthogonal). `error` (alias `invalid`) flags a validation problem.
  error?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  /** Read-only: shows the value but blocks editing without the dimmed look. */
  readOnly?: boolean;
  // Size (pick one; default is the medium field).
  small?: boolean;
  large?: boolean;
  /** Full-width field (the default); pass to be explicit. */
  block?: boolean;
  /** Multi-line text area instead of a single-line field. */
  multiline?: boolean;
  /** Extra utilities, mainly for width (e.g. "max-w-[320px]", "w-1/2"). */
  className?: string;
}

// Height per size; mirrors the real control's footprint.
function sizeBox(p: InputProps): string {
  if (p.multiline) return p.large ? "min-h-24" : p.small ? "min-h-16" : "min-h-20";
  if (p.large) return "h-10";
  if (p.small) return "h-8";
  return "h-9";
}

// Type scale per size.
function sizeText(p: InputProps): string {
  if (p.large) return "text-base";
  if (p.small) return "text-xs";
  return "text-sm";
}

export function Input(props: InputProps) {
  const {
    value,
    onChangeText,
    placeholder,
    disabled,
    readOnly,
    multiline,
    className,
  } = props;
  const isError = !!(props.error || props.invalid);
  const [focused, setFocused] = useState(false);
  const { tokens } = useTheme();

  // Border color precedence: error > focus > default input border.
  const border = isError ? "border-destructive" : focused ? "border-ring" : "border-input";

  const style = useStyles(
    cn(
      "w-full rounded-md border bg-background px-3 py-2 text-foreground",
      sizeBox(props),
      sizeText(props),
      border,
      disabled && "opacity-50",
      className,
    ),
  );

  return (
    <TextInput
      style={style as unknown as TextStyle}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={tokens["muted-foreground"]}
      editable={!disabled && !readOnly}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
