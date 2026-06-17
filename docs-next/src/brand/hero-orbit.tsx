import { type ReactNode, useEffect, useRef, useState } from "react";
import { useWindowDimensions, Animated, Easing, AccessibilityInfo } from "react-native";
import { View, useTheme, supportsNativeDriver } from "@olympusoss/canvas";
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Mask, Rect, G, Filter, FeGaussianBlur, FeColorMatrix } from "react-native-svg";
import { CanvasMark } from "./canvas-mark";
import { AppleLogo, ReactLogo, TypeScriptLogo, AndroidLogo, Html5Logo, TailwindLogo } from "./brand-logos";

// Canvas at the core, the platforms it targets orbiting around it — the RN port of the
// Vite `.hero-orbit`: a dashed ring, a disc carrying the rainbow "C", a rainbow glow that
// spins behind it, and six brand badges that ride a slow orbit (each counter-rotated so its
// logo stays upright), exactly like the CSS keyframes. The web's `--i` order is preserved so
// each logo keeps its slot: tailwind 0, react 1, ts 2, android 3, web 4, ios 5. Honors
// reduce-motion by pinning the badges 60° apart and freezing the glow.
const BADGES: { i: number; color: string; render: (s: number, tint: string) => ReactNode }[] = [
  { i: 0, color: "#38bdf8", render: (s) => <TailwindLogo size={s} color="#38bdf8" /> },
  { i: 1, color: "#149eca", render: (s) => <ReactLogo size={s + 1} color="#149eca" /> },
  { i: 2, color: "#3178c6", render: (s) => <TypeScriptLogo size={s - 3} color="#3178c6" /> },
  { i: 3, color: "#3ddc84", render: (s) => <AndroidLogo size={s} color="#3ddc84" /> },
  { i: 4, color: "#e34f26", render: (s) => <Html5Logo size={s - 1} color="#e34f26" /> },
  // iOS rides the `--c: foreground` slot in Vite; the Apple glyph uses currentColor, so we
  // pass the resolved foreground tint (without it, dark mode renders it near-invisible).
  { i: 5, color: "__fg__", render: (s, tint) => <AppleLogo size={s} color={tint} /> },
];

