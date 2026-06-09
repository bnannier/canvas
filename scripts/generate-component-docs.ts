// Generate a co-located example doc for every component: src/<level>/<name>/<name>.md
//
//   bun scripts/generate-component-docs.ts
//
// The markdown is derived from the same docs data the site renders, so the
// examples never drift: the description and category come from the component
// registry, the Usage block is the playground's default real-component JSX
// (a composite TREES tree, else the entry's mapProps over the default state),
// and the Do/Don'ts are the El trees from donts.ts. All of this runs headless
// because the imported modules are pure data + pure functions (serializeTree /
// propsToJsx / the prop-mappers) with only erased `import type` references — no
// @olympusoss/canvas component is loaded.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COMPONENTS } from "../docs/src/data/components.ts";
import { DONTS } from "../docs/src/data/donts.ts";
import { registryProps } from "../docs/src/registry-props.ts";
import { TREES } from "../docs/src/registry-trees.ts";
import { serializeTree, propsToJsx } from "../docs/src/jsx-code.ts";

const ROOT = join(import.meta.dir, "..");
const LEVEL: Record<string, string> = { Atoms: "atoms", Molecules: "molecules", Organisms: "organisms" };

// The descriptions carry inline <code> spans; turn those into markdown backticks
// and drop any other tags so the prose is clean markdown.
function descToMd(s: string): string {
  return s.replace(/<code>(.*?)<\/code>/g, "`$1`").replace(/<[^>]+>/g, "");
}

// The playground's default-state code: a composite tree if one is registered and
// renders at the defaults, otherwise the single component's mapped props.
function usageExample(slug: string, defaults: Record<string, unknown>): string {
  const tree = TREES[slug]?.(defaults, undefined);
  if (tree) return serializeTree(tree);
  const entry = registryProps[slug];
  if (!entry) throw new Error(`no tree or mapper for "${slug}" — registry drift`);
  return propsToJsx(entry.name, entry.mapProps(defaults, undefined));
}

let count = 0;
for (const comp of COMPONENTS) {
  const level = LEVEL[comp.category];
  if (!level) throw new Error(`unknown category "${comp.category}" for "${comp.slug}"`);
  const defaults = (comp.playground?.defaults as Record<string, unknown>) ?? {};

  const out: string[] = [];
  out.push(`# ${comp.name}`, "");
  out.push(descToMd(comp.description), "");
  out.push("## Usage", "", "```tsx", usageExample(comp.slug, defaults), "```", "");

  const donts = DONTS[comp.slug];
  if (donts && donts.length) {
    out.push("## Do & Don't", "");
    for (const d of donts) {
      if (d.title) out.push(`### ${d.title}`, "");
      if (d.do.tree) out.push(`**Do** — ${d.do.caption}`, "", "```tsx", serializeTree(d.do.tree), "```", "");
      if (d.dont.tree) out.push(`**Don't** — ${d.dont.caption}`, "", "```tsx", serializeTree(d.dont.tree), "```", "");
    }
  }

  const md = out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  const dir = join(ROOT, "src", level, comp.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${comp.slug}.md`), md);
  count++;
}

console.log(`generated ${count} component example docs`);
