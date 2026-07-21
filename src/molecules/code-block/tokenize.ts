import { type ColorTokens, palette } from "../../style/index.js";

// Dependency-free syntax tokenizer for CodeBlock. Line-based output: each source
// line becomes an array of { text, kind } spans, rendered as nested <Text> nodes,
// so the same tokenizer colors code identically on iOS, Android, and the web (no
// DOM, no WASM, no async grammar loading). Coverage is deliberately curated to the
// languages a UI-kit code block actually shows — TypeScript/JavaScript (with JSX),
// JSON, shell, CSS, HTML, and Python — with a monochrome fallback for anything
// else. It is a display highlighter, not a parser: rules are ordered regex
// alternatives with a small amount of carried context (inside-a-JSX-tag, shell
// command position), which is the same trade every lightweight highlighter makes.

export type TokenKind =
  | "text"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "tag"
  | "attr"
  | "fn"
  | "var";

export interface CodeToken {
  text: string;
  kind: TokenKind;
}

// Mutable context threaded through one tokenize pass, letting a rule's classifier
// see where it is (inside a JSX/HTML tag, at a shell command position).
interface Ctx {
  inTag: boolean;
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
  json: JSON_RULES,
  bash: SH_RULES,
  css: CSS_RULES,
  html: HTML_RULES,
  python: PY_RULES,
};

const ALIASES: Record<string, string> = {
  ts: "ts", tsx: "ts", js: "ts", jsx: "ts", mjs: "ts", cjs: "ts",
  typescript: "ts", javascript: "ts",
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
  const ctx: Ctx = { inTag: false };
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

/**
 * The theme-aware color for a token kind. Colors approximate the familiar
 * GitHub light/dark ramps, drawn from the Tailwind palette so both schemes stay
 * legible on the muted code surface; the terminal variant passes `dark: true`
 * unconditionally because its window is fixed dark in every scheme.
 */
export function syntaxColor(kind: TokenKind, tokens: ColorTokens, dark: boolean): string {
  switch (kind) {
    case "comment":
      return tokens["muted-foreground"];
    case "string":
      return dark ? palette["green-400"] : palette["green-700"];
    case "keyword":
      return dark ? palette["violet-400"] : palette["violet-700"];
    case "number":
      return dark ? palette["amber-400"] : palette["amber-600"];
    case "tag":
      return dark ? palette["sky-400"] : palette["sky-700"];
    case "attr":
      return dark ? palette["cyan-400"] : palette["cyan-700"];
    case "fn":
      return dark ? palette["blue-400"] : palette["blue-700"];
    case "var":
      return dark ? palette["rose-400"] : palette["rose-700"];
    default:
      return tokens.foreground;
  }
}
