import ts from "typescript";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { DOCS_USAGE_EXCEPTIONS } from "./component-usage-exceptions.ts";
export { DOCS_USAGE_EXCEPTIONS } from "./component-usage-exceptions.ts";

export type DocsUsageFinding = {
  file: string;
  line: number;
  owner: string;
  tag: string;
  attribute: string;
  keys: string[];
  expression: string;
};

/** Infrastructure exceptions are reviewed here, never opted into by source comments.
 * Each allowance names one component, host tag, attribute and exact style-key set;
 * a new property or substitute control in that component still fails the check. */
export type DocsUsageException = {
  file: string;
  owner: string;
  tag: string;
  attribute: string;
  keys: readonly string[];
  /** Required to approve an opaque framework value, so another unknown value
   * cannot silently reuse that allowance. */
  expression?: string;
  occurrences: number;
  reason: string;
};

const STYLE_ATTRIBUTES = new Set(["style", "contentContainerStyle"]);
const UNRESOLVED = "<unresolved style>";
const RN_PRIMITIVES = new Set(["View", "Text", "Pressable", "TextInput", "ScrollView"]);
const JSX_FRAMEWORK_MODULES = new Set(["react", "react-native", "react-native-svg", "react-native-safe-area-context", "expo-status-bar"]);

function propertyName(node: ts.PropertyName | ts.JsxAttributeName): string | undefined {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  if (ts.isComputedPropertyName(node) && ts.isStringLiteral(node.expression)) return node.expression.text;
  return undefined;
}

function ownerOf(node: ts.Node): string {
  for (let current: ts.Node | undefined = node; current; current = current.parent) {
    if ((ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current)) && current.name) return current.name.getText();
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) return current.name.text;
  }
  return "<module>";
}

/** Parse real TypeScript/TSX, including aliased imports, style variables, StyleSheet.create,
 * arrays, callbacks and spreads. Unknown style expressions fail closed. This is
 * deliberately about rendered call sites, not whether a file imports Canvas. */
