import ts from "typescript";
import type { InteractionEvidence } from "./registry";

// Inspect executable test declarations, so a title/tag left in a comment or a
// skipped test cannot keep stale registry evidence green.
export function declaredCases(source: string): Set<string> {
  const found = new Set<string>();
  const ast = ts.createSourceFile("cases.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
      && ts.isIdentifier(node.expression.expression) && ["describe", "test", "it"].includes(node.expression.expression.text)
      && ["skip", "todo", "fixme"].includes(node.expression.name.text)) return;
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ["test", "it"].includes(node.expression.text)) {
      const [title, options, body] = node.arguments;
      const callback = body ?? options;
      if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
        if (title && ts.isStringLiteral(title)) found.add(title.text);
        if (options && ts.isObjectLiteralExpression(options)) {
          for (const property of options.properties) {
            if (ts.isPropertyAssignment(property) && property.name.getText(ast) === "tag") {
              const tags = ts.isArrayLiteralExpression(property.initializer) ? property.initializer.elements : [property.initializer];
              for (const tag of tags) if (ts.isStringLiteral(tag)) found.add(tag.text);
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return found;
}

export function checkRegistry(catalog: string[], inventory: string[], evidence: InteractionEvidence[], read: (file: string) => string) {
  const errors: string[] = [];
  const expected = new Set(catalog);
  const registered = new Set(inventory);
  if (registered.size !== inventory.length) errors.push("Duplicate component inventory entry");
  for (const slug of expected) if (!registered.has(slug)) errors.push(`Unregistered component: ${slug}`);
  for (const slug of registered) if (!expected.has(slug)) errors.push(`Removed component still registered: ${slug}`);
  const ids = new Set<string>();
  const declarations = new Map<string, Set<string>>();
  for (const item of evidence) {
    if (ids.has(item.id)) errors.push(`Duplicate interaction ID: ${item.id}`);
    ids.add(item.id);
    if (!item.components.length) errors.push(`Interaction ${item.id} has no component`);
    for (const slug of item.components) if (!registered.has(slug)) errors.push(`Interaction ${item.id} names unknown component ${slug}`);
    if (!/^(test|e2e)\/[a-z0-9_./-]+\.tsx?$/.test(item.file) || item.file.split("/").includes("..")) {
      errors.push(`Unsafe evidence path: ${item.file}`);
      continue;
    }
    try {
      if (!declarations.has(item.file)) declarations.set(item.file, declaredCases(read(item.file)));
      if (!declarations.get(item.file)!.has(item.test)) errors.push(`Missing active test for ${item.id}: ${item.test}`);
    } catch { errors.push(`Missing evidence file: ${item.file}`); }
  }
  const rows = inventory.map((component) => ({
    component,
    registeredEvidence: evidence.filter((item) => item.components.includes(component)).map(({ id, layer, file, test }) => ({ id, layer, file, test })),
    nativeRuntime: "not-recorded",
    voiceOver: "not-recorded",
    talkBack: "not-recorded",
  }));
  return { errors, rows };
}
