// The kit's own declarations and what each one reads: the consumer reader of the audit's
// Foundations tier (tools/audit/foundations.ts). A foundation (GlassSurface, the overlay
// host, the design tokens) is shared by many components, and a turn that changes it must
// re-capture every component that renders through it; this module says which those are,
// read from the source, never run and never guessed.
//
// The graph's nodes are the top-level value declarations of every TypeScript module under
// src/ (a `const`, a destructured `const`, a `let`, a function, a class, an enum), plus one
// node per module for its top-level statements that declare nothing (`X.displayName = ...`,
// a side-effect import). A node's edges are the value names its code reads, resolved by the
// module's own scopes (tools/audit/static-eval.ts `StaticReader.resolve`): a top-level name
// of the same module, or an import followed through every re-export (`export { X } from`,
// `export { X }` of an import, `export * from`) to the declarations it names. A relative
// specifier names a module on every platform at once (`./glass-surface.js` is
// glass-surface.tsx, glass-surface.ios.tsx and glass-surface.android.tsx), so a name read
// on any platform counts. Types are never edges: a type cannot render. A package
// (`react-native`) is outside the kit and ends the walk. Every declaration of a module also
// reads the module's own top-level statements, since importing any name runs them.
//
// What the reader cannot follow fails with the file and line (a relative `require()` or
// `import()`, a relative specifier that names no module, `export * as`), as every audit
// fact does: a consumer list that silently dropped an import would let a turn skip a
// component the change reaches.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";
import ts from "typescript";
import { StaticReader, boundNames, isValueRead } from "./static-eval.ts";

/** The platform suffixes a module may carry a build for, as Metro and react-native-web resolve them. */
export const PLATFORM_SUFFIXES = ["", ".web", ".ios", ".android", ".native"] as const;
const TS_EXTENSIONS = [".ts", ".tsx"] as const;
/** Specifiers that name an asset, not a module: not code, so no edge. */
const ASSET = /\.(png|jpe?g|gif|svg|ttf|otf|woff2?|json|css|mp4)$/i;

/** The node of a module's top-level statements that declare nothing. */
export const MODULE_BODY = "<module>";

/** A top-level declaration of a kit module (repo-relative file), or the module's body (`name` MODULE_BODY). */
export interface KitSymbol {
  file: string;
  name: string;
}

/** Where an exported name comes from: a kit declaration, or a package's export passed through. */
export type ExportOrigin = KitSymbol | { package: string; name: string };

export const symbolId = (s: KitSymbol): string => `${s.file}#${s.name}`;
/** A node id back to its symbol. */
export const symbolOf = (id: string): KitSymbol => {
  const at = id.lastIndexOf("#");
  return { file: id.slice(0, at), name: id.slice(at + 1) };
};

/** A name the kit graph cannot follow; the facts fail rather than leave an edge out. */
export class UnreadableKitModule extends Error {
  constructor(file: string, line: number, what: string) {
    super(`${file}:${line}: ${what}; the audit's consumer reader cannot follow it (tools/audit/kit-graph.ts)`);
    this.name = "UnreadableKitModule";
  }
}

interface ExportEntry {
  /** The name in the module it comes from (`*` for a namespace re-export, which the reader refuses). */
  local: string;
  /** The specifier it is re-exported from, or null for a local name (declared here or imported). */
  from: string | null;
  typeOnly: boolean;
}

interface ImportBinding {
  specifier: string;
  /** The name imported, `default`, or `*` for a namespace. */
  imported: string;
  typeOnly: boolean;
}

interface ModuleInfo {
  file: string;
  sf: ts.SourceFile;
  reader: StaticReader;
  imports: Map<string, ImportBinding>;
  /** Top-level value declarations: the statement that declares each name. */
  values: Map<string, ts.Node>;
  /** Top-level type declarations (interfaces, type aliases; classes and enums are values too). */
  types: Set<string>;
  exports: Map<string, ExportEntry>;
  /** `export * from` specifiers, and whether each is `export type *`. */
  stars: { from: string; typeOnly: boolean }[];
  /** Specifiers of side-effect imports (`import "./x"`), read by the module body. */
  sideEffects: string[];
  /** Top-level statements that declare nothing, read as the module body. */
  body: ts.Node[];
}

const hasModifier = (node: ts.Node, kind: ts.SyntaxKind): boolean =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === kind);

const lineOf = (sf: ts.SourceFile, node: ts.Node): number => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

