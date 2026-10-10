// Which components look different per platform, read from source text so it runs in
// plain bun (the styles modules pull in the kit's style layer, so importing them would
// need React Native). One definition of "diverges", read per export and shared by the
// docs' registry guard (docs/scripts/check-platform-skins.ts), which needs every
// divergent build in the three-up registry, the shells gate
// (test/design-rules-shells.test.ts, through shellImportFindings), which lets a shell
// import an export that looks the same everywhere and takes the rest as parts, following
// a barrel's re-exports (traceExport) to the module that builds each name, the audit
// facts (tools/audit/facts.ts), and the reference catalog guard
// (test/platform-references.test.ts). Each reason also says what it is made of
// (DivergenceKind), so a reader can tell a component's own look from a look its parts
// bring: the catalog guard holds the first to the component's reference row and leaves
// a part to the part's row.
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
// - A `let` or `var` binding can be reassigned, so the reader never follows one.
//
// - Data the entry writes itself is judged against the web entry beside it (`x.tsx`
//   beside `x.ios.tsx`), walked side by side with the web export of the same name: a
//   literal is the web build's only where the web entry has the same literal at the same
//   place (Row's `createFlex(iosSkin, "row")` against `createFlex(webSkin, "row")`). An
//   object is never the web skin by being an object: `createChip({ radius: 3 })` and
//   `const skin = { radius: 3 }; createChip(skin)` are the platform's own, and so is a
//   literal option the web entry does not pass (Video's `nativeControls: true`), a
//   function written in the entry, and data in a helper's body or any other expression.
//
// Every value an entry exports is classified, whatever form the export takes. A `const`
// (exported directly, or declared and then listed in `export { X }`, or the expression of
// `export default`) is judged as above. A name re-exported from the platform's build of
// another module (`export { Button } from "../button/button.ios.js"`) is judged as a part.
// A name re-exported from a module that is one module on every platform (the entry's
// shared module, a logic or data module, a package) is the same build everywhere and is
// not listed. Any other form (`export function`, `export class`, a `let`, a namespace
// re-export, `export *` from a module the reader cannot list, a module with a build of its
// own for this platform that the entry does not import by its platform path) is listed
// as the platform's own, so check:skins asks for a registry entry rather than letting a
// build it cannot read pass as the web build.
//
// Both files are parsed with the TypeScript parser rather than matched by regex: a regex
// on `import { iosSkin ... }` once took `iosSkin as dropdownIosSkin` for the component's
// own skin and reported the whole Avatar file as divergent.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import ts from "typescript";

export type Platform = "iOS" | "Android";

/**
 * What a reason a platform build diverges is made of, so a reader can tell a look of the
 * component's own from a look it takes from another component:
 *
 * - `own-skin`: builds from a skin of the component's own that is not its web skin as is
 *   (its own object, or the web skin spread with overrides, handed to a helper, read in a
 *   form the reader does not follow).
 * - `own-data`: passes data of its own (a literal, a function, an object) where the web
 *   entry has something else.
 * - `part`: injects, or re-exports, another component's platform build that diverges.
 * - `part-skin`: builds another component itself, from that component's own skin or with
 *   data of its own handed to that component's factory (AvatarMenu's Dropdown, built from
 *   the Dropdown's iOS skin with a 6 gap).
 * - `unknown`: a form the reader cannot classify, counted as the platform's own.
 */
export type DivergenceKind = "own-skin" | "own-data" | "part" | "part-skin" | "unknown";

export interface DivergenceReason {
  kind: DivergenceKind;
  /** The reason as the messages and the string reads spell it. */
  text: string;
  /** For a part or a part's skin: the component directory it belongs to (`dropdown`). */
  owner?: string;
}

/** Whether a reason is a look the component draws itself rather than one a part brings. */
export const isOwnLook = (reason: DivergenceReason): boolean => reason.kind === "own-skin" || reason.kind === "own-data" || reason.kind === "unknown";

/** Reasons spelled the way the string reads have always spelled them: each once, in order, joined. */
function spell(reasons: readonly DivergenceReason[]): string {
  return [...new Set(reasons.map((r) => r.text))].join("; ");
}

/** Reasons with each text once, the first occurrence kept. */
function distinct(reasons: readonly DivergenceReason[]): DivergenceReason[] {
  const seen = new Set<string>();
  return reasons.filter((r) => !seen.has(r.text) && seen.add(r.text));
}

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
  /** The same reasons as `exportDivergence`, each with its kind (and, for a part, the component it belongs to). */
  exportReasons: Record<string, Partial<Record<Platform, DivergenceReason[]>>>;
  /** The platforms on which any export diverges, with every reason found on that platform. */
  divergent: Partial<Record<Platform, string>>;
  /** Whether the component has platform entries at all. */
  hasPlatformEntries: boolean;
}

export const GROUPS = ["atoms", "molecules", "organisms", "charts"] as const;

/** A component's platform entry: `<dir>` plus `ext` in its directory, imported by `suffix`. */
export const ENTRY: Record<Platform, { ext: string; suffix: string }> = {
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
  /** Whether it is a `let` or `var`, which may be reassigned after its initializer. */
  mutable: boolean;
}

