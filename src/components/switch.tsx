import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";

export interface SwitchProps {
  /** Controlled on/off state. The component renders exactly this value. */
  checked?: boolean;
  /** Fired with the next checked value when the switch is toggled. */
  onChange?: (next: boolean) => void;
  /** Alias of onChange, for parity with RN's value-style callbacks. */
  onValueChange?: (next: boolean) => void;
  // Size (pick one; default is the standard track).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Optional label, rendered to the left of the track. */
  children?: ReactNode;
  className?: string;
}

type Size = "small" | "base" | "large";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: SwitchProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// Track geometry per size (pill: width > height, fully rounded).
const TRACK_SIZE: Record<Size, string> = {
  small: "w-8 h-5",
  base: "w-9 h-5",
  large: "w-11 h-6",
};

// Thumb sits 2px inside the track on every side; sizes track the rail height.
const THUMB_SIZE: Record<Size, string> = {
  small: "w-3.5 h-3.5",
  base: "w-4 h-4",
  large: "w-5 h-5",
};

// Label type scale, matching the track height.
const LABEL_SIZE: Record<Size, string> = {
  small: "text-xs",
  base: "text-sm",
  large: "text-base",
};

export function Switch(props: SwitchProps) {
  const { checked = false, onChange, onValueChange, disabled, children, className } = props;
  const size = sizeOf(props);

  const handlePress = (_event: GestureResponderEvent) => {
    const next = !checked;
    onChange?.(next);
    onValueChange?.(next);
  };

  const row = cn(
    "flex-row items-center justify-between gap-4 active:opacity-90",
    disabled && "opacity-50",
    className,
  );

  // On swaps the track to bg-primary; off keeps the standard bg-input rail so
  // off stays clearly interactive and distinct from a disabled control.
  const track = cn(
    "relative shrink-0 rounded-full",
    TRACK_SIZE[size],
    checked ? "bg-primary" : "bg-input",
  );

  // The engine has no translate utility, so the thumb's on/off offset is an
  // inset: 2px from the left when off, 2px from the right when on.
  const thumb = cn(
    "absolute top-0.5 rounded-full bg-background shadow",
    THUMB_SIZE[size],
    checked ? "right-0.5" : "left-0.5",
  );

  const labelClass = cn("font-medium text-foreground", LABEL_SIZE[size]);

  return (
    <Pressable
      className={row}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: !!disabled }}
    >
      {children != null ? <Text className={labelClass}>{children}</Text> : null}
      <Box className={track}>
        <Box className={thumb} />
      </Box>
    </Pressable>
  );
}
