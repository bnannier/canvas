// The URL segment for a Playground example: its label lowercased with every
// non-alphanumeric character removed. "Nested group" -> "nestedgroup",
// "Default" -> "default", "With description" -> "withdescription". This is the deep-link
// form used by /components/<slug>/<variant> to name one example on a component page.
//
// Matching is per-component, so only collisions within a single component's example set
// would be ambiguous; labels are short and distinct, and the consumer resolves by
// first match, so the earliest example wins a shared slug.
export function variantSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
