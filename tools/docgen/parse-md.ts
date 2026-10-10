// The component-markdown grammar, in one framework-free module so the web shell, the
// native shell, the build-time codegen and the e2e and audit tooling all read a
// component's `.md` the exact same way and can never drift. These functions are pure
// string parsers with no React or bundler dependency.
//
// parseDoc reads a page (src/<level>/<dir>/<dir>.md) into the whole document the docs
// page renders, every line of it: the "# Name" title; the intro, whose first paragraph
// is the component's description (the page's lead and its search entry) and whose other
// paragraphs and lists are its overview; the Playground examples (the Usage fence as
// "Default", then each Variant) each with the prose written beside it as its note, and
// the prose before the first variant as the note on them all; the Do/Don't pairs with
// their whole captions; and the guidance sections after Do & Don't ("## Touch area"),
// whose fences render as live examples. Prose is a paragraph or a bullet list of inline
// Markdown (docs/src/lib/inline-markdown.ts), kept as written so the page and the
// generator read it with the one inline grammar. What the model does not place, or
// places but cannot render (a link, an ordered list), it lists as `unconsumed`, so the
// gate can prove that nothing on a page is dropped (rule S8).
//
// splitDoc is the projection the e2e routes and the audit inventory read: the examples'
// labels and fences and the pairs, exactly as before the model carried prose, so a
// variant keeps its route and its capture id. The parsers and the gate on a page's shape
// (docStructureViolations, below them) read the page through one model (pageBlocks and
// readPage): what the gate calls a heading, a section or a caption is exactly what the
// generator renders, so no spelling of a page can pass the one and lose its sections to
// the other.

import { unsupportedInline } from "../../docs/src/lib/inline-markdown.ts";

export type Example = { label: string; code: string };
export type DontSide = { caption: string; code: string };
export type DontPair = { title?: string; do: DontSide; dont: DontSide };

/** A paragraph of inline Markdown (its lines joined by spaces), or a bullet list of them. */
export type Prose = { kind: "paragraph"; text: string } | { kind: "list"; items: string[] };
/** What a guidance section holds: prose, a "###" heading, or a fence rendered as a live example. */
export type GuidanceBlock = Prose | { kind: "heading"; text: string } | { kind: "example"; code: string };
/** A Playground example with the prose written beside its fence. */
export type DocExample = Example & { note: Prose[] };
/** A section of the page's own after Do & Don't. */
export type Guidance = { title: string; blocks: GuidanceBlock[] };
/** A non-blank line the page never shows, or shows wrong, why, and the first line of the block it is part of. */
export type Unconsumed = { line: number; text: string; reason: string; block: number };

export interface ParsedDoc {
  title: string | null;
  /** The intro's first paragraph: the component's description. */
  description: string | null;
  /** The rest of the intro. */
  overview: Prose[];
  examples: DocExample[];
  /** The prose before the first variant: a note on every example. */
  variantsNote: Prose[];
  donts: DontPair[];
  guidance: Guidance[];
  unconsumed: Unconsumed[];
}

/** The examples and the pairs: the part of the model the e2e routes and the audit inventory read. */
export function splitDoc(src: string): { examples: Example[]; donts: DontPair[] } {
  const { examples, donts } = parseDoc(src);
  return { examples: examples.map(({ label, code }) => ({ label, code })), donts };
}

// A fence opens on a line of three backticks and an optional language tag
// (```tsx, ```jsx, or bare) and closes on a line of three backticks alone.
const FENCE_OPEN = /^```(\w+)?\s*$/;
const FENCE_CLOSE = /^```\s*$/;

// The body of the first ```tsx/jsx fence in a markdown slice (the Usage example).
export function firstFence(md: string): string | null {
  return firstFenceOf(pageBlocks(md));
}

// The Variants section is a flat list of "### <label>" headings, each followed by
// exactly one ```tsx fence. The label is the heading text verbatim; the code is the
// fence body.
export function parseVariants(section: string): Example[] {
  return variantsOf(pageBlocks(section)).map(({ label, code }) => ({ label, code }));
}

// The Do/Don't markdown is regular: "### title" groups, each with "**Do**: caption"
// + a ```tsx fence and "**Don't**: caption" + a ```tsx fence (Do emitted first).
// Pair by marker name, not position, so order does not matter.
export function parseDonts(section: string): DontPair[] {
  return dontsOf(pageBlocks(section)).pairs;
}

