import { View, Text, useTheme, type ColorTokens } from "@olympusoss/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, InlineCode } from "../../ui/prose";
import { PageNav } from "../../ui/page-nav";

const PAIRS: { bg: keyof ColorTokens; fg: keyof ColorTokens; label: string }[] = [
  { bg: "background", fg: "foreground", label: "Background / Foreground" },
  { bg: "card", fg: "card-foreground", label: "Card" },
  { bg: "popover", fg: "popover-foreground", label: "Popover" },
  { bg: "primary", fg: "primary-foreground", label: "Primary" },
  { bg: "secondary", fg: "secondary-foreground", label: "Secondary" },
  { bg: "muted", fg: "muted-foreground", label: "Muted" },
  { bg: "accent", fg: "accent-foreground", label: "Accent" },
  { bg: "destructive", fg: "destructive-foreground", label: "Destructive" },
];

const SINGLES: (keyof ColorTokens)[] = ["border", "input", "ring"];

function Swatch({ name, color, sampleOn }: { name: string; color: string; sampleOn?: string }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          height: 56,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: tokens.border,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {sampleOn ? <Text style={{ color: sampleOn, fontSize: 13, fontWeight: "600" }}>Aa</Text> : null}
      </View>
      <Text style={{ fontSize: 12, color: tokens.foreground }}>{name}</Text>
    </View>
  );
}

export default function ColorsScreen() {
  const { tokens } = useTheme();
  return (
    <Page>
      <PageHeader
        title="Colors & Theme"
        description="Semantic color tokens that flow from the active scheme and surface. Components paint with these, never raw hex."
      />

      <Section title="Semantic pairs">
        <P muted>
          Each surface pairs a fill with a readable foreground. Use <InlineCode>useTheme()</InlineCode> to read{" "}
          <InlineCode>tokens</InlineCode> and build RN style objects.
        </P>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {PAIRS.map((p) => (
            <View key={p.label} style={{ width: 150, gap: 4 }}>
              <Swatch name={p.label} color={tokens[p.bg]} sampleOn={tokens[p.fg]} />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Lines & focus">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {SINGLES.map((k) => (
            <View key={k} style={{ width: 150 }}>
              <Swatch name={k} color={tokens[k]} />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Scheme & surface">
        <P muted>
          Toggle light / dark and Solid / Glass from the top bar — every token above (and every component) updates live.
          Glass makes the functional surfaces (popover, bars, overlays) translucent; content surfaces stay solid.
        </P>
      </Section>

      <PageNav />
    </Page>
  );
}
