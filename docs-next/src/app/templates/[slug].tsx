import { Redirect, useLocalSearchParams } from "expo-router";
import { View, Text, useTheme } from "@olympusoss/canvas";
import { getTemplate, getAllTemplates } from "docs-core/data/templates";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P } from "../../ui/prose";
import { PageNav } from "../../ui/page-nav";

export async function generateStaticParams() {
  return getAllTemplates().map((t) => ({ slug: t.slug }));
}

export default function TemplateScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { tokens } = useTheme();
  const template = slug ? getTemplate(slug) : undefined;
  if (!template) return <Redirect href="/" />;

  return (
    <Page>
      <PageHeader title={template.name} description={template.description} />
      <View
        style={{ borderRadius: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.muted, padding: 12 }}
      >
        <Text style={{ fontSize: 12, lineHeight: 18, color: tokens["muted-foreground"] }}>
          A full-screen template assembled from Canvas components. The web docs render a live mockup of each section; here
          are the anatomy notes.
        </Text>
      </View>
      {template.sections.map((s, i) => (
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
