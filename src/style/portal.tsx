// The overlay portal layer: a cross-platform teleport so a component can render
// floating content (a dropdown menu, a popover card) OVER the page and outside
// its own bounds, with NO web-only escape hatches. Built from RN View/Pressable
// only: no Modal, no DOM, no position:"fixed".
//
// An <OverlayProvider> owns an outlet (a full-bleed absolute layer) plus a
// registry of portaled nodes. A <Portal> teleports its children into the nearest
// provider via context; with NO provider in the tree it renders its children
// inline in place, which is exactly the kit's pre-portal behavior, so an unhosted
// consumer is never broken. This mirrors the @gorhom/portal / react-native-paper
// Portal.Host pattern.
//
// Mount one <OverlayProvider> at an app's root for screen-level overlays; the
// docs mount one per example stage so a portaled overlay stays contained to its
// stage card instead of covering the gallery.
//
// Re-render isolation: the registry lives in refs (not provider state) and the
// only component that reads it is the sibling <Outlet>, which subscribes via
// useSyncExternalStore. So publishing a node re-renders the Outlet alone, never
// the provider's `children` (where the <Portal> lives) — without that split, a
// Portal that re-publishes on each render would loop forever.

import {
  Fragment,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import {
  GlassBlurTargetContext,
  GlassWindowBlurTargetContext,
} from "./glass-surface/glass-surface.shared.js";
import { GlassBlurTargetHost, glassBlurTargetAvailable } from "./glass-surface/glass-blur-target.js";

// What a <Portal> (and an anchored overlay) needs from its host. `measureOutlet`
// is exposed so an anchored overlay can measure a trigger RELATIVE TO the outlet
// (measureInWindow on both, subtract) — correct for a screen-level host and a
// stage-scoped one alike.
export interface OverlayHost {
  /** Register or update a portaled node. Called on every render of <Portal>. */
  mount(id: string, node: ReactNode): void;
  /** Remove a portaled node. Called only when a <Portal> unmounts. */
  unmount(id: string): void;
  /** Measure the outlet's window rect, for relative anchoring. */
  measureOutlet(cb: (x: number, y: number, width: number, height: number) => void): void;
}

const OverlayContext = createContext<OverlayHost | null>(null);

/** The nearest overlay host, or null when no <OverlayProvider> is mounted. */
export function useOverlayHost(): OverlayHost | null {
  return useContext(OverlayContext);
}

const FILL: ViewStyle = { flex: 1 };

// The outlet sits above page content and fills the provider's box. box-none lets
// taps fall through to the page when nothing is portaled (an opaque-to-touch
// full-bleed layer would otherwise eat every press); each open overlay supplies
// its own backdrop to catch outside taps while it is shown.
//
// box-none MUST live in a StyleSheet.create style, never an inline `{
// pointerEvents }` object. react-native-web only compiles its box-none polyfill
// (the box itself `pointer-events:none`, its portaled children `auto`) for
// registered styles; an inline literal is silently dropped, leaving this
// full-bleed z-1000 outlet at `pointer-events:auto` where it swallows every
// click on the page. Native honors box-none either way; this keeps web correct.
const outletStyles = StyleSheet.create({
  outlet: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, pointerEvents: "box-none" },
});

export interface OverlayProviderProps {
  children: ReactNode;
  /**
   * Style for the positioning wrapper. Defaults to `flex: 1` so an app-root host
   * fills the screen; pass a style to override for a content-sized host (e.g. a
   * docs example stage).
   */
  style?: StyleProp<ViewStyle>;
}

