import { useWindowDimensions } from "react-native";
import { View, Text, useTheme, colorsByScheme, type ColorTokens } from "@olympusoss/canvas";
import { Page } from "../../ui/page";
import { PageNav } from "../../ui/page-nav";
import { CodeBlock } from "../../ui/code-block";
import { geist } from "../../ui/fonts";
import { alpha, hslToHex, hslTripletToHex, colorFormats } from "../../ui/color";
import { TokenH1, TokenLede, TokenSection, Callout, SwatchCard, SwatchLabel, MonoRows, GradientFill, Grid, Surface } from "../../ui/tokens-kit";

// Semantic tokens. Values are not stored here: every notation is derived from the
// hex the kit actually ships (colorsByScheme) so all three stay mutually consistent.
const SEMANTIC_PAIRS: { name: string; token: keyof ColorTokens; varName: string }[] = [
  { name: "Background", token: "background", varName: "--background" },
  { name: "Foreground", token: "foreground", varName: "--foreground" },
  { name: "Card", token: "card", varName: "--card" },
  { name: "Popover", token: "popover", varName: "--popover" },
  { name: "Primary", token: "primary", varName: "--primary" },
  { name: "Secondary", token: "secondary", varName: "--secondary" },
  { name: "Muted", token: "muted", varName: "--muted" },
  { name: "Accent", token: "accent", varName: "--accent" },
  { name: "Destructive", token: "destructive", varName: "--destructive" },
  { name: "Border", token: "border", varName: "--border" },
  { name: "Input", token: "input", varName: "--input" },
  { name: "Ring", token: "ring", varName: "--ring" },
];

const ACCENT_OPTIONS = [
  { name: "Indigo (default)", h: 240, s: 79, l: 60 },
  { name: "Violet", h: 271, s: 70, l: 60 },
  { name: "Teal", h: 173, s: 70, l: 42 },
  { name: "Rose", h: 346, s: 78, l: 58 },
  { name: "Amber", h: 38, s: 92, l: 50 },
  { name: "Slate", h: 215, s: 16, l: 38 },
];

const STATUS = [
  { name: "Success", light: { bg: "#dcfce7", fg: "#166534" }, dark: { bg: "rgba(20,83,45,0.3)", fg: "#4ade80" } },
  { name: "Warning", light: { bg: "#fef9c3", fg: "#854d0e" }, dark: { bg: "rgba(113,63,18,0.3)", fg: "#facc15" } },
  { name: "Error", light: { bg: "#fee2e2", fg: "#991b1b" }, dark: { bg: "rgba(127,29,29,0.3)", fg: "#f87171" } },
  { name: "Info", light: { bg: "#dbeafe", fg: "#1e40af" }, dark: { bg: "rgba(30,58,138,0.3)", fg: "#60a5fa" } },
  { name: "Neutral", light: { bg: "#f4f4f5", fg: "#3f3f46" }, dark: { bg: "rgba(63,63,70,0.3)", fg: "#a1a1aa" } },
];

const STATUS_BADGES = [
  { label: "Active", i: 0 }, { label: "Pending", i: 1 }, { label: "Failed", i: 2 }, { label: "Info", i: 3 }, { label: "Inactive", i: 4 },
];

const CHART_PALETTE = [
  { name: "Chart 1", varName: "--chart-1", light: "12 76% 61%", dark: "220 70% 50%" },
  { name: "Chart 2", varName: "--chart-2", light: "173 58% 39%", dark: "160 60% 45%" },
  { name: "Chart 3", varName: "--chart-3", light: "197 37% 24%", dark: "30 80% 55%" },
  { name: "Chart 4", varName: "--chart-4", light: "43 74% 66%", dark: "280 65% 60%" },
  { name: "Chart 5", varName: "--chart-5", light: "27 87% 67%", dark: "340 75% 55%" },
];

const BRAND = [
  { name: "Orb Indigo", hex: "#6366f1", varName: "--orb-indigo" },
  { name: "Orb Violet", hex: "#8b5cf6", varName: "--orb-violet" },
  { name: "Orb Cyan", hex: "#06b6d4", varName: "--orb-cyan" },
];


