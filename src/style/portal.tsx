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
// docs mount one per example stage so a portaled overlay is placed within its
// stage card. A nested provider frames its overlays, it does not bound the window:
// a card that closes on an outside tap paints, with its dismiss backdrop, in the
// window's outermost provider (its layer, src/style/overlay-layer.tsx), so a tap
// anywhere off it closes it, the way a platform menu behaves.
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
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";
import { Keyboard, Platform, View, StyleSheet, type KeyboardEvent, type StyleProp, type ViewStyle } from "react-native";
import {
  GlassBlurTargetContext,
  GlassWindowBlurTargetContext,
} from "./glass-surface/glass-surface.shared.js";
import { createCaptureTarget } from "./glass-surface/capture-target.js";
import { GlassBlurTargetHost, blurTargetMountable } from "./glass-surface/glass-blur-target.js";
import { registerOverlayLayer, usePortalMount } from "./overlay-layer.js";
import { useSafeAreaInsetsOrNull, type SafeAreaInsets } from "./safe-area.js";

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
  /** Observe host layout changes, including native keyboard resizing. */
  subscribeLayout?(listener: () => void): () => void;
  /**
   * Hold this window's page hidden from VoiceOver and TalkBack while a modal card
   * (an anchored card that can close) is open in this host's outlet; call the returned
   * function when it closes. Cards held later are above earlier ones.
   */
  holdModal?(id: string): () => void;
  /** Observe the modal cards held in this host. */
  subscribeModal?(listener: () => void): () => void;
  /** The id of the topmost modal card held in this host, or null. */
  topModal?(): string | null;
  /**
   * Measure the visible band inherited from this native window's viewport: the
   * window's safe area less the app's declared chrome and the keyboard, on all four
   * edges, in window coordinates.
   */
  measureVisibleBounds?(cb: (bounds: OverlayBounds) => void): void;
  /**
   * Measure the window this host's layer covers, where a modal sheet stands: `window` is
   * the layer's own box cut at the keyboard's top (the app's declared chrome is not cut:
   * a sheet covers its tab bar), and `safe` is the window's safe area within it, which the
   * sheet's content keeps clear of; both in window coordinates.
   */
  measureWindowBounds?(cb: (window: OverlayBounds, safe: OverlayBounds) => void): void;
}

export interface OverlayBounds { x: number; y: number; width: number; height: number }

export interface OverlayViewportInsets { top?: number; bottom?: number }

/** Reserve app-declared vertical occlusions within a measured viewport. */
export function insetOverlayBounds(bounds: OverlayBounds, insets: OverlayViewportInsets): OverlayBounds {
  const positive = (value: number | undefined) => Number.isFinite(value) ? Math.max(0, value!) : 0;
  const top = Math.min(bounds.height, positive(insets.top));
  const bottom = Math.min(bounds.height - top, positive(insets.bottom));
  return { ...bounds, y: bounds.y + top, height: bounds.height - top - bottom };
}

export function intersectOverlayBounds(a: OverlayBounds, b: OverlayBounds): OverlayBounds {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  return { x, y, width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x), height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y) };
}

