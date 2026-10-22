// Every documented Canvas component, grouped the way the kit is: atoms, molecules,
// organisms, charts. The list and each component's examples come from the docs app's
// generated modules (docs/src/core), so the smoke app covers exactly what the docs do.
import { COMPONENTS } from "../../../docs/src/core/data/components";
import { componentDocs } from "./docs";

export const CATEGORIES = ["Atoms", "Molecules", "Organisms", "Charts"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface CatalogComponent {
  slug: string;
  name: string;
  /** The docs module's source directory. */
  dir: string;
}

const documented = COMPONENTS
  .map((component) => ({ slug: component.slug, name: component.name, dir: component.dir ?? component.slug, category: component.category as string }))
  .filter((component) => componentDocs(component.dir) !== undefined);

export const CATALOG: { category: Category; components: CatalogComponent[] }[] = CATEGORIES.map((category) => ({
  category,
  components: documented
    .filter((component) => component.category === category)
    .map(({ slug, name, dir }) => ({ slug, name, dir }))
    .sort((a, b) => a.name.localeCompare(b.name)),
}));

export function findComponent(slug: string): CatalogComponent | undefined {
  for (const group of CATALOG) {
    const found = group.components.find((component) => component.slug === slug);
    if (found) return found;
  }
  return undefined;
}
