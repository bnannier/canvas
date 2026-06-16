import { View, Text, useTheme, shadow } from "@olympusoss/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, MONO } from "../../ui/prose";
import { PageNav } from "../../ui/page-nav";

const SPACING = [4, 8, 12, 16, 20, 24, 32, 40];
const RADII = [
  { label: "sm", r: 4 },
  { label: "md", r: 6 },
  { label: "lg", r: 10 },
  { label: "xl", r: 16 },
  { label: "full", r: 999 },
];
const SHADOWS = ["sm", "md", "lg"] as const;

export default function SpacingScreen() {
  const { tokens } = useTheme();
  return (
    <Page>
      <PageHeader
        title="Spacing & Shape"
        description="A 4-point spacing ramp, a small set of corner radii, and three elevation levels — the rhythm and shape every component is built from."
      />

      <Section title="Spacing scale">
        <View style={{ gap: 8 }}>
          {SPACING.map((s) => (
            <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ width: 32, fontSize: 12, color: tokens["muted-foreground"], fontFamily: MONO }}>{s}</Text>
              <View style={{ height: 14, width: s * 4, backgroundColor: tokens.primary, borderRadius: 3 }} />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Radii">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {RADII.map((r) => (
            <View key={r.label} style={{ alignItems: "center", gap: 6 }}>
              <View
                style={{ height: 56, width: 56, backgroundColor: tokens.muted, borderWidth: 1, borderColor: tokens.border, borderRadius: r.r }}
              />
              <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>{r.label}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Shadows">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18, paddingVertical: 6 }}>
          {SHADOWS.map((s) => (
            <View
              key={s}
              style={{ height: 64, width: 96, borderRadius: 10, backgroundColor: tokens.card, alignItems: "center", justifyContent: "center", ...shadow(s) }}
            >
              <Text style={{ fontSize: 12, color: tokens.foreground }}>{s}</Text>
            </View>
          ))}
        </View>
      </Section>

      <PageNav />
    </Page>
  );
}
