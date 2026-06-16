import { View, Text, useTheme } from "@olympusoss/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, MONO } from "../../ui/prose";
import { PageNav } from "../../ui/page-nav";

const SCALE: { role: string; size: number; weight: "400" | "500" | "600" | "700" | "800" }[] = [
  { role: "Display", size: 34, weight: "800" },
  { role: "Heading 1", size: 28, weight: "700" },
  { role: "Heading 2", size: 22, weight: "600" },
  { role: "Heading 3", size: 18, weight: "600" },
  { role: "Body", size: 15, weight: "400" },
  { role: "Small", size: 13, weight: "400" },
  { role: "Caption", size: 11, weight: "500" },
];

export default function TypographyScreen() {
  const { tokens } = useTheme();
  return (
    <Page>
      <PageHeader
        title="Typography"
        description="A single type scale for headings, body, and helper text. Native uses the system font; the web docs ship Geist."
      />

      <Section title="Type scale">
        <View style={{ gap: 18 }}>
          {SCALE.map((s) => (
            <View key={s.role} style={{ gap: 2 }}>
              <Text style={{ fontSize: 11, color: tokens["muted-foreground"], fontFamily: MONO }}>
                {s.role} · {s.size}/{s.weight}
              </Text>
              <Text style={{ fontSize: s.size, fontWeight: s.weight, color: tokens.foreground }}>
                The quick brown fox
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Monospace">
        <P muted>Used for code, IDs, and token names.</P>
        <Text style={{ fontFamily: MONO, fontSize: 14, color: tokens.foreground }}>const tokens = useTheme().tokens;</Text>
      </Section>

      <PageNav />
    </Page>
  );
}
