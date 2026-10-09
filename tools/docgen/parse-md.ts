// The component-markdown grammar, lifted verbatim from the original web docs'
// component page into one framework-free module so the web
// shell, the native shell, and the build-time codegen all parse a component's
// `.md` the exact same way and can never drift. These functions are pure string
// parsers with no React or bundler dependency.
//
// Each component's co-located markdown (src/<level>/<slug>/<slug>.md) is split into
// the Playground examples (the Usage fence as "Default", then each Variant) and the
// parsed Do/Don't pairs. The leading "# Name" + description are dropped (the page
// header shows them); the Usage section carries no prose. docStructureViolations
// (below the parsers) holds every page to the shape these parsers expect.

export type Example = { label: string; code: string };
export type DontSide = { caption: string; code: string };
export type DontPair = { title?: string; do: DontSide; dont: DontSide };

export function splitDoc(src: string): { examples: Example[]; donts: DontPair[] } {
  const md = src.replace(/\r\n/g, "\n");
  const dontsAt = md.indexOf("\n## Do & Don't");
  const body = dontsAt === -1 ? md : md.slice(0, dontsAt);
  // Do & Don't ends at the next "##": a section of its own after it (Button's
  // "Real links (href)") is not part of the last pair.
  const dontsEnd = dontsAt === -1 ? -1 : md.indexOf("\n## ", dontsAt + 1);
  const section = dontsAt === -1 ? "" : md.slice(dontsAt, dontsEnd === -1 ? undefined : dontsEnd);
  // Head begins at the first "## " (Usage), dropping the "# Name" + description.
  const firstSection = body.indexOf("\n## ");
  const head = firstSection === -1 ? "" : body.slice(firstSection + 1);
  // Usage is everything up to "## Variants"; the rest is the variant list.
  const variantsAt = head.indexOf("\n## Variants");
  const usageMd = variantsAt === -1 ? head : head.slice(0, variantsAt);
  const variantsMd = variantsAt === -1 ? "" : head.slice(variantsAt);

  const usageCode = firstFence(usageMd);
  const variants = parseVariants(variantsMd);
  const examples: Example[] = [];
  if (usageCode) examples.push({ label: "Default", code: usageCode });
  // Skip a variant whose fence is identical to Usage (e.g. typography's first
  // "Style - display" duplicates the Usage example), so it shows once as Default.
  for (const v of variants) if (v.code !== usageCode) examples.push(v);

  return { examples, donts: parseDonts(section) };
}

// A fence opens on a line of three backticks and an optional language tag
// (```tsx, ```jsx, or bare) and closes on a line of three backticks alone.
const FENCE_OPEN = /^```(\w+)?\s*$/;
const FENCE_CLOSE = /^```\s*$/;

// The body of the first ```tsx/jsx fence in a markdown slice (the Usage example).
export function firstFence(md: string): string | null {
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (FENCE_OPEN.test(lines[i])) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE_CLOSE.test(lines[i])) code.push(lines[i++]);
      return code.join("\n");
    }
  }
  return null;
}

// The Variants section is a flat list of "### <label>" headings, each followed by
// exactly one ```tsx fence (no intervening prose). The label is the heading text
// verbatim; the code is the fence body.
export function parseVariants(section: string): Example[] {
  const lines = section.split("\n");
  const out: Example[] = [];
  let label: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const h = /^###\s+(.*)$/.exec(lines[i]);
    if (h) { label = h[1].trim(); continue; }
    if (label && FENCE_OPEN.test(lines[i])) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE_CLOSE.test(lines[i])) code.push(lines[i++]);
      out.push({ label, code: code.join("\n") });
      label = null;
    }
  }
  return out;
}