/** Every TypeScript module under a directory (tests and declaration files left out), repo-relative and sorted. */
export function kitModules(root: string, dir = "src"): string[] {
  const out: string[] = [];
  const walk = (abs: string): void => {
    if (!existsSync(abs)) return;
    for (const name of readdirSync(abs).sort()) {
      const path = join(abs, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(name) && !/\.d\.ts$/.test(name) && !/[._](test|spec)\.tsx?$/.test(name)) out.push(relative(root, path).split(sep).join("/"));
    }
  };
  walk(join(root, dir));
  return out.sort();
}

/**
 * The modules a relative specifier names from a module, on every platform: the module and
 * each platform build of it (`x.tsx`, `x.web.tsx`, `x.ios.tsx`, `x.android.tsx`,
 * `x.native.tsx`, and the same under `x/index`), repo-relative. A `.js` specifier names its
 * TypeScript source, as the kit's ESM imports do. Empty for a specifier that names none.
 */
export function moduleFiles(root: string, fromFile: string, specifier: string): string[] {
  const base = posix.normalize(posix.join(posix.dirname(fromFile), specifier));
  const stem = base.replace(/\.(js|jsx|mjs|ts|tsx)$/, "");
  const out: string[] = [];
  for (const prefix of [stem, `${stem}/index`]) {
    for (const suffix of PLATFORM_SUFFIXES) {
      for (const ext of TS_EXTENSIONS) {
        const candidate = `${prefix}${suffix}${ext}`;
        const abs = join(root, candidate);
        if (existsSync(abs) && statSync(abs).isFile() && !out.includes(candidate)) out.push(candidate);
      }
    }
    if (out.length) break;
  }
  return out;
}

/** A module path as a stem: its extension and platform suffix gone (`src/style/glass-surface/glass-surface`). */
export function moduleStem(path: string): string {
  return path.replace(/\.(js|jsx|mjs|ts|tsx)$/, "").replace(/\.(web|ios|android|native)$/, "");
}

function readModule(root: string, file: string): ModuleInfo {
  const source = readFileSync(join(root, file), "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const info: ModuleInfo = { file, sf, reader: new StaticReader(sf), imports: new Map(), values: new Map(), types: new Set(), exports: new Map(), stars: [], sideEffects: [], body: [] };
  const exportLocal = (name: string, statement: ts.Node, typeOnly: boolean) => {
    if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) info.exports.set(hasModifier(statement, ts.SyntaxKind.DefaultKeyword) ? "default" : name, { local: name, from: null, typeOnly });
  };
  for (const s of sf.statements) {
    if (ts.isImportDeclaration(s)) {
      if (!ts.isStringLiteral(s.moduleSpecifier)) continue;
      const specifier = s.moduleSpecifier.text;
      const clause = s.importClause;
      if (!clause) {
        info.sideEffects.push(specifier);
        continue;
      }
      if (clause.name) info.imports.set(clause.name.text, { specifier, imported: "default", typeOnly: clause.isTypeOnly });
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) info.imports.set(bindings.name.text, { specifier, imported: "*", typeOnly: clause.isTypeOnly });
      else if (bindings) {
        for (const element of bindings.elements) {
          info.imports.set(element.name.text, { specifier, imported: (element.propertyName ?? element.name).text, typeOnly: clause.isTypeOnly || element.isTypeOnly });
        }
      }
    } else if (ts.isExportDeclaration(s)) {
      const from = s.moduleSpecifier && ts.isStringLiteral(s.moduleSpecifier) ? s.moduleSpecifier.text : null;
      if (!s.exportClause) {
        if (from) info.stars.push({ from, typeOnly: s.isTypeOnly });
      } else if (ts.isNamespaceExport(s.exportClause)) {
        if (from?.startsWith(".")) throw new UnreadableKitModule(file, lineOf(sf, s), `\`export * as ${s.exportClause.name.text}\` re-exports a module as a namespace`);
        info.exports.set(s.exportClause.name.text, { local: "*", from, typeOnly: s.isTypeOnly });
      } else {
        for (const element of s.exportClause.elements) {
          info.exports.set(element.name.text, { local: (element.propertyName ?? element.name).text, from, typeOnly: s.isTypeOnly || element.isTypeOnly });
        }
      }
    } else if (ts.isVariableStatement(s)) {
      for (const decl of s.declarationList.declarations) {
        for (const bound of boundNames(decl.name)) {
          info.values.set(bound.id.text, s);
          exportLocal(bound.id.text, s, false);
        }
      }
    } else if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s) || ts.isEnumDeclaration(s)) && s.name) {
      if (ts.isFunctionDeclaration(s) && !s.body) continue; // an overload signature
      info.values.set(s.name.text, s);
      if (ts.isClassDeclaration(s) || ts.isEnumDeclaration(s)) info.types.add(s.name.text);
      exportLocal(s.name.text, s, false);
    } else if (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) {
      info.types.add(s.name.text);
      exportLocal(s.name.text, s, true);
    } else if (ts.isExportAssignment(s)) {
      if (!s.isExportEquals) {
        info.values.set("default", s);
        info.exports.set("default", { local: "default", from: null, typeOnly: false });
      }
    } else if (!ts.isModuleDeclaration(s) && !ts.isEmptyStatement(s)) {
      info.body.push(s);
    }
  }
  return info;
}

