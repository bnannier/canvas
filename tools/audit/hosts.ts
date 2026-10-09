// What the static reader (tools/audit/static-eval.ts) may take from the checkout itself,
// beyond the module it reads: the pure functions of node:path, the read-only ones of
// node:fs and Bun's Glob (inside the checkout only), node:url, `import.meta` and
// `__dirname` of the module being read, and the exported consts and functions of the
// repo's own modules, read with the same reader. A test that lists the kit's files
// (test/design-rules-skins.test.ts globs every styles module and reads each to decide
// whether to import it) gets the same list and the same decision here as when it runs,
// because both read the same checkout; a path outside the checkout, a relative path
// whose meaning depends on the working directory, an environment variable: those stay
// UNKNOWN, so a fact built from them fails rather than guesses. A directory `mkdtemp`
// makes at run time has a name no reader can know, but not a place: it is some path
// inside the directory its prefix names (`PathUnder`), which is enough to prove that a
// module a test copies there (test/check-size.test.ts) is not the kit.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import * as nodePath from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { Closure, Host, StaticReader, UNKNOWN, boundNames, type EvalHooks } from "./static-eval.ts";

/** Whether a path is a directory or inside it. */
export function within(root: string, path: string): boolean {
  const rel = nodePath.relative(root, path);
  return rel === "" || (!rel.startsWith("..") && !nodePath.isAbsolute(rel));
}

export function parseModule(file: string, source: string): ts.SourceFile {
  const kind = /\.tsx$/.test(file) ? ts.ScriptKind.TSX : /\.[cm]?js$/.test(file) ? ts.ScriptKind.JS : file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
}

