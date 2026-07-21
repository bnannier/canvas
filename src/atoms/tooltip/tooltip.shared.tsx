import { useState } from "react";
import { View, Pressable, Text, useTheme, controlRipple, pressDim, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../button/button.js";
import { Icon } from "../icon/icon.js";
import {
  wrapper,
  bubbleGap,
  iconTrigger,
  textTrigger,
  textTriggerLabel,
  type Placement,
  type TooltipSkin,
} from "./tooltip.styles.js";

// Shared Tooltip shell. The structure (the trigger plus the open bubble placed
// next to it via flex order), the public boolean-prop API, the placement
// precedence, the controlled/uncontrolled open state, the hover/focus/tap
// disclosure handlers, and accessibility all live here once. A platform file supplies only its skin (the
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
  // The element the tip describes. By default rendered as a text
  // <Button outline small>; set `iconTrigger` for a ghost icon button or
  // `textTrigger` to hang the tip off an inline pressable word.
  trigger?: string;
  // Render the trigger as a ghost icon button (a settings glyph) instead of the
  // text Button. When set, `trigger` (the label string) is ignored.
  iconTrigger?: boolean;
  // Render the `trigger` string as a pressable inline word (an underlined
  // hover-text affordance) rather than the default text Button, so the tip can
  // hang off a run of body copy. Orthogonal to placement (top/left/right/bottom).
  // Ignored when `iconTrigger` is set, which takes precedence.
  textTrigger?: boolean;
  /**
   * Controlled visibility. Omit for uncontrolled: the tip shows while the
   * trigger is hovered or focused, and a tap toggles it (the touch analogue
   * of hover).
   */
  open?: boolean;
  // Fired when the bubble is shown/hidden.
  onOpenChange?: (open: boolean) => void;
  // Placement (pick one; default is top).
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
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
    const { label, trigger, iconTrigger: isIconTrigger, textTrigger: isTextTrigger, onOpenChange, testID, style } = props;
    const placement = placementOf(props);
    const { tokens } = useTheme();
    // Uncontrolled by default: hovering or focusing the trigger shows the
    // bubble, leaving/blurring hides it, and tapping toggles it (the touch
    // analogue of hover); a controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = props.open ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (props.open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    // Hover/focus disclosure shared by every trigger flavor. react-native-web
    // (and RN's pointer events natively) never fire hover for touch pointers,
    // so on touch devices only the press toggle runs and these are inert.
    const disclosure = {
      onHoverIn: () => setOpen(true),
      onHoverOut: () => setOpen(false),
      onFocus: () => setOpen(true),
      onBlur: () => setOpen(false),
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
        {...disclosure}
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
    ) : isTextTrigger ? (
      // Text trigger: the `trigger` string as a pressable inline word (a
      // hover-text affordance) rather than a Button. Mirrors the icon trigger's
      // wiring: a Pressable toggles the bubble, dims on press (iOS/web) or
      // ripples (Android), carries the same hitSlop, and exposes its disclosure
      // state (accessibilityState covers native; the aria-expanded alias is
      // required because react-native-web does not forward accessibilityState).
      // The word itself is the accessible name, so no explicit accessibilityLabel.
      <Pressable
        android_ripple={controlRipple(tokens)}
        style={({ pressed }) => [textTrigger, pressDim(pressed)]}
        onPress={() => setOpen(!open)}
        {...disclosure}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
      >
        <Text style={textTriggerLabel(tokens)}>{trigger}</Text>
      </Pressable>
    ) : (
      // `expanded` maps to aria-expanded inside Button so the text trigger also
      // exposes its open/closed disclosure state.
      <Button outline small expanded={open} onPress={() => setOpen(!open)} {...disclosure}>
        {trigger}
      </Button>
    );

    return (
      <View style={[wrapper[placement], style]} testID={testID}>
        {BUBBLE_FIRST[placement] ? tip : null}
        {triggerEl}
        {BUBBLE_FIRST[placement] ? null : tip}
      </View>
    );
  };
}