/** Whether an identifier is declared by a scope below the module's top level (a parameter, a local, a catch variable), which shadows a top-level name. */
function shadowedBelowTop(id: ts.Identifier): boolean {
  const name = id.text;
  for (let node: ts.Node = id; node.parent && !ts.isSourceFile(node.parent); node = node.parent) {
    const scope = node.parent;
    if (ts.isFunctionLike(scope) && scope.parameters.some((p) => boundNames(p.name).some((b) => b.id.text === name))) return true;
    if ((ts.isFunctionExpression(scope) || ts.isClassExpression(scope)) && scope.name?.text === name) return true;
    if (ts.isCatchClause(scope) && scope.variableDeclaration && boundNames(scope.variableDeclaration.name).some((b) => b.id.text === name)) return true;
    if ((ts.isForStatement(scope) || ts.isForOfStatement(scope) || ts.isForInStatement(scope)) && scope.initializer && ts.isVariableDeclarationList(scope.initializer)) {
      if (scope.initializer.declarations.some((d) => boundNames(d.name).some((b) => b.id.text === name))) return true;
    }
    if (ts.isBlock(scope) || ts.isCaseClause(scope) || ts.isDefaultClause(scope) || ts.isModuleBlock(scope)) {
      for (const st of scope.statements) {
        if (ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => boundNames(d.name).some((b) => b.id.text === name))) return true;
        if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)) && st.name?.text === name) return true;
      }
    }
  }
  return false;
}

/** Whether a declaration statement is at a module's top level. */
const topLevel = (statement: ts.Node | undefined): boolean => statement !== undefined && ts.isSourceFile(statement.parent);

export class KitGraph {
  private readonly modules = new Map<string, ModuleInfo>();
  private readonly resolved = new Map<string, { origins: ExportOrigin[]; through: string[] }>();
  private edgesById: Map<string, Set<string>> | null = null;
  private reverse: Map<string, Set<string>> | null = null;
  private readonly relayed = new Map<string, ReadonlySet<string>>();

  constructor(
    readonly root: string,
    /** The modules the graph covers (repo-relative); every module under src/ by default. */
    readonly files: readonly string[] = kitModules(root),
  ) {}

  module(file: string): ModuleInfo {
    let info = this.modules.get(file);
    if (!info) {
      info = readModule(this.root, file);
      this.modules.set(file, info);
    }
    return info;
  }

  private targets(file: string, specifier: string, at: ts.Node): string[] {
    const found = moduleFiles(this.root, file, specifier);
    if (!found.length && !ASSET.test(specifier)) {
      const info = this.module(file);
      throw new UnreadableKitModule(file, lineOf(info.sf, at), `"${specifier}" names no TypeScript module on any platform`);
    }
    return found;
  }

  /**
   * Where a module's export of a name comes from, on every platform: the kit declarations
   * it names (followed through every re-export), and the package exports it passes on.
   * `kind` asks for a value or a type. Empty when the module does not export the name.
   */
  exportOrigins(file: string, name: string, kind: "value" | "type" = "value"): ExportOrigin[] {
    return this.trace(file, name, kind, new Set()).origins;
  }

  /**
   * The modules a module's export of a name passes through on its way to its declarations,
   * itself included, on every platform (`src/index.ts` -> `src/style/public.ts` ->
   * `src/style/theme.tsx` for `useTheme`). Empty when it does not export the name.
   */
  exportChain(file: string, name: string, kind: "value" | "type" = "value"): string[] {
    return this.trace(file, name, kind, new Set()).through;
  }

