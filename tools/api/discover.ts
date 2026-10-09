import { relative, resolve } from "node:path";
import ts from "typescript";
import type { ApiExport, Resolution } from "./types";

function reactElement(type: ts.Type, checker: ts.TypeChecker, visited = new Set<ts.Type>()): boolean {
  if (visited.has(type)) return false;
  visited.add(type);
  if (type.isUnionOrIntersection()) return type.types.some((part) => reactElement(part, checker, visited));
  // Null-only declarative children and scalar-returning components are legal React
  // output too. Do not require JSX syntax or a frame.
  if (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.BigIntLike)) return true;
  const symbol = type.getSymbol();
  // ReactNode expands to a union containing ReactElement. JSX.Element and
  // createElement's FunctionComponentElement extend ReactElement.
  if (symbol?.getName() === "ReactElement" && symbol.declarations?.some((node) => /[/\\]@types[/\\]react[/\\]/.test(node.getSourceFile().fileName))) return true;
  if (type.flags & ts.TypeFlags.Object) {
    const object = type as ts.ObjectType;
    if (object.objectFlags & ts.ObjectFlags.Reference) {
      const reference = type as ts.TypeReference;
      if (reference.target !== type && reactElement(reference.target, checker, visited)) return true;
      if (symbol?.getName() === "Promise" && checker.getTypeArguments(reference).some((value) => reactElement(value, checker, visited))) return true;
    }
    if (object.objectFlags & ts.ObjectFlags.ClassOrInterface) {
      return (checker.getBaseTypes(type as ts.InterfaceType) ?? []).some((base) => reactElement(base, checker, visited));
    }
  }
  return false;
}

/**
 * Whether a value renders as a React component: a function or class whose render
 * returns React output. One definition for both gates: the material inventory counts
 * these as renderables, and the API manifest requires them to be classified as such.
 */
export function componentType(type: ts.Type, checker: ts.TypeChecker): boolean {
  // React 19 contexts are callable providers. They remain context APIs rather
  // than named UI components and must not inflate the component inventory.
  if (type.getProperty("Provider") && type.getProperty("Consumer") && type.getProperty("$$typeof")) return false;
  if (type.isUnionOrIntersection() && type.types.some((part) => componentType(part, checker))) return true;
  if (type.getCallSignatures().some((signature) => reactElement(checker.getReturnTypeOfSignature(signature), checker))) return true;
  return type.getConstructSignatures().some((signature) => {
    const instance = checker.getReturnTypeOfSignature(signature);
    const render = instance.getProperty("render");
    const declaration = render?.valueDeclaration ?? render?.declarations?.[0];
    if (!render || !declaration || !instance.getProperty("props")) return false;
    return checker.getTypeOfSymbolAtLocation(render, declaration).getCallSignatures()
      .some((method) => reactElement(checker.getReturnTypeOfSignature(method), checker));
  });
}

// Metro's own lookup order for a relative request on each platform: the platform
// sibling, then `.native`, then the plain file. TypeScript's `moduleSuffixes` follows
// the same order, so the checker sees what dist/native resolves to on iOS and Android.
// The web entry (dist/index.js) keeps explicit `.js` specifiers and resolves the plain
// file only.
export const RESOLUTION_SUFFIXES: Record<Resolution, readonly string[] | undefined> = {
  web: undefined,
  ios: [".ios", ".native", ""],
  android: [".android", ".native", ""],
};

export const ENTRY_FILE = "src/index.ts";

/** The root tsconfig's compiler options over the package entry, for one resolution. */
export function entryProgram(root: string, resolution: Resolution = "web"): ts.Program {
  const config = ts.readConfigFile(resolve(root, "tsconfig.json"), ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  if (parsed.errors.length) throw new Error(parsed.errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n")).join("\n"));
  const suffixes = RESOLUTION_SUFFIXES[resolution];
  return ts.createProgram([resolve(root, ENTRY_FILE)], {
    ...parsed.options,
    noEmit: true,
    ...(suffixes ? { moduleSuffixes: [...suffixes] } : {}),
  });
}

function deprecatedTag(symbol: ts.Symbol, checker: ts.TypeChecker): boolean {
  if (symbol.getJsDocTags(checker).some((tag) => tag.name === "deprecated")) return true;
  // The checker does not carry a tag written on a re-export statement
  // (`/** @deprecated */ export { a as b }`) to the alias, so read the statement.
  return (symbol.declarations ?? []).some((node) => ts.isExportSpecifier(node) &&
    [node, node.parent.parent].some((owner) => ts.getJSDocDeprecatedTag(owner) !== undefined));
}

/** A tag on any re-export between the entry and the declaration, or on the declaration, marks the public name. */
function deprecatedAlongChain(exported: ts.Symbol, checker: ts.TypeChecker): boolean {
  let current: ts.Symbol | undefined = exported;
  const seen = new Set<ts.Symbol>();
  while (current && !seen.has(current)) {
    seen.add(current);
    if (deprecatedTag(current, checker)) return true;
    current = current.flags & ts.SymbolFlags.Alias ? checker.getImmediateAliasedSymbol(current) : undefined;
  }
  return false;
}

/** Every named export of a module, values and types, with the facts the API gate checks. */
export function moduleExports(program: ts.Program, entryFile: string, root: string): ApiExport[] {
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entryFile);
  const module = source && checker.getSymbolAtLocation(source);
  if (!module) throw new Error(`Cannot inspect public entry: ${entryFile}`);
  const result: ApiExport[] = [];
  for (const exported of checker.getExportsOfModule(module)) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declarations = symbol.declarations ?? [];
    const value = Boolean(symbol.flags & ts.SymbolFlags.Value);
    const declaration = symbol.valueDeclaration ?? declarations[0];
    const type = value && declaration ? checker.getTypeOfSymbolAtLocation(symbol, declaration) : undefined;
    const name = exported.getName();
    // A named component, as the material inventory counts them: React output alone
    // includes a string, so `alpha()` would otherwise pass for one.
    const renderable = Boolean(type && /^[A-Z]/.test(name) && componentType(type, checker));
    result.push({
      name,
      value,
      renderable,
      callable: Boolean(type && !renderable && type.getCallSignatures().length),
      deprecated: deprecatedAlongChain(exported, checker),
      files: [...new Set(declarations.map((node) => relative(root, node.getSourceFile().fileName).replaceAll("\\", "/")))].sort(),
    });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

/** The package entry's exports under each resolution: the web build, then Metro's iOS and Android lookups. */
export function discoverPublicApi(root: string): Record<Resolution, ApiExport[]> {
  const entry = resolve(root, ENTRY_FILE);
  const read = (resolution: Resolution) => moduleExports(entryProgram(root, resolution), entry, root);
  return { web: read("web"), ios: read("ios"), android: read("android") };
}
