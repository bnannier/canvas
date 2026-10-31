import { useEffect, useRef, useState, type ReactNode } from "react";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import { View, useReducedMotion, useHoverCapable } from "@nannier/canvas";
import { COLLAGE, HERO_MOTION, panelTransform, stackBounds, type CollagePanel, type CollagePanelId } from "./library-hero-look";

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

function Panel({ panel, width, x, y, children }: {
  panel: CollagePanel; width: number; x: SharedValue<number>; y: SharedValue<number>; children: ReactNode;
}) {
  const motion = useAnimatedStyle(() => ({ transform: panelTransform(panel, width, [x.value, y.value, 3]) }));
  return <Animated.View style={[{
    position: "absolute", left: panel.x, top: panel.y,
    ...(panel.width != null ? { width: panel.width } : null), transformOrigin: [0, 0, 0],
  }, motion]}>{children}</Animated.View>;
}

export function HeroCollage({ panels, testID }: { panels: Record<CollagePanelId, ReactNode>; testID?: string }) {
  const [width, setWidth] = useState(SEED_WIDTH);
  const box = useRef<View>(null);
  const reduced = useReducedMotion();
  const hover = useHoverCapable();
  const x = useSharedValue<number>(COLLAGE.rotate[0]);
  const y = useSharedValue<number>(COLLAGE.rotate[1]);
  useEffect(() => {
    x.value = COLLAGE.rotate[0];
    y.value = COLLAGE.rotate[1];
    if (reduced || !hover || typeof window === "undefined" || typeof window.addEventListener !== "function") return;
    const move = (event: MouseEvent) => box.current?.measureInWindow((left, top, w, h) => {
      if (!w || !h) return;
      const bounds = stackBounds(w, [x.value, y.value, 3]);
      const nx = Math.max(-1, Math.min(1, (event.clientX - left - bounds.left - bounds.width / 2) / bounds.width));
      const ny = Math.max(-1, Math.min(1, (event.clientY - top - bounds.top - bounds.height / 2) / bounds.height));
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
  }, [hover, reduced, x, y]);
  return (
    <View
      ref={box}
      testID={testID}
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        if (next > 0) setWidth((prev) => (Math.abs(prev - next) < 1 ? prev : next));
      }}
      style={{ height: COLLAGE.height }}
    >
      {BACK_TO_FRONT.map((panel) => <Panel key={panel.id} panel={panel} width={width} x={x} y={y}>{panels[panel.id]}</Panel>)}
    </View>
  );
}
