import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

/** Give a scrollport a keyboard stop only while its content overflows. */
export function useScrollFocus(axis: "horizontal" | "vertical") {
  const [viewportSize, setViewportSize] = useState(0);
  const [contentSize, setContentSize] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportSize(event.nativeEvent.layout[axis === "horizontal" ? "width" : "height"]);
  }, [axis]);
  const onContentSizeChange = useCallback((width: number, height: number) => {
    setContentSize(axis === "horizontal" ? width : height);
  }, [axis]);
  const focusable = viewportSize > 0 && contentSize > viewportSize;
  return { focusable, tabIndex: focusable ? 0 as const : -1 as const, onLayout, onContentSizeChange };
}

export function useHorizontalScrollFocus() {
  return useScrollFocus("horizontal");
}
