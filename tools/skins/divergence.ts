// Which components look different per platform, read from source text so it runs in
// plain bun (the styles modules pull in the kit's style layer, so importing them would
// need React Native). One definition of "diverges", shared by the docs' registry guard
// (docs/scripts/check-platform-skins.ts), which needs every divergent build in the
// three-up registry, and the shells gate (test/design-rules-shells.test.ts), which lets
// a shell import only components that look the same everywhere, and takes the rest as
// parts.
//
// A platform entry (`<name>.ios.tsx`, `<name>.android.tsx`) is read one built export at
// a time, because one file can hold builds that differ in kind: Avatar and AvatarGroup
// build from an alias of the web skin while AvatarMenu, in the same file, injects the
// platform's own Dropdown. An export diverges from the web build when the value it is
// built from reaches, through the identifiers of its initializer and the local consts
// those name, EITHER a skin that is its own object (INCLUDING a spread of the web skin
// with overrides) rather than the same object the web skin resolves to, OR a platform
// part (an import of another component's `.ios.js` / `.android.js` build). An export
// that re-exports the shared module, or builds from an alias of the web skin and injects
// nothing, renders the web build by construction. Both files are parsed with the
// TypeScript parser rather than matched by regex: a regex on `import { iosSkin ... }`
// once took `iosSkin as dropdownIosSkin` for the component's own skin and reported the
// whole Avatar file as divergent.

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
}

/** Every top-level `const` binding of a module, destructured names included. */
function declarations(sf: ts.SourceFile): Map<string, Declaration> {
  const out = new Map<string, Declaration>();
  for (const statement of sf.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const exported = hasExportModifier(statement);
    for (const decl of statement.declarationList.declarations) {
      const init = decl.initializer ?? null;
      if (ts.isIdentifier(decl.name)) out.set(decl.name.text, { init, exported });
      else if (ts.isObjectBindingPattern(decl.name)) {
        for (const element of decl.name.elements) {
          if (ts.isIdentifier(element.name)) out.set(element.name.text, { init, exported });
        }
      }
    }
  }
  return out;
}

interface ImportBinding {
  /** The name as the exporting module spells it. */
  imported: string;
  specifier: string;
}

/** Every value import of a module, by local name. Type-only imports are not values. */
function importBindings(sf: ts.SourceFile): Map<string, ImportBinding> {
  const out = new Map<string, ImportBinding>();
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) continue;
    const specifier = statement.moduleSpecifier.text;
    if (clause.name) out.set(clause.name.text, { imported: "default", specifier });
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        if (element.isTypeOnly) continue;
        out.set(element.name.text, { imported: (element.propertyName ?? element.name).text, specifier });
      }
    }
  }
  return out;
}

/** The identifiers an expression reads as values: not property names, not types. */
function referencedIdentifiers(node: ts.Node): Set<string> {
  const names = new Set<string>();
  const visit = (n: ts.Node, inType: boolean): void => {
    if (ts.isTypeNode(n)) inType = true;
    if (ts.isIdentifier(n) && !inType) {
      const parent = n.parent;
      const isPropertyName =
        (ts.isPropertyAccessExpression(parent) && parent.name === n) ||
        (ts.isPropertyAssignment(parent) && parent.name === n) ||
        (ts.isJsxAttribute(parent) && parent.name === n);
      if (!isPropertyName) names.add(n.text);
    }
    ts.forEachChild(n, (child) => visit(child, inType));
  };
  visit(node, false);
  return names;
}

/** The values an entry builds itself: `export const X =` and a destructured `export const { A, B } =`. */
export function builtExports(source: string): string[] {
  const names: string[] = [];
  for (const [name, decl] of declarations(parse("entry.tsx", source))) if (decl.exported) names.push(name);
  return names;
}

function resolveStyles(compDir: string, specifier: string): string | null {
  for (const ext of [".ts", ".tsx"]) {
    const path = join(compDir, specifier.replace(/\.js$/, ext));
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
    const target = resolveStyles(dirname(stylesPath), source.specifier);
    return target ? isWebSkinAlias(target, source.imported, seen) : false;
  }
  const target = terminal(decls, skinName);
  for (const name of decls.keys()) {
    if (/^web/.test(name) && terminal(decls, name) === target) return true;
  }
  return false;
}

/**
 * Why each built export of a platform entry diverges from the web build, or null for
 * one that renders the web build. Reasons are collected from everything the export's
 * initializer reaches: its imported skins (the component's own or another's, as the
 * AvatarMenu pill's Dropdown skin is), its platform parts, and the local consts that
 * carry either (`const MenuDropdown = createDropdown({ ...dropdownIosSkin })`).
 */
export function exportDivergences(compDir: string, source: string, platform: Platform): Record<string, string | null> {
  const { suffix } = ENTRY[platform];
  const sf = parse(`entry${ENTRY[platform].ext}`, source);
  const imports = importBindings(sf);
  const decls = declarations(sf);
  const ownDir = basename(compDir);

  const reasonsOf = (expr: ts.Expression, seen: Set<string>): string[] => {
    const reasons: string[] = [];
    for (const id of referencedIdentifiers(expr)) {
      const binding = imports.get(id);
      if (binding) {
        if (binding.specifier.endsWith(suffix)) {
          reasons.push(`injects platform parts (${binding.specifier})`);
        } else if (/\.styles\.js$/.test(binding.specifier)) {
          const stylesPath = resolveStyles(compDir, binding.specifier);
          if (!stylesPath || !isWebSkinAlias(stylesPath, binding.imported)) {
            const owner = stylesPath ? basename(dirname(stylesPath)) : null;
            reasons.push(
              owner === ownDir || owner === null
                ? `builds from its own ${binding.imported}`
                : `builds a part from ${owner}'s own ${binding.imported} (${binding.specifier})`,
            );
          }
        }
        continue;
      }
      const local = decls.get(id);
      if (local?.init && !seen.has(id)) {
        seen.add(id);
        reasons.push(...reasonsOf(local.init, seen));
      }
    }
    return [...new Set(reasons)];
  };

  const out: Record<string, string | null> = {};
  for (const [name, decl] of decls) {
    if (!decl.exported) continue;
    const reasons = decl.init ? reasonsOf(decl.init, new Set([name])) : [];
    out[name] = reasons.length ? reasons.join("; ") : null;
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
        const source = readFileSync(join(compDir, file), "utf8");
        const reasons: string[] = [];
        for (const [name, reason] of Object.entries(exportDivergences(compDir, source, platform))) {
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
