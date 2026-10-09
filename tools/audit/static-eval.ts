// A small static evaluator for the audit facts: what an expression in a test or e2e
// module comes to, read with the TypeScript parser and never run. The facts need it
// wherever a module reaches the kit or a docs route through data rather than a literal:
// test/skins-smoke.test.tsx mounts every row of its CASES table through one computed
// `import(`../src/${c.dir}/${c.file}${suffix}.tsx`)` and `mod[c.name]`, and an e2e spec
// drives `/components/${slug}` for each slug of a literal array.
//
// It follows what can be known from the source alone: literals, templates, arrays and
// object literals, `const` bindings (destructured ones included), the rows of the
// `for...of` loops around an expression, local arrow functions and function
// declarations with an expression body or a body of consts and one return, the array
// methods `filter`, `map`, `flatMap`, `find`, `some`, `every`, `includes` and `join`,
// and the values a caller's hooks hand it for an import (the e2e catalogs). Anything
// else is UNKNOWN, and UNKNOWN poisons whatever is built from it, so the reader never
// guesses: a `let`, a parameter it was not called with, a global, a call into another
// module.

import ts from "typescript";

/** A value the reader cannot know from the source. */
export const UNKNOWN: unique symbol = Symbol("unknown");

/** The bindings in force: each binding's name node, mapped to its value. */
export type Env = ReadonlyMap<ts.Identifier, unknown>;

type FunctionNode = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration;

/** A function written in the module, closed over the bindings in force where it was read. */
export class Closure {
  constructor(
    readonly node: FunctionNode,
    readonly env: Env,
  ) {}
}

/** A function the caller's hooks hand the reader, which it may call with known arguments (a catalog). */
export class Host {
  constructor(readonly call: (args: unknown[]) => unknown) {}
}

export interface EvalHooks {
  /** The value of a name a module imports (`imported` is `default` or `*` for those forms), or UNKNOWN. */
  importValue?(specifier: string, imported: string): unknown;
  /** Whether the rows of a loop are left unbound: the reader then knows nothing of its variables. */
  skipLoop?(loop: ts.ForOfStatement): boolean;
}

/** One name a binding pattern binds, with the path from the bound value to it. */
interface BoundName {
  id: ts.Identifier;
  path: (string | number)[];
}

type Binding =
  | { kind: "loop"; loop: ts.ForOfStatement; id: ts.Identifier }
  | { kind: "param"; id: ts.Identifier }
  | { kind: "const"; decl: ts.VariableDeclaration; path: (string | number)[]; topLevel: boolean }
  | { kind: "function"; decl: ts.FunctionDeclaration }
  | { kind: "import"; specifier: string; imported: string }
  // A `let` or `var`, a catch variable, a class or an enum: nothing the reader follows.
  | { kind: "opaque" };

/** The expression inside any parentheses, `as`, `satisfies`, `!` or `<T>`. */
export function unwrap(expr: ts.Expression): ts.Expression {
  let e = expr;
  while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e) || ts.isTypeAssertionExpression(e)) e = e.expression;
  return e;
}

/** Every name a binding pattern binds, with its path; a rest element binds nothing the reader follows. */
export function boundNames(name: ts.BindingName, path: (string | number)[] = []): BoundName[] {
  if (ts.isIdentifier(name)) return [{ id: name, path }];
  const out: BoundName[] = [];
  name.elements.forEach((element, i) => {
    if (ts.isOmittedExpression(element) || element.dotDotDotToken) return;
    if (ts.isObjectBindingPattern(name)) {
      const key = element.propertyName ?? element.name;
      if (!ts.isIdentifier(key) && !ts.isStringLiteral(key)) return;
      out.push(...boundNames(element.name, [...path, key.text]));
    } else out.push(...boundNames(element.name, [...path, i]));
  });
  return out;
}

const isPrimitive = (v: unknown): v is string | number | boolean => typeof v === "string" || typeof v === "number" || typeof v === "boolean";

