import { useWindowDimensions } from "react-native";
import { View, Text, useTheme } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { geist, geistMono } from "../../../ui/fonts";
import { TokenH1, TokenLede, TokenSection, Surface, Grid } from "../../../ui/tokens-kit";

// The Canvas type scale is the Typography component's roles. Each row mirrors a
// role on the Typography atom (src/atoms/typography/typography.tsx), whose
// `roleType` maps display..tiny to absolute, token-backed sizes, so the preview
// reflects the real package values rather than the docs site's own chrome. Note
// headings carry a flat -0.4px tracking (RN letterSpacing), not per-size em.
const SCALE = [
  { name: "Display", role: "display", spec: "48 / 48 · bold", fontSize: 48, lineHeight: 48, weight: "700" as const, tracking: -0.4, use: "Hero titles. One per screen, at most." },
  { name: "H1", role: "h1", spec: "36 / 40 · bold", fontSize: 36, lineHeight: 40, weight: "700" as const, tracking: -0.4, use: "Top-level page titles." },
  { name: "H2", role: "h2", spec: "30 / 36 · semibold", fontSize: 30, lineHeight: 36, weight: "600" as const, tracking: -0.4, use: "Major page sections." },
  { name: "H3", role: "h3", spec: "24 / 32 · semibold", fontSize: 24, lineHeight: 32, weight: "600" as const, tracking: -0.4, use: "Subsections; in-app page titles." },
  { name: "H4", role: "h4", spec: "20 / 28 · semibold", fontSize: 20, lineHeight: 28, weight: "600" as const, tracking: -0.4, use: "Card titles, dialog headings." },
  { name: "H5", role: "h5", spec: "18 / 28 · semibold", fontSize: 18, lineHeight: 28, weight: "600" as const, tracking: 0, use: "Subgroup headers, form section labels." },
  { name: "Body", role: "body", spec: "14 / 28 · regular", fontSize: 14, lineHeight: 28, weight: "400" as const, tracking: 0, use: "Default reading text." },
  { name: "Small", role: "small", spec: "14 / 20 · muted", fontSize: 14, lineHeight: 20, weight: "400" as const, tracking: 0, muted: true, use: "Secondary text, helpers." },
  { name: "Tiny", role: "tiny", spec: "12 / 16 · muted", fontSize: 12, lineHeight: 16, weight: "400" as const, tracking: 0, muted: true, use: "Metadata, timestamps, labels." },
];

// Helper roles beyond the size scale, also boolean props on Typography: a muted
// body, an uppercase caption/eyebrow, and two monospace roles (code carries the
// muted pill fill; mono is bare). These mirror roleType + roleColor in
// src/atoms/typography.
const HELPERS = [
  { name: "Muted", role: "muted", fontSize: 14, lineHeight: 20, sample: "Sphinx of black quartz, judge my vow.", use: "De-emphasised body text." },
  { name: "Caption", role: "caption", fontSize: 12, lineHeight: 16, uppercase: true, tracking: 0.4, sample: "Section label", use: "Eyebrows, uppercase section labels." },
  { name: "Code", role: "code", fontSize: 14, lineHeight: 20, mono: true, fill: true, sample: "--primary", use: "Inline code, tokens, IDs (muted pill)." },
  { name: "Mono", role: "mono", fontSize: 14, lineHeight: 20, mono: true, sample: "01HZK7M8N9P0Q1R2", use: "Monospace values, no fill." },
];

const WEIGHTS = [
  { w: "400" as const, name: "Regular", use: "Body text (the default role weight)" },
  { w: "500" as const, name: "Medium", use: "Labels, table values, buttons" },
  { w: "600" as const, name: "Semibold", use: "Headings h2-h5, card titles" },
  { w: "700" as const, name: "Bold", use: "Display and h1" },
];

// The uppercase eyebrow used by the font cards and the "Patterns in use" cards:
// 11px / 500 / 0.08em (= 0.88px at 11px) / uppercase / muted.
function Eyebrow({ children }: { children: string }) {
  const { tokens } = useTheme();
  return (
    <Text style={{ fontFamily: geist("500"), fontSize: 11, letterSpacing: 0.88, textTransform: "uppercase", color: tokens["muted-foreground"], marginBottom: 8 }}>
      {children}
    </Text>
  );
}

