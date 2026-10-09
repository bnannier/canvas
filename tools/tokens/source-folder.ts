/**
 * The constant folder behind the static style gates: every number that reaches a style
 * property, traced back to the place it is written.
 *
 * A number reaches a style through the property itself, or through the helpers and tables
 * a skin builds its style from (`glyphType(WEB_GLYPH[size])`, `FS(11.5, 15)`,
 * `const [fontSize] = M3_DIGIT[size]`, a shell's `skin.cardRadius`, a chart helper handed
 * its corner by every chart that calls it). A rule about the number is a decision made
 * where the number is written, so that is the place the folder reports: the literal in the
 * table row, the call that passes it, the read of a scale. A gate names the property it
 * traces (a subclass's `sinkOf`) and the scales it reads by name (`scaleOf`):
 * tools/tokens/type-sites.ts traces font sizes and the type scale,
 * tools/tokens/corner-sites.ts traces corner radii and the shape table.
 *
 * Read from source text with the TypeScript parser, so it runs in plain bun and sees every
 * platform's skin at once, whatever the harness aliases react-native to. The resolution is
 * a small constant folder: literals, conditionals, `??` and `||`, arithmetic and `Math`
 * rounding over resolved values, consts and destructured consts, object and array tables
 * read by a key or by any key, a function's return values at a call, a parameter through
 * every call of its function among the scanned files (a component's destructured prop
 * through its default and every JSX use), a component shell's `skin` through the skins its
 * sibling styles module exports, and names imported from another module of the scan. Anything
 * else is reported as unresolved rather than guessed, so a number the folder cannot see
 * fails its gate instead of passing it.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import ts from "typescript";

/** One number that reaches the traced property, at the place it is written. */
export interface Origin {
  value: number;
  node: ts.Node;
  sf: ts.SourceFile;
  /** "literal", "computed", or the kind a gate's `scaleOf` names. */
  kind: string;
  /** The scale read that supplies the number (`typeScale.caption`, `shape.ios.card`), for a scale kind. */
  read?: string;
  /** For a computation, the numbers it was computed from. */
  operands?: Origin[];
  /**
   * An upper bound rather than the value: what a `Math.min` with an argument the folder
   * cannot see is at most (see `partialMath`). No arithmetic is done on a bound, so a
   * computation over one is unresolved.
   */
  bound?: true;
}

/** A place that sets the traced property: the node that sets it, in its file. */
export interface Sink {
  node: ts.Node;
  sf: ts.SourceFile;
}

/** A use of the traced property the folder could not trace to a number. */
export interface Unresolved {
  file: string;
  line: number;
  /** The names enclosing the use, outermost first. */
  path: string;
  text: string;
}

type Table = { node: ts.ObjectLiteralExpression | ts.ArrayLiteralExpression; sf: ts.SourceFile };

/** A module-level const or function, in its module. */
export type TopDeclaration = { node: ts.VariableDeclaration | ts.FunctionDeclaration; sf: ts.SourceFile };
type Expr = { expr: ts.Expression; sf: ts.SourceFile };
type FunctionNode = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;

/** What a name refers to, in the module that declares it. */
export type Decl =
  | { kind: "var"; node: ts.VariableDeclaration; sf: ts.SourceFile }
  | { kind: "binding"; node: ts.BindingElement; sf: ts.SourceFile }
  | { kind: "param"; node: ts.ParameterDeclaration; sf: ts.SourceFile }
  | { kind: "function"; node: ts.FunctionDeclaration; sf: ts.SourceFile }
  | { kind: "module"; sf: ts.SourceFile };

/** A place a function is called: a call's arguments, or a JSX element's attributes. */
type CallSite = { sf: ts.SourceFile; args: ts.NodeArray<ts.Expression> } | { sf: ts.SourceFile; attributes: ts.JsxAttributes };

export function unwrap(expr: ts.Expression): ts.Expression {
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

export function nameOf(name: ts.PropertyName | ts.BindingName | ts.JsxAttributeName | undefined): string | null {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isPrivateIdentifier(name)) return name.text;
  return null;
}

