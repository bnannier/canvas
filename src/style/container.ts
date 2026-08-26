// Container measurement: the middle tier of the responsiveness system (see the
// decision tree in responsive.ts). A component that needs a discrete layout
// switch measures its OWN width, never the window: it cannot know whether it
// is on a phone or in a 320px desktop panel, and only its container width is
// truthful (the DataTable precedent). These hooks are the shared primitives
// behind that pattern; attach the returned `onLayout` to the component's
// existing root so no wrapper View perturbs the flex layout. That only works
// when the root SPANS the container: a hugging root (a fixed-width rail, a
// shrink-wrapped row) would measure its own hugged width, latching the narrow
// branch forever. Such components attach the handler to a `containerProbe`
// sibling instead (below), which spans the container out of flow.
//
// First-frame policy: `width` is 0 until the first layout, and a Responsive
// map resolves 0 to `base`, the desktop variant, matching the server and the
// kit's desktop-first authoring. Gate on `measured` only where rendering the
// base variant is worse than rendering nothing (chart geometry needs real px);
// pass `seedViewport` where a grid must show a plausible arrangement on frame
// one (the docs catalog precedent: relying on onLayout alone hid every tile
// when the web ResizeObserver did not fire).

import { useCallback, useState } from "react";
import { Dimensions, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { responsive, useBreakpoint, type Responsive } from "./responsive.js";
// False for the server render and the hydration render, true from the first commit
// onward. The window-width fallback below is a client-only fact: on the server there
// is no window, so a cell renders with no width, and reading it during the hydration
// render would make the same cell claim an explicit pixel width the server never
// shipped. `use-hydrated.ts` carries the full note; DashboardGrid gates its stored
// widget order behind the same hook.
import { useHydrated } from "./use-hydrated.js";

/**
 * Container probe for HUGGING components. A component whose root hugs its
 * content cannot learn its container's width by measuring itself (the Tabs
 * vertical rail post-mortem: the rail measured its own ~180px and `narrow`
 * latched true in any container). Render a sibling View with this style
 * beside the root and attach the measurement hook's `onLayout` to it:
 * absolutely positioned against the parent (RN Views are position:relative
 * by default), it spans the container's width in either flex direction,
 * takes no space in the flex flow (no gap slot), and intercepts nothing.
 */
export const containerProbe: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  height: 0,
  pointerEvents: "none",
};

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

/** Like useMeasuredWidth, but `width` falls back to the WINDOW width until the
 *  first layout: the best available guess for the unmeasured first frame. For
 *  components whose threshold is a raw px value rather than a breakpoint
 *  (Form's two-column stack). Subscribes at bucket granularity so the fallback
 *  stays fresh across breakpoint-sized resizes without per-pixel re-renders.
 *
 *  The fallback is withheld until after hydration (see `useHydrated`), so a
 *  server-rendered app hydrates against the same markup it shipped. */
export function useContainerWidth(): MeasuredWidth {
  const { width, measured, onLayout } = useMeasuredWidth();
  const hydrated = useHydrated();
  useBreakpoint();
  if (measured) return { width, measured, onLayout };
  return { width: hydrated ? Dimensions.get("window").width : 0, measured, onLayout };
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
  // Bucket-granular viewport subscription: keeps the pre-measurement seed fresh
  // across breakpoint-sized resizes; once measured it costs at most one
  // re-render per bucket crossing.
  useBreakpoint();
  // The seed is withheld until after hydration for the same reason the window
  // fallback is in useContainerWidth: reading the window during the hydration
  // render resolves a different branch than the one the server shipped.
  const hydrated = useHydrated();
  const effective = !measured && options?.seedViewport && hydrated ? Dimensions.get("window").width : width;
  return { value: responsive(effective, map), width, measured, onLayout };
}
