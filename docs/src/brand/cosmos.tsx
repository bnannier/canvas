import { useEffect } from "react";
import { Animated, useWindowDimensions } from "react-native";
import { usePathname } from "expo-router";
import { View, useTheme, useReducedMotion } from "@olympusoss/canvas";
import { clock, retainCosmosClock, releaseCosmosClock } from "./cosmos-clock";
import { Starfield, FlightShell, StreakShell, ConstellationChart, Nebula, GalaxyCore, Comet } from "./cosmos-layers";
import {
  STARS_FAR_AMBIENT,
  STARS_FAR_HERO,
  SHELL_FIELDS,
  STREAK_FIELDS,
  CHART_A,
  CHART_B,
  STAR_ALPHA,
  LIGHT_FLOOR,
  nebulaBlobs,
} from "./cosmos-sky";

// The Canvas Universe as a continuous galactic fly-through: the camera travels
// toward the brand's conic-spectrum galaxy at the vanishing point while seeded star
// shells stream outward past the viewer (reference: "Journey to the Center of the
// Milky Way"). Every mounted instance binds to the SINGLETON clock in
// cosmos-clock.ts, so the flight carries its exact phase across page changes, tab
// switches, and back-swipes instead of restarting.
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

export function Cosmos({ hero }: { hero?: boolean }) {
  const pathname = usePathname();
  const isHero = hero ?? pathname === "/";
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

  const shellCap = dark ? (isHero ? 0.65 : 0.5) : isHero ? 0.38 : 0.3;
  const dotShells = isHero
    ? [0, 1 / 6, 3 / 6, 4 / 6].map((o, i) => ({ ...shellInterp(o, DOT_SCALE, shellCap), field: SHELL_FIELDS[i] }))
    : [0, 1 / 3, 2 / 3].map((o, i) => ({ ...shellInterp(o, DOT_SCALE, shellCap), field: SHELL_FIELDS[i] }));
  const streakShells = isHero
    ? [2 / 6, 5 / 6].map((o, i) => ({ ...shellInterp(o, STREAK_SCALE, shellCap), field: STREAK_FIELDS[i] }))
    : [];

  const backdropOpacity = clock.twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });

  // Palindromic keyframes (equal endpoints) keep the nebulae and chart seam-free on
  // the looping master value; a narrow range reads as slow passing drift.
  const nebScaleA = clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1.25, 0.85] });
  const nebScaleB = clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1.25, 0.85, 1.25] });
  const nebOpacity = clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1, 0.7] });
  const chartScale = clock.flight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1.14, 0.92] });
  const chartOpacity = clock.twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.7] });

  const neb = nebulaBlobs(tokens.primary, dark, isHero);
  const neb1Size = 760;
  const neb2Size = 680;
  const neb1Style = { position: "absolute" as const, left: width * 0.7 - neb1Size / 2, top: height * 0.25 - neb1Size / 2 };
  const neb2Style = { position: "absolute" as const, left: width * 0.2 - neb2Size / 2, top: height * 0.8 - neb2Size / 2 };

  const minDim = Math.min(width, height);
  const galaxySize = isHero ? Math.min(340, Math.round(minDim * 0.5)) : Math.min(200, Math.round(minDim * 0.32));
  const galaxyStyle = { position: "absolute" as const, left: coreX - galaxySize / 2, top: coreY - galaxySize / 2 };
  const galaxyRotate = clock.coreSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const galaxyRange: [number, number] = isHero ? (dark ? [0.4, 0.5] : [0.5, 0.62]) : dark ? [0.14, 0.18] : [0.1, 0.14];
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
        stars={isHero ? STARS_FAR_HERO : STARS_FAR_AMBIENT}
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

      <ConstellationChart
        width={width}
        height={height}
        figures={isHero ? [...CHART_A, ...CHART_B] : CHART_A}
        dark={dark}
        scale={chartScale}
        opacity={chartOpacity}
      />

      {streakShells.map((s, i) => (
        <StreakShell key={i} size={shellSize} streaks={s.field} dark={dark} alphaCap={1} style={shellStyle} scale={s.scale} opacity={s.opacity} />
      ))}

      {isHero ? <Comet translateX={cometX} translateY={cometY} opacity={cometOpacity} angle="14deg" /> : null}
    </View>
  );
}