const isExported = (node: ts.Node): boolean =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

export abstract class SourceFolder {
  private readonly files = new Map<string, ts.SourceFile>();
  /** The files of the current scan, where a function's callers are looked for. */
  private scope: string[] = [];
  private callIndex: Map<ts.Node, CallSite[]> | null = null;
  /** The identifiers of the scan that can name a declaration, by their text (see `referencesTo`). */
  private nameIndex: Map<string, { id: ts.Identifier; sf: ts.SourceFile }[]> | null = null;
  /** For an exported name, the local names other modules import it under (`import { a as b }`). */
  private aliasIndex: Map<string, Set<string>> | null = null;

  constructor(protected readonly root: string) {}

  /** The expression a node sets the traced property from, or null when it sets none. */
  protected abstract sinkOf(node: ts.Node, sf: ts.SourceFile): ts.Expression | null;

  /**
   * The numbers a read of a named scale yields (`typeScale.caption`, `shape.ios.card`), or
   * null when the node is not such a read.
   */
  protected abstract scaleOf(node: ts.Expression, sf: ts.SourceFile): Origin[] | null;

  /** The property names a path leaves off its end: the path names the thing styled, not the property. */
  protected abstract isSinkName(name: string): boolean;

  protected load(relative: string): ts.SourceFile {
    let sf = this.files.get(relative);
    if (!sf) {
      const kind = relative.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
      sf = ts.createSourceFile(relative, readFileSync(join(this.root, relative), "utf8"), ts.ScriptTarget.Latest, true, kind);
      this.files.set(relative, sf);
    }
    return sf;
  }

  /**
   * Every number that reaches the traced property in these files, the places each one sets
   * the property (`sinks`), and every use that could not be traced.
   */
  protected trace(relativeFiles: string[]): { origins: Origin[]; sinks: Map<Origin, Sink[]>; unresolved: Unresolved[] } {
    this.scope = relativeFiles;
    this.callIndex = null;
    this.nameIndex = null;
    this.aliasIndex = null;
    const origins = new Map<string, Origin>();
    const sinks = new Map<Origin, Sink[]>();
    const unresolved: Unresolved[] = [];
    for (const relative of relativeFiles) {
      const sf = this.load(relative);
      const visit = (node: ts.Node) => {
        const sink = this.sinkOf(node, sf);
        if (sink) {
          const found = this.values(sink, sf, new Set());
          if (found === null) unresolved.push({ file: sf.fileName, line: lineOf(sf, node), path: this.pathOf(node), text: node.getText(sf) });
          else {
            for (const origin of found) {
              const key = originKey(origin);
              if (!origins.has(key)) {
                origins.set(key, origin);
                sinks.set(origin, []);
              }
              sinks.get(origins.get(key)!)!.push({ node, sf });
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(sf);
    }
    return { origins: [...origins.values()], sinks, unresolved };
  }

  /** The numbers an expression can evaluate to, each with the place it is written, or null. */
  protected values(expr: ts.Expression, sf: ts.SourceFile, seen: Set<ts.Node>): Origin[] | null {
    const node = unwrap(expr);
    if (seen.has(node)) return null;
    const next = new Set(seen).add(node);

    if (ts.isNumericLiteral(node)) return [{ value: Number(node.text), node, sf, kind: "literal" }];
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
      const inner = this.values(node.operand, sf, next);
      return inner && inner.map((o) => ({ ...o, value: -o.value }));
    }
    const scale = this.scaleOf(node, sf);
    if (scale) return scale;
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
      const left = exact(this.values(node.left, sf, next));
      const right = exact(this.values(node.right, sf, next));
      if (!left || !right) return null;
      return left.flatMap((a) => right.map((b) => ({ value: apply(a.value, b.value), node, sf, kind: "computed", operands: [a, b] })));
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === "Math") {
        const MATH: Record<string, (...n: number[]) => number> = { round: Math.round, floor: Math.floor, ceil: Math.ceil, max: Math.max, min: Math.min };
        const fn = MATH[callee.name.text];
        if (!fn) return null;
        const args = node.arguments.map((a) => exact(this.values(a, sf, next)));
        if (args.some((a) => a === null)) return this.partialMath(callee.name.text, node, sf, args);
        return product(args as Origin[][]).map((combo) => ({ value: fn(...combo.map((o) => o.value)), node, sf, kind: "computed", operands: combo }));
      }
      const fn = this.calleeFunction(callee, sf);
      if (!fn) return null;
      const returns = returnExpressions(fn.node);
      if (!returns) return null;
      return collect(returns.map((r) => this.values(r, fn.sf, next)));
    }
    if (ts.isIdentifier(node)) return this.identifierValues(node, sf, next);
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const entries = this.entries(node, sf, next);
      if (!entries) return null;
      return collect(entries.map((e) => this.values(e.expr, e.sf, next)));
    }
    return null;
  }