// A window's box less its safe-area insets on all four edges.
function safeWithin(window: OverlayBounds, insets: SafeAreaInsets): OverlayBounds {
  const width = Math.max(0, window.width - insets.left - insets.right);
  const height = Math.max(0, window.height - insets.top - insets.bottom);
  return { x: window.x + Math.min(insets.left, window.width), y: window.y + Math.min(insets.top, window.height), width, height };
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
  /** Start a new measurement boundary inside a separate native Modal window. */
  separateWindow?: boolean;
  /** Constrain nested cards to this provider's measured viewport. Nested
   * content-sized hosts otherwise inherit their window's visible bounds. */
  viewport?: boolean;
  /** Measured header/footer occlusions, relative to this provider's own box.
   * Applies to root hosts and nested hosts with `viewport`; content hosts
   * inherit their parent band instead. Vertical geometry only. */
  viewportInsets?: OverlayViewportInsets;
  /**
   * Style for the positioning wrapper. Defaults to `flex: 1` so an app-root host
   * fills the screen; pass a style to override for a content-sized host (e.g. a
   * docs example stage).
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * The overlay host: mount one at the app root, inside ThemeProvider, so menus, popovers,
 * tooltips and other floating content render above the page in its outlet. Without one,
 * overlays render inline where they are declared.
 */
export function OverlayProvider({ children, style, separateWindow = false, viewport = false, viewportInsets }: OverlayProviderProps) {
  const inheritedHost = useOverlayHost();
  const parent = separateWindow ? null : inheritedHost;
  // The registry is an immutable Map snapshot held in a ref; each change swaps in
  // a new Map (new identity) so useSyncExternalStore detects it. Insertion order
  // is preserved, so a later-opened overlay paints over an earlier one.
  const snapshot = useRef<ReadonlyMap<string, ReactNode>>(new Map());
  const listeners = useRef<Set<() => void>>(new Set());
  const layoutListeners = useRef<Set<() => void>>(new Set());
  const topInset = viewportInsets?.top ?? 0;
  const bottomInset = viewportInsets?.bottom ?? 0;
  const insets = useRef({ top: topInset, bottom: bottomInset });
  useIsomorphicLayoutEffect(() => {
    if (insets.current.top === topInset && insets.current.bottom === bottomInset) return;
    insets.current = { top: topInset, bottom: bottomInset };
    // A changed header height invalidates measurements without replacing the
    // portal host, which would unmount open content and discard its focus.
    layoutListeners.current.forEach((listener) => listener());
  }, [topInset, bottomInset]);
  // A window layer (an app root, or a separate window's root) bounds its band by the
  // window's safe area on all four edges, so no card sits under the status bar, the
  // Dynamic Island, the home indicator or a landscape sensor housing. A layer fills its
  // window (the outlet's layout event is the window resizing), so the safe area is the
  // box it measures, fresh at every placement, less the insets; the peer's frame is not
  // read, since on the web it is the document's size from when the provider mounted
  // (src/style/safe-area.tsx). Nested hosts inherit their window's band, so only a layer
  // reads the insets. A rotation changes them, which re-places open cards the way a
  // changed header does.
  const safeInsets = useSafeAreaInsetsOrNull();
  const safe = useRef(safeInsets);
  useIsomorphicLayoutEffect(() => {
    const previous = safe.current;
    safe.current = safeInsets;
    if (parent || previous === safeInsets) return;
    if (previous && safeInsets && previous.top === safeInsets.top && previous.right === safeInsets.right && previous.bottom === safeInsets.bottom && previous.left === safeInsets.left) return;
    layoutListeners.current.forEach((listener) => listener());
  }, [parent, safeInsets]);
  const outletRef = useRef<View>(null);
  // The modal cards open in this host's outlet, oldest first (src/style/anchored-overlay.tsx).
  const modals = useRef<readonly string[]>([]);
  const modalListeners = useRef<Set<() => void>>(new Set());
  const keyboard = useRef(Platform.OS !== "web" ? Keyboard.metrics?.() : undefined);
  useEffect(() => {
    if (parent || Platform.OS === "web") return;
    const update = (event: KeyboardEvent) => {
      keyboard.current = event.endCoordinates;
      layoutListeners.current.forEach((listener) => listener());
    };
    const hide = () => {
      keyboard.current = undefined;
      layoutListeners.current.forEach((listener) => listener());
    };
    keyboard.current = Keyboard.metrics?.();
    const subscriptions = Platform.OS === "ios"
      ? [Keyboard.addListener("keyboardWillShow", update), Keyboard.addListener("keyboardWillChangeFrame", update), Keyboard.addListener("keyboardWillHide", hide)]
      : [Keyboard.addListener("keyboardDidShow", update), Keyboard.addListener("keyboardDidHide", hide)];
    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [parent]);

  // Each Android provider can own a stable content capture plane. Its outlet
  // is a native sibling, so it can sample that plane without a render-node cycle.
  // Content-sized providers inherit only an explicitly safe decorative or modal
  // plane, never the window context that contains their own foreground subtree.
  const captureTarget = useMemo(createCaptureTarget, []);
  const blurTargetRef = captureTarget.ref;
  const hostStyle: StyleProp<ViewStyle> = [FILL, style];
  const ownBlurTarget = blurTargetMountable(hostStyle) ? blurTargetRef : null;
  // A decorative backdrop already proven safe for the whole subtree is also
  // safe for this outlet. Never substitute the inherited window-level target.
  const inheritedSafeTarget = useContext(GlassBlurTargetContext);
  const outletBlurTarget = ownBlurTarget ?? inheritedSafeTarget;
  // Separate-native-window surfaces (a React Native Modal: Drawer, ActionSheet, an
  // app's own, through GlassModalBlurTarget) instead take the window-level plane,
  // where OUTERMOST wins so a Modal opened from a nested host (a docs stage) blurs
  // the page, not just its stage. Safe at any depth: a Modal's window is never a
  // descendant of the main window's plane.
  const inheritedWindowTarget = useContext(GlassWindowBlurTargetContext);
  const windowBlurTarget = inheritedWindowTarget ?? ownBlurTarget;

  const host = useMemo<OverlayHost>(() => {
    const emit = () => listeners.current.forEach((l) => l());
    const emitModal = () => modalListeners.current.forEach((l) => l());
    const created: OverlayHost = {
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
      subscribeLayout(listener) {
        layoutListeners.current.add(listener);
        const unsubscribe = parent?.subscribeLayout?.(listener);
        return () => { layoutListeners.current.delete(listener); unsubscribe?.(); };
      },
      holdModal(id) {
        modals.current = [...modals.current.filter((held) => held !== id), id];
        emitModal();
        return () => {
          if (!modals.current.includes(id)) return;
          modals.current = modals.current.filter((held) => held !== id);
          emitModal();
        };
      },
      subscribeModal(listener) {
        modalListeners.current.add(listener);
        return () => { modalListeners.current.delete(listener); };
      },
      topModal() {
        return modals.current[modals.current.length - 1] ?? null;
      },
      measureVisibleBounds(cb) {
        const measureOwn = (done: (bounds: OverlayBounds) => void) => {
          outletRef.current?.measureInWindow((x, y, width, height) => {
            // UIKit keyboard coordinates are window-relative on current RN.
            // RN 0.74 exposes screen coordinates: its supported keyboard host
            // configuration is a full-screen window with the same origin.
            // Android edge-to-edge windows do not resize for the IME, but their
            // full-screen window coordinates match the event. Legacy Android
            // adjustResize already reduces the outlet: min keeps that smaller
            // bound without subtracting the keyboard or status bar twice.
            const box = { x, y, width, height };
            const declared = insetOverlayBounds(box, insets.current);
            const own = !parent && safe.current ? intersectOverlayBounds(declared, safeWithin(box, safe.current)) : declared;
            const bottom = !parent && keyboard.current ? Math.min(own.y + own.height, keyboard.current.screenY) : own.y + own.height;
            done({ ...own, height: Math.max(0, bottom - own.y) });
          });
        };
        if (!parent) { measureOwn(cb); return; }
        const measureParent = parent.measureVisibleBounds ?? ((done: (bounds: OverlayBounds) => void) => parent.measureOutlet((x, y, width, height) => done({ x, y, width, height })));
        if (!viewport) { measureParent(cb); return; }
        // The parent's band and this outlet's box are independent reads, issued
        // together: react-native-web answers each measureInWindow on a macrotask
        // of its own, so chaining them would cost a task hop per nesting level.
        let band: OverlayBounds | null = null;
        let own: OverlayBounds | null = null;
        const settle = () => { if (band && own) cb(intersectOverlayBounds(own, band)); };
        measureParent((bounds) => { band = bounds; settle(); });
        measureOwn((bounds) => { own = bounds; settle(); });
      },
      measureWindowBounds(cb) {
        // A frame stands in its layer's window; a parent that cannot say gives its band.
        if (parent) {
          if (parent.measureWindowBounds) parent.measureWindowBounds(cb);
          else if (parent.measureVisibleBounds) parent.measureVisibleBounds((bounds) => cb(bounds, bounds));
          else parent.measureOutlet((x, y, width, height) => cb({ x, y, width, height }, { x, y, width, height }));
          return;
        }
        outletRef.current?.measureInWindow((x, y, width, height) => {
          const bottom = keyboard.current ? Math.min(y + height, keyboard.current.screenY) : y + height;
          const window = { x, y, width, height: Math.max(0, bottom - y) };
          cb(window, safe.current ? intersectOverlayBounds(window, safeWithin({ x, y, width, height }, safe.current)) : window);
        });
      },
    };
    // Inside a parent's window this host is a frame in the parent's layer; at an app
    // root or in a separate window (`parent` is null there) it is a layer itself.
    registerOverlayLayer(created, parent);
    return created;
  }, [parent, viewport]);

  const subscribe = useCallback((listener: () => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);
  const getSnapshot = useCallback(() => snapshot.current, []);
  const onOutletLayout = useCallback(() => layoutListeners.current.forEach((listener) => listener()), []);
  // While a modal card is open in a window layer, its page is hidden from VoiceOver and
  // TalkBack (the owner's AO-2 decision: an open anchored card is modal to them). Only
  // this subscription re-renders here; the page's own element is unchanged, so it does
  // not re-render.
  const subscribeModal = useCallback((listener: () => void) => {
    modalListeners.current.add(listener);
    return () => { modalListeners.current.delete(listener); };
  }, []);
  const modalOpen = useSyncExternalStore(subscribeModal, () => modals.current.length > 0, () => false);
  const layer = !parent;

  return (
    <OverlayContext.Provider value={host}>
      <GlassWindowBlurTargetContext.Provider value={windowBlurTarget}>
        <GlassBlurTargetHost
          style={hostStyle}
          targetRef={blurTargetRef}
          pageHidden={layer ? modalOpen : undefined}
          outlet={
            <GlassBlurTargetContext.Provider value={outletBlurTarget}>
              <Outlet outletRef={outletRef} subscribe={subscribe} getSnapshot={getSnapshot} onLayout={onOutletLayout} modal={layer && modalOpen} />
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
  onLayout: () => void;
  /** A modal card is open here: VoiceOver ignores the outlet's siblings (the page). */
  modal: boolean;
}

// The sole reader of the registry. Re-renders on registry changes only; being a
// sibling of the provider's `children`, its updates never re-render them. While a modal
// card is open in a window layer, `accessibilityViewIsModal` makes iOS VoiceOver ignore
// the outlet's siblings, the page; React Native Web and Android drop the prop (Android
// hides the page node instead, src/style/glass-surface/glass-blur-target.android.tsx).
function Outlet({ outletRef, subscribe, getSnapshot, onLayout, modal }: OutletProps) {
  const nodes = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return (
    <View ref={outletRef} style={outletStyles.outlet} onLayout={onLayout} accessibilityViewIsModal={modal}>
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
  usePortalMount(host, children);
  return host ? null : <>{children}</>;
}
