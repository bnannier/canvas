// What a component's own source says about the interaction states it has, read with the
// TypeScript parser and never run (the component audit's plan, 1d; the state recipes in
// e2e/support/state-recipes.ts are held to it by tools/audit/state-recipes.test.ts).
//
// A signal is a place in the source where the component takes an input that has a state
// of its own:
//
//   press       onPress, onPressIn, onPressOut or onLongPress on a primitive (a Pressable,
//               a View): the control takes a press, so it has a pressed state.
//   responder   a raw responder (onStartShouldSetResponder, a PanResponder): a press and a
//               drag the component handles itself, as a chart's scrub surface or a slider's
//               thumb does; a pressed state.
//   hover-in    onHoverIn or onHoverOut on a primitive: the pointer resting on it changes
//               something; a hover state.
//   hover       the hover primitive (src/style/hover.tsx `useHover`): a lift or a wash; a
//               hover state.
//   text-entry  a TextInput primitive: a field that takes focus; a focus state.
//   link        `href`, or a "link" role, on a primitive: a link, which is a tab stop; a
//               focus state.
//   look        a function of the component (a skin, a Pressable's style callback) taking
//               `pressed`, `hovered` or `focused`: its look changes with that state.
//
// A raw primitive (View, Text, Pressable, TextInput, ScrollView) has no source of its own:
// its directory holds only its markdown, and it is React Native's own component (or the
// style layer's pass-through of it), whose states are whatever an example hands it. Its
// signals are read from its rail examples instead (`exampleSignals`): the same props on its
// own tag in each example's code.
//
// What is read: every module of the component's own directory (the shared shell, the
// platform entries, the skins and the parts), and the shared family modules they import
// (src/charts/shared), followed by the names they import, never a whole file. Another
// component's directory (or the kit's index, or a part a platform entry injects) is that
// component's own business: its states are its own recipes, so a press handed to a kit
// Button is not a signal of the component that renders the Button. The style layer
// (src/style) and React Native are the primitives a signal sits on.
//
// A signal can be gated: rendered only when the component is given a prop (`onItemPress`
// makes a Feeds row a button; `onStepPress` makes a step circle pressable). The gates are
// read from the conditions around the signal (an if, a ternary, `&&`, an early return)
// that test one of the component's props, and are followed through the local components
// and shared modules the signal is reached through (a step circle is pressable when its
// own `onPress` is given, and Steps gives it one only when it has `onStepPress`). A gate
// the reader cannot follow is dropped, which only ever makes a signal unconditional.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";
import { StaticReader, boundNames, unwrap, type Binding } from "./static-eval.ts";

export type SignalKind = "press" | "responder" | "hover-in" | "hover" | "text-entry" | "link" | "look";

/** The states a signal gives a component. */
export type SignalState = "hover" | "focus" | "pressed";

export interface Signal {
  kind: SignalKind;
  state: SignalState;
  /** What carries it: the prop and the element, the call, or the look input. */
  what: string;
  /** Where it is, `path:line`, repo-relative. */
  at: string;
  /** The shared or local components it is reached through, outermost first. */
  via: string[];
  /**
   * The component's own props it is rendered under: it is rendered only when every one of
   * them is passed, so one never passed is enough to keep it out of an example. Empty when
   * it always renders.
   */
  gates: string[];
  /** For a handler on a primitive: the element it is on, as the source writes it. */
  element?: ElementFacts;
}

/** What the source says about the element a handler is on. */
export interface ElementFacts {
  /** Kept from assistive technology: `accessible={false}`, `importantForAccessibility="no"` or `aria-hidden`. */
  hidden: boolean;
  /** One of its props is a function taking `pressed` (a style callback): it has a pressed look. */
  look: boolean;
  /** The handler's source, whitespace collapsed. */
  handler: string;
}

const PRESS_PROPS = new Set(["onPress", "onPressIn", "onPressOut", "onLongPress"]);
const RESPONDER_PROPS = new Set(["onStartShouldSetResponder", "onMoveShouldSetResponder", "onResponderGrant"]);
const HOVER_PROPS = new Set(["onHoverIn", "onHoverOut"]);
const LOOK_INPUTS: Record<string, SignalState> = { pressed: "pressed", hovered: "hover", focused: "focus" };

