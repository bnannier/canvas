// A small static evaluator for the audit facts: what an expression in a test or e2e
// module comes to, read with the TypeScript parser and never run. The facts need it
// wherever a module reaches the kit or a docs route through data rather than a literal:
// test/skins-smoke.test.tsx mounts every row of its CASES table through one computed
// `import(`../src/${c.dir}/${c.file}${suffix}.tsx`)` and `mod[c.name]`, an e2e spec drives
// `/components/${slug}` for each slug of a literal array, and a helper builds the route
// from the row its caller hands it (e2e/behavior/text-entry-clear.e2e.ts's `entry`).
//
// It follows what can be known from the source alone:
//
// - Values: literals, templates, regular expressions, arrays and object literals,
//   `const` bindings (destructured ones included), the methods of arrays, strings,
//   regular expressions, Sets and Maps that compute a value, and the values a caller's
//   hooks hand it for an import, for `import.meta` and for a global (the e2e catalogs,
//   the checkout's own paths and files: tools/audit/hosts.ts).
// - Functions written in the module: called with known arguments, a body runs statement
//   by statement (consts and lets, if, for...of, for...in, the indexed for, continue,
//   break and return, and the Set, Map and array mutators on a value the body made
//   itself); anything else in a body leaves its result unknown.
// - Where a node is reached (`contexts`): the rows of the loops around it, the
//   parameters of the function it is in (bound at every call site in the module, or per
//   element for an array method's callback), and the guards on the way (`if (...)
//   continue;`, an if or a ternary branch, `&&`). A node inside a function the module
//   hands to a call it does not follow (a test body) is reached with that function's
//   parameters unknown. Where the reader is in doubt, the binding says why, and whether
//   the doubt filters: a guard or condition over a row it cannot read, or a callback
//   that stops early, may select among the rows, so the values it leaves are not exactly
//   the ones that occur; a while loop or a helper the module exports or hands on as a
//   value only leaves open whether the code runs. A fact that depends on a filtering
//   doubt fails rather than guesses.
//
// Anything else is UNKNOWN, and UNKNOWN poisons whatever is built from it, so the reader
// never guesses: a `let` outside a body it runs, a global, a call into a module it was
// not handed, and a `const` the module mutates (push, splice, an index or length
// assignment): reading that one as its literal would be a guess about when it is read.

import ts from "typescript";

/** A value the reader cannot know from the source. */
export const UNKNOWN: unique symbol = Symbol("unknown");

/** The bindings in force: each binding's name node, mapped to its value. */
export type Env = ReadonlyMap<ts.Identifier, unknown>;

export type FunctionNode =
  | ts.ArrowFunction
  | ts.FunctionExpression
  | ts.FunctionDeclaration
  | ts.MethodDeclaration
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration
  | ts.ConstructorDeclaration;

/** A loop the reader enumerates: a for...of, a for...in, an indexed for, or an array method's callback. */
export type LoopNode = ts.ForOfStatement | ts.ForInStatement | ts.ForStatement | ts.ArrowFunction | ts.FunctionExpression;

/** A function written in a module, closed over the bindings in force where it was read, and the reader of its module. */
export class Closure {
  constructor(
    readonly node: FunctionNode,
    readonly env: Env,
    readonly reader: StaticReader,
  ) {}
}

/** A function (or a class, with `construct`) the caller's hooks hand the reader, called only with known arguments. */
export class Host {
  constructor(
    readonly call: (args: unknown[]) => unknown,
    readonly construct?: (args: unknown[]) => unknown,
  ) {}
}

export interface EvalHooks {
  /** The value of a name a module imports (`imported` is `default` or `*` for those forms), or UNKNOWN. */
  importValue?(specifier: string, imported: string): unknown;
  /** The value of `import.meta.<name>`, or UNKNOWN. */
  importMeta?(name: string): unknown;
  /** The value of a global the module does not declare (`__dirname`), or UNKNOWN. */
  global?(name: string): unknown;
  /** Whether the rows of a loop (or an array method's callback) are left unbound: the reader then knows nothing of its variables. */
  skipLoop?(loop: LoopNode): boolean;
}

/** One name a binding pattern binds, with the path from the bound value to it. */
interface BoundName {
  id: ts.Identifier;
  path: (string | number)[];
}

export type Binding =
  | { kind: "loop"; loop: ts.ForOfStatement | ts.ForInStatement | ts.ForStatement; id: ts.Identifier }
  | { kind: "param"; fn: FunctionNode; id: ts.Identifier }
  | { kind: "const"; decl: ts.VariableDeclaration; id: ts.Identifier; path: (string | number)[]; topLevel: boolean }
  // A `let`: known only where a function body the reader runs has assigned it.
  | { kind: "let"; decl: ts.VariableDeclaration; id: ts.Identifier }
  | { kind: "function"; decl: ts.FunctionDeclaration }
  | { kind: "import"; specifier: string; imported: string }
  // A `var`, a catch variable, a class or an enum: nothing the reader follows.
  | { kind: "opaque" };

/** The expression inside any parentheses, `as`, `satisfies`, `!` or `<T>`. */
export function unwrap(expr: ts.Expression): ts.Expression {
  let e = expr;
  while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e) || ts.isTypeAssertionExpression(e)) e = e.expression;
  return e;
}

/** The outermost wrapper around an expression: the node whose parent is where its value lands. */
export function outermost(node: ts.Node): ts.Node {
  let current = node;
  for (;;) {
    const parent = current.parent;
    if (
      parent &&
      (ts.isParenthesizedExpression(parent) || ts.isAsExpression(parent) || ts.isSatisfiesExpression(parent) || ts.isNonNullExpression(parent) || ts.isTypeAssertionExpression(parent)) &&
      parent.expression === current
    ) {
      current = parent;
    } else return current;
  }
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

export function isFunctionNode(node: ts.Node): node is FunctionNode {
  return (
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node) ||
    ts.isConstructorDeclaration(node)
  );
}

const isPrimitive = (v: unknown): v is string | number | boolean => typeof v === "string" || typeof v === "number" || typeof v === "boolean";
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Closure) && !(v instanceof Host) && !(v instanceof Set) && !(v instanceof Map) && !(v instanceof RegExp);

/** A member of a known value: an own property, an array index or length, a string's length, a Set's or Map's size; UNKNOWN otherwise. */
function member(value: unknown, key: unknown): unknown {
  if (value === UNKNOWN || key === UNKNOWN) return UNKNOWN;
  if (typeof key !== "string" && typeof key !== "number") return UNKNOWN;
  if (Array.isArray(value) || typeof value === "string") {
    if (key === "length") return value.length;
    return typeof key === "number" || /^\d+$/.test(key) ? value[Number(key)] : UNKNOWN;
  }
  if ((value instanceof Set || value instanceof Map) && key === "size") return value.size;
  if (isPlainObject(value)) return Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined;
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
  if (ts.isTypeReferenceNode(parent) || ts.isQualifiedName(parent) || ts.isTypeQueryNode(parent)) return false;
  const declares =
    ts.isVariableDeclaration(parent) || ts.isParameter(parent) || ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isClassDeclaration(parent) || ts.isPropertyDeclaration(parent);
  return !(declares && (parent as ts.NamedDeclaration).name === id);
}

/** The canonical counting loop, `for (let i = A; i < B; i++)`, whose body never writes `i`. */
export interface IndexedLoop {
  id: ts.Identifier;
  start: ts.Expression;
  end: ts.Expression;
  inclusive: boolean;
}

const isNamed = (e: ts.Expression | undefined, name: string): boolean => e !== undefined && ts.isIdentifier(unwrap(e)) && (unwrap(e) as ts.Identifier).text === name;
const isOne = (e: ts.Expression): boolean => ts.isNumericLiteral(unwrap(e)) && Number((unwrap(e) as ts.NumericLiteral).text) === 1;