  private trace(file: string, name: string, kind: "value" | "type", seen: Set<string>): { origins: ExportOrigin[]; through: string[] } {
    const key = `${file}#${name}#${kind}`;
    const cached = this.resolved.get(key);
    if (cached) return cached;
    const none = { origins: [], through: [] };
    if (seen.has(key)) return none;
    seen.add(key);
    const info = this.module(file);
    const origins: ExportOrigin[] = [];
    const through = new Set<string>();
    const add = (found: { origins: ExportOrigin[]; through: string[] }) => {
      if (!found.origins.length) return;
      through.add(file);
      for (const t of found.through) through.add(t);
      for (const o of found.origins) if (!origins.some((p) => JSON.stringify(p) === JSON.stringify(o))) origins.push(o);
    };
    const follow = (specifier: string, imported: string, at: ts.Node): { origins: ExportOrigin[]; through: string[] } => {
      if (!specifier.startsWith(".")) return { origins: [{ package: specifier, name: imported }], through: [] };
      const found = this.targets(file, specifier, at).map((target) => this.trace(target, imported, kind, seen));
      return { origins: found.flatMap((f) => f.origins), through: found.flatMap((f) => f.through) };
    };
    const entry = info.exports.get(name);
    if (entry) {
      if (kind === "value" && entry.typeOnly) {
        // `export type { X }`: no value under this name.
      } else if (entry.from !== null) add(follow(entry.from, entry.local, info.sf));
      else if (kind === "value" ? info.values.has(entry.local) : info.types.has(entry.local)) add({ origins: [{ file, name: entry.local }], through: [] });
      else {
        const binding = info.imports.get(entry.local);
        if (binding && (kind === "type" || !binding.typeOnly) && binding.imported !== "*") add(follow(binding.specifier, binding.imported, info.sf));
      }
    } else if (name !== "default") {
      for (const star of info.stars) if (kind === "type" || !star.typeOnly) add(follow(star.from, name, info.sf));
    }
    const result = { origins, through: [...through].sort() };
    this.resolved.set(key, result);
    return result;
  }

  /** Every name a module exports (values and types), through its re-exports, sorted. */
  exportNames(file: string, seen = new Set<string>()): string[] {
    if (seen.has(file)) return [];
    seen.add(file);
    const info = this.module(file);
    const names = new Set(info.exports.keys());
    for (const star of info.stars) {
      if (!star.from.startsWith(".")) continue;
      for (const target of this.targets(file, star.from, info.sf)) for (const n of this.exportNames(target, seen)) if (n !== "default") names.add(n);
    }
    return [...names].sort();
  }

  /** The value declarations an import binding reads, on every platform. */
  private importedValues(file: string, binding: ImportBinding, member: string | null, at: ts.Node): KitSymbol[] {
    if (!binding.specifier.startsWith(".")) return [];
    const targets = this.targets(file, binding.specifier, at);
    const kit = (origins: ExportOrigin[]) => origins.filter((o): o is KitSymbol => "file" in o);
    if (binding.imported !== "*") return targets.flatMap((t) => kit(this.exportOrigins(t, binding.imported)));
    // A namespace: the member read off it, or every value it exports when it is read whole.
    if (member !== null) return targets.flatMap((t) => kit(this.exportOrigins(t, member)));
    return targets.flatMap((t) => this.exportNames(t).flatMap((n) => kit(this.exportOrigins(t, n))));
  }

  /** The kit declarations a value-read identifier names: a top-level name of its own module, or what an import of it names. */
  private symbolsOf(info: ModuleInfo, n: ts.Identifier): KitSymbol[] {
    const binding = info.reader.resolve(n);
    if (binding?.kind === "import") {
      const imported = info.imports.get(n.text);
      if (!imported || imported.typeOnly) return [];
      let member: string | null = null;
      const parent = n.parent;
      if (ts.isPropertyAccessExpression(parent) && parent.expression === n) member = parent.name.text;
      else if (ts.isElementAccessExpression(parent) && parent.expression === n && ts.isStringLiteralLike(parent.argumentExpression)) member = parent.argumentExpression.text;
      return this.importedValues(info.file, imported, member, n);
    }
    if (binding?.kind === "const" && binding.topLevel) return [{ file: info.file, name: binding.id.text }];
    if (binding?.kind === "let" && topLevel(binding.decl.parent.parent)) return [{ file: info.file, name: binding.id.text }];
    if (binding?.kind === "function" && topLevel(binding.decl)) return [{ file: info.file, name: n.text }];
    if (binding?.kind === "opaque" && info.values.has(n.text) && !shadowedBelowTop(n)) return [{ file: info.file, name: n.text }];
    return [];
  }