const isSourceModule = (file: string) => /\.tsx?$/.test(file) && !/\.(test|spec)\.tsx?$/.test(file) && !file.endsWith(".d.ts");

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkFiles(path) : [path];
  });
}

/** Where an import lands, from the point of view of one component. */
type Place = "primitive" | "own" | "shared" | "kit" | "outside";

interface Parsed {
  path: string;
  sf: ts.SourceFile;
  reader: StaticReader;
}

/** A function the reader follows: a component, a hook or a helper, in some module. */
interface Fn {
  node: ts.FunctionLikeDeclaration;
  module: Parsed;
  name: string;
}

export class SignalReader {
  private readonly parsed = new Map<string, Parsed>();
  private readonly summaries = new Map<ts.Node, Signal[]>();
  private readonly inProgress = new Set<ts.Node>();
  private readonly groups = ["atoms", "molecules", "organisms", "charts"];

  constructor(readonly root: string) {}

  private parse(path: string): Parsed {
    let found = this.parsed.get(path);
    if (!found) {
      const source = readFileSync(path, "utf8");
      const sf = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      found = { path, sf, reader: new StaticReader(sf) };
      this.parsed.set(path, found);
    }
    return found;
  }

  private at(module: Parsed, node: ts.Node): string {
    return `${relative(this.root, module.path)}:${module.sf.getLineAndCharacterOfPosition(node.getStart(module.sf)).line + 1}`;
  }

  /** The file a relative import names (`./x.js` is `./x.ts` or `./x.tsx`), or null for a package. */
  private resolveImport(from: string, specifier: string): string | null {
    if (!specifier.startsWith(".")) return null;
    const base = resolve(dirname(from), specifier).replace(/\.js$/, "");
    for (const candidate of [`${base}.tsx`, `${base}.ts`, join(base, "index.ts"), join(base, "index.tsx")]) if (existsSync(candidate)) return candidate;
    return null;
  }

  /** What an imported module is to the component whose directory is `own`. */
  private place(file: string | null, own: string): Place {
    if (file === null) return "primitive";
    const rel = relative(this.root, file).split("\\").join("/");
    if (rel.startsWith("src/style/") || rel === "src/style.ts") return "primitive";
    if (file.startsWith(`${own}/`)) return "own";
    const parts = rel.split("/");
    if (parts[0] === "src" && this.groups.includes(parts[1]!) && parts.length > 3) {
      // A family's shared modules (src/charts/shared) belong to no component.
      return parts[2] === "shared" ? "shared" : "kit";
    }
    if (parts[0] === "src") return "kit";
    return "outside";
  }

