import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

/** Give a horizontal scrollport a keyboard stop only while content overflows. */
export function useHorizontalScrollFocus() {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportWidth(event.nativeEvent.layout.width);
  }, []);
  const onContentSizeChange = useCallback((width: number, _height: number) => {
    setContentWidth(width);
  }, []);
  const focusable = viewportWidth > 0 && contentWidth > viewportWidth;
  return { focusable, tabIndex: focusable ? 0 as const : -1 as const, onLayout, onContentSizeChange };
}
