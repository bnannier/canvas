import { COMPONENTS } from "../core/data/components";

// The tier a component ships from, as the v4 hand-off tags it in the Library index and the
// detail header: the four atomic tiers of src/ (a component's `category`) plus the
// React Native primitives the kit re-exports unskinned, which the hand-off marks "P".
// `image` is not one of them: it graduated to a Canvas atom.
//
// Plain data with no React import, so the unit tests read it without a kit build.

export type Tier = "atom" | "molecule" | "organism" | "chart" | "primitive";

/** The slugs of the re-exported React Native primitives. */
export const PRIMITIVE_SLUGS: ReadonlySet<string> = new Set(["view", "text", "pressable", "text-input", "scroll-view"]);

const TIER_OF_CATEGORY = {
  Atoms: "atom",
  Molecules: "molecule",
  Organisms: "organism",
  Charts: "chart",
} as const satisfies Record<(typeof COMPONENTS)[number]["category"], Tier>;

/** Each tier's label, in the order the hand-off's legend reads. */
export const TIER_LABELS: Readonly<Record<Tier, string>> = {
  atom: "Atom",
  molecule: "Molecule",
  organism: "Organism",
  chart: "Chart",
  primitive: "Primitive",
};

const CATEGORY_OF = new Map(COMPONENTS.map((c) => [c.slug, c.category] as const));

/** A component's tier by its URL slug, or undefined for a slug the docs do not list. */
export function tierOf(slug: string): Tier | undefined {
  if (PRIMITIVE_SLUGS.has(slug)) return "primitive";
  const category = CATEGORY_OF.get(slug);
  return category ? TIER_OF_CATEGORY[category] : undefined;
}
