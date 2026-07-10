import { useEffect } from "react";
import { Animated, useWindowDimensions } from "react-native";
import { View, useTheme, useReducedMotion } from "@olympusoss/canvas";
import { clock, retainCosmosClock, releaseCosmosClock } from "./cosmos-clock";
import { Starfield, FlightShell, StreakShell, StarburstShell, Nebula, GalaxyCore, Comet } from "./cosmos-layers";
import { STARS_FAR, SHELL_FIELDS, STREAK_FIELDS, BURST_FIELDS, STAR_ALPHA, LIGHT_FLOOR, nebulaBlobs } from "./cosmos-sky";

// The Canvas Universe as a continuous galactic fly-through: the camera travels
// toward the brand's conic-spectrum galaxy at the vanishing point while seeded star
// shells stream outward past the viewer (reference: "Journey to the Center of the
// Milky Way"). Every mounted instance binds to the SINGLETON clock in
// cosmos-clock.ts, so the flight carries its exact phase across page changes, tab
// switches, and back-swipes instead of restarting.
//
// ONE composition everywhere, by requirement: every screen renders the identical
// sky (same seeded fields, same shell offsets, same galaxy, same alphas), so moving
// between any two screens is pixel-continuous. There is deliberately no per-screen
// mood; intensity is tuned once, legibility-first, for content pages.
//
// Mechanics: each shell derives a staggered sawtooth phase from the one master
// flight value via chained interpolations (the wrap seam lands where opacity is 0);
// scale keyframes approximate exponential growth so the radial motion reads as
// constant z-velocity; shells are square boxes centered on the core point so
// scaling radiates exactly from the galaxy. Only transform/opacity animate, over
// static SVG, per the motion rules; Reduce Motion renders the clock's poster still.

const SCALE_IN = [0, 0.25, 0.5, 0.75, 1];
const DOT_SCALE = [0.35, 0.55, 0.9, 1.5, 2.4];
const STREAK_SCALE = [0.5, 0.75, 1.15, 1.8, 2.6];
const FADE_IN = [0, 0.12, 0.78, 0.95, 1];

// The evenly staggered shell offsets, identical on every screen: four dot shells on
// the quarters, two streak shells and two starburst shells interleaved on the odd
// eighths between them.
const DOT_OFFSETS = [0, 0.25, 0.5, 0.75];
const STREAK_OFFSETS = [0.125, 0.625];
const BURST_OFFSETS = [0.375, 0.875];

// Shell phase (flight + offset) mod 1 as a chained interpolation; the epsilon step
// avoids a degenerate 0-width segment at the seam.
function sawtooth(offset: number) {
  if (offset === 0) return clock.flight;
  const seam = 1 - offset;
  return clock.flight.interpolate({
    inputRange: [0, seam, seam + 1e-6, 1],
    outputRange: [offset, 1, 0, offset],
  });
}

function shellInterp(offset: number, scaleOut: number[], cap: number) {
  const phase = sawtooth(offset);
  return {
    scale: phase.interpolate({ inputRange: SCALE_IN, outputRange: scaleOut }),
    opacity: phase.interpolate({ inputRange: FADE_IN, outputRange: [0, cap, cap, 0, 0] }),
  };
}

