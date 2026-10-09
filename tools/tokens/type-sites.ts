/**
 * Every text size the kit's source sets, traced back to where the number is written.
 *
 * A font size reaches a Text through a `fontSize` property, through a style taken whole
 * from the type scale (`...typeScale.caption`, `labelType: typeScale.eyebrowLg`), or
 * through the helpers and tables a skin builds its type from (`glyphType(WEB_GLYPH[size])`,
 * `FS(11.5, 15)`, `const [fontSize] = M3_DIGIT[size]`). The reading floors are a property
 * of the text, so the place that decides a size is where its role is declared, and that
 * is the place this module reports: the literal in the table row, the call that passes it,
 * the type-scale read. test/design-rules-type-floors.test.ts holds each one to its role.
 *
 * Read from source text with the TypeScript parser, so it runs in plain bun and sees every
 * platform's skin at once, whatever the harness aliases react-native to. The resolution is
 * a small constant folder: literals, conditionals, `??` and `||`, arithmetic and `Math`
 * rounding over resolved values, consts and destructured consts, object and array tables
 * read by a key or by any key, a helper's parameter through every call of the helper in
 * its module, and a component shell's `skin` through the skins its sibling styles module
 * exports. Anything else is reported as unresolved rather than guessed, so a size the
 * folder cannot see fails the gate instead of passing it.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { typeScale } from "../../src/style/type-scale.ts";

/** One number that reaches a text's font size, at the place it is written. */
export interface TypeValue {
  value: number;
  /** Repo-relative file of the place the number is written. */
  file: string;
  line: number;
  /** The names enclosing that place, outermost first (`iosSkin.hourLabel`, `LABEL_TYPE.small`). */
  path: string;
  /** How the number is written: a literal, a type-scale style, or a computation over other values. */
  kind: "literal" | "type scale" | "computed";
}

/** A font size the folder could not trace to a number. */
export interface UnresolvedSize {
  file: string;
  line: number;
  path: string;
  text: string;
}

interface Origin {
  value: number;
  node: ts.Node;
  sf: ts.SourceFile;
  kind: TypeValue["kind"];
}

type Table = { node: ts.ObjectLiteralExpression | ts.ArrayLiteralExpression; sf: ts.SourceFile };

const STYLES = typeScale as Record<string, { fontSize: number }>;

function unwrap(expr: ts.Expression): ts.Expression {
  let node = expr;
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    node = node.expression;
  }
  return node;
}

function nameOf(name: ts.PropertyName | ts.BindingName | undefined): string | null {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isPrivateIdentifier(name)) return name.text;
  return null;
}

/** `typeScale.<style>` with a style the scale defines, or null. */
function typeScaleStyle(expr: ts.Expression): string | null {
  const node = unwrap(expr);
  if (!ts.isPropertyAccessExpression(node)) return null;
  if (!ts.isIdentifier(node.expression) || node.expression.text !== "typeScale") return null;
  return node.name.text in STYLES ? node.name.text : null;
}

export class TypeSites {
  private readonly files = new Map<string, ts.SourceFile>();

  constructor(private readonly root: string) {}

  private load(relative: string): ts.SourceFile {
    let sf = this.files.get(relative);
    if (!sf) {
      const kind = relative.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
      sf = ts.createSourceFile(relative, readFileSync(join(this.root, relative), "utf8"), ts.ScriptTarget.Latest, true, kind);
      this.files.set(relative, sf);
    }
    return sf;
  }

