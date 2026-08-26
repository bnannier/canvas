import { useEffect, useRef } from "react";
import { type View } from "react-native";

// Wheel-to-zoom for the map chart. While `active`, a wheel listener bound to the
// returned ref's node reports scroll travel in pixels along with where the pointer
// was, so a zoom can be anchored under the cursor.
//
// This is additive web-only EVENT handling (a listener bound to a node RNW renders
// as a real DOM element), not a web-only rendering branch, so it stays inside the
// kit's cross-platform rules. A phone has no wheel and no `document`, so the whole
// effect is a no-op there and never touches a DOM global.
//
// WHY NOT THE `onWheel` PROP. React Native Web's View does forward `onWheel` to the
// DOM node, so the prop reaches the browser. But React registers its ROOT `wheel`
// listener as PASSIVE (react-dom 19 does this for exactly touchstart, touchmove and
// wheel), and preventDefault() from a passive listener is ignored: the page would
// scroll out from under the map on every notch, and Chrome would log a violation
// for each one. Binding the node directly with `{ passive: false }` is the only way
// to claim the gesture, which is why this hook exists rather than a prop.

/** One notch or trackpad swipe, normalized. */
export interface WheelGesture {
  /** Scroll travel in PIXELS, whatever unit the browser reported. Positive scrolls
   *  the page down, which reads as zooming out. */
  deltaY: number;
  /** The pointer's position within the bound node, in pixels from its top-left. */
  x: number;
  y: number;
  /** True for a trackpad pinch, which every browser reports as ctrl+wheel. */
  pinch: boolean;
}

// Firefox reports lines by default and some setups report pages, so a raw deltaY
// zooms at wildly different rates per browser. These are the conventional
// equivalents: roughly one line of text, and roughly one screen of scrolling.
const PX_PER_LINE = 16;
const PX_PER_PAGE = 400;

/** Scroll travel in pixels, whatever unit `deltaMode` says the browser used. */
export function normalizeWheelDelta(delta: number, deltaMode: number): number {
  if (!Number.isFinite(delta)) return 0;
  if (deltaMode === 1) return delta * PX_PER_LINE;
  if (deltaMode === 2) return delta * PX_PER_PAGE;
  return delta;
}

export function useWheel(
  /** Subscribe only while true (pass the chart's own `zoomable`). */
  active: boolean,
  /** Return TRUE to claim the gesture; only then is the page's own scroll suppressed. */
  onWheel: (gesture: WheelGesture) => boolean,
) {
  const nodeRef = useRef<View>(null);
  // Latch the latest callback so a fresh closure each render never re-subscribes.
  const callback = useRef(onWheel);
  callback.current = onWheel;

  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    // RNW renders the View as a DOM element, so the ref is an HTMLElement at
    // runtime; bridge the RN ref type to it for the DOM-only listener work. The
    // probe asks a CAPABILITY question ("can this node take a listener?"), never a
    // platform question, which is what keeps it inside the kit's rules.
    const node = nodeRef.current as unknown as HTMLElement | null;
    if (node == null || typeof node.addEventListener !== "function") return;

    const handler = (event: Event) => {
      const wheel = event as WheelEvent;
      const rect = node.getBoundingClientRect();
      // A zero-size box means the map is not laid out yet; there is nothing
      // meaningful to anchor a zoom to, so let the page have the scroll.
      if (rect.width <= 0 || rect.height <= 0) return;
      const claimed = callback.current({
        deltaY: normalizeWheelDelta(wheel.deltaY, wheel.deltaMode),
        // Measured from the bound node's own box, NOT offsetX: the hit-layer
        // Pressable is the real event target, so offsetX would be relative to it.
        // An event that carries no pointer position at all (a synthetic one, or a
        // keyboard-driven scroll) anchors at the node's centre rather than
        // resolving to NaN and taking the camera with it.
        x: Number.isFinite(wheel.clientX) ? wheel.clientX - rect.left : rect.width / 2,
        y: Number.isFinite(wheel.clientY) ? wheel.clientY - rect.top : rect.height / 2,
        pinch: wheel.ctrlKey === true,
      });
      // Only a gesture we actually acted on suppresses the page's scroll, so a map
      // already at its limit hands the very next notch straight back to the page.
      if (claimed) event.preventDefault();
    };

    node.addEventListener("wheel", handler, { passive: false });
    return () => node.removeEventListener("wheel", handler);
  }, [active]);

  return nodeRef;
}
