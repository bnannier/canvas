// The kit's Pressable primitive: React Native's own, with the focus ring themed and
// `focusable={false}` honoured on the web. Every kit control presses through it
// (components import Pressable from src/style/primitives, which re-exports this), so one
// palette colours every focus ring and one rule keeps a pointer-only surface out of the
// tab order.
//
// The browser draws the ring itself, on keyboard focus only (its :focus-visible rule);
// this gives it the palette's `ring` colour and sets it 2 px off the control. Chromium
// paints its automatic ring in that colour. Firefox and Safari keep their own colour for
// the automatic ring, so the CSS hand-off's `:focus-visible` rule (styles/tokens/base.css)
// makes the ring a solid 2 px `--ring` in every browser wherever it is loaded. A control
// that paints its own focus state (a field border, a segment) spreads FOCUS_RESET, which
// still wins. Natively the outline keys draw nothing without a width, so there is no
// native ring: iOS and Android own focus on their side. The kit's TextInput and
// ScrollView primitives (src/style/text.tsx, src/style/scroll-view.tsx) carry the same
// ring, so a raw text field and a scroller the browser makes a keyboard stop take it too.
//
// It also gives a link its Enter key on the web (see useLinkEnter below).

import { forwardRef, useMemo, useRef, type KeyboardEvent } from "react";
import {
  Pressable as RNPressable,
  type GestureResponderEvent,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type View,
  type ViewStyle,
} from "react-native";
import { useTheme } from "./theme.js";

/** The ring's distance from the control, the CSS hand-off's `--ring-offset`. */
export const FOCUS_RING_OFFSET = 2;

/** The ring's thickness where the kit draws it itself (a frame's ring), the CSS hand-off's `--ring-width`. */
export const FOCUS_RING_WIDTH = 2;

/**
 * The ring drawn just inside the control instead of around it, for a full-bleed row
 * (an accordion header, a sidebar row) whose clipping container would cut an outside
 * ring. A skin spreads it after the control's own style.
 */
export const INSET_FOCUS_RING: ViewStyle = { outlineOffset: -FOCUS_RING_OFFSET };

/**
 * The themed ring for a focusable node that is not a Pressable (a drag handle, a
 * focusable View): the same colour and offset the kit's Pressable carries. React Native
 * parses the outline keys natively too, where they draw nothing without a width.
 */
export function useFocusRingStyle(): ViewStyle {
  const { tokens } = useTheme();
  return useMemo((): ViewStyle => ({ outlineColor: tokens.ring, outlineOffset: FOCUS_RING_OFFSET }), [tokens.ring]);
}

type PressableStyle = PressableProps["style"];

function useRingStyle(style: PressableStyle): PressableStyle {
  const ring = useFocusRingStyle();
  // The ring goes first in the list so a control's own outline style wins.
  return useMemo(() => typeof style === "function"
    ? (state: PressableStateCallbackType): StyleProp<ViewStyle> => [ring, style(state)]
    : [ring, style], [style, ring]);
}

// A web key event as react-native-web delivers it; natively a key event carries its key
// on `nativeEvent` only, so `key` is absent there and nothing below ever fires.
type KeyEvent = Pick<KeyboardEvent, "key" | "repeat" | "target" | "currentTarget">;
type KeyHandler = ((event: KeyEvent) => void) | null | undefined;
// The web-only props react-native-web's Pressable takes beside React Native's own.
type WebPressableProps = PressableProps & { href?: string; onKeyDown?: KeyHandler; onKeyUp?: KeyHandler };

// A link presses on Enter. react-native-web's press responder leaves Enter on a `link` role
// to the browser, whose native click only an <a href> gets, so a link the kit draws
// without an href (a breadcrumb crumb, a navbar link) never activated from the keyboard.
// For that link the kit presses on the Enter keyup itself, the moment react-native-web
// presses its buttons, and only for a key that went down and came up on the link (a held
// key presses once). The keyup still bubbles: react-native-web releases its own press
// state (onPressOut, `pressed`) from a document listener. Space stays out, as the APG
// link pattern has it, and a link with an href keeps the browser's own activation.
function useLinkEnter(props: WebPressableProps): Pick<WebPressableProps, "onKeyDown" | "onKeyUp" | "onBlur"> {
  const armed = useRef<unknown>(null);
  const { onPress, disabled, onBlur, onKeyDown, onKeyUp } = props;
  const role = props.role ?? props.accessibilityRole;
  if (role !== "link" || props.href != null) return {};
  return {
    onKeyDown(event) {
      if (event.key === "Enter" && !event.repeat && !disabled && event.target === event.currentTarget) armed.current = event.currentTarget;
      onKeyDown?.(event);
    },
    onKeyUp(event) {
      if (event.key === "Enter") {
        const pressed = armed.current === event.currentTarget && event.target === event.currentTarget;
        armed.current = null;
        if (pressed && !disabled) onPress?.(event as unknown as GestureResponderEvent);
      }
      onKeyUp?.(event);
    },
    onBlur(event) {
      armed.current = null;
      onBlur?.(event);
    },
  };
}

/**
 * React Native's Pressable with the theme's focus ring (the palette's `ring` color, set
 * off the control) and `focusable={false}` honoured on the web. Every kit control presses
 * through it.
 */
export const Pressable = forwardRef<View, PressableProps>(function Pressable({ style, ...rest }, ref) {
  // `focusable={false}` marks a pointer-only surface (a row's press area, a picture
  // under its own control bar). react-native-web 0.21's Pressable always passes a tab
  // index of its own (0 unless disabled), and an explicit tab index wins over
  // `focusable` in its DOM props, so the node stayed a tab stop. Spelling it as tab
  // index -1, unless the caller chose one, takes it out of the web's tab order and asks
  // for nothing new natively: React Native's View reads tab index -1 as focusable false.
  const tabIndex = rest.tabIndex ?? (rest.focusable === false ? -1 : undefined);
  const linkEnter = useLinkEnter(rest);
  return <RNPressable ref={ref} {...rest} {...linkEnter} tabIndex={tabIndex} style={useRingStyle(style)} />;
});