/** Whether a node writes a name: an assignment, `++` or `--` whose target is that identifier. */
function writes(node: ts.Node, name: string): boolean {
  let found = false;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment && isNamed(n.left, name)) found = true;
    else if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken) && isNamed(n.operand, name)) {
      found = true;
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

/** The indexed loop a `for` statement is, or null for any other form. */
export function indexedLoop(loop: ts.ForStatement): IndexedLoop | null {
  const init = loop.initializer;
  if (!init || !ts.isVariableDeclarationList(init) || !(init.flags & ts.NodeFlags.Let) || init.declarations.length !== 1) return null;
  const decl = init.declarations[0];
  if (!ts.isIdentifier(decl.name) || !decl.initializer) return null;
  const name = decl.name.text;
  const cond = loop.condition ? unwrap(loop.condition) : undefined;
  if (!cond || !ts.isBinaryExpression(cond) || !isNamed(cond.left, name)) return null;
  const op = cond.operatorToken.kind;
  if (op !== ts.SyntaxKind.LessThanToken && op !== ts.SyntaxKind.LessThanEqualsToken) return null;
  const inc = loop.incrementor ? unwrap(loop.incrementor) : undefined;
  const byOne =
    inc !== undefined &&
    (((ts.isPostfixUnaryExpression(inc) || ts.isPrefixUnaryExpression(inc)) && inc.operator === ts.SyntaxKind.PlusPlusToken && isNamed(inc.operand, name)) ||
      (ts.isBinaryExpression(inc) &&
        isNamed(inc.left, name) &&
        ((inc.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken && isOne(inc.right)) ||
          (inc.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
            ts.isBinaryExpression(unwrap(inc.right)) &&
            (unwrap(inc.right) as ts.BinaryExpression).operatorToken.kind === ts.SyntaxKind.PlusToken &&
            isNamed((unwrap(inc.right) as ts.BinaryExpression).left, name) &&
            isOne((unwrap(inc.right) as ts.BinaryExpression).right)))));
  if (!byOne || writes(loop.statement, name)) return null;
  return { id: decl.name, start: decl.initializer, end: cond.right, inclusive: op === ts.SyntaxKind.LessThanEqualsToken };
}

/** The most loop rows the reader enumerates for one node before it gives up on it. */
export const ENV_LIMIT = 5000;

/** The most statements one evaluation runs before it gives up (a loop the reader cannot bound). */
const STEP_LIMIT = 200_000;

/** The array methods whose callback runs once per element, in order; the second group stops at the first row it decides. */
const EVERY_ROW = new Set(["forEach", "map", "flatMap", "filter"]);
const EARLY_STOP = new Set(["some", "every", "find", "findIndex", "findLast", "findLastIndex"]);

/** The methods that change the value they are called on. */
export const MUTATORS = new Set(["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin", "add", "delete", "clear", "set"]);
const OBJECT_MUTATORS: Record<string, string[]> = {
  Object: ["assign", "defineProperty", "defineProperties", "setPrototypeOf"],
  Reflect: ["set", "defineProperty", "deleteProperty", "setPrototypeOf"],
};

/**
 * Why the reader cannot be sure a node is reached the way a candidate says. A doubt that
 * `filters` may select among the rows (a guard or a condition it cannot read, a callback
 * that stops early): the values it leaves are not exactly the ones that occur. One that
 * does not is only about whether the code runs at all (an exported helper, a while loop,
 * a function handed on as a value): the values are what they are wherever it runs.
 */
export interface Doubt {
  why: string;
  filters: boolean;
}

/** One way a node is reached: the bindings in force, and the reader's doubt about it (null when there is none). */
export interface Candidate {
  env: Map<ts.Identifier, unknown>;
  doubt: Doubt | null;
}

/** What the reader could not read, appended to a reason. */
const because = (notes: string[]): string => (notes.length ? ` (${notes.join("; ")})` : "");

/** A doubt added to another: a doubt that filters wins, since it is the one that changes the values. */
function addDoubt(doubt: Doubt | null, why: string, filters: boolean): Doubt {
  if (!doubt || (filters && !doubt.filters)) return { why, filters };
  return doubt;
}

export interface Contexts {
  candidates: Candidate[];
  /** Why the reader gave up enumerating (the combinations passed ENV_LIMIT), or null. Set, the candidates are incomplete. */
  overflow: string | null;
}

/** What an expression comes to in one way it is reached. */
export interface ReachedValue {
  value: unknown;
  /** The reader's doubt about this way, or null. */
  doubt: Doubt | null;
  /** What the reader could not read while evaluating it (a mutated const), for the message of a fact that fails. */
  notes: string[];
}

type Completion = { kind: "normal" } | { kind: "return"; value: unknown } | { kind: "continue" } | { kind: "break" } | { kind: "unknown" };
const NORMAL: Completion = { kind: "normal" };
const UNKNOWN_COMPLETION: Completion = { kind: "unknown" };

type Role =
  | { kind: "named"; name: ts.Identifier; statement: ts.Node }
  | { kind: "callback"; call: ts.CallExpression; method: string }
  | { kind: "each"; call: ts.CallExpression; table: ts.Expression }
  | { kind: "iife"; call: ts.CallExpression }
  | { kind: "handed" }
  | { kind: "escapes"; why: string };

type Frame =
  | { kind: "loop"; loop: ts.ForOfStatement | ts.ForInStatement | ts.ForStatement }
  | { kind: "function"; fn: FunctionNode; role: Role }
  | { kind: "branch"; cond: ts.Expression; want: "truthy" | "falsy" | "nullish" }
  | { kind: "block"; container: ts.Node; before: ts.Statement[] }
  | { kind: "opaque"; why: string; filters: boolean };

type Jump = "continue" | "break" | "return" | "throw";
type StatementExit = { kind: "plain" } | { kind: "guard"; cond: ts.Expression; jump: Jump } | { kind: "jump"; jump: Jump } | { kind: "complex" };

class StepLimit extends Error {}

export class StaticReader {
  private readonly bindings = new Map<ts.Identifier, Binding | null>();
  private readonly topLevel = new Map<ts.VariableDeclaration, { value: unknown; notes: string[] }>();
  private readonly evaluating = new Set<ts.Node>();
  private readonly entries = new Map<FunctionNode, { candidates: Candidate[]; overflow: string | null }>();
  private readonly computing = new Set<FunctionNode>();
  private readonly sites = new Map<FunctionNode, { sites: ts.CallExpression[]; escapes: string[] }>();
  private readonly reads = new Map<ts.Node, Set<ts.Identifier>>();
  private readonly free = new Map<FunctionNode, Set<ts.Identifier>>();
  /** Values a function body the reader runs made itself, so its mutators may change them. */
  private readonly fresh = new WeakSet<object>();
  private readonly valueIds = new WeakMap<object, number>();
  private mutations: Map<ts.Identifier, ts.Node> | null = null;
  private notes: string[] | null = null;
  private depth = 0;
  private steps = 0;

  constructor(
    readonly sf: ts.SourceFile,
    readonly hooks: EvalHooks = {},
  ) {}

  /** `line N` of a node, for a message. */
  at(node: ts.Node): string {
    return `line ${this.sf.getLineAndCharacterOfPosition(node.getStart(this.sf)).line + 1}`;
  }

  /** What a name refers to where it is read, or null for a global. */
  resolve(id: ts.Identifier): Binding | null {
    if (!this.bindings.has(id)) this.bindings.set(id, this.lookup(id));
    return this.bindings.get(id)!;
  }

  private lookup(id: ts.Identifier): Binding | null {
    const name = id.text;
    for (let node: ts.Node = id; node.parent; node = node.parent) {
      const scope = node.parent;
      if (ts.isForOfStatement(scope) || ts.isForInStatement(scope)) {
        const init = scope.initializer;
        if (node === scope.statement && ts.isVariableDeclarationList(init)) {
          for (const decl of init.declarations) {
            if (!boundNames(decl.name).some((b) => b.id.text === name)) continue;
            // Only a `const` row is a known row; a `let` may be reassigned.
            const bound = boundNames(decl.name).find((b) => b.id.text === name)!;
            return (init.flags & ts.NodeFlags.Const) !== 0 ? { kind: "loop", loop: scope, id: bound.id } : { kind: "opaque" };
          }
        }
      }
      if (ts.isForStatement(scope) && node !== scope.initializer) {
        const init = scope.initializer;
        if (init && ts.isVariableDeclarationList(init)) {
          for (const decl of init.declarations) {
            if (!boundNames(decl.name).some((b) => b.id.text === name)) continue;
            const indexed = indexedLoop(scope);
            return indexed && indexed.id.text === name ? { kind: "loop", loop: scope, id: indexed.id } : { kind: "opaque" };
          }
        }
      }
      if (ts.isFunctionLike(scope)) {
        for (const param of scope.parameters) {
          const bound = boundNames(param.name).find((b) => b.id.text === name);
          if (bound) return isFunctionNode(scope) ? { kind: "param", fn: scope, id: bound.id } : { kind: "opaque" };
        }
        // A function expression's own name is the function.
        if (ts.isFunctionExpression(scope) && scope.name?.text === name && node !== scope.name) return { kind: "opaque" };
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
        const flags = s.declarationList.flags;
        for (const decl of s.declarationList.declarations) {
          const bound = boundNames(decl.name).find((b) => b.id.text === name);
          if (!bound) continue;
          if (flags & ts.NodeFlags.Const) return { kind: "const", decl, id: bound.id, path: bound.path, topLevel: ts.isSourceFile(s.parent) };
          if (flags & ts.NodeFlags.Let && ts.isIdentifier(decl.name)) return { kind: "let", decl, id: bound.id };
          return { kind: "opaque" };
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

  // ---------- mutation ----------

  /** Where the module first mutates a const (or the rows of a loop over it), keyed by the const's name node. */
  mutationOf(id: ts.Identifier): ts.Node | undefined {
    if (!this.mutations) this.mutations = this.findMutations();
    return this.mutations.get(id);
  }

  /** The identifier a member chain starts from (`a` of `a.b[c]`), or null for a chain that starts at a call or a literal. */
  private baseOf(expr: ts.Expression): ts.Identifier | null {
    let e = unwrap(expr);
    while (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) e = unwrap(e.expression);
    return ts.isIdentifier(e) ? e : null;
  }

  private findMutations(): Map<ts.Identifier, ts.Node> {
    const out = new Map<ts.Identifier, ts.Node>();
    const mark = (base: ts.Identifier | null, site: ts.Node, seen = new Set<ts.Node>()): void => {
      if (!base) return;
      const b = this.resolve(base);
      if (b?.kind === "const" && !out.has(b.id)) out.set(b.id, site);
      // A row of a loop over a const is the const's own element.
      else if (b?.kind === "loop" && ts.isForOfStatement(b.loop) && !seen.has(b.loop)) mark(this.baseOf(b.loop.expression), site, new Set([...seen, b.loop]));
    };
    const visit = (n: ts.Node): void => {
      if (ts.isCallExpression(n)) {
        const callee = unwrap(n.expression);
        if (ts.isPropertyAccessExpression(callee)) {
          if (MUTATORS.has(callee.name.text)) mark(this.baseOf(callee.expression), n);
          const owner = unwrap(callee.expression);
          if (ts.isIdentifier(owner) && OBJECT_MUTATORS[owner.text]?.includes(callee.name.text) && !this.resolve(owner) && n.arguments[0]) mark(this.baseOf(n.arguments[0]), n);
        }
      } else if (ts.isBinaryExpression(n) && n.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && n.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
        const target = unwrap(n.left);
        if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) mark(this.baseOf(target), n);
      } else if ((ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) && (n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken)) {
        const target = unwrap(n.operand);
        if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) mark(this.baseOf(target), n);
      } else if (ts.isDeleteExpression(n)) mark(this.baseOf(n.expression), n);
      ts.forEachChild(n, visit);
    };
    visit(this.sf);
    return out;
  }

  // ---------- values ----------

  /** Run a function, collecting what the reader could not read on the way (for a message). */
  private noting<T>(fn: () => T): { value: T; notes: string[] } {
    const outer = this.notes;
    const mine: string[] = [];
    this.notes = mine;
    try {
      const value = fn();
      return { value, notes: [...new Set(mine)] };
    } finally {
      this.notes = outer;
      outer?.push(...mine);
    }
  }

  private note(text: string): void {
    this.notes?.push(text);
  }

  /** What an expression comes to under the given bindings, or UNKNOWN. */
  evaluate(expr: ts.Expression, env: Env = new Map()): unknown {
    if (this.depth > 200) return UNKNOWN;
    if (this.depth === 0) this.steps = 0;
    this.depth++;
    try {
      return this.read(expr, env);
    } catch {
      // A step limit, or a host that threw: either way the value is not known.
      return UNKNOWN;
    } finally {
      this.depth--;
    }
  }

  private made<T extends object>(value: T): T {
    this.fresh.add(value);
    return value;
  }

  private read(expr: ts.Expression, env: Env): unknown {
    const e = unwrap(expr);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
    if (ts.isNumericLiteral(e)) return Number(e.text);
    if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (e.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isRegularExpressionLiteral(e)) {
      const slash = e.text.lastIndexOf("/");
      try {
        return new RegExp(e.text.slice(1, slash), e.text.slice(slash + 1));
      } catch {
        return UNKNOWN;
      }
    }
    if (ts.isTemplateExpression(e)) {
      let text = e.head.text;
      for (const span of e.templateSpans) {
        const v = this.evaluate(span.expression, env);
        if (!isPrimitive(v) && v !== null && v !== undefined) return UNKNOWN;
        text += String(v) + span.literal.text;
      }
      return text;
    }
    if (ts.isIdentifier(e)) {
      const binding = this.resolve(e);
      if (binding) return this.valueOf(binding, env);
      if (e.text === "undefined") return undefined;
      const global = this.hooks.global?.(e.text);
      return global === undefined ? UNKNOWN : global;
    }
    if (ts.isPropertyAccessExpression(e)) {
      if (ts.isMetaProperty(e.expression) && e.expression.keywordToken === ts.SyntaxKind.ImportKeyword) {
        const meta = this.hooks.importMeta?.(e.name.text);
        return meta === undefined ? UNKNOWN : meta;
      }
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
          const items = spreadOf(v);
          if (!items) return UNKNOWN;
          out.push(...items);
        } else out.push(ts.isOmittedExpression(el) ? undefined : this.evaluate(el, env));
      }
      return this.made(out);
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
      if (e.operator === ts.SyntaxKind.PlusToken && (typeof v === "number" || typeof v === "string")) return Number(v);
      return UNKNOWN;
    }
    if (ts.isTypeOfExpression(e)) {
      const v = this.evaluate(e.expression, env);
      return v === UNKNOWN ? UNKNOWN : v instanceof Closure || v instanceof Host ? "function" : typeof v;
    }
    if (ts.isVoidExpression(e)) return undefined;
    if (ts.isAwaitExpression(e)) return this.evaluate(e.expression, env);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return new Closure(e, env, this);
    if (ts.isCallExpression(e)) return this.call(e, env);
    if (ts.isNewExpression(e)) return this.construct(e, env);
    return UNKNOWN;
  }

  private construct(e: ts.NewExpression, env: Env): unknown {
    const callee = unwrap(e.expression);
    const args = this.args(e.arguments ?? ts.factory.createNodeArray(), env);
    if (!args) return UNKNOWN;
    if (ts.isIdentifier(callee) && !this.resolve(callee)) {
      if (callee.text === "Set") {
        const items = args.length ? spreadOf(args[0]) : [];
        return items && !items.includes(UNKNOWN) ? this.made(new Set(items)) : UNKNOWN;
      }
      if (callee.text === "Map") {
        const items = args.length ? spreadOf(args[0]) : [];
        if (!items || !items.every((pair) => Array.isArray(pair) && pair.length === 2 && !pair.includes(UNKNOWN))) return UNKNOWN;
        return this.made(new Map(items as [unknown, unknown][]));
      }
    }
    const cls = this.evaluate(callee, env);
    return cls instanceof Host && cls.construct && !args.includes(UNKNOWN) ? cls.construct(args) : UNKNOWN;
  }

  private object(e: ts.ObjectLiteralExpression, env: Env): unknown {
    const out: Record<string, unknown> = {};
    for (const p of e.properties) {
      if (ts.isSpreadAssignment(p)) {
        const v = this.evaluate(p.expression, env);
        if (v === undefined || v === null) continue;
        if (!isPlainObject(v)) return UNKNOWN;
        Object.assign(out, v);
        continue;
      }
      const name = p.name;
      const key = ts.isComputedPropertyName(name) ? this.evaluate(name.expression, env) : ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : UNKNOWN;
      if (typeof key !== "string" && typeof key !== "number") return UNKNOWN;
      if (ts.isPropertyAssignment(p)) out[key] = this.evaluate(p.initializer, env);
      else if (ts.isShorthandPropertyAssignment(p)) out[key] = this.evaluate(p.name, env);
      else if (ts.isMethodDeclaration(p)) out[key] = new Closure(p, env, this);
      else out[key] = UNKNOWN;
    }
    return this.made(out);
  }

  private binary(e: ts.BinaryExpression, env: Env): unknown {
    const op = e.operatorToken.kind;
    if (op >= ts.SyntaxKind.FirstAssignment && op <= ts.SyntaxKind.LastAssignment) return UNKNOWN;
    const left = this.evaluate(e.left, env);
    if (left === UNKNOWN) return UNKNOWN;
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) return left ? this.evaluate(e.right, env) : left;
    if (op === ts.SyntaxKind.BarBarToken) return left ? left : this.evaluate(e.right, env);
    if (op === ts.SyntaxKind.QuestionQuestionToken) return left ?? this.evaluate(e.right, env);
    const right = this.evaluate(e.right, env);
    if (right === UNKNOWN) return UNKNOWN;
    const numbers = typeof left === "number" && typeof right === "number";
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
      case ts.SyntaxKind.MinusToken:
        return numbers ? left - right : UNKNOWN;
      case ts.SyntaxKind.AsteriskToken:
        return numbers ? left * right : UNKNOWN;
      case ts.SyntaxKind.SlashToken:
        return numbers ? left / right : UNKNOWN;
      case ts.SyntaxKind.PercentToken:
        return numbers ? left % right : UNKNOWN;
      case ts.SyntaxKind.LessThanToken:
        return numbers || (typeof left === "string" && typeof right === "string") ? (left as number) < (right as number) : UNKNOWN;
      case ts.SyntaxKind.LessThanEqualsToken:
        return numbers || (typeof left === "string" && typeof right === "string") ? (left as number) <= (right as number) : UNKNOWN;
      case ts.SyntaxKind.GreaterThanToken:
        return numbers || (typeof left === "string" && typeof right === "string") ? (left as number) > (right as number) : UNKNOWN;
      case ts.SyntaxKind.GreaterThanEqualsToken:
        return numbers || (typeof left === "string" && typeof right === "string") ? (left as number) >= (right as number) : UNKNOWN;
      case ts.SyntaxKind.InKeyword:
        return typeof left === "string" && isPlainObject(right) ? Object.prototype.hasOwnProperty.call(right, left) : UNKNOWN;
      default:
        return UNKNOWN;
    }
  }

  private valueOf(binding: Binding, env: Env): unknown {
    switch (binding.kind) {
      case "loop":
      case "param":
      case "let":
        return env.has(binding.id) ? env.get(binding.id) : UNKNOWN;
      case "function":
        return new Closure(binding.decl, env, this);
      case "import": {
        const value = this.hooks.importValue?.(binding.specifier, binding.imported);
        return value === undefined ? UNKNOWN : value;
      }
      case "opaque":
        return UNKNOWN;
      case "const": {
        // A body the reader runs binds its consts as it goes.
        if (env.has(binding.id)) return env.get(binding.id);
        const { decl } = binding;
        if (!decl.initializer || this.evaluating.has(decl)) return UNKNOWN;
        const site = this.mutationOf(binding.id);
        if (site) {
          this.note(`${binding.id.text} (${this.at(binding.id)}) is changed at ${this.at(site)}, so it is not read as its literal`);
          return UNKNOWN;
        }
        // A module-level const reads no loop or parameter, so its value is read once.
        const cached = binding.topLevel ? this.topLevel.get(decl) : undefined;
        if (cached) {
          for (const text of cached.notes) this.note(text);
          return pick(cached.value, binding.path);
        }
        this.evaluating.add(decl);
        try {
          const { value, notes } = this.noting(() => this.evaluate(decl.initializer!, binding.topLevel ? new Map() : env));
          if (binding.topLevel) {
            this.share(value);
            this.topLevel.set(decl, { value, notes });
          }
          return pick(value, binding.path);
        } finally {
          this.evaluating.delete(decl);
        }
      }
    }
  }

  /** Mark a value read once and shared as one that no body may change. */
  private share(value: unknown, seen = new Set<unknown>()): void {
    if (value === null || typeof value !== "object" || seen.has(value) || value instanceof Closure || value instanceof Host) return;
    seen.add(value);
    this.fresh.delete(value);
    const items = Array.isArray(value) ? value : value instanceof Set ? [...value] : value instanceof Map ? [...value.values()] : isPlainObject(value) ? Object.values(value) : [];
    for (const item of items) this.share(item, seen);
  }

  private args(nodes: ts.NodeArray<ts.Expression>, env: Env): unknown[] | null {
    const out: unknown[] = [];
    for (const arg of nodes) {
      if (ts.isSpreadElement(arg)) {
        const items = spreadOf(this.evaluate(arg.expression, env));
        if (!items) return null;
        out.push(...items);
      } else out.push(this.evaluate(arg, env));
    }
    return out;
  }

  private call(e: ts.CallExpression, env: Env): unknown {
    const callee = unwrap(e.expression);
    const args = (): unknown[] => this.args(e.arguments, env) ?? [UNKNOWN];
    if (ts.isPropertyAccessExpression(callee)) {
      const method = callee.name.text;
      const owner = unwrap(callee.expression);
      if (ts.isIdentifier(owner) && !this.resolve(owner)) {
        const builtin = this.builtin(owner.text, method, e, env);
        if (builtin !== NOT_BUILTIN) return builtin;
      }
      const receiver = this.evaluate(callee.expression, env);
      if (receiver === UNKNOWN) return UNKNOWN;
      if ((receiver === null || receiver === undefined) && callee.questionDotToken) return undefined;
      if (Array.isArray(receiver)) return this.arrayMethod(receiver, method, args());
      if (typeof receiver === "string") return stringMethod(receiver, method, args());
      if (receiver instanceof RegExp) return regexMethod(receiver, method, args());
      if (receiver instanceof Set) {
        const [value] = args();
        if (method === "has") return value === UNKNOWN ? UNKNOWN : receiver.has(value);
        if (method === "values" || method === "keys") return this.made([...receiver]);
        return UNKNOWN;
      }
      if (receiver instanceof Map) {
        const [key] = args();
        if (method === "has" || method === "get") return key === UNKNOWN ? UNKNOWN : receiver[method](key);
        if (method === "keys") return this.made([...receiver.keys()]);
        if (method === "values") return this.made([...receiver.values()]);
        if (method === "entries") return this.made([...receiver.entries()].map((pair) => this.made(pair)));
        return UNKNOWN;
      }
      const fn = member(receiver, method);
      return fn instanceof Closure || fn instanceof Host ? this.apply(fn, args()) : UNKNOWN;
    }
    if (ts.isIdentifier(callee) && !this.resolve(callee) && ["String", "Number", "Boolean"].includes(callee.text)) {
      const [value] = args();
      if (value === UNKNOWN || (value !== null && typeof value === "object")) return UNKNOWN;
      return callee.text === "String" ? String(value) : callee.text === "Number" ? Number(value) : Boolean(value);
    }
    const fn = this.evaluate(callee, env);
    if ((fn === null || fn === undefined) && e.questionDotToken) return undefined;
    return fn instanceof Closure || fn instanceof Host ? this.apply(fn, args()) : UNKNOWN;
  }

  /** `Object.entries`, `Array.from` and the like: a global's static method, or NOT_BUILTIN. */
  private builtin(owner: string, method: string, e: ts.CallExpression, env: Env): unknown {
    const args = (): unknown[] => this.args(e.arguments, env) ?? [UNKNOWN];
    if (owner === "Object") {
      if (["entries", "keys", "values"].includes(method)) {
        const [target] = args();
        if (Array.isArray(target)) return this.made(method === "keys" ? target.map((_, i) => String(i)) : method === "values" ? [...target] : target.map((v, i) => this.made([String(i), v])));
        if (!isPlainObject(target)) return UNKNOWN;
        return this.made(method === "entries" ? Object.entries(target).map((pair) => this.made(pair)) : method === "keys" ? Object.keys(target) : Object.values(target));
      }
      if (method === "fromEntries") {
        const [pairs] = args();
        const items = spreadOf(pairs);
        if (!items || !items.every((p) => Array.isArray(p) && (typeof p[0] === "string" || typeof p[0] === "number"))) return UNKNOWN;
        return this.made(Object.fromEntries(items as [string, unknown][]));
      }
      if (method === "assign") {
        // Only into a fresh literal: anything else changes a value the reader may have shared.
        const target = e.arguments[0] ? unwrap(e.arguments[0]) : undefined;
        if (!target || !ts.isObjectLiteralExpression(target)) return UNKNOWN;
        const [base, ...rest] = args();
        if (!isPlainObject(base) || !rest.every((v) => v === undefined || v === null || isPlainObject(v))) return UNKNOWN;
        return this.made(Object.assign({}, base, ...rest));
      }
      return UNKNOWN;
    }
    if (owner === "Array") {
      if (method === "isArray") {
        const [v] = args();
        return v === UNKNOWN ? UNKNOWN : Array.isArray(v);
      }
      if (method === "from") {
        const [source, mapFn] = args();
        const items = spreadOf(source) ?? (isPlainObject(source) && typeof source.length === "number" ? Array.from({ length: source.length }, () => undefined) : null);
        if (!items) return UNKNOWN;
        return this.made(mapFn === undefined ? [...items] : items.map((item, i) => this.apply(mapFn, [item, i])));
      }
      if (method === "of") return this.made([...args()]);
      return UNKNOWN;
    }
    return NOT_BUILTIN;
  }

  private arrayMethod(arr: unknown[], method: string, given: unknown[]): unknown {
    const [first, second] = given;
    const each = (fn: unknown): unknown[] => arr.map((el, i) => this.apply(fn, [el, i, arr]));
    switch (method) {
      case "filter":
      case "find":
      case "findLast":
      case "findIndex":
      case "findLastIndex":
      case "some":
      case "every": {
        // A predicate the reader cannot read for one row leaves the whole result unknown.
        const results = each(first);
        if (results.includes(UNKNOWN)) return UNKNOWN;
        if (method === "filter") return this.made(arr.filter((_, i) => results[i]));
        const last = results.map(Boolean).lastIndexOf(true);
        if (method === "find") return arr.find((_, i) => results[i]);
        if (method === "findLast") return last === -1 ? undefined : arr[last];
        if (method === "findIndex") return arr.findIndex((_, i) => results[i]);
        if (method === "findLastIndex") return last;
        return method === "some" ? results.some(Boolean) : results.every(Boolean);
      }
      case "map":
        return this.made(each(first));
      case "forEach":
        each(first);
        return undefined;
      case "flatMap": {
        const results = each(first);
        return results.includes(UNKNOWN) ? UNKNOWN : this.made(results.flatMap((r) => r));
      }
      case "reduce": {
        if (given.length < 2) return UNKNOWN;
        let acc = second;
        for (let i = 0; i < arr.length; i++) acc = this.apply(first, [acc, arr[i], i, arr]);
        return acc;
      }
      case "includes":
        return first === UNKNOWN ? UNKNOWN : arr.includes(first);
      case "indexOf":
        return first === UNKNOWN ? UNKNOWN : arr.indexOf(first);
      case "lastIndexOf":
        return first === UNKNOWN ? UNKNOWN : arr.lastIndexOf(first);
      case "join":
        return arr.every((v) => isPrimitive(v) || v === null || v === undefined) && (first === undefined || typeof first === "string") ? arr.join(first) : UNKNOWN;
      case "slice":
        return (first === undefined || typeof first === "number") && (second === undefined || typeof second === "number") ? this.made(arr.slice(first, second)) : UNKNOWN;
      case "concat": {
        const out = [...arr];
        for (const v of given) {
          if (v === UNKNOWN) return UNKNOWN;
          if (Array.isArray(v)) out.push(...v);
          else out.push(v);
        }
        return this.made(out);
      }
      case "flat":
        return first === undefined || typeof first === "number" ? this.made(arr.flat((first as number | undefined) ?? 1)) : UNKNOWN;
      case "at":
        return typeof first === "number" ? arr.at(first) : UNKNOWN;
      case "reverse":
        // A copy: the reader never changes a value in place outside a body it runs.
        return this.made([...arr].reverse());
      case "sort": {
        const copy = [...arr];
        if (first === undefined) {
          if (!copy.every((v) => typeof v === "string" || typeof v === "number")) return UNKNOWN;
          return this.made(copy.sort());
        }
        let unknown = false;
        copy.sort((a, b) => {
          const r = this.apply(first, [a, b]);
          if (typeof r !== "number") unknown = true;
          return typeof r === "number" ? r : 0;
        });
        return unknown ? UNKNOWN : this.made(copy);
      }
      case "keys":
        return this.made(arr.map((_, i) => i));
      case "values":
        return this.made([...arr]);
      case "entries":
        return this.made(arr.map((v, i) => this.made([i, v])));
      default:
        return UNKNOWN;
    }
  }

  /** Call a function written in a module, or one the hooks handed over, with these arguments. */
  apply(fn: unknown, args: unknown[]): unknown {
    if (fn instanceof Host) return args.includes(UNKNOWN) ? UNKNOWN : fn.call(args);
    if (!(fn instanceof Closure)) return UNKNOWN;
    if (fn.reader !== this) return fn.reader.apply(fn, args);
    if (this.depth > 200) return UNKNOWN;
    if (this.depth === 0) this.steps = 0;
    this.depth++;
    try {
      const { node } = fn;
      const env = new Map(fn.env);
      this.bindParams(node, args, env);
      const body = node.body;
      if (!body) return UNKNOWN;
      if (!ts.isBlock(body)) return this.evaluate(body, env);
      const done = this.run(body.statements, env);
      return done.kind === "return" ? done.value : done.kind === "normal" ? undefined : UNKNOWN;
    } catch (error) {
      if (error instanceof StepLimit) return UNKNOWN;
      throw error;
    } finally {
      this.depth--;
    }
  }

  private bindParams(node: FunctionNode, args: unknown[], env: Map<ts.Identifier, unknown>): void {
    node.parameters.forEach((param, i) => {
      const value = param.dotDotDotToken ? args.slice(i) : args[i] === undefined && param.initializer ? this.evaluate(param.initializer, env) : args[i];
      for (const bound of boundNames(param.name)) env.set(bound.id, pick(value, bound.path));
    });
  }

  // ---------- running a body ----------

  private run(statements: readonly ts.Statement[], env: Map<ts.Identifier, unknown>): Completion {
    for (const s of statements) {
      const done = this.exec(s, env);
      if (done.kind !== "normal") return done;
    }
    return NORMAL;
  }

  private exec(s: ts.Statement, env: Map<ts.Identifier, unknown>): Completion {
    if (++this.steps > STEP_LIMIT) throw new StepLimit();
    if (ts.isVariableStatement(s)) {
      if (!(s.declarationList.flags & (ts.NodeFlags.Const | ts.NodeFlags.Let))) return UNKNOWN_COMPLETION;
      for (const decl of s.declarationList.declarations) {
        const value = decl.initializer ? this.evaluate(decl.initializer, env) : undefined;
        for (const bound of boundNames(decl.name)) env.set(bound.id, pick(value, bound.path));
      }
      return NORMAL;
    }
    if (ts.isExpressionStatement(s)) return this.effect(s.expression, env);
    if (ts.isIfStatement(s)) {
      const test = this.evaluate(s.expression, env);
      if (test === UNKNOWN) return UNKNOWN_COMPLETION;
      if (test) return this.exec(s.thenStatement, env);
      return s.elseStatement ? this.exec(s.elseStatement, env) : NORMAL;
    }
    if (ts.isBlock(s)) return this.run(s.statements, env);
    if (ts.isReturnStatement(s)) return { kind: "return", value: s.expression ? this.evaluate(s.expression, env) : undefined };
    if (ts.isContinueStatement(s)) return s.label ? UNKNOWN_COMPLETION : { kind: "continue" };
    if (ts.isBreakStatement(s)) return s.label ? UNKNOWN_COMPLETION : { kind: "break" };
    if (ts.isForOfStatement(s) || ts.isForInStatement(s) || ts.isForStatement(s)) {
      if (ts.isForStatement(s) && !indexedLoop(s)) return UNKNOWN_COMPLETION;
      const rows = this.rowsOf(s, env);
      if (!rows) return UNKNOWN_COMPLETION;
      const ids = this.loopIds(s);
      for (const row of rows) {
        const inner = new Map(env);
        this.bindRow(s, row, inner);
        const done = this.exec(s.statement, inner);
        // A let of the enclosing body assigned in the loop keeps its value.
        for (const [id, value] of inner) if (env.has(id) && !ids.has(id)) env.set(id, value);
        if (done.kind === "break") break;
        if (done.kind === "continue" || done.kind === "normal") continue;
        return done;
      }
      return NORMAL;
    }
    if (ts.isFunctionDeclaration(s) || ts.isEmptyStatement(s) || ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s)) return NORMAL;
    if (ts.isTryStatement(s) && !s.catchClause) {
      const done = this.run(s.tryBlock.statements, env);
      if (s.finallyBlock) {
        const after = this.run(s.finallyBlock.statements, env);
        if (after.kind !== "normal") return after;
      }
      return done;
    }
    // A throw, a while loop, a switch, a try with a catch: not followed.
    return UNKNOWN_COMPLETION;
  }

  /** The binding a name in a body refers to, when the body owns it (a const or let it declared). */
  private ownedBinding(id: ts.Identifier, env: Map<ts.Identifier, unknown>): ts.Identifier | null {
    const b = this.resolve(id);
    return (b?.kind === "const" || b?.kind === "let") && env.has(b.id) ? b.id : null;
  }

  /** The value names a node reads that a body owns: what an unknown call may change. */
  private ownedReads(node: ts.Node, env: Map<ts.Identifier, unknown>): ts.Identifier[] {
    const out: ts.Identifier[] = [];
    const visit = (n: ts.Node): void => {
      if (ts.isIdentifier(n) && isValueRead(n)) {
        const owned = this.ownedBinding(n, env);
        if (owned) out.push(owned);
      }
      ts.forEachChild(n, visit);
    };
    visit(node);
    return out;
  }

  private effect(expr: ts.Expression, env: Map<ts.Identifier, unknown>): Completion {
    let e = unwrap(expr);
    if (ts.isAwaitExpression(e)) e = unwrap(e.expression);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && e.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      const target = unwrap(e.left);
      if (ts.isIdentifier(target)) {
        const b = this.resolve(target);
        if (b?.kind === "let" && env.has(b.id)) {
          const right = this.evaluate(e.right, env);
          const current = env.get(b.id);
          const op = e.operatorToken.kind;
          let next: unknown = UNKNOWN;
          if (op === ts.SyntaxKind.EqualsToken) next = right;
          else if (op === ts.SyntaxKind.PlusEqualsToken && isPrimitive(current) && isPrimitive(right)) next = (current as string) + (right as string);
          else if (op === ts.SyntaxKind.MinusEqualsToken && typeof current === "number" && typeof right === "number") next = current - right;
          env.set(b.id, next);
        }
        return NORMAL;
      }
      // A member of a value the body made: set it; of anything else: that value is no longer known.
      const base = this.baseOf(target);
      const owned = base ? this.ownedBinding(base, env) : null;
      if (owned) env.set(owned, UNKNOWN);
      return NORMAL;
    }
    if ((ts.isPrefixUnaryExpression(e) || ts.isPostfixUnaryExpression(e)) && (e.operator === ts.SyntaxKind.PlusPlusToken || e.operator === ts.SyntaxKind.MinusMinusToken)) {
      const target = unwrap(e.operand);
      if (ts.isIdentifier(target)) {
        const b = this.resolve(target);
        if (b?.kind === "let" && env.has(b.id)) {
          const current = env.get(b.id);
          env.set(b.id, typeof current === "number" ? current + (e.operator === ts.SyntaxKind.PlusPlusToken ? 1 : -1) : UNKNOWN);
        }
      }
      return NORMAL;
    }
    if (ts.isCallExpression(e)) {
      const callee = unwrap(e.expression);
      if (ts.isPropertyAccessExpression(callee) && MUTATORS.has(callee.name.text)) {
        const base = this.baseOf(callee.expression);
        const owned = base ? this.ownedBinding(base, env) : null;
        if (owned) {
          const receiver = this.evaluate(callee.expression, env);
          const args = this.args(e.arguments, env);
          if (!args || args.includes(UNKNOWN) || !this.mutate(receiver, callee.name.text, args)) env.set(owned, UNKNOWN);
        }
        return NORMAL;
      }
      const fn = this.evaluate(callee, env);
      if (fn instanceof Closure) {
        // A function of the module: run it, so what it changes in a value the body made is changed.
        this.apply(fn, this.args(e.arguments, env) ?? [UNKNOWN]);
        return NORMAL;
      }
      // A call the reader does not follow may change any value the body made that it is handed.
      if (!(fn instanceof Host)) for (const owned of this.ownedReads(e, env)) env.set(owned, UNKNOWN);
      return NORMAL;
    }
    return NORMAL;
  }

  /** Apply a mutator to a value a body made; false when the value is not one the body may change. */
  private mutate(receiver: unknown, method: string, args: unknown[]): boolean {
    if (receiver === null || typeof receiver !== "object" || !this.fresh.has(receiver)) return false;
    if (Array.isArray(receiver)) {
      if (method === "push") receiver.push(...args);
      else if (method === "unshift") receiver.unshift(...args);
      else if (method === "pop") receiver.pop();
      else if (method === "shift") receiver.shift();
      else return false;
      return true;
    }
    if (receiver instanceof Set) {
      if (method === "add") receiver.add(args[0]);
      else if (method === "delete") receiver.delete(args[0]);
      else if (method === "clear") receiver.clear();
      else return false;
      return true;
    }
    if (receiver instanceof Map) {
      if (method === "set") receiver.set(args[0], args[1]);
      else if (method === "delete") receiver.delete(args[0]);
      else if (method === "clear") receiver.clear();
      else return false;
      return true;
    }
    return false;
  }

  // ---------- loops ----------

  /** The names a loop binds per row. */
  private loopIds(loop: ts.ForOfStatement | ts.ForInStatement | ts.ForStatement): Set<ts.Identifier> {
    if (ts.isForStatement(loop)) {
      const indexed = indexedLoop(loop);
      return new Set(indexed ? [indexed.id] : []);
    }
    const init = loop.initializer;
    return new Set(ts.isVariableDeclarationList(init) ? init.declarations.flatMap((d) => boundNames(d.name).map((b) => b.id)) : []);
  }

  /** The rows of a loop under these bindings, or null when they cannot be known. */
  rowsOf(loop: ts.ForOfStatement | ts.ForInStatement | ts.ForStatement, env: Env): unknown[] | null {
    if (ts.isForStatement(loop)) {
      const indexed = indexedLoop(loop);
      if (!indexed) return null;
      const start = this.evaluate(indexed.start, env);
      const end = this.evaluate(indexed.end, env);
      if (typeof start !== "number" || typeof end !== "number" || !Number.isInteger(start) || !Number.isFinite(end)) return null;
      const last = indexed.inclusive ? end : end - 1;
      if (last - start > ENV_LIMIT) return null;
      const out: number[] = [];
      for (let i = start; i <= last; i++) out.push(i);
      return out;
    }
    const value = this.evaluate(loop.expression, env);
    if (ts.isForInStatement(loop)) {
      if (Array.isArray(value)) return value.map((_, i) => String(i));
      return isPlainObject(value) ? Object.keys(value) : null;
    }
    return spreadOf(value);
  }

  /** Bind a loop's variables to one of its rows. */
  bindRow(loop: ts.ForOfStatement | ts.ForInStatement | ts.ForStatement, row: unknown, env: Map<ts.Identifier, unknown>): void {
    if (ts.isForStatement(loop)) {
      const indexed = indexedLoop(loop);
      if (indexed) env.set(indexed.id, row);
      return;
    }
    const init = loop.initializer;
    if (!ts.isVariableDeclarationList(init)) return;
    for (const decl of init.declarations) for (const bound of boundNames(decl.name)) env.set(bound.id, pick(row, bound.path));
  }

  // ---------- where a node is reached ----------

  /** The binding names (loop rows, parameters, lets) a node reads, through the consts and local functions it reads. */
  idsRead(node: ts.Node): Set<ts.Identifier> {
    const cached = this.reads.get(node);
    if (cached) return cached;
    const out = new Set<ts.Identifier>();
    const seen = new Set<ts.Node>();
    const visit = (n: ts.Node): void => {
      if (ts.isTypeNode(n)) return;
      if (ts.isIdentifier(n) && isValueRead(n)) {
        const b = this.resolve(n);
        if (b?.kind === "loop" || b?.kind === "param" || b?.kind === "let") out.add(b.id);
        else if (b?.kind === "const" && !b.topLevel && !seen.has(b.decl)) {
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
    this.reads.set(node, out);
    return out;
  }

  /** What a function reads from outside itself: the loop rows, parameters and lets of the scopes around it. */
  private freeIds(fn: FunctionNode): Set<ts.Identifier> {
    let out = this.free.get(fn);
    if (!out) {
      out = new Set([...this.idsRead(fn)].filter((id) => !isInside(id, fn)));
      this.free.set(fn, out);
    }
    return out;
  }

  /** How a function is reached: by name, per element of an array method, called in place, handed to a call, or escaping as a value. */
  private roleOf(fn: FunctionNode): Role {
    if (ts.isFunctionDeclaration(fn)) {
      if (!fn.name) return { kind: "escapes", why: `${this.at(fn)}: a default-exported function the reader cannot see called` };
      return { kind: "named", name: fn.name, statement: fn };
    }
    if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) return { kind: "escapes", why: `${this.at(fn)}: a method the reader cannot see called` };
    const outer = outermost(fn);
    const parent = outer.parent;
    if (ts.isVariableDeclaration(parent) && parent.initializer === outer && ts.isIdentifier(parent.name) && parent.parent.flags & ts.NodeFlags.Const) {
      return { kind: "named", name: parent.name, statement: parent.parent.parent };
    }
    if (ts.isCallExpression(parent)) {
      if (parent.expression === outer) return { kind: "iife", call: parent };
      const callee = unwrap(parent.expression);
      if (ts.isPropertyAccessExpression(callee) && parent.arguments[0] === outer && (EVERY_ROW.has(callee.name.text) || EARLY_STOP.has(callee.name.text))) {
        return { kind: "callback", call: parent, method: callee.name.text };
      }
      // `describe.each(TABLE)(title, (row) => ...)`: one call per row of the table.
      const inner = unwrap(callee);
      if (
        ts.isCallExpression(inner) &&
        ts.isPropertyAccessExpression(unwrap(inner.expression)) &&
        (unwrap(inner.expression) as ts.PropertyAccessExpression).name.text === "each" &&
        inner.arguments.length === 1 &&
        parent.arguments.indexOf(outer as ts.Expression) === parent.arguments.length - 1
      ) {
        return { kind: "each", call: parent, table: inner.arguments[0] };
      }
      return { kind: "handed" };
    }
    if (ts.isNewExpression(parent)) return { kind: "handed" };
    return { kind: "escapes", why: `${this.at(fn)}: a function the reader cannot see called` };
  }

  /** The frames between a node and the function (or module) it is in, innermost first. */
  private framesOf(node: ts.Node): { frames: Frame[]; root: FunctionNode | null } {
    const frames: Frame[] = [];
    let child: ts.Node = node;
    for (let parent = node.parent; parent; child = parent, parent = parent.parent) {
      if (isFunctionNode(parent)) {
        const role = this.roleOf(parent);
        if (role.kind === "named") return { frames, root: parent };
        frames.push({ kind: "function", fn: parent, role });
        continue;
      }
      if (ts.isForOfStatement(parent) || ts.isForInStatement(parent)) {
        if (child === parent.statement) frames.push({ kind: "loop", loop: parent });
        continue;
      }
      if (ts.isForStatement(parent)) {
        if (child === parent.initializer) continue;
        if (indexedLoop(parent)) frames.push({ kind: "loop", loop: parent });
        else frames.push({ kind: "opaque", why: `${this.at(parent)}: a for loop the reader does not follow`, filters: false });
        continue;
      }
      if (ts.isWhileStatement(parent) || ts.isDoStatement(parent)) {
        frames.push({ kind: "opaque", why: `${this.at(parent)}: a while loop`, filters: false });
        continue;
      }
      if (ts.isIfStatement(parent)) {
        if (child === parent.thenStatement) frames.push({ kind: "branch", cond: parent.expression, want: "truthy" });
        else if (child === parent.elseStatement) frames.push({ kind: "branch", cond: parent.expression, want: "falsy" });
        continue;
      }
      if (ts.isConditionalExpression(parent)) {
        if (child === parent.whenTrue) frames.push({ kind: "branch", cond: parent.condition, want: "truthy" });
        else if (child === parent.whenFalse) frames.push({ kind: "branch", cond: parent.condition, want: "falsy" });
        continue;
      }
      if (ts.isBinaryExpression(parent) && child === parent.right) {
        const op = parent.operatorToken.kind;
        if (op === ts.SyntaxKind.AmpersandAmpersandToken || op === ts.SyntaxKind.AmpersandAmpersandEqualsToken) frames.push({ kind: "branch", cond: parent.left, want: "truthy" });
        else if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.BarBarEqualsToken) frames.push({ kind: "branch", cond: parent.left, want: "falsy" });
        else if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.QuestionQuestionEqualsToken) frames.push({ kind: "branch", cond: parent.left, want: "nullish" });
        continue;
      }
      if (ts.isBlock(parent) || ts.isSourceFile(parent) || ts.isModuleBlock(parent) || ts.isCaseClause(parent) || ts.isDefaultClause(parent)) {
        const index = (parent.statements as readonly ts.Node[]).indexOf(child);
        if (index > 0) frames.push({ kind: "block", container: parent, before: parent.statements.slice(0, index) });
        if (ts.isCaseClause(parent) || ts.isDefaultClause(parent)) frames.push({ kind: "opaque", why: `${this.at(parent)}: a switch case`, filters: true });
        continue;
      }
      if (ts.isCatchClause(parent)) {
        frames.push({ kind: "opaque", why: `${this.at(parent)}: a catch block`, filters: false });
        continue;
      }
      if (ts.isClassLike(parent) || ts.isClassStaticBlockDeclaration(parent) || ts.isPropertyDeclaration(parent)) {
        frames.push({ kind: "opaque", why: `${this.at(parent)}: a class member`, filters: false });
      }
    }
    return { frames, root: null };
  }

  /** How a statement before a node can leave before reaching it. */
  private exitOf(s: ts.Statement): StatementExit {
    const jumpOf = (n: ts.Statement): Jump | null =>
      ts.isContinueStatement(n) && !n.label ? "continue" : ts.isBreakStatement(n) && !n.label ? "break" : ts.isReturnStatement(n) ? "return" : ts.isThrowStatement(n) ? "throw" : null;
    const direct = jumpOf(s);
    if (direct) return { kind: "jump", jump: direct };
    if (ts.isIfStatement(s) && !s.elseStatement) {
      const then = s.thenStatement;
      const last = ts.isBlock(then) ? then.statements[then.statements.length - 1] : then;
      const jump = last ? jumpOf(last) : null;
      const rest = ts.isBlock(then) ? then.statements.slice(0, -1) : [];
      if (jump && !rest.some((r) => leaves(r)) && !leaves(s.expression)) return { kind: "guard", cond: s.expression, jump };
    }
    return leaves(s) ? { kind: "complex" } : { kind: "plain" };
  }

  /** Whether a loop lies between a block and the function (or module) it is in: a return there ends that loop's later rows too. */
  private inLoop(block: ts.Node): boolean {
    for (let n: ts.Node | undefined = block.parent; n; n = n.parent) {
      if (isFunctionNode(n)) return false;
      if (ts.isIterationStatement(n, false)) return true;
    }
    return false;
  }

  private frameReads(frame: Frame): Set<ts.Identifier> {
    const out = new Set<ts.Identifier>();
    const add = (node: ts.Node | undefined): void => {
      if (node) for (const id of this.idsRead(node)) out.add(id);
    };
    if (frame.kind === "loop") {
      if (ts.isForStatement(frame.loop)) {
        const indexed = indexedLoop(frame.loop);
        add(indexed?.start);
        add(indexed?.end);
      } else add(frame.loop.expression);
    } else if (frame.kind === "branch") add(frame.cond);
    else if (frame.kind === "block") {
      for (const s of frame.before) if (ts.isIfStatement(s)) add(s.expression);
    } else if (frame.kind === "function") {
      if (frame.role.kind === "callback") add((unwrap(frame.role.call.expression) as ts.PropertyAccessExpression).expression);
      else if (frame.role.kind === "iife") for (const a of frame.role.call.arguments) add(a);
      else if (frame.role.kind === "each") add(frame.role.table);
    }
    return out;
  }

  /**
   * Every way a node is reached, with the bindings in force: the rows of the loops
   * around it (an enclosing loop counts even when the node reads none of its rows: no
   * row, no visit), its function's parameters per call site, the guards it passes. Each
   * candidate is reduced to the bindings the node (and `extra`) reads.
   */
  contexts(node: ts.Node, extra: ReadonlySet<ts.Identifier> = new Set()): Contexts {
    const { frames, root } = this.framesOf(node);
    frames.reverse();
    const needs = new Set([...this.idsRead(node), ...extra]);
    const later: Set<ts.Identifier>[] = [];
    let acc = new Set(needs);
    for (let i = frames.length - 1; i >= 0; i--) {
      later[i] = acc;
      acc = new Set([...acc, ...this.frameReads(frames[i])]);
    }
    let overflow: string | null = null;
    let candidates: Candidate[];
    if (root) {
      const entry = this.entryOf(root);
      overflow = entry.overflow;
      candidates = entry.candidates.map((c) => ({ env: new Map(c.env), doubt: c.doubt }));
    } else candidates = [{ env: new Map(), doubt: null }];
    candidates = this.project(candidates, acc);
    for (let i = 0; i < frames.length; i++) {
      const handled = this.applyFrame(frames, i, candidates);
      candidates = this.project(handled.candidates, handled.skipNext ? later[i + 1] ?? needs : later[i]);
      if (handled.skipNext) i++;
      if (candidates.length > ENV_LIMIT) return { candidates: [], overflow: `${this.at(node)}: more than ${ENV_LIMIT} ways to reach it` };
    }
    return { candidates: this.project(candidates, needs), overflow };
  }

  /** Each way a node is reached, with what an expression there comes to and what the reader could not read on the way. */
  values(expr: ts.Expression): { reached: ReachedValue[]; overflow: string | null } {
    const { candidates, overflow } = this.contexts(expr);
    return {
      overflow,
      reached: candidates.map((c) => {
        const { value, notes } = this.noting(() => this.evaluate(expr, c.env));
        return { value, doubt: c.doubt, notes };
      }),
    };
  }

  /** Every string an expression is in a way no doubt filters (none when it is not a string or not known). */
  strings(expr: ts.Expression): string[] {
    const out = new Set<string>();
    for (const { value, doubt } of this.values(expr).reached) if (!doubt?.filters && typeof value === "string") out.add(value);
    return [...out];
  }

  /** Whether a doubt over a condition filters: it does when the condition reads a row, a parameter or a let. */
  private readsBindings(node: ts.Node): boolean {
    return this.idsRead(node).size > 0;
  }

  private applyFrame(frames: Frame[], i: number, candidates: Candidate[]): { candidates: Candidate[]; skipNext: boolean } {
    const frame = frames[i];
    const next = frames[i + 1];
    switch (frame.kind) {
      case "loop": {
        const loop = frame.loop;
        // The loop's own body: its guards decide row by row, and a break ends the rows.
        const body = next?.kind === "block" && next.container === loop.statement ? next : null;
        const out: Candidate[] = [];
        for (const c of candidates) {
          if (this.hooks.skipLoop?.(loop)) {
            out.push(c);
            continue;
          }
          const { value: rows, notes } = this.noting(() => this.rowsOf(loop, c.env));
          if (!rows) {
            // Its variables stay unbound: anything read from them is unknown.
            out.push({ env: c.env, doubt: addDoubt(c.doubt, `${this.at(loop)}: the loop's rows cannot be read${because(notes)}`, false) });
            continue;
          }
          for (const row of rows) {
            const env = new Map(c.env);
            this.bindRow(loop, row, env);
            const verdict = body ? this.passes(body, { env, doubt: c.doubt }, "loop") : { kind: "reach" as const, doubt: c.doubt };
            if (verdict.kind === "skip") continue;
            if (verdict.kind === "stop") break;
            out.push({ env, doubt: verdict.doubt });
          }
        }
        return { candidates: out, skipNext: body !== null };
      }
      case "function":
        return this.enterFunction(frame.fn, frame.role, candidates, next);
      case "branch": {
        const out: Candidate[] = [];
        for (const c of candidates) {
          const { value: v, notes } = this.noting(() => this.evaluate(frame.cond, c.env));
          if (v === UNKNOWN) out.push({ env: c.env, doubt: addDoubt(c.doubt, `${this.at(frame.cond)}: a condition the reader cannot read${because(notes)}`, this.readsBindings(frame.cond)) });
          else if (frame.want === "truthy" ? v : frame.want === "falsy" ? !v : v === null || v === undefined) out.push(c);
        }
        return { candidates: out, skipNext: false };
      }
      case "block": {
        const out: Candidate[] = [];
        for (const c of candidates) {
          const verdict = this.passes(frame, c, "block");
          if (verdict.kind === "reach") out.push({ env: c.env, doubt: verdict.doubt });
        }
        return { candidates: out, skipNext: false };
      }
      case "opaque":
        return { candidates: candidates.map((c) => ({ env: c.env, doubt: addDoubt(c.doubt, frame.why, frame.filters) })), skipNext: false };
    }
  }

  private enterFunction(fn: FunctionNode, role: Role, candidates: Candidate[], next: Frame | undefined): { candidates: Candidate[]; skipNext: boolean } {
    const body = next?.kind === "block" && next.container === fn.body ? next : null;
    const out: Candidate[] = [];
    const push = (env: Map<ts.Identifier, unknown>, doubt: Doubt | null): void => {
      // A return before the node leaves this call of the function.
      const verdict = body ? this.passes(body, { env, doubt }, "function") : { kind: "reach" as const, doubt };
      if (verdict.kind === "reach") out.push({ env, doubt: verdict.doubt });
    };
    for (const c of candidates) {
      if (role.kind === "callback") {
        if (this.hooks.skipLoop?.(fn as LoopNode)) {
          push(c.env, c.doubt);
          continue;
        }
        const receiver = (unwrap(role.call.expression) as ts.PropertyAccessExpression).expression;
        const { value: rows, notes } = this.noting(() => spreadOf(this.evaluate(receiver, c.env)));
        if (!rows) {
          push(new Map(c.env), addDoubt(c.doubt, `${this.at(role.call)}: the rows of .${role.method}() cannot be read${because(notes)}`, false));
          continue;
        }
        const early = EARLY_STOP.has(role.method) ? `${this.at(role.call)}: .${role.method}() stops at the first row its callback decides` : null;
        rows.forEach((row, index) => {
          const env = new Map(c.env);
          this.bindParams(fn, [row, index, rows], env);
          push(env, early ? addDoubt(c.doubt, early, true) : c.doubt);
        });
      } else if (role.kind === "each") {
        const { value: rows, notes } = this.noting(() => spreadOf(this.evaluate(role.table, c.env)));
        if (!rows) {
          push(new Map(c.env), addDoubt(c.doubt, `${this.at(role.call)}: the rows of .each() cannot be read${because(notes)}`, false));
          continue;
        }
        for (const row of rows) {
          const env = new Map(c.env);
          this.bindParams(fn, Array.isArray(row) ? row : [row], env);
          push(env, c.doubt);
        }
      } else if (role.kind === "iife") {
        const env = new Map(c.env);
        this.bindParams(fn, this.args(role.call.arguments, c.env) ?? [], env);
        push(env, c.doubt);
      } else if (role.kind === "handed") push(c.env, c.doubt);
      else if (role.kind === "escapes") push(c.env, addDoubt(c.doubt, role.why, false));
    }
    return { candidates: out, skipNext: body !== null };
  }

  /**
   * Whether a candidate passes the statements before the node in a block. A guard whose
   * jump leaves before the node skips it: a `continue` skips that row of the loop it is
   * in; in a loop's own body (`role` "loop") a `break`, `return` or `throw` also ends the
   * loop's later rows; in a function's own body (`role` "function", or a block with no
   * loop between it and its function) a `return` or `throw` skips that call. A guard the
   * reader cannot read, a `break` or `return` deeper in a loop, and a statement that may
   * leave in a form the reader does not judge leave it in doubt.
   */
  private passes(
    frame: Extract<Frame, { kind: "block" }>,
    c: Candidate,
    role: "loop" | "function" | "block",
  ): { kind: "reach"; doubt: Doubt | null } | { kind: "skip" } | { kind: "stop" } {
    let doubt = c.doubt;
    for (const s of frame.before) {
      const exit = this.exitOf(s);
      if (exit.kind === "plain") continue;
      if (exit.kind === "complex") {
        doubt = addDoubt(doubt, `${this.at(s)}: a statement that may leave before it, in a form the reader does not judge`, true);
        continue;
      }
      const { value: test, notes } = exit.kind === "jump" ? { value: true, notes: [] } : this.noting(() => this.evaluate(exit.cond, c.env));
      if (test === UNKNOWN) {
        doubt = addDoubt(doubt, `${this.at(s)}: a guard the reader cannot read${because(notes)}`, exit.kind === "guard" && this.readsBindings(exit.cond));
        continue;
      }
      if (!test) continue;
      if (exit.jump === "continue") return { kind: "skip" };
      if (role === "loop") return { kind: "stop" };
      if (exit.jump !== "break" && (role === "function" || !this.inLoop(frame.container))) return { kind: "skip" };
      doubt = addDoubt(doubt, `${this.at(s)}: a ${exit.jump} inside a loop, which ends its later rows too`, true);
    }
    return { kind: "reach", doubt };
  }

  /** How a named function of the module is entered: once per call site, with its parameters bound to the arguments. */
  private entryOf(fn: FunctionNode): { candidates: Candidate[]; overflow: string | null } {
    const cached = this.entries.get(fn);
    if (cached) return cached;
    if (this.computing.has(fn)) return { candidates: [{ env: new Map(), doubt: { why: `${this.at(fn)}: a function that calls itself`, filters: false } }], overflow: null };
    this.computing.add(fn);
    try {
      const role = this.roleOf(fn);
      const name = role.kind === "named" ? role.name : null;
      const { sites, escapes } = this.callSitesOf(fn);
      const out: Candidate[] = [];
      let overflow: string | null = null;
      const exported = role.kind === "named" && hasExportModifier(role.statement);
      if (exported) out.push({ env: new Map(), doubt: { why: `${name?.text ?? "it"} is exported (${this.at(fn)}), so the reader cannot see every call`, filters: false } });
      for (const why of escapes) out.push({ env: new Map(), doubt: { why, filters: false } });
      const closure = this.freeIds(fn);
      for (const site of sites) {
        const ctx = this.contexts(site, new Set([...closure, ...site.arguments.flatMap((a) => [...this.idsRead(a)])]));
        overflow ??= ctx.overflow;
        for (const c of ctx.candidates) {
          const env = new Map(c.env);
          this.bindParams(fn, this.args(site.arguments, c.env) ?? fn.parameters.map(() => UNKNOWN), env);
          out.push({ env, doubt: c.doubt });
        }
      }
      const result = { candidates: out, overflow };
      this.entries.set(fn, result);
      return result;
    } finally {
      this.computing.delete(fn);
    }
  }

  /** Where a named function is called in the module, and every other use of it (which the reader cannot follow). */
  private callSitesOf(fn: FunctionNode): { sites: ts.CallExpression[]; escapes: string[] } {
    const cached = this.sites.get(fn);
    if (cached) return cached;
    const role = this.roleOf(fn);
    const out = { sites: [] as ts.CallExpression[], escapes: [] as string[] };
    if (role.kind !== "named") return out;
    const declares = (b: Binding | null): boolean =>
      (b?.kind === "function" && b.decl === fn) || (b?.kind === "const" && b.path.length === 0 && b.decl.initializer !== undefined && unwrap(b.decl.initializer) === fn);
    for (const n of this.identifiersNamed(role.name.text)) {
      if (n === role.name || !isValueRead(n) || !declares(this.resolve(n))) continue;
      const outer = outermost(n);
      if (ts.isCallExpression(outer.parent) && outer.parent.expression === outer) out.sites.push(outer.parent);
      else if (!ts.isTypeOfExpression(outer.parent)) out.escapes.push(`${role.name.text} is used as a value at ${this.at(n)}, so the reader cannot see every call`);
    }
    this.sites.set(fn, out);
    return out;
  }

  /** Every identifier of the module with this text, in source order. */
  identifiersNamed(text: string): ts.Identifier[] {
    if (!this.names) {
      const names = new Map<string, ts.Identifier[]>();
      const visit = (n: ts.Node): void => {
        if (ts.isIdentifier(n)) {
          const list = names.get(n.text);
          if (list) list.push(n);
          else names.set(n.text, [n]);
        }
        ts.forEachChild(n, visit);
      };
      visit(this.sf);
      this.names = names;
    }
    return this.names.get(text) ?? [];
  }

  private names: Map<string, ts.Identifier[]> | null = null;

  /** Keep each candidate's bindings for these names only, once per distinct set of values. */
  private project(candidates: Candidate[], keep: ReadonlySet<ts.Identifier>): Candidate[] {
    const seen = new Set<string>();
    const out: Candidate[] = [];
    for (const c of candidates) {
      const env = new Map<ts.Identifier, unknown>();
      for (const [id, value] of c.env) if (keep.has(id)) env.set(id, value);
      const key = `${[...env]
        .sort((a, b) => a[0].pos - b[0].pos)
        .map(([id, value]) => `${id.pos}:${this.valueKey(value)}`)
        .join("|")}#${c.doubt ? `${c.doubt.filters}:${c.doubt.why}` : ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ env, doubt: c.doubt });
    }
    return out;
  }

  private valueKey(value: unknown): string {
    if (value === UNKNOWN) return "?";
    if (value === null || typeof value !== "object") return `${typeof value}:${String(value)}`;
    let id = this.valueIds.get(value);
    if (id === undefined) {
      id = this.valueIdCount++;
      this.valueIds.set(value, id);
    }
    return `#${id}`;
  }

  private valueIdCount = 0;
}

