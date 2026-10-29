// Writes the section pages' card manifest (docs/src/data/showcase.ts) from the vendored v4
// design hand-off, so every card's id, eyebrow title and meta, component link chips, tile
// floor, full-width flag and Data subsection are the hand-off's own and not a second copy
// someone keeps in step.
//
//   bun tools/v4/derive-showcase.ts            write the file
//   bun tools/v4/derive-showcase.ts --check    fail when the committed file is not what this writes
//
// The source is each section page, `Canvas v4.0.0 <Section>.dc.html`: a card is a
// `<div id="c-...">` in the page's card grid, its header row the 11 px mono pair of spans,
// its chips the anchors to `Canvas v4.0.0 Component.dc.html#<slug>`, a full-width card the
// one carrying `grid-column:1/-1`, and a Data subsection the `<div id="g-...">` header
// (a 30 px display title over the mono list of its components). A header whose text is a
// template binding (`{{ vpLabel }}`) is live in the hand-off and is left out here.
// test/docs-showcase.test.ts runs this with `--check` semantics.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO = join(import.meta.dir, "..", "..");
const HANDOFF = join(REPO, "tools", "v4", "handoff");
const OUT = join(REPO, "docs", "src", "data", "showcase.ts");

/** The section pages, by the rooms' section id, in the hand-off's order. */
export const SECTION_PAGES = {
  foundations: "Foundations",
  layout: "Layout",
  controls: "Controls",
  inputs: "Inputs",
  navigation: "Navigation",
  data: "Data",
  charts: "Charts",
  overlays: "Overlays",
} as const;

export interface DerivedCard {
  id: string;
  title?: string;
  meta?: string;
  links: string[];
  tile: number;
  full: boolean;
  /** A framed card's inset (its `padding`), when the card is a framed surface and not a stage. */
  inset?: number;
  /** A framed card's gap between its header, body and caption (its flex `gap`). */
  gap?: number;
  /** A framed card's header-to-chips distance: its gap plus the header's own margin, less the chips' 6 px pull. */
  headGap?: number;
  group?: string;
}

export interface DerivedGroup {
  id: string;
  title: string;
  names: string[];
}

export interface DerivedSection {
  cards: DerivedCard[];
  groups: DerivedGroup[];
}