const TOKENS_SRC = `// tokens.ts — plain JS values, RN-usable (no CSS, no DOM)
export const lightColors = {
  primary: "#4f46e5",
  background: "#ffffff",
  // …
};
export const darkColors = {
  primary: "#6366f1",
  background: "#09090b",
  // …
};`;
const THEME_RUNTIME = `// ThemeProvider supplies the active scheme;
// components read it through useTheme().
const { tokens } = useTheme();

tokens.primary; // "#4f46e5" light · "#6366f1" dark`;
const DYNAMIC = `<Button primary>Save</Button>

// You set the look with a prop, never a class. The skin
// builds { backgroundColor: tokens.primary }, so one prop
// resolves live per theme — no restyling:
//   light       → #4f46e5
//   dark        → #6366f1
//   teal accent → #20b6a5`;

function ColorPair({ row }: { row: typeof SEMANTIC_PAIRS[number] }) {
  const light = colorsByScheme.light[row.token];
  const dark = colorsByScheme.dark[row.token];
  return (
    <SwatchCard label={row.name} split={{ light, dark }} height={80}>
      <MonoRows
        varName={row.varName}
        groups={[
          { label: "L", lines: colorFormats(light) },
          { label: "D", lines: colorFormats(dark) },
        ]}
      />
    </SwatchCard>
  );
}

function StatusCell({ s }: { s: typeof STATUS[number] }) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <SwatchLabel>{s.name}</SwatchLabel>
      <View style={{ flex: 1, flexDirection: "row", gap: 8 }}>
        {(["light", "dark"] as const).map((mode) => (
          <SwatchCard
            key={mode}
            top={
              <View style={{ height: 48, backgroundColor: s[mode].bg, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: geist("500"), fontSize: 12, color: s[mode].fg }}>{mode === "light" ? "Light" : "Dark"}</Text>
              </View>
            }
          >
            <MonoRows groups={[{ label: "bg", lines: colorFormats(s[mode].bg) }, { label: "fg", lines: colorFormats(s[mode].fg) }]} />
          </SwatchCard>
        ))}
      </View>
    </View>
  );
}

// Matches the Vite `.status-badge`: a pill with a TRANSPARENT fill, a 1px tone-tinted
// border, and a tone-colored dot + label (brighter tone in dark mode), not a solid fill.
function StatusBadge({ label, i }: { label: string; i: number }) {
  const { dark } = useTheme();
  const tone = dark ? STATUS[i].dark.fg : STATUS[i].light.fg;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 9999, borderWidth: 1, borderColor: alpha(tone, 0.3), backgroundColor: "transparent" }}>
      <View style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: tone }} />
      <Text style={{ fontFamily: geist("500"), fontSize: 12, color: tone }}>{label}</Text>
    </View>
  );
}

function CodeCard({ title, code }: { title: string; code: string }) {
  const { tokens } = useTheme();
  return (
    <Surface>
      <Text style={{ fontFamily: geist("600"), fontSize: 13, color: tokens.foreground, marginBottom: 8 }}>{title}</Text>
      <CodeBlock code={code} />
    </Surface>
  );
}

