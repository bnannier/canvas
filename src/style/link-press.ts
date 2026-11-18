import type { GestureResponderEvent } from "react-native";

/** Leave modifier and auxiliary clicks on an anchor to the browser. */
export function browserOwnsClick(event: GestureResponderEvent): boolean {
  const mouse = event.nativeEvent as unknown as Partial<MouseEvent>;
  return !!(mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey || (mouse.button != null && mouse.button !== 0));
}
