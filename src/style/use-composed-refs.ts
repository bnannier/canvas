import { useMemo, type Ref, type RefCallback } from "react";

/** Compose host refs without depending on the renderer to run ref cleanups. */
export function useComposedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return useMemo(() => {
    let cleanup: (() => void) | undefined;
    // Keep a void callback for React 18 and RNW, whose internal ref composition
    // discards returned functions. React 19 cleanup refs still run on detach.
    return (node: T | null) => {
      cleanup?.();
      cleanup = undefined;
      if (node == null) return;
      const cleanups = refs.map((ref) => {
        if (ref == null) return undefined;
        if (typeof ref === "function") {
          const result = ref(node);
          return typeof result === "function" ? result : () => { ref(null); };
        }
        ref.current = node;
        return () => { ref.current = null; };
      });
      cleanup = () => { for (const dispose of cleanups) dispose?.(); };
    };
    // Ref identity determines which owners attach and detach, just as a host ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
