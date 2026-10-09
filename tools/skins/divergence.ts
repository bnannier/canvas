// Which components look different per platform, read from source text so it runs in
// plain bun (the styles modules pull in the kit's style layer, so importing them would
// need React Native). One definition of "diverges", read per export and shared by the
// docs' registry guard (docs/scripts/check-platform-skins.ts), which needs every
// divergent build in the three-up registry, the shells gate
// (test/design-rules-shells.test.ts), which lets a shell import an export that looks
// the same everywhere and takes the rest as parts, and the audit facts
// (tools/audit/facts.ts).
//
// A platform entry (`<name>.ios.tsx`, `<name>.android.tsx`) is read one built export at
// a time, because one file can hold builds that differ in kind: Avatar and AvatarGroup
// build from an alias of the web skin while AvatarMenu, in the same file, injects the
// platform's own Dropdown. The reader proves an export is the web build, and whatever
// it cannot prove counts as the platform's own: the safe error is a registry entry the
// docs do not need, never a web build labelled iOS. From the export's initializer it
// follows the entry's top-level consts and the bodies of its local functions, and
// judges what they reach:
//
// - A skin from a styles module is the web build only when it is the same object the
//   web skin resolves to (`iosSkin = webSkin`, a chain of such aliases, a styles
//   re-export), and only where it is handed over as is: a direct argument of the
//   declaration's own factory call (`createX(iosSkin, parts)`, the factory imported
//   from a shell module, `x.shared.js` or `shared.js`), alone in a spread that adds nothing
//   (`createX({ ...iosSkin })`), or through a top-level const that is itself such an
//   alias. Any other use of the web skin builds a skin the reader cannot see, and counts
//   as the platform's own: a spread with overrides (`createX({ ...iosSkin, radius: 4 })`,
//   parenthesised or cast included), a helper call (`createX(tweak(iosSkin))`), a member
//   read, a use inside a local function. A skin that is its own object is the
//   platform's wherever it is used.
// - A platform part (an import of another component's `.ios.js` / `.android.js` build)
//   counts only when the export it imports diverges by this same read, so a Feed that
//   injects the iOS Avatar does not diverge for it: Avatar is the web build on every
//   platform. A part name its module only re-exports from a module that is one build on
//   every platform (Icon's entry re-exports the shared Icon) is the web build too.
// - A namespace import of a styles module or a part is resolved through its member reads
//   (`look.iosSkin`). Read whole, it counts as the platform's own, and so does a default
//   import of either, a part that does not resolve, and a part name its module neither
//   builds nor re-exports.
//
// Both files are parsed with the TypeScript parser rather than matched by regex: a regex
// on `import { iosSkin ... }` once took `iosSkin as dropdownIosSkin` for the component's
// own skin and reported the whole Avatar file as divergent.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";

export type Platform = "iOS" | "Android";

export interface ComponentSkins {
  /** `atoms`, `molecules`, `organisms` or `charts`. */
  group: string;
  /** The component directory, e.g. `button`. */
  dir: string;
  /**
   * The values its platform entries build from their skin (`export const X =`, a
   * destructured `export const { A, B } =`). Names an entry only re-exports from the
   * shared module (a static subcomponent, a helper, a data table) are the same build on
   * every platform and are not listed.
   */
  exports: string[];
  /** Per built export, the platforms whose build diverges from the web build, with the reason. */
  exportDivergence: Record<string, Partial<Record<Platform, string>>>;
  /** The platforms on which any export diverges, with every reason found on that platform. */
  divergent: Partial<Record<Platform, string>>;
  /** Whether the component has platform entries at all. */
  hasPlatformEntries: boolean;
}

export const GROUPS = ["atoms", "molecules", "organisms", "charts"] as const;

const ENTRY: Record<Platform, { ext: string; suffix: string }> = {
  iOS: { ext: ".ios.tsx", suffix: ".ios.js" },
  Android: { ext: ".android.tsx", suffix: ".android.js" },
};

function parse(file: string, source: string): ts.SourceFile {
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
}

function hasExportModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

interface Declaration {
  /** The initializer the name is bound to, or null for a declaration with none. */
  init: ts.Expression | null;
  exported: boolean;
  /** Whether the name is one binding of a destructuring pattern: a piece of the initializer, not the whole. */
  destructured: boolean;
}