/** A member of a known value: an own property, an array index or length, a string's length; UNKNOWN otherwise. */
function member(value: unknown, key: unknown): unknown {
  if (value === UNKNOWN || key === UNKNOWN) return UNKNOWN;
  if (typeof key !== "string" && typeof key !== "number") return UNKNOWN;
  if (Array.isArray(value) || typeof value === "string") {
    if (key === "length") return value.length;
    return typeof key === "number" || /^\d+$/.test(key) ? value[Number(key)] : UNKNOWN;
  }
  if (value !== null && typeof value === "object" && !(value instanceof Closure) && !(value instanceof Host) && !(value instanceof Set)) {
    return Object.prototype.hasOwnProperty.call(value, key) ? (value as Record<string, unknown>)[key] : undefined;
  }
  return UNKNOWN;
}

function pick(value: unknown, path: (string | number)[]): unknown {
  return path.reduce<unknown>((v, key) => member(v, key), value);
}

/** Whether an identifier reads a value: not a property name, not a name being declared. */
export function isValueRead(id: ts.Identifier): boolean {
  const parent = id.parent;
  if ((ts.isPropertyAccessExpression(parent) || ts.isPropertyAssignment(parent) || ts.isJsxAttribute(parent) || ts.isMethodDeclaration(parent)) && parent.name === id) return false;
  if (ts.isBindingElement(parent) && (parent.name === id || parent.propertyName === id)) return false;
  if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isNamespaceImport(parent)) return false;
  const declares =
    ts.isVariableDeclaration(parent) || ts.isParameter(parent) || ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isClassDeclaration(parent) || ts.isPropertyDeclaration(parent);
  return !(declares && (parent as ts.NamedDeclaration).name === id);
}

/** The most loop rows the reader enumerates for one expression before it gives up on it. */
export const ENV_LIMIT = 5000;

export class StaticReader {
  private readonly bindings = new Map<ts.Identifier, Binding | null>();
  private readonly topLevel = new Map<ts.VariableDeclaration, unknown>();
  private readonly evaluating = new Set<ts.Node>();
  private depth = 0;

  constructor(
    readonly sf: ts.SourceFile,
    readonly hooks: EvalHooks = {},
  ) {}

  /** What a name refers to where it is read, or null for a global. */
  resolve(id: ts.Identifier): Binding | null {
    if (!this.bindings.has(id)) this.bindings.set(id, this.lookup(id));
    return this.bindings.get(id)!;
  }

  private lookup(id: ts.Identifier): Binding | null {
    const name = id.text;
    for (let node: ts.Node = id; node.parent; node = node.parent) {
      const scope = node.parent;
      if (ts.isForOfStatement(scope) || ts.isForInStatement(scope) || ts.isForStatement(scope)) {
        const init = scope.initializer;
        // A for...of or for...in binds in its body; a classic for, everywhere after its initializer.
        const inScope = ts.isForStatement(scope) ? node !== init : node === scope.statement;
        if (inScope && init && ts.isVariableDeclarationList(init)) {
          for (const decl of init.declarations) {
            const bound = boundNames(decl.name).find((b) => b.id.text === name);
            if (!bound) continue;
            // Only a `const` row of a for...of is a known row; a `let` may be reassigned.
            const constant = (init.flags & ts.NodeFlags.Const) !== 0;
            return ts.isForOfStatement(scope) && constant ? { kind: "loop", loop: scope, id: bound.id } : { kind: "opaque" };
          }
        }
      }
      if (ts.isFunctionLike(scope)) {
        for (const param of scope.parameters) {
          const bound = boundNames(param.name).find((b) => b.id.text === name);
          if (bound) return { kind: "param", id: bound.id };
        }
      }
      if (ts.isCatchClause(scope) && scope.variableDeclaration && boundNames(scope.variableDeclaration.name).some((b) => b.id.text === name)) return { kind: "opaque" };
      if (ts.isBlock(scope) || ts.isSourceFile(scope) || ts.isModuleBlock(scope) || ts.isCaseClause(scope) || ts.isDefaultClause(scope)) {
        const found = this.declaredIn(scope.statements, name);
        if (found) return found;
      }
    }
    return null;
  }