// The rainbow glow from the keyframe: six bright hues swept as ONE conic ring (the web
// blurs a conic-gradient; RN has no conic, so we approximate it with many bright sectors
// faded out radially, with the disc covering the center, leaving a vivid rainbow halo).
const GLOW = ["#06b6d4", "#22c55e", "#f59e0b", "#fb6a3c", "#ec4899", "#a855f7"];
function mix(a: string, b: string, t: number): string {
  const p = (h: string, i: number) => parseInt(h.replace("#", "").slice(i, i + 2), 16);
  return `rgb(${Math.round(p(a, 0) + (p(b, 0) - p(a, 0)) * t)},${Math.round(p(a, 2) + (p(b, 2) - p(a, 2)) * t)},${Math.round(p(a, 4) + (p(b, 4) - p(a, 4)) * t)})`;
}
// The conic glow color at a screen angle (deg): six hues, 60° apart, blended cyclically.
function glowColor(deg: number): string {
  const a = (((deg % 360) + 360) % 360), idx = Math.floor(a / 60) % 6;
  return mix(GLOW[idx], GLOW[(idx + 1) % 6], (a % 60) / 60);
}

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
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) {
      badgeSpin.setValue(0);
      glowSpin.setValue(0);
      glowPulse.setValue(1);
      return;
    }
    // Match the CSS: 30s for the orbit, 6s for the rainbow spin, both linear and looping;
    // a 3.4s ease-in-out opacity pulse (heroGlowPulse: 0.85 → 1 → 0.85) breathes the glow.
    // The driver is gated on supportsNativeDriver: on react-native-web, Animated.loop +
    // useNativeDriver:true runs one pass then freezes, so web uses the JS loop while native
    // keeps the off-thread driver.
    const b = Animated.loop(Animated.timing(badgeSpin, { toValue: 1, duration: 30000, easing: Easing.linear, useNativeDriver: supportsNativeDriver }));
    const g = Animated.loop(Animated.timing(glowSpin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: supportsNativeDriver }));
    const p = Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 0.85, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: supportsNativeDriver }),
      Animated.timing(glowPulse, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: supportsNativeDriver }),
    ]));
    b.start();
    g.start();
    p.start();
    return () => { b.stop(); g.stop(); p.stop(); };
  }, [reduced, badgeSpin, glowSpin, glowPulse]);

  // Match the CSS breakpoints: desktop r150/core116, tablet (<=920) r134/core104,
  // phone (<=560) r112/core88. The badge stays 60px until it shrinks on phones.
  const tier = width <= 560 ? "phone" : width <= 920 ? "tablet" : "desktop";
  const r = tier === "phone" ? 112 : tier === "tablet" ? 134 : 150;
  const core = tier === "phone" ? 88 : tier === "tablet" ? 104 : 116;
  const badge = tier === "phone" ? 52 : 60;
  // Vite `.hero-orbit` height: desktop 400, tablet (<=920) 360, phone (<=560) 300. The box
  // is wider/taller than the ring so the orbit has breathing room; center separately on x/y.
  const boxW = r * 2 + badge + 20;
  const boxH = tier === "phone" ? 300 : tier === "tablet" ? 360 : 400;
  const cx = boxW / 2, cy = boxH / 2;
  const mark = Math.round(core * 0.64);
  const logo = Math.round(26 * (badge / 60));

  const glowSize = core + 100; // Vite `.hero-orbit-core::before { inset: -50px }`
  const gc = glowSize / 2, gR = glowSize / 2, gN = 120;
  const ring = Array.from({ length: gN }, (_, i) => {
    const a0 = (i * 360) / gN, a1 = ((i + 1) * 360) / gN, am = a0 + 180 / gN;
    const x0 = gc + gR * Math.sin((a0 * Math.PI) / 180), y0 = gc - gR * Math.cos((a0 * Math.PI) / 180);
    const x1 = gc + gR * Math.sin((a1 * Math.PI) / 180), y1 = gc - gR * Math.cos((a1 * Math.PI) / 180);
    return { d: `M${gc} ${gc} L${x0.toFixed(2)} ${y0.toFixed(2)} A${gR} ${gR} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`, color: glowColor(am) };
  });

  const orbitRotate = badgeSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const badgeCounter = badgeSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] });
  const glowRotate = glowSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={{ width: boxW, height: boxH, alignSelf: "center", position: "relative" }}>
      {/* Dashed orbit ring */}
      <Svg width={boxW} height={boxH} style={{ position: "absolute", top: 0, left: 0 }}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={tokens["muted-foreground"]} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="4 5" />
      </Svg>

      {/* Rainbow glow halo, behind the disc, spinning and breathing */}
      <Animated.View
        style={{
          position: "absolute",
          top: cy - glowSize / 2,
          left: cx - glowSize / 2,
          width: glowSize,
          height: glowSize,
          opacity: glowPulse,
          transform: [{ rotate: glowRotate }],
        }}
      >
        <Svg width={glowSize} height={glowSize}>
          <Defs>
            {/* Vite mask: radial-gradient(closest-side, #000 0 54%, transparent 92%) — the disc
                covers the solid center, leaving a ring that fades out by 92% of the radius. */}
            <RadialGradient id="glow-fade" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
              <Stop offset="54%" stopColor="#ffffff" stopOpacity={1} />
              <Stop offset="92%" stopColor="#ffffff" stopOpacity={0} />
            </RadialGradient>
            <Mask id="glow-mask">
              <Rect x="0" y="0" width={glowSize} height={glowSize} fill="url(#glow-fade)" />
            </Mask>
            {/* Vite `filter: blur(9px) saturate(1.25)` — softens the conic sectors into one
                diffuse bloom (no visible banding) and deepens the hues. */}
            <Filter id="glow-blur" x="-25%" y="-25%" width="150%" height="150%">
              <FeGaussianBlur stdDeviation="9" result="b" />
              <FeColorMatrix in="b" type="saturate" values="1.25" />
            </Filter>
          </Defs>
          <G mask="url(#glow-mask)" filter="url(#glow-blur)">
            {ring.map((s, i) => <Path key={i} d={s.d} fill={s.color} />)}
          </G>
        </Svg>
      </Animated.View>

      {/* The disc + the Canvas mark (static, above the glow) */}
      <View
        style={{
          position: "absolute",
          top: cy - core / 2,
          left: cx - core / 2,
          width: core,
          height: core,
          borderRadius: core / 2,
          backgroundColor: tokens.card,
          borderWidth: 1,
          borderColor: tokens.border,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: tokens.foreground,
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 18 },
        }}
      >
        <CanvasMark size={mark} />
      </View>

      {/* Six brand badges on the orbiting layer; each counter-rotates to stay upright */}
      <Animated.View style={{ position: "absolute", top: 0, left: 0, width: boxW, height: boxH, transform: [{ rotate: orbitRotate }] }}>
        {BADGES.map(({ i, color, render }) => {
          const a = (i * 60 * Math.PI) / 180;
          const bx = cx + Math.cos(a) * r - badge / 2;
          const by = cy + Math.sin(a) * r - badge / 2;
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
                // Vite `.orbit-badge-inner`: 0 8px 22px -10px var(--c)@55% colored glow.
                shadowColor: tint,
                shadowOpacity: 0.5,
                shadowRadius: 11,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              {render(logo, tint)}
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}
