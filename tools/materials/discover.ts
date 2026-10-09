import { relative, resolve } from "node:path";
import ts from "typescript";
import { componentType, ENTRY_FILE, entryProgram } from "../api/discover";
import type { PublicRenderable } from "./types";

/** Resolve aliases, factories, forwardRef/class components and compound members. */
export function renderableExports(program: ts.Program, entryFile: string, root: string): PublicRenderable[] {
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entryFile);
  const module = source && checker.getSymbolAtLocation(source);
  if (!module) throw new Error(`Cannot inspect public entry: ${entryFile}`);
  const result: PublicRenderable[] = [];

  function visit(name: string, exported: ts.Symbol, ancestors: Set<ts.Type>) {
    if (!/^[A-Z]/.test(name.split(".").at(-1)!)) return;
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration || !(symbol.flags & ts.SymbolFlags.Value)) return;
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    if (!componentType(type, checker) || ancestors.has(type)) return;
    result.push({
      name,
      files: [...new Set((symbol.declarations ?? [declaration]).map((node) => relative(root, node.getSourceFile().fileName).replaceAll("\\", "/")))].sort(),
    });
    const next = new Set(ancestors).add(type);
    for (const member of type.getProperties()) visit(`${name}.${member.getName()}`, member, next);
  }

  for (const exported of checker.getExportsOfModule(module)) visit(exported.getName(), exported, new Set());
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function discoverPublicRenderables(root: string): PublicRenderable[] {
  return renderableExports(entryProgram(root), resolve(root, ENTRY_FILE), root);
}
