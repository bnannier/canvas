import { useState } from "react";
import { cn } from "../../cn.js";
import { TextInput, useTheme } from "../../engine/index.js";

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
  className?: string;
}

// Text scale per size; mirrors the height the larger control reads as.
function sizeText(p: TextareaProps): string {
  if (p.large) return "text-base";
  if (p.small) return "text-xs";
  return "text-sm";
}

// Derived min height from the row count: each row ~22px plus the vertical
// padding. Falls back to the 80px floor when no rows are given.
function minHeightClass(rows?: number): string {
  if (rows == null) return "min-h-[80px]";
  return `min-h-[${rows * 22 + 16}px]`;
}

export function Textarea(props: TextareaProps) {
  const { value, onChangeText, placeholder, rows, disabled, className } = props;
  const isError = !!props.error || !!props.invalid;
  const [focused, setFocused] = useState(false);
  const { tokens } = useTheme();

  // Border precedence: error (destructive) wins; focus raises to the ring
  // color (RN has no box-shadow ring, so the border carries the focus cue);
  // otherwise the resting input border.
  const borderColor = isError
    ? "border-destructive"
    : focused
      ? "border-ring"
      : "border-input";

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
      className={cn(
        "w-full rounded-md border bg-background px-3 py-2 text-foreground",
        sizeText(props),
        minHeightClass(rows),
        borderColor,
        disabled && "opacity-50",
        className,
      )}
    />
  );
}