function FontCard({ varName, sample, sampleFamily, sampleTracking, caption, specimen, specimenMono }: {
  varName: string;
  sample: string;
  sampleFamily: string;
  sampleTracking: number;
  caption: string;
  specimen: string;
  specimenMono?: boolean;
}) {
  const { tokens } = useTheme();
  return (
    <Surface padding={24}>
      <Eyebrow>{varName}</Eyebrow>
      <Text style={{ fontFamily: sampleFamily, fontSize: 40, lineHeight: 40, letterSpacing: sampleTracking, color: tokens.foreground }}>
        {sample}
      </Text>
      <Text style={{ marginTop: 8, fontSize: 12.5, lineHeight: 17.5, fontFamily: geistMono("400"), color: tokens["muted-foreground"] }}>
        {caption}
      </Text>
      <Text style={{ marginTop: 16, fontSize: 14, lineHeight: 22.4, fontFamily: specimenMono ? geistMono("400") : geist("400"), color: tokens.foreground }}>
        {specimen}
      </Text>
      <Text style={{ marginTop: 12, fontSize: 12, lineHeight: 16.8, fontFamily: geist("400"), color: tokens["muted-foreground"] }}>
        Self-hosted variable font · weight 100-900.
      </Text>
    </Surface>
  );
}

function ScaleRow({ s, i }: { s: typeof SCALE[number]; i: number }) {
  const { tokens } = useTheme();
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "baseline",
      gap: 24,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderTopWidth: i ? 1 : 0,
      borderTopColor: tokens.border,
    }}>
      <View style={{ width: 140, flexShrink: 0 }}>
        <Text style={{ fontFamily: geist("500"), fontSize: 12.5, color: tokens.foreground }}>{s.name}</Text>
        <Text style={{ fontFamily: geistMono("400"), fontSize: 11, color: tokens["muted-foreground"] }}>{s.role}</Text>
      </View>
      <Text style={{
        flex: 1,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        fontFamily: geist(s.weight),
        letterSpacing: s.tracking,
        color: s.muted ? tokens["muted-foreground"] : tokens.foreground,
      }}>
        Sphinx of black quartz, judge my vow.
      </Text>
      <Text style={{ fontSize: 11, fontFamily: geistMono("400"), color: tokens["muted-foreground"], textAlign: "right", width: 160 }}>
        {s.spec}
      </Text>
    </View>
  );
}

function HelperRow({ h, i }: { h: typeof HELPERS[number]; i: number }) {
  const { tokens } = useTheme();
  const muted = h.role === "muted" || h.role === "caption";
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 24,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderTopWidth: i ? 1 : 0,
      borderTopColor: tokens.border,
    }}>
      <View style={{ width: 140, flexShrink: 0 }}>
        <Text style={{ fontFamily: geist("500"), fontSize: 12.5, color: tokens.foreground }}>{h.name}</Text>
        <Text style={{ fontFamily: geistMono("400"), fontSize: 11, color: tokens["muted-foreground"] }}>{h.role}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          alignSelf: "flex-start",
          fontSize: h.fontSize,
          lineHeight: h.lineHeight,
          fontFamily: h.mono ? geistMono("400") : geist("400"),
          textTransform: h.uppercase ? "uppercase" : undefined,
          letterSpacing: h.tracking,
          color: muted ? tokens["muted-foreground"] : tokens.foreground,
          backgroundColor: h.fill ? tokens.muted : undefined,
          borderRadius: h.fill ? 4 : undefined,
          paddingHorizontal: h.fill ? 6 : undefined,
          paddingVertical: h.fill ? 2 : undefined,
        }}>
          {h.sample}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: tokens["muted-foreground"], textAlign: "right", width: 220 }}>
        {h.use}
      </Text>
    </View>
  );
}

function WeightRow({ row, i }: { row: typeof WEIGHTS[number]; i: number }) {
  const { tokens } = useTheme();
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "baseline",
      gap: 24,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderTopWidth: i ? 1 : 0,
      borderTopColor: tokens.border,
    }}>
      <Text style={{ width: 100, flexShrink: 0, fontSize: 12.5, fontFamily: geistMono("400"), color: tokens["muted-foreground"] }}>
        {row.w}
      </Text>
      <Text style={{ flex: 1, fontSize: 20, fontFamily: geist(row.w), color: tokens.foreground }}>{row.name}</Text>
      <Text style={{ fontSize: 12, color: tokens["muted-foreground"] }}>{row.use}</Text>
    </View>
  );
}