/** The module file a relative specifier names from a module (extension-less, `.js` for `.ts`, a directory's index), or null. */
export function resolveModule(fromFile: string, specifier: string): string | null {
  const base = nodePath.resolve(nodePath.dirname(fromFile), specifier);
  const stem = base.replace(/\.(js|jsx|mjs)$/, "");
  for (const candidate of [base, `${stem}.ts`, `${stem}.tsx`, nodePath.join(base, "index.ts"), nodePath.join(base, "index.tsx")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof PathUnder);

/** Some path inside a directory, whose own name is made at run time (a `mkdtemp` directory, or a file joined under one). */
export class PathUnder {
  constructor(readonly dir: string) {}
}
const strings = (args: unknown[]): args is string[] => args.every((a) => typeof a === "string");

/** node:path, pure: `resolve` and `relative` only where no argument depends on the working directory. */
const PATH: Record<string, unknown> = {
  join: new Host((args) => {
    if (strings(args)) return nodePath.join(...args);
    // Under a run-time directory, a tail that stays inside it stays inside it.
    const [first, ...rest] = args;
    if (!(first instanceof PathUnder) || !strings(rest)) return UNKNOWN;
    const tail = rest.length ? nodePath.join(...rest) : ".";
    return tail.startsWith("..") || nodePath.isAbsolute(tail) ? UNKNOWN : first;
  }),
  resolve: new Host((args) => (strings(args) && args.some((a) => nodePath.isAbsolute(a)) ? nodePath.resolve(...args) : UNKNOWN)),
  relative: new Host((args) => (strings(args) && args.length === 2 && args.every((a) => nodePath.isAbsolute(a)) ? nodePath.relative(args[0], args[1]) : UNKNOWN)),
  dirname: new Host(([p]) => (typeof p === "string" ? nodePath.dirname(p) : UNKNOWN)),
  basename: new Host((args) => (strings(args) && args.length <= 2 ? nodePath.basename(args[0], args[1]) : UNKNOWN)),
  extname: new Host(([p]) => (typeof p === "string" ? nodePath.extname(p) : UNKNOWN)),
  normalize: new Host(([p]) => (typeof p === "string" ? nodePath.normalize(p) : UNKNOWN)),
  isAbsolute: new Host(([p]) => (typeof p === "string" ? nodePath.isAbsolute(p) : UNKNOWN)),
  sep: nodePath.sep,
  delimiter: nodePath.delimiter,
};

/** node:fs, read-only, inside the checkout, and only the forms whose answer is a plain value. */
function fsHosts(root: string): Record<string, unknown> {
  const inside = (p: unknown): p is string => typeof p === "string" && nodePath.isAbsolute(p) && within(root, p);
  return {
    readFileSync: new Host(([path, options]) => {
      const encoding = typeof options === "string" ? options : isRecord(options) ? options.encoding : undefined;
      if (!inside(path) || (encoding !== "utf8" && encoding !== "utf-8")) return UNKNOWN;
      try {
        return readFileSync(path, "utf8");
      } catch {
        return UNKNOWN;
      }
    }),
    existsSync: new Host(([path]) => (inside(path) ? existsSync(path) : UNKNOWN)),
    readdirSync: new Host((args) => {
      const [path] = args;
      if (!inside(path) || args.length > 1) return UNKNOWN;
      try {
        return readdirSync(path).sort();
      } catch {
        return UNKNOWN;
      }
    }),
  };
}

interface BunGlobClass {
  new (pattern: string): { scanSync(options: { cwd: string; onlyFiles?: boolean; dot?: boolean; absolute?: boolean }): Iterable<string>; match(path: string): boolean };
}

/** Bun's Glob, scanning inside the checkout from an absolute directory. */
function bunHosts(root: string): Record<string, unknown> {
  const Glob = (globalThis as { Bun?: { Glob: BunGlobClass } }).Bun?.Glob;
  if (!Glob) return {};
  const glob = (pattern: string) => ({
    scanSync: new Host(([options]) => {
      const opts = typeof options === "string" ? { cwd: options } : isRecord(options) ? options : null;
      if (!opts || typeof opts.cwd !== "string" || !nodePath.isAbsolute(opts.cwd) || !within(root, opts.cwd)) return UNKNOWN;
      const flags: { onlyFiles?: boolean; dot?: boolean; absolute?: boolean } = {};
      for (const key of ["onlyFiles", "dot", "absolute"] as const) {
        if (opts[key] === undefined) continue;
        if (typeof opts[key] !== "boolean") return UNKNOWN;
        flags[key] = opts[key] as boolean;
      }
      for (const key of Object.keys(opts)) if (!["cwd", "onlyFiles", "dot", "absolute"].includes(key)) return UNKNOWN;
      return [...new Glob(pattern).scanSync({ cwd: opts.cwd, ...flags })].sort();
    }),
    match: new Host(([path]) => (typeof path === "string" ? new Glob(pattern).match(path) : UNKNOWN)),
  });
  return { Glob: new Host(() => UNKNOWN, ([pattern]) => (typeof pattern === "string" ? glob(pattern) : UNKNOWN)) };
}

const URL_HOSTS: Record<string, unknown> = {
  fileURLToPath: new Host(([url]) => {
    const href = typeof url === "string" ? url : isRecord(url) && typeof url.href === "string" ? url.href : null;
    return href?.startsWith("file:") ? fileURLToPath(href) : UNKNOWN;
  }),
  pathToFileURL: new Host(([path]) => (typeof path === "string" && nodePath.isAbsolute(path) ? urlValue(pathToFileURL(path)) : UNKNOWN)),
};

const urlValue = (url: URL): Record<string, unknown> => ({ href: url.href, pathname: url.pathname, protocol: url.protocol, host: url.host, origin: url.origin, search: url.search });

/** node:fs/promises: only `mkdtemp`, whose directory is some path inside the one its absolute prefix names. */
const FS_PROMISES: Record<string, unknown> = {
  mkdtemp: new Host(([prefix]) => (typeof prefix === "string" && nodePath.isAbsolute(prefix) ? new PathUnder(nodePath.dirname(prefix)) : UNKNOWN)),
};

/** node:os: the temporary directory, an absolute path on this machine. */
const OS: Record<string, unknown> = { tmpdir: new Host(() => tmpdir()) };

/** The built-in modules the reader knows, by specifier, or null. */
function builtinModule(root: string, specifier: string): Record<string, unknown> | null {
  switch (specifier) {
    case "node:fs/promises":
    case "fs/promises":
      return FS_PROMISES;
    case "node:os":
    case "os":
      return OS;
    case "node:path":
    case "path":
      return PATH;
    case "node:fs":
    case "fs":
      return fsHosts(root);
    case "bun":
      return bunHosts(root);
    case "node:url":
    case "url":
      return URL_HOSTS;
    default:
      return null;
  }
}

/** What an import resolves to before the module graph reads it (an e2e catalog), or NOT_HANDLED. */
export const NOT_HANDLED: unique symbol = Symbol("not handled");
export type Intercept = (file: string, specifier: string, imported: string) => unknown;

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === kind);
}

/**
 * The repo's modules as the static reader sees them: one reader per module, whose
 * imports of the repo's other modules read those modules' exports (a const, a function
 * written there, a re-export), and whose imports of a catalog the caller intercepts
 * (tools/audit/sweeps.ts) are that catalog's rows.
 */
export class ModuleGraph {
  private readonly readers = new Map<string, StaticReader>();
  private readonly exporting = new Set<string>();

  constructor(
    readonly root: string,
    readonly intercept?: Intercept,
  ) {}