  /** The symbols a top-level statement's code reads: the module's own top-level names and what its imports name. */
  private readsOf(info: ModuleInfo, node: ts.Node): KitSymbol[] {
    const out: KitSymbol[] = [];
    const visit = (n: ts.Node): void => {
      if (ts.isTypeNode(n) || ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n) || ts.isImportDeclaration(n)) return;
      if (ts.isCallExpression(n) && n.arguments.length && (n.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(n.expression) && n.expression.text === "require"))) {
        const arg = n.arguments[0];
        const text = ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg) ? arg.text : null;
        if (text === null || text.startsWith(".")) throw new UnreadableKitModule(info.file, lineOf(info.sf, n), `a dynamic ${text === null ? "import of a computed specifier" : `import of "${text}"`}`);
      }
      if (ts.isIdentifier(n) && isValueRead(n)) out.push(...this.symbolsOf(info, n));
      ts.forEachChild(n, visit);
    };
    visit(node);
    return out;
  }

  /**
   * The contexts a top-level declaration relays, as node ids: each one it reads with
   * `useContext(X)` and provides again (`<X.Provider>`, or `X.Provider` read any other way),
   * so a subtree it renders elsewhere sees the value its own place had (the overlay layer's
   * `usePortalMount` carrying the publisher's breakpoint and readiness into a portal).
   */
  relays(id: string): ReadonlySet<string> {
    const cached = this.relayed.get(id);
    if (cached) return cached;
    const found = new Set<string>();
    const { file, name } = symbolOf(id);
    const info = this.files.includes(file) ? this.module(file) : null;
    const statement = info && name !== MODULE_BODY ? info.values.get(name) : undefined;
    if (info && statement) {
      const consumed = new Set<string>();
      const provided = new Set<string>();
      const visit = (n: ts.Node): void => {
        if (ts.isCallExpression(n) && n.arguments[0] && ts.isIdentifier(n.arguments[0])) {
          const callee = n.expression;
          const isUseContext = (ts.isIdentifier(callee) && callee.text === "useContext") || (ts.isPropertyAccessExpression(callee) && callee.name.text === "useContext");
          if (isUseContext) for (const s of this.symbolsOf(info, n.arguments[0])) consumed.add(symbolId(s));
        }
        if (ts.isPropertyAccessExpression(n) && n.name.text === "Provider" && ts.isIdentifier(n.expression)) {
          for (const s of this.symbolsOf(info, n.expression)) provided.add(symbolId(s));
        }
        ts.forEachChild(n, visit);
      };
      visit(statement);
      for (const context of consumed) if (provided.has(context)) found.add(context);
    }
    this.relayed.set(id, found);
    return found;
  }

  /** Every node's edges: the symbols its code reads. Built once, over every module the graph covers. */
  edges(): Map<string, Set<string>> {
    if (this.edgesById) return this.edgesById;
    const edges = new Map<string, Set<string>>();
    const covered = new Set(this.files);
    const link = (from: string, to: KitSymbol) => {
      // A read the graph has no node for would be an edge dropped in silence: refuse it.
      if (!covered.has(to.file)) throw new Error(`kit-graph: ${from} reads ${symbolId(to)}, a module outside the ones the graph covers`);
      const id = symbolId(to);
      if (id !== from) edges.get(from)!.add(id);
    };
    for (const file of this.files) {
      const info = this.module(file);
      const bodyId = symbolId({ file, name: MODULE_BODY });
      edges.set(bodyId, new Set());
      for (const statement of info.body) for (const s of this.readsOf(info, statement)) link(bodyId, s);
      for (const specifier of info.sideEffects) {
        if (!specifier.startsWith(".")) continue;
        for (const target of this.targets(file, specifier, info.sf)) link(bodyId, { file: target, name: MODULE_BODY });
      }
      const reads = new Map<ts.Node, KitSymbol[]>();
      for (const [name, statement] of info.values) {
        const id = symbolId({ file, name });
        edges.set(id, new Set([bodyId]));
        if (!reads.has(statement)) reads.set(statement, this.readsOf(info, statement));
        for (const s of reads.get(statement)!) link(id, s);
      }
    }
    this.edgesById = edges;
    return edges;
  }

  /** Every node and the nodes that read it. */
  readers(): Map<string, Set<string>> {
    if (this.reverse) return this.reverse;
    const reverse = new Map<string, Set<string>>();
    for (const id of this.edges().keys()) reverse.set(id, new Set());
    for (const [from, tos] of this.edges()) for (const to of tos) reverse.get(to)!.add(from);
    this.reverse = reverse;
    return reverse;
  }

  /** The nodes of a module: its top-level value declarations and its body. */
  nodesOf(file: string): string[] {
    const info = this.module(file);
    return [...[...info.values.keys()].map((name) => symbolId({ file, name })), symbolId({ file, name: MODULE_BODY })];
  }

  /**
   * The nodes that reach a target set by reading it, directly or through other nodes, each
   * with the next node on a shortest way there (`null` for a target itself). `allowed` keeps
   * the walk to the nodes it lets through (the targets always count).
   */
  reaching(targets: Iterable<string>, allowed: (id: string) => boolean = () => true): Map<string, string | null> {
    const readers = this.readers();
    const next = new Map<string, string | null>();
    const queue: string[] = [];
    for (const t of targets) {
      if (!readers.has(t) || next.has(t)) continue;
      next.set(t, null);
      queue.push(t);
    }
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i]!;
      for (const reader of readers.get(id) ?? []) {
        if (next.has(reader) || !allowed(reader)) continue;
        next.set(reader, id);
        queue.push(reader);
      }
    }
    return next;
  }
}

