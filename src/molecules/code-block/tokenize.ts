import { type ColorTokens, darkColors, oklchHex } from "../../style/index.js";

// Dependency-free syntax tokenizer for CodeBlock. Line-based output: each source
// line becomes an array of { text, kind } spans, rendered as nested <Text> nodes,
// so the same tokenizer colors code identically on iOS, Android, and the web (no
// DOM, no WASM, no async grammar loading). Coverage is deliberately curated to the
// languages a UI-kit code block actually shows — TypeScript/JavaScript (with JSX),
// JSON, shell, CSS, HTML, and Python — with a monochrome fallback for anything
// else. It is a display highlighter, not a parser: rules are ordered regex
// alternatives with a small amount of carried context (inside-a-JSX-tag, shell
// command position), which is the same trade every lightweight highlighter makes.
// tsx and jsx are their own grammar (JSX_RULES): the hand-off's component page paints
// its JSX samples with a different, sparser highlighter than its CodeBlock renderer
// paints ts and js, and the kit follows each where the hand-off uses it.

/**
 * What one span of highlighted code is: plain text, a comment, a string, a keyword, a
 * number, a tag, a component tag name, an attribute, a function name or a variable.
 * CodeBlock paints each kind in its own ink (`syntaxColor`).
 */
export type TokenKind =
  | "text"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "tag"
  | "component"
  | "attr"
  | "fn"
  | "var";

/** One span of a highlighted line: its text and its kind. */
export interface CodeToken {
  text: string;
  kind: TokenKind;
}

// Mutable context threaded through one tokenize pass, letting a rule's classifier
// see where it is (inside a JSX/HTML tag, at a shell command position). `inTag` is
// the flat flag the ts and html grammars keep; `tagDepth` is the jsx grammar's count
// of open tags, so a tag nested in an attribute expression (`iconLeft={<Icon plus />}`)
// hands the context back to the outer tag when it closes.
interface Ctx {
  inTag: boolean;
  tagDepth: number;
}

interface Rule {
  kind: TokenKind;
  // Regex source WITHOUT capturing groups (the engine adds one per rule).
  re: string;
  // Optional refinement: pick the final kind from the matched text + position.
  classify?: (match: string, source: string, index: number, ctx: Ctx) => TokenKind;
}

// --- ts / js (with JSX) ------------------------------------------------------

const TS_KEYWORDS = new Set([
  "abstract", "any", "as", "async", "await", "boolean", "break", "case", "catch",
  "class", "const", "continue", "declare", "default", "delete", "do", "else",
  "enum", "export", "extends", "false", "finally", "for", "from", "function",
  "get", "if", "implements", "import", "in", "infer", "instanceof", "interface",
  "keyof", "let", "never", "new", "null", "number", "object", "of", "private",
  "protected", "public", "readonly", "return", "satisfies", "set", "static",
  "string", "super", "switch", "symbol", "this", "throw", "true", "try", "type",
  "typeof", "undefined", "unknown", "var", "void", "while", "yield",
]);