// A Do/Don't marker line: "**Do**" or "**Don't**" (a curly apostrophe too), then the
// caption after a separator.
const DONT_MARKER = /^\*\*(Do|Don['’]t)\*\*\s*(.*)$/;

// The caption after a marker, with its leading separator (a colon, an en or em dash,
// or a hyphen) and spaces stripped.
function markerCaption(rest: string): string {
  return rest.replace(/^[\s\p{P}]+/u, "").trim();
}

// The Do/Don't markdown is regular: "### title" groups, each with "**Do**: caption"
// + a ```tsx fence and "**Don't**: caption" + a ```tsx fence (Do emitted first).
// Pair by marker name, not position, so order does not matter.
export function parseDonts(section: string): DontPair[] {
  const lines = section.split("\n");
  const pairs: DontPair[] = [];
  let title: string | undefined;
  let cur: { do?: DontSide; dont?: DontSide } = {};
  let side: "do" | "dont" | null = null;
  let caption = "";
  for (let i = 0; i < lines.length; i++) {
    const h = /^###\s+(.*)$/.exec(lines[i]);
    if (h) { title = h[1].trim(); cur = {}; side = null; continue; }
    const m = DONT_MARKER.exec(lines[i]);
    if (m) {
      side = m[1] === "Do" ? "do" : "dont";
      caption = markerCaption(m[2]);
      continue;
    }
    if (FENCE_OPEN.test(lines[i]) && side) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE_CLOSE.test(lines[i])) code.push(lines[i++]);
      cur[side] = { caption, code: code.join("\n") };
      side = null;
      if (cur.do && cur.dont) { pairs.push({ title, do: cur.do, dont: cur.dont }); cur = {}; }
    }
  }
  return pairs;
}

// Page structure. The parsers above are lenient on purpose: a missing section yields
// fewer examples and a stray fence is skipped, so nothing in them notices a page that
// lost its Variants or its Do & Don't. docStructureViolations is the gate on the shape
// of a page; docs:gen and docs:gen:check fail on any finding, with no downgrade, and
// tools/docgen/doc-structure.test.ts holds every page to it in `bun run test`. Each
// rule has a number so a failure names the one it broke:
//
// - S1  The page opens with "# <name>", the component's name in the docs registry
//       (docs/src/core/data/components.ts), and has no other "#" heading.
// - S2  A prose intro sits between the title and the first "##" section, with no
//       fence, "###" heading or Do/Don't marker in it.
// - S3  "## Usage", "## Variants" and "## Do & Don't" each appear exactly once and in
//       that order, Usage first. Do & Don't ends at the next "##"; a section of the
//       page's own ("## Touch area") may follow it, never come before it.
// - S4  Usage holds exactly one non-empty fence and no "###" heading.
// - S5  Variants holds at least one "### <label>"; each is followed by exactly one
//       non-empty fence, and no fence sits before the first one.
// - S6  Do & Don't holds at least one "### <title>" group and every marker and fence
//       sits in one; a group is exactly one **Do** and one **Don't**, each with a
//       caption and exactly one non-empty fence of its own, and the Don't fence
//       differs from the Do fence (a pair that shows the same code teaches nothing).
//
// Prose under a "###" or after a marker is allowed here; whether the page renders it
// is the generator's business, not the page shape's.

export type StructureRule = "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
export type StructureViolation = { line: number; rule: StructureRule; message: string };

/** The "##" sections every component page carries, in page order. */
export const REQUIRED_SECTIONS = ["Usage", "Variants", "Do & Don't"] as const;
type RequiredSection = (typeof REQUIRED_SECTIONS)[number];

// The rule that owns the content of a section (an unclosed fence is reported under it).
const SECTION_RULE: Record<RequiredSection, StructureRule> = { Usage: "S4", Variants: "S5", "Do & Don't": "S6" };

// A page read as blocks, blank lines dropped. Headings are levels 1 to 3, the only
// levels the grammar reads; anything else that is not a fence or a marker is prose.
type Block =
  | { kind: "heading"; level: number; text: string; line: number }
  | { kind: "fence"; code: string; closed: boolean; line: number }
  | { kind: "marker"; side: "do" | "dont"; caption: string; line: number }
  | { kind: "prose"; line: number };
type MarkerBlock = Extract<Block, { kind: "marker" }>;
type FenceBlock = Extract<Block, { kind: "fence" }>;
type Section = { name: string; line: number; blocks: Block[] };