export default function TypographyScreen() {
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();
  const c2 = width >= 760 ? 2 : 1;
  const cScale = width >= 620 ? 2 : 1;

  return (
    <Page>
      <View style={{ gap: 40 }}>
        {/* Intro */}
        <View style={{ gap: 12 }}>
          <TokenH1>Typography</TokenH1>
          <TokenLede>
            Two families do all the work. Geist Sans for prose and chrome; Geist Mono for code,
            IDs, timestamps, and any value the user might copy. The scale runs display down to tiny as
            boolean roles on the{" "}
            <Text style={{ fontFamily: geistMono("400") }}>Typography</Text> component; helper
            roles (muted, caption, code, mono) cover the rest.
          </TokenLede>
        </View>

        <TokenSection
          title="Font families"
          description="Two families, both self-hosted variable fonts. Upright only (no italics); one woff2 per family carries the full 100-900 weight range, so the network footprint stays honest."
        >
          <Grid cols={c2}>
            {[
              <FontCard
                key="sans"
                varName="--font-sans"
                sample="Geist"
                sampleFamily={geist("600")}
                sampleTracking={-0.8}
                caption={'"Geist", ui-sans-serif, system-ui, ...'}
                specimen="The quick brown fox jumps over the lazy dog 0123456789"
              />,
              <FontCard
                key="mono"
                varName="--font-mono"
                sample="Geist Mono"
                sampleFamily={geistMono("600")}
                sampleTracking={-0.4}
                caption={'"Geist Mono", ui-monospace, monospace'}
                specimen={'const id = "01HZ73K..." // copy-friendly digits'}
                specimenMono
              />,
            ]}
          </Grid>
        </TokenSection>

        <TokenSection
          title="Type scale"
          description="Each role pairs a size with a line-height. Select one with a boolean prop on Typography (e.g. <Typography h2>), never a raw font-size."
          anatomy="display (48/48) and h1 (36/40) are distinct roles, not a shared rule; h3 doubles as the in-app page title. Roles are mutually exclusive, first-match precedence."
        >
          <Surface padding={0} style={{ overflow: "hidden" }}>
            {SCALE.map((s, i) => <ScaleRow key={s.role} s={s} i={i} />)}
          </Surface>
          <Grid cols={cScale} gap={12}>
            {SCALE.map((s) => (
              <View key={s.role} style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ fontSize: 12.5, fontFamily: geistMono("400"), color: tokens.foreground }}>{s.role}</Text>
                <Text style={{ fontSize: 12.5, color: tokens["muted-foreground"] }}>· {s.use}</Text>
              </View>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection
          title="Helper roles"
          description="Beyond the size scale, four roles handle muted text, eyebrows, and monospace values. Pick one with a boolean prop on Typography (e.g. <Typography caption>)."
        >
          <Surface padding={0} style={{ overflow: "hidden" }}>
            {HELPERS.map((h, i) => <HelperRow key={h.role} h={h} i={i} />)}
          </Surface>
        </TokenSection>

        <TokenSection title="Weights" description="Variable axis; every integer 100-900 is available but we use four.">
          <Surface padding={0} style={{ overflow: "hidden" }}>
            {WEIGHTS.map((row, i) => <WeightRow key={row.w} row={row} i={i} />)}
          </Surface>
        </TokenSection>

        <TokenSection title="Patterns in use">
          <Grid cols={c2}>
            {[
              <Surface key="header" padding={20}>
                <Eyebrow>Page header</Eyebrow>
                <Text style={{ fontSize: 22, fontFamily: geist("600"), letterSpacing: -0.44, color: tokens.foreground }}>Identities</Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: tokens["muted-foreground"] }}>
                  Manage user identities in your identity service
                </Text>
              </Surface>,
              <Surface key="stat" padding={20}>
                <Eyebrow>Stat card</Eyebrow>
                <Text style={{ fontSize: 13, fontFamily: geist("500"), color: tokens["muted-foreground"] }}>Active sessions</Text>
                <Text style={{ fontSize: 28, fontFamily: geist("600"), letterSpacing: -0.56, marginTop: 4, color: tokens.foreground }}>1,204</Text>
              </Surface>,
              <Surface key="field" padding={20}>
                <Eyebrow>Field display</Eyebrow>
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12 }}>
                    <Text style={{ width: 120, fontSize: 13, fontFamily: geist("500"), color: tokens["muted-foreground"] }}>Identifier</Text>
                    <Text style={{ flex: 1, fontSize: 13, color: tokens.foreground }}>rachel.chen@example.com</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12 }}>
                    <Text style={{ width: 120, fontSize: 13, fontFamily: geist("500"), color: tokens["muted-foreground"] }}>ID</Text>
                    <Text style={{ flex: 1, fontSize: 13, fontFamily: geistMono("400"), color: tokens.foreground }}>01HZK7M8N9P0Q1R2S3T4U5V6W7</Text>
                  </View>
                </View>
              </Surface>,
              <Surface key="code" padding={20}>
                <Eyebrow>Inline code</Eyebrow>
                <Text style={{ fontSize: 13.5, lineHeight: 21.6, color: tokens.foreground }}>
                  The token <Text style={{ fontFamily: geistMono("400") }}>--primary</Text> drives the accent; override it on{" "}
                  <Text style={{ fontFamily: geistMono("400") }}>{"<html>"}</Text> to retint on the web.
                </Text>
              </Surface>,
            ]}
          </Grid>
        </TokenSection>

        <PageNav />
      </View>
    </Page>
  );
}