// Ident refinement shared by ts and python: keywords first, PascalCase reads as a
// type/component (same hue as JSX tags), a call site reads as a function.
function classifyIdent(keywords: Set<string>) {
  return (match: string, source: string, index: number, ctx: Ctx): TokenKind => {
    if (ctx.inTag) return keywords.has(match) ? "keyword" : "attr";
    if (keywords.has(match)) return "keyword";
    if (/^[A-Z]/.test(match)) return "tag";
    const after = source.slice(index + match.length);
    if (/^\s*\(/.test(after)) return "fn";
    return "text";
  };
}

// Open/close JSX-or-HTML tag context as tag tokens stream past.
function trackTag(match: string, _source: string, _index: number, ctx: Ctx): TokenKind {
  if (match.startsWith("<")) ctx.inTag = true;
  else ctx.inTag = false; // a bare ">" or "/>" closes the tag context
  return "tag";
}

// The ts and js grammar: the hand-off's CodeBlock renderer (cv-kit-code3.js `hl`), which
// paints keywords, strings, numbers and `<Tag` names. The jsx grammar below is a
// different highlighter.
const TS_RULES: Rule[] = [
  { kind: "comment", re: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/" },
  {
    kind: "string",
    re: "\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'|`(?:\\\\.|[^`\\\\])*`",
  },
  // The arrow sits before the tag rule so `=>` is consumed whole and its `>`
  // never reads as a tag close.
  { kind: "text", re: "=>" },
  { kind: "tag", re: "<\\/?[A-Za-z][\\w.]*|\\/?>", classify: trackTag },
  { kind: "number", re: "\\b0[xX][0-9a-fA-F]+\\b|\\b\\d+(?:\\.\\d+)?\\b" },
  { kind: "text", re: "[A-Za-z_$][\\w$]*", classify: classifyIdent(TS_KEYWORDS) },
];

// --- tsx / jsx ---------------------------------------------------------------
//
// The hand-off's component page highlights every JSX sample (the playground line, the
// usage, variant and section snippets) with its own `hl`, tools/v4/handoff/"Canvas
// v4.0.0 Component.dc.html" line 324:
//
//   const hl=code=>({__html:esc(code)
//     .replace(/(\s)([a-z][\w-]*)(=)/g,'$1<span style="color:var(--cyan)">$2</span>$3')
//     .replace(/(&quot;[^&]*&quot;)/g,'<span style="color:var(--mint)">$1</span>')
//     .replace(/(&lt;\/?)([A-Z][\w.]*)/g,'$1<span style="color:var(--ion-tx)">$2</span>')
//     .replace(/(^|\n)(\s*\/\/[^\n]*)/g,'$1<span style="color:var(--tx3)">$2</span>')});
//
// So four things are painted and nothing else: an attribute name right before its `=`
// in cyan (`attr`), a string literal in mint (`string`), a Capitalised tag name right
// after `<` or `</` in the accent text ink (`component`, the name alone: the brackets
// and the slash stay neutral), and a `//` comment in the subtle ink (`comment`). A
// keyword, a number, a function name, a lowercase tag, a bare boolean attribute
// (`primary`, `outline small`) and the children text are the neutral code ink, so
// `<Button>Save changes</Button>` reads as one label after one accent name.

// The jsx grammar's tag context: the opening `<Name` or `</Name` of a tag opens one
// level and `>` or `/>` closes it, so a tag inside an attribute expression gives the
// context back to the tag around it. Every bracket is neutral (`hl` paints only the
// Capitalised name, which the next rule takes as its own span).
function trackJsxTag(match: string, _source: string, _index: number, ctx: Ctx): TokenKind {
  ctx.tagDepth = match.startsWith("<") ? ctx.tagDepth + 1 : Math.max(0, ctx.tagDepth - 1);
  ctx.inTag = ctx.tagDepth > 0;
  return "text";
}

const JSX_RULES: Rule[] = [
  // hl: `/(^|\n)(\s*\/\/[^\n]*)/` paints a `//` comment in var(--tx3); a block comment
  // takes the same ink, so a commented sample never splits across two inks.
  { kind: "comment", re: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/" },
  // hl: `/(&quot;[^&]*&quot;)/` paints a string literal in var(--mint); a single-quoted
  // or template literal is the same kind of token and takes the same ink.
  {
    kind: "string",
    re: "\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'|`(?:\\\\.|[^`\\\\])*`",
  },
  // The arrow is consumed whole so its `>` never closes a tag.
  { kind: "text", re: "=>" },
  // hl: `/(&lt;\/?)([A-Z][\w.]*)/` keeps `<` and `</` neutral and paints the
  // Capitalised name after them in var(--ion-tx). The bracket (with its slash) is one
  // neutral span that opens the tag context; the name is the next rule's span.
  { kind: "text", re: "<\\/?(?=[A-Za-z])|\\/?>", classify: trackJsxTag },
  // A dotted name is one span, so `<Card.Header>` keeps hl's `[A-Z][\w.]*` name whole.
  {
    kind: "text",
    re: "[A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*",
    classify: (match, source, index, ctx) => {
      const before = source[index - 1];
      const afterTagOpen = before === "<" || (before === "/" && source[index - 2] === "<");
      // hl: `([A-Z][\w.]*)` right after `<` or `</` is the component name, in the accent.
      if (afterTagOpen) return /^[A-Z]/.test(match) ? "component" : "text";
      // hl: `(\s)([a-z][\w-]*)(=)` is an attribute name before its `=`, in var(--cyan);
      // a bare boolean attribute has no `=` and stays neutral.
      if (ctx.inTag && /^[a-z]/.test(match) && source[index + match.length] === "=") return "attr";
      return "text";
    },
  },
];

// --- json --------------------------------------------------------------------

const JSON_RULES: Rule[] = [
  { kind: "attr", re: "\"(?:\\\\.|[^\"\\\\])*\"(?=\\s*:)" },
  { kind: "string", re: "\"(?:\\\\.|[^\"\\\\])*\"" },
  { kind: "number", re: "-?\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b" },
  { kind: "keyword", re: "\\b(?:true|false|null)\\b" },
];

// --- shell -------------------------------------------------------------------

const SH_KEYWORDS = new Set([
  "case", "do", "done", "elif", "else", "esac", "except", "export", "fi", "for",
  "function", "if", "in", "local", "return", "set", "source", "sudo", "then",
  "while",
]);

// A word is at command position when only whitespace separates it from the line
// start or from a `&&`, `||`, `|`, or `;` connective.
function atCommandPosition(source: string, index: number): boolean {
  const lineStart = source.lastIndexOf("\n", index - 1) + 1;
  const before = source.slice(lineStart, index);
  return /^\s*$|(?:&&|\|\|?|;)\s*$/.test(before);
}

const SH_RULES: Rule[] = [
  { kind: "comment", re: "#[^\\n]*" },
  { kind: "string", re: "\"(?:\\\\.|[^\"\\\\])*\"|'[^']*'" },
  { kind: "var", re: "\\$\\{[^}]*\\}|\\$[A-Za-z_]\\w*|\\$\\d" },
  {
    kind: "attr",
    re: "--?[A-Za-z][\\w-]*",
    // Only a whitespace-preceded token is a flag; `foo-bar` mid-word stays text.
    classify: (m, source, index) =>
      index === 0 || /\s/.test(source[index - 1] ?? "") ? "attr" : "text",
  },
  { kind: "number", re: "\\b\\d+(?:\\.\\d+)?\\b" },
  {
    kind: "text",
    re: "[A-Za-z_][\\w-]*",
    classify: (m, source, index) => {
      if (SH_KEYWORDS.has(m)) return "keyword";
      return atCommandPosition(source, index) ? "fn" : "text";
    },
  },
];

// --- css ---------------------------------------------------------------------

const CSS_RULES: Rule[] = [
  { kind: "comment", re: "\\/\\*[\\s\\S]*?\\*\\/" },
  { kind: "string", re: "\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'" },
  { kind: "keyword", re: "@[\\w-]+" },
  { kind: "number", re: "#[0-9a-fA-F]{3,8}\\b" },
  {
    kind: "number",
    re: "\\b\\d+(?:\\.\\d+)?(?:px|rem|em|vh|vw|vmin|vmax|ms|s|deg|fr|%)?",
  },
  { kind: "attr", re: "[A-Za-z-]+(?=\\s*:)" },
  { kind: "tag", re: "\\.[A-Za-z_][\\w-]*" },
];

// --- html --------------------------------------------------------------------

const HTML_RULES: Rule[] = [
  { kind: "comment", re: "<!--[\\s\\S]*?-->" },
  { kind: "string", re: "\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'" },
  { kind: "tag", re: "<\\/?[A-Za-z][\\w-]*|\\/?>", classify: trackTag },
  {
    kind: "text",
    re: "[A-Za-z-][\\w-]*",
    classify: (_m, _s, _i, ctx) => (ctx.inTag ? "attr" : "text"),
  },
];

// --- python ------------------------------------------------------------------

const PY_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def",
  "del", "elif", "else", "except", "False", "finally", "for", "from", "global",
  "if", "import", "in", "is", "lambda", "None", "nonlocal", "not", "or", "pass",
  "raise", "return", "True", "try", "while", "with", "yield",
]);

const PY_RULES: Rule[] = [
  { kind: "comment", re: "#[^\\n]*" },
  {
    kind: "string",
    re: "\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'",
  },
  { kind: "tag", re: "@[A-Za-z_]\\w*" },
  { kind: "number", re: "\\b\\d+(?:\\.\\d+)?\\b" },
  { kind: "text", re: "[A-Za-z_]\\w*", classify: classifyIdent(PY_KEYWORDS) },
];

// --- language registry -------------------------------------------------------

const GRAMMARS: Record<string, Rule[]> = {
  ts: TS_RULES,
  jsx: JSX_RULES,
  json: JSON_RULES,
  bash: SH_RULES,
  css: CSS_RULES,
  html: HTML_RULES,
  python: PY_RULES,
};

const ALIASES: Record<string, string> = {
  ts: "ts", js: "ts", mjs: "ts", cjs: "ts", typescript: "ts", javascript: "ts",
  tsx: "jsx", jsx: "jsx",
  json: "json", jsonc: "json",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash", console: "bash",
  css: "css", scss: "css",
  html: "html", xml: "html", svg: "html",
  python: "python", py: "python",
};

/** Resolve a `language` prop to a supported grammar key, or undefined. */
export function resolveLanguage(language?: string): string | undefined {
  if (!language) return undefined;
  return ALIASES[language.toLowerCase()];
}

// Split a flat token stream on newlines into per-line span arrays. Every line is
// present (an empty line is an empty array), so line indices match source lines.
function toLines(flat: CodeToken[]): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const token of flat) {
    const parts = token.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind: token.kind });
    });
  }
  return lines;
}

