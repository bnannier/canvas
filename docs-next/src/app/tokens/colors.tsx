import { useWindowDimensions } from "react-native";
import { View, Text, useTheme, type ColorTokens } from "@olympusoss/canvas";
import { Page } from "../../ui/page";
import { PageNav } from "../../ui/page-nav";
import { CodeBlock } from "../../ui/code-block";
import { geist } from "../../ui/fonts";
import { alpha } from "../../ui/color";
import { TokenH1, TokenLede, TokenSection, Callout, Swatch, SwatchLabel, MonoCaption, GradientSwatch, Grid, Surface } from "../../ui/tokens-kit";

const SEMANTIC_PAIRS: { name: string; token: keyof ColorTokens; varName: string; light: string; dark: string }[] = [
  { name: "Background", token: "background", varName: "--background", light: "oklch(1 0 0)", dark: "oklch(0.141 0.005 285.823)" },
  { name: "Foreground", token: "foreground", varName: "--foreground", light: "oklch(0.141 0.005 285.823)", dark: "oklch(0.985 0 0)" },
  { name: "Card", token: "card", varName: "--card", light: "oklch(1 0 0)", dark: "oklch(0.21 0.006 285.885)" },
  { name: "Popover", token: "popover", varName: "--popover", light: "oklch(1 0 0)", dark: "oklch(0.21 0.006 285.885)" },
  { name: "Primary", token: "primary", varName: "--primary", light: "oklch(0.511 0.262 276.966)", dark: "oklch(0.585 0.233 277.117)" },
  { name: "Secondary", token: "secondary", varName: "--secondary", light: "oklch(0.967 0.001 286.375)", dark: "oklch(0.274 0.006 286.033)" },
  { name: "Muted", token: "muted", varName: "--muted", light: "oklch(0.967 0.001 286.375)", dark: "oklch(0.274 0.006 286.033)" },
  { name: "Accent", token: "accent", varName: "--accent", light: "oklch(0.967 0.001 286.375)", dark: "oklch(0.274 0.006 286.033)" },
  { name: "Destructive", token: "destructive", varName: "--destructive", light: "oklch(0.577 0.245 27.325)", dark: "oklch(0.704 0.191 22.216)" },
  { name: "Border", token: "border", varName: "--border", light: "oklch(0.92 0.004 286.32)", dark: "oklch(0.274 0.006 286.033)" },
  { name: "Input", token: "input", varName: "--input", light: "oklch(0.92 0.004 286.32)", dark: "oklch(0.274 0.006 286.033)" },
  { name: "Ring", token: "ring", varName: "--ring", light: "oklch(0.585 0.233 277.117)", dark: "oklch(0.585 0.233 277.117)" },
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

const hsl = (triplet: string) => `hsl(${triplet.replace(/ /g, ", ")})`;

const CSS_VARS = `:root {
  --primary: oklch(0.511 0.262 277);
  --background: oklch(1 0 0);
  /* … */
}
.dark {
  --primary: oklch(0.585 0.233 277);
  --background: oklch(0.141 0.005 285.8);
  /* … */
}`;
const THEME_BRIDGE = `@theme inline {
  --color-primary:    var(--primary);
  --color-background: var(--background);
  /* … */
}`;
const DYNAMIC = `<button className="bg-primary text-primary-foreground">Save</button>

// Same markup, different theme:
//   light → background-color: oklch(0.511 0.262 277)
//   dark  → background-color: oklch(0.585 0.233 277)
//   accent=teal → background-color: hsl(173 70% 42%)`;

function ColorPair({ row }: { row: typeof SEMANTIC_PAIRS[number] }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Swatch color={tokens[row.token]} height={80} />
      <View style={{ gap: 2 }}>
        <SwatchLabel>{row.name}</SwatchLabel>
        <MonoCaption size={11}>{row.varName}</MonoCaption>
        <View style={{ gap: 0 }}>
          <MonoCaption>L · {row.light}</MonoCaption>
          <MonoCaption>D · {row.dark}</MonoCaption>
        </View>
      </View>
    </View>
  );
}