  /** The exported function a module declares under `name`, unwrapping memo and forwardRef. */
  private exported(path: string, name: string): Fn | null {
    const module = this.parse(path);
    for (const statement of module.sf.statements) {
      if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) return { node: statement, module, name };
      if (ts.isVariableStatement(statement)) {
        for (const decl of statement.declarationList.declarations) {
          if (ts.isIdentifier(decl.name) && decl.name.text === name && decl.initializer) {
            const fn = functionOf(decl.initializer);
            if (fn) return { node: fn, module, name };
          }
        }
      }
      // `export { X } from "./y.js"`: follow it.
      if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        const element = statement.exportClause.elements.find((el) => el.name.text === name);
        const target = element ? this.resolveImport(path, statement.moduleSpecifier.text) : null;
        if (element && target) return this.exported(target, (element.propertyName ?? element.name).text);
      }
    }
    return null;
  }

  /** The function a name refers to where it is read, and where that function is, for a component whose directory is `own`. */
  private functionFor(module: Parsed, id: ts.Identifier, own: string): { fn: Fn | null; place: Place } {
    const binding = module.reader.resolve(id);
    if (!binding) return { fn: null, place: "primitive" };
    if (binding.kind === "function") return { fn: { node: binding.decl, module, name: id.text }, place: "own" };
    if (binding.kind === "const") {
      const init = binding.path.length === 0 ? binding.decl.initializer : undefined;
      const fn = init ? functionOf(init) : null;
      return { fn: fn ? { node: fn, module, name: id.text } : null, place: "own" };
    }
    if (binding.kind === "import") {
      const file = this.resolveImport(module.path, binding.specifier);
      const place = this.place(file, own);
      if ((place === "own" || place === "shared") && file) return { fn: this.exported(file, binding.imported), place };
      return { fn: null, place };
    }
    if (binding.kind === "param") return { fn: null, place: "kit" };
    return { fn: null, place: "primitive" };
  }

  /** Where a JSX tag comes from: a primitive, one of the component's own or shared functions, or another component. */
  private tagOf(module: Parsed, tag: ts.JsxTagNameExpression, own: string): { name: string; fn: Fn | null; place: Place } {
    const name = tag.getText(module.sf);
    let head: ts.Expression = tag as ts.Expression;
    while (ts.isPropertyAccessExpression(head)) head = head.expression;
    if (!ts.isIdentifier(head)) return { name, fn: null, place: "primitive" };
    // `parts.Switch`, `skin.Track`: a part a platform entry injects is another component.
    if (head !== tag) {
      const binding = module.reader.resolve(head);
      if (binding?.kind === "param") return { name, fn: null, place: "kit" };
      if (binding?.kind === "import") return { name, fn: null, place: this.place(this.resolveImport(module.path, binding.specifier), own) === "primitive" ? "primitive" : "kit" };
      return { name, fn: null, place: "primitive" };
    }
    // An intrinsic (lower-case) tag is the DOM's own, which a React Native component never renders.
    if (/^[a-z]/.test(head.text)) return { name, fn: null, place: "primitive" };
    return { name, ...this.functionFor(module, head, own) };
  }

  /** The prop of the enclosing component a name or a member read stands for, or null. */
  private propOf(module: Parsed, expr: ts.Expression): string | null {
    const e = unwrap(expr);
    if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression)) {
      const binding = module.reader.resolve(e.expression);
      // `props.onPressItem`, props being the component's own (undestructured) parameter.
      const first = binding?.kind === "param" ? binding.fn.parameters[0] : undefined;
      if (binding?.kind === "param" && isComponentFunction(binding.fn) && first && ts.isIdentifier(first.name) && first.name === binding.id) return e.name.text;
      return null;
    }
    if (!ts.isIdentifier(e)) return null;
    const binding: Binding | null = module.reader.resolve(e);
    if (!binding) return null;
    if (binding.kind === "param") {
      if (!isComponentFunction(binding.fn)) return null;
      const param = binding.fn.parameters[0];
      if (!param) return null;
      const bound = boundNames(param.name).find((b) => b.id === binding.id);
      return bound && typeof bound.path[0] === "string" ? bound.path[0] : null;
    }
    if (binding.kind === "const") {
      const init = binding.decl.initializer ? unwrap(binding.decl.initializer) : null;
      if (!init) return null;
      // `const { onItemPress } = props`, props being the component's own parameter.
      if (binding.path.length && typeof binding.path[0] === "string" && ts.isIdentifier(init)) {
        const source = module.reader.resolve(init);
        if (source?.kind === "param" && isComponentFunction(source.fn)) return binding.path[0];
      }
    }
    return null;
  }

  /** The props an expression being truthy says were passed. */
  private truthyProps(module: Parsed, expr: ts.Expression): string[] {
    const e = unwrap(expr);
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return [...this.truthyProps(module, e.left), ...this.truthyProps(module, e.right)];
      const nullish = (side: ts.Expression) => {
        const s = unwrap(side);
        return s.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(s) && s.text === "undefined");
      };
      if (op === ts.SyntaxKind.ExclamationEqualsToken || op === ts.SyntaxKind.ExclamationEqualsEqualsToken) {
        if (nullish(e.right)) return this.truthyProps(module, e.left);
        if (nullish(e.left)) return this.truthyProps(module, e.right);
      }
      if ((op === ts.SyntaxKind.EqualsEqualsEqualsToken || op === ts.SyntaxKind.EqualsEqualsToken) && ts.isTypeOfExpression(unwrap(e.left))) {
        return this.truthyProps(module, (unwrap(e.left) as ts.TypeOfExpression).expression);
      }
      return [];
    }
    const prop = this.propOf(module, e);
    if (prop) return [prop];
    // A local alias: `const pressStep = onStepPress ? (i) => ... : undefined`.
    if (ts.isIdentifier(e)) {
      const binding = module.reader.resolve(e);
      if (binding?.kind === "const" && binding.path.length === 0 && binding.decl.initializer) return this.passedProps(module, binding.decl.initializer) ?? [];
    }
    return [];
  }

  /** The props an expression being falsy says were passed (`!onPress` falsy means onPress was). */
  private falsyProps(module: Parsed, expr: ts.Expression): string[] {
    const e = unwrap(expr);
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) return this.truthyProps(module, e.operand);
    if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken || e.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken)) {
      const s = unwrap(e.right);
      if (s.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(s) && s.text === "undefined")) return this.truthyProps(module, e.left);
    }
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.BarBarToken) return [...this.falsyProps(module, e.left), ...this.falsyProps(module, e.right)];
    return [];
  }

  /**
   * What passing a value to a gated prop depends on: null when the value is never there
   * (`undefined`), the props it is there only with (`onStepPress ? f : undefined`,
   * `props.onPressItem`), or none when it is always there.
   */
  private passedProps(module: Parsed, value: ts.Expression): string[] | null {
    const v = unwrap(value);
    if (v.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(v) && v.text === "undefined") || v.kind === ts.SyntaxKind.FalseKeyword) return null;
    if (ts.isConditionalExpression(v)) {
      const no = unwrap(v.whenFalse);
      if (no.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(no) && no.text === "undefined")) return this.truthyProps(module, v.condition);
      return [];
    }
    if (ts.isBinaryExpression(v) && v.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return this.truthyProps(module, v.left);
    const prop = this.propOf(module, v);
    if (prop) return [prop];
    // `onPressRow={props.onPressItem}` through an optional call is still the prop.
    return [];
  }

  /** The props the code around `node` (up to `scope`) must have been given for `node` to render. */
  private gatesOf(module: Parsed, node: ts.Node, scope: ts.Node): string[] {
    const gates: string[] = [];
    for (let current: ts.Node = node; current !== scope && current.parent; current = current.parent) {
      const parent = current.parent;
      if (ts.isIfStatement(parent) && parent.thenStatement === current) gates.push(...this.truthyProps(module, parent.expression));
      else if (ts.isConditionalExpression(parent) && parent.whenTrue === current) gates.push(...this.truthyProps(module, parent.condition));
      else if (ts.isConditionalExpression(parent) && parent.whenFalse === current) gates.push(...this.falsyProps(module, parent.condition));
      else if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && parent.right === current) gates.push(...this.truthyProps(module, parent.left));
      else if (ts.isBlock(parent) || ts.isSourceFile(parent)) {
        // An early return: `if (!onPress) return <View />;` gates what follows on onPress.
        for (const statement of parent.statements) {
          if (statement === current) break;
          if (ts.isIfStatement(statement) && !statement.elseStatement && returns(statement.thenStatement)) gates.push(...this.falsyProps(module, statement.expression));
        }
      }
    }
    return [...new Set(gates)];
  }

  /**
   * Every signal reachable from `scope` (a function, or a whole module), with its gates in
   * the props of the components around it. The bodies of local components used as a JSX
   * tag are skipped where they are declared and read where they are used, so their gates
   * can be mapped through the props each use passes.
   */
  private collect(module: Parsed, scope: ts.Node, own: string, skip: ReadonlySet<ts.Node>): Signal[] {
    const out: Signal[] = [];
    const add = (signal: Omit<Signal, "at" | "gates" | "via">, node: ts.Node) => out.push({ ...signal, at: this.at(module, node), via: [], gates: this.gatesOf(module, node, scope) });

    const visit = (node: ts.Node): void => {
      if (node !== scope && skip.has(node)) return;
      // Look inputs: a function parameter named pressed, hovered or focused, or destructuring one.
      if (ts.isParameter(node)) {
        for (const bound of boundNames(node.name)) {
          const name = bound.path.length ? String(bound.path[bound.path.length - 1]) : bound.id.text;
          const state = LOOK_INPUTS[name];
          if (state) add({ kind: "look", state, what: `a function taking \`${name}\`` }, node);
        }
      }
      if (ts.isCallExpression(node)) {
        const callee = unwrap(node.expression);
        if (ts.isIdentifier(callee)) {
          const binding = module.reader.resolve(callee);
          if (callee.text === "useHover" && binding?.kind === "import" && /style\/hover(\.js)?$/.test(binding.specifier)) add({ kind: "hover", state: "hover", what: "useHover() (src/style/hover.tsx)" }, node);
          else {
            // A shared helper that renders (chartShell): its signals land here. The
            // component's own modules are read whole, so its own factories are not followed.
            const { fn, place } = this.functionFor(module, callee, own);
            if (fn && place === "shared") this.inherit(out, module, node, scope, fn, own, null, skip);
          }
        } else if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === "PanResponder" && callee.name.text === "create") {
          add({ kind: "responder", state: "pressed", what: "PanResponder.create()" }, node);
        }
      }
      if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
        const tag = this.tagOf(module, node.tagName, own);
        const attrs = node.attributes.properties;
        if (tag.place === "primitive") {
          if (tag.name === "TextInput") add({ kind: "text-entry", state: "focus", what: "a TextInput" }, node);
          for (const attr of attrs) {
            if (!ts.isJsxAttribute(attr) || !ts.isIdentifier(attr.name)) continue;
            const prop = attr.name.text;
            const value = attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression ? attr.initializer.expression : null;
            // `onPress={undefined}` is no handler.
            if (value && this.passedProps(module, value) === null) continue;
            const extra = value ? (this.passedProps(module, value) ?? []) : [];
            const signal = (kind: SignalKind, state: SignalState, element?: ElementFacts) => {
              out.push({
                kind,
                state,
                what: `${prop} on <${tag.name}>`,
                at: this.at(module, attr),
                via: [],
                gates: [...new Set([...this.gatesOf(module, attr, scope), ...extra])],
                ...(element ? { element } : {}),
              });
            };
            const facts = (): ElementFacts => elementFacts(module.sf, attrs, value);
            if (PRESS_PROPS.has(prop)) signal("press", "pressed", facts());
            else if (RESPONDER_PROPS.has(prop)) signal("responder", "pressed", facts());
            else if (HOVER_PROPS.has(prop)) signal("hover-in", "hover", facts());
            else if (prop === "href") signal("link", "focus");
            else if ((prop === "accessibilityRole" || prop === "role") && value) {
              // `accessibilityRole={anchor ? "link" : undefined}`: a link where the literal is reached.
              const literal = findLiteral(value, "link");
              if (literal) out.push({ kind: "link", state: "focus", what: `${prop} "link" on <${tag.name}>`, at: this.at(module, attr), via: [], gates: this.gatesOf(module, literal, scope) });
            }
          }
        } else if (tag.fn && (tag.place === "shared" || skip.has(tag.fn.node))) {
          this.inherit(out, module, node, scope, tag.fn, own, attrs, skip);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(scope);
    return out;
  }

  /** The signals of a local or shared function used at `site`, with its gates mapped through what the site passes. */
  private inherit(out: Signal[], module: Parsed, site: ts.Node, scope: ts.Node, fn: Fn, own: string, attrs: ts.NodeArray<ts.JsxAttributeLike> | null, skip: ReadonlySet<ts.Node>): void {
    // A shared module's own tag components are its business; the component's are the caller's.
    const inner = this.summary(fn, own, fn.module.path.startsWith(`${own}/`) ? skip : this.tagComponents([fn.module], own));
    const around = this.gatesOf(module, site, scope);
    for (const signal of inner) {
      let gates: string[] | null = [...around];
      if (attrs) {
        for (const gate of signal.gates) {
          const attr = attrs.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && ts.isIdentifier(a.name) && a.name.text === gate);
          if (!attr) {
            // A spread may pass it; nothing else does.
            if (!attrs.some(ts.isJsxSpreadAttribute)) gates = null;
            break;
          }
          const value = attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression ? attr.initializer.expression : null;
          const passed = value ? this.passedProps(module, value) : [];
          if (passed === null) {
            gates = null;
            break;
          }
          gates.push(...passed);
        }
      }
      if (gates === null) continue;
      out.push({ ...signal, via: [fn.name, ...signal.via], gates: [...new Set(gates)] });
    }
  }

  /** A function's signals, gated by its own props; `skip` holds the components read where they are used. */
  private summary(fn: Fn, own: string, skip: ReadonlySet<ts.Node>): Signal[] {
    const cached = this.summaries.get(fn.node);
    if (cached) return cached;
    if (this.inProgress.has(fn.node)) return [];
    this.inProgress.add(fn.node);
    const signals = this.collect(fn.module, fn.node, own, skip);
    this.inProgress.delete(fn.node);
    this.summaries.set(fn.node, signals);
    return signals;
  }

  /**
   * The functions a set of modules declare and use as a JSX tag among themselves: each is
   * read where it is used, so its gates are mapped through the props the use passes.
   */
  private tagComponents(modules: Parsed[], own: string): Set<ts.Node> {
    const used = new Set<ts.Node>();
    const paths = new Set(modules.map((m) => m.path));
    for (const module of modules) {
      const visit = (node: ts.Node): void => {
        if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && ts.isIdentifier(node.tagName)) {
          const { fn } = this.functionFor(module, node.tagName, own);
          if (fn && paths.has(fn.module.path)) used.add(fn.node);
        }
        ts.forEachChild(node, visit);
      };
      visit(module.sf);
    }
    return used;
  }

  /** Whether a component's directory (repo-relative) holds any source module. */
  hasSource(sourceDir: string): boolean {
    const own = join(this.root, sourceDir);
    return existsSync(own) && walkFiles(own).some(isSourceModule);
  }

  /**
   * Every signal of the component whose source directory is `sourceDir` (repo-relative,
   * `src/<group>/<dir>`): its own modules read whole, except the local components they
   * use as tags, which are read where they are used.
   */
  signalsOf(sourceDir: string): Signal[] {
    const own = join(this.root, sourceDir);
    if (!existsSync(own)) return [];
    const modules = walkFiles(own).filter(isSourceModule).sort().map((path) => this.parse(path));
    const skip = this.tagComponents(modules, own);
    const signals: Signal[] = [];
    for (const module of modules) signals.push(...this.collect(module, module.sf, own, skip));
    // One signal per place and route to it.
    const seen = new Set<string>();
    return signals.filter((s) => {
      const key = `${s.kind}|${s.state}|${s.at}|${s.via.join(">")}|${[...s.gates].sort().join(",")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

/**
 * The signals a raw primitive's rail examples give it: the handler props, `href` and a
 * pressed look on its own tag (`tag`, the component's name), and the tag itself when it is
 * the TextInput. `where` names the markdown, for `at`.
 */
export function exampleSignals(tag: string, examples: readonly { label: string; code: string }[], where: string): Signal[] {
  const signals: Signal[] = [];
  for (const example of examples) {
    const sf = ts.createSourceFile("example.tsx", `const example = (<>\n${example.code}\n</>);\n`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const at = `${where} (${example.label})`;
    const visit = (node: ts.Node): void => {
      if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(sf) === tag) {
        const add = (kind: SignalKind, state: SignalState, what: string) => signals.push({ kind, state, what, at, via: [], gates: [] });
        if (tag === "TextInput") add("text-entry", "focus", "a TextInput");
        for (const attr of node.attributes.properties) {
          if (!ts.isJsxAttribute(attr) || !ts.isIdentifier(attr.name)) continue;
          const prop = attr.name.text;
          if (PRESS_PROPS.has(prop)) add("press", "pressed", `${prop} on <${tag}>`);
          else if (HOVER_PROPS.has(prop)) add("hover-in", "hover", `${prop} on <${tag}>`);
          else if (prop === "href") add("link", "focus", `href on <${tag}>`);
          if (attr.initializer && takesParameter(attr.initializer, "pressed")) add("look", "pressed", `a function taking \`pressed\` on <${tag}>`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return signals;
}

/** A function an initializer is: an arrow or a function expression, through memo(), forwardRef() and `as`. */
function functionOf(init: ts.Expression): ts.FunctionLikeDeclaration | null {
  const e = unwrap(init);
  if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return e;
  if (ts.isCallExpression(e) && ts.isIdentifier(unwrap(e.expression)) && /^(memo|forwardRef)$/.test((unwrap(e.expression) as ts.Identifier).text) && e.arguments[0]) {
    return functionOf(e.arguments[0]);
  }
  if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && /^(memo|forwardRef)$/.test(e.expression.name.text) && e.arguments[0]) return functionOf(e.arguments[0]);
  return null;
}

/** A component (or a hook) whose first parameter is its props: named in capitals, or taking `props`. */
function isComponentFunction(fn: ts.Node): boolean {
  if (!ts.isFunctionDeclaration(fn) && !ts.isFunctionExpression(fn) && !ts.isArrowFunction(fn)) return false;
  const first = fn.parameters[0];
  if (!first) return false;
  if (ts.isIdentifier(first.name) && first.name.text === "props") return true;
  let name: string | undefined = (fn as ts.FunctionDeclaration).name?.text;
  if (!name && ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name)) name = fn.parent.name.text;
  // `forwardRef(function X(props, ref))`, `memo((props) => ...)`.
  if (!name && ts.isCallExpression(fn.parent) && ts.isVariableDeclaration(fn.parent.parent) && ts.isIdentifier(fn.parent.parent.name)) name = fn.parent.parent.name.text;
  return !!name && /^[A-Z]/.test(name);
}