/** Every top-level `const` binding of a module, destructured names included. */
function declarations(sf: ts.SourceFile): Map<string, Declaration> {
  const out = new Map<string, Declaration>();
  for (const statement of sf.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const exported = hasExportModifier(statement);
    for (const decl of statement.declarationList.declarations) {
      const init = decl.initializer ?? null;
      if (ts.isIdentifier(decl.name)) out.set(decl.name.text, { init, exported, destructured: false });
      else if (ts.isObjectBindingPattern(decl.name)) {
        for (const element of decl.name.elements) {
          if (ts.isIdentifier(element.name)) out.set(element.name.text, { init, exported, destructured: true });
        }
      }
    }
  }
  return out;
}

/** Every top-level function declaration of a module, by name: the helpers an export may build through. */
function functionDeclarations(sf: ts.SourceFile): Map<string, ts.FunctionDeclaration> {
  const out = new Map<string, ts.FunctionDeclaration>();
  for (const statement of sf.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) out.set(statement.name.text, statement);
  }
  return out;
}

interface ImportBinding {
  /** The name as the exporting module spells it (`default` for a default import, `*` for a namespace). */
  imported: string;
  specifier: string;
  kind: "named" | "default" | "namespace";
}

/** Every value import of a module, by local name. Type-only imports are not values. */
function importBindings(sf: ts.SourceFile): Map<string, ImportBinding> {
  const out = new Map<string, ImportBinding>();
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) continue;
    const specifier = statement.moduleSpecifier.text;
    if (clause.name) out.set(clause.name.text, { imported: "default", specifier, kind: "default" });
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) out.set(bindings.name.text, { imported: "*", specifier, kind: "namespace" });
    else if (bindings) {
      for (const element of bindings.elements) {
        if (element.isTypeOnly) continue;
        out.set(element.name.text, { imported: (element.propertyName ?? element.name).text, specifier, kind: "named" });
      }
    }
  }
  return out;
}

/** The values an entry builds itself: `export const X =` and a destructured `export const { A, B } =`. */
export function builtExports(source: string): string[] {
  const names: string[] = [];
  for (const [name, decl] of declarations(parse("entry.tsx", source))) if (decl.exported) names.push(name);
  return names;
}

/** The source file a relative `.js` specifier names, or null when none exists. */
function resolveSource(fromDir: string, specifier: string): string | null {
  for (const ext of [".ts", ".tsx"]) {
    const path = join(fromDir, specifier.replace(/\.js$/, ext));
    if (existsSync(path)) return path;
  }
  return null;
}

interface Reexport {
  /** The name as the module it comes from spells it. */
  imported: string;
  /** The module it comes from, or null for `export { a as b }` of a local name. */
  specifier: string | null;
}

/** `export { a, b as c } from "./x.js"` and `export { a as b }`, by the exported name. */
function reexports(sf: ts.SourceFile): Map<string, Reexport> {
  const out = new Map<string, Reexport>();
  for (const statement of sf.statements) {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly) continue;
    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
    const specifier = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : null;
    for (const element of statement.exportClause.elements) {
      if (element.isTypeOnly) continue;
      out.set(element.name.text, { imported: (element.propertyName ?? element.name).text, specifier });
    }
  }
  return out;
}

interface StylesModule {
  decls: Map<string, Declaration>;
  reexports: Map<string, Reexport>;
}

const stylesCache = new Map<string, StylesModule>();

function stylesModule(stylesPath: string): StylesModule {
  let mod = stylesCache.get(stylesPath);
  if (!mod) {
    const sf = parse(stylesPath, readFileSync(stylesPath, "utf8"));
    mod = { decls: declarations(sf), reexports: reexports(sf) };
    stylesCache.set(stylesPath, mod);
  }
  return mod;
}

/**
 * The declaration a skin name finally resolves to inside its styles module, following
 * bare-identifier initializers (`export const iosSkin: T = webSkin;`, or two skins
 * naming one `capsuleSkin`). An object literal, a spread, a call: the chain ends there.
 */
function terminal(decls: Map<string, Declaration>, name: string): string {
  const seen = new Set<string>();
  let current = name;
  for (;;) {
    seen.add(current);
    const init = decls.get(current)?.init;
    if (!init || !ts.isIdentifier(init) || !decls.has(init.text) || seen.has(init.text)) return current;
    current = init.text;
  }
}

