import { useEffect, useRef } from "react";
import { Animated, Easing, useWindowDimensions } from "react-native";
import { usePathname } from "expo-router";
import { View, useTheme, useReducedMotion } from "@olympusoss/canvas";
import { Starfield, ConstellationChart, Nebula, WarpShell, GalaxyCore, Comet } from "./cosmos-layers";
import {
  STARS_FAR_AMBIENT,
  STARS_FAR_HERO,
  STARS_NEAR_AMBIENT,
  STARS_NEAR_HERO,
  WARP_SHELLS,
  CHART_A,
  CHART_B,
  STAR_ALPHA,
  LIGHT_FLOOR,
  nebulaBlobs,
} from "./cosmos-sky";

// The Canvas Universe: the animated backdrop the glass functional layer floats
// over, on all three platforms from this one file. The design system is the
// universe: tokens are the stars, components are the constellations, the brand
// aurora hues are the nebulae, and the conic spectrum is the galaxy core. Two
// moods: ambient (every content page; calm, legibility first) and hero (home and
// the native search session; adds the galaxy, warp shells, and a comet).
//
// Motion rules (see src/style/motion.ts and the hero-orbit precedent): every loop
// runs on the JS driver (useNativeDriver:false; native-driver loops freeze on
// react-native-web and stall under the New Architecture), animates ONLY
// transform/opacity on Animated.View wrappers around static SVG, and freezes to a
// composed poster frame under Reduce Motion. Loop periods are mutually
// non-harmonic so the sky never visibly synchronizes.

