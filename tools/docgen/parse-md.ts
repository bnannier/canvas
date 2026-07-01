// The component-markdown grammar, lifted verbatim from the original web docs'
// component page into one framework-free module so the web
// shell, the native shell, and the build-time codegen all parse a component's
// `.md` the exact same way and can never drift. These functions are pure string
// parsers with no React or bundler dependency.
//
// Each component's co-located markdown (src/<level>/<slug>/<slug>.md) is split into
// the Playground examples (the Usage fence as "Default", then each Variant) and the
// parsed Do/Don't pairs. The leading "# Name" + description are dropped (the page
// header shows them); the Usage section carries no prose.

export type Example = { label: string; code: string };
export type DontSide = { caption: string; code: string };
export type DontPair = { title?: string; do: DontSide; dont: DontSide };

export function splitDoc(src: string): { examples: Example[]; donts: DontPair[] } {
  const md = src.replace(/\r\n/g, "\n");
  const dontsAt = md.indexOf("\n## Do & Don't");
  const body = dontsAt === -1 ? md : md.slice(0, dontsAt);
  const section = dontsAt === -1 ? "" : md.slice(dontsAt);
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

// The body of the first ```tsx/jsx fence in a markdown slice (the Usage example).
export function firstFence(md: string): string | null {
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/^```(\w+)?\s*$/.test(lines[i])) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
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
    if (label && /^```(\w+)?\s*$/.test(lines[i])) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      out.push({ label, code: code.join("\n") });
      label = null;
    }
  }
  return out;
}

// The Do/Don't markdown is regular: "### title" groups, each with "**Do** — caption"
// + a ```tsx fence and "**Don't** — caption" + a ```tsx fence (Do emitted first).
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
    const m = /^\*\*(Do|Don['’]t)\*\*\s*(.*)$/.exec(lines[i]);
    if (m) {
      side = m[1] === "Do" ? "do" : "dont";
      // Strip the leading separator (an em/en dash, colon, or hyphen) + spaces.
      caption = m[2].replace(/^[\s\p{P}]+/u, "").trim();
      continue;
    }
    if (/^```(\w+)?\s*$/.test(lines[i]) && side) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      cur[side] = { caption, code: code.join("\n") };
      side = null;
      if (cur.do && cur.dont) { pairs.push({ title, do: cur.do, dont: cur.dont }); cur = {}; }
    }
  }
  return pairs;
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
export const BANNED_STYLE_PROPS: string[] = [
  // layout / spacing / positioning — belongs to Row/Column or the component
  "flexDirection", "flexWrap", "flex", "flexGrow", "flexShrink", "flexBasis",
  "alignItems", "alignSelf", "justifyContent", "gap", "rowGap", "columnGap",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight",
  "marginHorizontal", "marginVertical", "marginStart", "marginEnd",
  "padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "paddingHorizontal", "paddingVertical", "paddingStart", "paddingEnd",
  "position", "top", "left", "right", "bottom", "zIndex",
  // typography — belongs to Typography's role / tone / weight
  "fontSize", "lineHeight", "fontWeight", "color", "letterSpacing", "textTransform", "fontFamily",
  // surface — belongs to the relevant component (Card, Chip, IconTile, Divider, …)
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
