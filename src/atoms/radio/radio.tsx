import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { cn } from "../../cn.js";
import { View, Pressable, Text } from "../../engine/index.js";

// A radio is a single circular control that fills with a centered dot when it is
// the chosen option in its group. It pairs with an optional label and supports a
// disabled state. The group (one selected option at a time) is the caller's job;
// this component renders one control in the state it is told to (controlled).
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf and Avatar's sizeOf).
// Selection is a controlled boolean (`checked`, aliased `selected`); size picks
// the ring/dot diameter and the label type; `disabled` dims and blocks the
// press. Selecting swaps the ring from the neutral input border to primary and
// reveals the primary dot.

export interface RadioProps {
  /** Whether this control is the selected option (controlled). */
  checked?: boolean;
  /** Alias for `checked`, for callers that think in terms of "selected". */
  selected?: boolean;
  /** Fired on press with the next checked value (always true for a radio). */
  onChange?: (checked: boolean, event: GestureResponderEvent) => void;
  /** Label text shown beside the control. */
  children?: ReactNode;
  // Size (pick one; default is the 16px control).
  small?: boolean;
  large?: boolean;
  /** Dim the control and block presses. */
  disabled?: boolean;
  className?: string;
}

type Size = "small" | "default" | "large";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: RadioProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Ring diameter per size. Default is the 16px form control; small pairs with
// dense rows, large with touch-first layouts.
const RING_BOX: Record<Size, string> = {
  small: "w-3.5 h-3.5",
  default: "w-4 h-4",
  large: "w-5 h-5",
};

// Inner dot diameter per size, ~half the ring so the fill reads as a dot.
const DOT_BOX: Record<Size, string> = {
  small: "w-1.5 h-1.5",
  default: "w-2 h-2",
  large: "w-2.5 h-2.5",
};

// Label type per size, matched to the surrounding body text scale.
const LABEL_TEXT: Record<Size, string> = {
  small: "text-xs",
  default: "text-sm",
  large: "text-base",
};

export function Radio(props: RadioProps) {
  const { checked, selected, onChange, children, disabled, className } = props;
  const isChecked = !!(checked ?? selected);
  const size = sizeOf(props);

  const ring = cn(
    "shrink-0 items-center justify-center rounded-full border-2",
    RING_BOX[size],
    // Selected swaps the neutral input border for primary; unselected keeps a
    // transparent fill so only the ring shows until a dot is revealed.
    isChecked ? "border-primary bg-transparent" : "border-input bg-transparent",
    // Nudge the ring onto the first text line so it sits beside the label's
    // title rather than floating to the vertical middle of a wrapped label.
    children != null ? "mt-[3px]" : null,
  );

  const dot = cn("rounded-full bg-primary", DOT_BOX[size]);

  const label = cn(
    "font-medium",
    LABEL_TEXT[size],
    disabled ? "text-muted-foreground" : "text-foreground",
  );

  return (
    <Pressable
      className={cn(
        "flex-row items-start gap-2",
        disabled && "opacity-50",
        className,
      )}
      onPress={(event) => onChange?.(true, event)}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled: !!disabled }}
    >
      <View className={ring}>{isChecked ? <View className={dot} /> : null}</View>
      {children != null ? <Text className={label}>{children}</Text> : null}
    </Pressable>
  );
}
