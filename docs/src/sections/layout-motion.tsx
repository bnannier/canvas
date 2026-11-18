import { useEffect, type ReactNode } from "react";
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { View, useReducedMotion } from "@nannier/canvas";

/** The specimen's parent changes its bounds; the real kit children reflow inside.
 * A reserved stage keeps the surrounding reading layout stationary. */
export function ResizeSample({ fraction, height, children }: { fraction: number; height: number; children: ReactNode }) {
  const reduced = useReducedMotion();
  const width = useSharedValue(fraction);
  useEffect(() => {
    width.value = reduced ? fraction : withTiming(fraction, {
      duration: 900, easing: Easing.inOut(Easing.cubic), reduceMotion: ReduceMotion.Never,
    });
  }, [fraction, reduced, width]);
  const sizing = useAnimatedStyle(() => ({ width: `${width.value * 100}%` as `${number}%` }));
  return <View style={{ height, minWidth: 0 }}>
    <Animated.View style={[{ minWidth: 0 }, sizing]}>{children}</Animated.View>
  </View>;
}