/**
 * Whether a skin exported by a styles module is the same object as that module's web
 * skin. A module's web skins are its `web*` declarations (`webSkin`, `webMenuSkin`);
 * the platform skin is an alias when it and one of them resolve to the same
 * declaration. A module that only re-exports its skins (Container and Grid take
 * Row and Column's from layout.styles) is read through to the module that declares
 * them. A name that no module declares cannot be shown to be the web skin, so it
 * counts as the platform's own.
 */
export function isWebSkinAlias(stylesPath: string, skinName: string, seen = new Set<string>()): boolean {
  const key = `${stylesPath}#${skinName}`;
  if (seen.has(key)) return false;
  seen.add(key);
  const { decls, reexports: forwarded } = stylesModule(stylesPath);
  if (!decls.has(skinName)) {
    const source = forwarded.get(skinName);
    if (!source) return false;
    if (source.specifier === null) return isWebSkinAlias(stylesPath, source.imported, seen);
    const target = resolveSource(dirname(stylesPath), source.specifier);
    return target ? isWebSkinAlias(target, source.imported, seen) : false;
  }
  const target = terminal(decls, skinName);
  for (const name of decls.keys()) {
    if (/^web/.test(name) && terminal(decls, name) === target) return true;
  }
  return false;
}

/** Whether a node only wraps the expression inside it: parentheses, `as`, `satisfies`, `!`, `<T>`. */
function isWrapper(node: ts.Node): node is ts.ParenthesizedExpression | ts.AsExpression | ts.SatisfiesExpression | ts.NonNullExpression | ts.TypeAssertion {
  return ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node) || ts.isTypeAssertionExpression(node);
}

/** The expression inside any wrappers. */
function unwrap(expr: ts.Expression): ts.Expression {
  let current = expr;
  while (isWrapper(current)) current = current.expression;
  return current;
}

/** The outermost wrapper around a value: the node whose parent is where the value lands. */
function outermost(node: ts.Node): ts.Node {
  let current = node;
  while (isWrapper(current.parent) && current.parent.expression === current) current = current.parent;
  return current;
}

/** Whether a variable declaration is one of the module's top-level consts. */
function isTopLevel(decl: ts.VariableDeclaration): boolean {
  return ts.isVariableDeclarationList(decl.parent) && ts.isVariableStatement(decl.parent.parent) && ts.isSourceFile(decl.parent.parent.parent);
}

/** Whether an identifier reads a value: not a property name, not a name being declared. */
function isValueReference(id: ts.Identifier): boolean {
  const parent = id.parent;
  if ((ts.isPropertyAccessExpression(parent) || ts.isPropertyAssignment(parent) || ts.isJsxAttribute(parent)) && parent.name === id) return false;
  if (ts.isBindingElement(parent) && (parent.name === id || parent.propertyName === id)) return false;
  const declares =
    ts.isVariableDeclaration(parent) ||
    ts.isParameter(parent) ||
    ts.isFunctionDeclaration(parent) ||
    ts.isFunctionExpression(parent) ||
    ts.isClassDeclaration(parent) ||
    ts.isMethodDeclaration(parent) ||
    ts.isPropertyDeclaration(parent);
  return !(declares && parent.name === id);
}

/** How a member of an object literal reads in a reason: its name, or the spread it is. */
function memberLabel(sf: ts.SourceFile, member: ts.ObjectLiteralElementLike): string {
  if (ts.isSpreadAssignment(member)) return `...${member.expression.getText(sf)}`;
  return member.name ? member.name.getText(sf) : member.getText(sf);
}

/** A node's source text on one line, short enough for a reason. */
function snippet(sf: ts.SourceFile, node: ts.Node): string {
  const text = node.getText(sf).replace(/\s+/g, " ");
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}

const isStylesModule = (specifier: string): boolean => /\.styles\.js$/.test(specifier);
const isSharedModule = (specifier: string): boolean => /(^|[./])shared\.js$/.test(specifier);

/** A platform entry or part module, parsed once per path. */
const moduleCache = new Map<string, ts.SourceFile>();

function parsedModule(path: string): ts.SourceFile {
  let sf = moduleCache.get(path);
  if (!sf) {
    sf = parse(path, readFileSync(path, "utf8"));
    moduleCache.set(path, sf);
  }
  return sf;
}

/** The per-export read of a platform module on disk, once per path and platform. */
const verdictCache = new Map<string, Record<string, string | null>>();

