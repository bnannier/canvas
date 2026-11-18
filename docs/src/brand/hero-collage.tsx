import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import Animated, { cancelAnimation, Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { View, useReducedMotion, useHoverCapable } from "@nannier/canvas";
import { COLLAGE, HERO_MOTION, panelTransform, projectCss, stackBounds, type CollagePanel, type CollagePanelId } from "./library-hero-look";
import { inertProps } from "../../../src/style/inert";
import { HeroShowcaseSequence, entryDirection, flightFrame, flyingPanelTransform, SHOWCASE_MOTION, type ShowcaseFlight } from "./hero-showcase-motion";
import { ShowcaseActivity } from "./hero-showcase-activity";

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

function Panel({ panel, width, x, y, children, onSize, variant, selected, flight, progress, running }: {
  panel: CollagePanel; width: number; x: SharedValue<number>; y: SharedValue<number>; children: ReactNode;
  onSize: (id: CollagePanelId, variant: number, width: number, height: number) => void;
  variant: number; selected: number; flight: ActiveShowcaseFlight | null; progress: SharedValue<number>; running: boolean;
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
  }, motion]}><ShowcaseActivity.Provider value={visible && running}>{children}</ShowcaseActivity.Provider></Animated.View>;
}

export function HeroCollage({ panels, alternatives = NO_ALTERNATIVES, testID, fit = false }: {
  panels: Record<CollagePanelId, ReactNode>; alternatives?: Partial<Record<CollagePanelId, readonly ReactNode[]>>;
  testID?: string; fit?: boolean;
}) {
  const [width, setWidth] = useState(SEED_WIDTH);
  const [specimenSizes, setSpecimenSizes] = useState<Record<string, [number, number]>>({});
  const onSize = useCallback((id: CollagePanelId, variant: number, w: number, h: number) => {
    const key = `${id}-${variant}`;
    setSpecimenSizes(prev => {
      return prev[key]?.[0] === w && prev[key]?.[1] === h ? prev : { ...prev, [key]: [w, h] };
    });
  }, []);
  // Reserve the union of the current specimen measurements, not their largest
  // historical size: a responsive component's initial stacked layout can be
  // taller than its settled layout and must not leave a permanent blank region.
  const sizes = useMemo(() => {
    const result: Partial<Record<CollagePanelId, [number, number]>> = {};
    for (const panel of BACK_TO_FRONT) {
      const measured = Object.entries(specimenSizes).filter(([key]) => key.startsWith(`${panel.id}-`)).map(([, size]) => size);
      if (measured.length) result[panel.id] = [Math.max(...measured.map(size => size[0])), Math.max(...measured.map(size => size[1]))];
    }
    return result;
  }, [specimenSizes]);
  // Fit the complete illustration into its measured column, keeping the authored
  // panel geometry and perspective in one coordinate system on every platform.
  const narrow = fit || width < SEED_WIDTH - 1;
  const canvasWidth = narrow ? SEED_WIDTH : width;
  // Fit the visible panel bounds, rather than the empty area of the desktop
  // canvas. Native layout sizes and the shared projection math work on every OS.
  const points = narrow && BACK_TO_FRONT.every(panel => sizes[panel.id])
    ? BACK_TO_FRONT.flatMap(panel => {
      const [w, h] = sizes[panel.id]!;
      return [[0, 0], [w, 0], [w, h], [0, h]].map(point => projectCss(panel, canvasWidth, point as [number, number]));
    }) : [];
  const left = points.length ? Math.min(...points.map(point => point[0])) - 16 : narrow ? -72 : 0;
  const top = points.length ? Math.min(...points.map(point => point[1])) - 16 : 0;
  const drawingWidth = points.length ? Math.max(...points.map(point => point[0])) + 16 - left : canvasWidth + (narrow ? 144 : 0);
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
  const [selected, setSelected] = useState(() => BACK_TO_FRONT.map(() => 0));
  const [flight, setFlight] = useState<ActiveShowcaseFlight | null>(null);
  const previousSlot = useRef(-1);
  const sequence = useRef<HeroShowcaseSequence | null>(null);
  if (!sequence.current) sequence.current = new HeroShowcaseSequence();
  const progress = useSharedValue(0);
  const counts = useMemo(() => BACK_TO_FRONT.map(panel => (alternatives[panel.id]?.length ?? 0) + 1), [alternatives]);
  useEffect(() => {
    if (!running || !counts.some(count => count > 1)) return;
    if (!flight) {
      // Let the page's opening entrance finish once; each later replacement
      // starts immediately after the previous flight in a different position.
      const timer = setTimeout(() => {
        // The authored starting illustration yields to live demonstrations;
        // every later arrival comes from the animated specimen pool.
        const next = sequence.current!.next(selected, counts, previousSlot.current);
        // Keep the clock monotonic: an old worklet stays at its finished frame
        // while React installs the next flight, instead of flashing its old item.
        setFlight(next ? { ...next, start: progress.value, direction: entryDirection(BACK_TO_FRONT[next.slot]!.id, next.direction) } : null);
      }, previousSlot.current < 0 ? HERO_MOTION.rise : 0);
      return () => clearTimeout(timer);
    }
    const remaining = SHOWCASE_MOTION.duration * (1 - (progress.value - flight.start));
    // The live Canvas preference gates this effect; Reanimated's system flag
    // is cached at startup and otherwise cannot resume a newly enabled preview.
    progress.value = withTiming(flight.start + 1, { duration: remaining, easing: Easing.linear, reduceMotion: ReduceMotion.Never });
    const timer = setTimeout(() => {
      previousSlot.current = flight.slot;
      setSelected(prev => prev.map((value, slot) => slot === flight.slot ? flight.to : value));
      setFlight(null);
    }, remaining + 32);
    return () => { clearTimeout(timer); cancelAnimation(progress); };
  }, [running, counts, flight, selected, progress]);
  useEffect(() => {
    if (!reduced) return;
    cancelAnimation(progress);
    progress.value = 0;
    setFlight(null);
    previousSlot.current = -1;
    sequence.current = new HeroShowcaseSequence();
    setSelected(BACK_TO_FRONT.map(() => 0));
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
      {...inertProps()}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      pointerEvents="none"
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        if (next > 0) setWidth((prev) => (Math.abs(prev - next) < 1 ? prev : next));
      }}
      style={{ height: drawingHeight * scale }}
    >
      <View style={{ width: canvasWidth, height: COLLAGE.height, transformOrigin: [0, 0, 0], transform: [{ translateX: offset }, { scale }, { translateX: -left }, { translateY: -top }] }}>
        {BACK_TO_FRONT.map((panel, slot) => [panels[panel.id], ...(alternatives[panel.id] ?? [])].map((specimen, variant) => (
          <Panel key={`${panel.id}-${variant}`} panel={panel} width={canvasWidth} x={x} y={y} onSize={onSize}
            variant={variant} selected={selected[slot]!} flight={flight?.slot === slot ? flight : null} progress={progress} running={running}>
            {specimen}
          </Panel>
        )))}
      </View>
    </View>
  );
}