function pageBlocks(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    if (text.trim() === "") continue;
    if (FENCE_OPEN.test(text)) {
      const line = i + 1;
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE_CLOSE.test(lines[i])) code.push(lines[i++]);
      blocks.push({ kind: "fence", code: code.join("\n"), closed: i < lines.length, line });
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(text);
    if (h) { blocks.push({ kind: "heading", level: h[1].length, text: h[2].trim(), line: i + 1 }); continue; }
    const m = DONT_MARKER.exec(text);
    if (m) { blocks.push({ kind: "marker", side: m[1] === "Do" ? "do" : "dont", caption: markerCaption(m[2]), line: i + 1 }); continue; }
    blocks.push({ kind: "prose", line: i + 1 });
  }
  return blocks;
}

// Split a section's blocks at its "###" headings: the blocks before the first one,
// then each heading with the blocks under it.
function subsections(blocks: Block[]): { lead: Block[]; groups: { title: string; line: number; blocks: Block[] }[] } {
  const lead: Block[] = [];
  const groups: { title: string; line: number; blocks: Block[] }[] = [];
  for (const b of blocks) {
    if (b.kind === "heading" && b.level === 3) groups.push({ title: b.text, line: b.line, blocks: [] });
    else (groups.length ? groups[groups.length - 1].blocks : lead).push(b);
  }
  return { lead, groups };
}

const isBlank = (code: string) => code.trim() === "";
// Fences compare by their tokens, so a Don't that only re-indents its Do still counts
// as the same code.
const sameCode = (a: string, b: string) => a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
const markerName = (side: "do" | "dont") => (side === "do" ? "**Do**" : "**Don't**");

/**
 * The structure violations of one component page (rules S1 to S6 above), in line
 * order. `name` is the component's name in the docs registry. An empty array means
 * the page has the shape the generator and the docs pages expect.
 */