  /** The reader of a module (repo-relative or absolute): from disk, or from the source given for it. */
  reader(file: string, source?: string, extra: Pick<EvalHooks, "skipLoop"> = {}): StaticReader {
    const abs = nodePath.resolve(this.root, file);
    const cacheable = source === undefined && !extra.skipLoop;
    const cached = cacheable ? this.readers.get(abs) : undefined;
    if (cached) return cached;
    const reader = new StaticReader(parseModule(abs, source ?? readFileSync(abs, "utf8")), this.hooks(abs, extra));
    if (cacheable) this.readers.set(abs, reader);
    return reader;
  }

  /** The hooks of the reader of one module (an absolute path). */
  hooks(file: string, extra: Pick<EvalHooks, "skipLoop"> = {}): EvalHooks {
    return {
      ...extra,
      importValue: (specifier, imported) => {
        const caught = this.intercept ? this.intercept(file, specifier, imported) : NOT_HANDLED;
        if (caught !== NOT_HANDLED) return caught;
        const builtin = builtinModule(this.root, specifier);
        if (builtin) {
          if (imported === "*" || imported === "default") return builtin;
          return Object.prototype.hasOwnProperty.call(builtin, imported) ? builtin[imported] : UNKNOWN;
        }
        if (!specifier.startsWith(".") || imported === "*") return UNKNOWN;
        const target = resolveModule(file, specifier);
        return target && within(this.root, target) ? this.exportValue(target, imported) : UNKNOWN;
      },
      importMeta: (name) => {
        if (name === "dir" || name === "dirname") return nodePath.dirname(file);
        if (name === "path" || name === "filename") return file;
        if (name === "file") return nodePath.basename(file);
        if (name === "url") return pathToFileURL(file).href;
        return UNKNOWN;
      },
      global: (name) => {
        if (name === "__dirname") return nodePath.dirname(file);
        if (name === "__filename") return file;
        if (name === "URL") {
          return new Host(
            () => UNKNOWN,
            ([href, base]) => {
              if (typeof href !== "string" || (base !== undefined && typeof base !== "string")) return UNKNOWN;
              try {
                return urlValue(new URL(href, base));
              } catch {
                return UNKNOWN;
              }
            },
          );
        }
        return UNKNOWN;
      },
    };
  }

  /** What a module (an absolute path) exports under a name, read with its own reader, or UNKNOWN. */
  exportValue(file: string, name: string): unknown {
    const key = `${file}#${name}`;
    if (this.exporting.has(key)) return UNKNOWN;
    this.exporting.add(key);
    try {
      const reader = this.reader(file);
      const stars: string[] = [];
      for (const s of reader.sf.statements) {
        if (ts.isVariableStatement(s) && hasModifier(s, ts.SyntaxKind.ExportKeyword)) {
          for (const decl of s.declarationList.declarations) {
            const bound = boundNames(decl.name).find((b) => b.id.text === name);
            if (bound) return reader.evaluate(bound.id);
          }
        } else if (ts.isFunctionDeclaration(s) && hasModifier(s, ts.SyntaxKind.ExportKeyword)) {
          const exported = hasModifier(s, ts.SyntaxKind.DefaultKeyword) ? "default" : s.name?.text;
          if (exported === name) return new Closure(s, new Map(), reader);
        } else if (ts.isExportAssignment(s) && !s.isExportEquals && name === "default") return reader.evaluate(s.expression);
        else if (ts.isExportDeclaration(s) && !s.isTypeOnly && s.moduleSpecifier && ts.isStringLiteral(s.moduleSpecifier)) {
          const target = resolveModule(file, s.moduleSpecifier.text);
          if (!s.exportClause) {
            if (target) stars.push(target);
            continue;
          }
          if (!ts.isNamedExports(s.exportClause)) continue;
          const el = s.exportClause.elements.find((e) => !e.isTypeOnly && e.name.text === name);
          if (el) return target && within(this.root, target) ? this.exportValue(target, (el.propertyName ?? el.name).text) : UNKNOWN;
        } else if (ts.isExportDeclaration(s) && !s.isTypeOnly && s.exportClause && ts.isNamedExports(s.exportClause)) {
          const el = s.exportClause.elements.find((e) => !e.isTypeOnly && e.name.text === name);
          const local = el ? (el.propertyName ?? el.name) : undefined;
          if (local && ts.isIdentifier(local)) return reader.evaluate(local);
        }
      }
      for (const target of stars) {
        if (!within(this.root, target)) continue;
        const value = this.exportValue(target, name);
        if (value !== UNKNOWN) return value;
      }
      return UNKNOWN;
    } finally {
      this.exporting.delete(key);
    }
  }
}
