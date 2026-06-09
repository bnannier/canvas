import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { cn } from "../../cn.js";
import { View, Pressable, Text } from "../../engine/index.js";

export interface CheckboxProps {
  children?: ReactNode;
  /** Controlled checked state. The component renders exactly this value. */
  checked?: boolean;
  /**
   * Mixed state: some-but-not-all selected. Shown as a dash, not a tick.
   * Takes visual precedence over `checked`.
   */
  indeterminate?: boolean;
  /** Fired with the next checked value when the row is pressed. */
  onChange?: (next: boolean) => void;
  /** Alias of onChange, for parity with RN's value-style callbacks. */
  onValueChange?: (next: boolean) => void;
  // Size (pick one; default is the base 16px box).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  className?: string;
}

type Size = "small" | "base" | "large";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: CheckboxProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// View dimensions per size. size-* sets width + height together.
const BOX_SIZE: Record<Size, string> = {
  small: "size-3.5",
  base: "size-4",
  large: "size-5",
};

// Glyph (check / dash) type scale, tuned to sit inside the box.
const GLYPH_SIZE: Record<Size, string> = {
  small: "text-xs",
  base: "text-xs",
  large: "text-sm",
};

// Label type scale, matching the box height.
const LABEL_SIZE: Record<Size, string> = {
  small: "text-xs",
  base: "text-sm",
  large: "text-base",
};

export function Checkbox(props: CheckboxProps) {
  const { children, checked, indeterminate, onChange, onValueChange, disabled, className } = props;
  const size = sizeOf(props);
  // Indeterminate reads as "selected-ish": fill the box like a checked state.
  const filled = indeterminate || !!checked;
  const glyph = indeterminate ? "–" : "✓"; // en dash : check mark

  const handlePress = (_event: GestureResponderEvent) => {
    const next = !checked;
    onChange?.(next);
    onValueChange?.(next);
  };

  const row = cn(
    "flex-row items-start gap-2 active:opacity-90",
    disabled && "opacity-50",
    className,
  );

  const box = cn(
    "mt-0.5 shrink-0 items-center justify-center rounded-[3px] border",
    BOX_SIZE[size],
    filled ? "border-primary bg-primary" : "border-input bg-transparent",
  );

  const glyphClass = cn("font-medium leading-none text-primary-foreground", GLYPH_SIZE[size]);
  const labelClass = cn("font-medium text-foreground", LABEL_SIZE[size]);

  return (
    <Pressable
      className={row}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? "mixed" : !!checked, disabled: !!disabled }}
    >
      <View className={box}>
        {filled ? <Text className={glyphClass}>{glyph}</Text> : null}
      </View>
      {children != null ? <Text className={labelClass}>{children}</Text> : null}
    </Pressable>
  );
}