export function OverlayProvider({ children, style }: OverlayProviderProps) {
  // The registry is an immutable Map snapshot held in a ref; each change swaps in
  // a new Map (new identity) so useSyncExternalStore detects it. Insertion order
  // is preserved, so a later-opened overlay paints over an earlier one.
  const snapshot = useRef<ReadonlyMap<string, ReactNode>>(new Map());
  const listeners = useRef<Set<() => void>>(new Set());
  const outletRef = useRef<View>(null);

  // The Android sibling blur target (expo-blur 57+; see GlassBlurTargetContext in
  // glass-surface.shared). The host wraps `children` in a BlurTargetView holding
  // this ref, and the outlet — a native SIBLING of that content — gets the ref via
  // GlassBlurTargetContext so portaled frost overlays blur the page. The outlet
  // must get this provider's OWN target, never an inherited one: an outer
  // provider's target contains this whole subtree, outlet included, and an
  // ancestor target segfaults Android's RenderThread.
  const blurTargetRef = useRef<View>(null);
  const ownBlurTarget = glassBlurTargetAvailable ? blurTargetRef : null;
  // Separate-native-window surfaces (RN Modal — Drawer, ActionSheet) instead take
  // the window-level target, where OUTERMOST wins so a Modal opened from a nested
  // host (a docs stage) blurs the page, not just its stage. Safe at any depth: a
  // Modal's window is never a descendant of the main window's target.
  const inheritedWindowTarget = useContext(GlassWindowBlurTargetContext);
  const windowBlurTarget = inheritedWindowTarget ?? ownBlurTarget;

  const host = useMemo<OverlayHost>(() => {
    const emit = () => listeners.current.forEach((l) => l());
    return {
      mount(id, node) {
        const next = new Map(snapshot.current);
        next.set(id, node);
        snapshot.current = next;
        emit();
      },
      unmount(id) {
        if (!snapshot.current.has(id)) return;
        const next = new Map(snapshot.current);
        next.delete(id);
        snapshot.current = next;
        emit();
      },
      measureOutlet(cb) {
        outletRef.current?.measureInWindow(cb);
      },
    };
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);
  const getSnapshot = useCallback(() => snapshot.current, []);

  return (
    <OverlayContext.Provider value={host}>
      <GlassWindowBlurTargetContext.Provider value={windowBlurTarget}>
        <GlassBlurTargetHost
          style={[FILL, style]}
          targetRef={blurTargetRef}
          outlet={
            <GlassBlurTargetContext.Provider value={ownBlurTarget}>
              <Outlet outletRef={outletRef} subscribe={subscribe} getSnapshot={getSnapshot} />
            </GlassBlurTargetContext.Provider>
          }
        >
          {children}
        </GlassBlurTargetHost>
      </GlassWindowBlurTargetContext.Provider>
    </OverlayContext.Provider>
  );
}

interface OutletProps {
  outletRef: React.RefObject<View | null>;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ReadonlyMap<string, ReactNode>;
}

// The sole reader of the registry. Re-renders on registry changes only; being a
// sibling of the provider's `children`, its updates never re-render them.
function Outlet({ outletRef, subscribe, getSnapshot }: OutletProps) {
  const nodes = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return (
    <View ref={outletRef} style={outletStyles.outlet}>
      {[...nodes].map(([id, node]) => (
        <Fragment key={id}>{node}</Fragment>
      ))}
    </View>
  );
}

export interface PortalProps {
  children: ReactNode;
}

/**
 * Teleport `children` into the nearest <OverlayProvider> outlet. With no provider
 * mounted, render them inline in place (the kit's pre-portal behavior).
 */
export function Portal({ children }: PortalProps) {
  const host = useOverlayHost();
  const id = useId();

  // Publish the CURRENT children on every render (children is a fresh node each
  // render, so the teleported tree is never stale). Cheap: it sets the provider's
  // registry, not this component's state.
  useEffect(() => {
    if (host) host.mount(id, children);
  });

  // Cleanup runs ONLY on true unmount. Kept separate from the publish effect: a
  // combined effect would tear down and re-add the node every render (flicker,
  // lost focus).
  useEffect(() => {
    if (!host) return;
    return () => host.unmount(id);
  }, [host, id]);

  return host ? null : <>{children}</>;
}
