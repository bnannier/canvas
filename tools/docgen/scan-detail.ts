// Build-time scans for a component's detail page (used by tools/docgen/generate.ts), each
// read from the component's own source so the page never states what the code does not:
//
//   semantics   what the shell tells assistive tech: its accessibilityRole / role values,
//               the accessibilityState keys it sets, the aria-* props it passes, and the
//               touch-target helpers it meets the platform minimum with.
//   tokens      the colour roles (ColorTokens keys) its skins (`*.styles.ts`) and shell read.
//   related     the components its docs compose it with (the fence tags of its own page),
//               then its section's siblings.
//
// The semantics scan is syntactic (any `.tsx` shell); the token scan asks the TypeScript
// checker which values are ColorTokens, so a skin's local name for its tokens (`t`,
// `tokens`, `theme.tokens`) does not matter.

import * as ts from "typescript";
import * as fs from "node:fs";
import * as path from "node:path";

export interface Semantics {
  /** Every accessibilityRole / role value the shell can set ("button", "link"), "none" left out. */
  roles: string[];
  /** The accessibilityState keys the shell sets ("disabled", "busy", "checked"). */
  states: string[];
  /** The aria-* props the shell passes ("aria-expanded", "aria-haspopup"). */
  aria: string[];
  /**
   * The touch-target mechanisms the shell meets the platform minimum with: the kit's
   * helpers (`useSeededMinTargetSlop`, `minTargetSlop`, `seedSlop`, `platformMinTarget`,
   * `TOUCH_TARGET`; src/style/touch-target.ts) and a `hitSlop` it sets itself.
   */
  touchTarget: string[];
}

const ROLE_PROPS = new Set(["accessibilityRole", "role"]);
const TOUCH_HELPERS = new Set(["useSeededMinTargetSlop", "minTargetSlop", "seedSlop", "platformMinTarget", "TOUCH_TARGET"]);

// Every string literal inside an expression, wherever it sits (a ternary's branches, a
// `??` fallback): the values a role prop can take.
function stringLiterals(node: ts.Node, out: Set<string>) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) out.add(node.text);
  ts.forEachChild(node, (child) => stringLiterals(child, out));
}

// The keys an object literal names (`{ disabled, busy: loading }`).
function objectKeys(node: ts.Expression | undefined, out: Set<string>) {
  if (!node) return;
  const inner = ts.isParenthesizedExpression(node) ? node.expression : node;
  if (!ts.isObjectLiteralExpression(inner)) return;
  for (const p of inner.properties) {
    if ((ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p)) && p.name) {
      if (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) out.add(p.name.text);
    }
  }
}

const nameText = (name: ts.Node): string | undefined =>
  ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;

