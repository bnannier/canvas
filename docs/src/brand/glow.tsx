import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { View, useReducedMotion, useTheme } from "@nannier/canvas";
import { AURORA, HERO_FRAME, HERO_MOTION, auroraDiscs } from "./library-hero-look";

// A brand illustration: the v4 hand-off's Library hero aurora (decision P5-G2, the
// `v4-library-hero` card), three soft discs of the brand sweep behind the hero, and the
// frame that holds them. The hand-off blurs a radial gradient with CSS `filter: blur()`;
// here each disc is one react-native-svg radial gradient whose stops are that blur already
// applied (`blurredDisc`, integrated once per size), so the same drawing paints on iOS,
// Android and the web with no filter. Each disc follows the same independent drift,
// reversal and delay as the hand-off, driven outside React's render cycle.

function DriftingDisc({ disc, index, width, color, opacity, id }: {
  disc: ReturnType<typeof auroraDiscs>[number]; index: number; width: number; color: string; opacity: number; id: string;
}) {
  const reduced = useReducedMotion();
  const timing = HERO_MOTION.drifts[index]!;
  const progress = useSharedValue(timing.reversed ? 1 : 0);
  useEffect(() => {
    progress.value = timing.reversed ? 1 : 0;
    if (!reduced) progress.value = withDelay(timing.delay, withRepeat(withTiming(timing.reversed ? 0 : 1, { duration: timing.duration, easing: Easing.bezier(0.42, 0, 0.58, 1) }), -1, true));
    return () => cancelAnimation(progress);
  }, [progress, reduced, timing]);
  const size = AURORA.orbs[index]!.size * width;
  const drift = useAnimatedStyle(() => ({ transform: [
    { translateX: reduced ? 0 : size * 0.08 * progress.value },
    { translateY: reduced ? 0 : size * 0.12 * progress.value },
    { scale: reduced ? 1 : 1 + 0.15 * progress.value },
  ] }));
  return <Animated.View style={[{ position: "absolute", left: disc.cx - disc.r, top: disc.cy - disc.r, width: disc.r * 2, height: disc.r * 2 }, drift]}>
    <Svg width={disc.r * 2} height={disc.r * 2}>
      <Defs><RadialGradient id={id} cx="50%" cy="50%" r="50%">
        {disc.stops.map((stop) => <Stop key={stop.offset} offset={stop.offset} stopColor={color} stopOpacity={stop.opacity * opacity} />)}
      </RadialGradient></Defs>
      <Circle cx={disc.r} cy={disc.r} r={disc.r} fill={`url(#${id})`} />
    </Svg>
  </Animated.View>;
}

/** The glow layer: the hero section's box, from the page's top to the hero's foot, the window's width. */
function AuroraGlow() {
  const { tokens, dark } = useTheme();
  const key = useId().replace(/[^A-Za-z0-9]/g, "");
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const discs = useMemo(() => (box ? auroraDiscs(box.width, box.height) : []), [box]);
  const layer = dark ? AURORA.opacity.dark : AURORA.opacity.light;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((prev) => (prev && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1 ? prev : { width, height }));
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
      }}
    >
      {box ? discs.map((disc, index) => <DriftingDisc key={disc.role} disc={disc} index={index} width={box.width} color={tokens[disc.role] ?? tokens.primary} opacity={layer} id={`${key}aurora${index}`} />) : null}
    </View>
  );
}

/**
 * The hero's section: the window's width, clipping the aurora behind it, with the hand-off
 * section's room around its content and the content capped at 1440 px and centred. Its
 * children are the hero's kit components.
 */
export function AuroraFrame({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <View testID={testID} style={{ width: "100%", overflow: "hidden" }}>
      <AuroraGlow />
      <View style={{ width: "100%", maxWidth: HERO_FRAME.max, alignSelf: "center", paddingTop: HERO_FRAME.top, paddingBottom: HERO_FRAME.bottom, paddingHorizontal: HERO_FRAME.side }}>
        {children}
      </View>
    </View>
  );
}