/** Every top-level variable binding of a module, destructured names included. */
function declarations(sf: ts.SourceFile): Map<string, Declaration> {
  const out = new Map<string, Declaration>();
  for (const statement of sf.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const exported = hasExportModifier(statement);
    const mutable = (statement.declarationList.flags & ts.NodeFlags.Const) === 0;
    for (const decl of statement.declarationList.declarations) {
      const init = decl.initializer ?? null;
      if (ts.isIdentifier(decl.name)) out.set(decl.name.text, { init, exported, destructured: false, mutable });
      else if (ts.isObjectBindingPattern(decl.name)) {
        for (const element of decl.name.elements) {
          if (ts.isIdentifier(element.name)) out.set(element.name.text, { init, exported, destructured: true, mutable });
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

/** The source file a relative specifier names (`./x.js`, `./x`, or a directory's index), or null when none exists. */
export function resolveSource(fromDir: string, specifier: string): string | null {
  const stem = join(fromDir, specifier.replace(/\.js$/, ""));
  for (const path of [`${stem}.ts`, `${stem}.tsx`, join(stem, "index.ts"), join(stem, "index.tsx")]) {
    if (existsSync(path) && statSync(path).isFile()) return path;
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
    const decl = decls.get(current);
    // A `let` may be reassigned, so it is its own object as far as the reader can prove.
    if (!decl?.init || decl.mutable || !ts.isIdentifier(decl.init) || !decls.has(decl.init.text) || seen.has(decl.init.text)) return current;
    current = decl.init.text;
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
const verdictCache = new Map<string, Record<string, DivergenceReason[] | null>>();

function moduleDivergences(path: string, platform: Platform, visiting: Set<string>): Record<string, DivergenceReason[] | null> {
  const key = `${path}#${platform}`;
  let verdict = verdictCache.get(key);
  if (!verdict) {
    verdict = readEntry(dirname(path), parsedModule(path), platform, new Set([...visiting, key]));
    verdictCache.set(key, verdict);
  }
  return verdict;
}

/** What a module a platform entry imports from is, on that platform. */
type ModuleKind =
  /** One module on every platform: the entry's shared module, a logic, data or styles module, a package. */
  | { kind: "same" }
  /** The platform's own build of a module (`../button/button.ios.js`), read as a part. */
  | { kind: "part" }
  /** Anything the reader cannot place, with why: counted as the platform's own. */
  | { kind: "unknown"; why: string };

const PLATFORM_SUFFIX = /\.(ios|android|web|native)\.js$/;

/** Whether a module has a build of its own for iOS or Android beside it (`x.ios.tsx` beside `x.tsx`). */
export function hasPlatformBuilds(file: string): boolean {
  const stem = file.replace(/\.(tsx?|js)$/, "");
  return [".ios.tsx", ".ios.ts", ".android.tsx", ".android.ts"].some((ext) => existsSync(`${stem}${ext}`));
}

function moduleKind(compDir: string, specifier: string, platform: Platform): ModuleKind {
  if (!specifier.startsWith(".") || isSharedModule(specifier)) return { kind: "same" };
  if (specifier.endsWith(ENTRY[platform].suffix)) return { kind: "part" };
  if (PLATFORM_SUFFIX.test(specifier)) return { kind: "unknown", why: `${specifier} is another platform's build` };
  const target = resolveSource(compDir, specifier);
  if (!target) return { kind: "unknown", why: `${specifier} does not resolve` };
  // A device resolves the import to the module's own build for the platform, while the
  // docs' web bundler, loading this entry by its literal path, resolves it to the web one.
  if (hasPlatformBuilds(target)) return { kind: "unknown", why: `${specifier} has platform builds of its own that the entry does not import by their platform path` };
  return { kind: "same" };
}

/**
 * Whether the export a platform part names is the web build, diverges, or cannot be
 * resolved: a name the part's module lists is judged by the same read as any entry
 * (its own builds, its re-exports of other platform builds, the forms it cannot
 * classify); a name it re-exports from a module that is one module on every platform is
 * the web build; anything else, and a cycle, is unresolved.
 */
function partExport(path: string, name: string, platform: Platform, visiting: Set<string>): "web" | "diverges" | "unresolved" {
  const key = `${path}#${platform}`;
  if (visiting.has(key)) return "unresolved";
  const built = moduleDivergences(path, platform, visiting);
  if (name in built) return built[name] ? "diverges" : "web";
  return sameEverywhere(path, name, platform) ? "web" : "unresolved";
}

/** Whether a platform module re-exports a name from a module that is one module on every platform. */
function sameEverywhere(path: string, name: string, platform: Platform): boolean {
  const sf = parsedModule(path);
  const compDir = dirname(path);
  const forwarded = reexports(sf).get(name);
  if (forwarded) {
    if (forwarded.specifier !== null) return moduleKind(compDir, forwarded.specifier, platform).kind === "same";
    const binding = importBindings(sf).get(forwarded.imported);
    return binding?.kind === "named" && moduleKind(compDir, binding.specifier, platform).kind === "same";
  }
  // `export * from` a module that is one module everywhere and exports the name.
  return sf.statements.some((s) => {
    if (!ts.isExportDeclaration(s) || s.isTypeOnly || s.exportClause || !s.moduleSpecifier || !ts.isStringLiteral(s.moduleSpecifier)) return false;
    const specifier = s.moduleSpecifier.text;
    if (!specifier.startsWith(".") || moduleKind(compDir, specifier, platform).kind !== "same") return false;
    const target = resolveSource(compDir, specifier);
    return target !== null && traceExport(target, name) !== null;
  });
}

/** A reference to a styles module's skin that is the same object as its web skin. */
interface WebSkinRef {
  imported: string;
  specifier: string;
  stylesPath: string;
}

/** The read of one parsed platform module: per built export, why it diverges, or null for the web build. */
function readEntry(compDir: string, sf: ts.SourceFile, platform: Platform, visiting: Set<string>): Record<string, DivergenceReason[] | null> {
  const { suffix } = ENTRY[platform];
  const imports = importBindings(sf);
  const decls = declarations(sf);
  const functions = functionDeclarations(sf);
  const ownDir = basename(compDir);
  const isPart = (specifier: string): boolean => specifier.endsWith(suffix);

  /** The component directory owning a styles import, or null when it does not resolve. */
  const ownerOf = (stylesPath: string | null): string | null => (stylesPath ? basename(dirname(stylesPath)) : null);

  /** A web-skin alias reached in a form that builds a skin of its own. */
  const ownSkin = (ref: WebSkinRef, what: string): DivergenceReason => {
    const owner = ownerOf(ref.stylesPath);
    return owner === ownDir || owner === null
      ? { kind: "own-skin", text: `builds its own skin (${what})` }
      : { kind: "part-skin", owner, text: `builds a part from ${owner}'s own skin (${what}; ${ref.specifier})` };
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
      if (!local?.init || local.destructured || local.mutable || seen.has(e.text)) return null;
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
  const webSkinUse = (node: ts.Node, ref: WebSkinRef, judged: Set<ts.Node>): DivergenceReason[] => {
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
  const partReason = (binding: { imported: string; specifier: string }): DivergenceReason | null => {
    const path = resolveSource(compDir, binding.specifier);
    if (!path) return { kind: "unknown", text: `injects platform parts (${binding.specifier}, which does not resolve; counted as the platform's own)` };
    const verdict = partExport(path, binding.imported, platform, visiting);
    if (verdict === "web") return null;
    if (verdict === "diverges") return { kind: "part", owner: componentDirOf(path), text: `injects platform parts (${binding.specifier})` };
    return { kind: "unknown", text: `injects platform parts (${binding.specifier}, whose ${binding.imported} the reader cannot resolve; counted as the platform's own)` };
  };

  /** Why a named reference (an imported name, or a namespace member) diverges. */
  const namedReasons = (node: ts.Node, binding: { imported: string; specifier: string }, judged: Set<ts.Node>): DivergenceReason[] => {
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
        ? { kind: "own-skin", text: `builds from its own ${binding.imported}` }
        : { kind: "part-skin", owner, text: `builds a part from ${owner}'s own ${binding.imported} (${binding.specifier})` },
    ];
  };

  /** A styles module or part read in a form the reader cannot resolve: the platform's own. */
  const unresolved = (binding: ImportBinding, what: string): DivergenceReason[] => {
    if (isStylesModule(binding.specifier)) return [{ kind: "unknown", text: `builds from ${what} (${binding.specifier}), which the reader cannot resolve; counted as its own skin` }];
    if (isPart(binding.specifier)) return [{ kind: "unknown", text: `injects platform parts (${binding.specifier}, through ${what}, which the reader cannot resolve; counted as the platform's own)` }];
    return [];
  };

  /** Why one value reference diverges, following local consts and functions once each. */
  const referenceReasons = (id: ts.Identifier, seen: Set<string>, judged: Set<ts.Node>): DivergenceReason[] => {
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
    if (local?.mutable) return [{ kind: "unknown", text: `reads ${id.text}, a \`let\` or \`var\` the reader does not follow; counted as the platform's own` }];
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
  const reasonsOf = (root: ts.Node, seen: Set<string>, judged: Set<ts.Node>): DivergenceReason[] => {
    const reasons: DivergenceReason[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isTypeNode(node)) return;
      if (ts.isIdentifier(node) && isValueReference(node)) reasons.push(...referenceReasons(node, seen, judged));
      ts.forEachChild(node, visit);
    };
    visit(root);
    return reasons;
  };

  /** Why a name re-exported from the platform's build of another module diverges, or null for the web build. */
  const reexportReason = (imported: string, specifier: string): DivergenceReason | null => {
    const path = resolveSource(compDir, specifier);
    if (!path) return { kind: "unknown", text: `re-exports ${imported} from ${specifier}, which does not resolve; counted as the platform's own` };
    const verdict = partExport(path, imported, platform, visiting);
    if (verdict === "web") return null;
    if (verdict === "diverges") return { kind: "part", owner: componentDirOf(path), text: `re-exports the ${platform} build of ${imported} (${specifier})` };
    return { kind: "unknown", text: `re-exports ${imported} from ${specifier}, which the reader cannot resolve; counted as the platform's own` };
  };

  // ---------- data the entry writes itself ----------

  const web = webSideOf(sf.fileName);

  /** A web expression past the web entry's own top-level consts (`const KIND = "row"`). */
  const throughWeb = (expr: ts.Expression | null): ts.Expression | null => {
    let e = expr ? unwrap(expr) : null;
    const seen = new Set<string>();
    while (e && web && ts.isIdentifier(e) && !seen.has(e.text)) {
      seen.add(e.text);
      const decl = web.decls.get(e.text);
      if (!decl?.init || decl.mutable || decl.destructured) break;
      e = unwrap(decl.init);
    }
    return e;
  };

  /** Why a piece of data the entry writes is its own: the web entry has something else, or nothing, at that place. */
  const ownData = (label: ts.Node, w: ts.Expression | null, exported: boolean, owner: string | null): DivergenceReason => {
    const there = !exported
      ? "and there is no web export of that name to match it against"
      : w
        ? `where the web entry has \`${snippet(web!.sf, w)}\``
        : "which the web entry does not";
    return dataOf(`passes \`${snippet(sf, label)}\` ${there}; counted as the platform's own`, owner);
  };

  /** Data of the entry's own, or, handed to another component's factory, data of that part's. */
  const dataOf = (text: string, owner: string | null): DivergenceReason => (owner ? { kind: "part-skin", owner, text } : { kind: "own-data", text });

  /**
   * The component a call builds when its callee is another component's factory
   * (`createDropdown` from `../dropdown/dropdown.shared.js`), else null: data handed to it
   * sets that part's look, not this component's.
   */
  const factoryOwner = (call: ts.CallExpression): string | null => {
    const callee = unwrap(call.expression);
    let specifier: string | null = null;
    if (ts.isIdentifier(callee)) {
      const binding = imports.get(callee.text);
      specifier = binding?.kind === "named" ? binding.specifier : null;
    } else if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
      const binding = imports.get(callee.expression.text);
      specifier = binding?.kind === "namespace" ? binding.specifier : null;
    }
    if (!specifier || !specifier.startsWith(".") || !isSharedModule(specifier)) return null;
    const owner = ownerOf(resolveSource(compDir, specifier));
    return owner === ownDir ? null : owner;
  };

  /** Whether an expression holds data of its own anywhere: a literal, a function, an object not already judged. */
  const holdsData = (root: ts.Node, judged: Set<ts.Node>): boolean => {
    let found = false;
    const visit = (node: ts.Node): void => {
      if (found || ts.isTypeNode(node) || judged.has(node)) return;
      if (isDatum(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isClassExpression(node)) found = true;
      else ts.forEachChild(node, visit);
    };
    visit(root);
    return found;
  };

  /**
   * Why the data an export's expression hands its factory is not provably the web
   * build's: walked side by side with the web entry's export of the same name, call
   * argument by argument (where both call the same factory), object property by
   * property, array element by element, and through each side's own top-level consts.
   * A literal (a string, a number, a boolean, a regular expression) is the web build's
   * only where the web entry has the same literal at the same place; an object is never
   * the web skin by being an object (`createChip({ radius: 3 })`, `const skin = { radius:
   * 3 }; createChip(skin)`), only its references are judged as references are; a
   * function, a method, or data inside any other expression (a ternary, a template, a
   * helper's body) is the platform's own. A spread with overrides of the web skin is
   * already judged by `webSkinUse`, so its literal is not judged twice. Data handed to
   * another component's factory is that part's (`owner`), not the component's own.
   */
  const dataReasons = (
    p: ts.Expression,
    w: ts.Expression | null,
    exported: boolean,
    judged: Set<ts.Node>,
    seen: Set<string>,
    owner: string | null,
    label: ts.Node = p,
  ): DivergenceReason[] => {
    const pe = unwrap(p);
    const we = throughWeb(w);
    if (isDatum(pe)) return we && isDatum(we) && datumValue(pe) === datumValue(we) ? [] : [ownData(label, we, exported, owner)];
    if (ts.isObjectLiteralExpression(pe)) {
      if (judged.has(pe)) return [];
      const wObj = we && ts.isObjectLiteralExpression(we) ? we : null;
      if (!pe.properties.length) return wObj && !wObj.properties.length ? [] : [ownData(label, we, exported, owner)];
      const out: DivergenceReason[] = [];
      for (const member of pe.properties) {
        if (ts.isShorthandPropertyAssignment(member)) continue;
        if (ts.isSpreadAssignment(member)) out.push(...dataReasons(member.expression, null, exported, judged, seen, owner));
        else if (ts.isPropertyAssignment(member)) {
          const key = propertyKey(member.name);
          const wMember = wObj && key !== null ? webProperty(wObj, key) : null;
          // Against a web expression that is not an object, the place is the whole object's.
          out.push(...dataReasons(member.initializer, wObj ? wMember : we, exported, judged, seen, owner, member));
        } else out.push(ownData(member, null, exported, owner));
      }
      return out;
    }
    if (ts.isArrayLiteralExpression(pe)) {
      const wArr = we && ts.isArrayLiteralExpression(we) ? we : null;
      return pe.elements.flatMap((el, i) =>
        ts.isSpreadElement(el)
          ? dataReasons(el.expression, null, exported, judged, seen, owner)
          : ts.isOmittedExpression(el)
            ? []
            : dataReasons(el, wArr?.elements[i] ?? (wArr ? null : we), exported, judged, seen, owner),
      );
    }
    if (ts.isCallExpression(pe)) {
      const wCall = we && ts.isCallExpression(we) && unwrap(we.expression).getText(web!.sf) === unwrap(pe.expression).getText(sf) ? we : null;
      const into = factoryOwner(pe) ?? owner;
      const out = pe.arguments.flatMap((arg, i) => dataReasons(arg, wCall ? (wCall.arguments[i] ?? null) : null, exported, judged, seen, into));
      // A helper of the entry's own: whatever data its body holds is the entry's.
      const callee = unwrap(pe.expression);
      if (ts.isIdentifier(callee) && !seen.has(callee.text)) {
        const local = decls.get(callee.text);
        const helper = functions.get(callee.text)?.body ?? (local?.init && !local.mutable ? unwrap(local.init) : undefined);
        if (helper && !imports.has(callee.text)) {
          const body = ts.isArrowFunction(helper) || ts.isFunctionExpression(helper) ? helper.body : ts.isBlock(helper) ? helper : undefined;
          if (body && holdsData(body, judged)) out.push(dataOf(`builds data of its own in ${callee.text}() (${snippet(sf, pe)}); counted as the platform's own`, owner));
        }
      }
      return out;
    }
    if (ts.isIdentifier(pe)) {
      if (imports.has(pe.text) || seen.has(pe.text)) return [];
      const local = decls.get(pe.text);
      if (local?.init && !local.mutable) {
        if (webSkinOf(local.init, new Set([pe.text]))) return [];
        if (local.destructured) return holdsData(local.init, judged) ? [ownData(label, we, exported, owner)] : [];
        return dataReasons(local.init, we, exported, judged, new Set([...seen, pe.text]), owner, label === p ? local.init : label);
      }
      // A function of the entry's own, handed over as a value.
      if (functions.has(pe.text)) return [ownData(label, we, exported, owner)];
      return [];
    }
    if (ts.isArrowFunction(pe) || ts.isFunctionExpression(pe) || ts.isClassExpression(pe)) return [ownData(label, we, exported, owner)];
    if (ts.isPropertyAccessExpression(pe)) return [];
    return holdsData(pe, judged) ? [ownData(label, we, exported, owner)] : [];
  };

  const out: Record<string, DivergenceReason[] | null> = {};
  for (const [name, form] of entryExports(compDir, sf, platform, visiting)) {
    if (form.kind === "unknown") out[name] = [{ kind: "unknown", text: `${form.what}, a form the reader cannot classify; counted as the platform's own` }];
    else if (form.kind === "part") {
      const reason = reexportReason(form.imported, form.specifier);
      out[name] = reason ? [reason] : null;
    } else {
      const judged = new Set<ts.Node>();
      const reasons = reasonsOf(form.expr, new Set([form.local]), judged);
      const webExpr = web ? webExport(web, name) : null;
      reasons.push(...dataReasons(form.expr, webExpr, webExpr !== null, judged, new Set([form.local]), null));
      out[name] = reasons.length ? distinct(reasons) : null;
    }
  }
  return out;
}

/** The component directory a module under the kit belongs to: the one under its group (`checkbox` for `atoms/checkbox/indicator/index.android.tsx`). */
function componentDirOf(path: string): string {
  const parts = path.split(/[\\/]/);
  for (let i = parts.length - 3; i >= 0; i--) if ((GROUPS as readonly string[]).includes(parts[i])) return parts[i + 1];
  return basename(dirname(path));
}

/** A literal datum: a string, a number, a boolean, null, a regular expression, a negated number. */
function isDatum(node: ts.Node): boolean {
  return (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isNumericLiteral(node) ||
    ts.isBigIntLiteral(node) ||
    ts.isRegularExpressionLiteral(node) ||
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword ||
    node.kind === ts.SyntaxKind.NullKeyword ||
    (ts.isPrefixUnaryExpression(node) && (node.operator === ts.SyntaxKind.MinusToken || node.operator === ts.SyntaxKind.PlusToken) && ts.isNumericLiteral(node.operand))
  );
}

/** A datum's value, as a comparable key. */
function datumValue(node: ts.Expression): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return `s:${node.text}`;
  if (ts.isNumericLiteral(node)) return `n:${Number(node.text)}`;
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) return `n:${node.operator === ts.SyntaxKind.MinusToken ? -Number(node.operand.text) : Number(node.operand.text)}`;
  if (ts.isBigIntLiteral(node)) return `b:${node.text}`;
  if (ts.isRegularExpressionLiteral(node)) return `r:${node.text}`;
  return `k:${node.kind}`;
}

/** An object literal property's key, or null for a computed one. */
function propertyKey(name: ts.PropertyName): string | null {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isPrivateIdentifier(name) ? name.text : null;
}

/** The value a web object literal gives a key, or null when it gives none (a spread of something else hides it too). */
function webProperty(obj: ts.ObjectLiteralExpression, key: string): ts.Expression | null {
  for (const member of obj.properties) {
    if (ts.isPropertyAssignment(member) && propertyKey(member.name) === key) return member.initializer;
    if (ts.isShorthandPropertyAssignment(member) && member.name.text === key) return member.name;
  }
  return null;
}

/** The web entry beside a platform entry (`x.tsx` beside `x.ios.tsx`), parsed with its top-level bindings, or null. */
interface WebSide {
  sf: ts.SourceFile;
  decls: Map<string, Declaration>;
}

function webSideOf(platformFile: string): WebSide | null {
  const stem = platformFile.replace(/\.(ios|android)\.tsx?$/, "");
  if (stem === platformFile) return null;
  for (const path of [`${stem}.tsx`, `${stem}.ts`]) {
    if (!existsSync(path)) continue;
    const sf = parsedModule(path);
    return { sf, decls: declarations(sf) };
  }
  return null;
}

/** The expression the web entry exports under a name: `export const`, a const listed in `export { }`, `export default`; null otherwise. */
function webExport(web: WebSide, name: string): ts.Expression | null {
  const localInit = (local: string): ts.Expression | null => {
    const decl = web.decls.get(local);
    return decl?.init && !decl.mutable ? decl.init : null;
  };
  for (const s of web.sf.statements) {
    if (ts.isVariableStatement(s) && hasExportModifier(s)) {
      for (const decl of s.declarationList.declarations) {
        const names = ts.isIdentifier(decl.name) ? [decl.name.text] : ts.isObjectBindingPattern(decl.name) ? decl.name.elements.flatMap((el) => (ts.isIdentifier(el.name) ? [el.name.text] : [])) : [];
        if (names.includes(name)) return decl.initializer ?? null;
      }
    } else if (ts.isExportDeclaration(s) && !s.isTypeOnly && !s.moduleSpecifier && s.exportClause && ts.isNamedExports(s.exportClause)) {
      const el = s.exportClause.elements.find((e) => !e.isTypeOnly && e.name.text === name);
      if (el) return localInit((el.propertyName ?? el.name).text);
    } else if (ts.isExportAssignment(s) && !s.isExportEquals && name === "default") {
      const e = unwrap(s.expression);
      return ts.isIdentifier(e) ? localInit(e.text) : s.expression;
    }
  }
  return null;
}

/** How a platform entry exports one value: the expression that builds it, a platform build it re-exports, or a form the reader cannot classify. */
type ExportForm =
  | { kind: "value"; expr: ts.Expression; local: string }
  | { kind: "part"; imported: string; specifier: string }
  | { kind: "unknown"; what: string };

function hasDefaultModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
}

/**
 * Every value a platform entry exports, by exported name, with the form it takes (see the
 * header). A name re-exported from a module that is one module on every platform, and a
 * type, are not listed.
 */
function entryExports(compDir: string, sf: ts.SourceFile, platform: Platform, visiting: Set<string>): Map<string, ExportForm> {
  const out = new Map<string, ExportForm>();
  const imports = importBindings(sf);
  const decls = declarations(sf);
  const functions = functionDeclarations(sf);

  /** A name re-exported from a module: listed unless that module is one module on every platform. */
  const fromModule = (specifier: string, imported: string, name: string): ExportForm | null => {
    const kind = moduleKind(compDir, specifier, platform);
    if (kind.kind === "same") return null;
    if (kind.kind === "part") return { kind: "part", imported, specifier };
    return { kind: "unknown", what: `re-exports ${name} from ${specifier} (${kind.why})` };
  };

  /** A name exported from a local binding (`export { X }`, `export default X`). */
  const local = (localName: string, name: string): ExportForm | null => {
    const binding = imports.get(localName);
    if (binding?.kind === "named") return fromModule(binding.specifier, binding.imported, name);
    if (binding) {
      return moduleKind(compDir, binding.specifier, platform).kind === "same" ? null : { kind: "unknown", what: `re-exports ${name}, the ${binding.kind} import of ${binding.specifier}` };
    }
    const decl = decls.get(localName);
    if (decl?.mutable) return { kind: "unknown", what: `exports ${name}, the \`let\` or \`var\` ${localName}` };
    if (decl?.init) return { kind: "value", expr: decl.init, local: localName };
    if (decl) return { kind: "unknown", what: `exports ${name}, ${localName}, with no initializer` };
    if (functions.has(localName)) return { kind: "unknown", what: `exports ${name}, the function declaration ${localName}` };
    return { kind: "unknown", what: `exports ${name} from ${localName}, which the reader cannot find` };
  };

  const set = (name: string, form: ExportForm | null): void => {
    if (form) out.set(name, form);
  };

  for (const s of sf.statements) {
    if (ts.isVariableStatement(s) && hasExportModifier(s)) {
      for (const decl of s.declarationList.declarations) {
        const names = ts.isIdentifier(decl.name) ? [decl.name.text] : ts.isObjectBindingPattern(decl.name) ? decl.name.elements.flatMap((el) => (ts.isIdentifier(el.name) ? [el.name.text] : [])) : [];
        for (const name of names) set(name, local(name, name));
      }
    } else if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s) || ts.isEnumDeclaration(s)) && hasExportModifier(s)) {
      const name = hasDefaultModifier(s) ? "default" : (s.name?.text ?? "default");
      const what = ts.isFunctionDeclaration(s) ? "a function declaration" : ts.isClassDeclaration(s) ? "a class declaration" : "an enum";
      set(name, { kind: "unknown", what: `exports ${name} as ${what}` });
    } else if ((ts.isModuleDeclaration(s) || ts.isImportEqualsDeclaration(s)) && hasExportModifier(s)) {
      set(s.name.getText(sf), { kind: "unknown", what: `exports ${s.name.getText(sf)} as a namespace` });
    } else if (ts.isExportAssignment(s)) {
      if (s.isExportEquals) set("export =", { kind: "unknown", what: "assigns `export =`" });
      else {
        const e = unwrap(s.expression);
        set("default", ts.isIdentifier(e) ? local(e.text, "default") : { kind: "value", expr: s.expression, local: "default" });
      }
    } else if (ts.isExportDeclaration(s) && !s.isTypeOnly) {
      const specifier = s.moduleSpecifier && ts.isStringLiteral(s.moduleSpecifier) ? s.moduleSpecifier.text : null;
      const clause = s.exportClause;
      if (clause && ts.isNamedExports(clause)) {
        for (const el of clause.elements) {
          if (el.isTypeOnly) continue;
          const imported = (el.propertyName ?? el.name).text;
          set(el.name.text, specifier !== null ? fromModule(specifier, imported, el.name.text) : local(imported, el.name.text));
        }
      } else if (clause && ts.isNamespaceExport(clause)) {
        if (specifier === null || moduleKind(compDir, specifier, platform).kind !== "same") {
          set(clause.name.text, { kind: "unknown", what: `re-exports ${clause.name.text}, the namespace of ${specifier}` });
        }
      } else if (specifier !== null) {
        const kind = moduleKind(compDir, specifier, platform);
        const target = kind.kind === "part" ? resolveSource(compDir, specifier) : null;
        if (kind.kind === "same") continue;
        if (target) {
          // `export *` from another platform build: each name that module lists, judged as a part.
          for (const name of Object.keys(moduleDivergences(target, platform, visiting))) set(name, { kind: "part", imported: name, specifier });
        } else {
          set(`export * from "${specifier}"`, { kind: "unknown", what: `re-exports every name of ${specifier} (${kind.kind === "unknown" ? kind.why : "which does not resolve"})` });
        }
      }
    }
  }
  return out;
}

/**
 * Why each built export of a platform entry diverges from the web build, or null for
 * one that renders the web build (see the header for what the reader proves, and why
 * whatever it cannot prove counts as the platform's own).
 */
export function exportDivergences(compDir: string, source: string, platform: Platform): Record<string, string | null> {
  const reasons = exportReasons(compDir, source, platform);
  return Object.fromEntries(Object.entries(reasons).map(([name, r]) => [name, r ? spell(r) : null]));
}

/** The reasons exportDivergences spells out, each with its kind. */
export function exportReasons(compDir: string, source: string, platform: Platform): Record<string, DivergenceReason[] | null> {
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
    if (verdict === "diverges") {
      const reasons = moduleDivergences(path, platform, new Set())[name];
      out[platform] = reasons ? spell(reasons) : `re-exports a ${platform} build of ${name} that diverges`;
    }
    else if (verdict === "unresolved") out[platform] = `its ${platform} build of ${name} cannot be resolved; counted as the platform's own`;
  }
  return out;
}

/** One step of the way a module exports a name: the module, and the name it has there. */
export interface ExportStep {
  file: string;
  name: string;
}

/**
 * Where a module's export comes from: every module it passes through, from the one asked
 * about to the one that declares it, or, for a name that comes from a package
 * (`export { View } from "react-native"`), to the last kit module and the package.
 */
export interface ExportTrace {
  steps: ExportStep[];
  package?: { specifier: string; name: string };
}

/** Whether a statement declares and exports a value under this name. */
function declaresExport(s: ts.Statement, name: string): boolean {
  if (ts.isVariableStatement(s) && hasExportModifier(s)) {
    return s.declarationList.declarations.some((decl) =>
      ts.isIdentifier(decl.name) ? decl.name.text === name : ts.isObjectBindingPattern(decl.name) && decl.name.elements.some((el) => ts.isIdentifier(el.name) && el.name.text === name),
    );
  }
  if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s) || ts.isEnumDeclaration(s)) && hasExportModifier(s)) {
    return hasDefaultModifier(s) ? name === "default" : s.name?.text === name;
  }
  return ts.isExportAssignment(s) && !s.isExportEquals && name === "default";
}