export function inspectDocsSource(file: string, source: string): DocsUsageFinding[] {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const declarations = new Map<string, ts.Expression[]>();
  const functions = new Map<string, ts.FunctionDeclaration>();
  const assignments: { target: ts.Expression; name: string | undefined; value: ts.Expression }[] = [];
  const imports = new Map<string, { imported: string; module: string }>();
  const collect = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      declarations.set(node.name.text, [...(declarations.get(node.name.text) ?? []), node.initializer]);
    }
    if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node);
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const left = node.left;
      if (ts.isPropertyAccessExpression(left)) assignments.push({ target: left.expression, name: left.name.text, value: node.right });
      if (ts.isElementAccessExpression(left)) assignments.push({ target: left.expression, name: ts.isStringLiteral(left.argumentExpression) ? left.argumentExpression.text : undefined, value: node.right });
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const module = node.moduleSpecifier.text;
      if (node.importClause?.name) imports.set(node.importClause.name.text, { imported: "default", module });
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const name of bindings.elements) imports.set(name.name.text, { imported: name.propertyName?.text ?? name.name.text, module });
      }
      if (bindings && ts.isNamespaceImport(bindings)) imports.set(bindings.name.text, { imported: "*", module });
    }
    ts.forEachChild(node, collect);
  };
  collect(tree);

  const unwrap = (node: ts.Expression): ts.Expression => {
    while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node)) node = node.expression;
    return node;
  };
  const resolveExpression = (raw: ts.Expression, seen = new Set<ts.Node>()): ts.Expression[] => {
    const node = unwrap(raw);
    if (seen.has(node)) return [];
    const next = new Set(seen).add(node);
    if (ts.isConditionalExpression(node)) return [...resolveExpression(node.whenTrue, next), ...resolveExpression(node.whenFalse, next)];
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) return resolveExpression(node.right, next);
    if (ts.isIdentifier(node)) return (declarations.get(node.text) ?? []).flatMap(value => resolveExpression(value, next));
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "create" && node.arguments[0]) return resolveExpression(node.arguments[0], next);
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const declaration = functions.get(node.expression.text);
      const candidates = declaration ? [declaration] : resolveExpression(node.expression, next);
      return candidates.flatMap(candidate => {
        if (!ts.isFunctionDeclaration(candidate) && !ts.isArrowFunction(candidate) && !ts.isFunctionExpression(candidate)) return [];
        if (!candidate.body) return [];
        if (!ts.isBlock(candidate.body)) return resolveExpression(candidate.body, next);
        const results: ts.Expression[] = [];
        const returns = (child: ts.Node) => {
          if (ts.isReturnStatement(child) && child.expression) results.push(...resolveExpression(child.expression, next));
          else if (!ts.isFunctionLike(child)) ts.forEachChild(child, returns);
        };
        returns(candidate.body);
        return results;
      });
    }
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const key = ts.isPropertyAccessExpression(node) ? node.name.text : node.argumentExpression && ts.isStringLiteral(node.argumentExpression) ? node.argumentExpression.text : undefined;
      if (!key) return [];
      return resolveExpression(node.expression, next).flatMap(base => ts.isObjectLiteralExpression(base)
        ? base.properties.flatMap(p => ts.isPropertyAssignment(p) && propertyName(p.name) === key ? resolveExpression(p.initializer, next) : [])
        : []);
    }
    return [node];
  };
  const assignmentsTo = (node: ts.Expression) => assignments.filter(assignment => resolveExpression(assignment.target).includes(node));
  const styleKeys = (raw: ts.Expression, seen = new Set<ts.Node>()): string[] => {
    const node = unwrap(raw);
    if (seen.has(node)) return [UNRESOLVED];
    const next = new Set(seen).add(node);
    if (ts.isObjectLiteralExpression(node)) return [...node.properties.flatMap(p => {
      if (ts.isSpreadAssignment(p)) return styleKeys(p.expression, next);
      return p.name ? [propertyName(p.name) ?? "<computed style key>"] : [UNRESOLVED];
    }), ...assignmentsTo(node).map(assignment => assignment.name ?? "<computed style key>")];
    if (ts.isArrayLiteralExpression(node)) return node.elements.flatMap(e => ts.isSpreadElement(e) ? styleKeys(e.expression, next) : styleKeys(e, next));
    if (ts.isConditionalExpression(node)) return [...styleKeys(node.whenTrue, next), ...styleKeys(node.whenFalse, next)];
    if (ts.isBinaryExpression(node) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) return styleKeys(node.right, next);
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      if (!ts.isBlock(node.body)) return styleKeys(node.body, next);
      const returns: string[] = [];
      const visit = (child: ts.Node) => {
        if (ts.isReturnStatement(child) && child.expression) returns.push(...styleKeys(child.expression, next));
        else ts.forEachChild(child, visit);
      };
      visit(node.body);
      return returns.length ? returns : [UNRESOLVED];
    }
    if ([ts.SyntaxKind.NullKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.TrueKeyword].includes(node.kind) || ts.isIdentifier(node) && node.text === "undefined") return [];
    if (ts.isStringLiteral(node)) return [`<string:${node.text}>`];
    const resolved = resolveExpression(node);
    if (resolved.length === 1 && resolved[0] === node || !resolved.length) return [UNRESOLVED];
    return resolved.flatMap(value => styleKeys(value, next));
  };
  const findings: DocsUsageFinding[] = [];
  const add = (node: ts.Node, tag: string, attribute: string, keys: string[]) => {
    const expression = ts.isJsxSpreadAttribute(node) ? node.expression.getText(tree) : ts.isJsxAttribute(node) ? node.initializer?.getText(tree) ?? "" : node.getText(tree);
    if (keys.length) findings.push({ file, line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, owner: ownerOf(node), tag, attribute, keys: [...new Set(keys)].sort(), expression });
  };
  const inspectProps = (node: ts.Node, tag: string, raw: ts.Expression, seen = new Set<ts.Node>()) => {
    if (seen.has(raw)) { add(node, tag, "spread", ["<unresolved props>"]); return; }
    const next = new Set(seen).add(raw);
    const resolved = resolveExpression(raw);
    if (!resolved.length) add(node, tag, "spread", ["<unresolved props>"]);
    for (const expression of resolved) {
      if (expression.kind === ts.SyntaxKind.NullKeyword || expression.kind === ts.SyntaxKind.FalseKeyword) continue;
      if (!ts.isObjectLiteralExpression(expression)) { add(node, tag, "spread", ["<unresolved props>"]); continue; }
      for (const property of expression.properties) {
        if (ts.isSpreadAssignment(property)) inspectProps(node, tag, property.expression, next);
        else if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
          const name = propertyName(property.name);
          const value = ts.isPropertyAssignment(property) ? property.initializer : property.name;
          if (name && STYLE_ATTRIBUTES.has(name)) add(node, tag, name, styleKeys(value));
          if (name === "className") add(node, tag, name, ["className"]);
          // Dynamic booleans are the semantic prop grammar (e.g. {[role]: true});
          // a computed object-valued prop could hide a style attribute.
          if (!name && ![ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(value.kind)) add(node, tag, "spread", ["<computed prop>"]);
        } else if (property.name && STYLE_ATTRIBUTES.has(propertyName(property.name) ?? "")) {
          // Accessors/methods are opaque values; they cannot hide a style prop.
          add(node, tag, propertyName(property.name)!, [UNRESOLVED]);
        }
      }
      for (const assignment of assignmentsTo(expression)) {
        if (assignment.name && STYLE_ATTRIBUTES.has(assignment.name)) add(node, tag, assignment.name, styleKeys(assignment.value));
        if (assignment.name === "className") add(node, tag, "className", ["className"]);
        if (!assignment.name) add(node, tag, "spread", ["<computed prop>"]);
      }
    }
  };
  const inspectTag = (node: ts.Node, tag: string, intrinsic: boolean) => {
    const tagParts = tag.split(".");
    const imported = imports.get(tagParts[0]);
    const importedName = imported?.imported;
    const canonical = importedName === "*" || importedName === "default" ? tagParts.slice(1).join(".") || importedName : importedName ?? tag;
    if (intrinsic) add(node, tag, "html", [tag]);
    if (imported?.module === "react-native" && !RN_PRIMITIVES.has(canonical)) add(node, canonical, "native-control", [canonical]);
    if (imported && !imported.module.startsWith(".") && imported.module !== "@nannier/canvas" && !JSX_FRAMEWORK_MODULES.has(imported.module) && imported.module !== "expo-router" && !imported.module.startsWith("expo-router/")) {
      add(node, tag, "foreign-component", [`${imported.module}#${canonical}`]);
    }
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(tree);
      inspectTag(node, tag, /^[a-z]/.test(tag));
      for (const attribute of node.attributes.properties) {
        if (ts.isJsxAttribute(attribute)) {
          const name = propertyName(attribute.name);
          if (name === "className") add(attribute, tag, name, ["className"]);
          if (name && STYLE_ATTRIBUTES.has(name) && attribute.initializer) {
            const expression = ts.isJsxExpression(attribute.initializer) ? attribute.initializer.expression : undefined;
            add(attribute, tag, name, expression ? styleKeys(expression) : [UNRESOLVED]);
          }
        } else {
          inspectProps(attribute, tag, attribute.expression);
        }
      }
    }
    if (ts.isCallExpression(node)) {
      const callName = node.expression.getText(tree);
      const imported = ts.isIdentifier(node.expression) ? imports.get(node.expression.text) : undefined;
      const member = ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.expression) ? imports.get(node.expression.expression.text) : undefined;
      const namedFactory = imported?.module === "react" && imported.imported === "createElement";
      const memberFactory = member?.module === "react" && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "createElement";
      if (callName === "React.createElement" || memberFactory || namedFactory) {
        const [tag, props] = node.arguments;
        if (tag) {
          const name = ts.isStringLiteral(tag) ? tag.text : tag.getText(tree);
          inspectTag(node, name, ts.isStringLiteral(tag) && /^[a-z]/.test(name));
          if (props) inspectProps(node, name, props);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return findings;
}

export function allowedDocsUsage(finding: DocsUsageFinding, exceptions: readonly DocsUsageException[] = DOCS_USAGE_EXCEPTIONS): boolean {
  return exceptions.some(exception => exception.file === finding.file && exception.owner === finding.owner && exception.tag === finding.tag && exception.attribute === finding.attribute && finding.keys.every(key => exception.keys.includes(key)) && (exception.expression === undefined || exception.expression === finding.expression));
}

/** Pin the reviewed infrastructure footprint too: neither a new hand-styled node
 * in an exempt function nor a stale allowance should disappear into a wildcard. */
export function exceptionFootprintErrors(findings: readonly DocsUsageFinding[], exceptions: readonly DocsUsageException[] = DOCS_USAGE_EXCEPTIONS): string[] {
  return exceptions.flatMap(exception => {
    const matches = findings.filter(finding => allowedDocsUsage(finding, [exception]));
    const unused = exception.keys.filter(key => !matches.some(finding => finding.keys.includes(key)));
    const label = `${exception.file} ${exception.owner} <${exception.tag}> ${exception.attribute}`;
    return [
      ...(matches.length === exception.occurrences ? [] : [`${label}: expected ${exception.occurrences} reviewed occurrences, found ${matches.length}`]),
      ...(unused.length ? [`${label}: stale allowed keys ${unused.join(", ")}`] : []),
      ...(exception.reason.trim().length ? [] : [`${label}: missing rationale`]),
      ...(exception.keys.some(key => key.startsWith("<unresolved")) && !exception.expression ? [`${label}: opaque framework values require their exact expression`] : []),
    ];
  });
}

export function inspectDocsTree(root: string): DocsUsageFinding[] {
  const sources = [resolve(root, "docs/src"), resolve(root, "tools/privacygen")];
  const files = sources.filter(existsSync).flatMap(source => readdirSync(source, { recursive: true }).map(String).filter(file => /\.tsx?$/.test(file) && !file.endsWith(".d.ts")).map(file => resolve(source, file))).sort();
  return files.flatMap(absolute => {
    const text = readFileSync(absolute, "utf8");
    const file = relative(root, absolute);
    // Only docgen-owned files qualify; moving handwritten code here does not skip it.
    if (file.startsWith("docs/src/core/examples/") && text.startsWith("/* @generated by tools/docgen. DO NOT EDIT.")) return [];
    return inspectDocsSource(file, text);
  });
}

export const formatDocsUsage = (finding: DocsUsageFinding) => `${finding.file}:${finding.line} ${finding.owner} <${finding.tag}> ${finding.attribute}: ${finding.keys.join(", ")}`;
