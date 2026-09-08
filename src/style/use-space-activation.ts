import { useEffect, useRef } from "react";
import type { GestureResponderEvent } from "react-native";

interface SpaceKeyEvent {
  key: string;
  repeat?: boolean;
  isComposing?: boolean;
  keyCode?: number;
  defaultPrevented?: boolean;
  nativeEvent?: { isComposing?: boolean; keyCode?: number };
  target: unknown;
  currentTarget: unknown;
  preventDefault(): void;
  stopPropagation(): void;
}

const space = (event: SpaceKeyEvent) => event.key === " " || event.key === "Spacebar";
const composing = (event: SpaceKeyEvent) => event.isComposing || event.nativeEvent?.isComposing ||
  event.keyCode === 229 || event.nativeEvent?.keyCode === 229;

/** Space activation for non-button Pressable roles. Enter remains RNW-owned. */
export function useSpaceActivation(disabled: boolean, onActivate: (event: GestureResponderEvent) => void) {
  const armed = useRef<{ target: unknown } | null>(null);
  useEffect(() => { if (disabled) armed.current = null; }, [disabled]);

  const cancel = () => { armed.current = null; };
  const onKeyDown = (event: SpaceKeyEvent) => {
    if (!space(event)) { cancel(); return; }
    if (disabled || composing(event) || event.defaultPrevented || event.target !== event.currentTarget) {
      cancel();
      return;
    }
    // These roles have no native browser Space click, and RNW's responder only
    // handles Space for button/menuitem roles. Own just this key sequence.
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) armed.current = { target: event.currentTarget };
  };
  const onKeyUp = (event: SpaceKeyEvent) => {
    if (!space(event)) return;
    const pending = armed.current;
    cancel();
    if (disabled || composing(event) || event.defaultPrevented || event.repeat ||
      !pending || pending.target !== event.currentTarget || event.target !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    // RNW's onPress already delivers keyboard events for Enter. Forward the
    // actual event through the same press contract; do not synthesize a click.
    onActivate(event as unknown as GestureResponderEvent);
  };
  return { onKeyDown, onKeyUp, onBlur: cancel };
}