/**
 * Tokenize `code` into per-line spans for the given language. Unknown or absent
 * languages yield monochrome lines (every span kind "text"), so rendering never
 * branches on highlight support.
 */
export function tokenize(code: string, language?: string): CodeToken[][] {
  const source = code.replace(/\r\n/g, "\n");
  const grammar = resolveLanguage(language);
  const rules = grammar ? GRAMMARS[grammar] : undefined;
  if (!rules) return toLines([{ text: source, kind: "text" }]);

  const master = new RegExp(rules.map((r) => `(${r.re})`).join("|"), "g");
  const ctx: Ctx = { inTag: false, tagDepth: 0 };
  const flat: CodeToken[] = [];
  let last = 0;
  for (const m of source.matchAll(master)) {
    const index = m.index ?? 0;
    if (index > last) flat.push({ text: source.slice(last, index), kind: "text" });
    let kind: TokenKind = "text";
    for (let g = 0; g < rules.length; g++) {
      if (m[g + 1] !== undefined) {
        const rule = rules[g];
        kind = rule.classify ? rule.classify(m[0], source, index, ctx) : rule.kind;
        break;
      }
    }
    flat.push({ text: m[0], kind });
    last = index + m[0].length;
  }
  if (last < source.length) flat.push({ text: source.slice(last), kind: "text" });
  return toLines(flat);
}

