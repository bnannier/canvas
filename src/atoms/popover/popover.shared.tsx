import { useRef, useState } from "react";
import { View, Text, useTheme, GlassSurface, AnchoredOverlay, useEscapeKey, type StyleProp, type ViewStyle } from "../../style/index.js";
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
// The floating card is an overlay surface: the open (triggered) card routes
// through AnchoredOverlay, so with an OverlayProvider mounted (an app root, or a
// docs example stage) it portals over the page anchored below the trigger with
// outside-tap dismissal, and with no provider it falls back to an inline card
// positioned absolutely below the trigger (the kit's pre-portal behavior). The
// static `inline` mode is a plain in-flow panel and never portals.
//
// Axes:
//
// - Placement (pick one; default is `bottom`): `top` > `bottom`. The card always
//   anchors BELOW the trigger (AnchoredOverlay's below-anchoring); placement drives
//   which edge the iOS arrow rides (up toward the trigger for `bottom`). Genuine
//   above-the-trigger `top` anchoring is not yet supported (see the note by the
//   AnchoredOverlay call).
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
  // Placement (pick one; default is `bottom`). The card anchors below the trigger
  // either way; this picks which edge the iOS arrow rides.
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
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
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
    const { trigger, title, description, actionLabel, inline, onOpenChange, testID, style } = props;
    const { tokens } = useTheme();
    const [internalOpen, setInternalOpen] = useState(false);
    // In static (inline) mode the card is always shown; otherwise it is
    // uncontrolled (the trigger toggles it) unless a controlled `open` is passed.
    const open = inline ? true : (props.open ?? internalOpen);
    const setOpen = (next: boolean) => {
      if (props.open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    // Escape dismisses the floating card on web (no-op natively). An inline
    // panel is an always-visible surface, not a dismissable overlay, so it
    // never subscribes.
    useEscapeKey(open && !inline, () => setOpen(false));
    // Resolve the placement axis (drives which edge the iOS beak rides; the card
    // itself always anchors below the trigger).
    const placement = placementOf(props);

    // Match the floating card's min width to the trigger, measured off the wrapper
    // (the card portals out, so it never feeds back into this width). The wrapper
    // hugs the trigger, so its laid-out width is the trigger's box.
    const [triggerWidth, setTriggerWidth] = useState(0);
    const triggerRef = useRef<View>(null);

    // The card body (heading, supporting line, optional action), shared by the
    // static inline panel and the floating overlay card.
    const panelBody = (
      <>
        {title != null ? <Text style={skin.title(tokens)}>{title}</Text> : null}
        {description != null ? <Text style={skin.description(tokens)}>{description}</Text> : null}
        {actionLabel != null ? (
          <View style={s.actionRow}>
            <Button primary small onPress={() => setOpen(false)}>
              {actionLabel}
            </Button>
          </View>
        ) : null}
      </>
    );

    // Static (inline) mode: an always-visible in-flow panel with no trigger,
    // arrow, or dismissal. It renders its own GlassSurface card directly rather
    // than through the anchored overlay. The `style` escape hatch composes its
    // outer layout.
    if (inline) {
      return (
        <View testID={testID}>
          <View style={style}>
            <GlassSurface style={skin.card(tokens)}>{panelBody}</GlassSurface>
          </View>
        </View>
      );
    }

    // Triggered mode: a trigger button plus a floating card. The open card routes
    // through AnchoredOverlay (mirroring Dropdown): with an OverlayProvider it
    // portals over the page anchored below the trigger, with outside-tap dismissal;
    // with no provider it falls back to the kit's pre-portal inline anchor
    // (`s.cardFloating`, absolute top:"100%" under the `relative` wrapper).
    // `self-start` keeps the trigger from stretching; `wrapperLifted` lifts the
    // whole overlay above later siblings in that no-provider fallback. The `style`
    // escape hatch composes the wrapper's outer layout.
    return (
      <View
        ref={triggerRef}
        testID={testID}
        style={[s.wrapper, open ? s.wrapperLifted : null, style]}
        onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)}
      >
        <View style={s.triggerWrap}>
          <Button outline small expanded={open} onPress={() => setOpen(!open)}>
            {trigger ?? "Open popover"}
          </Button>
        </View>

        {/* NOTE (placement): AnchoredOverlay always anchors below the trigger, so
            the `top` placement still renders the card below (its pre-portal
            behavior) with the beak merely flipped; genuine above-the-trigger
            placement needs placement-aware anchoring added to AnchoredOverlay. */}
        <AnchoredOverlay
          open={open}
          onDismiss={() => setOpen(false)}
          triggerRef={triggerRef}
          gap={4}
          cardStyle={[skin.card(tokens), { minWidth: triggerWidth }]}
          inlineStyle={s.cardFloating}
        >
          {/* The anchor beak, drawn only when the skin supplies one (iOS). For the
              bottom placement it points UP at the trigger. NOTE (beak clip):
              AnchoredOverlay wraps the card in a single GlassSurface whose clip box
              hides overflow under glass mode, so the beak (which protrudes past the
              card edge) shows in solid mode but is clipped under glass; restoring
              the always-outside-the-clip beak needs an out-of-clip adornment slot
              on AnchoredOverlay. */}
          {skin.arrow != null ? skin.arrow(tokens, placement) : null}
          {panelBody}
        </AnchoredOverlay>
      </View>
    );
  };
}