/**
 * The owners of each node of `within`, read from the nodes that read it: a node is owned by
 * the owners all of its readers agree on (the intersection of their owner sets), so one
 * reader that owns nothing (shared vocabulary a component calls, a declaration several
 * foundations share) leaves it owned by nobody. `seed` gives the owner sets known up front
 * (each foundation's public declarations); a reader in neither `seed` nor `within` owns
 * nothing. Readers are decided before what they read (a set of nodes that read each other
 * in a cycle is decided as one, from the readers outside it).
 *
 * One reader does not count: a relay (`KitGraph.relays`), which reads a context and
 * provides it again. It carries the context's owner into a subtree rather than using the
 * context itself: the overlay layer relays BreakpointOverrideContext into every portal, and
 * the context stays BreakpointOverride's, whose consumers then include what the layer
 * publishes.
 */
export function ownersByReaders(graph: KitGraph, seed: ReadonlyMap<string, ReadonlySet<string>>, within: ReadonlySet<string>): Map<string, Set<string>> {
  const edges = graph.edges();
  const readers = graph.readers();
  // Tarjan's strongly connected components over `within`, reader -> what it reads,
  // iteratively. Components come out readees first, so the reverse is readers first.
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];
  let counter = 0;
  for (const start of within) {
    if (index.has(start)) continue;
    const work: { id: string; next: Iterator<string> }[] = [];
    const open = (id: string) => {
      index.set(id, counter);
      low.set(id, counter);
      counter += 1;
      stack.push(id);
      onStack.add(id);
      work.push({ id, next: [...(edges.get(id) ?? [])].filter((to) => within.has(to))[Symbol.iterator]() });
    };
    open(start);
    while (work.length) {
      const frame = work[work.length - 1]!;
      const step = frame.next.next();
      if (!step.done) {
        const to = step.value;
        if (!index.has(to)) open(to);
        else if (onStack.has(to)) low.set(frame.id, Math.min(low.get(frame.id)!, index.get(to)!));
        continue;
      }
      work.pop();
      if (work.length) {
        const parent = work[work.length - 1]!;
        low.set(parent.id, Math.min(low.get(parent.id)!, low.get(frame.id)!));
      }
      if (low.get(frame.id) === index.get(frame.id)) {
        const component: string[] = [];
        let id: string;
        do {
          id = stack.pop()!;
          onStack.delete(id);
          component.push(id);
        } while (id !== frame.id);
        components.push(component);
      }
    }
  }
  const owners = new Map<string, Set<string>>();
  const none: ReadonlySet<string> = new Set<string>();
  for (const component of components.reverse()) {
    const members = new Set(component);
    let agreed = null as Set<string> | null;
    for (const id of component) {
      for (const reader of readers.get(id) ?? []) {
        if (members.has(reader) || graph.relays(reader).has(id)) continue;
        const theirs: ReadonlySet<string> = seed.get(reader) ?? owners.get(reader) ?? none;
        agreed = agreed === null ? new Set(theirs) : new Set([...agreed].filter((owner: string) => theirs.has(owner)));
      }
    }
    for (const id of component) owners.set(id, new Set(agreed ?? []));
  }
  return owners;
}