// A Do/Don't marker line: "**Do**" or "**Don't**" (a curly apostrophe too), then the
// caption after a separator.
const DONT_MARKER = /^\*\*(Do|Don['’]t)\*\*\s*(.*)$/;

// The caption after a marker, with its one leading separator (a colon, an en or em
// dash, or a hyphen) and the spaces around it stripped. Only the separator goes: a
// caption that opens on a quote or a parenthesis keeps it.
function markerCaption(rest: string): string {
  return rest.replace(/^\s*(?:[:\u2013\u2014]|-{1,2})?\s*/u, "").trim();
}

// An ATX heading as Markdown reads one: up to three spaces of indent, a run of one to
// six "#", then spaces or tabs (or the end of the line); an optional closing "#" run is
// not part of the text. The grammar reads levels 1 to 3; a deeper one is a construct the
// page cannot render (S8). `raw` keeps the line as written, so the gate can hold its
// spelling.
const ATX_HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;

function headingOf(line: string): { level: number; text: string; raw: string } | null {
  const h = ATX_HEADING.exec(line);
  if (!h || h[1].length > 3) return null;
  return { level: h[1].length, text: h[2] ?? "", raw: line };
}

// A bullet list item: up to three spaces of indent, "-", "*" or "+", then a space or a
// tab and the item's text. A run of three or more of the same mark is a rule, not an item.
const LIST_ITEM = /^( {0,3})([-*+])[ \t]+(.*)$/;
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;

function listItemOf(line: string): { indent: number; mark: string; text: string } | null {
  if (THEMATIC_BREAK.test(line)) return null;
  const m = LIST_ITEM.exec(line);
  return m ? { indent: m[1].length, mark: m[2], text: m[3] } : null;
}

// The block constructs Markdown has that the page does not render, by the line that
// opens them. A paragraph line that opens one is read as text by the model, so it is
// named instead (S8): rendering it would print its syntax.
const UNSUPPORTED_BLOCKS: [RegExp, string][] = [
  [/^ {0,3}#{4,6}(?:[ \t]|$)/, "a heading deeper than ###"],
  [/^ {0,3}\d{1,9}[.)](?:[ \t]|$)/, "an ordered list"],
  [/^ {0,3}>/, "a block quote"],
  [/^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+\|?[ \t]*$/, "a table"],
  [/^ {0,3}(?:[-*_])(?:[ \t]*[-*_]){2,}[ \t]*$|^ {0,3}=+[ \t]*$/, "a rule or an underlined heading"],
  [/^ {0,3}<[A-Za-z/!?]/, "an HTML block"],
];

// A line that carries on the paragraph above it: anything but a blank line, a fence, a
// heading, a marker or a list item, each of which starts a block of its own.
const continuesParagraph = (line: string) =>
  line.trim() !== "" && !FENCE_OPEN.test(line) && headingOf(line) === null && !DONT_MARKER.test(line) && listItemOf(line) === null;

/** Why a line of prose would not render as written. */
type Problem = { line: number; reason: string };

// A page read as Markdown blocks, blank lines dropped: headings (levels 1 to 3, the only
// levels the grammar reads), fences, Do/Don't markers with their captions, and prose (a
// paragraph or a bullet list). Each block lists the lines it spans, and the prose its
// constructs the page cannot render.
type Block =
  | { kind: "heading"; level: number; text: string; raw: string; line: number; lines: number[] }
  | { kind: "fence"; code: string; closed: boolean; line: number; lines: number[] }
  | { kind: "marker"; side: "do" | "dont"; caption: string; line: number; lines: number[]; problems: Problem[] }
  | { kind: "prose"; prose: Prose; line: number; lines: number[]; problems: Problem[] };
type HeadingBlock = Extract<Block, { kind: "heading" }>;
type MarkerBlock = Extract<Block, { kind: "marker" }>;
type FenceBlock = Extract<Block, { kind: "fence" }>;
type ProseBlock = Extract<Block, { kind: "prose" }>;
type Section = { name: string; heading: HeadingBlock; blocks: Block[] };

// The constructs a run of prose lines opens that the page cannot render: a block
// construct at the start of any line, and an inline one anywhere in the text (named at
// `at`, the line the text opens on).
function proseProblems(lines: string[], first: number, text: string, at = first): Problem[] {
  const problems: Problem[] = [];
  lines.forEach((l, k) => {
    for (const [pattern, what] of UNSUPPORTED_BLOCKS) if (pattern.test(l)) problems.push({ line: first + k, reason: `${what}, which the page does not render` });
  });
  for (const what of unsupportedInline(text)) problems.push({ line: at, reason: `${what}, which the page does not render` });
  return problems;
}

const joinLines = (lines: string[]) => lines.map((l) => l.trim()).join(" ");

function pageBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const span = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, k) => from + k);
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const line = i + 1;
    if (text.trim() === "") continue;
    if (FENCE_OPEN.test(text)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE_CLOSE.test(lines[i])) code.push(lines[i++]);
      blocks.push({ kind: "fence", code: code.join("\n"), closed: i < lines.length, line, lines: span(line, Math.min(i + 1, lines.length)) });
      continue;
    }
    const h = headingOf(text);
    if (h) { blocks.push({ kind: "heading", ...h, line, lines: [line] }); continue; }
    const first = listItemOf(text);
    if (first) {
      // A bullet list: each item runs on over the lines below it, the way a paragraph
      // does, and the list over a blank line only into another item of the same mark.
      const items: { lines: string[]; first: number }[] = [{ lines: [first.text], first: line }];
      const spanned = [line];
      const problems: Problem[] = [];
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        if (next.trim() === "") {
          let k = i + 1;
          while (k < lines.length && lines[k].trim() === "") k++;
          const after = k < lines.length ? listItemOf(lines[k]) : null;
          if (!after || after.mark !== first.mark || after.indent >= 2) break;
          i = k - 1;
          continue;
        }
        const item = listItemOf(next);
        if (item) {
          if (item.mark !== first.mark) break;
          if (item.indent >= 2) problems.push({ line: i + 2, reason: "a nested list, which the page does not render" });
          items.push({ lines: [item.text], first: i + 2 });
        } else if (continuesParagraph(next)) items[items.length - 1].lines.push(next);
        else break;
        spanned.push(++i + 1);
      }
      const texts = items.map((item) => joinLines(item.lines));
      items.forEach((item, k) => {
        if (texts[k] === "") problems.push({ line: item.first, reason: "an empty list item, which shows as a bare bullet" });
        problems.push(...proseProblems(item.lines, item.first, texts[k]));
      });
      blocks.push({ kind: "prose", prose: { kind: "list", items: texts }, line, lines: spanned, problems });
      continue;
    }
    // A paragraph runs on until a blank line or the next block, the way Markdown reads a
    // wrapped one. A marker's paragraph is its caption, all of it.
    const paragraph = [text];
    while (i + 1 < lines.length && continuesParagraph(lines[i + 1])) paragraph.push(lines[++i]);
    const lineSpan = span(line, line + paragraph.length - 1);
    const m = DONT_MARKER.exec(text);
    if (m) {
      const caption = markerCaption(joinLines([m[2], ...paragraph.slice(1)]));
      blocks.push({ kind: "marker", side: m[1] === "Do" ? "do" : "dont", caption, line, lines: lineSpan, problems: proseProblems(paragraph.slice(1), line + 1, caption, line) });
      continue;
    }
    const joined = joinLines(paragraph);
    const problems = proseProblems(paragraph, line, joined);
    // Four spaces of indent open a code block, and two after a list a second paragraph of
    // its last item; the page renders neither as it would read.
    const previous = blocks[blocks.length - 1];
    if (/^ {4,}|^\t/.test(text)) problems.push({ line, reason: "an indented code block, which the page does not render (fence the code instead)" });
    else if (/^ {2,}/.test(text) && previous?.kind === "prose" && previous.prose.kind === "list") {
      problems.push({ line, reason: "a second paragraph in a list item, which the page does not render (a list item is one paragraph)" });
    }
    blocks.push({ kind: "prose", prose: { kind: "paragraph", text: joined }, line, lines: lineSpan, problems });
  }
  return blocks;
}

// A page in its parts: the "#" title when the page opens with one, the intro before the
// first "##", and each "##" section with the blocks under it. A later "#" heading
// belongs to no part; the gate reports it.
function readPage(src: string): { blocks: Block[]; title?: HeadingBlock; strayTitles: HeadingBlock[]; intro: Block[]; sections: Section[] } {
  const blocks = pageBlocks(src);
  const first = blocks[0];
  const title = first?.kind === "heading" && first.level === 1 ? first : undefined;
  const strayTitles: HeadingBlock[] = [];
  const intro: Block[] = [];
  const sections: Section[] = [];
  for (const b of title ? blocks.slice(1) : blocks) {
    if (b.kind === "heading" && b.level === 1) strayTitles.push(b);
    else if (b.kind === "heading" && b.level === 2) sections.push({ name: b.text, heading: b, blocks: [] });
    else (sections.length ? sections[sections.length - 1].blocks : intro).push(b);
  }
  return { blocks, title, strayTitles, intro, sections };
}

