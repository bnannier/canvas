// Scroll-position detection: "has this element reached the viewport yet?", answered
// once per element and never taken back. It is the trigger under the Reveal atom
// (src/atoms/reveal), whose entrance plays when content scrolls into view.
//
// MECHANISM. Each pending element is measured with `measureInWindow` against the
// window height from `useWindowDimensions`, sampled on ONE shared throttled ticker
// (SAMPLE_MS). The ticker runs only while at least one element is still pending and
// stops dead the moment the pending set empties, so a fully revealed page costs
// nothing: no timer, no measurement, no listeners. Elements never unregister back to
// hidden, which is once-only BY DESIGN (it matches the entrance semantics every call
// site wants: content that has arrived stays arrived, and a reveal that could
// re-hide on scroll-out would flicker whole sections).
//
// FAIL OPEN, ALWAYS. Every path that cannot produce a trustworthy measurement
// answers `true` (in view): a missing node, a node without the measure method, a
// throw inside the measure call, a non-finite or degenerate (zero by zero) rect, a
// zero or non-finite window height. Invisible content must never be a failure mode
// of a reveal primitive, so the only direction this is allowed to be wrong in is
// "shows the content".
//
// WHY NOT IntersectionObserver, which is the obvious implementation. It is genuinely
// tempting and it is NOT web-only: React Native core ships its own at
// node_modules/react-native/src/private/webapis/intersectionobserver/. It is still
// rejected for this version on three grounds.
//   1. Guard shape. The kit already carries two different runtime-capability guards
//      (the optional-peer require-inside-try probe, and the a11y media-query guard).
//      An observer needs a third distinct one, because the global exists on web, on
//      new-enough React Native, and nowhere else.
//   2. Published types. The kit's tsconfig has lib DOM in scope, and
//      scripts/verify-package.ts check 5 exists precisely to stop DOM types leaking
//      into the published .d.ts, where they break consumers who compile without lib
//      DOM. Its DOM_RE does not currently list IntersectionObserver, Element, or
//      IntersectionObserverEntry, so such a leak would pass CI and break those
//      consumers silently. Naming those types here would put the kit one careless
//      signature away from that.
//   3. It could only ever be an optimisation. The ticker is the correctness
//      baseline: it is the path that has to work on every platform anyway, so the
//      observer would be a second implementation of an already-solved problem.
// An observer-backed ACCELERATOR (observer where present, this ticker everywhere
// else) is therefore deliberate future work, not an oversight. Doing it properly
// means extending DOM_RE first so the type leak it invites is actually caught, then
// adding the capability probe as a named third guard. Until both exist, one code
// path on every platform is the better trade.
//
// NOT EXPORTED from ./index.js, so it is kit-internal and not part of the published
// surface. Two reasons: the atom (Reveal) is the blessed way to reveal on scroll, and
// publishing a hook that takes a raw dp NUMBER alongside a component whose whole API
// is semantic booleans would hand consumers a second, unblessed door into the same
// capability. Adding the export later stays backward compatible; removing it would
// not.

import { useEffect, useState, type RefObject } from "react";
import { useWindowDimensions } from "react-native";

// How often pending elements are re-measured, in ms. Fast enough that an entrance
// starts within a frame or two of the element clearing the trigger line during a
// flick, slow enough that a page holding many pending elements does a bounded amount
// of measuring per second. Only pending elements are ever sampled.
const SAMPLE_MS = 100;

/** The measured window rect this module reasons about (x is irrelevant: the trigger
 *  line is horizontal, so only the vertical edge and the degenerate-size check
 *  matter). */
export interface InViewRect {
  /** Distance from the top of the window to the element's top edge. */
  y: number;
  width: number;
  height: number;
}

/**
 * The one structural capability this module needs from a ref. Declared here rather
 * than imported so nothing DOM-shaped or Animated-shaped enters the type surface:
 * React Native's host instances and react-native-web's host nodes both satisfy it
 * (react-native-web attaches measureInWindow to the node in usePlatformMethods),
 * which is what lets one code path serve native and web.
 */
export interface InViewMeasurable {
  measureInWindow(callback: (x: number, y: number, width: number, height: number) => void): void;
}

/**
 * The pure in-view predicate: has an element with this window rect reached the
 * trigger line, given the window height and how far inside the bottom edge
 * (`insetDp`) the element must come before it counts?
 *
 * True means "reveal it". The test is on the element's TOP edge against a horizontal
 * trigger line at `windowHeight - inset`, which gives both cases the once-only
 * contract needs from a single comparison:
 *   - scrolling up from below the fold: the top edge crosses the line, so the reveal
 *     fires while the element is entering, not after it is fully in;
 *   - a page opened already scrolled past the element (a deep link, a restored
 *     scroll position): the top edge is negative, comfortably past the line, so the
 *     content is already revealed instead of stranded invisible above the viewport.
 * The inset is clamped into the window, so even a nonsense inset only ever moves the
 * line to the top of the window rather than off it.
 *
 * Fail-open cases (see the file header) all return true. Exported for unit tests,
 * following the `entranceTranslation` precedent in ./entrance.tsx: the maths is the
 * load-bearing part and is testable with no renderer.
 */