export function Cosmos({ hero, paused = false }: { hero?: boolean; paused?: boolean }) {
  const pathname = usePathname();
  const isHero = hero ?? pathname === "/";
  const { tokens, dark } = useTheme();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  const twinkle = useRef(new Animated.Value(0)).current;
  const driftFar = useRef(new Animated.Value(0)).current;
  const driftNear = useRef(new Animated.Value(0)).current;
  const driftChart = useRef(new Animated.Value(0)).current;
  const neb1 = useRef(new Animated.Value(0)).current;
  const neb2 = useRef(new Animated.Value(0)).current;
  const warpA = useRef(new Animated.Value(0)).current;
  const warpB = useRef(new Animated.Value(0)).current;
  const warpC = useRef(new Animated.Value(0)).current;
  const galaxySpin = useRef(new Animated.Value(0)).current;
  const comet = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      // The poster frame: constellations and stars visible at mid-twinkle, nebula
      // mid-bloom, one warp shell caught mid-travel, the galaxy still, the comet
      // parked offscreen. A composed still, not a paused accident.
      twinkle.setValue(0.5);
      driftFar.setValue(0);
      driftNear.setValue(0);
      driftChart.setValue(0);
      neb1.setValue(0.5);
      neb2.setValue(0.5);
      warpA.setValue(0.35);
      warpB.setValue(0);
      warpC.setValue(0);
      galaxySpin.setValue(0);
      comet.setValue(0);
      return;
    }
    if (paused) return;

    const linear = (v: Animated.Value, duration: number) =>
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: false }));
    const breathe = (v: Animated.Value, half: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ]),
      );

    const running: { start: () => void; stop: () => void }[] = [
      breathe(twinkle, 3500),
      linear(driftFar, 240000),
      linear(driftNear, 150000),
      linear(driftChart, 330000),
      breathe(neb1, 45000),
      breathe(neb2, 32000),
    ];
    if (isHero) {
      // The warp shells launch 14s apart so one is always mid-travel; a loop as
      // the tail of a sequence runs forever and stop() reaches it.
      running.push(
        Animated.sequence([Animated.delay(0), linear(warpA, 42000)]),
        Animated.sequence([Animated.delay(14000), linear(warpB, 42000)]),
        Animated.sequence([Animated.delay(28000), linear(warpC, 42000)]),
        linear(galaxySpin, 180000),
        Animated.loop(
          Animated.sequence([
            Animated.delay(26000),
            Animated.timing(comet, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          ]),
        ),
      );
    }
    running.forEach((a) => a.start());
    return () => running.forEach((a) => a.stop());
  }, [reduced, paused, isHero, twinkle, driftFar, driftNear, driftChart, neb1, neb2, warpA, warpB, warpC, galaxySpin, comet]);

  // Interpolations are rebuilt on resize (width/height re-render) against the new
  // viewport while the running 0..1 values carry over, so rotation never glitches.
  const farY = driftFar.interpolate({ inputRange: [0, 1], outputRange: [0, -height] });
  const nearY = driftNear.interpolate({ inputRange: [0, 1], outputRange: [0, -height] });
  const chartY = driftChart.interpolate({ inputRange: [0, 1], outputRange: [0, -height] });
  const farOpacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });
  const nearOpacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0.55] });
  const chartAOpacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.7] });
  const chartBOpacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0.5] });

  const neb = nebulaBlobs(tokens.primary, dark, isHero);
  const neb1Size = 760;
  const neb2Size = 680;
  const neb1Style = { position: "absolute" as const, left: width * 0.7 - neb1Size / 2, top: height * 0.25 - neb1Size / 2 };
  const neb2Style = { position: "absolute" as const, left: width * 0.2 - neb2Size / 2, top: height * 0.8 - neb2Size / 2 };
  const neb1X = neb1.interpolate({ inputRange: [0, 1], outputRange: [0, 36] });
  const neb1Y = neb1.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });
  const neb1Scale = neb1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const neb1Opacity = neb1.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
  const neb2X = neb2.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const neb2Y = neb2.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const neb2Scale = neb2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const neb2Opacity = neb2.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const shellSize = Math.round(Math.min(width, height) * 1.2);
  const shellStyle = { position: "absolute" as const, left: (width - shellSize) / 2, top: (height - shellSize) / 2 };
  const warpInterp = (v: Animated.Value) => ({
    scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }),
    opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.5, 0.4, 0] }),
  });
  const warps = [warpInterp(warpA), warpInterp(warpB), warpInterp(warpC)];

  // Anchored low-right, clear of the hero orbit medallion (upper right on desktop)
  // and the headline column, so the galaxy reads as a distant destination.
  const galaxySize = Math.min(320, Math.round(Math.min(width, height) * 0.5));
  const galaxyStyle = { position: "absolute" as const, left: width * 0.84 - galaxySize / 2, top: height * 0.74 - galaxySize / 2 };
  const galaxyRotate = galaxySpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const galaxyOpacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: dark ? [0.42, 0.5] : [0.55, 0.65] });

  const cometX = comet.interpolate({ inputRange: [0, 1], outputRange: [-240, width * 1.1] });
  const cometY = comet.interpolate({ inputRange: [0, 1], outputRange: [height * 0.18, height * 0.5] });
  const cometOpacity = comet.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.7, 0.7, 0] });

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Light scheme: the celestial chart's cool paper floor. Dark rides the
          shell's deep token background directly. */}
      {!dark ? <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: LIGHT_FLOOR }} /> : null}

      {isHero ? <GalaxyCore size={galaxySize} style={galaxyStyle} rotate={galaxyRotate} opacity={galaxyOpacity} /> : null}

      <Nebula size={neb1Size} blobs={neb.one} style={neb1Style} translateX={neb1X} translateY={neb1Y} scale={neb1Scale} opacity={neb1Opacity} />
      <Nebula size={neb2Size} blobs={neb.two} style={neb2Style} translateX={neb2X} translateY={neb2Y} scale={neb2Scale} opacity={neb2Opacity} />

      <Starfield
        width={width}
        height={height}
        stars={isHero ? STARS_FAR_HERO : STARS_FAR_AMBIENT}
        dark={dark}
        alphaCap={dark ? STAR_ALPHA.far.dark : STAR_ALPHA.far.light}
        translateY={farY}
        opacity={farOpacity}
      />

      {isHero
        ? warps.map((w, i) => (
            <WarpShell key={i} size={shellSize} dots={WARP_SHELLS[i]} dark={dark} style={shellStyle} scale={w.scale} opacity={w.opacity} />
          ))
        : null}

      <ConstellationChart width={width} height={height} figures={CHART_A} dark={dark} translateY={chartY} opacity={chartAOpacity} />
      {isHero ? (
        <ConstellationChart width={width} height={height} figures={CHART_B} dark={dark} translateY={chartY} opacity={chartBOpacity} />
      ) : null}

      <Starfield
        width={width}
        height={height}
        stars={isHero ? STARS_NEAR_HERO : STARS_NEAR_AMBIENT}
        dark={dark}
        alphaCap={dark ? STAR_ALPHA.near.dark : STAR_ALPHA.near.light}
        translateY={nearY}
        opacity={nearOpacity}
      />

      {isHero ? <Comet translateX={cometX} translateY={cometY} opacity={cometOpacity} angle="14deg" /> : null}
    </View>
  );
}