// Split a section's blocks at its "###" headings: the blocks before the first one,
// then each heading with the blocks under it.
type Group = { title: string; heading: HeadingBlock; blocks: Block[] };
function subsections(blocks: Block[]): { lead: Block[]; groups: Group[] } {
  const lead: Block[] = [];
  const groups: Group[] = [];
  for (const b of blocks) {
    if (b.kind === "heading" && b.level === 3) groups.push({ title: b.text, heading: b, blocks: [] });
    else (groups.length ? groups[groups.length - 1].blocks : lead).push(b);
  }
  return { lead, groups };
}

// The body of the first fence among some blocks, or null when there is none.
function firstFenceOf(blocks: Block[]): string | null {
  const fence = blocks.find((b): b is FenceBlock => b.kind === "fence");
  return fence ? fence.code : null;
}

const proseOf = (blocks: Block[]) => blocks.filter((b): b is ProseBlock => b.kind === "prose");

// Each labelled "###" with the first fence under it and the prose beside it as its note.
// A heading with no fence or no label yields nothing, and a fence before the first
// heading has no label to show. `used` lists the blocks each example is made of.
function variantsOf(blocks: Block[]): (DocExample & { used: Block[] })[] {
  const out: (DocExample & { used: Block[] })[] = [];
  for (const g of subsections(blocks).groups) {
    const fence = g.blocks.find((b): b is FenceBlock => b.kind === "fence");
    if (!fence || g.title === "") continue;
    const notes = proseOf(g.blocks);
    out.push({ label: g.title, code: fence.code, note: notes.map((b) => b.prose), used: [g.heading, fence, ...notes] });
  }
  return out;
}

// Each marker takes the first fence after it, and a group's Do and Don't pair by marker
// name, not position; a pair before the first "###" has no title. `used` lists the
// blocks the pairs are made of (a group's heading once it yields a pair).
function dontsOf(blocks: Block[]): { pairs: DontPair[]; used: Block[] } {
  const { lead, groups } = subsections(blocks);
  const pairs: DontPair[] = [];
  const used: Block[] = [];
  for (const g of [{ title: undefined, heading: undefined, blocks: lead }, ...groups]) {
    let cur: { do?: DontSide; dont?: DontSide } = {};
    let curUsed: { do?: Block[]; dont?: Block[] } = {};
    let marker: MarkerBlock | null = null;
    let paired = false;
    for (const b of g.blocks) {
      if (b.kind === "marker") marker = b;
      else if (b.kind === "fence" && marker) {
        cur[marker.side] = { caption: marker.caption, code: b.code };
        curUsed[marker.side] = [marker, b];
        marker = null;
        if (cur.do && cur.dont) {
          pairs.push({ title: g.title, do: cur.do, dont: cur.dont });
          used.push(...(curUsed.do ?? []), ...(curUsed.dont ?? []));
          paired = true;
          cur = {};
          curUsed = {};
        }
      }
    }
    if (paired && g.heading) used.push(g.heading);
  }
  return { pairs, used };
}

/** The page as the docs render it, every line accounted for (see the module comment). */
export function parseDoc(src: string): ParsedDoc {
  const md = src.replace(/\r\n/g, "\n");
  const { title, strayTitles, intro, sections } = readPage(md);
  const placed = new Set<Block>();
  const place = (...bs: Block[]) => bs.forEach((b) => placed.add(b));
  // Why a block that is not placed never reaches the page, by block (the first reason).
  const why = new Map<Block, string>();
  const drop = (b: Block, reason: string) => { if (!why.has(b)) why.set(b, reason); };

  if (title) place(title);
  for (const b of strayTitles) drop(b, `a second "#" heading; a page has one title`);

  // The intro: its first paragraph is the description, and the rest is the overview.
  let description: string | null = null;
  const overview: Prose[] = [];
  intro.forEach((b, k) => {
    if (b.kind !== "prose") return drop(b, "the intro holds prose only");
    place(b);
    if (k === 0 && b.prose.kind === "paragraph") description = b.prose.text;
    else overview.push(b.prose);
  });

  // A section's blocks by name. The gate allows each section once; the parser stays
  // lenient and reads every section of the name, in page order. Do & Don't ends at the
  // next "##", so a section of the page's own after it (Button's "Real links (href)")
  // is never read into the last pair.
  const required = (s: Section) => (REQUIRED_SECTIONS as readonly string[]).includes(s.name);
  const blocksOf = (name: RequiredSection) => sections.filter((s) => s.name === name).flatMap((s) => s.blocks);
  for (const s of sections) {
    if (required(s)) place(s.heading);
    else if (s.name === "") drop(s.heading, `a "##" with no name ends the section above it and opens none`);
  }

  // Usage: its first fence is the Default example, and its prose the Default's note.
  const usage = blocksOf("Usage");
  const usageFence = usage.find((b): b is FenceBlock => b.kind === "fence");
  const usageCode = usageFence ? usageFence.code : null;
  const examples: DocExample[] = [];
  const defaultNote: Prose[] = [];
  if (usageCode) {
    examples.push({ label: "Default", code: usageCode, note: defaultNote });
    place(usageFence!);
    for (const b of proseOf(usage)) { place(b); defaultNote.push(b.prose); }
  }
  for (const b of usage) drop(b, "Usage shows one fence and the prose beside it");

  // Variants: the prose before the first variant is a note on them all. A variant whose
  // fence repeats Usage (Typography's first style) shows once, as Default, its note with it.
  const variantBlocks = blocksOf("Variants");
  const variantsNote: Prose[] = [];
  for (const b of proseOf(subsections(variantBlocks).lead)) { place(b); variantsNote.push(b.prose); }
  for (const v of variantsOf(variantBlocks)) {
    if (v.code !== usageCode) examples.push({ label: v.label, code: v.code, note: v.note });
    else if (usageCode) defaultNote.push(...v.note);
    else continue;
    place(...v.used);
  }
  for (const b of variantBlocks) drop(b, b.kind === "fence" ? `a fence that is not a variant's one example (each "### <label>" shows one)` : `Variants shows each "### <label>" example and the prose beside it`);

  // Do & Don't: the pairs, each caption whole.
  const dontBlocks = blocksOf("Do & Don't");
  const { pairs: donts, used } = dontsOf(dontBlocks);
  place(...used);
  for (const b of dontBlocks) drop(b, `Do & Don't shows each "### <title>" group's **Do** and **Don't**, a caption over a fence each, and nothing else`);

  // The sections of the page's own: prose, "###" headings and live examples.
  const guidance: Guidance[] = [];
  for (const s of sections) {
    if (required(s) || s.name === "") {
      if (s.name === "") s.blocks.forEach((b) => drop(b, `it sits under a "##" with no name`));
      continue;
    }
    place(s.heading);
    const blocks: GuidanceBlock[] = [];
    for (const b of s.blocks) {
      if (b.kind === "prose") blocks.push(b.prose);
      else if (b.kind === "heading") blocks.push({ kind: "heading", text: b.text });
      else if (b.kind === "fence") blocks.push({ kind: "example", code: b.code });
      else { drop(b, `a section of the page's own shows prose, "###" headings and examples, not Do/Don't pairs`); continue; }
      place(b);
    }
    guidance.push({ title: s.name, blocks });
  }

  // Every non-blank line the model did not place, or placed but cannot render.
  const lines = md.split("\n");
  const unconsumed = new Map<number, { reason: string; block: number }>();
  const all = [...(title ? [title] : []), ...strayTitles, ...intro, ...sections.flatMap((s) => [s.heading, ...s.blocks])];
  for (const b of all) {
    if (!placed.has(b)) {
      for (const l of b.lines) if (lines[l - 1]?.trim() && !unconsumed.has(l)) unconsumed.set(l, { reason: why.get(b) ?? "it belongs to no part of the page", block: b.line });
    }
    if (b.kind === "prose" || b.kind === "marker") for (const p of b.problems) if (!unconsumed.has(p.line)) unconsumed.set(p.line, { reason: p.reason, block: b.line });
  }
  return {
    title: title ? title.text : null,
    description,
    overview,
    examples,
    variantsNote,
    donts,
    guidance,
    unconsumed: [...unconsumed].sort(([a], [b]) => a - b).map(([line, u]) => ({ line, text: lines[line - 1], ...u })),
  };
}

