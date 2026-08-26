import { useSyncExternalStore } from "react";

// KIT-INTERNAL: the one hydration gate the kit defers client-only facts behind.
// Deliberately NOT re-exported from src/style/index.ts (and so not from the package
// barrel): it is an authoring tool for kit components, not public API. Import it by
// path, the way Board imports `useDragActive`.

// Nothing ever changes, so the subscribe callback never fires; the value flips only
// because React reads the server snapshot for the server render AND for the hydration
// render, then the client snapshot from the first commit on.
const subscribeNever = () => () => {};

/**
 * False for the server render and the hydration render, true from the first commit
 * onward.
 *
 * A fact only the client knows (the window's width, a value in browser storage) cannot
 * be read during hydration. On the server it is simply absent, so the markup is built
 * without it; on the client it is right there, so the same component would render
 * something else and React would report a hydration mismatch it does not patch up: it
 * throws the server tree away and rebuilds the subtree. Deferring the read by one
 * render keeps the hydration pass byte-identical to the server and lets the real value
 * land in the commit immediately after, which is the same contract `ThemeProvider`'s
 * `ssrScheme` gives the colour axis.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
