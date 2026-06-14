import { useState } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../button/button.js";
import { type PopoverSkin, type Placement } from "./popover.styles.js";
import * as s from "./popover.styles.js";

// Shared Popover shell. The structure (a trigger paired with a floating card of
// rich content — a heading, supporting text, and an optional action), the public
// boolean-prop API, the placement precedence, the controlled/uncontrolled open
// state, the open/close handlers, the inline (always-visible) mode, and the
// floating-vs-inline overlay behavior all live here once. A platform file
// supplies only its skin (card shape/fill/border, heading/description type, and
// whether an anchor arrow is drawn) and calls createPopover.
//
// The card is an overlay surface; in real use it floats above the page anchored
// to the trigger. Here it is rendered inline, directly below the trigger, so the
// open state is visible without a portal or Modal.
//
// Axes:
//
// - Placement (pick one; default is `bottom`): `top` > `bottom`. Presentational
//   only in this inline rendering; it documents the intended anchor side and (on
//   iOS) which edge the arrow rides.
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
// - `open` (default false, uncontrolled via the trigger): when true, the floating
//   card is shown below the trigger; when false, only the trigger renders.

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

/** Build a Popover component from a platform skin. */
export function createPopover(skin: PopoverSkin) {
  return function Popover(props: PopoverProps) {
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
    // Resolve the placement axis (documented, presentational in this rendering;
    // on iOS it also picks the edge the arrow rides).
    const placement = placementOf(props);

    // With a trigger, the card floats (absolute) below it (the wrapper is
    // `relative`), so it overflows its container instead of growing it. In
    // inline mode it is a standalone in-flow panel. The `style` escape hatch
    // applies last.
    const card: StyleProp<ViewStyle> = [
      skin.card(tokens),
      !inline ? s.cardFloating : null,
      style,
    ];

    return (
      <View style={[inline ? null : s.wrapper, !inline && open ? s.wrapperLifted : null]}>
        {inline ? null : (
          <View style={s.triggerWrap}>
            <Button outline small onPress={() => setOpen(!open)}>
              {trigger ?? "Open popover"}
            </Button>
          </View>
        )}
        {open ? (
          <View style={card}>
            {/* The anchor arrow: drawn only when the skin supplies one (iOS) and
                only in the floating case (an inline panel has no anchor). */}
            {skin.arrow != null && !inline ? <View style={skin.arrow(tokens, placement)} /> : null}
            {title != null ? <Text style={skin.title(tokens)}>{title}</Text> : null}
            {description != null ? <Text style={skin.description(tokens)}>{description}</Text> : null}
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
  };
}
