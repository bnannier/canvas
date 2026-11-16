import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

// Restored from the pre-v4 mobile shell: only crossing the page's top edge changes
// the Navbar's bare/material appearance, rather than rerendering on every scroll.
const ScrollEdge = createContext({ atEdge: true, report: (_atEdge: boolean) => {} });

export function ScrollEdgeProvider({ children }: { children: ReactNode }) {
  const [atEdge, report] = useState(true);
  const value = useMemo(() => ({ atEdge, report }), [atEdge]);
  return <ScrollEdge.Provider value={value}>{children}</ScrollEdge.Provider>;
}

export function useAtScrollEdge(): boolean {
  return useContext(ScrollEdge).atEdge;
}

export function useScrollEdgeReporter() {
  const { report } = useContext(ScrollEdge);
  useEffect(() => {
    report(true);
    return () => report(true);
  }, [report]);
  return useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    report(event.nativeEvent.contentOffset.y <= 0);
  }, [report]);
}