export function docStructureViolations(src: string, { name }: { name: string }): StructureViolation[] {
  const md = src.replace(/\r\n/g, "\n");
  const blocks = pageBlocks(md);
  const lastLine = md.replace(/\n+$/, "").split("\n").length;
  const out: StructureViolation[] = [];
  const add = (line: number, rule: StructureRule, message: string) => out.push({ line, rule, message });

  // S1: the title.
  const title = blocks[0];
  const titled = title?.kind === "heading" && title.level === 1;
  if (!titled) add(title?.line ?? 1, "S1", `the page must open with "# ${name}", the component's name in docs/src/core/data/components.ts`);
  else if (title.text !== name) add(title.line, "S1", `the title is "# ${title.text}"; the docs registry names this component "${name}" (docs/src/core/data/components.ts)`);

  // The intro, then the "##" sections in page order.
  const intro: Block[] = [];
  const sections: Section[] = [];
  for (const b of titled ? blocks.slice(1) : blocks) {
    if (b.kind === "heading" && b.level === 1) { add(b.line, "S1", `a second "#" heading ("# ${b.text}"); a page has one title`); continue; }
    if (b.kind === "heading" && b.level === 2) { sections.push({ name: b.text, line: b.line, blocks: [] }); continue; }
    (sections.length ? sections[sections.length - 1].blocks : intro).push(b);
  }

  // S2: the intro.
  if (!intro.some((b) => b.kind === "prose")) {
    add(sections[0]?.line ?? lastLine, "S2", `no intro: describe the component in prose between "# ${name}" and "## Usage"`);
  }
  for (const b of intro) {
    if (b.kind === "fence") add(b.line, "S2", "a fence in the intro; an example goes under Usage or a Variants heading");
    else if (b.kind === "heading") add(b.line, "S2", `"### ${b.text}" in the intro, before any "##" section`);
    else if (b.kind === "marker") add(b.line, "S2", `a ${markerName(b.side)} marker in the intro; pairs go under "## Do & Don't"`);
  }

  // S3: the sections, each required one once and in order, the page's own after them.
  const required = (s: Section): s is Section & { name: RequiredSection } => (REQUIRED_SECTIONS as readonly string[]).includes(s.name);
  const firstAt = REQUIRED_SECTIONS.map((r) => sections.findIndex((s) => s.name === r));
  REQUIRED_SECTIONS.forEach((r, i) => {
    const hits = sections.filter((s) => s.name === r);
    if (hits.length === 0) {
      // Point at the section it belongs before, or at the end of the page.
      const next = sections.find((s) => required(s) && REQUIRED_SECTIONS.indexOf(s.name) > i);
      add(next?.line ?? lastLine, "S3", `"## ${r}" is missing; a page has Usage, Variants and Do & Don't, in that order`);
    }
    for (const dup of hits.slice(1)) add(dup.line, "S3", `a second "## ${r}"; merge it into the first, at line ${hits[0].line}`);
  });
  for (let i = 1; i < REQUIRED_SECTIONS.length; i++) {
    const earlier = firstAt.slice(0, i).filter((at) => at !== -1);
    if (firstAt[i] !== -1 && earlier.some((at) => at > firstAt[i])) {
      add(sections[firstAt[i]].line, "S3", `"## ${REQUIRED_SECTIONS[i]}" is out of order; the sections run Usage, Variants, Do & Don't`);
    }
  }
  const dontsAt = firstAt[2] === -1 ? sections.length : firstAt[2];
  sections.forEach((s, i) => {
    if (!required(s) && i < dontsAt) {
      add(s.line, "S3", `"## ${s.name}" sits before "## Do & Don't"; a section of the page's own goes after Do & Don't`);
    }
  });

  // An unclosed fence runs to the end of the page and swallows everything after it.
  const unclosed = (b: Block, rule: StructureRule) => {
    if (b.kind === "fence" && !b.closed) add(b.line, rule, "this fence never closes; it swallows the rest of the page");
  };
  intro.forEach((b) => unclosed(b, "S2"));
  for (const s of sections) s.blocks.forEach((b) => unclosed(b, required(s) ? SECTION_RULE[s.name] : "S3"));

  // S4: Usage.
  for (const s of sections.filter((x) => x.name === "Usage")) {
    const fences = s.blocks.filter((b) => b.kind === "fence");
    if (fences.length === 0) add(s.line, "S4", "Usage has no fence; it shows the component's default example");
    for (const extra of fences.slice(1)) add(extra.line, "S4", "a second fence in Usage; Usage is one example, and the others are Variants");
    for (const b of s.blocks) {
      if (b.kind === "fence" && isBlank(b.code)) add(b.line, "S4", "the Usage fence is empty");
      if (b.kind === "heading") add(b.line, "S4", `"### ${b.text}" in Usage; a labelled example belongs under "## Variants"`);
    }
  }

  // S5: Variants.
  for (const s of sections.filter((x) => x.name === "Variants")) {
    const { lead, groups } = subsections(s.blocks);
    if (groups.length === 0) add(s.line, "S5", `Variants has no "### <label>" example`);
    for (const b of lead) if (b.kind === "fence") add(b.line, "S5", `a fence before the first "###"; every variant sits under its own "### <label>"`);
    for (const g of groups) {
      if (g.title === "") add(g.line, "S5", "a variant heading with no label");
      const fences = g.blocks.filter((b) => b.kind === "fence");
      if (fences.length === 0) add(g.line, "S5", `"### ${g.title}" has no fence`);
      for (const extra of fences.slice(1)) add(extra.line, "S5", `a second fence under "### ${g.title}"; each variant heading takes one example`);
      for (const f of fences) if (isBlank(f.code)) add(f.line, "S5", `the fence under "### ${g.title}" is empty`);
    }
  }

  // S6: Do & Don't.
  for (const s of sections.filter((x) => x.name === "Do & Don't")) {
    const { lead, groups } = subsections(s.blocks);
    // An untitled pair is reported once, at its markers; a fence there is reported
    // only when no marker precedes it.
    const untitled = lead.filter((b): b is MarkerBlock => b.kind === "marker");
    if (groups.length === 0 && untitled.length === 0) add(s.line, "S6", `Do & Don't has no "### <title>" group`);
    for (const b of untitled) add(b.line, "S6", `an untitled ${markerName(b.side)}: give every pair a "### <title>"`);
    const firstMarker = untitled[0]?.line ?? Infinity;
    for (const b of lead) if (b.kind === "fence" && b.line < firstMarker) add(b.line, "S6", `a fence before the first "###"; give every pair a "### <title>"`);
    for (const g of groups) {
      if (g.title === "") add(g.line, "S6", "a Do & Don't group with no title");
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
        add(g.line, "S6", `"### ${g.title}" has ${dos.length} **Do** and ${donts.length} **Don't**; a group is exactly one pair`);
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
