import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

// Whether the page sits at its scroll edge: nothing has scrolled under the web shell's top
// bar yet. The bar is then `bare` (the kit Navbar's scroll-edge appearance), clear on Dark
// Factory's frosted frame as Dark Factory's own top bar is (./page-frame.tsx), and it takes
// its material back once content scrolls under it (the owner's 2026-10-14 choice). The page
// scroller reports only when it crosses the edge, so scrolling re-renders nothing between.
interface ScrollEdge {
  atEdge: boolean;
  report: (atEdge: boolean) => void;
}

const Ctx = createContext<ScrollEdge>({ atEdge: true, report: () => {} });

export function ScrollEdgeProvider({ children }: { children: ReactNode }) {
  const [atEdge, report] = useState(true);
  const value = useMemo(() => ({ atEdge, report }), [atEdge]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Whether the page sits at its scroll edge (true outside a provider). */
export function useAtScrollEdge(): boolean {
  return useContext(Ctx).atEdge;
}

/**
 * The page scroller's half: an `onScroll` handler that reports the edge as the offset
 * crosses it, and a report of the edge on mount and unmount (a new route starts at it).
 */
export function useScrollEdgeReporter(): (event: NativeSyntheticEvent<NativeScrollEvent>) => void {
  const { report } = useContext(Ctx);
  useEffect(() => {
    report(true);
    return () => report(true);
  }, [report]);
  return useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => report(event.nativeEvent.contentOffset.y <= 0), [report]);
}