function moduleDivergences(path: string, platform: Platform, visiting: Set<string>): Record<string, string | null> {
  const key = `${path}#${platform}`;
  let verdict = verdictCache.get(key);
  if (!verdict) {
    verdict = readEntry(dirname(path), parsedModule(path), platform, new Set([...visiting, key]));
    verdictCache.set(key, verdict);
  }
  return verdict;
}

/**
 * Whether the export a platform part names is the web build, diverges, or cannot be
 * resolved: a name the part's module builds is judged by the same read as any entry; a
 * name it re-exports is followed to a platform module it names, and is the web build when
 * it comes from a module that is one build on every platform; anything else, and a cycle,
 * is unresolved.
 */
function partExport(path: string, name: string, platform: Platform, visiting: Set<string>): "web" | "diverges" | "unresolved" {
  const key = `${path}#${platform}`;
  if (visiting.has(key)) return "unresolved";
  const built = moduleDivergences(path, platform, visiting);
  if (name in built) return built[name] ? "diverges" : "web";
  const forwarded = reexports(parsedModule(path)).get(name);
  if (!forwarded?.specifier) return "unresolved";
  if (!forwarded.specifier.endsWith(ENTRY[platform].suffix)) return "web";
  const target = resolveSource(dirname(path), forwarded.specifier);
  return target ? partExport(target, forwarded.imported, platform, new Set([...visiting, key])) : "unresolved";
}

/** A reference to a styles module's skin that is the same object as its web skin. */
interface WebSkinRef {
  imported: string;
  specifier: string;
  stylesPath: string;
}