const NOT_BUILTIN: unique symbol = Symbol("not builtin");

function hasExportModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function isInside(node: ts.Node, container: ts.Node): boolean {
  for (let n: ts.Node | undefined = node; n; n = n.parent) if (n === container) return true;
  return false;
}

/**
 * Whether a statement (or expression) holds a jump that leaves it: a continue or break
 * not inside a loop (or switch) of its own, a return or throw not inside a function of
 * its own.
 */
function leaves(node: ts.Node): boolean {
  let found = false;
  const visit = (n: ts.Node, loops: number, switches: number): void => {
    if (found) return;
    if (isFunctionNode(n) || ts.isClassLike(n)) return;
    if (ts.isContinueStatement(n) && (n.label || loops === 0)) found = true;
    else if (ts.isBreakStatement(n) && (n.label || loops + switches === 0)) found = true;
    else if (ts.isReturnStatement(n) || ts.isThrowStatement(n)) found = true;
    const loop = ts.isIterationStatement(n, false);
    ts.forEachChild(n, (child) => visit(child, loops + (loop ? 1 : 0), switches + (ts.isSwitchStatement(n) ? 1 : 0)));
  };
  visit(node, 0, 0);
  return found;
}

/** The items a spread of a value produces, or null when it cannot be known. */
export function spreadOf(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (value instanceof Set) return [...value];
  if (value instanceof Map) return [...value.entries()];
  if (typeof value === "string") return [...value];
  return null;
}