// Page structure. The parser is lenient on purpose: a missing section yields fewer
// examples and a stray fence is skipped, so nothing in it notices a page that lost its
// Variants or its Do & Don't. docStructureViolations is the gate on the shape of a
// page; docs:gen and docs:gen:check fail on any finding, with no downgrade, and
// tools/docgen/doc-structure.test.ts holds every page to it in `bun run test`. Each
// rule has a number so a failure names the one it broke:
//
// - S1  The page opens with "# <name>", the component's name in the docs registry
//       (docs/src/core/data/components.ts), and has no other "#" heading.
// - S2  A prose intro sits between the title and the first "##" section, with no
//       fence, "###" heading or Do/Don't marker in it, and it opens with a paragraph:
//       the component's description, the page's lead and its search entry.
// - S3  "## Usage", "## Variants" and "## Do & Don't" each appear exactly once and in
//       that order, Usage first, and every "##" names its section.
// - S4  Usage holds exactly one non-empty fence and no "###" heading or Do/Don't
//       marker. Prose beside the fence is the Default example's note.
// - S5  Variants holds at least one "### <label>"; each is followed by exactly one
//       non-empty fence, and no fence sits before the first one. No Do/Don't marker
//       sits here: pairs go under Do & Don't. Prose under a label is that example's
//       note, and prose before the first label a note on every example.
// - S6  Do & Don't holds at least one "### <title>" group and every marker and fence
//       sits in one; a group is exactly one **Do** and one **Don't**, each with a
//       caption and exactly one non-empty fence of its own, and the Don't fence
//       differs from the Do fence (a pair that shows the same code teaches nothing).
//       A caption is its marker's paragraph, so it may wrap onto the lines below the
//       marker; the page shows nothing else from this section, so any other prose in
//       it (a second paragraph, a note after a fence) is rejected.
// - S7  Any other "##" is a guidance section of the page's own ("## Touch area"),
//       rendered after Do & Don't, so it sits after Do & Don't. It holds something,
//       only prose, "###" headings over something and non-empty fences (each a live
//       example, held to the same guardrails as the Variants), no Do/Don't marker (a
//       pair's "###" title typed as "##" ends Do & Don't there and takes that pair and
//       every one after it off the page), and takes a name of its own: not one the
//       page already gives a section it generates ("Props"), and not one used twice.
// - S8  Every non-blank line reaches the page as written: the model places it (see
//       parseDoc), and it opens no construct the page does not render (a link,
//       emphasis, an ordered list, a table, a heading deeper than "###"). This is the
//       mechanical proof that nothing on a page is dropped; a line another rule
//       already names is not named again.
//
// Every heading is written one way: its "#" run at the start of the line, one space,
// the text, and nothing after it. Markdown also reads "##  Variants", "##\tVariants",
// an indented heading or a closing "#" run as a heading, and so does the parser, but
// the gate rejects those spellings under the rule that owns the heading (S1 for "#",
// S3 for "##", and for "###" the rule of the part of the page it sits in), so the
// source always reads the way the page renders.

export type StructureRule = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8";
export type StructureViolation = { line: number; rule: StructureRule; message: string };

/** The "##" sections every component page carries, in page order. */
export const REQUIRED_SECTIONS = ["Usage", "Variants", "Do & Don't"] as const;
type RequiredSection = (typeof REQUIRED_SECTIONS)[number];

/** The sections a component page generates itself, which a guidance section may not be named. */
export const GENERATED_SECTIONS = ["Props"] as const;

// The rule that owns the content of a section (an unclosed fence is reported under it).
const SECTION_RULE: Record<RequiredSection, StructureRule> = { Usage: "S4", Variants: "S5", "Do & Don't": "S6" };

const isBlank = (code: string) => code.trim() === "";
// Fences compare by their tokens, so a Don't that only re-indents its Do still counts
// as the same code.
const sameCode = (a: string, b: string) => a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
const markerName = (side: "do" | "dont") => (side === "do" ? "**Do**" : "**Don't**");

/** What the gate knows about a page beyond its text. */
export interface PageContext {
  /** The component's name in the docs registry. */
  name: string;
}

/**
 * The structure violations of one component page (rules S1 to S8 above), in line
 * order. An empty array means the page has the shape the generator and the docs pages
 * expect, and every line of it reaches the page.
 */