function StatusCell({ s }: { s: typeof STATUS[number] }) {
  return (
    <View style={{ gap: 8 }}>
      <SwatchLabel>{s.name}</SwatchLabel>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["light", "dark"] as const).map((mode) => (
          <View key={mode} style={{ flex: 1, gap: 4 }}>
            <View style={{ height: 48, borderRadius: 6, borderWidth: 1, borderColor: "rgba(127,127,127,0.25)", backgroundColor: s[mode].bg, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: geist("500"), fontSize: 12, color: s[mode].fg }}>{mode === "light" ? "Light" : "Dark"}</Text>
            </View>
            <View>
              <MonoCaption>bg {s[mode].bg}</MonoCaption>
              <MonoCaption>fg {s[mode].fg}</MonoCaption>
            </View>
          </View>
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
  const { tokens, dark } = useTheme();
  const { width } = useWindowDimensions();
  const c6 = width >= 900 ? 6 : width >= 620 ? 3 : 2;
  const c5 = width >= 900 ? 5 : width >= 620 ? 3 : 2;
  const c2 = width >= 760 ? 2 : 1;

  return (
    <Page>
      <View style={{ gap: 40 }}>
        {/* Intro */}
        <View style={{ gap: 12 }}>
          <TokenH1>Colors & Theme</TokenH1>
          <TokenLede>
            Canvas uses a semantic token system. Every color is an oklch value bound to a CSS custom property. Tailwind utilities (bg-primary, text-muted-foreground, border-border, …) resolve through those vars via @theme inline, so switching themes is just rewriting the variables. On native, the same tokens ship as hex values read through useTheme().
          </TokenLede>
          <Callout label="Try this.">Toggle the surface or change the theme. Every swatch below reacts live.</Callout>
        </View>

        <TokenSection
          title="Semantic palette"
          description="The core token set. Every component reads from these, never from raw color literals."
          anatomy="Each token has a paired foreground for legible content on top (e.g. primary / primary-foreground). Use the pair together to guarantee contrast in both themes."
        >
          <Grid cols={c6}>{SEMANTIC_PAIRS.map((row) => <ColorPair key={row.varName} row={row} />)}</Grid>
        </TokenSection>

        <TokenSection
          title="Accent options"
          description="The default --primary is Indigo. Point --primary and --ring at any of these six curated hues to re-skin the whole system; they sit at similar perceived weight (chroma and lightness held roughly constant)."
          anatomy="Accents only override --primary and --ring. All foreground pairings are recalculated downstream via Tailwind's color-mix() opacity utilities, so you don't restate them per accent."
        >
          <Grid cols={c6}>
            {ACCENT_OPTIONS.map((a) => (
              <View key={a.name} style={{ gap: 8 }}>
                <Swatch color={`hsl(${a.h}, ${a.s}%, ${a.l}%)`} height={80} />
                <View style={{ gap: 2 }}>
                  <SwatchLabel>{a.name}</SwatchLabel>
                  <MonoCaption>hsl({a.h} {a.s}% {a.l}%)</MonoCaption>
                </View>
              </View>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection
          title="Semantic status colors"
          description="Five tones used by StatusBadge and inline alerts. Dark mode uses translucent backgrounds so they read on the deeper page palette without punching through."
        >
          <Grid cols={c5}>{STATUS.map((s) => <StatusCell key={s.name} s={s} />)}</Grid>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {STATUS_BADGES.map((b) => <StatusBadge key={b.label} label={b.label} i={b.i} />)}
          </View>
        </TokenSection>

        <TokenSection
          title="Chart palette"
          description="Five colors tuned for data viz, distinct enough at small marks (1-2px), no two adjacent hues vibrating. The dark-mode set is independently chosen (not just lightness-flipped) for the same readability bar."
        >
          <Grid cols={c5}>
            {CHART_PALETTE.map((ch) => (
              <View key={ch.varName} style={{ gap: 8 }}>
                <Swatch color={hsl(dark ? ch.dark : ch.light)} height={64} />
                <View style={{ gap: 2 }}>
                  <SwatchLabel>{ch.name}</SwatchLabel>
                  <MonoCaption size={11}>{ch.varName}</MonoCaption>
                  <View>
                    <MonoCaption>L · {ch.light}</MonoCaption>
                    <MonoCaption>D · {ch.dark}</MonoCaption>
                  </View>
                </View>
              </View>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection
          title="Brand colors"
          description="Reserved for brand moments: the avatar gradient, sign-in orbs, marketing splashes. Never used as component fills."
        >
          <Grid cols={c6}>
            {[
              ...BRAND.map((b) => (
                <View key={b.varName} style={{ gap: 8 }}>
                  <Swatch color={b.hex} height={80} />
                  <View style={{ gap: 2 }}>
                    <SwatchLabel>{b.name}</SwatchLabel>
                    <MonoCaption size={11}>{b.varName}</MonoCaption>
                    <MonoCaption>{b.hex}</MonoCaption>
                  </View>
                </View>
              )),
              <View key="avatar-gradient" style={{ gap: 8 }}>
                <GradientSwatch colors={["#6366f1", "#8b5cf6"]} height={80} />
                <View style={{ gap: 2 }}>
                  <SwatchLabel>Avatar gradient</SwatchLabel>
                  <MonoCaption size={11}>--orb-indigo → --orb-violet</MonoCaption>
                </View>
              </View>,
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
              <View key={g.label} style={{ gap: 8 }}>
                <GradientSwatch colors={g.grad} height={96}>
                  <View style={{ width: "62%", height: "56%", borderRadius: 6, backgroundColor: g.fill, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" }} />
                </GradientSwatch>
                <View style={{ gap: 2 }}>
                  <SwatchLabel>{g.label}</SwatchLabel>
                  <MonoCaption size={11}>{g.fill}</MonoCaption>
                </View>
              </View>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection
          title="How theming works"
          description="The same utility resolves to different values in different contexts. No re-skinning, no per-page overrides."
        >
          <Grid cols={c2}>
            {[
              <CodeCard key="1" title="1 · CSS variables (tokens.css)" code={CSS_VARS} />,
              <CodeCard key="2" title="2 · Tailwind theme bridge" code={THEME_BRIDGE} />,
            ]}
          </Grid>
          <Surface>
            <Text style={{ fontFamily: geist("600"), fontSize: 13, color: tokens.foreground, marginBottom: 8 }}>3 · Utilities resolve dynamically</Text>
            <CodeBlock code={DYNAMIC} />
            <Text style={{ fontFamily: geist("400"), fontSize: 12.5, lineHeight: 19, color: tokens["muted-foreground"], marginTop: 12 }}>
              The accent picker mutates --primary directly on {"<html>"}; because @theme inline preserves the var() reference (not the resolved value), every utility everywhere in the page reflows.
            </Text>
          </Surface>
        </TokenSection>

        {/* Don'ts */}
        <TokenSection title="Don'ts">
          <Grid cols={c2}>
            {[
              <View key="dont" style={{ borderRadius: 12, borderWidth: 1, borderColor: "hsla(0, 70%, 60%, 0.3)", backgroundColor: "hsla(0, 70%, 60%, 0.05)", padding: 20, gap: 8 }}>
                <Text style={{ fontFamily: geist("600"), fontSize: 13, color: tokens.destructive }}>Don't</Text>
                <CodeBlock code={`<button style={{ background: '#6366f1' }}>`} />
                <Text style={{ fontFamily: geist("400"), fontSize: 12.5, lineHeight: 19, color: tokens["muted-foreground"] }}>Hard-coded hex bypasses the theme. Won't follow accent changes; will look wrong in dark mode.</Text>
              </View>,
              <View key="do" style={{ borderRadius: 12, borderWidth: 1, borderColor: "hsla(143, 70%, 45%, 0.3)", backgroundColor: "hsla(143, 70%, 45%, 0.05)", padding: 20, gap: 8 }}>
                <Text style={{ fontFamily: geist("600"), fontSize: 13, color: "hsl(143, 60%, 38%)" }}>Do</Text>
                <CodeBlock code={`<button className="bg-primary text-primary-foreground">`} />
                <Text style={{ fontFamily: geist("400"), fontSize: 12.5, lineHeight: 19, color: tokens["muted-foreground"] }}>Always token-routed. Theme changes are free.</Text>
              </View>,
            ]}
          </Grid>
        </TokenSection>

        <PageNav />
      </View>
    </Page>
  );
}
