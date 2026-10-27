// Build-time prop-table extraction (used by tools/docgen/generate.ts).
//
// Reads each component's exported `*Props` interface(s) with the TypeScript
// compiler API (already a dependency) and emits structured {name, type, required,
// description} rows. Because it resolves types through the real checker, composed
// interfaces (`Pick<RNTextInputProps, …>`, `extends`) expand to their concrete
// members, and union/literal types render exactly as written. The result feeds the
// generated docs prop tables, so the documented props never drift from the source.

import * as ts from "typescript";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");

export interface PropDoc {
  name: string;
  /** The type as written (own members) or resolved by the checker (composed members). */
  type: string;
  required: boolean;
  description: string;
  /**
   * The value the component takes when the prop is omitted, as source text: the literal
   * initializer the shell gives it where it destructures its props (`"md"`, `40`, `true`),
   * `false` for an optional boolean with none, and absent for anything else (a computed
   * default is the component's behavior, which the description states).
   */
  default?: string;
  /** Index into the group's `groups`: the `//` axis header the prop sits under. */
  group?: number;
}

/** One `//` axis header of an interface: the run of booleans (or other props) under it. */
export interface PropAxis {
  /** The header's name: its text before the first "(", ":" or sentence end ("Intent", "Size"). */
  title: string;
  /** The header says "pick one": the axis's booleans are mutually exclusive. */
  pickOne: boolean;
  /** The whole header, when it says more than its title. */
  note?: string;
}

export interface PropGroup {
  /** The exported interface name, e.g. "ButtonProps" or "AvatarGroupProps". */
  name: string;
  props: PropDoc[];
  /** The interface's `//` axis headers, in source order; a prop's `group` indexes them. */
  groups: PropAxis[];
  /**
   * The shared interfaces the props inherit whole and are documented once, not row by
   * row (INHERITED_INTERFACES), as the interface writes its heritage: `MeasureProps`,
   * `Omit<CartesianSeriesProps, "series">`. Their members are not in `props`.
   */
  inherits: string[];
}

// One Program over the whole kit source so the checker resolves cross-file type
// references (a `Pick<>` of a react-native type, an imported union). Built once and
// reused across every component.
let PROGRAM: ts.Program | null = null;
/** A file whose Props interfaces feed a dir's prop tables: a shared `.tsx`, not a platform fork or a test. */
export const isPropSource = (name: string) =>
  name.endsWith(".tsx") && !/\.(ios|android|web)\.tsx$/.test(name) && !/\.test\.tsx$/.test(name);

export function program(): ts.Program {
  if (PROGRAM) return PROGRAM;
  const configPath = path.join(REPO, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile).config;
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, REPO);
  PROGRAM = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
  return PROGRAM;
}

// Shared mixin prop types that are documented through the components that consume
// them, not on their own page. Their members are expanded (via the checker) into
// each consuming component's group, so emitting them standalone would just repeat
// those rows. `TextEntryProps` is Input/Textarea's react-native text-entry passthrough.
const MIXIN_PROP_TYPES = new Set(["TextEntryProps"]);

// Interfaces whose members are documented elsewhere (a gallery, not a table) and
// so are omitted from a consuming component's prop rows even though they compose
// in. `IconGlyphProps` is the generated one-boolean-per-glyph name axis (400+
// props); the `<Icon set />` gallery is its reference, so listing every glyph as
// a table row would bury Icon's real props. `IconInternalProps` is the kit-internal
// raw-string paint channel (`color`), deliberately kept off the published surface
// (it is the escape hatch the "No styling escape hatches" directive bans publicly;
// consumers use the semantic color booleans).
const OMIT_MEMBER_INTERFACES = new Set(["IconGlyphProps", "IconInternalProps"]);

// Shared interfaces many components extend unchanged, documented once (their own group,
// emitted by extractInherited) and named in a consuming group's `inherits` instead of
// repeating their rows: the measure axis's 14 width steps on every field and button, the
// cartesian series props on every series chart.
export const INHERITED_INTERFACES = ["MeasureProps", "CartesianSeriesProps"] as const;
const INHERITED = new Set<string>(INHERITED_INTERFACES);

