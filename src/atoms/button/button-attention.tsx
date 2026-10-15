import { useEffect, useState } from "react";
import { View, LoopView, createLoopChannel, useReducedMotion, type ViewStyle } from "../../style/index.js";
import { alpha } from "../../style/color.js";
import { palette } from "../../style/tokens.js";

// Functional attention cue requested by the Argus owner. Animate the halo alone:
// text, hit target, dimensions and the existing button treatment stay still.
const ATTENTION = {
  period: 2000,
  waves: [
    { blur: 6, spread: 0, inputRange: [0, 0.16, 0.42, 1], outputRange: [0, 0.85, 0, 0] },
    { blur: 14, spread: 2, inputRange: [0, 0.12, 0.36, 0.66, 1], outputRange: [0, 0, 0.85, 0, 0] },
    { blur: 24, spread: 4, inputRange: [0, 0.32, 0.58, 0.92, 1], outputRange: [0, 0, 0.7, 0, 0] },
  ],
};

export function ButtonAttention({ radius }: { radius: ViewStyle["borderRadius"] }) {
  const color = palette["amber-500"];
  const reduced = useReducedMotion();
  const [channel] = useState(() => createLoopChannel({ period: ATTENTION.period }));
  useEffect(() => {
    if (!reduced) channel.play();
    else channel.park(0.5);
    return () => channel.stop();
  }, [channel, reduced]);
  const style: ViewStyle = {
    position: "absolute", top: -1, right: -1, bottom: -1, left: -1,
    borderRadius: radius,
  };
  const decorative = { pointerEvents: "none" as const, "aria-hidden": true, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
  return reduced
    ? <View {...decorative} style={[style, { boxShadow: `0 0 12px 2px ${alpha(color, 0.35)}` }]} />
    : <>{ATTENTION.waves.map((wave) => <LoopView key={wave.blur} {...decorative}
      style={[style, { boxShadow: `0 0 ${wave.blur}px ${wave.spread}px ${alpha(color, 0.6)}` }]}
      opacity={{ channel, inputRange: wave.inputRange, outputRange: wave.outputRange }} />)}</>;
}
