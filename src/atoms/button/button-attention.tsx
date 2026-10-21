import { useEffect, useMemo } from "react";
import { type StyleProp } from "react-native";
import { View, LoopView, createLoopChannel, keyframes, useReducedMotion, type ViewStyle } from "../../style/index.js";
import { alpha } from "../../style/color.js";
import { PALETTE_RED_500 } from "../../style/tokens.js";
import { materialCorners } from "../../style/glass-surface/glass-surface.shared.js";

// Functional attention cue requested by the Argus owner. Animate the halo alone:
// text, hit target, dimensions and the existing button treatment stay still.
const ATTENTION = {
  period: 1800,
  // A full swell and return, a softer second beat, then a quiet pause.
  heartbeat: keyframes([[0, 0], [0.08, 0.4], [0.18, 1], [0.28, 0.4], [0.36, 0], [0.44, 0.3], [0.52, 0.8], [0.62, 0.3], [0.7, 0], [1, 0]]),
  waves: [
    { blur: 6, spread: 0, inputRange: [0, 0.4, 0.7, 1], outputRange: [0.04, 0.75, 0.5, 0.25] },
    { blur: 14, spread: 2, inputRange: [0, 0.4, 0.7, 1], outputRange: [0, 0.12, 0.8, 0.6] },
    { blur: 24, spread: 4, inputRange: [0, 0.4, 0.7, 1], outputRange: [0, 0, 0.2, 0.85] },
  ],
};

/** The glow hugs its host, so its corners are the host's own, read off the host's shape the way GlassPane's are. */
export function ButtonAttention({ shape }: { shape: StyleProp<ViewStyle> }) {
  const color = PALETTE_RED_500;
  const reduced = useReducedMotion();
  const channel = useMemo(() => createLoopChannel({ period: ATTENTION.period, shape: ATTENTION.heartbeat }), []);
  useEffect(() => {
    if (!reduced) channel.play();
    else channel.park(0.5);
    return () => channel.stop();
  }, [channel, reduced]);
  const style: ViewStyle = {
    position: "absolute", top: -1, right: -1, bottom: -1, left: -1,
    ...materialCorners(shape),
  };
  const decorative = { pointerEvents: "none" as const, "aria-hidden": true, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
  return reduced
    ? <View {...decorative} style={[style, { boxShadow: `0 0 12px 2px ${alpha(color, 0.35)}` }]} />
    : <>{ATTENTION.waves.map((wave) => <LoopView key={wave.blur} {...decorative}
      style={[style, { boxShadow: `0 0 ${wave.blur}px ${wave.spread}px ${alpha(color, 0.6)}` }]}
      opacity={{ channel, inputRange: wave.inputRange, outputRange: wave.outputRange }} />)}</>;
}
