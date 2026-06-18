import { Redirect, useLocalSearchParams } from "expo-router";
import { View, Text, useTheme } from "@olympusoss/canvas";
import { COMPONENTS, getComponent } from "docs-core/data/components";
import { COMPONENT_DOCS } from "docs-core/registry";
import { Page } from "../../../ui/page";
import { Lead } from "../../../ui/prose";
import { Playground } from "../../../ui/playground";
import { Donts } from "../../../ui/dont";
import { PageNav } from "../../../ui/page-nav";
import { stripHtml } from "../../../lib/html";
import { geist } from "../../../ui/fonts";

// Pre-render one static HTML page per component for the web export.
export async function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

export default function ComponentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { tokens } = useTheme();
  const comp = slug ? getComponent(slug) : undefined;
  if (!comp) return <Redirect href="/components" />;

  const entry = COMPONENT_DOCS[comp.dir ?? comp.slug];

  return (
    <Page>
      {/* Component pages use a larger title (28/700) than the generic page header. */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: geist("700"), fontSize: 28, letterSpacing: -0.42, color: tokens.foreground }}>{comp.name}</Text>
        <Lead>{stripHtml(comp.description)}</Lead>
      </View>
      {entry && entry.examples.length > 0 ? (
        <Playground examples={entry.examples} />
      ) : (
        <View style={{ borderRadius: 10, borderWidth: 1, borderColor: tokens.border, padding: 16 }}>
          <Text style={{ fontSize: 13, color: tokens["muted-foreground"] }}>
            No live examples for this component yet.
          </Text>
        </View>
      )}
      {entry && entry.donts.length > 0 ? <Donts donts={entry.donts} /> : null}
      <PageNav />
    </Page>
  );
}