/** The semantics a set of shell sources declares (see Semantics). */
export function scanSemantics(sources: { file: string; text: string }[]): Semantics {
  const roles = new Set<string>();
  const states = new Set<string>();
  const aria = new Set<string>();
  const touch = new Set<string>();
  for (const { file, text } of sources) {
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node: ts.Node) => {
      // A JSX attribute (`accessibilityRole="button"`) or an object member
      // (`{ accessibilityRole: "image" }`, `{ "aria-busy": loading }`) set the same props.
      let prop: string | undefined;
      let value: ts.Expression | undefined;
      if (ts.isJsxAttribute(node)) {
        prop = ts.isIdentifier(node.name) ? node.name.text : `${node.name.namespace.text}:${node.name.name.text}`;
        const init = node.initializer;
        value = init === undefined ? undefined : ts.isJsxExpression(init) ? init.expression : (init as ts.Expression);
      } else if (ts.isPropertyAssignment(node)) {
        prop = nameText(node.name);
        value = node.initializer;
      }
      if (prop) {
        if (ROLE_PROPS.has(prop) && value) stringLiterals(value, roles);
        else if (prop === "accessibilityState") objectKeys(value, states);
        else if (prop.startsWith("aria-")) aria.add(prop);
        else if (prop === "hitSlop" && ts.isJsxAttribute(node)) touch.add("hitSlop");
      }
      if (ts.isIdentifier(node) && TOUCH_HELPERS.has(node.text) && !ts.isImportSpecifier(node.parent) && !ts.isExportSpecifier(node.parent)) touch.add(node.text);
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  roles.delete("none");
  const sorted = (s: Set<string>) => [...s].sort();
  return { roles: sorted(roles), states: sorted(states), aria: sorted(aria), touchTarget: sorted(touch) };
}

// Whether a type is ColorTokens (or a Partial / Readonly / Required of it).
function isColorTokens(type: ts.Type): boolean {
  const symbol = type.aliasSymbol ?? type.getSymbol();
  if (type.getSymbol()?.getName() === "ColorTokens") return true;
  if (symbol && ["Partial", "Readonly", "Required"].includes(symbol.getName())) {
    return (type.aliasTypeArguments ?? []).some(isColorTokens);
  }
  if (type.isUnion()) {
    const defined = type.types.filter((t) => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
    return defined.length > 0 && defined.every(isColorTokens);
  }
  return false;
}

/**
 * The ColorTokens roles a set of skin files read, sorted: a property or element access on
 * a ColorTokens value (`t.border`, `t["muted-foreground"]`, `theme.tokens.ring`), a
 * destructure of one, and a string literal passed where the whole `keyof ColorTokens` is
 * expected. A role a shared helper reads for the skin (`primaryText(t)`) is the helper's,
 * and is not listed.
 */
export function scanTokens(prog: ts.Program, files: string[]): string[] {
  const checker = prog.getTypeChecker();
  const out = new Set<string>();
  const keys = colorTokenKeys(prog);
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAccessExpression(node) && isColorTokens(checker.getTypeAtLocation(node.expression))) {
      out.add(node.name.text);
    } else if (
      ts.isElementAccessExpression(node) &&
      ts.isStringLiteralLike(node.argumentExpression) &&
      isColorTokens(checker.getTypeAtLocation(node.expression))
    ) {
      out.add(node.argumentExpression.text);
    } else if (ts.isObjectBindingPattern(node) && isColorTokens(checker.getTypeAtLocation(node))) {
      for (const el of node.elements) {
        const key = el.propertyName ?? el.name;
        const text = nameText(key);
        if (text && !el.dotDotDotToken) out.add(text);
      }
    } else if (ts.isStringLiteral(node)) {
      const contextual = checker.getContextualType(node);
      if (contextual?.isUnion()) {
        const literals = contextual.types.filter((t) => t.isStringLiteral()) as ts.StringLiteralType[];
        if (literals.length === keys.size && literals.every((t) => keys.has(t.value))) out.add(node.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  for (const file of files) {
    const sf = prog.getSourceFile(file);
    if (sf) visit(sf);
  }
  return [...out].sort();
}

let TOKEN_KEYS: Set<string> | null = null;
function colorTokenKeys(prog: ts.Program): Set<string> {
  if (TOKEN_KEYS) return TOKEN_KEYS;
  const checker = prog.getTypeChecker();
  const keys = new Set<string>();
  for (const sf of prog.getSourceFiles()) {
    if (!sf.fileName.endsWith(path.join("src", "style", "tokens.ts"))) continue;
    sf.forEachChild((node) => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === "ColorTokens") {
        for (const p of checker.getPropertiesOfType(checker.getTypeAtLocation(node))) keys.add(p.getName());
      }
    });
  }
  TOKEN_KEYS = keys;
  return keys;
}

/**
 * The component exports (capitalized value exports) of each dir's web entry
 * (src/<category>/<dir>/<dir>.tsx), by name: the tags a fence can name, mapped to the dir
 * that documents them (`Row` and `Column` to layout, `CardHeader` to card).
 */
export function exportedTags(prog: ts.Program, dirs: { dir: string; entry: string }[]): Map<string, string> {
  const checker = prog.getTypeChecker();
  const out = new Map<string, string>();
  for (const { dir, entry } of dirs) {
    if (!fs.existsSync(entry)) continue;
    const sf = prog.getSourceFile(entry);
    const module = sf && checker.getSymbolAtLocation(sf);
    if (!module) continue;
    for (const symbol of checker.getExportsOfModule(module)) {
      const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      if (!(resolved.flags & ts.SymbolFlags.Value) || !/^[A-Z]/.test(symbol.name)) continue;
      if (!out.has(symbol.name)) out.set(symbol.name, dir);
    }
  }
  return out;
}

/** At most this many related components on a page. */
export const RELATED_CAP = 8;

/**
 * A component's related components, as URL slugs: the components its own docs fences
 * name, in the order they first appear, then its section's other components in the
 * section's order, without itself, at most RELATED_CAP.
 */
export function relatedSlugs(
  self: string,
  fences: readonly string[],
  tagToSlug: ReadonlyMap<string, string>,
  siblings: readonly string[],
): string[] {
  const out: string[] = [];
  const add = (slug: string | undefined) => {
    if (slug && slug !== self && !out.includes(slug) && out.length < RELATED_CAP) out.push(slug);
  };
  for (const code of fences) for (const m of code.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) add(tagToSlug.get(m[1]));
  for (const slug of siblings) add(slug);
  return out;
}
