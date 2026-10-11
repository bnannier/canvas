import { createContext, forwardRef, useContext, useRef } from "react";
import { ScrollView, type ScrollViewProps, type View, type ViewStyle } from "react-native";
import { useScrollFocus } from "./use-scroll-focus.js";
import { FocusFrameContext } from "./focus-frame.js";
import { FOCUS_RESET } from "./focus-reset.js";
import { useFocusRingStyle } from "./pressable.js";
import { useComposedRefs } from "./use-composed-refs.js";
import { useScrollAncestor } from "./scroll-ancestry.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";
import type { RevealInCard } from "./accessibility-focus.js";

export const OverlayScrollContext = createContext<{
  contentHeight(height: number): void;
  viewportHeight(height: number): void;
} | null>(null);

// The scrollport is CONTENT-SIZED. The card it sits in has no height of its own,
// only a cap (the skin's maxHeight and the fitted band), so the port takes its
// rows' height and shrinks to the cap; it must never grow. React Native's
// ScrollView carries `flexGrow: 1` by default, and on iOS and Android that growth
// inflated the hosted overlay's absolute wrapper: Yoga measures a wrapper with no
// height of its own at max-content, turns the card's maxHeight into an at-most
// constraint for that measure, and under the legacy stretch errata React Native
// keeps on (YGErrataAll) a growing child fills an at-most constraint. The wrapper
// then measured as tall as the cap while the card laid out content-sized at the
// wrapper's top: invisible under a `top` anchor, but a card opened ABOVE its
// trigger is pinned by `bottom`, so it floated up to the top of the visible band
// and left the trigger behind (iOS 26 docs dev app, 2026-09-19). Growing the port
// never had a purpose here (no anchored card has a definite height), so the port
// declares that it does not.
const SCROLLPORT: ViewStyle = { flexGrow: 0, flexShrink: 1 };

// Whether the card's rows are its one keyboard stop: a menu or an option list, whose rows
// rove (src/style/use-row-focus.ts, the WAI-ARIA menu and listbox patterns). Its port
// then takes no stop of its own, overflowing or not: a scroller is a stop only while it
// holds no focusable child (WCAG 2.1.1, the owner's decision on scroll regions), and the
// focused row scrolls the port as the arrow keys move it.
export const OverlayRowsContext = createContext(false);

/** A card's scrollport, as the card that frames it reaches it. */
export interface OverlayPort {
  /** Scroll `node`, a node of the port's content, into the port's view, then call `done`. */
  reveal: RevealInCard;
}

// The card's hold on its one scrollport: the port registers itself here, and the card
// reveals the node focus enters at in it (AnchoredOverlay's entry, enterCard in
// src/style/accessibility-focus.ts).
export const OverlayPortContext = createContext<{ current: OverlayPort | null } | null>(null);

// Otherwise the port is a keyboard stop while its rows overflow, and it sits flush inside its
// card's clip, which would cut a ring drawn around it while the rows would cover one
// drawn inside it. So the card that frames it draws the ring (src/style/focus-frame.tsx)
// and the port wears none; a port with nothing framing it wears the kit's own ring.
// The frame's handlers run beside any the owner passes, and its ref beside the port's.
type FrameHandler = "onKeyUp" | "onPointerDown" | "onFocus" | "onBlur";
const FRAME_HANDLERS: readonly FrameHandler[] = ["onKeyUp", "onPointerDown", "onFocus", "onBlur"];
type Handlers = Partial<Record<FrameHandler, (event: unknown) => void>>;

/** One measured scrollport, shared by anchored cards and option-list owners. */
export const OverlayScrollView = forwardRef<ScrollView, ScrollViewProps>(function OverlayScrollView({
  style, onLayout, onContentSizeChange, tabIndex, children, onScroll, scrollEventThrottle, ...props
}, ref) {
  const report = useContext(OverlayScrollContext);
  // A card opened from a row inside this port follows the row's scroll (src/style/scroll-ancestry.tsx).
  const ancestor = useScrollAncestor({ horizontal: props.horizontal, onScroll, scrollEventThrottle });
  const frame = useContext(FocusFrameContext);
  const ownRing = useFocusRingStyle();
  const focus = useScrollFocus("vertical");
  const rows = useContext(OverlayRowsContext);
  const scroll = useRef<ScrollView | null>(null);
  const portRef = useComposedRefs<ScrollView>(ref, frame?.ref, scroll);
  // The port's height and its content's, for the reveal below.
  const extent = useRef({ viewport: 0, content: 0 });
  const card = useContext(OverlayPortContext);
  useIsomorphicLayoutEffect(() => {
    if (!card) return;
    const port: OverlayPort = {
      // The node a card's entry moves focus to, brought into view the least distance (as the
      // arrow keys keep the focused row in view). The entry runs as the card is revealed,
      // before anyone could scroll the port, so the port stands at its top: the node is out
      // of view when its bottom passes the port's. A node outside the port's content (a
      // field above it) is left alone.
      reveal(node, done) {
        // The content view (React Native and React Native Web both have it; RN's types
        // name only the older handle getter).
        const inner = (scroll.current as unknown as { getInnerViewRef?: () => View | null } | null)?.getInnerViewRef?.();
        const target = node as unknown as View | null;
        const { viewport, content } = extent.current;
        if (!inner || !target || typeof target.measureLayout !== "function" || viewport <= 0) {
          done();
          return;
        }
        target.measureLayout(inner, (_x, y, _width, height) => {
          if (y >= 0 && y + height <= content + 0.5 && y + height > viewport + 0.5) {
            scroll.current?.scrollTo({ y: y + height - viewport, animated: false });
          }
          done();
        }, done);
      },
    };
    card.current = port;
    return () => {
      if (card.current === port) card.current = null;
    };
  }, [card]);
  let framed: Handlers | null = null;
  if (frame) {
    const fromFrame = frame as unknown as Handlers;
    const fromOwner = props as unknown as Handlers;
    framed = {};
    for (const name of FRAME_HANDLERS) {
      framed[name] = (event) => {
        fromFrame[name]?.(event);
        fromOwner[name]?.(event);
      };
    }
  }
  return (
    <ScrollView
      {...props}
      {...(framed as object | null)}
      ref={portRef}
      style={[SCROLLPORT, frame ? FOCUS_RESET : ownRing, style]}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps ?? "handled"}
      tabIndex={tabIndex ?? (rows ? -1 : focus.tabIndex)}
      onLayout={(event) => {
        extent.current.viewport = event.nativeEvent.layout.height;
        focus.onLayout(event);
        report?.viewportHeight(event.nativeEvent.layout.height);
        onLayout?.(event);
      }}
      onContentSizeChange={(width, height) => {
        extent.current.content = height;
        focus.onContentSizeChange(width, height);
        report?.contentHeight(height);
        onContentSizeChange?.(width, height);
      }}
      onScroll={ancestor.onScroll}
      scrollEventThrottle={ancestor.scrollEventThrottle}
    >
      {ancestor.children(children)}
    </ScrollView>
  );
});
