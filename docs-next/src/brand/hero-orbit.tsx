import { type ReactNode, useEffect, useRef, useState } from "react";
import { useWindowDimensions, Animated, Easing, AccessibilityInfo } from "react-native";
import { View, useTheme } from "@olympusoss/canvas";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { CanvasMark } from "./canvas-mark";
import { AppleLogo, ReactLogo, TypeScriptLogo, AndroidLogo, Html5Logo, TailwindLogo } from "./brand-logos";

// Canvas at the core, the platforms it targets orbiting around it — the RN port of the
// Vite `.hero-orbit`: a dashed ring, a disc carrying the rainbow "C", a rainbow glow that
// spins behind it, and six brand badges that ride a slow orbit (each counter-rotated so its
// logo stays upright), exactly like the CSS keyframes. The web's `--i` order is preserved so
// each logo keeps its slot: tailwind 0, react 1, ts 2, android 3, web 4, ios 5. Honors
// reduce-motion by pinning the badges 60° apart and freezing the glow.
const BADGES: { i: number; color: string; render: (s: number) => ReactNode }[] = [
  { i: 0, color: "#38bdf8", render: (s) => <TailwindLogo size={s} color="#38bdf8" /> },
  { i: 1, color: "#149eca", render: (s) => <ReactLogo size={s + 1} color="#149eca" /> },
  { i: 2, color: "#3178c6", render: (s) => <TypeScriptLogo size={s - 3} color="#3178c6" /> },
  { i: 3, color: "#3ddc84", render: (s) => <AndroidLogo size={s} color="#3ddc84" /> },
  { i: 4, color: "#e34f26", render: (s) => <Html5Logo size={s - 1} color="#e34f26" /> },
  { i: 5, color: "__fg__", render: (s) => <AppleLogo size={s} /> },
];

// The rainbow ring from the keyframe: six soft blobs that bloom from behind the disc's
// rim and blend into a halo as the layer spins.
const GLOW = ["#06b6d4", "#22c55e", "#f59e0b", "#fb6a3c", "#ec4899", "#a855f7"];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (mounted) setReduced(v); });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => { mounted = false; sub.remove(); };
  }, []);
  return reduced;
}

export function HeroOrbit() {
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();

  const badgeSpin = useRef(new Animated.Value(0)).current;
  const glowSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      badgeSpin.setValue(0);
      glowSpin.setValue(0);
      return;
    }
    // Match the CSS: 30s for the orbit, 6s for the rainbow spin, both linear and looping.
    const b = Animated.loop(Animated.timing(badgeSpin, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: true }));
    const g = Animated.loop(Animated.timing(glowSpin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true }));
    b.start();
    g.start();
    return () => { b.stop(); g.stop(); };
  }, [reduced, badgeSpin, glowSpin]);

  // Match the CSS breakpoints: desktop r150/core116, tablet (<=920) r134/core104,
  // phone (<=560) r112/core88. The badge stays 60px until it shrinks on phones.
  const tier = width <= 560 ? "phone" : width <= 920 ? "tablet" : "desktop";
  const r = tier === "phone" ? 112 : tier === "tablet" ? 134 : 150;
  const core = tier === "phone" ? 88 : tier === "tablet" ? 104 : 116;
  const badge = tier === "phone" ? 52 : 60;
  const orbit = r * 2 + badge + 20;
  const c = orbit / 2;
  const mark = Math.round(core * 0.64);
  const logo = Math.round(26 * (badge / 60));

  const glowSize = core + 96;
  const glowBlob = core * 0.5;
  const glowDist = core * 0.34;

  const orbitRotate = badgeSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const badgeCounter = badgeSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });
  const glowRotate = glowSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={{ width: orbit, height: orbit, alignSelf: "center", position: "relative" }}>
      {/* Dashed orbit ring */}
      <Svg width={orbit} height={orbit} style={{ position: "absolute", top: 0, left: 0 }}>
        <Circle cx={c} cy={c} r={r} fill="none" stroke={tokens["muted-foreground"]} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="4 5" />
      </Svg>

      {/* Rainbow glow halo, behind the disc, spinning */}
      <Animated.View
        style={{
          position: "absolute",
          top: c - glowSize / 2,
          left: c - glowSize / 2,
          width: glowSize,
          height: glowSize,
          transform: [{ rotate: glowRotate }],
        }}
      >
        <Svg width={glowSize} height={glowSize}>
          <Defs>
            {GLOW.map((color, i) => (
              <RadialGradient key={i} id={`glow-${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={color} stopOpacity={0.85} />
                <Stop offset="100%" stopColor={color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {GLOW.map((_, i) => {
            const a = (i * 60 * Math.PI) / 180;
            return (
              <Circle key={i} cx={glowSize / 2 + Math.cos(a) * glowDist} cy={glowSize / 2 + Math.sin(a) * glowDist} r={glowBlob} fill={`url(#glow-${i})`} />
            );
          })}
        </Svg>
      </Animated.View>

      {/* The disc + the Canvas mark (static, above the glow) */}
      <View
        style={{
          position: "absolute",
          top: c - core / 2,
          left: c - core / 2,
          width: core,
          height: core,
          borderRadius: core / 2,
          backgroundColor: tokens.card,
          borderWidth: 1,
          borderColor: tokens.border,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: tokens.foreground,
          shadowOpacity: 0.22,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 14 },
        }}
      >
        <CanvasMark size={mark} />
      </View>

      {/* Six brand badges on the orbiting layer; each counter-rotates to stay upright */}
      <Animated.View style={{ position: "absolute", top: 0, left: 0, width: orbit, height: orbit, transform: [{ rotate: orbitRotate }] }}>
        {BADGES.map(({ i, color, render }) => {
          const a = (i * 60 * Math.PI) / 180;
          const bx = c + Math.cos(a) * r - badge / 2;
          const by = c + Math.sin(a) * r - badge / 2;
          const tint = color === "__fg__" ? tokens.foreground : color;
          return (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                top: by,
                left: bx,
                width: badge,
                height: badge,
                borderRadius: badge / 2,
                backgroundColor: tokens.card,
                borderWidth: 1,
                borderColor: tokens.border,
                alignItems: "center",
                justifyContent: "center",
                transform: [{ rotate: badgeCounter }],
                shadowColor: tint,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              {render(logo)}
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}
