// Container measurement: the middle tier of the responsiveness system (see the
// decision tree in responsive.ts). A component that needs a discrete layout
// switch measures its OWN width, never the window: it cannot know whether it
// is on a phone or in a 320px desktop panel, and only its container width is
// truthful (the DataTable precedent). These hooks are the shared primitives
// behind that pattern; attach the returned `onLayout` to the component's
// existing root so no wrapper View perturbs the flex layout.
//
// First-frame policy: `width` is 0 until the first layout, and a Responsive
// map resolves 0 to `base`, the desktop variant, matching the server and the
// kit's desktop-first authoring. Gate on `measured` only where rendering the
// base variant is worse than rendering nothing (chart geometry needs real px);
// pass `seedViewport` where a grid must show a plausible arrangement on frame
// one (the docs catalog precedent: relying on onLayout alone hid every tile
// when the web ResizeObserver did not fire).

import { useCallback, useState } from "react";
import { Dimensions, type LayoutChangeEvent } from "react-native";
import { responsive, type Responsive } from "./responsive.js";

export interface MeasuredWidth {
  /** The element's rounded layout width in px; 0 until the first layout. */
  width: number;
  /** True once a real layout has been observed (width > 0). */
  measured: boolean;
  /** Attach to the element to measure. Stable identity; re-renders only when
   *  the ROUNDED width changes, so subpixel relayout churn is free. */
  onLayout: (event: LayoutChangeEvent) => void;
}

/** Measure the width of whatever element the returned `onLayout` is attached to. */
export function useMeasuredWidth(): MeasuredWidth {
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const layout = event.nativeEvent?.layout;
    if (!layout) return;
    const next = Math.round(layout.width);
    setWidth((prev) => (prev === next ? prev : next));
  }, []);
  return { width, measured: width > 0, onLayout };
}

export interface ContainerBreakpointOptions {
  /** Resolve against the WINDOW width until the element has measured, instead
   *  of rendering `base`. For above-the-fold grids whose desktop arrangement
   *  would visibly flash on a phone's first frame. */
  seedViewport?: boolean;
}

export interface ContainerBreakpoint<T> extends MeasuredWidth {
  /** The map value for the element's own width (base until measured, or the
   *  window-seeded value with `seedViewport`). */
  value: T;
}

/** Container query: resolve a Responsive map against the element's OWN width. */
export function useContainerBreakpoint<T>(
  map: Responsive<T>,
  options?: ContainerBreakpointOptions,
): ContainerBreakpoint<T> {
  const { width, measured, onLayout } = useMeasuredWidth();
  const effective = !measured && options?.seedViewport ? Dimensions.get("window").width : width;
  return { value: responsive(effective, map), width, measured, onLayout };
}
