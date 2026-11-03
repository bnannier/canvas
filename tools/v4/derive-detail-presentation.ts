// The detail page's content selection follows the vendored presentation registry;
// current generated docs remain the source of valid JSX, props and platform copy.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const ROOT = join(import.meta.dir, "..", "..");
const SOURCE = join(ROOT, "tools/v4/handoff/canvas-docs.js");
const OUTPUT = join(ROOT, "docs/src/ui/detail/presentation-data.ts");

interface ReferenceComponent {
  rel: string[];
  intro: string[];
  variants: { t: string; d?: string }[];
  sections: { t: string; p: string[]; code?: string }[];
  a11y: string[];
}

/**
 * The owner's explicit reorderings of a reference's specimens, each the full label list
 * in the order the detail page shows it. Icon: the owner asked on 2026-11-02 for the
 * Disclosure indicator card to come before the Gallery card.
 */
export const OWNER_VARIANT_ORDER: Readonly<Record<string, readonly string[]>> = {
  icon: ["Primary", "Destructive", "Success", "Warning", "Muted", "Disclosure indicator", "Gallery"],
};

/**
 * The owner's specimens that span every column of the Variants grid. Icon: the owner
 * asked on 2026-11-02 for the icon list (Gallery) card to span the whole row.
 */
export const OWNER_FULL_ROW: Readonly<Record<string, readonly string[]>> = {
  icon: ["Gallery"],
};

function ownerOrder(slug: string, variants: ReferenceComponent["variants"]): ReferenceComponent["variants"] {
  const order = OWNER_VARIANT_ORDER[slug];
  if (!order) return variants;
  const labels = variants.map((v) => v.t);
  if (order.length !== labels.length || !labels.every((label) => order.includes(label))) {
    throw new Error(`OWNER_VARIANT_ORDER.${slug} no longer lists exactly the reference's variants: ${labels.join(", ")}`);
  }
  return order.map((label) => variants.find((v) => v.t === label)!);
}

function fullRow(slug: string, variants: ReferenceComponent["variants"]): readonly string[] {
  const labels = OWNER_FULL_ROW[slug]!;
  const missing = labels.filter((label) => !variants.some((v) => v.t === label));
  if (missing.length) throw new Error(`OWNER_FULL_ROW.${slug} names variants the reference lacks: ${missing.join(", ")}`);
  return labels;
}

export function presentationFromSource(source: string) {
  const registry = JSON.parse(source.replace(/^window\.CV_DOCS\s*=\s*/, "").replace(/;\s*$/, "")) as { c: Record<string, ReferenceComponent>; rooms?: { slugs: string[] }[] };
  return Object.fromEntries(Object.entries(registry.c).map(([slug, c]) => [slug, {
    variants: ownerOrder(slug, c.variants).map((v) => v.t),
    variantNotes: c.variants.filter((v) => !!v.d).map((v) => v.t),
    ...(OWNER_FULL_ROW[slug] ? { fullRow: fullRow(slug, c.variants) } : null),
    introCount: c.intro.length,
    guidance: c.sections.slice(0, 6).map((section) => ({ title: section.t, paragraphs: Math.min(3, section.p.length), code: !!section.code })),
    noteCount: c.a11y.length,
    noteLeads: c.a11y.map((note) => (note.toLowerCase().match(/[a-z0-9]+/g) ?? []).slice(0, 2).join(" ")),
    related: [...new Set([...(c.rel ?? []), ...(registry.rooms?.find((room) => room.slugs.includes(slug))?.slugs ?? [])])].filter((related) => related !== slug && registry.c[related]).slice(0, 8),
  }]));
}

interface SourceKnob { ty: string; l: string; n: string; o?: string[] }
interface SourceKit {
  PF: Record<string, string>;
  spec: (slug: string) => { k: string };
  knobs: (dsl: string) => SourceKnob[];
  init: (knobs: SourceKnob[]) => Record<string, unknown>;
  props: (knobs: SourceKnob[], state: Record<string, unknown>) => Record<string, unknown>;
  render: (slug: string, props: Record<string, unknown>, context: { pf: string }) => string;
}
let kit: SourceKit | undefined;
function sourceKit(): SourceKit {
  if (kit) return kit;
  const page = readFileSync(join(ROOT, "tools/v4/handoff/Canvas v4.0.0 Component.dc.html"), "utf8");
  const window: Record<string, unknown> = {};
  window.window = window;
  const context = vm.createContext(window);
  for (const match of page.matchAll(/<script src="\.\/([^"]+\.js)"><\/script>/g)) {
    if (match[1] === "canvas-docs.js" || match[1]!.startsWith("cv-")) vm.runInContext(readFileSync(join(ROOT, "tools/v4/handoff", match[1]!), "utf8"), context);
  }
  return kit = window.CVK as SourceKit;
}

/** The same style/fill/stroke variable scan as Component.dc.html's _measure. */
export function referenceTokenNames(slug: string, state?: Record<string, unknown>): string[] {
  const k = sourceKit();
  const knobs = k.knobs(k.spec(slug).k);
  const props = k.props(knobs, state ?? k.init(knobs));
  const html = k.render(slug, props, { pf: "web" });
  const attributes = [...html.matchAll(/\b(?:style|fill|stroke)="([^"]*)"/g)].map((m) => m[1]).join(" ");
  return [...new Set([...`${k.PF.web} ${attributes}`.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]!))]
    .filter((name) => !/^--(r-c|h-c|r-f|h-f|r-cd|f-ui|tw|fs|rx|ry|skA)$/.test(name)).sort();
}

function tokenPresentation(slug: string) {
  const k = sourceKit();
  const knobs = k.knobs(k.spec(slug).k);
  const initial = k.init(knobs);
  const tokens = referenceTokenNames(slug);
  const deltas: Record<string, Record<string, { add: string[]; remove: string[] }>> = {};
  for (const knob of knobs) {
    const key = knob.ty === "flags" ? `@${knob.l}` : knob.n;
    const options: unknown[] = knob.ty === "bool" ? [false, true] : knob.o ?? [];
    for (const option of options) {
      const names = referenceTokenNames(slug, { ...initial, [key]: option });
      const add = names.filter((name) => !tokens.includes(name));
      const remove = tokens.filter((name) => !names.includes(name));
      if (add.length || remove.length) (deltas[key] ??= {})[JSON.stringify(option === "-" ? null : option)] = { add, remove };
    }
  }
  return { tokens, tokenDeltas: deltas };
}

export function generatedPresentation(source: string): string {
  const presentation = Object.fromEntries(Object.entries(presentationFromSource(source)).map(([slug, data]) => [slug, { ...data, ...tokenPresentation(slug) }]));
  return `/* @generated by tools/v4/derive-detail-presentation.ts. DO NOT EDIT. */\nexport const DETAIL_PRESENTATION = ${JSON.stringify(presentation, null, 2)} as const;\n`;
}

if (import.meta.main) {
  const output = generatedPresentation(readFileSync(SOURCE, "utf8"));
  if (process.argv.includes("--check")) {
    if (readFileSync(OUTPUT, "utf8") !== output) {
      console.error("The detail presentation manifest is stale. Run bun tools/v4/derive-detail-presentation.ts.");
      process.exitCode = 1;
    }
  } else writeFileSync(OUTPUT, output);
}
