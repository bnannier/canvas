import { useEffect, useRef, useState } from "react";
import { Animated, Platform, useWindowDimensions } from "react-native";
import { View, Text, Button, Icon, Image, useTheme, useReducedMotion } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { COMPONENTS } from "../core/data/components";
import { COMPONENT_DOCS } from "../core/registry";
import { LOOKS_SHOTS, LOOKS_ASPECT } from "./looks-shots";
import { DeviceFrame } from "./device-frames";
import { geist, geistMono } from "../ui/fonts";
import { alpha } from "../ui/color";

// The landing page's comparison hero: full device-screen captures of each atom's docs
// page, taken on the iPhone 17 Pro simulator, the Android emulator retargeted to that
// same screen, and phone-width web, rotating alphabetically through every atom with a
// captured set. Baked images (not live renders) so each pane is the platform's true
// full-screen view, status bar and tab bar included; the drawn DeviceFrame supplies the
// bezel and camera cutout around it. The code chip and the "Open <Atom>" CTA follow the
// atom on stage. Regenerate the shots with `bun scripts/capture-looks.ts`.
const INTERVAL_MS = 4000;

const PLATFORMS = [
  { key: "ios", label: "iOS", device: "iPhone 17 Pro" },
  { key: "android", label: "Android", device: "Pixel 10 Pro" },
  { key: "web", label: "Web", device: "Chrome" },
] as const;

const ATOMS = COMPONENTS.filter((c) => c.category === "Atoms" && LOOKS_SHOTS[c.slug])
  .map((c) => ({ ...c, entry: COMPONENT_DOCS[c.dir ?? c.slug] }))
  .sort((a, b) => a.name.localeCompare(b.name));

// False on native, where looks-shots.ts resolves to the empty fallback map: the
// section is web-only (on a device you ARE the platform), and gating on the data
// keeps the home shell free of Platform branches.
export const LOOKS_AVAILABLE = ATOMS.length > 0;

// First line of the example's JSX, elided when the fence is longer: the chip is a
// scent of the API, the component page has the full code.
function codePreview(code: string) {
  const lines = code.split("\n");
  const first = lines[0].trim();
  const clipped = first.length > 64 ? `${first.slice(0, 63)}…` : first;
  return lines.length > 1 && clipped === first ? `${first} …` : clipped;
}

export function ThreeLooksRotator() {
  const { tokens } = useTheme();
  if (ATOMS.length === 0) return null; // shot map not generated yet
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const columns = width > 760;

  const atom = ATOMS[index % ATOMS.length];
  const shots = LOOKS_SHOTS[atom.slug];
  const code = atom.entry?.examples[0]?.code;

  // Auto-advance unless the user prefers reduced motion; the arrows always work.
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ATOMS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  // A one-shot fade-in per swap (not a loop, so the web Animated driver is safe).
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reducedMotion) return;
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: Platform.OS !== "web" }).start();
  }, [index, reducedMotion, fade]);

  const step = (delta: number) => setIndex((i) => (i + delta + ATOMS.length) % ATOMS.length);

  return (
    <View style={{ gap: 20 }}>
      {/* Which atom is on stage, with manual controls. */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Button ghost small iconLeft={<Icon chevronLeft size={15} />} accessibilityLabel="Previous atom" onPress={() => step(-1)} />
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={{ fontFamily: geist("600"), fontSize: 17, letterSpacing: -0.17, color: tokens.foreground }}>{atom.name}</Text>
          <Text style={{ fontFamily: geistMono("400"), fontSize: 12, color: tokens["muted-foreground"] }}>
            {(index % ATOMS.length) + 1}/{ATOMS.length}
          </Text>
        </View>
        <Button ghost small iconLeft={<Icon chevronRight size={15} />} accessibilityLabel="Next atom" onPress={() => step(1)} />
      </View>

      {/* One phone pane per platform: three side-by-side columns on wide viewports,
          stacked when narrow. Each pane is an aspect-ratio container with an
          absolute-fill image (RNW ignores aspectRatio on an auto-height Image). */}
      <Animated.View style={{ opacity: fade, flexDirection: columns ? "row" : "column", gap: 16, width: "100%", maxWidth: 1040, alignSelf: "center" }}>
        {PLATFORMS.map((p) => (
          <View key={p.key} style={{ flex: columns ? 1 : undefined, width: columns ? undefined : "100%", minWidth: 0 }}>
            <Text style={{ fontFamily: geist("600"), fontSize: 11, letterSpacing: 0.55, textTransform: "uppercase", color: tokens["muted-foreground"], textAlign: "center" }}>
              {p.label}
            </Text>
            <Text style={{ fontFamily: geist("400"), fontSize: 11, color: tokens["muted-foreground"], textAlign: "center", marginBottom: 8, opacity: 0.7 }}>
              {p.device}
            </Text>
            <DeviceFrame variant={p.key} aspect={LOOKS_ASPECT} label={p.device}>
              <Image
                cover
                source={shots[p.key]}
                accessibilityLabel={`The ${atom.name} docs page as it renders on ${p.label}`}
                style={{ width: "100%", height: "100%" }}
              />
            </DeviceFrame>
          </View>
        ))}
      </Animated.View>

      <View style={{ alignItems: "center", gap: 18 }}>
        {code ? (
          <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.12), borderWidth: 1, borderColor: alpha(tokens.primary, 0.26), maxWidth: "100%" }}>
            <Text numberOfLines={1} style={{ fontFamily: geistMono("400"), fontSize: 12.5, color: tokens.primary }}>
              {codePreview(code)}
            </Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <Button primary large iconRight={<Icon arrowRight primaryForeground size={16} />} onPress={() => router.push("/components" as never)}>
            See every component live
          </Button>
          <Button outline large onPress={() => router.push(`/components/${atom.slug}` as never)}>
            Open {atom.name}
          </Button>
        </View>
      </View>
    </View>
  );
}