  private declaredIn(statements: ts.NodeArray<ts.Statement>, name: string): Binding | null {
    for (const s of statements) {
      if (ts.isVariableStatement(s)) {
        const isConst = (s.declarationList.flags & ts.NodeFlags.Const) !== 0;
        for (const decl of s.declarationList.declarations) {
          const bound = boundNames(decl.name).find((b) => b.id.text === name);
          if (bound) return isConst ? { kind: "const", decl, path: bound.path, topLevel: ts.isSourceFile(s.parent) } : { kind: "opaque" };
        }
      } else if (ts.isFunctionDeclaration(s) && s.name?.text === name) return { kind: "function", decl: s };
      else if ((ts.isClassDeclaration(s) || ts.isEnumDeclaration(s)) && s.name?.text === name) return { kind: "opaque" };
      else if (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && s.importClause && !s.importClause.isTypeOnly) {
        const clause = s.importClause;
        const specifier = s.moduleSpecifier.text;
        if (clause.name?.text === name) return { kind: "import", specifier, imported: "default" };
        const bindings = clause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings) && bindings.name.text === name) return { kind: "import", specifier, imported: "*" };
        if (bindings && ts.isNamedImports(bindings)) {
          const element = bindings.elements.find((el) => el.name.text === name && !el.isTypeOnly);
          if (element) return { kind: "import", specifier, imported: (element.propertyName ?? element.name).text };
        }
      }
    }
    return null;
  }

  /** What an expression comes to under the given bindings, or UNKNOWN. */
  evaluate(expr: ts.Expression, env: Env = new Map()): unknown {
    if (this.depth > 200) return UNKNOWN;
    this.depth++;
    try {
      return this.read(expr, env);
    } catch {
      return UNKNOWN;
    } finally {
      this.depth--;
    }
  }

  private read(expr: ts.Expression, env: Env): unknown {
    const e = unwrap(expr);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
    if (ts.isNumericLiteral(e)) return Number(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (e.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isTemplateExpression(e)) {
      let text = e.head.text;
      for (const span of e.templateSpans) {
        const v = this.evaluate(span.expression, env);
        if (!isPrimitive(v)) return UNKNOWN;
        text += String(v) + span.literal.text;
      }
      return text;
    }
    if (ts.isIdentifier(e)) return e.text === "undefined" && !this.resolve(e) ? undefined : this.valueOf(this.resolve(e), env);
    if (ts.isPropertyAccessExpression(e)) {
      const obj = this.evaluate(e.expression, env);
      if (e.questionDotToken && (obj === null || obj === undefined)) return undefined;
      return member(obj, e.name.text);
    }
    if (ts.isElementAccessExpression(e)) {
      const obj = this.evaluate(e.expression, env);
      if (e.questionDotToken && (obj === null || obj === undefined)) return undefined;
      return member(obj, this.evaluate(e.argumentExpression, env));
    }
    if (ts.isArrayLiteralExpression(e)) {
      const out: unknown[] = [];
      for (const el of e.elements) {
        if (ts.isSpreadElement(el)) {
          const v = this.evaluate(el.expression, env);
          if (!Array.isArray(v)) return UNKNOWN;
          out.push(...v);
        } else out.push(ts.isOmittedExpression(el) ? undefined : this.evaluate(el, env));
      }
      return out;
    }
    if (ts.isObjectLiteralExpression(e)) return this.object(e, env);
    if (ts.isConditionalExpression(e)) {
      const test = this.evaluate(e.condition, env);
      return test === UNKNOWN ? UNKNOWN : this.evaluate(test ? e.whenTrue : e.whenFalse, env);
    }
    if (ts.isBinaryExpression(e)) return this.binary(e, env);
    if (ts.isPrefixUnaryExpression(e)) {
      const v = this.evaluate(e.operand, env);
      if (v === UNKNOWN) return UNKNOWN;
      if (e.operator === ts.SyntaxKind.ExclamationToken) return !v;
      if (e.operator === ts.SyntaxKind.MinusToken && typeof v === "number") return -v;
      return UNKNOWN;
    }
    if (ts.isTypeOfExpression(e)) {
      const v = this.evaluate(e.expression, env);
      return v === UNKNOWN ? UNKNOWN : v instanceof Closure || v instanceof Host ? "function" : typeof v;
    }
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return new Closure(e, env);
    if (ts.isCallExpression(e)) return this.call(e, env);
    if (ts.isNewExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === "Set" && !this.resolve(e.expression)) {
      const items = e.arguments?.length ? this.evaluate(e.arguments[0], env) : [];
      return Array.isArray(items) && !items.includes(UNKNOWN) ? new Set(items) : UNKNOWN;
    }
    return UNKNOWN;
  }

  private object(e: ts.ObjectLiteralExpression, env: Env): unknown {
    const out: Record<string, unknown> = {};
    for (const p of e.properties) {
      if (ts.isSpreadAssignment(p)) {
        const v = this.evaluate(p.expression, env);
        if (v === null || typeof v !== "object" || v instanceof Closure || v instanceof Host || Array.isArray(v)) return UNKNOWN;
        Object.assign(out, v);
        continue;
      }
      const name = p.name;
      const key = ts.isComputedPropertyName(name) ? this.evaluate(name.expression, env) : ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : UNKNOWN;
      if (typeof key !== "string" && typeof key !== "number") return UNKNOWN;
      if (ts.isPropertyAssignment(p)) out[key] = this.evaluate(p.initializer, env);
      else if (ts.isShorthandPropertyAssignment(p)) out[key] = this.evaluate(p.name, env);
      else if (ts.isMethodDeclaration(p)) out[key] = new Closure(p, env);
      else out[key] = UNKNOWN;
    }
    return out;
  }

  private binary(e: ts.BinaryExpression, env: Env): unknown {
    const op = e.operatorToken.kind;
    const left = this.evaluate(e.left, env);
    if (left === UNKNOWN) return UNKNOWN;
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) return left ? this.evaluate(e.right, env) : left;
    if (op === ts.SyntaxKind.BarBarToken) return left ? left : this.evaluate(e.right, env);
    if (op === ts.SyntaxKind.QuestionQuestionToken) return left ?? this.evaluate(e.right, env);
    const right = this.evaluate(e.right, env);
    if (right === UNKNOWN) return UNKNOWN;
    switch (op) {
      case ts.SyntaxKind.EqualsEqualsEqualsToken:
        return left === right;
      case ts.SyntaxKind.ExclamationEqualsEqualsToken:
        return left !== right;
      case ts.SyntaxKind.EqualsEqualsToken:
        return left == right;
      case ts.SyntaxKind.ExclamationEqualsToken:
        return left != right;
      case ts.SyntaxKind.PlusToken:
        return isPrimitive(left) && isPrimitive(right) ? (left as string) + (right as string) : UNKNOWN;
      case ts.SyntaxKind.InKeyword:
        return typeof left === "string" && right !== null && typeof right === "object" && !(right instanceof Closure) ? Object.prototype.hasOwnProperty.call(right, left) : UNKNOWN;
      default:
        return UNKNOWN;
    }
  }

  private valueOf(binding: Binding | null, env: Env): unknown {
    if (!binding) return UNKNOWN;
    switch (binding.kind) {
      case "loop":
      case "param":
        return env.has(binding.id) ? env.get(binding.id) : UNKNOWN;
      case "function":
        return new Closure(binding.decl, env);
      case "import":
        return this.hooks.importValue?.(binding.specifier, binding.imported) ?? UNKNOWN;
      case "opaque":
        return UNKNOWN;
      case "const": {
        const { decl } = binding;
        if (!decl.initializer || this.evaluating.has(decl)) return UNKNOWN;
        // A module-level const reads no loop or parameter, so its value is read once.
        if (binding.topLevel && this.topLevel.has(decl)) return pick(this.topLevel.get(decl), binding.path);
        this.evaluating.add(decl);
        try {
          const value = this.evaluate(decl.initializer, binding.topLevel ? new Map() : env);
          if (binding.topLevel) this.topLevel.set(decl, value);
          return pick(value, binding.path);
        } finally {
          this.evaluating.delete(decl);
        }
      }
    }
  }

  private call(e: ts.CallExpression, env: Env): unknown {
    const callee = unwrap(e.expression);
    const args = (): unknown[] | null => {
      const out: unknown[] = [];
      for (const arg of e.arguments) {
        if (ts.isSpreadElement(arg)) {
          const v = this.evaluate(arg.expression, env);
          if (!Array.isArray(v)) return null;
          out.push(...v);
        } else out.push(this.evaluate(arg, env));
      }
      return out;
    };
    if (ts.isPropertyAccessExpression(callee)) {
      const method = callee.name.text;
      // Object.entries / keys / values of a known object.
      if (ts.isIdentifier(callee.expression) && callee.expression.text === "Object" && !this.resolve(callee.expression) && ["entries", "keys", "values"].includes(method)) {
        const [target] = args() ?? [UNKNOWN];
        if (target === null || typeof target !== "object" || target instanceof Closure || target instanceof Host) return UNKNOWN;
        return method === "entries" ? Object.entries(target) : method === "keys" ? Object.keys(target) : Object.values(target);
      }
      const receiver = this.evaluate(callee.expression, env);
      if (receiver === UNKNOWN) return UNKNOWN;
      if (Array.isArray(receiver)) return this.arrayMethod(receiver, method, args);
      if (typeof receiver === "string") return stringMethod(receiver, method, args() ?? []);
      if (receiver instanceof Set) {
        const [value] = args() ?? [UNKNOWN];
        return method === "has" && value !== UNKNOWN ? receiver.has(value) : UNKNOWN;
      }
      const fn = member(receiver, method);
      return fn instanceof Closure || fn instanceof Host ? this.apply(fn, args() ?? [UNKNOWN]) : UNKNOWN;
    }
    const fn = this.evaluate(callee, env);
    return fn instanceof Closure || fn instanceof Host ? this.apply(fn, args() ?? [UNKNOWN]) : UNKNOWN;
  }

  private arrayMethod(arr: unknown[], method: string, args: () => unknown[] | null): unknown {
    const given = args();
    if (!given) return UNKNOWN;
    const [first] = given;
    const each = (fn: unknown): unknown[] => arr.map((el, i) => this.apply(fn, [el, i]));
    switch (method) {
      case "filter":
      case "find":
      case "some":
      case "every": {
        // A predicate the reader cannot read for one row leaves the whole result unknown.
        const results = each(first);
        if (results.includes(UNKNOWN)) return UNKNOWN;
        if (method === "filter") return arr.filter((_, i) => results[i]);
        if (method === "find") return arr.find((_, i) => results[i]);
        return method === "some" ? results.some(Boolean) : results.every(Boolean);
      }
      case "map":
        return each(first);
      case "flatMap": {
        const results = each(first);
        return results.includes(UNKNOWN) ? UNKNOWN : results.flatMap((r) => r);
      }
      case "includes":
        return first === UNKNOWN ? UNKNOWN : arr.includes(first);
      case "join":
        return arr.every(isPrimitive) && (first === undefined || typeof first === "string") ? arr.join(first) : UNKNOWN;
      default:
        return UNKNOWN;
    }
  }

  /** Call a function written in the module, or one the hooks handed over, with these arguments. */
  apply(fn: unknown, args: unknown[]): unknown {
    if (fn instanceof Host) return args.includes(UNKNOWN) ? UNKNOWN : fn.call(args);
    if (!(fn instanceof Closure)) return UNKNOWN;
    const { node } = fn;
    const env = new Map(fn.env);
    node.parameters.forEach((param, i) => {
      const value = param.dotDotDotToken ? args.slice(i) : args[i] === undefined && param.initializer ? this.evaluate(param.initializer, env) : args[i];
      for (const bound of boundNames(param.name)) env.set(bound.id, pick(value, bound.path));
    });
    const body = node.body;
    if (!body) return UNKNOWN;
    if (!ts.isBlock(body)) return this.evaluate(body, env);
    // A body of consts and one return: the consts are read through scope when the return
    // reads them. Any other statement (an if, a loop, an assignment) is not followed.
    for (const statement of body.statements) {
      if (ts.isReturnStatement(statement)) return statement.expression ? this.evaluate(statement.expression, env) : undefined;
      if (!ts.isVariableStatement(statement) || !(statement.declarationList.flags & ts.NodeFlags.Const)) return UNKNOWN;
    }
    return undefined;
  }

  /** The `for...of` loops whose variables an expression reads, through consts and local functions, outermost first. */
  loopsRead(node: ts.Node): ts.ForOfStatement[] {
    const loops = new Set<ts.ForOfStatement>();
    const seen = new Set<ts.Node>();
    const visit = (n: ts.Node): void => {
      if (ts.isIdentifier(n) && isValueRead(n)) {
        const b = this.resolve(n);
        if (b?.kind === "loop" && !loops.has(b.loop)) {
          loops.add(b.loop);
          visit(b.loop.expression);
        } else if (b?.kind === "const" && !seen.has(b.decl)) {
          seen.add(b.decl);
          if (b.decl.initializer) visit(b.decl.initializer);
        } else if (b?.kind === "function" && !seen.has(b.decl)) {
          seen.add(b.decl);
          if (b.decl.body) visit(b.decl.body);
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(node);
    return [...loops].sort((a, b) => a.pos - b.pos);
  }

  /** Bind a loop's variables to one of its rows. */
  bindLoop(loop: ts.ForOfStatement, row: unknown, env: Map<ts.Identifier, unknown>): void {
    const init = loop.initializer;
    if (!ts.isVariableDeclarationList(init)) return;
    for (const decl of init.declarations) for (const bound of boundNames(decl.name)) env.set(bound.id, pick(row, bound.path));
  }

  /**
   * Every set of loop bindings an expression can be read under: one per combination of
   * the rows of the loops it reads. A loop whose rows are not known (or that the hooks
   * skip) leaves its variables unbound. Null when the combinations pass ENV_LIMIT.
   */
  envs(node: ts.Node): Env[] | null {
    let envs: Map<ts.Identifier, unknown>[] = [new Map()];
    for (const loop of this.loopsRead(node)) {
      const next: Map<ts.Identifier, unknown>[] = [];
      for (const env of envs) {
        const rows = this.hooks.skipLoop?.(loop) ? UNKNOWN : this.evaluate(loop.expression, env);
        if (!Array.isArray(rows)) {
          next.push(env);
          continue;
        }
        for (const row of rows) {
          const bound = new Map(env);
          this.bindLoop(loop, row, bound);
          next.push(bound);
        }
        if (next.length > ENV_LIMIT) return null;
      }
      envs = next;
    }
    return envs;
  }

  /** The text of a template up to its first substitution the reader cannot know, and whether it got to the end. */
  templateText(template: ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral | ts.StringLiteral, env: Env): { text: string; complete: boolean } {
    if (!ts.isTemplateExpression(template)) return { text: template.text, complete: true };
    let text = template.head.text;
    for (const span of template.templateSpans) {
      const v = this.evaluate(span.expression, env);
      if (!isPrimitive(v)) return { text, complete: false };
      text += String(v) + span.literal.text;
    }
    return { text, complete: true };
  }

  /** Every string an expression can be across the rows of the loops it reads (none when it is not a string or not known). */
  strings(expr: ts.Expression): string[] {
    const out = new Set<string>();
    for (const env of this.envs(expr) ?? [new Map()]) {
      const v = this.evaluate(expr, env);
      if (typeof v === "string") out.add(v);
    }
    return [...out];
  }
}

function stringMethod(s: string, method: string, args: unknown[]): unknown {
  if (args.includes(UNKNOWN)) return UNKNOWN;
  const [a, b] = args;
  switch (method) {
    case "startsWith":
    case "endsWith":
    case "includes":
      return typeof a === "string" ? s[method](a) : UNKNOWN;
    case "toLowerCase":
    case "toUpperCase":
    case "trim":
      return s[method]();
    case "slice":
      return typeof a === "number" && (b === undefined || typeof b === "number") ? s.slice(a, b as number | undefined) : UNKNOWN;
    default:
      return UNKNOWN;
  }
}
