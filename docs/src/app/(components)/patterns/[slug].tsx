import { Redirect, useLocalSearchParams } from "expo-router";
import { getPattern, getAllPatterns } from "../../../core/data/patterns";
import { MockupDocPage } from "../../../ui/mockup-page";

export async function generateStaticParams() {
  return getAllPatterns().map((p) => ({ slug: p.slug }));
}

export default function PatternScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const pattern = slug ? getPattern(slug) : undefined;
  if (!pattern) return <Redirect href="/" />;
  return <MockupDocPage name={pattern.name} description={pattern.description} sections={pattern.sections} />;
}
