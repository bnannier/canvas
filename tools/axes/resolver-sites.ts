// Hand-rolled axis resolvers, found in source. Before the axis tables (src/style/axis.ts)
// every component resolved its semantic booleans with code of its own: a first-match
// chain of `if (p.small) return "small";` statements, or a ternary chain
// (`p.short ? "60%" : p.long ? "80%" : "100%"`). This module finds both shapes, so the
// characterization (test/axes.test.ts) can prove it covers every one of them, and the
// design rule in test/design-rules-source.test.ts can keep a component that moved to
// tables from growing one back.
//
// An if-chain is a function with at least one direct statement `if (x.a) return <value>;`
// (or `if (x.a || x.b) ...`) where `x` is one of its parameters and the value renders no
// JSX: a guard that returns nothing (`if (disabled.current) return;`) and a render branch
// that returns an element are not resolvers. A ternary chain is a conditional whose test
// reads a property of an identifier and whose else-branch is another such conditional on
// the same identifier, with no JSX in any branch: two links at least, reported once at
// its outermost conditional.

import ts from "typescript";

/** One hand-rolled resolver in a source file. */
export interface ResolverSite {
  /** The file, as the caller named it (repo-relative in the tests). */
  file: string;
  /** The 1-based line the function or the ternary chain starts on. */
  line: number;
  /**
   * The name the code is bound to: the function's own name, the variable or property
   * an anonymous function is assigned to, or for a ternary chain its enclosing
   * function's name; `<anonymous>` when there is none.
   */
  name: string;
  /** Which shape the resolver has. */
  form: "if-chain" | "ternary";
  /** The props it tests, in the order it tests them. */
  members: string[];
}

/** `file#name`, the key a resolver site is listed under. */
export const siteKey = (site: Pick<ResolverSite, "file" | "name">): string => `${site.file}#${site.name}`;

const unwrap = (node: ts.Expression): ts.Expression => (ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node);

// The props a condition tests on `object` when it is `object.a` or `object.a || object.b`
// (any depth of `||`), else null.
function propTests(condition: ts.Expression, isObject: (name: string) => boolean): string[] | null {
  const node = unwrap(condition);
  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && isObject(node.expression.text)) return [node.name.text];
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
    const left = propTests(node.left, isObject);
    const right = propTests(node.right, isObject);
    return left && right ? [...left, ...right] : null;
  }
  return null;
}

// Whether an expression renders anything: JSX anywhere inside it (an element, or a
// call handed one) makes it a render branch rather than a resolved value.
const rendersJsx = (node: ts.Node): boolean =>
  ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node) || (ts.forEachChild(node, rendersJsx) ?? false);

// The value an `if` returns when its branch is `return <value>;` or `{ return <value>; }`.
function returnedValue(statement: ts.Statement): ts.Expression | null {
  if (ts.isReturnStatement(statement)) return statement.expression ?? null;
  if (ts.isBlock(statement) && statement.statements.length === 1) return returnedValue(statement.statements[0]!);
  return null;
}

function nameOf(fn: ts.Node): string {
  if ((ts.isFunctionDeclaration(fn) || ts.isFunctionExpression(fn) || ts.isMethodDeclaration(fn)) && fn.name) return fn.name.getText();
  const parent = fn.parent;
  if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) return parent.name.text;
  if (parent && (ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent))) return parent.name.getText();
  return "<anonymous>";
}

function enclosingFunction(node: ts.Node): ts.SignatureDeclaration | null {
  for (let up = node.parent; up; up = up.parent) if (ts.isFunctionLike(up)) return up;
  return null;
}

/** Every hand-rolled resolver in `text`, in source order. */
export function resolverSites(file: string, text: string): ResolverSite[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const sites: ResolverSite[] = [];
  const lineOf = (node: ts.Node) => source.getLineAndCharacterOfPosition(node.getStart()).line + 1;

  const visit = (node: ts.Node) => {
    if (ts.isFunctionLike(node)) {
      const body = (node as ts.FunctionLikeDeclaration).body;
      const parameters = new Set(node.parameters.flatMap((parameter) => (ts.isIdentifier(parameter.name) ? [parameter.name.text] : [])));
      if (body && ts.isBlock(body) && parameters.size > 0) {
        const members: string[] = [];
        for (const statement of body.statements) {
          if (!ts.isIfStatement(statement) || statement.elseStatement) continue;
          const tested = propTests(statement.expression, (name) => parameters.has(name));
          const value = returnedValue(statement.thenStatement);
          if (tested && value && !rendersJsx(value)) members.push(...tested);
        }
        if (members.length > 0) sites.push({ file, line: lineOf(node), name: nameOf(node), form: "if-chain", members });
      }
    }
    if (ts.isConditionalExpression(node) && !isChainLink(node) && !rendersJsx(node)) {
      const members = ternaryMembers(node);
      if (members) {
        const fn = enclosingFunction(node);
        sites.push({ file, line: lineOf(node), name: fn ? nameOf(fn) : "<anonymous>", form: "ternary", members });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return sites;
}

// The identifier every property read in `condition` is taken from (`p` for `p.a` and
// for `p.a || p.b`), or null when the condition is anything else.
function objectOf(condition: ts.Expression): string | null {
  const node = unwrap(condition);
  if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) return node.expression.text;
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
    const left = objectOf(node.left);
    return left !== null && left === objectOf(node.right) ? left : null;
  }
  return null;
}

// The props a ternary chain tests, outermost first, following the else-branches while
// each link tests a property of the same identifier; null unless at least two links do
// (a single `p.a || p.b ? x : y` asks whether any is set, it picks nothing).
function ternaryMembers(node: ts.ConditionalExpression): string[] | null {
  const object = objectOf(node.condition);
  if (object === null) return null;
  const members: string[] = [];
  let links = 0;
  let link: ts.Expression = node;
  while (ts.isConditionalExpression(link)) {
    const tested = propTests(link.condition, (name) => name === object);
    if (!tested) break;
    members.push(...tested);
    links++;
    link = unwrap(link.whenFalse);
  }
  return links >= 2 ? members : null;
}

// Whether a conditional is the else-branch of a chain link on the same identifier, so
// the chain is reported once, at its head.
function isChainLink(node: ts.ConditionalExpression): boolean {
  let parent: ts.Node = node.parent;
  while (ts.isParenthesizedExpression(parent)) parent = parent.parent;
  if (!ts.isConditionalExpression(parent) || unwrap(parent.whenFalse) !== node) return false;
  const object = objectOf(parent.condition);
  return object !== null && object === objectOf(node.condition);
}