  /** Every number that reaches a font size in these files, and every size that could not be traced. */
  scan(relativeFiles: string[]): { values: TypeValue[]; unresolved: UnresolvedSize[] } {
    const values = new Map<string, TypeValue>();
    const unresolved: UnresolvedSize[] = [];
    for (const relative of relativeFiles) {
      const sf = this.load(relative);
      const visit = (node: ts.Node) => {
        const sink = this.sinkOf(node, sf);
        if (sink) {
          const origins = this.values(sink, sf, new Set());
          if (origins === null) unresolved.push({ file: sf.fileName, line: lineOf(sf, node), path: pathOf(node), text: node.getText(sf) });
          else {
            for (const origin of origins) {
              // One place can yield several numbers (a computation over a table), so the
              // value is part of what makes a report distinct.
              const key = `${origin.sf.fileName}:${origin.node.getStart(origin.sf)}:${origin.value}`;
              if (!values.has(key)) {
                values.set(key, {
                  value: origin.value,
                  file: origin.sf.fileName,
                  line: lineOf(origin.sf, origin.node),
                  path: pathOf(origin.node),
                  kind: origin.kind,
                });
              }
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(sf);
    }
    return { values: [...values.values()], unresolved };
  }

  /** The expression a node sets a font size from, or null when it sets none. */
  private sinkOf(node: ts.Node, sf: ts.SourceFile): ts.Expression | null {
    if (ts.isPropertyAssignment(node) && nameOf(node.name) === "fontSize") return node.initializer;
    if (ts.isShorthandPropertyAssignment(node) && node.name.text === "fontSize") return node.name;
    // A type-scale style taken whole (spread, assigned, passed on) sets its size; a read of
    // one of its fields (`.fontSize` inside a fontSize property, `.lineHeight`) is not a
    // style of its own. The scale's own definition is the source, not a use.
    if (ts.isPropertyAccessExpression(node) && typeScaleStyle(node) && !ts.isPropertyAccessExpression(node.parent)) {
      return sf.fileName.endsWith("src/style/type-scale.ts") ? null : node;
    }
    return null;
  }

  /** The numbers an expression can evaluate to, each with the place it is written, or null. */
  private values(expr: ts.Expression, sf: ts.SourceFile, seen: Set<ts.Node>): Origin[] | null {
    const node = unwrap(expr);
    if (seen.has(node)) return null;
    const next = new Set(seen).add(node);

    if (ts.isNumericLiteral(node)) return [{ value: Number(node.text), node, sf, kind: "literal" }];
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
      const inner = this.values(node.operand, sf, next);
      return inner && inner.map((o) => ({ ...o, value: -o.value }));
    }
    const style = typeScaleStyle(node);
    if (style) return [{ value: STYLES[style].fontSize, node, sf, kind: "type scale" }];
    if (ts.isPropertyAccessExpression(node) && node.name.text === "fontSize") {
      const whole = typeScaleStyle(node.expression);
      if (whole) return [{ value: STYLES[whole].fontSize, node, sf, kind: "type scale" }];
    }
    if (ts.isConditionalExpression(node)) return union(this.values(node.whenTrue, sf, next), this.values(node.whenFalse, sf, next));
    if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) {
        return union(this.values(node.left, sf, next), this.values(node.right, sf, next));
      }
      const math: Partial<Record<ts.SyntaxKind, (a: number, b: number) => number>> = {
        [ts.SyntaxKind.PlusToken]: (a, b) => a + b,
        [ts.SyntaxKind.MinusToken]: (a, b) => a - b,
        [ts.SyntaxKind.AsteriskToken]: (a, b) => a * b,
        [ts.SyntaxKind.SlashToken]: (a, b) => a / b,
      };
      const apply = math[op];
      if (!apply) return null;
      const left = this.values(node.left, sf, next);
      const right = this.values(node.right, sf, next);
      if (!left || !right) return null;
      return left.flatMap((a) => right.map((b) => ({ value: apply(a.value, b.value), node, sf, kind: "computed" as const })));
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === "Math") {
        const MATH: Record<string, (...n: number[]) => number> = { round: Math.round, floor: Math.floor, ceil: Math.ceil, max: Math.max, min: Math.min };
        const fn = MATH[callee.name.text];
        if (!fn) return null;
        const args = node.arguments.map((a) => this.values(a, sf, next));
        if (args.some((a) => a === null)) return null;
        return product(args as Origin[][]).map((combo) => ({ value: fn(...combo.map((o) => o.value)), node, sf, kind: "computed" as const }));
      }
      return null;
    }
    if (ts.isIdentifier(node)) return this.identifierValues(node, sf, next);
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const entries = this.entries(node, sf, next);
      if (!entries) return null;
      return collect(entries.map((e) => this.values(e.expr, e.sf, next)));
    }
    return null;
  }

  /** The expressions a property or element read can yield, from the tables it reads. */
  private entries(node: ts.PropertyAccessExpression | ts.ElementAccessExpression, sf: ts.SourceFile, seen: Set<ts.Node>): { expr: ts.Expression; sf: ts.SourceFile }[] | null {
    const tables = this.tables(node.expression, sf, seen);
    if (!tables) return null;
    let key: string | null = null;
    if (ts.isPropertyAccessExpression(node)) key = node.name.text;
    else {
      const arg = unwrap(node.argumentExpression);
      if (ts.isStringLiteral(arg) || ts.isNumericLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) key = arg.text;
    }
    const out: { expr: ts.Expression; sf: ts.SourceFile }[] = [];
    for (const table of tables) {
      const found = key === null ? this.allEntries(table, seen) : this.entry(table, key, seen);
      if (!found) return null;
      out.push(...found);
    }
    return out;
  }

  /** Every value of a table, for a read by a key the folder cannot know. */
  private allEntries(table: Table, seen: Set<ts.Node>): { expr: ts.Expression; sf: ts.SourceFile }[] | null {
    if (ts.isArrayLiteralExpression(table.node)) {
      if (table.node.elements.some((e) => ts.isSpreadElement(e))) return null;
      return table.node.elements.map((expr) => ({ expr, sf: table.sf }));
    }
    const out: { expr: ts.Expression; sf: ts.SourceFile }[] = [];
    for (const prop of table.node.properties) {
      if (ts.isPropertyAssignment(prop)) out.push({ expr: prop.initializer, sf: table.sf });
      else if (ts.isShorthandPropertyAssignment(prop)) out.push({ expr: prop.name, sf: table.sf });
      else if (ts.isSpreadAssignment(prop)) {
        const inner = this.tables(prop.expression, table.sf, seen);
        if (!inner) return null;
        for (const t of inner) {
          const more = this.allEntries(t, seen);
          if (!more) return null;
          out.push(...more);
        }
      } else return null;
    }
    return out;
  }

  /** The value of one key of a table (the last definition wins, a spread included), or null. */
  private entry(table: Table, key: string, seen: Set<ts.Node>): { expr: ts.Expression; sf: ts.SourceFile }[] | null {
    if (ts.isArrayLiteralExpression(table.node)) {
      const index = Number(key);
      const element = table.node.elements[index];
      return element && !ts.isSpreadElement(element) ? [{ expr: element, sf: table.sf }] : null;
    }
    const props = [...table.node.properties].reverse();
    for (const prop of props) {
      if (ts.isPropertyAssignment(prop) && nameOf(prop.name) === key) return [{ expr: prop.initializer, sf: table.sf }];
      if (ts.isShorthandPropertyAssignment(prop) && prop.name.text === key) return [{ expr: prop.name, sf: table.sf }];
      if ((ts.isMethodDeclaration(prop) || ts.isGetAccessorDeclaration(prop)) && nameOf(prop.name) === key) return null;
      if (ts.isSpreadAssignment(prop)) {
        const inner = this.tables(prop.expression, table.sf, seen);
        if (!inner) return null;
        const found = inner.map((t) => this.entry(t, key, seen));
        if (found.every((f) => f !== null && f.length > 0)) return found.flat() as { expr: ts.Expression; sf: ts.SourceFile }[];
        if (found.some((f) => f === null)) return null;
      }
    }
    return [];
  }

  /** The object or array literals an expression can be, or null. */
  private tables(expr: ts.Expression, sf: ts.SourceFile, seen: Set<ts.Node>): Table[] | null {
    const node = unwrap(expr);
    if (seen.has(node)) return null;
    const next = new Set(seen).add(node);
    if (ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node)) return [{ node, sf }];
    if (ts.isConditionalExpression(node)) return unionTables(this.tables(node.whenTrue, sf, next), this.tables(node.whenFalse, sf, next));
    if (ts.isIdentifier(node)) {
      const decl = this.declaration(node, sf);
      if (!decl) return null;
      if (ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name)) return decl.initializer ? this.tables(decl.initializer, sf, next) : null;
      if (ts.isParameter(decl)) {
        // A shell's `skin` is whichever skin its platform entry hands it: every skin its
        // sibling styles module exports.
        if (node.text === "skin" && /\.shared\.tsx?$/.test(sf.fileName)) return this.siblingSkins(sf);
        const args = this.arguments(decl, sf);
        if (!args) return null;
        const out: Table[] = [];
        for (const arg of args) {
          const tables = this.tables(arg.expr, arg.sf, next);
          if (!tables) return null;
          out.push(...tables);
        }
        return out;
      }
      return null;
    }
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const entries = this.entries(node, sf, next);
      if (!entries) return null;
      const out: Table[] = [];
      for (const entry of entries) {
        const tables = this.tables(entry.expr, entry.sf, next);
        if (!tables) return null;
        out.push(...tables);
      }
      return out;
    }
    return null;
  }

  /** The skins a shell's sibling `<name>.styles.ts(x)` exports, aliases followed. */
  private siblingSkins(sf: ts.SourceFile): Table[] | null {
    const stem = sf.fileName.replace(/\.shared\.tsx?$/, ".styles");
    const relative = [`${stem}.ts`, `${stem}.tsx`].find((f) => existsSync(join(this.root, f)));
    if (!relative) return null;
    const styles = this.load(relative);
    const out: Table[] = [];
    for (const statement of styles.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      if (!(ts.getModifiers(statement) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !/Skin$/.test(decl.name.text) || !decl.initializer) continue;
        const tables = this.tables(decl.initializer, styles, new Set());
        if (!tables) return null;
        out.push(...tables);
      }
    }
    return out.length > 0 ? out : null;
  }

  private identifierValues(node: ts.Identifier, sf: ts.SourceFile, seen: Set<ts.Node>): Origin[] | null {
    const decl = this.declaration(node, sf);
    if (!decl) return null;
    if (ts.isVariableDeclaration(decl)) return decl.initializer ? this.values(decl.initializer, sf, seen) : null;
    if (ts.isBindingElement(decl)) return this.bindingValues(decl, sf, seen);
    if (ts.isParameter(decl)) {
      const args = this.arguments(decl, sf);
      if (!args) return null;
      return collect(args.map((arg) => this.values(arg.expr, arg.sf, seen)));
    }
    return null;
  }

  /** A destructured const: the matching element or property of the tables it is read from. */
  private bindingValues(element: ts.BindingElement, sf: ts.SourceFile, seen: Set<ts.Node>): Origin[] | null {
    const pattern = element.parent;
    const holder = pattern.parent;
    if (!ts.isVariableDeclaration(holder) || !holder.initializer) return null;
    const tables = this.tables(holder.initializer, sf, seen);
    if (!tables) return null;
    const key = ts.isArrayBindingPattern(pattern)
      ? String(pattern.elements.indexOf(element))
      : nameOf(element.propertyName ?? element.name);
    if (key === null) return null;
    const results: (Origin[] | null)[] = [];
    for (const table of tables) {
      const entries = this.entry(table, key, seen);
      if (!entries || entries.length === 0) return null;
      for (const e of entries) results.push(this.values(e.expr, e.sf, seen));
    }
    return collect(results);
  }

  /** What a parameter receives: its argument at every call of its function in the module. */
  private arguments(param: ts.ParameterDeclaration, sf: ts.SourceFile): { expr: ts.Expression; sf: ts.SourceFile }[] | null {
    const fn = param.parent;
    const index = fn.parameters.indexOf(param);
    let name: string | null = null;
    if (ts.isFunctionDeclaration(fn) && fn.name) name = fn.name.text;
    else if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name)) {
      name = fn.parent.name.text;
    }
    if (!name) return null;
    const out: { expr: ts.Expression; sf: ts.SourceFile }[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === name) {
        const arg = node.arguments[index];
        if (arg) out.push({ expr: arg, sf });
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    return out.length > 0 ? out : null;
  }

  /** The declaration an identifier names, by lexical scope, or null. */
  private declaration(id: ts.Identifier, sf: ts.SourceFile): ts.VariableDeclaration | ts.BindingElement | ts.ParameterDeclaration | null {
    const name = id.text;
    for (let scope: ts.Node | undefined = id.parent; scope; scope = scope.parent) {
      if (ts.isFunctionLike(scope)) {
        for (const param of scope.parameters) {
          const found = bindingNamed(param.name, name);
          if (found === true) return param;
          if (found) return found;
        }
      }
      const statements = ts.isSourceFile(scope) || ts.isBlock(scope) || ts.isModuleBlock(scope) ? scope.statements : ts.isCaseClause(scope) || ts.isDefaultClause(scope) ? scope.statements : null;
      if (!statements) continue;
      for (const statement of statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const decl of statement.declarationList.declarations) {
          const found = bindingNamed(decl.name, name);
          if (found === true) return decl;
          if (found) return found;
        }
      }
    }
    void sf;
    return null;
  }
}