function decode(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** A header text the hand-off computes at run time, which has no fixed copy to take. */
const bound = (text: string) => text.includes("{{");

/** The `<div` nesting depth at each `<div` and `</div>` boundary before `at`. */
function depthAt(html: string, at: number): number {
  const before = html.slice(0, at);
  return (before.match(/<div[\s>]/g)?.length ?? 0) - (before.match(/<\/div>/g)?.length ?? 0);
}

/** One section page's cards and subsections. */
export function deriveSection(page: string): DerivedSection {
  const file = readFileSync(join(HANDOFF, `Canvas v4.0.0 ${page}.dc.html`), "utf8");
  const start = file.indexOf("<section");
  const html = file.slice(start, file.indexOf("</section>", start));
  const grids = [...html.matchAll(/<div style="(?:grid-column:1\/-1;)?display:grid;grid-template-columns:repeat\(auto-fit,minmax\(min\(100%,(\d+)px\),1fr\)\)/g)]
    .map((m) => ({ at: m.index!, tile: Number(m[1]), depth: depthAt(html, m.index!) }));
  const groups = [...html.matchAll(/<div id="(g-[a-z-]+)"[^>]*><div[^>]*>([^<]*)<\/div><div[^>]*>([^<]*)<\/div><\/div>/g)]
    .map((m) => ({ at: m.index!, id: m[1], title: decode(m[2]), names: decode(m[3]).split(" · ") }));
  const starts = [...html.matchAll(/<div id="(c-[a-z0-9-]+)" style="([^"]*)"/g)].map((m) => ({ at: m.index!, id: m[1], style: m[2] }));
  const seen = new Set<string>();
  const cards: DerivedCard[] = [];
  for (const [index, card] of starts.entries()) {
    if (seen.has(card.id)) continue;
    seen.add(card.id);
    const end = index + 1 < starts.length ? starts[index + 1].at : html.length;
    const body = html.slice(card.at, end);
    const head = body.match(/text-transform:uppercase;color:var\(--tx3\)(?:;margin-bottom:\d+px)?"><span>([^<]*)<\/span><span>([^<]*)<\/span>/);
    const links = [...new Set([...body.matchAll(/Component\.dc\.html#([a-z0-9-]+)"/g)].map((m) => m[1]))];
    const depth = depthAt(html, card.at);
    const grid = grids.filter((g) => g.at < card.at && g.depth === depth - 1).at(-1);
    if (!grid) throw new Error(`${page}: ${card.id} sits in no card grid`);
    const group = groups.filter((g) => g.at < card.at).at(-1);
    const out: DerivedCard = { id: card.id, links, tile: grid.tile, full: card.style.includes("grid-column:1/-1") };
    // A framed card (`background:var(--sf);...;padding:24px;display:flex;flex-direction:column;
    // gap:20px`) carries its own inset and gap: the Charts cards are 20 and 14, the Data cards
    // 24 and 16, and so on. A stage card (`background:var(--bg2)`) lays its scene out itself.
    if (card.style.includes("background:var(--sf)")) {
      const inset = card.style.match(/(?:^|;)padding:(\d+)px;/);
      const gap = card.style.match(/(?:^|;)gap:(\d+)(?:px)?(?:;|$)/);
      // No padding or gap is the CSS default, 0 (the flush DataTable card).
      out.inset = inset ? Number(inset[1]) : 0;
      out.gap = gap ? Number(gap[1]) : 0;
      // The header row may carry its own `margin-bottom` (28 on the Form card, 12 on Type), and
      // the chip row's `margin-top:-6px` pulls it up into the space above it.
      const headMargin = body.match(/text-transform:uppercase;color:var\(--tx3\);margin-bottom:(\d+)px"><span>/);
      if (head && links.length > 0) out.headGap = Math.max(0, out.gap + (headMargin ? Number(headMargin[1]) : 0) - 6);
    }
    if (head && !bound(head[1])) out.title = decode(head[1]);
    if (head && !bound(head[2])) out.meta = decode(head[2]);
    if (group) out.group = group.id;
    cards.push(out);
  }
  return { cards, groups: groups.map(({ id, title, names }) => ({ id, title, names })) };
}

/** Every section page's cards and subsections. */
export function deriveShowcase(): Record<keyof typeof SECTION_PAGES, DerivedSection> {
  return Object.fromEntries(
    Object.entries(SECTION_PAGES).map(([id, page]) => [id, deriveSection(page)]),
  ) as Record<keyof typeof SECTION_PAGES, DerivedSection>;
}

/** The generated module's source. */
export function renderShowcase(): string {
  const data = deriveShowcase();
  const lines: string[] = [
    "/* @generated by tools/v4/derive-showcase.ts. DO NOT EDIT. Run `bun tools/v4/derive-showcase.ts`. */",
    "// The v4 hand-off's section page cards (`Canvas v4.0.0 <Section>.dc.html`): each card's id,",
    "// its eyebrow title and meta, the components its chips link to (URL slugs), the floor of the",
    "// grid it tiles in, whether it spans the whole row, and the Data subsection it sits under.",
    "// The section pages (docs/src/sections/*) render a card per entry through ShowcaseCard,",
    "// which takes its header and chips from here. Plain data with no React import.",
    "",
    "import type { SectionId } from \"./rooms\";",
    "",
    "export interface ShowcaseCardSpec {",
    "  /** The hand-off's card id (`c-button`): the card's anchor and its `showcase-<id>` test id. */",
    "  id: string;",
    "  /** The header row's left label (set uppercase by the card); none on a specimen card. */",
    "  title?: string;",
    "  /** The header row's right label. */",
    "  meta?: string;",
    "  /** The components the card's chips link to, by URL slug, in the hand-off's order. */",
    "  links: readonly string[];",
    "  /** The floor (`minmax(<tile>px, 1fr)`) of the card grid the card tiles in. */",
    "  tile: number;",
    "  /** The card spans the whole row (`grid-column: 1 / -1`). */",
    "  full: boolean;",
    "  /** A framed card's inset (its `padding`); none on a stage card. */",
    "  inset?: number;",
    "  /** A framed card's gap between its header, body and caption; none on a stage card. */",
    "  gap?: number;",
    "  /** A framed card's header-to-chips distance (its gap plus the header's margin, less the chips' 6 px pull). */",
    "  headGap?: number;",
    "  /** The Data subsection the card sits under. */",
    "  group?: string;",
    "}",
    "",
    "export interface ShowcaseGroupSpec {",
    "  id: string;",
    "  title: string;",
    "  /** The component names the header lists at its end. */",
    "  names: readonly string[];",
    "}",
    "",
    "export interface ShowcaseSection {",
    "  cards: readonly ShowcaseCardSpec[];",
    "  groups: readonly ShowcaseGroupSpec[];",
    "}",
    "",
    `export const SHOWCASE: Readonly<Record<SectionId, ShowcaseSection>> = ${JSON.stringify(data, null, 2)};`,
    "",
    "const CARD_OF = new Map(Object.values(SHOWCASE).flatMap((section) => section.cards.map((card) => [card.id, card] as const)));",
    "",
    "/** The card with this hand-off id, on whichever section page it sits. */",
    "export function showcaseCard(id: string): ShowcaseCardSpec | undefined {",
    "  return CARD_OF.get(id);",
    "}",
    "",
  ];
  return lines.join("\n");
}

if (import.meta.main) {
  const source = renderShowcase();
  if (process.argv.includes("--check")) {
    if (readFileSync(OUT, "utf8") !== source) {
      console.error("docs/src/data/showcase.ts is stale: run `bun tools/v4/derive-showcase.ts`.");
      process.exit(1);
    }
  } else {
    writeFileSync(OUT, source);
  }
}
