import { useState } from "react";
import { View, Pressable, Text, useTheme, controlRipple, pressDim, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../button/button.js";
import { Icon } from "../icon/icon.js";
import {
  wrapper,
  bubbleGap,
  iconTrigger,
  type Placement,
  type TooltipSkin,
} from "./tooltip.styles.js";

// Shared Tooltip shell. The structure (the trigger plus the open bubble placed
// next to it via flex order), the public boolean-prop API, the placement
// precedence, the controlled/uncontrolled open state, the toggle handler, and
// accessibility all live here once. A platform file supplies only its skin (the
// bubble surface shape/fill and the label type) and calls createTooltip.
//
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
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// Placement precedence when more than one is passed: first match wins.
function placementOf(p: TooltipProps): Placement {
  if (p.top) return "top";
  if (p.bottom) return "bottom";
  if (p.left) return "left";
  if (p.right) return "right";
  return "top";
}

// Whether the bubble renders before the trigger in source order. top and left
// place the bubble first; bottom and right place it after.
const BUBBLE_FIRST: Record<Placement, boolean> = {
  top: true,
  bottom: false,
  left: true,
  right: false,
};

/** Build a Tooltip component from a platform skin. */
export function createTooltip(skin: TooltipSkin) {
  return function Tooltip(props: TooltipProps) {
    const { label, trigger, iconTrigger: isIconTrigger, onOpenChange, style } = props;
    const placement = placementOf(props);
    const { tokens } = useTheme();
    // Uncontrolled by default: tapping the trigger toggles the bubble (a touch
    // analogue of hover); a controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = props.open ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (props.open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // The open bubble is a polite live region so the tip text is announced when
    // it appears (rather than appearing silently beside the trigger). Mirrors the
    // toast pattern: accessibilityRole/LiveRegion for native plus the aria-live
    // alias, since react-native-web does not forward accessibilityLiveRegion's
    // role on its own.
    const tip = open ? (
      <View
        style={[skin.bubble(tokens), bubbleGap[placement]]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        aria-live="polite"
      >
        <Text style={skin.label(tokens)}>{label}</Text>
      </View>
    ) : null;

    // Icon trigger: a ghost icon button (40px square) holding the settings glyph,
    // matching a ghost icon Button. The glyph renders directly inside the
    // Pressable (not via Button's <Text> children, which can't host an SVG).
    const triggerEl = isIconTrigger ? (
      <Pressable
        android_ripple={controlRipple(tokens)}
        style={({ pressed }) => [iconTrigger, pressDim(pressed)]}
        onPress={() => setOpen(!open)}
        hitSlop={8}
        accessibilityRole="button"
        // Fall back to a sensible name so the icon button is never announced as a
        // bare "button" when used without a label (e.g. `<Tooltip iconTrigger />`).
        accessibilityLabel={label ?? "More info"}
        // Announce the disclosure state. accessibilityState covers native; the
        // aria-expanded alias is required because react-native-web does not
        // forward accessibilityState to the DOM.
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
      >
        <Icon settings size={16} />
      </Pressable>
    ) : (
      // `expanded` maps to aria-expanded inside Button so the text trigger also
      // exposes its open/closed disclosure state.
      <Button outline small expanded={open} onPress={() => setOpen(!open)}>
        {trigger}
      </Button>
    );

    return (
      <View style={[wrapper[placement], style]}>
        {BUBBLE_FIRST[placement] ? tip : null}
        {triggerEl}
        {BUBBLE_FIRST[placement] ? null : tip}
      </View>
    );
  };
}