// A very long resolved type (e.g. react-native's `autoComplete` 50-value union)
// would bloat both props.ts and the rendered cell; cap it so the table stays
// readable. Own-member annotations are almost always short and pass through whole.
const MAX_TYPE = 160;
function clampType(t: string, optional: boolean): string {
  let s = t.replace(/\s+/g, " ").trim();
  // Optionality is shown by the required column, so drop a redundant top-level
  // `| undefined` the checker adds for composed-in optional members, and the
  // leading `|` a multiline union annotation collapses to.
  if (optional) s = s.replace(/\s*\|\s*undefined$/, "").replace(/^undefined\s*\|\s*/, "");
  s = s.replace(/^\|\s*/, "");
  return s.length > MAX_TYPE ? `${s.slice(0, MAX_TYPE - 1)}…` : s;
}

// A prop is required unless its declaration carries a `?`.
function isOptional(sym: ts.Symbol): boolean {
  const decls = sym.getDeclarations() ?? [];
  if (decls.some((d) => (ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) && !!d.questionToken)) return true;
  return (sym.getFlags() & ts.SymbolFlags.Optional) !== 0;
}

// Prefer the written annotation text for own members (keeps `ReactNode`,
// `"small" | "large"` exactly as authored); fall back to the checker's rendering
// for members with no explicit annotation node (rare) or composed-in members.
function typeText(checker: ts.TypeChecker, sym: ts.Symbol, optional: boolean): string {
  const decl = (sym.getDeclarations() ?? [])[0];
  if (decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type) {
    return clampType(decl.type.getText(), optional);
  }
  const at = decl ?? sym.valueDeclaration;
  if (!at) return "";
  const t = checker.getTypeOfSymbolAtLocation(sym, at);
  return clampType(checker.typeToString(t, at, ts.TypeFormatFlags.NoTruncation), optional);
}

type DescSource = "jsdoc" | "line" | "none";

// A member's description: its own `/** */` JSDoc, else the `//` comment immediately
// above it (the kit introduces boolean axes with a group `//` comment rather than
// per-prop JSDoc), else empty. A `//` comment that wraps is one comment run over
// several lines, so the run is read whole: the last `//` line and every `//` line
// directly above it with no blank line between. The source is returned so the
// caller can carry a group `//` comment forward across the axis's later members.
function describe(checker: ts.TypeChecker, sym: ts.Symbol): { desc: string; source: DescSource } {
  const jsdoc = ts.displayPartsToString(sym.getDocumentationComment(checker)).replace(/\s+/g, " ").trim();
  if (jsdoc) return { desc: jsdoc, source: "jsdoc" };
  const decl = (sym.getDeclarations() ?? [])[0];
  if (decl) {
    const full = decl.getSourceFile().getFullText();
    const text = lineCommentRun(full, ts.getLeadingCommentRanges(full, decl.getFullStart()) ?? []);
    if (text) return { desc: text, source: "line" };
  }
  return { desc: "", source: "none" };
}

