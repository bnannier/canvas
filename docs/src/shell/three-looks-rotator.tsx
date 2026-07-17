import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, useWindowDimensions } from "react-native";
import { View, Text, Button, Icon, OverlayProvider, useTheme, useReducedMotion } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { COMPONENTS } from "../core/data/components";
import { COMPONENT_DOCS } from "../core/registry";
import { buildScopes } from "../core/build-scopes";
import { ExampleErrorBoundary, FitStage } from "../ui/playground";
import { DocsSurface } from "../ui/surface";
import { geist, geistMono } from "../ui/fonts";
import { alpha } from "../ui/color";

// The landing page's live comparison hero: rotates alphabetically through every
// Atom that has a live example, rendering the SAME first example through the
// playground's per-platform scopes — the web build shows the iOS / Android / Web
// skins side by side, a device shows its own skin (you are the platform). Live
// components, not screenshots, so new atoms join the rotation automatically and
// the "Open <Atom>" CTA below always targets the atom on stage.
const INTERVAL_MS = 4000;

const ATOMS = COMPONENTS.filter((c) => c.category === "Atoms")
  .map((c) => ({ ...c, entry: COMPONENT_DOCS[c.dir ?? c.slug] }))
  .filter((c) => c.entry && c.entry.examples.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

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
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const columns = width > 920;

  const atom = ATOMS[index % ATOMS.length];
  const example = atom.entry!.examples[0];
  const scopes = useMemo(() => buildScopes(tokens), [tokens]);

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

      {/* One card per platform scope: three side-by-side columns on wide web,
          stacked when narrow, a single device card on native. One overlay host
          around the whole stage (the playground's rule) so open menus float.
          The provider's positioning wrapper defaults to flex:1 (app-root fill);
          inside a ScrollView's content column that collapses the native scroll
          range, so cancel every flex axis and stay content-sized. */}
      <OverlayProvider style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "100%" }}>
        <Animated.View style={{ opacity: fade, flexDirection: columns ? "row" : "column", gap: 16 }}>
          {scopes.map((p) => (
            <DocsSurface
              key={p.platform}
              fill="card"
              // A content-sized GlassSurface (no width/height/flex) collapses to 0 on
              // native, so the stacked layout pins the card to the full row width.
              style={{ flex: columns ? 1 : undefined, width: columns ? undefined : "100%", minWidth: 0, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, overflow: "hidden" }}
            >
              <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.28) }}>
                <Text style={{ fontFamily: geist("600"), fontSize: 11, letterSpacing: 0.55, textTransform: "uppercase", color: tokens["muted-foreground"], textAlign: "center" }}>
                  {p.label}
                </Text>
              </View>
              <View style={{ minHeight: 150, alignItems: "center", justifyContent: "center", paddingVertical: 22, paddingHorizontal: 20 }}>
                {/* Remount per atom so stateful examples reset cleanly. */}
                <ExampleErrorBoundary key={`${atom.slug}:${p.platform}`}>
                  <FitStage>{example.render(p.scope)}</FitStage>
                </ExampleErrorBoundary>
              </View>
            </DocsSurface>
          ))}
        </Animated.View>
      </OverlayProvider>

      <View style={{ alignItems: "center", gap: 18 }}>
        <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.12), borderWidth: 1, borderColor: alpha(tokens.primary, 0.26), maxWidth: "100%" }}>
          <Text numberOfLines={1} style={{ fontFamily: geistMono("400"), fontSize: 12.5, color: tokens.primary }}>
            {codePreview(example.code)}
          </Text>
        </View>
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