export function docStructureViolations(src: string, { name }: PageContext): StructureViolation[] {
  const md = src.replace(/\r\n/g, "\n");
  const { blocks, title, strayTitles, intro, sections } = readPage(md);
  const lastLine = md.replace(/\n+$/, "").split("\n").length;
  const out: StructureViolation[] = [];
  const add = (line: number, rule: StructureRule, message: string) => out.push({ line, rule, message });

  // S1: the title.
  if (!title) add(blocks[0]?.line ?? 1, "S1", `the page must open with "# ${name}", the component's name in docs/src/core/data/components.ts`);
  else if (title.text !== name) add(title.line, "S1", `the title is "# ${title.text}"; the docs registry names this component "${name}" (docs/src/core/data/components.ts)`);
  for (const b of strayTitles) add(b.line, "S1", `a second "#" heading ("# ${b.text}"); a page has one title`);

  // S2: the intro, opening on the description.
  if (!intro.some((b) => b.kind === "prose")) {
    add(sections[0]?.heading.line ?? lastLine, "S2", `no intro: describe the component in prose between "# ${name}" and "## Usage"`);
  } else if (intro[0].kind === "prose" && intro[0].prose.kind === "list") {
    add(intro[0].line, "S2", "the intro opens with a list; its first paragraph is the component's description (the page's lead and its search entry), so open with one");
  }
  for (const b of intro) {
    if (b.kind === "fence") add(b.line, "S2", "a fence in the intro; an example goes under Usage or a Variants heading");
    else if (b.kind === "heading") add(b.line, "S2", `"### ${b.text}" in the intro, before any "##" section`);
    else if (b.kind === "marker") add(b.line, "S2", `a ${markerName(b.side)} marker in the intro; pairs go under "## Do & Don't"`);
  }

  // S3: the sections, each required one once and in order, every "##" named.
  const required = (s: Section): s is Section & { name: RequiredSection } => (REQUIRED_SECTIONS as readonly string[]).includes(s.name);
  const firstAt = REQUIRED_SECTIONS.map((r) => sections.findIndex((s) => s.name === r));
  REQUIRED_SECTIONS.forEach((r, i) => {
    const hits = sections.filter((s) => s.name === r);
    if (hits.length === 0) {
      // Point at the section it belongs before, or at the end of the page.
      const next = sections.find((s) => required(s) && REQUIRED_SECTIONS.indexOf(s.name) > i);
      add(next?.heading.line ?? lastLine, "S3", `"## ${r}" is missing; a page has Usage, Variants and Do & Don't, in that order`);
    }
    for (const dup of hits.slice(1)) add(dup.heading.line, "S3", `a second "## ${r}"; merge it into the first, at line ${hits[0].heading.line}`);
  });
  for (let i = 1; i < REQUIRED_SECTIONS.length; i++) {
    const earlier = firstAt.slice(0, i).filter((at) => at !== -1);
    if (firstAt[i] !== -1 && earlier.some((at) => at > firstAt[i])) {
      add(sections[firstAt[i]].heading.line, "S3", `"## ${REQUIRED_SECTIONS[i]}" is out of order; the sections run Usage, Variants, Do & Don't`);
    }
  }
  // A "##" with no name still opens a section, in Markdown and in the parser, and ends
  // whatever is above it, so nothing under it reaches the page; it is never the page's
  // own section.
  for (const s of sections) {
    if (s.name === "") add(s.heading.line, "S3", `a "##" with no section name; it still opens a section that ends whatever is above it, and nothing under it reaches the page: name the section or remove the line`);
  }

  // S7: the guidance sections, after Do & Don't.
  const dontsAt = firstAt[2] === -1 ? sections.length : firstAt[2];
  const guidanceTitles = new Map<string, number>();
  sections.forEach((s, i) => {
    if (s.name === "" || required(s)) return;
    // A guidance section is not Do & Don't, so a pair under it never reaches the page.
    // Most often it is a pair's "###" title typed as "##", which ends Do & Don't there
    // and takes that pair and every one after it off the page.
    const markers = s.blocks.filter((b): b is MarkerBlock => b.kind === "marker");
    if (i < dontsAt) add(s.heading.line, "S7", `"## ${s.name}" sits before "## Do & Don't"; a section of the page's own renders after Do & Don't, so it goes there`);
    else if (markers.length) {
      add(s.heading.line, "S7", `"## ${s.name}" holds Do/Don't markers (line ${markers.map((m) => m.line).join(", ")}), but Do & Don't ends at a "##", so they never reach the page; a pair's title is a "###" under "## Do & Don't"`);
    }
    if (s.blocks.length === 0) add(s.heading.line, "S7", `"## ${s.name}" holds nothing; a section of the page's own holds the guidance its title promises`);
    if ((GENERATED_SECTIONS as readonly string[]).includes(s.name)) add(s.heading.line, "S7", `"## ${s.name}" names a section the page generates itself; give this one a name of its own`);
    const seen = guidanceTitles.get(s.name);
    if (seen !== undefined) add(s.heading.line, "S7", `a second "## ${s.name}"; merge it into the first, at line ${seen}`);
    else guidanceTitles.set(s.name, s.heading.line);
    for (const b of s.blocks) if (b.kind === "fence" && isBlank(b.code)) add(b.line, "S7", `an empty fence in "## ${s.name}"; every fence there renders as a live example`);
    const { groups } = subsections(s.blocks);
    for (const g of groups) if (g.blocks.length === 0) add(g.heading.line, "S7", `"### ${g.title}" in "## ${s.name}" heads nothing`);
  });
  const sectionRule = (s: Section): StructureRule => (required(s) ? SECTION_RULE[s.name] : s.name === "" ? "S3" : "S7");

  // Every heading is spelled the one way, under the rule that owns it. A heading with no
  // text is left to the rule that needs the text (a title, a section name, a label).
  const spelled = (b: Block, rule: StructureRule) => {
    if (b.kind !== "heading" || b.text === "") return;
    const canonical = `${"#".repeat(b.level)} ${b.text}`;
    if (b.raw !== canonical) {
      add(b.line, rule, `the heading ${JSON.stringify(b.raw)} reads as "${canonical}"; write it exactly so: its "#" run, one space, the text`);
    }
  };
  if (title) spelled(title, "S1");
  strayTitles.forEach((b) => spelled(b, "S1"));
  intro.forEach((b) => spelled(b, "S2"));
  for (const s of sections) {
    spelled(s.heading, "S3");
    s.blocks.forEach((b) => spelled(b, sectionRule(s)));
  }

  // An unclosed fence runs to the end of the page and swallows everything after it.
  const unclosed = (b: Block, rule: StructureRule) => {
    if (b.kind === "fence" && !b.closed) add(b.line, rule, "this fence never closes; it swallows the rest of the page");
  };
  intro.forEach((b) => unclosed(b, "S2"));
  for (const s of sections) s.blocks.forEach((b) => unclosed(b, sectionRule(s)));

  // S4: Usage.
  for (const s of sections.filter((x) => x.name === "Usage")) {
    const fences = s.blocks.filter((b) => b.kind === "fence");
    if (fences.length === 0) add(s.heading.line, "S4", "Usage has no fence; it shows the component's default example");
    for (const extra of fences.slice(1)) add(extra.line, "S4", "a second fence in Usage; Usage is one example, and the others are Variants");
    for (const b of s.blocks) {
      if (b.kind === "fence" && isBlank(b.code)) add(b.line, "S4", "the Usage fence is empty");
      if (b.kind === "heading") add(b.line, "S4", `"### ${b.text}" in Usage; a labelled example belongs under "## Variants"`);
      if (b.kind === "marker") add(b.line, "S4", `a ${markerName(b.side)} marker in Usage; pairs go under "## Do & Don't"`);
    }
  }

  // S5: Variants.
  for (const s of sections.filter((x) => x.name === "Variants")) {
    const { lead, groups } = subsections(s.blocks);
    if (groups.length === 0) add(s.heading.line, "S5", `Variants has no "### <label>" example`);
    for (const b of lead) if (b.kind === "fence") add(b.line, "S5", `a fence before the first "###"; every variant sits under its own "### <label>"`);
    for (const b of s.blocks) if (b.kind === "marker") add(b.line, "S5", `a ${markerName(b.side)} marker in Variants; pairs go under "## Do & Don't"`);
    for (const g of groups) {
      if (g.title === "") add(g.heading.line, "S5", "a variant heading with no label");
      const fences = g.blocks.filter((b) => b.kind === "fence");
      if (fences.length === 0) add(g.heading.line, "S5", `"### ${g.title}" has no fence`);
      for (const extra of fences.slice(1)) add(extra.line, "S5", `a second fence under "### ${g.title}"; each variant heading takes one example`);
      for (const f of fences) if (isBlank(f.code)) add(f.line, "S5", `the fence under "### ${g.title}" is empty`);
    }
  }

  // S6: Do & Don't.
  for (const s of sections.filter((x) => x.name === "Do & Don't")) {
    const { lead, groups } = subsections(s.blocks);
    // The page shows a pair's two captions over their fences and nothing else from this
    // section, so prose here that is not a caption would never reach it.
    for (const b of s.blocks) {
      if (b.kind === "prose") add(b.line, "S6", `prose the page never shows: Do & Don't renders each marker's caption, which may wrap onto the lines below it until a blank line, and nothing else`);
    }
    // An untitled pair is reported once, at its markers; a fence there is reported
    // only when no marker precedes it.
    const untitled = lead.filter((b): b is MarkerBlock => b.kind === "marker");
    if (groups.length === 0 && untitled.length === 0) add(s.heading.line, "S6", `Do & Don't has no "### <title>" group`);
    for (const b of untitled) add(b.line, "S6", `an untitled ${markerName(b.side)}: give every pair a "### <title>"`);
    const firstMarker = untitled[0]?.line ?? Infinity;
    for (const b of lead) if (b.kind === "fence" && b.line < firstMarker) add(b.line, "S6", `a fence before the first "###"; give every pair a "### <title>"`);
    for (const g of groups) {
      if (g.title === "") add(g.heading.line, "S6", "a Do & Don't group with no title");
      // Walk the group: each marker takes the one fence that follows it.
      const sides: { side: "do" | "dont"; caption: string; line: number; fence?: FenceBlock }[] = [];
      for (const b of g.blocks) {
        const cur = sides[sides.length - 1];
        if (b.kind === "marker") sides.push({ side: b.side, caption: b.caption, line: b.line });
        else if (b.kind === "fence") {
          if (!cur || cur.fence) add(b.line, "S6", `a fence with no **Do** or **Don't** marker of its own under "### ${g.title}"`);
          else cur.fence = b;
        }
      }
      const dos = sides.filter((x) => x.side === "do");
      const donts = sides.filter((x) => x.side === "dont");
      if (dos.length !== 1 || donts.length !== 1) {
        add(g.heading.line, "S6", `"### ${g.title}" has ${dos.length} **Do** and ${donts.length} **Don't**; a group is exactly one pair`);
      }
      for (const x of sides) {
        if (x.caption === "") add(x.line, "S6", `the ${markerName(x.side)} has no caption`);
        if (!x.fence) add(x.line, "S6", `the ${markerName(x.side)} has no fence`);
        else if (isBlank(x.fence.code)) add(x.fence.line, "S6", `the ${markerName(x.side)} fence is empty`);
      }
      const doFence = dos[0]?.fence;
      const dontFence = donts[0]?.fence;
      if (doFence && dontFence && dos.length === 1 && donts.length === 1 && sameCode(doFence.code, dontFence.code)) {
        add(dontFence.line, "S6", `the **Don't** fence under "### ${g.title}" repeats its **Do** fence; the Don't shows the wrong way`);
      }
    }
  }

  // S8: every line reaches the page as written. It names what no rule above explains: in
  // a part of the page (the title and intro, or one "##" section) another rule already
  // faults, the lines that fault drops wait for its fix. Each block is named once, at its
  // first line, so a page with no finding at all has no line left unconsumed.
  const starts = [1, ...strayTitles.map((b) => b.line), ...sections.map((s) => s.heading.line)].sort((a, b) => a - b);
  const partOf = (line: number) => starts.filter((start) => start <= line).pop() ?? 1;
  const faulted = new Set(out.map((v) => partOf(v.line)));
  const byBlock = new Map<number, Unconsumed[]>();
  for (const u of parseDoc(md).unconsumed) byBlock.set(u.block, [...(byBlock.get(u.block) ?? []), u]);
  for (const us of byBlock.values()) {
    if (faulted.has(partOf(us[0].line))) continue;
    const where = us.length === 1 ? "this line never reaches" : `these ${us.length} lines (to line ${us[us.length - 1].line}) never reach`;
    add(us[0].line, "S8", `${where} the page as written: ${us[0].reason}`);
  }

  return out.sort((a, b) => a.line - b.line);
}

