import { COMPONENTS } from "../../../../core/data/components";
import { COMPONENT_DOCS } from "../../../../core/registry";
import { ComponentReference } from "../../../../ui/component-reference";
import { variantSlug } from "../../../../lib/variant";

// Pre-render one static HTML page per non-default component example for the web export.
// Index 0 (the default) is served by the bare component URL (./index), so it is excluded
// here to keep one canonical URL per variant.
export async function generateStaticParams() {
  const params: { slug: string; variant: string }[] = [];
  for (const c of COMPONENTS) {
    const entry = COMPONENT_DOCS[c.dir ?? c.slug];
    entry?.examples.forEach((e, i) => {
      if (i > 0) params.push({ slug: c.slug, variant: variantSlug(e.label) });
    });
  }
  return params;
}

// /components/<slug>/<variant> — the component reference deep-linked to one example.
export default function ComponentVariantScreen() {
  return <ComponentReference />;
}