// The text of the last run of `//` lines among a member's leading comments, joined
// with single spaces: two `//` lines belong to one run when only a line break and
// indentation separate them, so a blank line (or a block comment) ends the run. A
// line's list bullet (`- `) is dropped, since the table cell is prose.
function lineCommentRun(full: string, ranges: readonly ts.CommentRange[]): string {
  const isLine = (r: ts.CommentRange) => r.kind === ts.SyntaxKind.SingleLineCommentTrivia;
  let last = ranges.length - 1;
  while (last >= 0 && !isLine(ranges[last])) last--;
  if (last < 0) return "";
  let first = last;
  while (first > 0 && isLine(ranges[first - 1]) && /^[ \t]*\r?\n[ \t]*$/.test(full.slice(ranges[first - 1].end, ranges[first].pos))) first--;
  return ranges
    .slice(first, last + 1)
    .map((r) => full.slice(r.pos, r.end).replace(/^\/\/\s*/, "").replace(/^[-*]\s+/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// The `//` run nearest above a member among its leading comments, or "".
function axisHeader(sym: ts.Symbol): string {
  const decl = (sym.getDeclarations() ?? [])[0];
  if (!decl) return "";
  const full = decl.getSourceFile().getFullText();
  return lineCommentRun(full, ts.getLeadingCommentRanges(full, decl.getFullStart()) ?? []);
}

// Source-order sort key: own-file members in declaration order first, then any
// composed-in (Pick/extends) members from other files.
function orderKey(sym: ts.Symbol, homeFile: string): [number, number] {
  const decl = (sym.getDeclarations() ?? [])[0];
  if (!decl) return [2, 0];
  const same = decl.getSourceFile().fileName === homeFile;
  return [same ? 0 : 1, decl.getStart()];
}

// The interface a member is declared on, when it is declared on one.
function declaringInterface(sym: ts.Symbol): ts.InterfaceDeclaration | undefined {
  const parent = (sym.getDeclarations() ?? [])[0]?.parent;
  return parent && ts.isInterfaceDeclaration(parent) ? parent : undefined;
}

/**
 * An axis header's parts: its title is the text before the first "(", ":" or sentence
 * end ("Intent (pick one; default is the primary action)." is "Intent", "Gutters:
 * horizontal padding (pick one)" is "Gutters"), it is a pick-one axis when it says
 * "pick one" anywhere ("Tone (single-series only; pick one; default primary)"), and its
 * note is the whole header when that says more than the title.
 */
export function parseAxis(header: string): PropAxis {
  const text = header.replace(/\s+/g, " ").trim();
  const head = /^(.*?)(?:\s*\(|:|\.(?=\s|$))/.exec(text);
  const title = (head?.[1] ?? text).trim() || text;
  const pickOne = /\bpick one\b/i.test(text);
  const bare = text.replace(/[.:]\s*$/, "").trim();
  return bare === title ? { title, pickOne } : { title, pickOne, note: text };
}

// A literal initializer's source text: a string (as a JSON string), a number, a negative
// number, true, false or null. Anything else (an expression, an identifier, a call) is a
// computed default and returns undefined.
function literalText(e: ts.Expression): string | undefined {
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return JSON.stringify(e.text);
  if (ts.isNumericLiteral(e)) return e.text;
  if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand)) return `-${e.operand.text}`;
  if (e.kind === ts.SyntaxKind.TrueKeyword) return "true";
  if (e.kind === ts.SyntaxKind.FalseKeyword) return "false";
  if (e.kind === ts.SyntaxKind.NullKeyword) return "null";
  return undefined;
}

// Whether `type` is the props type itself or carries it (an intersection such as
// `ButtonProps & { ref }`, an instantiation of a generic props interface).
function carriesProps(type: ts.Type, propsType: ts.Type): boolean {
  if (type === propsType) return true;
  const symbol = propsType.aliasSymbol ?? propsType.getSymbol();
  if (symbol && (type.aliasSymbol === symbol || type.getSymbol() === symbol)) return true;
  return type.isIntersection() && type.types.some((t) => carriesProps(t, propsType));
}

/**
 * The defaults a component's shell writes where it destructures its props: every object
 * binding pattern in the dir's source files whose destructured value is the props type
 * (a `const { size = "md" } = props`, a `({ open = false }: DialogProps)` parameter).
 * A name maps to its literal initializer's text, or to null when a shell initializes it
 * with a computed expression or two shells disagree, so no default is claimed for it.
 */
function shellDefaults(checker: ts.TypeChecker, files: readonly ts.SourceFile[], propsType: ts.Type): Map<string, string | null> {
  const out = new Map<string, string | null>();
  const visit = (node: ts.Node) => {
    if (ts.isObjectBindingPattern(node) && carriesProps(checker.getTypeAtLocation(node), propsType)) {
      for (const el of node.elements) {
        if (el.dotDotDotToken || !el.initializer) continue;
        const key = el.propertyName ?? el.name;
        if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) continue;
        const name = key.text;
        const literal = literalText(el.initializer);
        if (literal === undefined) out.set(name, null);
        else if (!out.has(name)) out.set(name, literal);
        else if (out.get(name) !== literal) out.set(name, null);
      }
    }
    ts.forEachChild(node, visit);
  };
  for (const file of files) visit(file);
  return out;
}

// The heritage of a props declaration as written: an interface's `extends` types, a type
// alias's intersection members.
function heritageTexts(node: ts.Declaration): string[] {
  if (ts.isInterfaceDeclaration(node)) return (node.heritageClauses ?? []).flatMap((c) => c.types.map((t) => t.getText()));
  if (!ts.isTypeAliasDeclaration(node)) return [];
  const out: string[] = [];
  const visit = (t: ts.TypeNode) => (ts.isIntersectionTypeNode(t) ? t.types.forEach(visit) : out.push(t.getText()));
  visit(node.type);
  return out;
}

function buildProps(
  checker: ts.TypeChecker,
  type: ts.Type,
  node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
  shell: readonly ts.SourceFile[],
): Omit<PropGroup, "name"> {
  const homeFile = node.getSourceFile().fileName;
  const symbols = [...checker.getPropertiesOfType(type)].sort((a, b) => {
    const ka = orderKey(a, homeFile);
    const kb = orderKey(b, homeFile);
    return ka[0] - kb[0] || ka[1] - kb[1];
  });
  const defaults = shellDefaults(checker, shell, type);

  let carry = "";
  const out: PropDoc[] = [];
  const groups: PropAxis[] = [];
  const inherited: string[] = [];
  // The axis a member sits under: set by a `//` header, kept across the axis's later
  // members (documented or not), and ended where the members move to another interface.
  let group: number | undefined;
  let lastOwner: ts.Node | undefined;
  for (const sym of symbols) {
    const owner = declaringInterface(sym);
    const ownerName = owner?.name.text;
    // Skip members composed in from a gallery-documented interface (e.g. Icon's
    // 400+ generated glyph-name booleans from IconGlyphProps).
    if (ownerName && OMIT_MEMBER_INTERFACES.has(ownerName)) continue;
    // A shared interface's members are documented once, on its own group.
    if (owner && ownerName && INHERITED.has(ownerName) && owner !== node) {
      if (!inherited.includes(ownerName)) inherited.push(ownerName);
      continue;
    }
    const parentNode = (sym.getDeclarations() ?? [])[0]?.parent;
    if (parentNode !== lastOwner) group = undefined;
    lastOwner = parentNode;
    const { desc, source } = describe(checker, sym);
    let description: string;
    if (source === "jsdoc") {
      description = desc;
      carry = ""; // a documented prop ends the current axis group's description
    } else if (source === "line") {
      description = desc;
      carry = desc; // a group `//` header carries to the axis's later booleans
    } else {
      description = carry;
    }
    // An axis header is the `//` run nearest above the member, a JSDoc between them or not
    // ("// Overlaid glyph mode." over a documented `leadingIcon`).
    const header = axisHeader(sym);
    if (header) {
      groups.push(parseAxis(header));
      group = groups.length - 1;
    }
    const optional = isOptional(sym);
    const typeString = typeText(checker, sym, optional);
    const row: PropDoc = { name: sym.getName(), type: typeString, required: !optional, description };
    const written = defaults.get(row.name);
    const fallback = optional && typeString === "boolean" && !defaults.has(row.name) ? "false" : undefined;
    const value = written ?? fallback;
    if (value !== undefined) row.default = value;
    if (group !== undefined) row.group = group;
    out.push(row);
  }
  const heritage = heritageTexts(node);
  const inherits = inherited.map((name) => heritage.find((h) => new RegExp(`\\b${name}\\b`).test(h)) ?? name);
  return { props: out, groups, inherits };
}

// forwardRef adds ref to the returned component, not to its input Props
// interface. Resolve that public call signature so the table documents the
// real host type, including factories such as Input that already forward refs.
function factoryRef(checker: ts.TypeChecker, source: ts.SourceFile, propsName: string, propsType: ts.Type): PropDoc | undefined {
  const module = checker.getSymbolAtLocation(source);
  if (!module) return undefined;
  const factory = checker.getExportsOfModule(module).find((symbol) => symbol.name === `create${propsName.slice(0, -5)}`);
  if (!factory) return undefined;
  const component = checker.getTypeOfSymbolAtLocation(factory, source).getCallSignatures()[0]?.getReturnType();
  const parameter = component?.getCallSignatures()[0]?.getParameters()[0];
  if (!parameter) return undefined;
  const publicProps = checker.getTypeOfSymbolAtLocation(parameter, source);
  // The naming convention locates a candidate, not proof of ownership. Require
  // the exact exported props type in the public signature: structurally equal
  // but unrelated interfaces must not borrow another component's ref metadata.
  const includesProps = (type: ts.Type): boolean => type === propsType
    || (type.isIntersection() && type.types.some(includesProps));
  if (!includesProps(publicProps)) return undefined;
  const ref = publicProps.getProperty("ref");
  if (!ref) return undefined;
  const refType = checker.getTypeOfSymbolAtLocation(ref, source);
  const description = ts.displayPartsToString(factory.getJsDocTags(checker).find((tag) => tag.name === "ref")?.text)
    .replace(/\s+/g, " ").trim();
  const optional = isOptional(ref);
  return {
    name: "ref",
    type: clampType(checker.typeToString(refType, source, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope), optional),
    required: !optional,
    description: description || "Ref to the underlying React Native host. Supports object refs and callback refs; native methods follow the platform's behavior.",
  };
}

/**
 * Extract the prop groups for each component directory. `dirs` pairs a docs dir key
 * with one source file to scan; pass a dir more than once to fold several files
 * into it (e.g. `charts.shared.tsx` plus `charts-viz.tsx`). Every exported
 * interface/type alias whose name ends in `Props` becomes a group, in file order,
 * de-duplicated by name so a re-exported interface is not listed twice. A group's
 * defaults are read from every file of its dir (the shell may sit beside the props).
 */
export function extractProps(dirs: { dir: string; file: string }[], prog = program()): Record<string, PropGroup[]> {
  const checker = prog.getTypeChecker();
  const out: Record<string, PropGroup[]> = {};
  const seen = new Map<string, Set<string>>();
  const filesOf = new Map<string, ts.SourceFile[]>();
  for (const { dir, file } of dirs) {
    const sf = prog.getSourceFile(file);
    if (sf) filesOf.set(dir, [...(filesOf.get(dir) ?? []), sf]);
  }

  for (const { dir, file } of dirs) {
    const sf = prog.getSourceFile(file);
    if (!sf) continue;
    const groups = out[dir] ?? [];
    const names = seen.get(dir) ?? new Set<string>();
    sf.forEachChild((node) => {
      if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node)) return;
      const exported = (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
      if (!exported) return;
      const name = node.name.text;
      if (!name.endsWith("Props") || MIXIN_PROP_TYPES.has(name) || names.has(name)) return;
      const type = checker.getTypeAtLocation(node);
      const built = buildProps(checker, type, node, filesOf.get(dir) ?? [sf]);
      const ref = factoryRef(checker, sf, name, type);
      if (ref && !built.props.some((prop) => prop.name === "ref")) built.props.push(ref);
      if (built.props.length || built.inherits.length) {
        groups.push({ name, props: built.props, groups: built.groups, inherits: built.inherits });
        names.add(name);
      }
    });
    if (groups.length) {
      out[dir] = groups;
      seen.set(dir, names);
    }
  }
  return out;
}

/**
 * The shared interfaces named in groups' `inherits` (INHERITED_INTERFACES), each as its
 * own group, so their rows are documented once.
 */
export function extractInherited(prog = program()): Record<string, PropGroup> {
  const checker = prog.getTypeChecker();
  const out: Record<string, PropGroup> = {};
  for (const sf of prog.getSourceFiles()) {
    if (sf.isDeclarationFile || !sf.fileName.startsWith(path.join(REPO, "src"))) continue;
    sf.forEachChild((node) => {
      if (!ts.isInterfaceDeclaration(node) || !INHERITED.has(node.name.text)) return;
      const built = buildProps(checker, checker.getTypeAtLocation(node), node, [sf]);
      out[node.name.text] = { name: node.name.text, ...built };
    });
  }
  return Object.fromEntries(INHERITED_INTERFACES.filter((name) => out[name]).map((name) => [name, out[name]]));
}