/** The read of one parsed platform module: per built export, why it diverges, or null for the web build. */
function readEntry(compDir: string, sf: ts.SourceFile, platform: Platform, visiting: Set<string>): Record<string, string | null> {
  const { suffix } = ENTRY[platform];
  const imports = importBindings(sf);
  const decls = declarations(sf);
  const functions = functionDeclarations(sf);
  const ownDir = basename(compDir);
  const isPart = (specifier: string): boolean => specifier.endsWith(suffix);

  /** The component directory owning a styles import, or null when it does not resolve. */
  const ownerOf = (stylesPath: string | null): string | null => (stylesPath ? basename(dirname(stylesPath)) : null);

  /** A web-skin alias reached in a form that builds a skin of its own. */
  const ownSkin = (ref: WebSkinRef, what: string): string => {
    const owner = ownerOf(ref.stylesPath);
    return owner === ownDir || owner === null ? `builds its own skin (${what})` : `builds a part from ${owner}'s own skin (${what}; ${ref.specifier})`;
  };

  /** The web-skin reference a named import is, or null when it names anything else. */
  const webSkinRef = (binding: { imported: string; specifier: string }): WebSkinRef | null => {
    if (!isStylesModule(binding.specifier)) return null;
    const stylesPath = resolveSource(compDir, binding.specifier);
    return stylesPath && isWebSkinAlias(stylesPath, binding.imported) ? { imported: binding.imported, specifier: binding.specifier, stylesPath } : null;
  };

  /**
   * The web skin an expression is as a whole, through wrappers, top-level consts
   * (`const base = iosSkin`), a namespace member (`look.iosSkin`) and a spread that adds
   * nothing (`{ ...iosSkin }`); null when it is anything else.
   */
  const webSkinOf = (expr: ts.Expression, seen: Set<string>): WebSkinRef | null => {
    const e = unwrap(expr);
    if (ts.isIdentifier(e)) {
      const binding = imports.get(e.text);
      if (binding) return binding.kind === "named" ? webSkinRef(binding) : null;
      const local = decls.get(e.text);
      if (!local?.init || local.destructured || seen.has(e.text)) return null;
      return webSkinOf(local.init, new Set([...seen, e.text]));
    }
    if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression)) {
      const binding = imports.get(e.expression.text);
      return binding?.kind === "namespace" ? webSkinRef({ imported: e.name.text, specifier: binding.specifier }) : null;
    }
    if (ts.isObjectLiteralExpression(e) && e.properties.length === 1 && ts.isSpreadAssignment(e.properties[0])) return webSkinOf(e.properties[0].expression, seen);
    return null;
  };

  /** Whether a call is a top-level declaration's own factory call, the factory imported from a shell module (`x.shared.js`, `shared.js`). */
  const isFactoryRoot = (call: ts.CallExpression): boolean => {
    const callee = unwrap(call.expression);
    let specifier: string | null = null;
    if (ts.isIdentifier(callee)) {
      const binding = imports.get(callee.text);
      specifier = binding?.kind === "named" ? binding.specifier : null;
    } else if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
      const binding = imports.get(callee.expression.text);
      specifier = binding?.kind === "namespace" ? binding.specifier : null;
    }
    if (!specifier || !isSharedModule(specifier)) return false;
    const at = outermost(call);
    return ts.isVariableDeclaration(at.parent) && at.parent.initializer === at && isTopLevel(at.parent);
  };

  /**
   * Why a reference to the web skin builds a skin of its own, judged by where it lands;
   * empty where it is handed over as is. `judged` keeps one reason per object literal.
   */
  const webSkinUse = (node: ts.Node, ref: WebSkinRef, judged: Set<ts.Node>): string[] => {
    const at = outermost(node);
    const parent = at.parent;
    if (ts.isSpreadAssignment(parent) && ts.isObjectLiteralExpression(parent.parent)) {
      const literal = parent.parent;
      const added = literal.properties.filter((member) => member !== parent);
      if (!added.length) return webSkinUse(literal, ref, judged);
      if (judged.has(literal)) return [];
      judged.add(literal);
      return [ownSkin(ref, `a spread of ${ref.imported}, the web skin, with ${added.map((member) => memberLabel(sf, member)).join(", ")}`)];
    }
    if (ts.isCallExpression(parent) && parent.arguments.some((arg) => arg === at)) {
      if (isFactoryRoot(parent)) return [];
      return [ownSkin(ref, `${ref.imported}, the web skin, handed to ${snippet(sf, parent.expression)}(), which the reader does not follow`)];
    }
    if (ts.isVariableDeclaration(parent) && parent.initializer === at && ts.isIdentifier(parent.name) && isTopLevel(parent)) return [];
    return [ownSkin(ref, `${ref.imported}, the web skin, read in \`${snippet(sf, parent)}\`, a form the reader does not follow`)];
  };

  /** Why a part diverges, or null when the export it names is the web build. */
  const partReason = (binding: { imported: string; specifier: string }): string | null => {
    const path = resolveSource(compDir, binding.specifier);
    if (!path) return `injects platform parts (${binding.specifier}, which does not resolve; counted as the platform's own)`;
    const verdict = partExport(path, binding.imported, platform, visiting);
    if (verdict === "web") return null;
    if (verdict === "diverges") return `injects platform parts (${binding.specifier})`;
    return `injects platform parts (${binding.specifier}, whose ${binding.imported} the reader cannot resolve; counted as the platform's own)`;
  };

  /** Why a named reference (an imported name, or a namespace member) diverges. */
  const namedReasons = (node: ts.Node, binding: { imported: string; specifier: string }, judged: Set<ts.Node>): string[] => {
    if (isPart(binding.specifier)) {
      const reason = partReason(binding);
      return reason ? [reason] : [];
    }
    if (!isStylesModule(binding.specifier)) return [];
    const ref = webSkinRef(binding);
    if (ref) return webSkinUse(node, ref, judged);
    const owner = ownerOf(resolveSource(compDir, binding.specifier));
    return [
      owner === ownDir || owner === null
        ? `builds from its own ${binding.imported}`
        : `builds a part from ${owner}'s own ${binding.imported} (${binding.specifier})`,
    ];
  };

  /** A styles module or part read in a form the reader cannot resolve: the platform's own. */
  const unresolved = (binding: ImportBinding, what: string): string[] => {
    if (isStylesModule(binding.specifier)) return [`builds from ${what} (${binding.specifier}), which the reader cannot resolve; counted as its own skin`];
    if (isPart(binding.specifier)) return [`injects platform parts (${binding.specifier}, through ${what}, which the reader cannot resolve; counted as the platform's own)`];
    return [];
  };

  /** Why one value reference diverges, following local consts and functions once each. */
  const referenceReasons = (id: ts.Identifier, seen: Set<string>, judged: Set<ts.Node>): string[] => {
    const binding = imports.get(id.text);
    if (binding) {
      if (binding.kind === "named") return namedReasons(id, binding, judged);
      if (binding.kind === "default") return unresolved(binding, `the default import ${id.text}`);
      const parent = id.parent;
      if (ts.isPropertyAccessExpression(parent) && parent.expression === id) {
        return namedReasons(parent, { imported: parent.name.text, specifier: binding.specifier }, judged);
      }
      return unresolved(binding, `the namespace ${id.text}, read whole`);
    }
    const local = decls.get(id.text);
    if (local) {
      const alias = local.init && !local.destructured ? webSkinOf(local.init, new Set([id.text])) : null;
      if (alias) return webSkinUse(id, alias, judged);
      if (!local.init || seen.has(id.text)) return [];
      seen.add(id.text);
      return reasonsOf(local.init, seen, judged);
    }
    const helper = functions.get(id.text);
    if (helper?.body && !seen.has(id.text)) {
      seen.add(id.text);
      return reasonsOf(helper.body, seen, judged);
    }
    return [];
  };

  /** Every reason the values under a node reach. Types carry no values. */
  const reasonsOf = (root: ts.Node, seen: Set<string>, judged: Set<ts.Node>): string[] => {
    const reasons: string[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isTypeNode(node)) return;
      if (ts.isIdentifier(node) && isValueReference(node)) reasons.push(...referenceReasons(node, seen, judged));
      ts.forEachChild(node, visit);
    };
    visit(root);
    return reasons;
  };

  const out: Record<string, string | null> = {};
  for (const [name, decl] of decls) {
    if (!decl.exported) continue;
    const reasons = decl.init ? reasonsOf(decl.init, new Set([name]), new Set()) : [];
    out[name] = reasons.length ? [...new Set(reasons)].join("; ") : null;
  }
  return out;
}

