import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { ScrollView } from "react-native";
import { chatAtBottom } from "./chat.logic.js";

/** Follow committed layout without mistaking content growth for a reader scrolling up. */
export function useChatTailFollow(scroll: RefObject<Pick<ScrollView, "scrollToEnd"> | null>) {
  const position = useRef({ following: true, offset: 0, viewport: 0, content: 0 });
  const frame = useRef<number | null>(null);
  const mounted = useRef(false);
  const requestFollow = useCallback(() => {
    if (!mounted.current || !position.current.following || frame.current != null) return;
    // RN must commit its content first, and a browser must finish text reflow. One
    // frame also coalesces streaming updates and both size callbacks into one move.
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (position.current.following) scroll.current?.scrollToEnd({ animated: false });
    });
  }, [scroll]);
  useEffect(() => {
    mounted.current = true;
    requestFollow();
    return () => {
      mounted.current = false;
      if (frame.current != null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [requestFollow]);

  const onLayout = useCallback((height: number) => {
    const state = position.current;
    state.viewport = height;
    if (height > 0 && state.content > 0 && chatAtBottom(state.offset, height, state.content)) state.following = true;
    requestFollow();
  }, [requestFollow]);
  const onContentSizeChange = useCallback((height: number) => {
    const state = position.current;
    state.content = height;
    if (state.viewport > 0 && chatAtBottom(state.offset, state.viewport, height)) state.following = true;
    requestFollow();
  }, [requestFollow]);
  const onScroll = useCallback((offset: number, viewport: number, content: number) => {
    const state = position.current;
    const resized = viewport !== state.viewport || content !== state.content;
    const wasFollowing = state.following;
    const atBottom = chatAtBottom(offset, viewport, content);
    // A layout or anchoring event can report the old offset against a taller
    // content size before our next-frame move. Only actual upward movement leaves
    // follow mode; an unchanged offset with a growing tail must not cancel it.
    if (atBottom) state.following = true;
    else if (offset < state.offset - 1) state.following = false;
    state.offset = offset;
    state.viewport = viewport;
    state.content = content;
    if (state.following && (resized || !wasFollowing)) requestFollow();
  }, [requestFollow]);

  return { requestFollow, onLayout, onContentSizeChange, onScroll };
}
