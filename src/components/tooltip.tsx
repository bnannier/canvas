import { useState } from "react";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

// Tooltip: a small dark bubble of helper text shown beside a trigger on hover
// or focus. This RN port renders the open state inline (no portal/Modal): a
// trigger button with the bubble positioned next to it via flex order, so the
// docs playground can show it without an overlay layer.
//
// Placement is a boolean axis (top default, bottom, left, right); first match
// wins. top/bottom stack the bubble above/below the trigger in a column;
// left/right place it beside the trigger in a row.
export interface TooltipProps {
  // The tip text shown in the bubble.
  label?: string;
  // The element the tip describes; rendered as an <Button outline small>.
  trigger?: string;
  // Render the trigger as a ghost icon button (a settings glyph) instead of the
  // text Button. When set, `trigger` (the label string) is ignored.
  iconTrigger?: boolean;
  // Controlled visibility. Omit for uncontrolled (tap the trigger to toggle).
  open?: boolean;
  // Fired when the bubble is shown/hidden.
  onOpenChange?: (open: boolean) => void;
  // Placement (pick one; default is top).
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  className?: string;
}

type Placement = "top" | "bottom" | "left" | "right";

// Placement precedence when more than one is passed: first match wins.
function placementOf(p: TooltipProps): Placement {
  if (p.top) return "top";
  if (p.bottom) return "bottom";
  if (p.left) return "left";
  if (p.right) return "right";
  return "top";
}

// Wrapper layout per placement: column for top/bottom, row for left/right.
const WRAPPER: Record<Placement, string> = {
  top: "flex-col items-center self-start",
  bottom: "flex-col items-center self-start",
  left: "flex-row items-center self-start",
  right: "flex-row items-center self-start",
};

// Gap between bubble and trigger, applied to the bubble on the trigger-facing
// side. top -> mb-1.5, bottom -> mt-1.5, left -> mr-1.5, right -> ml-1.5.
const BUBBLE_GAP: Record<Placement, string> = {
  top: "mb-1.5",
  bottom: "mt-1.5",
  left: "mr-1.5",
  right: "ml-1.5",
};

// Whether the bubble renders before the trigger in source order. top and left
// place the bubble first; bottom and right place it after.
const BUBBLE_FIRST: Record<Placement, boolean> = {
  top: true,
  bottom: false,
  left: true,
  right: false,
};

export function Tooltip(props: TooltipProps) {
  const { label, trigger, iconTrigger, onOpenChange, className } = props;
  const placement = placementOf(props);
  // Uncontrolled by default: tapping the trigger toggles the bubble (a touch
  // analogue of hover); a controlled `open` prop overrides this.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = props.open ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (props.open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const wrapper = cn(WRAPPER[placement], className);
  const bubble = cn("rounded-md bg-foreground px-2 py-1 shadow-md", BUBBLE_GAP[placement]);
  const bubbleLabel = "text-xs font-medium text-background";

  const tip = open ? (
    <View className={bubble}>
      <Text className={bubbleLabel}>{label}</Text>
    </View>
  ) : null;

  // Icon trigger: a ghost icon button (40px square) holding the settings glyph,
  // matching a ghost icon Button. The glyph renders directly inside the
  // Pressable (not via Button's <Text> children, which can't host an SVG).
  const triggerEl = iconTrigger ? (
    <Pressable
      className="h-10 w-10 items-center justify-center rounded-md active:opacity-90"
      onPress={() => setOpen(!open)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon settings size={16} />
    </Pressable>
  ) : (
    <Button outline small onPress={() => setOpen(!open)}>
      {trigger}
    </Button>
  );

  return (
    <View className={wrapper}>
      {BUBBLE_FIRST[placement] ? tip : null}
      {triggerEl}
      {BUBBLE_FIRST[placement] ? null : tip}
    </View>
  );
}
