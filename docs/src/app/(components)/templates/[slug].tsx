import { Redirect, useLocalSearchParams } from "expo-router";
import { getTemplate, getAllTemplates } from "docs-core/data/templates";
import { MockupDocPage } from "../../../ui/mockup-page";

export async function generateStaticParams() {
  return getAllTemplates().map((t) => ({ slug: t.slug }));
}

export default function TemplateScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const template = slug ? getTemplate(slug) : undefined;
  if (!template) return <Redirect href="/" />;
  return <MockupDocPage name={template.name} description={template.description} sections={template.sections} />;
}