// The light scheme's code inks: the hand-off's cyan, mint and amber series (chart 2 to 4,
// oklch .62 .13 205, .66 .15 165 and .64 .15 70) sit near 3:1 on the light code well, so
// each is walked down in oklch lightness at its own hue and chroma until it clears 4.5:1
// on the well and on every palette's highlighted row (test/code-block-look.test.ts). The
// dark scheme's series clear it as drawn.
const LIGHT_INK = {
  tag: oklchHex(0.485, 0.13, 205),
  string: oklchHex(0.48, 0.15, 165),
  number: oklchHex(0.52, 0.15, 70),
} as const;

/**
 * The theme-aware color for a token kind: the hand-off's code inks (cv-kit-code3.js
 * `hl`, and the component page's `hl` at Component.dc.html line 324 for the jsx
 * grammar). Keywords and component tag names in the accent's text ink
 * (`var(--ion-tx)`), strings in mint (`var(--mint)`), numbers in amber, tags and
 * attributes in cyan (`var(--cyan)`), comments in the subtle ink (`var(--tx3)`). `dark`
 * says the code sits on a dark bed: the dark scheme's own tokens, or the terminal's
 * fixed dark window in any scheme, which takes the dark scheme's inks.
 */
export function syntaxColor(kind: TokenKind, tokens: ColorTokens, dark: boolean): string {
  const t = dark && tokens.background !== darkColors.background ? darkColors : tokens;
  switch (kind) {
    case "comment":
      return t["subtle-foreground"] ?? t["muted-foreground"];
    case "string":
      return dark ? t["chart-3"] : LIGHT_INK.string;
    case "keyword":
    case "component":
      return t["primary-text"] ?? t.primary;
    case "number":
      return dark ? t["chart-4"] : LIGHT_INK.number;
    case "tag":
    case "attr":
      return dark ? t["chart-2"] : LIGHT_INK.tag;
    default:
      return t.foreground;
  }
}