/**
 * Follow a module's export of a name through its re-exports (`export { X } from`,
 * `export { X }` of an import, `export * from`) to the module that declares it, the way a
 * barrel (`atoms/index.ts`) hands out each component. Null when the module does not
 * export the name, or exports it only as a type.
 */
export function traceExport(file: string, name: string, seen = new Set<string>()): ExportTrace | null {
  const key = `${file}#${name}`;
  if (seen.has(key)) return null;
  seen.add(key);
  const sf = parsedModule(file);
  const here: ExportStep = { file, name };
  const follow = (specifier: string, imported: string): ExportTrace | null => {
    if (!specifier.startsWith(".")) return { steps: [here], package: { specifier, name: imported } };
    const target = resolveSource(dirname(file), specifier);
    const rest = target ? traceExport(target, imported, seen) : null;
    return rest ? { ...rest, steps: [here, ...rest.steps] } : null;
  };
  for (const s of sf.statements) {
    if (declaresExport(s, name)) return { steps: [here] };
    if (!ts.isExportDeclaration(s) || s.isTypeOnly || !s.exportClause || !ts.isNamedExports(s.exportClause)) continue;
    const el = s.exportClause.elements.find((e) => !e.isTypeOnly && e.name.text === name);
    if (!el) continue;
    const local = (el.propertyName ?? el.name).text;
    if (s.moduleSpecifier && ts.isStringLiteral(s.moduleSpecifier)) return follow(s.moduleSpecifier.text, local);
    const binding = importBindings(sf).get(local);
    return binding?.kind === "named" ? follow(binding.specifier, binding.imported) : { steps: [here] };
  }
  for (const s of sf.statements) {
    if (!ts.isExportDeclaration(s) || s.isTypeOnly || s.exportClause || !s.moduleSpecifier || !ts.isStringLiteral(s.moduleSpecifier)) continue;
    if (!s.moduleSpecifier.text.startsWith(".")) continue;
    const found = follow(s.moduleSpecifier.text, name);
    if (found) return found;
  }
  return null;
}