function stringMethod(s: string, method: string, args: unknown[]): unknown {
  if (args.includes(UNKNOWN)) return UNKNOWN;
  const [a, b] = args;
  const num = (v: unknown): v is number => typeof v === "number";
  switch (method) {
    case "startsWith":
    case "endsWith":
    case "includes":
      return typeof a === "string" && (b === undefined || num(b)) ? s[method](a, b as number | undefined) : UNKNOWN;
    case "toLowerCase":
    case "toUpperCase":
    case "trim":
    case "trimStart":
    case "trimEnd":
    case "toString":
      return s[method]();
    case "slice":
    case "substring":
      return num(a) && (b === undefined || num(b)) ? s[method](a, b as number | undefined) : UNKNOWN;
    case "indexOf":
    case "lastIndexOf":
      return typeof a === "string" ? s[method](a) : UNKNOWN;
    case "at":
    case "charAt":
      return num(a) ? s[method](a) : UNKNOWN;
    case "repeat":
      return num(a) && a >= 0 && a < 10_000 ? s.repeat(a) : UNKNOWN;
    case "padStart":
    case "padEnd":
      return num(a) && (b === undefined || typeof b === "string") ? s[method](a, b as string | undefined) : UNKNOWN;
    case "concat":
      return args.every(isPrimitive) ? s.concat(...args.map(String)) : UNKNOWN;
    case "localeCompare":
      return typeof a === "string" ? s.localeCompare(a) : UNKNOWN;
    case "replace":
    case "replaceAll":
      if (typeof b !== "string" || (typeof a !== "string" && !(a instanceof RegExp))) return UNKNOWN;
      if (method === "replaceAll" && a instanceof RegExp && !a.global) return UNKNOWN;
      return method === "replace" ? s.replace(a, b) : s.replaceAll(a, b);
    case "split":
      return (typeof a === "string" || a instanceof RegExp) && (b === undefined || num(b)) ? s.split(a, b as number | undefined) : UNKNOWN;
    case "match": {
      if (!(a instanceof RegExp)) return UNKNOWN;
      const m = s.match(new RegExp(a.source, a.flags));
      return m ? [...m] : null;
    }
    default:
      return UNKNOWN;
  }
}

function regexMethod(re: RegExp, method: string, args: unknown[]): unknown {
  const [s] = args;
  if (typeof s !== "string") return UNKNOWN;
  // A fresh copy: a global expression keeps state between calls in JavaScript.
  const copy = new RegExp(re.source, re.flags);
  if (method === "test") return copy.test(s);
  if (method === "exec") {
    const m = copy.exec(s);
    return m ? [...m] : null;
  }
  return UNKNOWN;
}