// Extract the names exposed to an example fence (the LIVE_SCOPE keys) straight from
// the docs runtime scope module, so the codegen's destructure list stays in lockstep
// with the single source of truth (docs/src/core/live-scope.ts) without importing it
// (importing would pull react-native into a plain Node/Bun context). These are all
// VALUE names (components, primitives, `tokens`, `alpha`/`shadow`/`palette`) — never
// type-only exports — so destructuring them from the scope is always valid.
export function scopeNamesFromLiveScope(src: string): string[] {
  const text = src.replace(/\r\n/g, "\n");
  const start = text.indexOf("LIVE_SCOPE");
  const open = start === -1 ? -1 : text.indexOf("{", start);
  if (open === -1) return [];
  // Find the matching close brace for the object literal.
  let depth = 0;
  let end = -1;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return [];
  const body = text.slice(open + 1, end);
  const names = new Set<string>();
  for (const raw of body.split("\n")) {
    const line = raw.replace(/\/\/.*$/, ""); // drop trailing line comment
    const m = /^\s*([A-Za-z_$][\w$]*)\s*[,:]/.exec(line);
    if (m) names.add(m[1]);
  }
  return [...names];
}

// Style-shim guardrail. The "No styling escape hatches" directive (CLAUDE.md)
// bans raw `style={{…}}` overrides that restyle, re-space, reposition, or
// re-typeset a component or primitive; those choices belong to semantic props and
// the Row/Column layout primitives. bannedStyleViolations flags such keys in a
// fence so the codegen can warn (and, once the sweep is done, fail). Deliberately
// NOT banned: `width`/`height`/`maxWidth`/`minWidth` (bounding a demo is
// composition, not styling), `overflow`, and `textAlign` (Typography has no align
// axis yet). "Don't" fences are exempt at the call site (they hand-roll the wrong
// way on purpose), so this is only run over the example and "Do" fences.
// EXCEPTION to the width allowance: max/minWidth placed directly on an
// input-like control is the shim the standard field width axis replaced; see
// widthShimViolations below.
export const BANNED_STYLE_PROPS: string[] = [
  // layout / spacing / positioning — belongs to Row/Column or the component
  "flexDirection", "flexWrap", "flex", "flexGrow", "flexShrink", "flexBasis",
  "alignItems", "alignSelf", "justifyContent", "gap", "rowGap", "columnGap",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight",
  "marginHorizontal", "marginVertical", "marginStart", "marginEnd",
  "padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "paddingHorizontal", "paddingVertical", "paddingStart", "paddingEnd",
  "position", "top", "left", "right", "bottom", "zIndex",
  // typography — belongs to Typography's role / tone / weight / underline
  "fontSize", "lineHeight", "fontWeight", "color", "letterSpacing", "textTransform", "fontFamily", "textDecorationLine",
  // surface — belongs to the relevant component (Card, Chip, Emblem, Divider, …)
  "backgroundColor", "borderWidth", "borderColor", "borderRadius",
  "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth",
  "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
  "shadowColor", "shadowOpacity", "shadowRadius", "shadowOffset", "elevation", "boxShadow", "opacity",
];