/**
 * The module whose platform builds decide what a name imported from `file` renders on
 * each platform: `file` itself when it has platform builds, or else the first module on
 * the name's re-export chain that does (a barrel's `export *` leads to the component's
 * own module), with the name it has there. Null when no module on the chain has any.
 */
export function platformModuleOf(file: string, name: string): ExportStep | null {
  if (hasPlatformBuilds(file)) return { file, name };
  return traceExport(file, name)?.steps.find((step) => hasPlatformBuilds(step.file)) ?? null;
}

/** A module and every module it forwards exports from (`export ... from`), transitively: what a namespace import of it reaches. */
export function forwardedModules(file: string, seen = new Set<string>()): string[] {
  if (seen.has(file)) return [];
  seen.add(file);
  const out = [file];
  for (const s of parsedModule(file).statements) {
    if (!ts.isExportDeclaration(s) || s.isTypeOnly || !s.moduleSpecifier || !ts.isStringLiteral(s.moduleSpecifier) || !s.moduleSpecifier.text.startsWith(".")) continue;
    const target = resolveSource(dirname(file), s.moduleSpecifier.text);
    if (target) out.push(...forwardedModules(target, seen));
  }
  return out;
}

/** What a shell imports from modules with platform builds: how many named imports were judged, and each one that breaks the seam. */
export interface ShellImports {
  judged: number;
  offenders: string[];
}

