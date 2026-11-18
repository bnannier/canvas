import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from "react";
import { AppState, Dimensions, type GestureResponderEvent, type View as NativeView, type ViewProps } from "react-native";
import { View, useReducedMotion } from "@nannier/canvas";
import { useIsFocused } from "expo-router";
import { ShowcaseClock, type DemoStatus } from "./demo-clock";

type MeasureRef = RefObject<NativeView | null>;
interface Runtime { clock: ShowcaseClock; measures: Map<string, MeasureRef> }
const RuntimeContext = createContext<Runtime | null>(null);

/** One scheduler per section. Native host measurement keeps the same behavior on
 * every platform without DOM observers or per-card animation timers. */
export function ShowcaseMotion({ children }: { children: ReactNode }) {
  const runtime = useMemo<Runtime>(() => ({ clock: new ShowcaseClock(), measures: new Map() }), []);
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState == null || AppState.currentState === "active");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => setForeground(state === "active"));
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const { clock, measures } = runtime;
    clock.motion(!reduced);
    clock.background(foreground && focused);
    if (reduced || !foreground || !focused) return;
    let mounted = true;
    let last = Date.now();
    let measuredAt = 0;
    const tick = () => {
      const now = Date.now();
      if (now - measuredAt >= 500) {
        measuredAt = now;
        const height = Dimensions.get("window").height;
        for (const [id, ref] of measures) {
          if (!clock.watches(id)) continue;
          const node = ref.current;
          if (!node) continue;
          node.measureInWindow((_x, y, width, measuredHeight) => {
            if (mounted && measures.get(id) === ref) clock.visible(id,
              Number.isFinite(y) && width > 0 && measuredHeight > 0 && y < height - 48 && y + measuredHeight > 60);
          });
        }
      }
      clock.tick(now - last);
      last = now;
    };
    tick();
    const timer = setInterval(tick, 160);
    return () => { mounted = false; clearInterval(timer); };
  }, [runtime, reduced, foreground, focused]);
  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>;
}

/** A measured frame, never a replacement for the real controls inside. Touch,
 * keyboard or focus hands the entire card to the reader for the rest of the visit. */
export function ShowcaseDemoFrame({ id, children }: { id: string; children: ReactNode }) {
  const runtime = useContext(RuntimeContext);
  const ref = useRef<NativeView>(null);
  const touch = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const stop = useCallback(() => runtime?.clock.stop(id), [runtime, id]);
  useEffect(() => {
    if (!runtime) return;
    runtime.measures.set(id, ref);
    return () => {
      if (runtime.measures.get(id) === ref) { runtime.measures.delete(id); runtime.clock.forget(id); }
    };
  }, [runtime, id]);
  if (!runtime) return <>{children}</>;
  const pointerDown = (event: { nativeEvent: { pointerType?: string } }) => {
    if (event.nativeEvent.pointerType !== "touch") stop();
  };
  const touchStart = (event: GestureResponderEvent) => {
    const point = event.nativeEvent.touches[0] ?? event.nativeEvent;
    touch.current = { x: point.pageX, y: point.pageY, moved: false };
    runtime.clock.hold(id, true);
  };
  const touchMove = (event: GestureResponderEvent) => {
    const start = touch.current;
    const point = event.nativeEvent.touches[0] ?? event.nativeEvent;
    if (start && Math.hypot(point.pageX - start.x, point.pageY - start.y) > 10) start.moved = true;
  };
  const touchEnd = () => {
    if (touch.current && !touch.current.moved) stop();
    touch.current = null;
    runtime.clock.hold(id, false);
  };
  const touchCancel = () => { touch.current = null; runtime.clock.hold(id, false); };
  // Capture events preserve keyboard takeover even when a child handles its key.
  // A scroll gesture only suspends playback; it never takes over the specimen.
  const capture = { onFocusCapture: stop, onKeyDownCapture: stop, onPointerDownCapture: pointerDown } as ViewProps;
  return <View ref={ref} testID={`showcase-motion-${id}`} {...capture}
    onFocus={stop} onPointerDown={pointerDown}
    onTouchStart={touchStart} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchCancel={touchCancel}
    style={{ width: "100%", minWidth: 0, flexGrow: 1 }}>
    {children}
  </View>;
}

export function useShowcaseDemo<T>(id: string, frames: readonly T[], options: { interval?: number; delay?: number } = {}): {
  value: T; step: number; setValue: Dispatch<SetStateAction<T>>; stop: () => void; active: boolean; manual: boolean;
} {
  if (frames.length === 0) throw new Error(`Showcase ${id} needs a resting frame`);
  const runtime = useContext(RuntimeContext);
  const framesRef = useRef(frames);
  framesRef.current = frames;
  const cursor = useRef(0);
  const [value, update] = useState<T>(() => frames[0]!);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<DemoStatus>({ active: false, manual: false });
  const stop = useCallback(() => {
    runtime?.clock.stop(id);
    setStatus(previous => previous.manual ? previous : { active: false, manual: true });
  }, [runtime, id]);
  const setValue = useCallback<Dispatch<SetStateAction<T>>>(next => { stop(); update(next); }, [stop]);
  useEffect(() => runtime?.clock.subscribe(id, {
    interval: options.interval, delay: options.delay,
    advance: () => {
      cursor.current += 1;
      setStep(cursor.current);
      update(framesRef.current[cursor.current % framesRef.current.length]!);
    },
    reset: () => { cursor.current = 0; setStep(0); update(framesRef.current[0]!); },
    status: next => setStatus(previous => previous.active === next.active && previous.manual === next.manual ? previous : next),
  }), [runtime, id, options.interval, options.delay]);
  return { value, step, setValue, stop, ...status };
}
