import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { View } from "./primitives.js";

// The anatomy part registry: a docs specimen (a component page's Anatomy section) wraps a
// component in AnatomyProvider and gets back the rectangle of each named part, relative to
// the provider's own box, to draw its numbered leader markers over. A component registers
// a part by spreading `useAnatomyPart(name)` on the host node that draws it (its root
// Pressable, its label Text), or by wrapping a caller's element it cannot ref (an icon) in
// AnatomyPart. The part names are the hand-off's `an` lists (tools/v4/handoff/cv-kit*.js),
// in its order, so a docs page numbers them the way the hand-off does.
//
// Outside a provider a part costs one context read: `useAnatomyPart` returns undefined,
// AnatomyPart renders its child bare, and no node, ref or layout handler is added. Inside
// one, a part measures itself against the provider's box when its own layout changes, and
// every part measures again when the provider's box does. Nothing re-renders the
// specimen: the rectangles go to the provider's `onMeasure` callback only.

/** A part's rectangle, in points relative to the AnatomyProvider's own box. */
export interface AnatomyRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Every measured part's rectangle, by part name (a part not on screen is absent). */
export type AnatomyRects = Readonly<Record<string, AnatomyRect>>;

/** What a component spreads on the host node that draws a part. */
export interface AnatomyTarget {
  ref: (node: unknown) => void;
  onLayout: () => void;
}

interface Measurable {
  measureLayout(relativeTo: unknown, onSuccess: (x: number, y: number, width: number, height: number) => void, onFail?: () => void): void;
}

const AnatomyContext = createContext<((name: string) => AnatomyTarget) | null>(null);

/** The handlers for part `name` inside an AnatomyProvider, undefined outside one. */
export function useAnatomyPart(name: string): AnatomyTarget | undefined {
  return useContext(AnatomyContext)?.(name);
}

/**
 * Registers a caller's element as part `name` (an icon slot): inside an AnatomyProvider it
 * renders the element in a measuring view, outside one it renders the element bare.
 */
export function AnatomyPart({ name, children }: { name: string; children?: ReactNode }): ReactNode {
  const part = useAnatomyPart(name);
  return part ? <View ref={part.ref} onLayout={part.onLayout}>{children}</View> : children;
}

/** Compose a part's layout handler with a host node's own. */
export function withPartLayout<E>(part: AnatomyTarget | undefined, own: ((event: E) => void) | undefined): ((event: E) => void) | undefined {
  if (part == null) return own;
  return (event: E) => {
    own?.(event);
    part.onLayout();
  };
}

export interface AnatomyProviderProps {
  /**
   * Called with every registered part's rectangle, relative to the provider's box, each
   * time one is measured anew or leaves the screen.
   */
  onMeasure?: (parts: AnatomyRects) => void;
  /** The specimen whose parts register, and anything drawn over it (the markers). */
  children?: ReactNode;
}

/**
 * Collects the named parts of the components inside it (Button's `Container`, `Label`,
 * `Leading icon`, `Trailing icon` and `Count badge`) with their rectangles relative to
 * its own box, for a docs Anatomy section to number. It renders one plain view, the box
 * the rectangles are relative to, so markers drawn as its absolutely positioned children
 * line up with the parts.
 */
export function AnatomyProvider({ onMeasure, children }: AnatomyProviderProps): ReactNode {
  const report = useRef(onMeasure);
  useEffect(() => {
    report.current = onMeasure;
  }, [onMeasure]);
  // One registry for the provider's life: the root, each part's node and handlers, and the
  // last rectangles reported (a part re-measured in place reports nothing new).
  const [registry] = useState(() => {
    let root: unknown = null;
    let rects: Record<string, AnatomyRect> = {};
    const nodes = new Map<string, Measurable>();
    const targets = new Map<string, AnatomyTarget>();
    const publish = (name: string, rect?: AnatomyRect) => {
      const next = { ...rects };
      if (rect) next[name] = rect;
      else delete next[name];
      if (JSON.stringify(next) === JSON.stringify(rects)) return;
      rects = next;
      report.current?.(next);
    };
    const measure = (name: string) => {
      const node = nodes.get(name);
      node?.measureLayout(root, (x, y, width, height) => {
        if (nodes.get(name) === node) publish(name, { x, y, width, height });
      }, () => {});
    };
    return {
      part(name: string): AnatomyTarget {
        let target = targets.get(name);
        if (!target) {
          target = {
            ref(node) {
              if (node) nodes.set(name, node as Measurable);
              else {
                nodes.delete(name);
                publish(name);
              }
            },
            onLayout: () => measure(name),
          };
          targets.set(name, target);
        }
        return target;
      },
      root(node: unknown) {
        root = node;
      },
      measureAll() {
        for (const name of nodes.keys()) measure(name);
      },
    };
  });
  return (
    <AnatomyContext.Provider value={registry.part}>
      <View ref={registry.root} onLayout={registry.measureAll}>{children}</View>
    </AnatomyContext.Provider>
  );
}
