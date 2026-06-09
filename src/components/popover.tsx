import { useState } from "react";
import { cn } from "../cn.js";
import { View, Text } from "../engine/index.js";
import { Button } from "./button.js";

// Popover: a trigger paired with a floating card of rich content (a heading,
// supporting text, and an optional action). The card is an overlay surface;
// in real use it floats above the page anchored to the trigger. Here it is
// rendered inline, directly below the trigger, so the open state is visible
// without a portal or Modal.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The placement axis is
// presentational only in this inline rendering; it does not move the card.
//
// Axes:
//
// - Placement (pick one; default is `bottom`): `top` > `bottom`. Presentational
//   only here, it documents the intended anchor side.
//
// Content props (the children-less / data-driven case):
//
// - `trigger`: label for the trigger Button (rendered as <Button outline small>).
// - `title`: the popover heading.
// - `description`: the supporting line beneath the title.
// - `actionLabel`: when set, renders a <Button primary small> action row.
//
// State:
//
// - `open` (default true): when true, the floating card is shown below the
//   trigger; when false, only the trigger renders.

export interface PopoverProps {
  /** Label for the trigger button. */
  trigger?: string;
  /** Heading shown at the top of the floating card. */
  title?: string;
  /** Supporting line beneath the title. */
  description?: string;
  /** When set, renders a primary action button at the bottom of the card. */
  actionLabel?: string;
  // Placement (pick one; default is `bottom`). Presentational only here.
  top?: boolean;
  bottom?: boolean;
  /**
   * Static mode: render the card on its own with no trigger button (an
   * always-visible inline panel). When set, the card is always shown and
   * `open` is ignored.
   */
  inline?: boolean;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean;
  /** Fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

type Placement = "top" | "bottom";

// Placement precedence when more than one is passed: first match wins.
function placementOf(p: PopoverProps): Placement {
  if (p.top) return "top";
  return "bottom";
}

export function Popover(props: PopoverProps) {
  const { trigger, title, description, actionLabel, inline, onOpenChange, className } = props;
  const [internalOpen, setInternalOpen] = useState(false);
  // In static (inline) mode the card is always shown; otherwise it is
  // uncontrolled (the trigger toggles it) unless a controlled `open` is passed.
  const open = inline ? true : (props.open ?? internalOpen);
  const setOpen = (next: boolean) => {
    if (props.open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  // Resolve the placement axis (documented, presentational in this rendering).
  placementOf(props);

  const card = cn(
    "w-[260px] rounded-lg border border-border bg-popover p-4 shadow-lg",
    // With a trigger, the card floats (absolute) below it (the wrapper is
    // `relative`), so it overflows its container instead of growing it. In
    // inline mode it is a standalone in-flow panel.
    !inline && "absolute top-full left-0 z-50 mt-2",
    className,
  );

  return (
    <View className={cn(!inline && "relative self-start")}>
      {inline ? null : (
        <View className="self-start">
          <Button outline small onPress={() => setOpen(!open)}>
            {trigger ?? "Open popover"}
          </Button>
        </View>
      )}
      {open ? (
        <View className={card}>
          {title != null ? (
            <Text className="text-sm font-semibold text-popover-foreground">{title}</Text>
          ) : null}
          {description != null ? (
            <Text className="mt-1 text-sm text-muted-foreground">{description}</Text>
          ) : null}
          {actionLabel != null ? (
            <View className="mt-3 flex-row justify-end">
              <Button primary small onPress={() => setOpen(false)}>
                {actionLabel}
              </Button>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