export function Cosmos() {
  const { tokens, dark } = useTheme();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  useEffect(() => {
    retainCosmosClock(reduced ? "poster" : "running");
    return () => releaseCosmosClock();
  }, [reduced]);

  // The vanishing point the flight aims at, slightly above center so page content
  // breathes below the galaxy.
  const coreX = width * 0.5;
  const coreY = height * 0.42;
  // Shell boxes are squares centered on the core, sized to cover the farthest
  // viewport corner at scale 1 (RN scales about the view center, so this centers
  // the radial motion exactly on the galaxy).
  const shellSize = Math.ceil(2 * Math.hypot(0.5 * width, 0.58 * height));
  const shellStyle = { position: "absolute" as const, left: coreX - shellSize / 2, top: coreY - shellSize / 2 };

  const shellCap = dark ? 0.58 : 0.34;
  const dotShells = DOT_OFFSETS.map((o, i) => ({ ...shellInterp(o, DOT_SCALE, shellCap), field: SHELL_FIELDS[i] }));
  const streakShells = STREAK_OFFSETS.map((o, i) => ({ ...shellInterp(o, STREAK_SCALE, shellCap), field: STREAK_FIELDS[i] }));
  // Starburst shells fly like the dot shells; the group's counter-phased twinkle is
  // multiplied onto the flight fade so glints sparkle while they pass.
  const burstTwinkles = [
    clock.twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
    clock.twinkle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }),
  ];
  const burstShells = BURST_OFFSETS.map((o, i) => {
    const s = shellInterp(o, DOT_SCALE, 1);
    return { scale: s.scale, opacity: Animated.multiply(s.opacity, burstTwinkles[i]), field: BURST_FIELDS[i] };
  });

  const backdropOpacity = clock.twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });

  // Palindromic keyframes (equal endpoints) keep the nebulae seam-free on the
  // looping master value; a narrow range reads as slow passing drift.
  const nebScaleA = clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1.25, 0.85] });
  const nebScaleB = clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1.25, 0.85, 1.25] });
  const nebOpacity = clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1, 0.7] });

  const neb = nebulaBlobs(tokens.primary, dark);
  const neb1Size = 760;
  const neb2Size = 680;
  const neb1Style = { position: "absolute" as const, left: width * 0.7 - neb1Size / 2, top: height * 0.25 - neb1Size / 2 };
  const neb2Style = { position: "absolute" as const, left: width * 0.2 - neb2Size / 2, top: height * 0.8 - neb2Size / 2 };

  const minDim = Math.min(width, height);
  const galaxySize = Math.min(280, Math.round(minDim * 0.42));
  const galaxyStyle = { position: "absolute" as const, left: coreX - galaxySize / 2, top: coreY - galaxySize / 2 };
  const galaxyRotate = clock.coreSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const galaxyRange: [number, number] = dark ? [0.26, 0.34] : [0.28, 0.36];
  const galaxyOpacity = clock.coreBreath.interpolate({ inputRange: [0, 1], outputRange: galaxyRange });

  const cometX = clock.comet.interpolate({ inputRange: [0, 1], outputRange: [-240, width * 1.1] });
  const cometY = clock.comet.interpolate({ inputRange: [0, 1], outputRange: [height * 0.18, height * 0.5] });
  const cometOpacity = clock.comet.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.7, 0.7, 0] });

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Light scheme: the celestial chart's cool paper floor. Dark rides the
          shell's deep token background directly. */}
      {!dark ? <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: LIGHT_FLOOR }} /> : null}

      <Starfield
        width={width}
        height={height}
        stars={STARS_FAR}
        dark={dark}
        alphaCap={dark ? STAR_ALPHA.far.dark : STAR_ALPHA.far.light}
        opacity={backdropOpacity}
      />

      <GalaxyCore size={galaxySize} style={galaxyStyle} rotate={galaxyRotate} opacity={galaxyOpacity} />

      <Nebula size={neb1Size} blobs={neb.one} style={neb1Style} translateX={0} translateY={0} scale={nebScaleA} opacity={nebOpacity} />
      <Nebula size={neb2Size} blobs={neb.two} style={neb2Style} translateX={0} translateY={0} scale={nebScaleB} opacity={nebOpacity} />

      {dotShells.map((s, i) => (
        <FlightShell key={i} size={shellSize} dots={s.field} dark={dark} alphaCap={1} style={shellStyle} scale={s.scale} opacity={s.opacity} />
      ))}

      {burstShells.map((s, i) => (
        <StarburstShell key={i} size={shellSize} bursts={s.field} dark={dark} style={shellStyle} scale={s.scale} opacity={s.opacity} />
      ))}

      {streakShells.map((s, i) => (
        <StreakShell key={i} size={shellSize} streaks={s.field} dark={dark} alphaCap={1} style={shellStyle} scale={s.scale} opacity={s.opacity} />
      ))}

      <Comet translateX={cometX} translateY={cometY} opacity={cometOpacity} angle="14deg" />
    </View>
  );
}
