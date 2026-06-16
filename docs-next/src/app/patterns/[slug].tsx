import { Redirect, useLocalSearchParams } from "expo-router";
import { View, Text, useTheme } from "@olympusoss/canvas";
import { getPattern, getAllPatterns } from "docs-core/data/patterns";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P } from "../../ui/prose";
import { PageNav } from "../../ui/page-nav";

export async function generateStaticParams() {
  return getAllPatterns().map((p) => ({ slug: p.slug }));
}

export default function PatternScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { tokens } = useTheme();
  const pattern = slug ? getPattern(slug) : undefined;
  if (!pattern) return <Redirect href="/" />;

  return (
    <Page>
      <PageHeader title={pattern.name} description={pattern.description} />
      <View
        style={{ borderRadius: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.muted, padding: 12 }}
      >
        <Text style={{ fontSize: 12, lineHeight: 18, color: tokens["muted-foreground"] }}>
          This is a usage pattern — guidance built from the components on this site. The web docs render an interactive
          mockup for each section; here are the principles.
        </Text>
      </View>
      {pattern.sections.map((s, i) => (
        <Section key={i} title={s.title}>
          {s.description ? <P muted>{s.description}</P> : null}
          {s.anatomy ? (
            <Text style={{ fontSize: 12, lineHeight: 18, fontStyle: "italic", color: tokens["muted-foreground"] }}>
              {s.anatomy}
            </Text>
          ) : null}
        </Section>
      ))}
      <PageNav />
    </Page>
  );
}
