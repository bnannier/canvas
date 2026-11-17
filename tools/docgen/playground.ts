import ts from "typescript";
import type { PlaygroundSource } from "../../docs/src/core/playground-example";

/** One compile-time transform drives both the executable example and its shown source. */
export function playgroundExample(code: string, targets: readonly string[], requested: string): { expression: string; source: PlaygroundSource } | undefined {
  const prefix = "const example = (\n";
  const file = ts.createSourceFile("example.tsx", `${prefix}${code}\n);`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let target: ts.JsxElement | ts.JsxSelfClosingElement | undefined;
  const visit = (node: ts.Node): void => {
    if (target) return;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      if (targets.includes(opening.tagName.getText(file))) { target = node; return; }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  if (!target) return undefined;
  const node: ts.JsxElement | ts.JsxSelfClosingElement = target;
  const opening = ts.isJsxElement(node) ? node.openingElement : node;
  const start = node.getStart(file) - prefix.length;
  const end = node.end - prefix.length;
  const original = code.slice(start, end);
  const wrapped = `applyPlaygroundElement((${original}), input, scope.${requested})`;
  // JSX children and element-valued attributes need an expression container; a root,
  // arrow return or already-braced expression takes the call directly.
  const parent = node.parent;
  const container = ts.isJsxElement(parent) || ts.isJsxFragment(parent);
  const expression = code.slice(0, start) + (container ? `{${wrapped}}` : wrapped) + code.slice(end);
  const attributes = opening.attributes.properties.map((attribute) => {
    if (ts.isJsxSpreadAttribute(attribute)) {
      throw new Error(`Playground ${requested}: spread attributes cannot expose explicit knob omissions; write the example's props explicitly.`);
    }
    return { name: attribute.name.getText(file), source: attribute.getText(file) };
  });
  return {
    expression,
    source: {
      code, start, end, component: requested, attributes,
      ...(ts.isJsxElement(node) ? { children: code.slice(opening.end - prefix.length, node.closingElement.getStart(file) - prefix.length) } : {}),
    },
  };
}
