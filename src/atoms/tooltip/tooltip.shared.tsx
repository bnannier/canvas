import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { View, Pressable, Text, useHugStyle, controlRipple, pressDim, type ViewProps, type LayoutStyle, GlassPane, paneStyle, inverseDenseTint, AnchoredOverlay } from "../../style/index.js";
import { Button as WebButton } from "../button/button.js";
import { Icon } from "../icon/icon.js";
import {
  BUBBLE_GAP,
  HOVER_GRACE_MS,
  bubbleParts,
  inlineAnchor,
  iconTrigger,
  textTrigger,
  textTriggerLabel,
  type Placement,
  type TooltipSkin,
} from "./tooltip.styles.js";

// Shared Tooltip shell. The structure (the trigger plus the open bubble floating
// against it), the public boolean-prop API, the placement precedence, the
// controlled/uncontrolled open state, the hover/focus/tap disclosure handlers, and
// accessibility all live here once. A platform file supplies only its skin (the
// bubble surface shape/fill and the label type) and calls createTooltip.
//
// Tooltip: a small dark bubble of helper text shown beside a trigger on hover
// or focus. The bubble FLOATS: it is the kit's anchored card (AnchoredOverlay),
// portaled into the nearest OverlayProvider's outlet and placed against the
// trigger's measured box, so opening it changes no layout. It used to render in
// flow as a flex sibling of the trigger, which grew whatever held it (a table cell
// gained the bubble's height and the row shifted under the pointer). The card is
// pinned (`dismissable` false): no backdrop, so the page and the trigger keep
// their hover and their taps, no screen-reader modality, and nothing moves focus
// into it, because a tip is a description, not a place to go. With no provider it
// floats on an absolute anchor inside the root (`inlineAnchor`) instead.
//
// Placement is a boolean axis (top default, bottom, left, right); first match
// wins. top/bottom center the bubble above/below the trigger; left/right center it
// beside the trigger at its leading/trailing side (mirrored in a right-to-left
// layout, as the old flex row was). Each flips to the opposite side when the
// visible band has no room, and slides to stay 8px inside it.
//
// Trigger precedence, first match wins: `children` (an arbitrary element the tip
// hangs off), then `iconTrigger`, then `textTrigger`, then the default text Button.
export interface TooltipProps {
  /**
   * An arbitrary element for the tip to hang off: an existing Button, Chip, or
   * any other control that already owns its own press and accessible name. The
   * highest-precedence trigger: children win over `iconTrigger`, `textTrigger`,
   * and the default Button. The child renders as-is and stays the single
   * interactive, labelled element; the root view Tooltip wraps it in takes no
   * accessibility role and no tab stop, listens only for hover and focus, and
   * never claims the press, so a Button child keeps its `onPress` and the tip
   * does not toggle on tap.
   */
  children?: ReactNode;
  // The tip text shown in the bubble.
  label?: string;
  /**
   * The element the tip describes. By default rendered as a text
   * `<Button outline small>`; set `iconTrigger` for a ghost icon button,
   * `textTrigger` to hang the tip off an inline pressable word, or pass
   * `children` to wrap an element you already have. Ignored when `children` is
   * passed.
   */
  trigger?: string;
  /**
   * Render the trigger as a ghost icon button (a settings glyph) instead of the
   * text Button. When set, `trigger` (the label string) is ignored. Ignored
   * when `children` is passed, which takes precedence.
   */
  iconTrigger?: boolean;
  /**
   * Render the `trigger` string as a pressable inline word (an underlined
   * hover-text affordance) rather than the default text Button, so the tip can
   * hang off a run of body copy. Orthogonal to placement (top/left/right/bottom).
   * Ignored when `children` or `iconTrigger` is set, both of which take
   * precedence.
   */
  textTrigger?: boolean;
  /**
   * Controlled visibility. Omit for uncontrolled: the tip shows while the
   * trigger is hovered or focused, and a tap toggles it (the touch analogue
   * of hover) on the built-in triggers. An element trigger (`children`) has no
   * tap toggle (the child keeps its own press), and native platforms never fire
   * hover, so `open` is the native and touch path for that trigger.
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
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Placement precedence when more than one is passed: first match wins.
export function placementOf(p: TooltipProps): Placement {
  if (p.top) return "top";
  if (p.bottom) return "bottom";
  if (p.left) return "left";
  if (p.right) return "right";
  return "top";
}

/** The trigger a Tooltip renders: the caller's element, the icon button, the inline word, or the default text Button. */
export type TriggerKind = "element" | "icon" | "text" | "button";

// Trigger precedence, first match wins: `children`, `iconTrigger`, `textTrigger`,
// then the default text Button.
export function triggerOf(p: Pick<TooltipProps, "children" | "iconTrigger" | "textTrigger">): TriggerKind {
  if (p.children != null) return "element";
  if (p.iconTrigger) return "icon";
  if (p.textTrigger) return "text";
  return "button";
}

/** Build a Tooltip component from a platform skin. */
/**
 * The components a Tooltip draws with that look different per platform. The web
 * builds are the defaults; the iOS and Android entries pass their own, so the docs'
 * platform columns render them truthfully (a device resolves them by platform either way).
 */
export interface TooltipParts {
  Button?: typeof WebButton;
}

export function createTooltip(skin: TooltipSkin, parts: TooltipParts = {}) {
  const Button = parts.Button ?? WebButton;
  return function Tooltip(props: TooltipProps) {
    const { children, label, trigger, onOpenChange, testID, style } = props;
    const placement = placementOf(props);
    const triggerKind = triggerOf(props);
    const theme = useMaterialTheme({ static: true, layer: "dense" });
    const { tokens } = theme;
    // HUG: the root hugs its trigger inside a stretching Column; the bubble takes no room in it.
    const hug = useHugStyle();
    // The box the bubble is placed against: the root, which hugs the trigger.
    const rootRef = useRef<View>(null);
    // Uncontrolled by default: hovering or focusing the trigger shows the
    // bubble, leaving/blurring hides it, and tapping toggles it (the touch
    // analogue of hover); a controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = props.open ?? internalOpen;
    const setOpen = (next: boolean) => {
      cancelClose();
      if (props.open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    // Hovering off the trigger closes the tip after a short grace, and hovering onto
    // the bubble within it keeps the tip up (WCAG 1.4.13: hover content stays while
    // the pointer moves over it). The bubble floats in another part of the tree, so
    // the trigger's leave fires on the way to it; the grace spans the gap between.
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestSetOpen = useRef(setOpen);
    latestSetOpen.current = setOpen;
    function cancelClose() {
      if (closeTimer.current != null) clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const hoverIn = () => {
      cancelClose();
      if (!open) setOpen(true);
    };
    const hoverOut = () => {
      cancelClose();
      closeTimer.current = setTimeout(() => latestSetOpen.current(false), HOVER_GRACE_MS);
    };
    useEffect(() => cancelClose, []);
    // Hover/focus disclosure shared by every trigger flavor. react-native-web
    // (and RN's pointer events natively) never fire hover for touch pointers,
    // so on touch devices only the press toggle runs and these are inert.
    const disclosure = {
      onHoverIn: hoverIn,
      onHoverOut: hoverOut,
      onFocus: () => setOpen(true),
      onBlur: () => setOpen(false),
    };

    // The same disclosure for an element trigger, wired to RN's own pointer
    // events instead of Pressable's onHoverIn/onHoverOut. Pressable CONTAINS
    // hover (entering a nested pressable dispatches a lock that ends the outer
    // one's hover), so a Pressable wrapper would close the tip the instant the
    // pointer reached the child control; a plain View reads the enter/leave pair
    // over its whole subtree instead. Touch pointers are skipped so tapping the
    // child never flashes the bubble, and native fires no hover at all, so the
    // controlled `open` prop is the native and touch path here.
    const pointerHover =
      (next: boolean): NonNullable<ViewProps["onPointerEnter"]> =>
      (e) => {
        if (e.nativeEvent.pointerType !== "touch") (next ? hoverIn : hoverOut)();
      };
    const elementDisclosure = {
      onPointerEnter: pointerHover(true),
      onPointerLeave: pointerHover(false),
      // Focus/blur bubble out of the child on the web (React routes them through
      // focusin/focusout), so the tip follows a keyboard tab onto the child
      // without the wrapper itself being a tab stop.
      onFocus: disclosure.onFocus,
      onBlur: disclosure.onBlur,
    };
    // The element trigger keeps `children` intact and hangs the disclosure off
    // the root view, which hugs the child. The bubble floats, so opening it moves
    // nothing: the child stays under a resting pointer.
    const isElementTrigger = triggerKind === "element";

    // The open bubble is a polite live region so the tip text is announced when
    // it appears (rather than appearing silently beside the trigger). Mirrors the
    // toast pattern: accessibilityRole/LiveRegion for native plus the aria-live
    // alias, since react-native-web does not forward accessibilityLiveRegion's
    // role on its own.
    // The bubble is the anchored card's surface: the skin's bubble less its padding,
    // which the live region carries so hovering anywhere on the bubble keeps it up.
    // Under glass it is a DENSE-layer pane: the material under the inverse dense tint
    // (the bubble paints the scheme's ink as its fill and the page colour as its text,
    // so the plain dense tint would put light text on a light pane). The pane rides
    // behind the content as the card's decoration. `opaque` asks AnchoredOverlay for
    // its plain surface, so the pane is the bubble's only material.
    const { surface, padding } = bubbleParts(skin.bubble(tokens));
    const tip = (
      <AnchoredOverlay
        open={open}
        onDismiss={() => setOpen(false)}
        dismissable={false}
        triggerRef={rootRef}
        gap={BUBBLE_GAP}
        centered
        above={placement === "top"}
        besideStart={placement === "left"}
        besideEnd={placement === "right"}
        opaque
        cardStyle={paneStyle(theme, surface)}
        decoration={<GlassPane static layer="dense" shape={surface} tint={inverseDenseTint(theme)} />}
        inlineStyle={inlineAnchor[placement]}
      >
        <View
          style={padding}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          aria-live="polite"
          onPointerEnter={pointerHover(true)}
          onPointerLeave={pointerHover(false)}
        >
          <Text style={skin.label(tokens)}>{label}</Text>
        </View>
      </AnchoredOverlay>
    );

    // The trigger `triggerOf` resolved.
    //
    // Element trigger: whatever the caller passed, rendered as-is. The only node
    // Tooltip adds around it is the root View below, which takes NO accessibility
    // role and no `focusable` (so it is neither announced nor a tab stop) and
    // installs no press responder, leaving the child as the single interactive,
    // labelled element with its own onPress. A Button child therefore never ends
    // up nested inside a second button, which would be both invalid markup and an
    // ambiguous control (test/no-console-violations.test.tsx locks that).
    //
    // Icon trigger: a ghost icon button (40px square) holding the settings glyph,
    // matching a ghost icon Button. The glyph renders directly inside the
    // Pressable (not via Button's <Text> children, which can't host an SVG).
    const triggerEl = triggerKind === "element" ? (
      children
    ) : triggerKind === "icon" ? (
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
    ) : triggerKind === "text" ? (
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
      <View ref={rootRef} style={[hug, style]} testID={testID} {...(isElementTrigger ? elementDisclosure : undefined)}>
        {triggerEl}
        {tip}
      </View>
    );
  };
}
