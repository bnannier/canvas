import { COMPONENTS } from "../../../../core/data/components";
import { ComponentReference } from "../../../../ui/component-reference";

// Pre-render one static HTML page per component for the web export (the default example).
export async function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }));
}

// /components/<slug> — the component reference at its default example.
export default function ComponentScreen() {
  return <ComponentReference />;
}
