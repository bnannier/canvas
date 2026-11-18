import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import Animated, { cancelAnimation, Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { View, useReducedMotion, useHoverCapable } from "@nannier/canvas";
import { COLLAGE, HERO_MOTION, HERO_SLOT_SIZES, panelTransform, projectCss, stackBounds, type CollagePanel, type CollagePanelId } from "./library-hero-look";
import { inertProps } from "../../../src/style/inert";
import { HeroShowcaseSequence, entryDirection, flightFrame, flyingPanelTransform, SHOWCASE_MOTION, type ShowcaseFlight } from "./hero-showcase-motion";
import { ShowcaseActivity, ShowcaseStep } from "./hero-showcase-activity";

// A brand illustration: the v4 hand-off's Library hero collage (decision P5-T1, the
// `v4-library-hero` card), six decorative panels laid out in a tilted 3D stack. The
// hand-off builds it from a perspective box, a rotated `preserve-3d` stack and a
// `translateZ` per panel; React Native has neither `preserve-3d` nor `translateZ`, so each
// panel carries its own transform with the stack's rotation and its depth folded in
// (`panelTransform`, held to the hand-off's projection by test/docs-library.test.ts), and the
// panels are drawn back to front. The same transforms render on iOS, Android and the web.
// The stack follows a pointer through the hand-off's .5 s curve. Each panel keeps its
// depth throughout that move; touch and Reduce Motion keep the resting projection.

/** The collage width the hand-off's desktop column gives it, for the frame before it measures. */
const SEED_WIDTH = 648;
const NO_ALTERNATIVES = {};

const BACK_TO_FRONT = [...COLLAGE.panels].sort((a, b) => a.z - b.z);
type ActiveShowcaseFlight = ShowcaseFlight & { start: number };

// Settled layout maxima of the complete rotation at its 648px artboard width.
// Reserve the same fit before any alternative mounts. Layout can still extend
// these bounds for larger text or a differently sized native control.
const SLOT_SIZES = HERO_SLOT_SIZES;
const OPENING = BACK_TO_FRONT.map(() => 0);

function afterFlight(selected: number[], flight: ShowcaseFlight) {
  return selected.map((value, slot) => slot === flight.slot ? flight.to : value);
}

function Panel({ panel, width, x, y, children, onSize, variant, selected, flight, progress, running, step }: {
  panel: CollagePanel; width: number; x: SharedValue<number>; y: SharedValue<number>; children: ReactNode;
  onSize: (id: CollagePanelId, variant: number, width: number, height: number) => void;
  variant: number; selected: number; flight: ActiveShowcaseFlight | null; progress: SharedValue<number>; running: boolean;
  step: { current: number };
}) {
  const moving = flight != null && (variant === flight.from || variant === flight.to);
  // Reanimated subscribes to captured shared values even when a worklet branches around them.
  const flightProgress = moving ? progress : null;
  const visible = variant === selected || (flight != null && variant === flight.to);
  const motion = useAnimatedStyle(() => {
    if (!flightProgress || !flight) return { opacity: variant === selected ? 1 : 0, transform: panelTransform(panel, width, [x.value, y.value, 3]) };
    const frame = flightFrame(flightProgress.value - flight.start, variant === flight.to, flight.direction);
    return { opacity: frame.opacity, transform: flyingPanelTransform(panel, width, [x.value, y.value, 3], frame.distance) };
  });
  return <Animated.View testID={`library-panel-${panel.id}${variant ? `-${variant}` : ""}`} onLayout={({ nativeEvent: { layout } }) => onSize(panel.id, variant, layout.width, layout.height)} style={[{
    position: "absolute", left: panel.x, top: panel.y,
    ...(panel.width != null ? { width: panel.width } : null), transformOrigin: [0, 0, 0],
  }, motion]}><ShowcaseActivity.Provider value={visible && running}>
    <ShowcaseStep.Provider value={step}>{children}</ShowcaseStep.Provider>
  </ShowcaseActivity.Provider></Animated.View>;
}

export function HeroCollage({ panels, alternatives = NO_ALTERNATIVES, testID, fit = false }: {
  panels: Record<CollagePanelId, ReactNode>; alternatives?: Partial<Record<CollagePanelId, readonly ReactNode[]>>;
  testID?: string; fit?: boolean;
}) {
  const [width, setWidth] = useState(SEED_WIDTH);
  const [measured, setMeasured] = useState(false);
  const [oversized, setOversized] = useState<Record<string, [number, number]>>({});
  const onSize = useCallback((id: CollagePanelId, variant: number, w: number, h: number) => {
    const key = `${id}-${variant}`;
    setOversized(prev => {
      if (w <= SLOT_SIZES[id][0] && h <= SLOT_SIZES[id][1]) {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev[key]?.[0] === w && prev[key]?.[1] === h ? prev : { ...prev, [key]: [w, h] };
    });
  }, []);
  // Update each specimen's last measurement as it settles. A transient stacked
  // layout must not permanently enlarge its slot.
  const sizes = useMemo(() => {
    const result = { ...SLOT_SIZES };
    for (const panel of BACK_TO_FRONT) {
      for (const [key, [w, h]] of Object.entries(oversized)) {
        if (key.startsWith(`${panel.id}-`)) {
          const [width, height] = result[panel.id];
          result[panel.id] = [Math.max(width, w), Math.max(height, h)];
        }
      }
    }
    return result;
  }, [oversized]);
  // Fit the complete illustration into its measured column, keeping the authored
  // panel geometry and perspective in one coordinate system on every platform.
  const narrow = fit || width < SEED_WIDTH - 1;
  const canvasWidth = narrow ? SEED_WIDTH : width;
  // Fit the visible panel bounds, rather than the empty area of the desktop
  // canvas. Native layout sizes and the shared projection math work on every OS.
  const points = narrow
    ? BACK_TO_FRONT.flatMap(panel => {
      const [w, h] = sizes[panel.id];
      return [[0, 0], [w, 0], [w, h], [0, h]].map(point => projectCss(panel, canvasWidth, point as [number, number]));
    }) : [];
  const left = points.length ? Math.min(...points.map(point => point[0])) - 16 : 0;
  const top = points.length ? Math.min(...points.map(point => point[1])) - 16 : 0;
  const drawingWidth = points.length ? Math.max(...points.map(point => point[0])) + 16 - left : canvasWidth;
  const drawingHeight = points.length ? Math.max(...points.map(point => point[1])) + 16 - top : COLLAGE.height;
  // A stacked tablet column is wider than the artwork. Centre the visible
  // drawing there without inflating the controls; phones still scale to fit.
  const scale = fit ? Math.min(1, width / drawingWidth) : width / drawingWidth;
  const offset = (width - drawingWidth * scale) / 2;
  const box = useRef<View>(null);
  const reduced = useReducedMotion();
  const hover = useHoverCapable();
  const [foreground, setForeground] = useState(AppState.currentState !== "background" && AppState.currentState !== "inactive");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => setForeground(state === "active"));
    return () => subscription.remove();
  }, []);
  const running = !reduced && foreground;
  const [selected, setSelected] = useState(OPENING);
  const [flight, setFlight] = useState<ActiveShowcaseFlight | null>(null);
  const [queued, setQueued] = useState<ShowcaseFlight | null>(null);
  const sequence = useRef<HeroShowcaseSequence | null>(null);
  if (!sequence.current) sequence.current = new HeroShowcaseSequence();
  const progress = useSharedValue(0);
  const counts = useMemo(() => BACK_TO_FRONT.map(panel => (alternatives[panel.id]?.length ?? 0) + 1), [alternatives]);
  const steps = useMemo(() => counts.map(count => Array.from({ length: count }, () => ({ current: 0 }))), [counts]);
  useEffect(() => {
    if (!running || !counts.some(count => count > 1)) return;
    if (!flight && !queued) {
      // Prepare the first specimen during the opening entrance. Deferring the
      // draw allows cleanup to cancel it on a Strict Mode effect replay.
      const timer = setTimeout(() => {
        setQueued(sequence.current!.next(selected, counts, -1));
      }, 0);
      return () => clearTimeout(timer);
    }
    const advance = () => {
      const settled = flight ? afterFlight(selected, flight) : selected;
      setSelected(settled);
      // Keep the shared clock monotonic while the worklets switch owners.
      setFlight(queued ? { ...queued, start: progress.value, direction: entryDirection(BACK_TO_FRONT[queued.slot]!.id, queued.direction) } : null);
      // Warm exactly one future arrival. Its invisible tree can measure chart
      // geometry while the current pair is in flight.
      setQueued(queued ? sequence.current!.next(afterFlight(settled, queued), counts, queued.slot) : null);
    };
    if (!flight) {
      const timer = setTimeout(advance, HERO_MOTION.rise);
      return () => clearTimeout(timer);
    }
    const remaining = SHOWCASE_MOTION.duration * (1 - (progress.value - flight.start));
    // The live Canvas preference gates this effect; Reanimated's system flag
    // is cached at startup and otherwise cannot resume a newly enabled preview.
    progress.value = withTiming(flight.start + 1, { duration: remaining, easing: Easing.linear, reduceMotion: ReduceMotion.Never });
    const timer = setTimeout(advance, remaining + 32);
    return () => { clearTimeout(timer); cancelAnimation(progress); };
  }, [running, counts, flight, queued, selected, progress]);
  useEffect(() => {
    if (!reduced) return;
    cancelAnimation(progress);
    progress.value = 0;
    setFlight(null);
    setQueued(null);
    sequence.current = new HeroShowcaseSequence();
    setSelected(OPENING);
  }, [reduced, progress]);
  const x = useSharedValue<number>(COLLAGE.rotate[0]);
  const y = useSharedValue<number>(COLLAGE.rotate[1]);
  useEffect(() => {
    x.value = COLLAGE.rotate[0];
    y.value = COLLAGE.rotate[1];
    if (reduced || !hover || typeof window === "undefined" || typeof window.addEventListener !== "function") return;
    const move = (event: MouseEvent) => box.current?.measureInWindow((windowLeft, windowTop, w, h) => {
      if (!w || !h) return;
      const bounds = stackBounds(canvasWidth, [x.value, y.value, 3]);
      const nx = Math.max(-1, Math.min(1, ((event.clientX - windowLeft - offset) / scale + left - bounds.left - bounds.width / 2) / bounds.width));
      const ny = Math.max(-1, Math.min(1, ((event.clientY - windowTop) / scale + top - bounds.top - bounds.height / 2) / bounds.height));
      const config = { duration: HERO_MOTION.tilt, easing: Easing.bezier(...HERO_MOTION.entrance), reduceMotion: ReduceMotion.Never };
      x.value = withTiming(14 - ny * 8, config);
      y.value = withTiming(-22 + nx * 10, config);
    });
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimation(x);
      cancelAnimation(y);
    };
  }, [hover, reduced, x, y, canvasWidth, scale, offset, left, top]);
  return (
    <View
      ref={box}
      testID={testID}
      {...({ dataSet: { heroUnmeasured: measured ? undefined : "" } } as object)}
      {...inertProps()}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      pointerEvents="none"
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        if (next > 0) {
          setWidth((prev) => (Math.abs(prev - next) < 1 ? prev : next));
          setMeasured(true);
        }
      }}
      style={{ height: drawingHeight * scale }}
    >
      <View testID="library-artboard" style={{ width: canvasWidth, height: COLLAGE.height, transformOrigin: [0, 0, 0], transform: [{ translateX: offset }, { scale }, { translateX: -left }, { translateY: -top }] }}>
        {BACK_TO_FRONT.map((panel, slot) => {
          const variants = new Set([selected[slot]!]);
          if (flight?.slot === slot) variants.add(flight.to);
          if (queued?.slot === slot) variants.add(queued.to);
          return [...variants].sort((a, b) => a - b).map(variant => (
            <Panel key={`${panel.id}-${variant}`} panel={panel} width={canvasWidth} x={x} y={y} onSize={onSize}
              variant={variant} selected={selected[slot]!} flight={flight?.slot === slot ? flight : null}
              progress={progress} running={running} step={steps[slot]![variant]!}>
              {variant === 0 ? panels[panel.id] : alternatives[panel.id]?.[variant - 1]}
            </Panel>
          ));
        })}
      </View>
    </View>
  );
}
