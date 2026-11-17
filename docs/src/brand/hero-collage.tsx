import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { View, useReducedMotion, useHoverCapable } from "@nannier/canvas";
import { COLLAGE, HERO_MOTION, panelTransform, projectCss, stackBounds, type CollagePanel, type CollagePanelId } from "./library-hero-look";

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

const BACK_TO_FRONT = [...COLLAGE.panels].sort((a, b) => a.z - b.z);

function Panel({ panel, width, x, y, children, onSize }: {
  panel: CollagePanel; width: number; x: SharedValue<number>; y: SharedValue<number>; children: ReactNode;
  onSize: (id: CollagePanelId, width: number, height: number) => void;
}) {
  const motion = useAnimatedStyle(() => ({ transform: panelTransform(panel, width, [x.value, y.value, 3]) }));
  return <Animated.View testID={`library-panel-${panel.id}`} onLayout={({ nativeEvent: { layout } }) => onSize(panel.id, layout.width, layout.height)} style={[{
    position: "absolute", left: panel.x, top: panel.y,
    ...(panel.width != null ? { width: panel.width } : null), transformOrigin: [0, 0, 0],
  }, motion]}>{children}</Animated.View>;
}

export function HeroCollage({ panels, testID, fit = false }: { panels: Record<CollagePanelId, ReactNode>; testID?: string; fit?: boolean }) {
  const [width, setWidth] = useState(SEED_WIDTH);
  const [sizes, setSizes] = useState<Partial<Record<CollagePanelId, [number, number]>>>({});
  const onSize = useCallback((id: CollagePanelId, w: number, h: number) => {
    setSizes(prev => prev[id]?.[0] === w && prev[id]?.[1] === h ? prev : { ...prev, [id]: [w, h] });
  }, []);
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
      const config = { duration: HERO_MOTION.tilt, easing: Easing.bezier(...HERO_MOTION.entrance) };
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
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        if (next > 0) setWidth((prev) => (Math.abs(prev - next) < 1 ? prev : next));
      }}
      style={{ height: drawingHeight * scale }}
    >
      <View style={{ width: canvasWidth, height: COLLAGE.height, transformOrigin: [0, 0, 0], transform: [{ translateX: offset }, { scale }, { translateX: -left }, { translateY: -top }] }}>
        {BACK_TO_FRONT.map((panel) => <Panel key={panel.id} panel={panel} width={canvasWidth} x={x} y={y} onSize={onSize}>{panels[panel.id]}</Panel>)}
      </View>
    </View>
  );
}