  /**
   * A `Math` call with an argument the folder cannot see (a size measured at run time),
   * or null. The base folder knows no such call; a gate whose rule is an upper bound
   * (a corner clamped to its mark's size) can read `Math.min` by the arguments it sees.
   */
  protected partialMath(_name: string, _node: ts.CallExpression, _sf: ts.SourceFile, _args: (Origin[] | null)[]): Origin[] | null {
    return null;
  }

  /** The expressions a property or element read can yield, from the tables it reads. */
  private entries(node: ts.PropertyAccessExpression | ts.ElementAccessExpression, sf: ts.SourceFile, seen: Set<ts.Node>): Expr[] | null {
    // A member of a namespace import is that module's export.
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      const ns = this.resolve(node.expression, sf);
      if (ns?.kind === "module") {
        const decl = this.exported(ns.sf, node.name.text, new Set());
        return decl?.kind === "var" && decl.node.initializer ? [{ expr: decl.node.initializer, sf: decl.sf }] : null;
      }
    }
    const tables = this.tables(node.expression, sf, seen);
    if (!tables) return null;
    let key: string | null = null;
    if (ts.isPropertyAccessExpression(node)) key = node.name.text;
    else {
      const arg = unwrap(node.argumentExpression);
      if (ts.isStringLiteral(arg) || ts.isNumericLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) key = arg.text;
    }
    const out: Expr[] = [];
    for (const table of tables) {
      const found = key === null ? this.allEntries(table, seen) : this.entry(table, key, seen);
      if (!found) return null;
      out.push(...found);
    }
    return out;
  }

  /** Every value of a table, for a read by a key the folder cannot know. */
  private allEntries(table: Table, seen: Set<ts.Node>): Expr[] | null {
    if (ts.isArrayLiteralExpression(table.node)) {
      if (table.node.elements.some((e) => ts.isSpreadElement(e))) return null;
      return table.node.elements.map((expr) => ({ expr, sf: table.sf }));
    }
    const out: Expr[] = [];
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
  private entry(table: Table, key: string, seen: Set<ts.Node>): Expr[] | null {
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
        if (found.every((f) => f !== null && f.length > 0)) return found.flat() as Expr[];
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
      const decl = this.resolve(node, sf);
      if (!decl) return null;
      if (decl.kind === "var" && ts.isIdentifier(decl.node.name)) return decl.node.initializer ? this.tables(decl.node.initializer, decl.sf, next) : null;
      if (decl.kind === "param") {
        // A shell's `skin` is whichever skin its platform entry hands it: every skin its
        // sibling styles module exports, when it has one.
        if (node.text === "skin" && /\.shared\.tsx?$/.test(decl.sf.fileName)) {
          const skins = this.siblingSkins(decl.sf);
          if (skins) return skins;
        }
        const args = this.arguments(decl.node);
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
    if (ts.isCallExpression(node)) {
      const fn = this.calleeFunction(node.expression, sf);
      const returns = fn && returnExpressions(fn.node);
      if (!fn || !returns) return null;
      const out: Table[] = [];
      for (const r of returns) {
        const tables = this.tables(r, fn.sf, next);
        if (!tables) return null;
        out.push(...tables);
      }
      return out;
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
      if (!ts.isVariableStatement(statement) || !isExported(statement)) continue;
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
    const decl = this.resolve(node, sf);
    if (!decl) return null;
    if (decl.kind === "var") return decl.node.initializer ? this.values(decl.node.initializer, decl.sf, seen) : null;
    if (decl.kind === "binding") return this.bindingValues(decl.node, decl.sf, seen);
    if (decl.kind === "param") {
      const args = this.arguments(decl.node);
      if (!args) return null;
      return collect(args.map((arg) => this.values(arg.expr, arg.sf, seen)));
    }
    return null;
  }

  /**
   * A destructured name: the matching element or property of the tables a const is read
   * from, or, for a function's destructured parameter (a component's prop), its default
   * and what every call and JSX use of the function passes for it.
   */
  private bindingValues(element: ts.BindingElement, sf: ts.SourceFile, seen: Set<ts.Node>): Origin[] | null {
    const pattern = element.parent;
    const holder = pattern.parent;
    const key = ts.isArrayBindingPattern(pattern) ? String(pattern.elements.indexOf(element)) : nameOf(element.propertyName ?? element.name);
    if (key === null) return null;
    if (ts.isParameter(holder) && ts.isObjectBindingPattern(pattern)) return this.propValues(holder, key, element, sf, seen);
    if (!ts.isVariableDeclaration(holder) || !holder.initializer) return null;
    const tables = this.tables(holder.initializer, sf, seen);
    if (!tables) return null;
    const results: (Origin[] | null)[] = [];
    for (const table of tables) {
      const entries = this.entry(table, key, seen);
      if (!entries || entries.length === 0) return null;
      for (const e of entries) results.push(this.values(e.expr, e.sf, seen));
    }
    return collect(results);
  }

  /** A destructured parameter property: its default, and what each call or JSX use passes. */
  private propValues(param: ts.ParameterDeclaration, key: string, element: ts.BindingElement, sf: ts.SourceFile, seen: Set<ts.Node>): Origin[] | null {
    const fn = param.parent;
    if (!(ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) return null;
    const index = fn.parameters.indexOf(param);
    const results: (Origin[] | null)[] = [];
    if (element.initializer) results.push(this.values(element.initializer, sf, seen));
    for (const site of this.callSites(fn)) {
      if ("attributes" in site) {
        // Only the first parameter is a component's props.
        if (index !== 0) return null;
        for (const attr of site.attributes.properties) {
          if (ts.isJsxSpreadAttribute(attr)) return null;
          if (nameOf(attr.name) !== key) continue;
          const init = attr.initializer;
          if (!init || !ts.isJsxExpression(init) || !init.expression) return null;
          results.push(this.values(init.expression, site.sf, seen));
        }
      } else {
        const arg = site.args[index];
        if (!arg) continue;
        const tables = this.tables(arg, site.sf, seen);
        if (!tables) return null;
        for (const table of tables) {
          const entries = this.entry(table, key, seen);
          if (!entries) return null;
          for (const e of entries) results.push(this.values(e.expr, e.sf, seen));
        }
      }
    }
    return collect(results);
  }

  /** What a parameter receives: its argument at every call of its function among the scanned files. */
  private arguments(param: ts.ParameterDeclaration): Expr[] | null {
    const fn = param.parent;
    if (!(ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) return null;
    const index = fn.parameters.indexOf(param);
    const out: Expr[] = [];
    for (const site of this.callSites(fn)) {
      if ("attributes" in site) return null;
      const arg = site.args[index];
      if (arg) out.push({ expr: arg, sf: site.sf });
    }
    return out.length > 0 ? out : null;
  }

  /** Every call and JSX use of a function among the scanned files. */
  private callSites(fn: FunctionNode): CallSite[] {
    if (!this.callIndex) {
      const index = new Map<ts.Node, CallSite[]>();
      const add = (target: { node: FunctionNode } | null, site: CallSite) => {
        if (!target) return;
        const list = index.get(target.node) ?? [];
        list.push(site);
        index.set(target.node, list);
      };
      for (const relative of this.scope) {
        const sf = this.load(relative);
        const visit = (node: ts.Node) => {
          if (ts.isCallExpression(node)) add(this.calleeFunction(node.expression, sf), { sf, args: node.arguments });
          else if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
            if (ts.isIdentifier(node.tagName)) add(this.calleeFunction(node.tagName, sf), { sf, attributes: node.attributes });
          }
          ts.forEachChild(node, visit);
        };
        visit(sf);
      }
      this.callIndex = index;
    }
    return this.callIndex.get(fn) ?? [];
  }

  /** The function a callee names (a local or imported function, or a namespace member), or null. */
  private calleeFunction(callee: ts.Expression, sf: ts.SourceFile): { node: FunctionNode; sf: ts.SourceFile } | null {
    const node = unwrap(callee);
    let decl: Decl | null = null;
    if (ts.isIdentifier(node)) decl = this.resolve(node, sf);
    else if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      const ns = this.resolve(node.expression, sf);
      if (ns?.kind === "module") decl = this.exported(ns.sf, node.name.text, new Set());
    }
    if (!decl) return null;
    if (decl.kind === "function") return { node: decl.node, sf: decl.sf };
    if (decl.kind === "var" && decl.node.initializer) {
      const init = unwrap(decl.node.initializer);
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return { node: init, sf: decl.sf };
    }
    return null;
  }

  /** What a name refers to: by lexical scope, then by the module's imports. */
  protected resolve(id: ts.Identifier, sf: ts.SourceFile): Decl | null {
    const name = id.text;
    for (let scope: ts.Node | undefined = id.parent; scope; scope = scope.parent) {
      if (ts.isFunctionLike(scope)) {
        for (const param of scope.parameters) {
          const found = bindingNamed(param.name, name);
          if (found === true) return { kind: "param", node: param, sf };
          if (found) return { kind: "binding", node: found, sf };
        }
      }
      const statements = ts.isSourceFile(scope) || ts.isBlock(scope) || ts.isModuleBlock(scope) ? scope.statements : ts.isCaseClause(scope) || ts.isDefaultClause(scope) ? scope.statements : null;
      if (!statements) continue;
      const local = declaredIn(statements, name, sf);
      if (local) return local;
    }
    return this.imported(sf, name);
  }

  /** A name a module imports, resolved in the module that exports it, or null. */
  private imported(sf: ts.SourceFile, name: string): Decl | null {
    for (const statement of sf.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const clause = statement.importClause;
      if (!clause || clause.isTypeOnly) continue;
      let exportName: string | null = null;
      let namespace = false;
      if (clause.name?.text === name) exportName = "default";
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings) && bindings.name.text === name) namespace = true;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          if (element.name.text === name && !element.isTypeOnly) exportName = (element.propertyName ?? element.name).text;
        }
      }
      if (!exportName && !namespace) continue;
      const target = this.module(sf, statement.moduleSpecifier.text);
      if (!target) return null;
      return namespace ? { kind: "module", sf: target } : this.exported(target, exportName!, new Set());
    }
    return null;
  }

  /** The declaration a module exports under a name, re-exports followed, or null. */
  private exported(sf: ts.SourceFile, name: string, visited: Set<string>): Decl | null {
    if (visited.has(sf.fileName)) return null;
    visited.add(sf.fileName);
    const stars: ts.SourceFile[] = [];
    for (const statement of sf.statements) {
      if (ts.isVariableStatement(statement) && isExported(statement)) {
        const found = declaredIn([statement], name, sf);
        if (found) return found;
      } else if (ts.isFunctionDeclaration(statement) && isExported(statement) && statement.name?.text === name) {
        return { kind: "function", node: statement, sf };
      } else if (ts.isExportDeclaration(statement) && !statement.isTypeOnly) {
        const from = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? this.module(sf, statement.moduleSpecifier.text) : null;
        const clause = statement.exportClause;
        if (!clause) {
          if (from) stars.push(from);
        } else if (ts.isNamedExports(clause)) {
          for (const element of clause.elements) {
            if (element.name.text !== name || element.isTypeOnly) continue;
            const local = (element.propertyName ?? element.name).text;
            if (statement.moduleSpecifier) return from ? this.exported(from, local, new Set()) : null;
            return declaredIn(sf.statements, local, sf) ?? this.imported(sf, local);
          }
        }
      }
    }
    for (const star of stars) {
      const found = this.exported(star, name, visited);
      if (found) return found;
    }
    return null;
  }

  /** The scanned module a relative import names, or null for a package or a file outside the root. */
  private module(from: ts.SourceFile, specifier: string): ts.SourceFile | null {
    if (!specifier.startsWith(".")) return null;
    const base = normalize(join(dirname(from.fileName), specifier)).replace(/\.js$/, "");
    const candidates = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
    const found = candidates.find((c) => existsSync(join(this.root, c)));
    return found ? this.load(found) : null;
  }

  /**
   * Every place among the scanned files that names a module-level declaration, outside the
   * declaration itself: a read of a const, a spread of a style object, a call of a function,
   * by its own name, an import alias or a namespace member. Each place is the identifier
   * that names it, so `pathOf` says what uses it (`iosSkin.editInput` for a constant spread
   * into the iOS skin's edit field).
   */
  protected referencesTo(decl: TopDeclaration): { node: ts.Identifier; sf: ts.SourceFile }[] {
    const target = decl.node;
    const name = target.name && ts.isIdentifier(target.name) ? target.name.text : null;
    if (!name) return [];
    const { names, aliases } = this.indexNames();
    const out: { node: ts.Identifier; sf: ts.SourceFile }[] = [];
    for (const local of [name, ...(aliases.get(name) ?? [])]) {
      for (const { id, sf } of names.get(local) ?? []) {
        if (sf === decl.sf && id.pos >= target.pos && id.end <= target.end) continue;
        const parent = id.parent;
        let found: Decl | null;
        if (ts.isPropertyAccessExpression(parent) && parent.name === id) {
          // `styles.menuPanel` through `import * as styles`.
          const ns = ts.isIdentifier(parent.expression) ? this.resolve(parent.expression, sf) : null;
          found = ns?.kind === "module" ? this.exported(ns.sf, id.text, new Set()) : null;
        } else found = this.resolve(id, sf);
        if (found && found.kind !== "module" && found.kind !== "param" && found.node === target) out.push({ node: id, sf });
      }
    }
    return out;
  }

  /** The module-level const or function a node is written in, or null at the top level itself. */
  protected topDeclarationOf(node: ts.Node, sf: ts.SourceFile): TopDeclaration | null {
    for (let at: ts.Node | undefined = node; at; at = at.parent) {
      if (ts.isFunctionDeclaration(at) && at.parent === sf) return { node: at, sf };
      if (ts.isVariableDeclaration(at) && ts.isVariableDeclarationList(at.parent) && ts.isVariableStatement(at.parent.parent) && at.parent.parent.parent === sf) {
        return { node: at, sf };
      }
    }
    return null;
  }

  /** The identifiers of the scan that can name a declaration, and the import aliases. */
  private indexNames(): { names: Map<string, { id: ts.Identifier; sf: ts.SourceFile }[]>; aliases: Map<string, Set<string>> } {
    if (!this.nameIndex || !this.aliasIndex) {
      const names = new Map<string, { id: ts.Identifier; sf: ts.SourceFile }[]>();
      const aliases = new Map<string, Set<string>>();
      for (const relative of this.scope) {
        const sf = this.load(relative);
        const visit = (node: ts.Node) => {
          if (ts.isImportDeclaration(node)) {
            const bindings = node.importClause?.namedBindings;
            if (bindings && ts.isNamedImports(bindings)) {
              for (const element of bindings.elements) {
                if (!element.propertyName) continue;
                const exported = element.propertyName.text;
                aliases.set(exported, (aliases.get(exported) ?? new Set()).add(element.name.text));
              }
            }
            return;
          }
          if (ts.isTypeNode(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isExportDeclaration(node)) return;
          if (ts.isIdentifier(node) && namesADeclaration(node)) {
            const list = names.get(node.text) ?? [];
            list.push({ id: node, sf });
            names.set(node.text, list);
          }
          ts.forEachChild(node, visit);
        };
        visit(sf);
      }
      this.nameIndex = names;
      this.aliasIndex = aliases;
    }
    return { names: this.nameIndex, aliases: this.aliasIndex };
  }

  /**
   * The names enclosing a node, outermost first: declarations, functions, methods and
   * object keys. A traced property's own key is left off, since the path names the thing
   * styled, not the property (`iosSkin.hourLabel`, not `iosSkin.hourLabel.fontSize`).
   */
  pathOf(node: ts.Node): string {
    const names: string[] = [];
    for (let at: ts.Node | undefined = node.parent; at; at = at.parent) {
      let name: string | null = null;
      if (ts.isVariableDeclaration(at) && ts.isIdentifier(at.name)) name = at.name.text;
      else if (ts.isFunctionDeclaration(at) && at.name) name = at.name.text;
      else if (ts.isPropertyAssignment(at) || ts.isMethodDeclaration(at)) name = nameOf(at.name);
      if (name) names.unshift(name);
    }
    if (names.length > 0 && this.isSinkName(names[names.length - 1])) names.pop();
    return names.join(".");
  }
}