export default function ColorsScreen() {
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();
  // One shared 5-column grid for every swatch section, so columns align down the
  // whole page and the cards stay wide enough that the oklch/hex codes never wrap.
  const c5 = width >= 900 ? 5 : width >= 620 ? 3 : 2;
  // Status tones are wide (a Light + Dark card each), so they sit 3 per row:
  // Success / Warning / Error, then Info / Neutral.
  const c3 = width >= 880 ? 3 : width >= 560 ? 2 : 1;
  const c2 = width >= 760 ? 2 : 1;

  return (
    <Page>
      <View style={{ gap: 40 }}>
        {/* Intro */}
        <View style={{ gap: 12 }}>
          <TokenH1>Colors & Theme</TokenH1>
          <TokenLede>
            Canvas uses a semantic token system. Every color is a named token (primary, muted-foreground, border, …) that ships as a plain value per scheme. Components read the active set through useTheme() and build their React Native styles from it, so the same code themes correctly on iOS, Android, and the web, with no CSS variables and no per-platform fork. You never touch the values directly: you pick a component's look with semantic boolean props.
          </TokenLede>
          <Callout label="Try this.">Toggle the surface or change the theme. Every swatch below reacts live.</Callout>
        </View>

        <TokenSection
          title="Semantic palette"
          description="The core token set. Every component reads from these, never from raw color literals."
          anatomy="Each token has a paired foreground for legible content on top (e.g. primary / primary-foreground). Use the pair together to guarantee contrast in both themes."
        >
          <Grid cols={c5}>{SEMANTIC_PAIRS.map((row) => <ColorPair key={row.varName} row={row} />)}</Grid>
        </TokenSection>

        <TokenSection
          title="Accent options"
          description="The default --primary is Indigo. Point --primary and --ring at any of these six curated hues to re-skin the whole system; they sit at similar perceived weight (chroma and lightness held roughly constant)."
          anatomy="Accents only override --primary and --ring. All foreground pairings are recalculated downstream via Tailwind's color-mix() opacity utilities, so you don't restate them per accent."
        >
          <Grid cols={c5}>
            {ACCENT_OPTIONS.map((a) => (
              <SwatchCard key={a.name} label={a.name} color={`hsl(${a.h}, ${a.s}%, ${a.l}%)`} height={80}>
                <MonoRows groups={[{ lines: colorFormats(hslToHex(a.h, a.s, a.l)) }]} />
              </SwatchCard>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection
          title="Semantic status colors"
          description="Five tones used by StatusBadge and inline alerts. Dark mode uses translucent backgrounds so they read on the deeper page palette without punching through."
        >
          <Grid cols={c3}>{STATUS.map((s) => <StatusCell key={s.name} s={s} />)}</Grid>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {STATUS_BADGES.map((b) => <StatusBadge key={b.label} label={b.label} i={b.i} />)}
          </View>
        </TokenSection>

        <TokenSection
          title="Chart palette"
          description="Five colors tuned for data viz, distinct enough at small marks (1-2px), no two adjacent hues vibrating. The dark-mode set is independently chosen (not just lightness-flipped) for the same readability bar."
        >
          <Grid cols={c5}>
            {CHART_PALETTE.map((ch) => {
              const light = hslTripletToHex(ch.light);
              const dark = hslTripletToHex(ch.dark);
              return (
                <SwatchCard key={ch.varName} label={ch.name} split={{ light, dark }} height={64}>
                  <MonoRows
                    varName={ch.varName}
                    groups={[
                      { label: "L", lines: colorFormats(light) },
                      { label: "D", lines: colorFormats(dark) },
                    ]}
                  />
                </SwatchCard>
              );
            })}
          </Grid>
        </TokenSection>

        <TokenSection
          title="Brand colors"
          description="Reserved for brand moments: the avatar gradient, sign-in orbs, marketing splashes. Never used as component fills."
        >
          <Grid cols={c5}>
            {[
              ...BRAND.map((b) => (
                <SwatchCard key={b.varName} label={b.name} color={b.hex} height={80}>
                  <MonoRows varName={b.varName} groups={[{ lines: colorFormats(b.hex) }]} />
                </SwatchCard>
              )),
              <SwatchCard key="avatar-gradient" label="Avatar gradient" top={<GradientFill colors={["#6366f1", "#8b5cf6"]} height={80} />}>
                <MonoRows groups={[{ lines: ["--orb-indigo → --orb-violet"] }]} />
              </SwatchCard>,
            ]}
          </Grid>
        </TokenSection>

        <TokenSection
          title="Glass surface"
          description={`Canvas ships a glass surface mode: set surface="glass" on the ThemeProvider, or call setSurface("glass") on the web (it sets data-surface="glass" on <html>). Following Apple's Liquid Glass model, only the functional layer goes translucent.`}
          anatomy={`Glass overrides exactly one token: popover. Light becomes rgba(255, 255, 255, 0.72); dark becomes rgba(30, 30, 34, 0.66). The card token stays solid, so content surfaces (cards, lists, tables, charts) never turn to glass; only popover-backed overlays (popovers, menus, dropdowns, selects, dialogs, sheets, command) and the navbar/sidebar shells read as glass.`}
        >
          <Grid cols={c2}>
            {[
              { label: "Light · popover", fill: "rgba(255, 255, 255, 0.72)", grad: ["#6366f1", "#06b6d4"] as [string, string] },
              { label: "Dark · popover", fill: "rgba(30, 30, 34, 0.66)", grad: ["#8b5cf6", "#6366f1"] as [string, string] },
            ].map((g) => (
              <SwatchCard
                key={g.label}
                label={g.label}
                top={
                  <GradientFill colors={g.grad} height={96}>
                    <View style={{ width: "62%", height: "56%", borderRadius: 6, backgroundColor: g.fill, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" }} />
                  </GradientFill>
                }
              >
                <MonoRows groups={[{ lines: colorFormats(g.fill) }]} />
              </SwatchCard>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection
          title="How theming works"
          description="You change a component's look with semantic boolean props. Each one resolves through the active scheme's tokens, so the same markup renders correctly in every theme and accent, with no re-skinning and no per-call overrides."
        >
          <Grid cols={c2}>
            {[
              <CodeCard key="1" title="1 · Tokens (tokens.ts)" code={TOKENS_SRC} />,
              <CodeCard key="2" title="2 · The theme runtime (useTheme)" code={THEME_RUNTIME} />,
            ]}
          </Grid>
          <Surface>
            <Text style={{ fontFamily: geist("600"), fontSize: 13, color: tokens.foreground, marginBottom: 8 }}>3 · One prop, resolved live</Text>
            <CodeBlock code={DYNAMIC} />
            <Text style={{ fontFamily: geist("400"), fontSize: 12.5, lineHeight: 19, color: tokens["muted-foreground"], marginTop: 12 }}>
              The {"`primary`"} prop is the whole styling API; the button reads {"`tokens.primary`"} from useTheme(). Switch the scheme or point the accent at a new hue and the ThemeProvider swaps the token set, so every component bound to it re-renders with the new color. No classes, no CSS variables.
            </Text>
          </Surface>
        </TokenSection>

        {/* Don'ts */}
        <TokenSection title="Don'ts">
          <Grid cols={c2}>
            {[
              <View key="dont" style={{ borderRadius: 12, borderWidth: 1, borderColor: "hsla(0, 70%, 60%, 0.3)", backgroundColor: "hsla(0, 70%, 60%, 0.05)", padding: 20, gap: 8 }}>
                <Text style={{ fontFamily: geist("600"), fontSize: 13, color: tokens.destructive }}>Don't</Text>
                <CodeBlock code={`<View style={{ backgroundColor: "#6366f1" }}>`} />
                <Text style={{ fontFamily: geist("400"), fontSize: 12.5, lineHeight: 19, color: tokens["muted-foreground"] }}>A hard-coded hex bypasses the theme. Won't follow accent changes; will look wrong in dark mode.</Text>
              </View>,
              <View key="do" style={{ borderRadius: 12, borderWidth: 1, borderColor: "hsla(143, 70%, 45%, 0.3)", backgroundColor: "hsla(143, 70%, 45%, 0.05)", padding: 20, gap: 8 }}>
                <Text style={{ fontFamily: geist("600"), fontSize: 13, color: "hsl(143, 60%, 38%)" }}>Do</Text>
                <CodeBlock code={`<Button primary>Save</Button>`} />
                <Text style={{ fontFamily: geist("400"), fontSize: 12.5, lineHeight: 19, color: tokens["muted-foreground"] }}>The semantic prop is token-routed through useTheme(). Theme and accent changes are free.</Text>
              </View>,
            ]}
          </Grid>
        </TokenSection>

        <PageNav />
      </View>
    </Page>
  );
}