/**
 * Judge a shell's imports the way test/design-rules-shells.test.ts holds them: each name
 * it imports from a module with platform builds, directly or through a barrel's
 * re-exports, is judged by platformDivergence at the module that builds it, and one that
 * looks different on a platform must come in as a part (imported under its `Web` name, the
 * part's web default). A namespace or default import of a module that reaches platform
 * builds cannot have its parts injected, so it is an offence of its own. `isComponent`
 * keeps the judgement to the kit's component trees; `label` names the shell in messages.
 */
export function shellImportFindings(shellFile: string, source: string, label: string, isComponent: (file: string) => boolean): ShellImports {
  const out: ShellImports = { judged: 0, offenders: [] };
  const sf = parse(shellFile, source);
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const clause = statement.importClause;
    const specifier = statement.moduleSpecifier.text;
    if (!clause || clause.isTypeOnly || !specifier.startsWith(".")) continue;
    const target = resolveSource(dirname(shellFile), specifier);
    if (!target) continue;
    const bindings = clause.namedBindings;
    if (clause.name || (bindings && ts.isNamespaceImport(bindings))) {
      if (forwardedModules(target).some((file) => isComponent(file) && hasPlatformBuilds(file))) {
        out.offenders.push(`${label} imports ${specifier} whole; import each part by name so its platform build can be injected`);
      }
      continue;
    }
    for (const element of bindings?.elements ?? []) {
      if (element.isTypeOnly) continue;
      const name = (element.propertyName ?? element.name).text;
      const step = platformModuleOf(target, name);
      if (!step || !isComponent(step.file)) continue;
      out.judged++;
      const byPlatform = platformDivergence(step.file, step.name);
      if (!Object.keys(byPlatform).length) continue; // the web build on every platform
      if (element.propertyName && /^Web\w+$/.test(element.name.text)) continue; // the part's web default
      const through = step.file === target ? "" : ` (through to ${basename(step.file)})`;
      out.offenders.push(
        `${label} imports ${name} from ${specifier}${through}, which looks different on ${Object.keys(byPlatform).join(" and ")}; take it as a part (import { ${name} as Web${name} }, parts.${name} ?? Web${name})`,
      );
    }
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
      const entry: ComponentSkins = { group, dir, exports: [], exportDivergence: {}, exportReasons: {}, divergent: {}, hasPlatformEntries: false };
      for (const platform of Object.keys(ENTRY) as Platform[]) {
        const file = files.find((f) => f === `${dir}${ENTRY[platform].ext}`);
        if (!file) continue;
        entry.hasPlatformEntries = true;
        const reasons: string[] = [];
        for (const [name, built] of Object.entries(moduleDivergences(join(compDir, file), platform, new Set()))) {
          if (!entry.exports.includes(name)) entry.exports.push(name);
          if (!built) continue;
          const reason = spell(built);
          (entry.exportDivergence[name] ??= {})[platform] = reason;
          (entry.exportReasons[name] ??= {})[platform] = built;
          if (!reasons.includes(reason)) reasons.push(reason);
        }
        if (reasons.length) entry.divergent[platform] = reasons.join("; ");
      }
      out.push(entry);
    }
  }
  return out;
}