/**
 * Whether an identifier can name a declaration where it stands: not a declaration's own
 * name, a parameter, a property key, a JSX attribute or a member name (a namespace import's
 * member is checked where it is read).
 */
export function namesADeclaration(id: ts.Identifier): boolean {
  const parent = id.parent;
  if (
    (ts.isVariableDeclaration(parent) || ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isParameter(parent)) &&
    parent.name === id
  ) {
    return false;
  }
  if (ts.isBindingElement(parent) && (parent.name === id || parent.propertyName === id)) return false;
  if (
    (ts.isPropertyAssignment(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isPropertySignature(parent) ||
      ts.isMethodSignature(parent) ||
      ts.isEnumMember(parent) ||
      ts.isClassDeclaration(parent)) &&
    parent.name === id
  ) {
    return false;
  }
  if (ts.isJsxAttribute(parent) || ts.isLabeledStatement(parent)) return false;
  if (ts.isPropertyAccessExpression(parent) && parent.name === id) return ts.isIdentifier(parent.expression);
  return true;
}

/** A const, a destructured const, or a function declared by these statements under a name. */
function declaredIn(statements: readonly ts.Statement[], name: string, sf: ts.SourceFile): Decl | null {
  for (const statement of statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) return { kind: "function", node: statement, sf };
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      const found = bindingNamed(decl.name, name);
      if (found === true) return { kind: "var", node: decl, sf };
      if (found) return { kind: "binding", node: found, sf };
    }
  }
  return null;
}

/** The expressions a function returns (its body, for an expression-bodied arrow), or null. */
function returnExpressions(fn: FunctionNode): ts.Expression[] | null {
  if (!fn.body) return null;
  if (!ts.isBlock(fn.body)) return [fn.body];
  const out: ts.Expression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isFunctionLike(node)) return;
    if (ts.isReturnStatement(node) && node.expression) out.push(node.expression);
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(fn.body, visit);
  return out.length > 0 ? out : null;
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

/** The numbers, or null when any is only a bound. */
function exact(origins: Origin[] | null): Origin[] | null {
  return origins && origins.some((o) => o.bound) ? null : origins;
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

/**
 * What makes an origin distinct: the place it is written and its value, since one place can
 * yield several numbers (a computation over a table).
 */
export function originKey(origin: Origin): string {
  return `${origin.sf.fileName}:${origin.node.getStart(origin.sf)}:${origin.value}`;
}

export function lineOf(sf: ts.SourceFile, node: ts.Node): number {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
