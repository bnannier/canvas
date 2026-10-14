import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, Platform, type ViewStyle } from "react-native";
import { View } from "./primitives.js";
import { HOVER_EASING, supportsNativeDriver, useReducedMotion } from "./motion.js";

// Original Argus disclosure: compositor transition on web, native animated driver
// on devices, identical ease curve. This mechanism never changes the glyph.
export function DisclosureRotation({ expanded, children }: { expanded: boolean; children: ReactNode }) {
  const reduced = useReducedMotion();
  const spin = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  useEffect(() => {
    if (!supportsNativeDriver) return;
    const motion = Animated.timing(spin, { toValue: expanded ? 1 : 0, duration: reduced ? 0 : 180, easing: Easing.bezier(0.25, 0.1, 0.25, 1), useNativeDriver: supportsNativeDriver });
    motion.start();
    return () => motion.stop();
  }, [expanded, reduced, spin]);
  if (Platform.OS === "web") return <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }], transitionProperty: "transform", transitionDuration: `${reduced ? 0 : 180}ms`, transitionTimingFunction: HOVER_EASING } as ViewStyle}>{children}</View>;
  return <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>{children}</Animated.View>;
}