/**
 * Why each built export of a platform entry diverges from the web build, or null for
 * one that renders the web build (see the header for what the reader proves, and why
 * whatever it cannot prove counts as the platform's own).
 */
export function exportDivergences(compDir: string, source: string, platform: Platform): Record<string, string | null> {
  return readEntry(compDir, parse(`entry${ENTRY[platform].ext}`, source), platform, new Set());
}

/**
 * How the platform builds of a name differ from its web build, for a module that has
 * them (`x.tsx` beside `x.ios.tsx` / `x.android.tsx`): per platform, why that platform's
 * build of the name diverges, judged exactly as a part injected under that name is.
 * Empty when every platform build of it is the web build, or the module has none. This
 * is what a shell must take as a part rather than import (test/design-rules-shells.test.ts).
 */
export function platformDivergence(webModule: string, name: string): Partial<Record<Platform, string>> {
  const out: Partial<Record<Platform, string>> = {};
  const base = webModule.replace(/\.(tsx?|js)$/, "");
  for (const platform of Object.keys(ENTRY) as Platform[]) {
    const path = resolveSource(dirname(base), `./${basename(base)}${ENTRY[platform].suffix}`);
    if (!path) continue;
    const verdict = partExport(path, name, platform, new Set());
    if (verdict === "diverges") out[platform] = moduleDivergences(path, platform, new Set())[name] ?? `re-exports a ${platform} build of ${name} that diverges`;
    else if (verdict === "unresolved") out[platform] = `its ${platform} build of ${name} cannot be resolved; counted as the platform's own`;
  }
  return out;
}

/** Every kit component with its platform divergence. */
export function componentSkins(kitSrc: string): ComponentSkins[] {
  const out: ComponentSkins[] = [];
  for (const group of GROUPS) {
    const groupDir = join(kitSrc, group);
    if (!existsSync(groupDir)) continue;
    for (const dir of readdirSync(groupDir)) {
      const compDir = join(groupDir, dir);
      if (!statSync(compDir).isDirectory()) continue;
      const files = readdirSync(compDir);
      const entry: ComponentSkins = { group, dir, exports: [], exportDivergence: {}, divergent: {}, hasPlatformEntries: false };
      for (const platform of Object.keys(ENTRY) as Platform[]) {
        const file = files.find((f) => f === `${dir}${ENTRY[platform].ext}`);
        if (!file) continue;
        entry.hasPlatformEntries = true;
        const reasons: string[] = [];
        for (const [name, reason] of Object.entries(moduleDivergences(join(compDir, file), platform, new Set()))) {
          if (!entry.exports.includes(name)) entry.exports.push(name);
          if (!reason) continue;
          (entry.exportDivergence[name] ??= {})[platform] = reason;
          if (!reasons.includes(reason)) reasons.push(reason);
        }
        if (reasons.length) entry.divergent[platform] = reasons.join("; ");
      }
      out.push(entry);
    }
  }
  return out;
}
