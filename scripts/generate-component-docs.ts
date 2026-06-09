// Generate a co-located example doc for every component: src/<level>/<name>/<name>.md
//
//   bun scripts/generate-component-docs.ts
//
// The markdown is derived from the same docs data the site renders, so the
// examples never drift: the description and category come from the component
// registry, the Usage block is the playground's default real-component JSX
// (a composite TREES tree, else the entry's mapProps over the default state),
// the Variants block walks the playground controls to show every non-default
// state, and the Do/Don'ts are the El trees from donts.ts. All of this runs
// headless because the imported modules are pure data + pure functions
// (serializeTree / propsToJsx / the prop-mappers) with only erased `import type`
// references, so no @olympusoss/canvas component is loaded.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COMPONENTS } from "../docs/src/data/components.ts";
import type { PlaygroundControl } from "../docs/src/data/types.ts";
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

// The real-component code for one playground state: a composite tree if one is
// registered and renders at that state, otherwise the single component's mapped
// props. `demo` is undefined, so handler props are stripped and output is
// deterministic. Usage passes the defaults; each variant passes the defaults with
// one control flipped.
function exampleFor(slug: string, state: Record<string, unknown>): string {
  const tree = TREES[slug]?.(state, undefined);
  if (tree) return serializeTree(tree);
  const entry = registryProps[slug];
  if (!entry) throw new Error(`no tree or mapper for "${slug}" (registry drift)`);
  return propsToJsx(entry.name, entry.mapProps(state, undefined));
}

interface Variant {
  heading: string;
  code: string;
}

// Walk the playground's controls and produce one example per non-default state,
// single-axis: each variant flips exactly one control off the defaults. Pills
// yield one example per option (skipping the default option); checks yield the
// `true` state; continuous text/range axes stay at the default. A control whose
// `disabledWhen` holds in that state is meaningless there and skipped, and any
// variant whose code matches the Usage example or an earlier variant is dropped
// so the section carries no redundant fences. Controls and options are walked in
// declaration order, so re-running on unchanged data is a zero diff.
function variantExamples(
  slug: string,
  defaults: Record<string, unknown>,
  controls: PlaygroundControl[],
  usageCode: string,
): Variant[] {
  const out: Variant[] = [];
  const seen = new Set<string>([usageCode]);
  const add = (heading: string, control: PlaygroundControl, state: Record<string, unknown>) => {
    if (control.disabledWhen?.(state)) return;
    const code = exampleFor(slug, state);
    if (seen.has(code)) return;
    seen.add(code);
    out.push({ heading, code });
  };
  for (const control of controls) {
    if (control.type === "pills") {
      for (const option of control.options ?? []) {
        if (option === defaults[control.key]) continue;
        add(`${control.label} - ${option}`, control, { ...defaults, [control.key]: option });
      }
    } else if (control.type === "check") {
      if (defaults[control.key] === true) continue;
      add(control.label, control, { ...defaults, [control.key]: true });
    }
    // text / range: continuous axes stay at the default.
  }
  return out;
}

let count = 0;
for (const comp of COMPONENTS) {
  const level = LEVEL[comp.category];
  if (!level) throw new Error(`unknown category "${comp.category}" for "${comp.slug}"`);
  const defaults = (comp.playground?.defaults as Record<string, unknown>) ?? {};

  const out: string[] = [];
  out.push(`# ${comp.name}`, "");
  out.push(descToMd(comp.description), "");
  const usageCode = exampleFor(comp.slug, defaults);
  out.push("## Usage", "", "```tsx", usageCode, "```", "");

  const variants = comp.playground
    ? variantExamples(comp.slug, defaults, comp.playground.controls, usageCode)
    : [];
  if (variants.length) {
    out.push("## Variants", "");
    for (const v of variants) {
      out.push(`### ${v.heading}`, "", "```tsx", v.code, "```", "");
    }
  }

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
