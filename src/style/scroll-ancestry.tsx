// What an open anchored card listens to so it follows its trigger without re-reading
// layout every frame: the scrolls that can move the trigger under a card that does not
// scroll with it. Internal: the package index does not export this module.
//
// React Native reports no layout shift, so a card can only follow what it can hear.
// On the web a scroll of any element, the window's included, is heard by one capture
// listener on the document (an event subscription in the DOM event layer, like the
// escape layer's key listeners; nothing is rendered or styled). Natively the kit's own
// scrollers (the ScrollView primitive and the overlay scrollport) publish their scrolls
// through ScrollAncestryContext, each chained to the kit scroller around it. A scroller
// the kit cannot hear is React Native's own ScrollView or a list built on it (FlatList,
// SectionList) used directly: React Native's scroll context (ScrollView.Context) is
// set inside it, and a kit scroller re-provides that context with a token of its own,
// so a context that is set and is not the nearest kit scroller's token is such a
// scroller. Only a card whose trigger sits in one keeps the frame poll.

import { type Context, createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { ScrollView as RNScrollView, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

export interface ScrollAncestry {
  /** Listen for a scroll of this scroller or of any kit scroller around it. */
  subscribe(listener: () => void): () => void;
  /** The value this scroller gives React Native's scroll context inside it. */
  token: object;
}

/** The nearest kit scroller around a node, or null. */
export const ScrollAncestryContext = createContext<ScrollAncestry | null>(null);

// React Native's scroll context is a static on its ScrollView. React Native Web has
// none, so there nothing is ever unheard (the document listener hears every scroll),
// and the stand-in here is what a test provides to stage an unheard scroller.
const NoScrollContext = createContext<unknown>(null);
export const NativeScrollContext: Context<unknown> = (RNScrollView as unknown as { Context?: Context<unknown> }).Context ?? NoScrollContext;

/** Whether a node sits in a scroller the kit cannot hear (React Native's own, used directly). */
export function useUnheardScroller(): boolean {
  const native = useContext(NativeScrollContext);
  const kit = useContext(ScrollAncestryContext);
  return native != null && native !== kit?.token;
}

/**
 * Listen for every scroll the document reports (capture phase, so a scroll of any
 * element is heard as well as the window's). A no-op where there is no document.
 */
export function subscribeDocumentScroll(listener: () => void): () => void {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return () => {};
  const options = { capture: true, passive: true } as const;
  document.addEventListener("scroll", listener, options);
  return () => document.removeEventListener("scroll", listener, options);
}

type ScrollHandler = ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;

/**
 * A kit scroller's half: wraps its children in the contexts above and composes its
 * scroll handler, which it attaches only while a card listens (or its owner passed one).
 * While a card listens, the scroller asks for a scroll event every frame
 * (`scrollEventThrottle` 16); a scroller that sets its own throttle keeps it. Pass `wrap: false` where the
 * children must reach React Native's ScrollView unwrapped (sticky headers are found
 * by child index); its children then read as sitting in an unheard scroller.
 */
export function useScrollAncestor({ horizontal, onScroll, scrollEventThrottle, wrap = true }: {
  horizontal?: boolean | null;
  onScroll?: ScrollHandler;
  scrollEventThrottle?: number;
  wrap?: boolean;
}) {
  const parent = useContext(ScrollAncestryContext);
  const listeners = useRef(new Set<() => void>());
  const [listening, setListening] = useState(false);
  const value = useMemo<ScrollAncestry>(() => ({
    // React Native's own context value has this shape; consumers read `horizontal`.
    token: { horizontal: !!horizontal },
    subscribe(listener) {
      listeners.current.add(listener);
      setListening(true);
      const outer = parent?.subscribe(listener);
      return () => {
        listeners.current.delete(listener);
        if (listeners.current.size === 0) setListening(false);
        outer?.();
      };
    },
  }), [parent, horizontal]);
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    listeners.current.forEach((listener) => listener());
    onScroll?.(event);
  }, [onScroll]);
  const children = useCallback((content: ReactNode) => !wrap ? content : (
    <ScrollAncestryContext.Provider value={value}>
      <NativeScrollContext.Provider value={value.token}>{content}</NativeScrollContext.Provider>
    </ScrollAncestryContext.Provider>
  ), [value, wrap]);
  return {
    // Only while a card listens (or the owner listens itself): a scroll handler makes the
    // platform deliver every scroll event to JavaScript.
    onScroll: listening || onScroll ? handleScroll : undefined,
    scrollEventThrottle: scrollEventThrottle ?? (listening ? 16 : undefined),
    children,
  };
}
