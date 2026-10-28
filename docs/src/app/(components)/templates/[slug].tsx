import { Redirect, useLocalSearchParams } from "expo-router";
import { getTemplate, getAllTemplates } from "../../../core/data/templates";
import { TemplatesExplorer } from "../../../ui/templates/explorer";

export async function generateStaticParams() {
  return getAllTemplates().map((t) => ({ slug: t.slug }));
}

// One template's page: the Templates explorer open on it (docs/src/ui/templates/explorer.tsx).
export default function TemplateScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  if (!slug || !getTemplate(slug)) return <Redirect href="/templates" />;
  return <TemplatesExplorer slug={slug} />;
}
