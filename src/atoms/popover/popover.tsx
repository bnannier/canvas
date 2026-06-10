import { useState } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../button/button.js";
import * as s from "./popover.styles.js";
import { type Placement } from "./popover.styles.js";

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
  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
}

// Placement precedence when more than one is passed: first match wins.
function placementOf(p: PopoverProps): Placement {
  if (p.top) return "top";
  return "bottom";
}

export function Popover(props: PopoverProps) {
  const { trigger, title, description, actionLabel, inline, onOpenChange, style } = props;
  const { tokens } = useTheme();
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

  // With a trigger, the card floats (absolute) below it (the wrapper is
  // `relative`), so it overflows its container instead of growing it. In
  // inline mode it is a standalone in-flow panel. The `style` escape hatch
  // applies last.
  const card: StyleProp<ViewStyle> = [
    s.cardBase,
    s.cardSurface(tokens),
    !inline ? s.cardFloating : null,
    style,
  ];

  return (
    <View style={inline ? null : s.wrapper}>
      {inline ? null : (
        <View style={s.triggerWrap}>
          <Button outline small onPress={() => setOpen(!open)}>
            {trigger ?? "Open popover"}
          </Button>
        </View>
      )}
      {open ? (
        <View style={card}>
          {title != null ? <Text style={s.title(tokens)}>{title}</Text> : null}
          {description != null ? <Text style={s.description(tokens)}>{description}</Text> : null}
          {actionLabel != null ? (
            <View style={s.actionRow}>
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