// The distinct banned property names found inside any `style={…}` /
// `contentContainerStyle={…}` expression in a fence. A `// docgen-allow-style`
// comment on the line where a style begins opts that one style out (a last
// resort, mirroring CLAUDE.md's "name it and get authorization" stance).
export function bannedStyleViolations(code: string): string[] {
  const found = new Set<string>();
  const marker = "style={";
  let idx = 0;
  while (true) {
    const at = code.indexOf(marker, idx);
    if (at === -1) break;
    // Move to the first "{" of the expression after "style=".
    let i = code.indexOf("{", at + marker.length - 1);
    if (i === -1) break;
    // Brace-match the whole `{…}` expression (object or array of objects).
    const start = i;
    let depth = 0;
    for (; i < code.length; i++) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") {
        depth--;
        if (depth === 0) { i++; break; }
      }
    }
    const expr = code.slice(start, i);
    idx = i;

    // Per-line opt-out on the line where the style begins.
    const lineStart = code.lastIndexOf("\n", at) + 1;
    let lineEnd = code.indexOf("\n", at);
    if (lineEnd === -1) lineEnd = code.length;
    if (code.slice(lineStart, lineEnd).includes("docgen-allow-style")) continue;

    for (const key of BANNED_STYLE_PROPS) {
      // Key as an object member: preceded by "{", "," or whitespace, followed by ":".
      if (new RegExp(`(?:^|[{,\\s])${key}\\s*:`).test(expr)) found.add(key);
    }
  }
  return [...found];
}

// Bare-width guardrail. The docs page's content box is the viewport minus 56px,
// so a fence that pins a fixed width at or above this threshold with no
// `maxWidth` in the same style expression overflows the page at phone width.
// Adding `maxWidth: "100%"` beside the width keeps the desktop size and lets the
// demo shrink on narrow viewports. Unlike the style-shim guardrail, "Don't"
// fences are NOT exempt: a wrong-way demo must still not overflow the page it
// renders on. The same `// docgen-allow-style` line opt-out applies.
export const BARE_WIDTH_MIN = 280;

/**
 * Bare fixed widths in a fence: each entry is `width: <N> without maxWidth` for
 * a numeric `width` >= BARE_WIDTH_MIN found inside a style={…} expression that
 * carries no `maxWidth` key. A `maxWidth` anywhere in the expression clears it
 * (React Native merges array styles, so a sibling array member's bound applies).
 */
export function bareWidthViolations(code: string): string[] {
  const found = new Set<string>();
  const marker = "style={";
  let idx = 0;
  while (true) {
    const at = code.indexOf(marker, idx);
    if (at === -1) break;
    // Move to the first "{" of the expression after "style=".
    let i = code.indexOf("{", at + marker.length - 1);
    if (i === -1) break;
    // Brace-match the whole `{…}` expression (object or array of objects).
    const start = i;
    let depth = 0;
    for (; i < code.length; i++) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") {
        depth--;
        if (depth === 0) { i++; break; }
      }
    }
    const expr = code.slice(start, i);
    idx = i;

    // Per-line opt-out on the line where the style begins.
    const lineStart = code.lastIndexOf("\n", at) + 1;
    let lineEnd = code.indexOf("\n", at);
    if (lineEnd === -1) lineEnd = code.length;
    if (code.slice(lineStart, lineEnd).includes("docgen-allow-style")) continue;

    if (/(?:^|[{,\s])maxWidth\s*:/.test(expr)) continue;

    // Numeric `width` members only ("width: 320"); percentage strings and other
    // non-numeric values self-bound. The boundary chars keep `maxWidth`/
    // `minWidth`/`borderWidth` from matching as `width`.
    const widthRe = /(?:^|[{,\s])width\s*:\s*(\d+)/g;
    let m: RegExpExecArray | null;
    while ((m = widthRe.exec(expr)) !== null) {
      const n = Number(m[1]);
      if (n >= BARE_WIDTH_MIN) found.add(`width: ${n} without maxWidth`);
    }
  }
  return [...found];
}

// Width belongs to the layout containers (src/style/sizing.ts): a component is FILL
// or HUG and the parent provides its bounds, so a `width` / `maxWidth` / `minWidth`
// in a `style` placed DIRECTLY on a non-layout tag (a component, or a raw `View`
// standing in for a Container) is the shim the layout tier replaced. A Container
// step, a Row `span`, or a Grid is the fix. Banned in example/"Do" fences; the
// `LayoutStyle` type rejects it on components at compile time as well. The layout
// containers and shells below are the exception (they ARE the bounds providers).
// The `// docgen-allow-style` line opt-out applies here too.
const WIDTH_SHIM_EXEMPT_TAGS = new Set([
  "Row", "Column", "Grid", "GridItem", "Container", "ScrollView",
  "Sidebar", "Drawer", "FilterPanel", "Navbar", "TabBar", "Board", "DashboardGrid", "DropZone",
]);
const WIDTH_SHIM_BANNED = ["width", "maxWidth", "minWidth"] as const;