/** Whether a binding name declares `name`: true for the name itself, the element for a destructured one. */
function bindingNamed(binding: ts.BindingName, name: string): true | ts.BindingElement | null {
  if (ts.isIdentifier(binding)) return binding.text === name ? true : null;
  for (const element of binding.elements) {
    if (ts.isOmittedExpression(element)) continue;
    if (ts.isIdentifier(element.name)) {
      if (element.name.text === name) return element;
    } else {
      const inner = bindingNamed(element.name, name);
      if (inner) return inner === true ? element : inner;
    }
  }
  return null;
}

function union(a: Origin[] | null, b: Origin[] | null): Origin[] | null {
  return a && b ? [...a, ...b] : null;
}

function unionTables(a: Table[] | null, b: Table[] | null): Table[] | null {
  return a && b ? [...a, ...b] : null;
}

function collect(parts: (Origin[] | null)[]): Origin[] | null {
  if (parts.length === 0 || parts.some((p) => p === null)) return null;
  return (parts as Origin[][]).flat();
}

function product<T>(lists: T[][]): T[][] {
  return lists.reduce<T[][]>((acc, list) => acc.flatMap((combo) => list.map((item) => [...combo, item])), [[]]);
}

function lineOf(sf: ts.SourceFile, node: ts.Node): number {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

/**
 * The names enclosing a node, outermost first: declarations, functions, methods and object
 * keys. The `fontSize` key itself is left off, since the path names the text, not the
 * property (`iosSkin.hourLabel`, not `iosSkin.hourLabel.fontSize`).
 */
export function pathOf(node: ts.Node): string {
  const names: string[] = [];
  for (let at: ts.Node | undefined = node.parent; at; at = at.parent) {
    let name: string | null = null;
    if (ts.isVariableDeclaration(at) && ts.isIdentifier(at.name)) name = at.name.text;
    else if (ts.isFunctionDeclaration(at) && at.name) name = at.name.text;
    else if (ts.isPropertyAssignment(at) || ts.isMethodDeclaration(at)) name = nameOf(at.name);
    if (name) names.unshift(name);
  }
  if (names[names.length - 1] === "fontSize") names.pop();
  return names.join(".");
}
