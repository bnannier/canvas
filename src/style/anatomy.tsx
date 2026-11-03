import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref, type RefCallback } from "react";
// React Native's View directly, not the primitives barrel: the kit Text and Pressable
// import this module, and the barrel re-exports them, so importing it here would be a cycle.
import { View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { useFillStyle } from "./sizing.js";

// The anatomy part registry: a docs specimen (a component page's Anatomy section) wraps a
// component in AnatomyProvider and gets back the rectangle of each named part, relative to
// the provider's own box, to draw its numbered leader markers over. A component registers
// a part by spreading `useAnatomyPart(name)` on the host node that draws it (its root
// Pressable, its label Text), or by wrapping a caller's element it cannot ref (an icon) in
// AnatomyPart. The part names are the hand-off's `an` lists (tools/v4/handoff/cv-kit*.js),
// in its order, so a docs page numbers them the way the hand-off does.
//
// A part belongs to the outermost component that names it, as in the hand-off, whose
// renderers number only the component on the stage and never the kit pieces inside it: a
// component takes its parts' handlers first, then renders its tree inside AnatomyScope,
// which closes the registry to everything below (a Dialog's footer Buttons, a Chip's
// count Badge, the caller's children), so a nested `Label` or `Container` never takes the
// outer component's number. A part on a node the component renders below its scope is
// wrapped in `<AnatomyPart part={target}>` with the handlers it took above it.
//
// A part goes on a plain host node, never on an Animated.View: on the web an animated
// view's ref is not a node `measureLayout` can measure, and its transforms are not part
// of its layout box anyway. Wrap the animated view in `<AnatomyPart part>` instead.
//
// Outside a provider a part costs one context read: `useAnatomyPart` returns undefined,
// AnatomyPart renders its child bare, and no node, ref or layout handler is added. Inside
// one, a part measures itself against the provider's box when its own layout changes, and
// every part measures again when the provider's box does. Nothing re-renders the
// specimen: the rectangles go to the provider's `onMeasure` callback only.
//
// `zoomed` draws the specimen at the hand-off's anatomy zoom (Component.dc.html line 218,
// `zoom:{{ anZoom }}`, line 412 `anZoom:fill?'1':'1.6'`): the root is the full width of
// its stage, an inner box laid out at that width over the zoom is scaled up by it about
// its own centre, and the root reserves the scaled height so the stage grows with the
// figure. The part rectangles come from `measureLayout`, which reports layout space with
// no transform on every platform (react-native-web walks offsetTop/offsetLeft; Fabric's
// measureLayout passes includeTransform false), so each one is mapped into the root's
// visual space (`zoomRect`) before it is reported, and the markers a consumer draws over
// the root land on the part as it is seen.

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

/**
 * The hand-off's anatomy zoom for a component that hugs its content (Component.dc.html
 * line 412: `anZoom:fill?'1':'1.6'`); a fill component is drawn at 1.
 */
export const ANATOMY_ZOOM = 1.6;

/**
 * A rectangle measured in the layout space of a box that is then scaled by `scale` about
 * its own centre, mapped into the space the box is seen in: x' = cx + (x - cx) * s, y' =
 * cy + (y - cy) * s, w' = w * s, h' = h * s, with (cx, cy) the centre of `inner`, the box
 * carrying the transform, in the same space as `rect`.
 */
export function zoomRect(rect: AnatomyRect, inner: AnatomyRect, scale: number): AnatomyRect {
  const cx = inner.x + inner.width / 2;
  const cy = inner.y + inner.height / 2;
  return {
    x: cx + (rect.x - cx) * scale,
    y: cy + (rect.y - cy) * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

const AnatomyContext = createContext<((name: string) => AnatomyTarget) | null>(null);

/** The handlers for part `name` inside an AnatomyProvider, undefined outside one. */
export function useAnatomyPart(name: string): AnatomyTarget | undefined {
  return useContext(AnatomyContext)?.(name);
}

/**
 * Closes the registry to everything inside it: a component renders its tree inside one
 * after taking its own parts' handlers, so the kit components and caller content within
 * it register nothing of theirs. Outside a provider it renders its children bare.
 */
export function AnatomyScope({ children }: { children?: ReactNode }): ReactNode {
  const open = useContext(AnatomyContext) != null;
  return open ? <AnatomyContext.Provider value={null}>{children}</AnatomyContext.Provider> : children;
}

/** AnatomyPart's props: the part by `name`, or the handlers a component took for it above its AnatomyScope. */
export type AnatomyPartProps = { name: string; part?: never; children?: ReactNode } | { part: AnatomyTarget | undefined; name?: never; children?: ReactNode };

/**
 * Registers an element the component cannot ref (an icon slot, a caller's child, a kit
 * component it renders) as a part: inside an AnatomyProvider it renders the element in a
 * measuring view, outside one it renders the element bare. `name` registers the part
 * itself; `part` takes the handlers the component took with `useAnatomyPart` before its
 * AnatomyScope, so the element is measured below the scope.
 */
export function AnatomyPart(props: AnatomyPartProps): ReactNode {
  const registry = useContext(AnatomyContext);
  const part = props.name != null ? registry?.(props.name) : props.part;
  return part ? <View ref={part.ref} onLayout={part.onLayout}>{props.children}</View> : props.children;
}

/** Compose a part's layout handler with a host node's own. */
export function withPartLayout<E>(part: AnatomyTarget | undefined, own: ((event: E) => void) | undefined): ((event: E) => void) | undefined {
  if (part == null) return own;
  return (event: E) => {
    own?.(event);
    part.onLayout();
  };
}

// Each part's ref joined with each forwarded ref once, so the joined callback is stable
// across renders (a new one would detach and re-attach the node, dropping its rectangle).
const joined = new WeakMap<AnatomyTarget, WeakMap<object, RefCallback<unknown>>>();

/**
 * A host node's forwarded ref joined with an anatomy part's: the forwarded ref itself when
 * there is no part (outside an AnatomyProvider, or inside a closing AnatomyScope), the
 * part's ref when nothing was forwarded, and otherwise one stable callback feeding both.
 * The hook-free counterpart of useComposedRefs for the kit primitives, which render on
 * every screen and take no hook for a part outside a provider.
 */
export function withPartRef<T>(part: AnatomyTarget | undefined, ref: Ref<T> | undefined): Ref<T> | undefined {
  if (part == null) return ref;
  if (ref == null) return part.ref;
  let byRef = joined.get(part);
  if (byRef == null) joined.set(part, (byRef = new WeakMap()));
  let both = byRef.get(ref);
  if (both == null) {
    const own = ref;
    both = (node: unknown) => {
      if (typeof own === "function") own(node as T);
      else own.current = node as T;
      part.ref(node);
    };
    byRef.set(ref, both);
  }
  return both as RefCallback<T>;
}

export interface AnatomyProviderProps {
  /**
   * Called with every registered part's rectangle, relative to the provider's box and in
   * the space the specimen is seen in, each time one is measured anew or leaves the
   * screen, together with the provider's own box as its parent laid it out, so a consumer
   * drawing markers places them against one source.
   */
  onMeasure?: (parts: AnatomyRects, box: AnatomyRect) => void;
  /**
   * Draw the specimen at the hand-off's anatomy zoom (1.6, a component that hugs its
   * content); without it the specimen is drawn at its natural size (a fill component).
   */
  zoomed?: boolean;
  /** The specimen whose parts register. */
  children?: ReactNode;
}

const NO_BOX: AnatomyRect = { x: 0, y: 0, width: 0, height: 0 };
const CENTERED: ViewStyle = { alignItems: "center" };
// The zoomed root centres its inner box both ways, so the box scaled about its centre
// fills the height the root reserves for it.
const ZOOMED_ROOT: ViewStyle = { alignItems: "center", justifyContent: "center" };

/**
 * Collects the named parts of the components inside it (Button's `Container`, `Label`,
 * `Leading icon`, `Trailing icon` and `Count badge`) with their rectangles relative to
 * its own box, for a docs Anatomy section to number. It renders one view, the box the
 * rectangles are relative to, filling its stage and centring the specimen as the
 * hand-off's specimen box does (Component.dc.html line 218, `width:100%;display:flex;
 * justify-content:center`), so markers drawn as its absolutely positioned children, or
 * over it from the box it reports, line up with the parts.
 */
export function AnatomyProvider({ onMeasure, zoomed, children }: AnatomyProviderProps): ReactNode {
  const report = useRef(onMeasure);
  useEffect(() => {
    report.current = onMeasure;
  }, [onMeasure]);
  const scale = zoomed ? ANATOMY_ZOOM : 1;
  // The root's width, which the zoomed inner box is laid out at over the zoom, and the
  // inner box's height, which the root reserves scaled.
  const [rootWidth, setRootWidth] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);
  // One registry for the provider's life: the root, each part's node and handlers, the
  // rectangles as measured (layout space), the inner box and scale that map them, and the
  // last report (a part re-measured in place reports nothing new).
  const [registry] = useState(() => {
    let root: unknown = null;
    let raw: Record<string, AnatomyRect> = {};
    let inner: AnatomyRect | null = null;
    let zoom = 1;
    let box: AnatomyRect = NO_BOX;
    let last = "";
    const nodes = new Map<string, Measurable>();
    const targets = new Map<string, AnatomyTarget>();
    const publish = () => {
      const mapped: Record<string, AnatomyRect> = {};
      for (const [name, rect] of Object.entries(raw)) mapped[name] = zoom === 1 || inner == null ? rect : zoomRect(rect, inner, zoom);
      const key = JSON.stringify([mapped, box]);
      if (key === last) return;
      last = key;
      report.current?.(mapped, box);
    };
    const set = (name: string, rect?: AnatomyRect) => {
      const next = { ...raw };
      if (rect) next[name] = rect;
      else delete next[name];
      raw = next;
      publish();
    };
    const measure = (name: string) => {
      // Before the root attaches there is nothing to measure against; the root's layout
      // measures every part.
      if (root == null) return;
      const node = nodes.get(name);
      node?.measureLayout(root, (x, y, width, height) => {
        if (nodes.get(name) === node) set(name, { x, y, width, height });
      }, () => {});
    };
    return {
      part(name: string): AnatomyTarget {
        let target = targets.get(name);
        if (!target) {
          target = {
            // A node measures as it attaches as well as on its layout, and a detached part
            // leaves the report only once the render that detached it has settled without
            // attaching it again: a host whose ref callback is replaced between renders
            // (detached, then attached again with no layout change) keeps its rectangle,
            // and its re-render never reports a removal that sets off another re-render.
            ref(node) {
              if (node) {
                nodes.set(name, node as Measurable);
                measure(name);
              } else {
                const gone = nodes.get(name);
                nodes.delete(name);
                setTimeout(() => {
                  if (!nodes.has(name) && gone !== undefined) set(name);
                }, 0);
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
      /** The root's box as its parent laid it out: reported, and every part measured again. */
      rootLayout(layout: AnatomyRect) {
        box = layout;
        publish();
        this.measureAll();
      },
      /** The inner box in the root's layout space, the centre the zoom maps about. */
      innerLayout(layout: AnatomyRect | null) {
        inner = layout;
        publish();
        this.measureAll();
      },
      setZoom(next: number) {
        zoom = next;
        publish();
      },
    };
  });
  useLayoutEffect(() => registry.setZoom(scale), [registry, scale]);
  useLayoutEffect(() => {
    if (!zoomed) registry.innerLayout(null);
  }, [registry, zoomed]);
  const onRootLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setRootWidth(width);
    registry.rootLayout({ x, y, width, height });
  };
  const onInnerLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setInnerHeight(height);
    registry.innerLayout({ x, y, width, height });
  };
  // FILL: the root spans its stage, the width the hand-off's specimen box takes.
  const fill = useFillStyle("AnatomyProvider");
  if (!zoomed) {
    return (
      <AnatomyContext.Provider value={registry.part}>
        <View ref={registry.root} onLayout={onRootLayout} style={[fill, CENTERED]}>{children}</View>
      </AnatomyContext.Provider>
    );
  }
  // The inner box is laid out at the root's width over the zoom and scaled back up to it,
  // so the figure spans the stage as the hand-off's zoomed box does; the root reserves
  // the inner height scaled, the figure's footprint, and centres the box in it.
  const innerStyle: ViewStyle = { ...CENTERED, transform: [{ scale }], ...(rootWidth > 0 ? { width: rootWidth / scale } : null) };
  return (
    <AnatomyContext.Provider value={registry.part}>
      <View ref={registry.root} onLayout={onRootLayout} style={[fill, ZOOMED_ROOT, innerHeight > 0 ? { height: innerHeight * scale } : null]}>
        <View onLayout={onInnerLayout} style={innerStyle}>{children}</View>
      </View>
    </AnatomyContext.Provider>
  );
}