export function isRectInView(rect: InViewRect | null | undefined, windowHeight: number, insetDp: number): boolean {
  if (rect == null) return true;
  const { y, width, height } = rect;
  // A rect that is not fully numeric is not a measurement.
  if (!Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) return true;
  // Zero by zero means "not laid out / cannot be judged", never "an empty element
  // parked below the fold": no honest answer exists, so fail open.
  if (width <= 0 && height <= 0) return true;
  if (!Number.isFinite(windowHeight) || windowHeight <= 0) return true;
  const inset = Number.isFinite(insetDp) ? Math.min(Math.max(insetDp, 0), windowHeight) : 0;
  return y < windowHeight - inset;
}

// --- the shared ticker -------------------------------------------------------

type Sampler = () => void;

// Every element still waiting to be seen. Empty means no timer exists.
const pending = new Set<Sampler>();
let ticker: ReturnType<typeof setInterval> | null = null;

function tick(): void {
  // Iterate a copy: a sampler that resolves unsubscribes itself, mutating the set
  // mid-iteration.
  for (const sample of [...pending]) sample();
}

function subscribe(sample: Sampler): () => void {
  pending.add(sample);
  if (ticker === null) ticker = setInterval(tick, SAMPLE_MS);
  return () => {
    pending.delete(sample);
    // Stop dead, not idle: the last element to resolve takes the timer with it.
    if (pending.size === 0 && ticker !== null) {
      clearInterval(ticker);
      ticker = null;
    }
  };
}

/**
 * Whether the shared sampling timer is currently running. Kit-internal
 * introspection for the tests that assert the ticker starts on the first pending
 * element and stops when the last one resolves; components never read this.
 */
export function inViewTickerActive(): boolean {
  return ticker !== null;
}

/**
 * Whether the element behind `ref` has reached the viewport, latched: it flips false
 * to true at most once and never back (see the file header on once-only).
 *
 * `insetDp` is how far inside the bottom edge of the window the element's top must
 * come before it counts, so a caller can require the element to be properly in view
 * rather than one pixel in.
 *
 * `enabled` is the caller's own reason to not observe at all. When false the hook
 * registers nothing, measures nothing, starts no timer, and reports `true`, which is
 * the fail-open answer: a caller that has decided not to watch (Reveal under Reduce
 * Motion) renders its final frame. It is a parameter rather than a Reduce Motion read
 * inside this hook so the accessibility POLICY stays with the component that owns the
 * animation, and this module stays a plain detector.
 *
 * Known imprecision, deliberate: the measurement is against the WINDOW, so an element
 * inside a nested scroll container that is clipped by that container but whose window
 * rect still falls inside the window counts as in view. It errs toward revealing
 * early, which is the direction this primitive is allowed to be wrong in, and the
 * alternative (walking ancestor clip rects) is a large amount of machinery for a
 * decorative entrance.
 */
export function useInView(ref: RefObject<InViewMeasurable | null>, insetDp: number, enabled = true): boolean {
  const { height: windowHeight } = useWindowDimensions();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Nothing to watch: not enabled, or already latched (which also tears the
    // subscription down for good, since `inView` is a dependency).
    if (!enabled || inView) return;

    let settled = false;
    let unsubscribe: (() => void) | null = null;

    const settle = () => {
      if (settled) return;
      settled = true;
      unsubscribe?.();
      setInView(true);
    };

    const sample = () => {
      if (settled) return;
      const node = ref.current;
      // No node, or a node that cannot be measured: fail open.
      if (node == null || typeof node.measureInWindow !== "function") {
        settle();
        return;
      }
      try {
        node.measureInWindow((_x, y, width, height) => {
          // The callback is asynchronous on both platforms, so it can land after
          // this effect was cleaned up; `settled` covers that.
          if (settled) return;
          if (isRectInView({ y, width, height }, windowHeight, insetDp)) settle();
        });
      } catch {
        // A measure that throws is a measure we do not have.
        settle();
      }
    };

    // Subscribe BEFORE the first sample, so a synchronously failing-open sample
    // still finds an `unsubscribe` to call and cannot leave the timer running.
    unsubscribe = subscribe(sample);
    // Sample immediately as well as on the ticker: content that is already on screen
    // at mount must start its entrance now, not up to SAMPLE_MS later.
    sample();

    return () => {
      settled = true;
      unsubscribe?.();
    };
  }, [enabled, inView, insetDp, ref, windowHeight]);

  return !enabled || inView;
}