/** The string literal `text` inside an expression, or null. */
function findLiteral(expr: ts.Node, text: string): ts.Node | null {
  if ((ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) && expr.text === text) return expr;
  let found: ts.Node | null = null;
  ts.forEachChild(expr, (child) => {
    found ??= findLiteral(child, text);
  });
  return found;
}

/** Whether a node holds a function with a parameter bound to `name`. */
function takesParameter(node: ts.Node, name: string): boolean {
  if (ts.isParameter(node) && boundNames(node.name).some((b) => (b.path.length ? String(b.path[b.path.length - 1]) : b.id.text) === name)) return true;
  let found = false;
  ts.forEachChild(node, (child) => {
    found ||= takesParameter(child, name);
  });
  return found;
}

/** What the attributes of the element a handler is on say about it. */
function elementFacts(sf: ts.SourceFile, attrs: ts.NodeArray<ts.JsxAttributeLike>, handler: ts.Expression | null): ElementFacts {
  const valueOf = (name: string): ts.Expression | ts.StringLiteral | null => {
    const attr = attrs.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && ts.isIdentifier(a.name) && a.name.text === name);
    if (!attr?.initializer) return null;
    if (ts.isStringLiteral(attr.initializer)) return attr.initializer;
    return ts.isJsxExpression(attr.initializer) && attr.initializer.expression ? unwrap(attr.initializer.expression) : null;
  };
  const accessible = valueOf("accessible");
  const importance = valueOf("importantForAccessibility");
  const ariaHidden = valueOf("aria-hidden");
  const hidden =
    accessible?.kind === ts.SyntaxKind.FalseKeyword ||
    (!!importance && ts.isStringLiteral(importance) && importance.text.startsWith("no")) ||
    (!!ariaHidden && (ariaHidden.kind === ts.SyntaxKind.TrueKeyword || (ts.isStringLiteral(ariaHidden) && ariaHidden.text === "true")));
  const look = attrs.some((a) => ts.isJsxAttribute(a) && !!a.initializer && takesParameter(a.initializer, "pressed"));
  return { hidden, look, handler: handler ? handler.getText(sf).replace(/\s+/g, " ").slice(0, 120) : "" };
}

/** Whether a statement always returns (or throws). */
function returns(statement: ts.Statement): boolean {
  if (ts.isReturnStatement(statement) || ts.isThrowStatement(statement)) return true;
  if (ts.isBlock(statement)) return statement.statements.some(returns);
  return false;
}