/**
 * Violations of the width contract: each entry is "<key> on <Tag>" for a
 * width/maxWidth/minWidth style key found inside a style={…} attribute of a
 * non-layout tag's opening tag.
 */
export function widthShimViolations(code: string): string[] {
  const found = new Set<string>();
  const tagRe = /<([A-Z][A-Za-z0-9]*)\b/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(code)) !== null) {
    // Walk the opening tag to its closing ">", tracking brace depth so a ">"
    // inside a JSX expression attribute (e.g. an arrow function) doesn't end it.
    let i = m.index + m[0].length;
    let depth = 0;
    let tagEnd = code.length;
    for (; i < code.length; i++) {
      const ch = code[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (ch === ">" && depth === 0) { tagEnd = i; break; }
    }
    const tagSrc = code.slice(m.index, tagEnd);
    if (WIDTH_SHIM_EXEMPT_TAGS.has(m[1])) continue;
    const styleAt = tagSrc.indexOf("style={");
    if (styleAt === -1) continue;

    // Same per-line opt-out as bannedStyleViolations, on the line where the
    // style attribute begins.
    const absAt = m.index + styleAt;
    const lineStart = code.lastIndexOf("\n", absAt) + 1;
    let lineEnd = code.indexOf("\n", absAt);
    if (lineEnd === -1) lineEnd = code.length;
    if (code.slice(lineStart, lineEnd).includes("docgen-allow-style")) continue;

    for (const key of WIDTH_SHIM_BANNED) {
      if (new RegExp(`(?:^|[{,\\s])${key}\\s*:`).test(tagSrc.slice(styleAt))) {
        found.add(`${key} on <${m[1]}>`);
      }
    }
  }
  return [...found];
}

// Prose guardrail. Canvas is a React Native kit, so its docs prose must describe
// the real component API, never a web/CSS-framework idiom the kit does not expose.
// This is the same disease as the banned style shims, one layer out: not a raw
// `style={…}` in a fence, but a Tailwind utility class (`gap-6`, `items-center`,
// `bg-input`, `mt-[3px]`), a CSS property (`min-height`, `resize-y`), an HTML
// element (`<label>`, "a bare div", "pre element"), or a CSS class reference
// (`.label`, `.input-addon`) sitting in an intro paragraph or a "Do" caption.
// Each pattern matches framework-specific SYNTAX with no plain-English meaning, so
// ordinary words ("a label", "the gap between rows") never trip it.
const PROSE_PHANTOM_PATTERNS: [RegExp, string][] = [
  // Tailwind utility-class tokens.
  [/\b[a-z][a-z-]*-\[[^\]\s]+\]/g, "tailwind arbitrary value (e.g. mt-[3px])"],
  [/\b(?:gap|space)-(?:[xy]-)?\d/g, "tailwind gap utility"],
  [/\b[mp][trblxye]?-\d(?![\d.])/g, "tailwind margin/padding utility"],
  [/\b(?:min-)?[wh]-\d/g, "tailwind size utility"],
  [/\b(?:items|self|content)-(?:center|start|end|stretch|baseline)\b/g, "tailwind align utility"],
  [/\bjustify-(?:center|between|around|evenly|start|end)\b/g, "tailwind justify utility"],
  [/\bbg-[a-z][a-z-]*/g, "tailwind background utility"],
  [/\btext-(?:muted|xs|sm|lg|xl|center|left|right)[a-z-]*/g, "tailwind text utility"],
  [/\bfont-(?:mono|sans|serif|medium|semibold|bold|light|normal)\b/g, "tailwind font utility"],
  [/\bselect-(?:none|text|all)\b/g, "tailwind select utility"],
  [/\brounded-(?:sm|md|lg|xl|full|none)\b/g, "tailwind rounded utility"],
  [/\b(?:shrink|grow)-\d/g, "tailwind flex utility"],
  [/\bflex-(?:row|col|1|none|wrap)\b/g, "tailwind flex-direction utility"],
  [/\b(?:leading|tracking)-(?:none|tight|snug|normal|relaxed|loose|wide|wider)\b/g, "tailwind leading/tracking utility"],
  [/\bw\/h\b/g, "w/h utilities shorthand"],
  // CSS property names (kebab-case) in prose — the kit uses camelCase props/tokens.
  [/\b(?:min|max)-(?:width|height)\b/g, "CSS property (use the width axis / rows)"],
  [/\bresize-(?:y|x|none|both)\b/g, "CSS resize (RN has no resize handle)"],
  [/\b(?:z-index|line-height|font-size|font-weight|border-radius|box-shadow|letter-spacing|backdrop-filter)\b/g, "CSS property name"],
  // HTML elements / attributes.
  [/<\/?(?:div|span|label|ul|ol|li|pre|p|a|button|section|nav|img|table)\b/g, "HTML element"],
  [/\bdivs?\b/gi, "HTML element (div)"],
  [/\b(?:pre|div|span) element\b/g, "HTML element reference"],
  [/\b(?:className|htmlFor|inputmode)\b/g, "HTML/DOM attribute"],
  [/<a href/g, "HTML anchor"],
  // CSS class references (`.label`, `.input-addon`), excluding file-extension tokens.
  [/(?:^|[\s(])\.[a-z][a-z-]{2,}\b/g, "CSS class reference"],
];
const PROSE_FILE_EXT = /^\.(?:md|tsx?|jsx?|json|png|svg|css|html|sh|dev|com|io|env)$/;

/**
 * Phantom-API references in a component's `.md` PROSE (intro paragraph + "Do"
 * captions + any other non-fence, non-"Don't"-caption line). "Don't" captions are
 * exempt for the same reason "Don't" fences are exempt from the style guardrail:
 * they describe the wrong-way idiom on purpose. A line carrying
 * `docgen-allow-prose` is skipped (a last-resort escape). Returns one entry per
 * distinct match so the codegen can fail with a located, actionable list.
 */
export function prosePhantomApiViolations(md: string): { line: number; token: string; kind: string }[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: { line: number; token: string; kind: string }[] = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^\*\*Don['’]t\*\*/.test(line)) continue; // anti-pattern caption
    if (line.includes("docgen-allow-prose")) continue;
    for (const [re, kind] of PROSE_PHANTOM_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        const token = m[0].trim();
        if (kind === "CSS class reference" && PROSE_FILE_EXT.test(token)) continue;
        out.push({ line: i + 1, token, kind });
      }
    }
  }
  return out;
}