/** How a consumer reaches a foundation. */
export type ConsumerTier = "direct" | "shared" | "component";

export const TIER_ORDER: readonly ConsumerTier[] = ["direct", "shared", "component"];

/** A component that renders through a foundation, and how. */
export interface Consumer {
  slug: string;
  tier: ConsumerTier;
  /**
   * What it reads on the way: for `direct`, the foundation's names its own code reads; for
   * `shared`, the declarations of shared kit modules it reads that lead there
   * (`GlassPane (src/style/glass-surface/glass-pane.tsx)`); for `component`, the other kit
   * components whose code leads there.
   */
  through: string[];
}

/** A component as the consumer reader sees it: its slug, its own modules, and the source directory that owns them (null for a primitive built in a shared module). */
export interface ConsumerCandidate {
  slug: string;
  modules: string[];
  sourceDir: string | null;
}

/**
 * The components that render through a target set of declarations, each with how it gets
 * there, in the candidates' order within each tier (direct first, then through shared kit
 * modules, then only through other kit components).
 *
 * A component's own nodes are every declaration and the body of its own modules. It reads
 * the foundation **directly** when one of them reads a target; **through shared modules**
 * when one reads a node of a module no component directory owns (the style layer,
 * src/charts/shared) that reaches a target through such modules alone; **through other kit
 * components** when it reaches one only by way of another component's directory (Dialog
 * through Button). A primitive whose own module sits in the style layer (Text, Pressable)
 * is a component like any other here, and its module is shared for everyone else.
 */
export function consumersOf(graph: KitGraph, targets: readonly KitSymbol[], candidates: readonly ConsumerCandidate[]): Consumer[] {
  const targetIds = new Set(targets.map(symbolId).filter((id) => graph.edges().has(id)));
  const ownerOf = new Map<string, string>();
  const dirs = candidates.filter((c) => c.sourceDir !== null);
  const owner = (file: string): string | null => {
    let found = ownerOf.get(file);
    if (found === undefined) {
      found = dirs.find((c) => file.startsWith(`${c.sourceDir}/`))?.slug ?? "";
      ownerOf.set(file, found);
    }
    return found || null;
  };
  const fileOf = (id: string) => symbolOf(id).file;
  const viaShared = graph.reaching(targetIds, (id) => owner(fileOf(id)) === null);
  const viaAny = graph.reaching(targetIds);
  const edges = graph.edges();
  const label = (id: string) => {
    const s = symbolOf(id);
    return s.name === MODULE_BODY ? `the body of ${s.file}` : `\`${s.name}\` (${s.file})`;
  };
  const byTier: Record<ConsumerTier, Consumer[]> = { direct: [], shared: [], component: [] };
  for (const candidate of candidates) {
    const own = new Set(candidate.modules.flatMap((m) => graph.nodesOf(m)));
    const reads = [...new Set([...own].flatMap((id) => [...(edges.get(id) ?? [])]))].filter((id) => !own.has(id));
    const declared = [...own].filter((id) => targetIds.has(id));
    const direct = [...new Set([...declared, ...reads.filter((id) => targetIds.has(id))].map((id) => symbolOf(id).name))].sort();
    if (direct.length) {
      byTier.direct.push({ slug: candidate.slug, tier: "direct", through: direct });
      continue;
    }
    const shared = reads.filter((id) => viaShared.has(id)).map(label).sort();
    if (shared.length) {
      byTier.shared.push({ slug: candidate.slug, tier: "shared", through: [...new Set(shared)] });
      continue;
    }
    const components = new Set<string>();
    for (const id of reads.filter((r) => viaAny.has(r))) {
      // Follow the shortest way toward a target until it enters another component's directory.
      for (let at: string | null | undefined = id; at; at = viaAny.get(at)) {
        const o = owner(fileOf(at));
        if (o && o !== candidate.slug) {
          components.add(o);
          break;
        }
      }
    }
    if (components.size) byTier.component.push({ slug: candidate.slug, tier: "component", through: [...components].sort() });
  }
  return TIER_ORDER.flatMap((tier) => byTier[tier]);
}
