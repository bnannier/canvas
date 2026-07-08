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
}

export interface PropGroup {
  /** The exported interface name, e.g. "ButtonProps" or "AvatarGroupProps". */
  name: string;
  props: PropDoc[];
}

// One Program over the whole kit source so the checker resolves cross-file type
// references (a `Pick<>` of a react-native type, an imported union). Built once and
// reused across every component.
let PROGRAM: ts.Program | null = null;
function program(): ts.Program {
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

// A member's description: its own `/** */` JSDoc, else the `//` line comment
// immediately above it (the kit introduces boolean axes with a group `//` line
// rather than per-prop JSDoc), else empty. The source is returned so the caller can
// carry a group `//` comment forward across the axis's later members.
function describe(checker: ts.TypeChecker, sym: ts.Symbol): { desc: string; source: DescSource } {
  const jsdoc = ts.displayPartsToString(sym.getDocumentationComment(checker)).replace(/\s+/g, " ").trim();
  if (jsdoc) return { desc: jsdoc, source: "jsdoc" };
  const decl = (sym.getDeclarations() ?? [])[0];
  if (decl) {
    const full = decl.getSourceFile().getFullText();
    const ranges = ts.getLeadingCommentRanges(full, decl.getFullStart()) ?? [];
    const line = [...ranges].reverse().find((r) => r.kind === ts.SyntaxKind.SingleLineCommentTrivia);
    if (line) {
      const text = full.slice(line.pos, line.end).replace(/^\/\/\s?/, "").trim();
      if (text) return { desc: text, source: "line" };
    }
  }
  return { desc: "", source: "none" };
}

// Source-order sort key: own-file members in declaration order first, then any
// composed-in (Pick/extends) members from other files.
function orderKey(sym: ts.Symbol, homeFile: string): [number, number] {
  const decl = (sym.getDeclarations() ?? [])[0];
  if (!decl) return [2, 0];
  const same = decl.getSourceFile().fileName === homeFile;
  return [same ? 0 : 1, decl.getStart()];
}

function buildProps(checker: ts.TypeChecker, type: ts.Type, node: ts.Declaration): PropDoc[] {
  const homeFile = node.getSourceFile().fileName;
  const symbols = [...checker.getPropertiesOfType(type)].sort((a, b) => {
    const ka = orderKey(a, homeFile);
    const kb = orderKey(b, homeFile);
    return ka[0] - kb[0] || ka[1] - kb[1];
  });

  let carry = "";
  const out: PropDoc[] = [];
  for (const sym of symbols) {
    const { desc, source } = describe(checker, sym);
    let description: string;
    if (source === "jsdoc") {
      description = desc;
      carry = ""; // a documented prop ends the current axis group
    } else if (source === "line") {
      description = desc;
      carry = desc; // a group `//` header carries to the axis's later booleans
    } else {
      description = carry;
    }
    const optional = isOptional(sym);
    out.push({ name: sym.getName(), type: typeText(checker, sym, optional), required: !optional, description });
  }
  return out;
}

/**
 * Extract the prop groups for each component directory. `dirs` pairs a docs dir key
 * with one source file to scan; pass a dir more than once to fold several files
 * into it (e.g. `charts.shared.tsx` plus `charts-viz.tsx`). Every exported
 * interface/type alias whose name ends in `Props` becomes a group, in file order,
 * de-duplicated by name so a re-exported interface is not listed twice.
 */
export function extractProps(dirs: { dir: string; file: string }[]): Record<string, PropGroup[]> {
  const prog = program();
  const checker = prog.getTypeChecker();
  const out: Record<string, PropGroup[]> = {};
  const seen = new Map<string, Set<string>>();

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
      const props = buildProps(checker, type, node);
      if (props.length) {
        groups.push({ name, props });
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
