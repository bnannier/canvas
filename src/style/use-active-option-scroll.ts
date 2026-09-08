import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native";

/** Keep an active-descendant row visible using native content coordinates. */
export function useActiveOptionScroll(activeId: string | undefined, layoutKey: string, open: boolean) {
  const listRef = useRef<ScrollView>(null);
  const listContentRef = useRef<View>(null);
  const rowRefs = useRef(new Map<string, View>());
  const viewportHeight = useRef(0);
  const scrollOffset = useRef(0);
  const committed = useRef({ activeId, layoutKey });
  const sequence = useRef(0);
  useLayoutEffect(() => { committed.current = { activeId, layoutKey }; }, [activeId, layoutKey]);

  const scrollActiveIntoView = useCallback(() => {
    const request = ++sequence.current;
    const { activeId: id, layoutKey: order } = committed.current;
    const row = id ? rowRefs.current.get(id) : undefined;
    const content = listContentRef.current;
    const list = listRef.current;
    if (!id || !row || !content || !list || viewportHeight.current <= 0) return;
    row.measureLayout(content, (_x, y, _width, height) => {
      // A native measurement may outlive a key press, filter, reorder or close.
      if (request !== sequence.current || id !== committed.current.activeId
        || order !== committed.current.layoutKey || row !== rowRefs.current.get(id)
        || content !== listContentRef.current || list !== listRef.current
        || !Number.isFinite(y) || height <= 0 || viewportHeight.current <= 0) return;
      const top = scrollOffset.current;
      const bottom = top + viewportHeight.current;
      const next = y < top ? y : y + height > bottom ? Math.min(y, y + height - viewportHeight.current) : top;
      if (next !== top) {
        list.scrollTo({ y: next, animated: false });
        scrollOffset.current = next;
      }
    }, () => {});
  }, []);
  useEffect(scrollActiveIntoView, [activeId, layoutKey, scrollActiveIntoView]);
  useEffect(() => {
    if (!open) {
      ++sequence.current;
      viewportHeight.current = 0;
      scrollOffset.current = 0;
    }
  }, [open]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    viewportHeight.current = event.nativeEvent.layout.height;
    scrollActiveIntoView();
  }, [scrollActiveIntoView]);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }, []);
  const onRowLayout = useCallback((id: string) => {
    if (id === committed.current.activeId) scrollActiveIntoView();
  }, [scrollActiveIntoView]);
  return { listRef, listContentRef, rowRefs, onLayout, onScroll, onRowLayout, scrollActiveIntoView };
}
