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
//   hover-in    onHoverIn, onHoverOut, onPointerEnter or onPointerLeave on a primitive: the
//               pointer resting on it changes something; a hover state.
//   hover       the hover primitive (src/style/hover.tsx `useHover`): a lift or a wash; a
//               hover state.
//   text-entry  a TextInput primitive: a field that takes focus; a focus state.
//   link        `href`, or a "link" role, on a primitive: a link, which is a tab stop; a
//               focus state.
//   tab-stop    an element react-native-web makes a tab stop: every Pressable (it passes a
//               tab index of its own, 0 unless it is disabled), unless the source takes it
//               out (`focusable={false}`, which the kit's Pressable spells as tab index -1,
//               `tabIndex={-1}` or `disabled`); a View or a Text with a button, checkbox,
//               radio, switch or textbox role (createDOMProps makes those roles tab stops);
//               any primitive given `focusable` or `tabIndex={0}`. A focus state.
//   overlay     an overlay primitive the component renders (React Native's Modal, the
//               style layer's AnchoredOverlay or Portal), or another kit component whose own
//               source renders one, given its `open` (or `visible`) by this component, so
//               the component decides when it opens (FilterPanel's and Sidebar's drawers,
//               and AvatarMenu's Dropdown, a part its platform entries inject, known by its
//               default or by the component its type names); an open state. Each overlay is
//               named by the function that renders it (`overlay`), so a component that
//               opens two (the Calendar's hover card and its day peek) owes each a recipe.
//   look        a function of the component (a skin, a Pressable's style callback) taking
//               `pressed`, `hovered` or `focused`: its look changes with that state.
//   disabled    `disabled`, `aria-disabled` or the `disabled` of an `accessibilityState`,
//               given a value that can be true, on a primitive, or `disabled` handed to
//               another kit component (AlertDialog's confirm Button): a control the
//               component disables; a disabled state. What makes it disabled is read from
//               its value (`disabledBy`): the props it is true with (`disabled`, or
//               `withInput` through `const confirmGated = !!withInput && ...`), and the keys
//               of the data it reads (`item.disabled`), which an example writes in the items
//               it passes (`{ label: "Archive", disabled: true }`). One rendered inside an overlay
//               the component opens is placed there (`within`): it is on the page only once
//               the overlay opens. One inside an overlay that its own gate keeps closed (a
//               Select's option rows, disabled with the Select, whose list `!disabled && ...`
//               never opens) is never on the page, so gives nothing.
//
// The props are read wherever the element gets them: written on its tag, or spread onto it
// (`{...hoverProps}`, `{...(open ? a : b)}`, `{...target}`) from a value the reader can
// follow, an object literal reached through local constants, conditionals, `&&`, `??`, a
// member read, a local or shared helper's return, `useMemo`, or a hook of the style layer
// whose return it builds there (the hover primitive's `target`, the scroll regions'
// `useScrollFocus`, which makes a region a tab stop once its content overflows). A spread
// the reader cannot follow (a parameter, another kit component's export) gives nothing.
//
// A raw primitive (View, Text, Pressable, TextInput, ScrollView) has no source of its own:
// its directory holds only its markdown, and it is React Native's own component (or the
// style layer's pass-through of it), whose states are whatever an example hands it. Its
// signals are read from its rail examples instead (`exampleSignals`): the same props on its
// own tag in each example's code, written on it or spread onto it.
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

export type SignalKind = "press" | "responder" | "hover-in" | "hover" | "text-entry" | "link" | "tab-stop" | "overlay" | "look" | "disabled";

/** The states a signal gives a component. */
export type SignalState = "hover" | "focus" | "pressed" | "open" | "disabled";

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
  /**
   * For an overlay: the function that renders it, as the source names it (`hoverCard`,
   * `dayPeekOverlay`, `Present`), so each overlay a component opens is told apart, and a
   * recipe that opens one names it (e2e/support/state-recipes.ts `StateRecipe.opens`).
   */
  overlay?: string;
  /**
   * For a disabled control: the ways it is disabled, apart from what renders it (`gates`),
   * each with the component's props its value is true only with (`disabled`, `withInput`)
   * and the keys of the data it reads (`item.disabled`), which an example writes in the items
   * it passes (`{ label: "Archive", disabled: true }`); `disabled || loading` has two. A way
   * with neither is the component disabling it by itself (a stepper's minus at its minimum, a
   * carousel's previous arrow on its first slide).
   */
  disabledBy?: DisabledBy;
  /**
   * For a disabled control rendered inside an overlay the component opens: that overlay, by
   * the name its own signal carries (`overlay`). Absent for one on the component's own surface.
   */
  within?: string;
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
const HOVER_PROPS = new Set(["onHoverIn", "onHoverOut", "onPointerEnter", "onPointerLeave"]);
const LOOK_INPUTS: Record<string, SignalState> = { pressed: "pressed", hovered: "hover", focused: "focus" };
/** The roles react-native-web makes a tab stop on any element (createDOMProps), unless `focusable={false}`; "link" is the link signal's. */
const TAB_STOP_ROLES = new Set(["button", "checkbox", "radio", "switch", "textbox"]);
/** The overlay primitives: React Native's Modal and the style layer's anchored card and portal. */
const OVERLAY_TAGS = new Set(["Modal", "AnchoredOverlay", "Portal"]);
/** The props a kit overlay component opens on. */
const OPEN_PROPS = ["open", "visible"];
/** The props that disable a primitive outright; an `accessibilityState` disables it through its `disabled`. */
const DISABLED_PROPS = new Set(["disabled", "aria-disabled"]);

/** One way a disabled value is true: the props it is true only with, and the keys of the data it reads. */
export interface DisabledWay {
  props: string[];
  keys: string[];
}

/** The ways a disabled value is true (`disabled || loading` has two); it is when any one of them holds. */
export type DisabledBy = DisabledWay[];

/**
 * The overlay a node renders inside: its name (the one the overlay's own signal carries), and
 * the component's props that, passed, keep it closed (`disabled`, for a menu whose `const
 * open = !disabled && ...`).
 */
interface Around {
  name: string;
  closedBy: string[];
}

/**
 * Whether a disabled control inside an overlay is never on the page: the overlay is kept
 * closed whenever the control renders (a gate that closes it), or whichever way the control
 * is disabled (a Select's option rows, disabled with the Select, whose list never opens then).
 */
const shutIn = (around: Around, gates: readonly string[], ways: DisabledBy): boolean =>
  gates.some((prop) => around.closedBy.includes(prop)) || ways.every((way) => way.props.some((prop) => around.closedBy.includes(prop)));

/** True with nothing in particular: the component disables the control by itself. */
const BY_ITSELF: DisabledBy = [{ props: [], keys: [] }];
const uniqueWays = (ways: DisabledBy): DisabledBy => {
  const seen = new Map<string, DisabledWay>();
  for (const way of ways) {
    const tidy = { props: [...new Set(way.props)].sort(), keys: [...new Set(way.keys)].sort() };
    seen.set(JSON.stringify(tidy), tidy);
  }
  return [...seen.values()];
};
/** True when both are: every way of one beside every way of the other. */
const allOf = (a: DisabledBy, b: DisabledBy): DisabledBy => uniqueWays(a.flatMap((x) => b.map((y) => ({ props: [...x.props, ...y.props], keys: [...x.keys, ...y.keys] }))));
/** True when either is. */
const anyOf = (a: DisabledBy, b: DisabledBy): DisabledBy => uniqueWays([...a, ...b]);

/**
 * A prop an element is given, written on its tag or spread onto it. `value` is null for a
 * bare attribute (`accessible`, which is true) or a method; `module` is where the value is
 * written (a spread can bring it from a helper or a hook in another module); `gates` are the
 * props the spread's own conditions say were passed for it to be given.
 */
interface Attr {
  name: string;
  value: ts.Expression | null;
  module: Parsed;
  node: ts.Node;
  /** The attribute on the tag it came in on: itself, or the spread that brought it. */
  site: ts.Node;
  gates: string[];
}

/** An object literal a value can be, with the module it is written in and the props its conditions say were passed. */
interface ObjectValue {
  literal: ts.ObjectLiteralExpression;
  module: Parsed;
  gates: string[];
}

/** An expression in the module it is written in, with the props its conditions say were passed. */
interface Located {
  expr: ts.Expression;
  module: Parsed;
  gates: string[];
}

const isLiteralFalse = (value: ts.Expression | null): boolean => !!value && unwrap(value).kind === ts.SyntaxKind.FalseKeyword;
const isLiteralTrue = (value: ts.Expression | null): boolean => value === null || unwrap(value).kind === ts.SyntaxKind.TrueKeyword;
/** `-1` (or `"-1"`), as a tab index is written. */
function isMinusOne(value: ts.Expression | null): boolean {
  if (!value) return false;
  const v = unwrap(value);
  if (ts.isPrefixUnaryExpression(v) && v.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(v.operand)) return v.operand.text === "1";
  return ts.isStringLiteral(v) && v.text === "-1";
}
const isNullish = (value: ts.Expression): boolean => {
  const v = unwrap(value);
  return v.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(v) && v.text === "undefined");
};

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
    // `!!props.responsive`: truthy when `!props.responsive` is falsy.
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) return this.falsyProps(module, e.operand);
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
      // A kind picked from the props (`kind === "split"`, `const kind = kindOf(props)`): the props that pick it.
      if (op === ts.SyntaxKind.EqualsEqualsEqualsToken || op === ts.SyntaxKind.EqualsEqualsToken) {
        const left = unwrap(e.left);
        const right = unwrap(e.right);
        const literal = ts.isStringLiteral(right) ? right : ts.isStringLiteral(left) ? left : null;
        if (literal) return this.pickedBy(module, literal === right ? e.left : e.right, literal.text) ?? [];
      }
      return [];
    }
    const prop = this.propOf(module, e);
    if (prop) return [prop];
    // A local alias: a value (`const pressStep = onStepPress ? (i) => ... : undefined`) or a
    // condition (`const isElementTrigger = children != null`).
    if (ts.isIdentifier(e)) {
      const binding = module.reader.resolve(e);
      if (binding?.kind === "const" && binding.path.length === 0 && binding.decl.initializer) {
        const init = binding.decl.initializer;
        return [...new Set([...(this.passedProps(module, init) ?? []), ...this.truthyProps(module, init)])];
      }
    }
    return [];
  }

  /**
   * The props a value must have been given for it to be the string `text`: null when it
   * never is, [] when it is with nothing in particular. Read through a local constant, a
   * conditional (`split ? "split" : ...`) and a local helper that picks a kind from the props
   * object it is handed (`kindOf(props)`, whose `if (p.split) return "split"` says `split`);
   * where several paths give it, only the props every one needs.
   */
  private pickedBy(module: Parsed, expr: ts.Expression, text: string, depth = 0): string[] | null {
    const e = unwrap(expr);
    if (depth > 6) return [];
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text === text ? [] : null;
    const common = (paths: (string[] | null)[]): string[] | null => {
      const open = paths.filter((p): p is string[] => p !== null);
      if (!open.length) return null;
      return open.reduce((a, b) => a.filter((prop) => b.includes(prop)));
    };
    if (ts.isConditionalExpression(e)) {
      const yes = this.pickedBy(module, e.whenTrue, text, depth + 1);
      const no = this.pickedBy(module, e.whenFalse, text, depth + 1);
      return common([yes && [...yes, ...this.truthyProps(module, e.condition)], no && [...no, ...this.falsyProps(module, e.condition)]]);
    }
    if (ts.isIdentifier(e) && !this.propOf(module, e)) {
      const binding = module.reader.resolve(e);
      if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer) return this.pickedBy(module, binding.decl.initializer, text, depth + 1);
      return [];
    }
    if (ts.isCallExpression(e) && ts.isIdentifier(unwrap(e.expression))) {
      const callee = unwrap(e.expression) as ts.Identifier;
      const binding = module.reader.resolve(callee);
      const fn = binding?.kind === "function" ? binding.decl : binding?.kind === "const" && !binding.path.length && binding.decl.initializer ? functionOf(binding.decl.initializer) : null;
      if (!fn?.body) return [];
      // The helper's parameters handed the component's own props object.
      const handed = new Set<ts.Node>();
      fn.parameters.forEach((param, i) => {
        const arg = e.arguments[i] ? unwrap(e.arguments[i]!) : null;
        if (!arg || !ts.isIdentifier(arg) || !ts.isIdentifier(param.name)) return;
        const source = module.reader.resolve(arg);
        const first = source?.kind === "param" ? source.fn.parameters[0] : undefined;
        if (source?.kind === "param" && isComponentFunction(source.fn) && first && ts.isIdentifier(first.name) && first.name === source.id) handed.add(param.name);
      });
      // A condition on the helper's parameter (`p.split`, `!!p.split`): the props it reads.
      const reads = (cond: ts.Expression): string[] => {
        const c = unwrap(cond);
        if (ts.isPrefixUnaryExpression(c) && c.operator === ts.SyntaxKind.ExclamationToken) {
          const inner = unwrap(c.operand);
          return ts.isPrefixUnaryExpression(inner) && inner.operator === ts.SyntaxKind.ExclamationToken ? reads(inner.operand) : [];
        }
        if (ts.isBinaryExpression(c) && c.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return [...reads(c.left), ...reads(c.right)];
        if (ts.isPropertyAccessExpression(c) && ts.isIdentifier(c.expression)) {
          const owner = module.reader.resolve(c.expression);
          if (owner?.kind === "param" && owner.fn === fn && handed.has(owner.id)) return [c.name.text];
        }
        return [];
      };
      const paths: (string[] | null)[] = [];
      for (const result of bodyResults(fn)) {
        if (this.pickedBy(module, result, text, depth + 1) === null) continue;
        // The ifs around the return statement that gives it.
        const props: string[] = [];
        for (let current: ts.Node = result; current !== fn.body && current.parent; current = current.parent) {
          const parent = current.parent;
          if (ts.isIfStatement(parent) && parent.thenStatement === current) props.push(...reads(parent.expression));
        }
        paths.push(props);
      }
      return common(paths);
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

  /**
   * The ways a disabled value is true: null when it never is (`false`, `undefined`), else each
   * way with the props it is true only with (`disabled`, `!!disabled`, `disabled ? true :
   * undefined`, a local constant's condition such as `confirmGated = !!withInput && ...`) and
   * the keys of the data it reads (`item.disabled`, `!!action.disabled`, `item.disabled ||
   * undefined`); `disabled || loading` is true either way. A value the reader cannot follow
   * (`page <= 1`, a state) is true with nothing in particular: the component disables the
   * control by itself. `null` (a bare attribute) is true.
   */
  private disabledBy(module: Parsed, value: ts.Expression | null, depth = 0): DisabledBy | null {
    if (value === null) return BY_ITSELF;
    const v = unwrap(value);
    if (isNullish(v) || v.kind === ts.SyntaxKind.FalseKeyword) return null;
    if (v.kind === ts.SyntaxKind.TrueKeyword || depth > 6) return BY_ITSELF;
    if (ts.isPrefixUnaryExpression(v) && v.operator === ts.SyntaxKind.ExclamationToken) {
      const inner = unwrap(v.operand);
      // `!!x` is true when x is.
      if (ts.isPrefixUnaryExpression(inner) && inner.operator === ts.SyntaxKind.ExclamationToken) return this.disabledBy(module, inner.operand, depth + 1);
      return [{ props: this.falsyProps(module, v.operand), keys: [] }];
    }
    if (ts.isConditionalExpression(v)) return this.eitherSide(module, v, (side) => this.disabledBy(module, side, depth + 1), depth);
    if (ts.isBinaryExpression(v)) {
      const op = v.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        const l = this.disabledBy(module, v.left, depth + 1);
        const r = this.disabledBy(module, v.right, depth + 1);
        return l && r ? allOf(l, r) : null;
      }
      if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) {
        const l = this.disabledBy(module, v.left, depth + 1);
        const r = this.disabledBy(module, v.right, depth + 1);
        return l && r ? anyOf(l, r) : (l ?? r);
      }
      return BY_ITSELF;
    }
    if (ts.isPropertyAccessExpression(v)) {
      const prop = this.propOf(module, v);
      if (prop) return [{ props: [prop], keys: [] }];
      // A member of the data the component is handed: the key an example writes in an item.
      const owner = this.propOf(module, v.expression);
      return [{ props: owner ? [owner] : [], keys: [v.name.text] }];
    }
    if (ts.isIdentifier(v)) {
      const prop = this.propOf(module, v);
      if (prop) return [{ props: [prop], keys: [] }];
      const binding = module.reader.resolve(v);
      if (binding?.kind === "const" && binding.decl.initializer) {
        if (!binding.path.length) return this.disabledBy(module, binding.decl.initializer, depth + 1);
        // `const { disabled } = item`: the key, when it is not the component's own props.
        const key = binding.path[binding.path.length - 1];
        const init = unwrap(binding.decl.initializer);
        if (binding.path.length === 1 && typeof key === "string" && ts.isIdentifier(init)) {
          const source = module.reader.resolve(init);
          if (!(source?.kind === "param" && isComponentFunction(source.fn))) return [{ props: [], keys: [key] }];
        }
      }
    }
    return BY_ITSELF;
  }

  /**
   * The ways a conditional is true, from the ways each side is (`read`): the true side's
   * with what makes the condition true, the false side's with what makes it false. Null
   * when neither side ever is.
   */
  private eitherSide(module: Parsed, v: ts.ConditionalExpression, read: (side: ts.Expression) => DisabledBy | null, depth: number): DisabledBy | null {
    const yes = read(v.whenTrue);
    const no = read(v.whenFalse);
    const condition = yes ? this.disabledBy(module, v.condition, depth + 1) : null;
    const ways = [...(yes && condition ? allOf(condition, yes) : []), ...(no ? allOf([{ props: this.falsyProps(module, v.condition), keys: [] }], no) : [])];
    return ways.length ? uniqueWays(ways) : null;
  }

  /** The ways an `accessibilityState`'s `disabled` is true, or null when it has none the reader can read. */
  private stateDisabled(module: Parsed, value: ts.Expression | null, depth = 0): DisabledBy | null {
    if (!value || depth > 6) return null;
    const v = unwrap(value);
    if (ts.isObjectLiteralExpression(v)) {
      for (const property of v.properties) {
        const name = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
        if (name !== "disabled") continue;
        if (ts.isPropertyAssignment(property)) return this.disabledBy(module, property.initializer, depth + 1);
        if (ts.isShorthandPropertyAssignment(property)) return this.disabledBy(module, property.name, depth + 1);
      }
      return null;
    }
    if (ts.isConditionalExpression(v)) return this.eitherSide(module, v, (side) => this.stateDisabled(module, side, depth + 1), depth);
    if (ts.isIdentifier(v)) {
      const binding = module.reader.resolve(v);
      if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer) return this.stateDisabled(module, binding.decl.initializer, depth + 1);
    }
    return null;
  }

  /**
   * The component's props that, passed, make an overlay's open value false: `!disabled`, and
   * either side of `&&` (`const open = !disabled && (openProp ?? internalOpen)`).
   */
  private closedBy(module: Parsed, expr: ts.Expression, depth = 0): string[] {
    const e = unwrap(expr);
    if (depth > 6) return [];
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) return this.truthyProps(module, e.operand);
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return [...new Set([...this.closedBy(module, e.left, depth + 1), ...this.closedBy(module, e.right, depth + 1)])];
    if (ts.isIdentifier(e) && !this.propOf(module, e)) {
      const binding = module.reader.resolve(e);
      if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer) return this.closedBy(module, binding.decl.initializer, depth + 1);
    }
    return [];
  }

  /** Whether an overlay given these props can open: no open prop (a bare Modal or Portal), a bare `open`, or a value that can be there. */
  private opensWith(given: readonly Attr[]): Attr | true | null {
    const opened = given.find((a) => OPEN_PROPS.includes(a.name));
    if (!opened) return true;
    // A bare `open` is true; `open={false}` or `open={undefined}` never opens it.
    return opened.value === null || (!isLiteralFalse(opened.value) && this.passedProps(opened.module, opened.value) !== null) ? opened : null;
  }

  /**
   * The overlay a node renders inside (`Around`), or null on the component's own surface.
   * Read up the tree to `scope`: an overlay primitive the node is a child of, another kit
   * component given its open state, or a local or shared component that renders its
   * `children` inside one (AlertDialog's `Present`, whose own props are its business, so
   * nothing outside says what keeps it closed); a constant that holds the node is placed
   * where it is used (ActionSheet's `actionRows`, AlertDialog's `actionRow`).
   */
  private overlayAround(module: Parsed, node: ts.Node, scope: ts.Node, own: string, seen: Set<ts.Node> = new Set()): Around | null {
    for (let current: ts.Node = node; current !== scope && current.parent; current = current.parent) {
      const parent = current.parent;
      if (ts.isJsxElement(parent) && current !== parent.openingElement && current !== parent.closingElement) {
        const found = this.overlayOf(module, parent.openingElement, own, seen);
        if (found) return found;
      }
      if (ts.isVariableDeclaration(parent) && parent.initializer === current && ts.isIdentifier(parent.name)) {
        if (seen.has(parent)) return null;
        seen.add(parent);
        for (const use of usesOf(module, parent, scope)) {
          const found = this.overlayAround(module, use, scope, own, seen);
          if (found) return found;
        }
        return null;
      }
    }
    return null;
  }

  /** The overlay a JSX element opens around its children (`Around`), or null. */
  private overlayOf(module: Parsed, opening: ts.JsxOpeningElement, own: string, seen: Set<ts.Node>): Around | null {
    const tag = this.tagOf(module, opening.tagName, own);
    const around = (opened: Attr | true): Around => ({ name: renderedIn(module, opening), closedBy: opened !== true && opened.value ? this.closedBy(opened.module, opened.value) : [] });
    if (tag.place === "primitive") {
      const opens = OVERLAY_TAGS.has(tag.name) ? this.opensWith(this.attributes(module, opening.attributes.properties)) : null;
      return opens ? around(opens) : null;
    }
    if (tag.fn && (tag.place === "own" || tag.place === "shared")) {
      const name = this.childrenOverlay(tag.fn, own, seen);
      return name ? { name, closedBy: [] } : null;
    }
    const file = this.componentFile(module, opening.tagName);
    if (!file || !this.rendersOverlay(file)) return null;
    const opened = this.attributes(module, opening.attributes.properties).find((a) => OPEN_PROPS.includes(a.name));
    const opens = opened ? this.opensWith([opened]) : null;
    return opens ? around(opens) : null;
  }

  /** The overlay a local or shared component renders its `children` inside (`<Portal>{children}</Portal>`), by name, or null. */
  private childrenOverlay(fn: Fn, own: string, seen: Set<ts.Node>): string | null {
    if (seen.has(fn.node)) return null;
    seen.add(fn.node);
    if (!fn.node.parameters[0] || !fn.node.body) return null;
    const ofParam = (id: ts.Identifier) => {
      const binding = fn.module.reader.resolve(id);
      return binding?.kind === "param" && binding.fn === fn.node;
    };
    let found: string | null = null;
    const visit = (node: ts.Node): void => {
      if (found) return;
      const isChildren =
        (ts.isIdentifier(node) && node.text === "children" && !ts.isPropertyAccessExpression(node.parent) && !ts.isBindingElement(node.parent) && ofParam(node)) ||
        (ts.isPropertyAccessExpression(node) && node.name.text === "children" && ts.isIdentifier(node.expression) && ofParam(node.expression));
      if (isChildren) {
        found = this.overlayAround(fn.module, node, fn.node, own, seen)?.name ?? null;
        if (found) return;
      }
      ts.forEachChild(node, visit);
    };
    visit(fn.node.body);
    return found;
  }

  /** Every prop an element's attributes give it: the ones written on the tag, and the ones its spreads bring. */
  private attributes(module: Parsed, attrs: ts.NodeArray<ts.JsxAttributeLike>): Attr[] {
    const out: Attr[] = [];
    for (const attr of attrs) {
      if (ts.isJsxAttribute(attr)) {
        if (!ts.isIdentifier(attr.name)) continue;
        const init = attr.initializer;
        const value = !init ? null : ts.isJsxExpression(init) ? (init.expression ?? null) : ts.isStringLiteral(init) ? init : null;
        out.push({ name: attr.name.text, value, module, node: attr, site: attr, gates: [] });
      } else {
        for (const found of this.objectsOf({ expr: attr.expression, module, gates: [] }, new Set())) {
          out.push(...this.propertiesOf(found, attr));
        }
      }
    }
    return out;
  }

  /** The props an object literal holds, its own spreads followed. */
  private propertiesOf(found: ObjectValue, site: ts.Node, seen: Set<ts.Node> = new Set()): Attr[] {
    const out: Attr[] = [];
    for (const property of found.literal.properties) {
      const key = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
      if (ts.isPropertyAssignment(property) && key !== null) out.push({ name: key, value: property.initializer, module: found.module, node: property, site, gates: found.gates });
      else if (ts.isShorthandPropertyAssignment(property)) out.push({ name: property.name.text, value: property.name, module: found.module, node: property, site, gates: found.gates });
      else if (ts.isMethodDeclaration(property) && key !== null) out.push({ name: key, value: null, module: found.module, node: property, site, gates: found.gates });
      else if (ts.isSpreadAssignment(property)) {
        for (const inner of this.objectsOf({ expr: property.expression, module: found.module, gates: found.gates }, seen)) out.push(...this.propertiesOf(inner, site, seen));
      }
    }
    return out;
  }

  /**
   * The object literals a value can be: the literal itself, either side of a conditional
   * (gated by its condition), the right of `&&`, both sides of `??` and `||`, a constant's
   * initializer (or the member a destructuring takes of it), a member read of an object the
   * reader can follow, and what a local, shared or style-layer function (a hook) returns,
   * through `useMemo`. Anything else is none.
   */
  private objectsOf(located: Located, seen: Set<ts.Node>): ObjectValue[] {
    const { module, gates } = located;
    const e = unwrap(located.expr);
    if (seen.has(e)) return [];
    seen.add(e);
    if (ts.isObjectLiteralExpression(e)) return [{ literal: e, module, gates }];
    if (ts.isConditionalExpression(e)) {
      return [
        ...this.objectsOf({ expr: e.whenTrue, module, gates: [...gates, ...this.truthyProps(module, e.condition)] }, seen),
        ...this.objectsOf({ expr: e.whenFalse, module, gates: [...gates, ...this.falsyProps(module, e.condition)] }, seen),
      ];
    }
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return this.objectsOf({ expr: e.right, module, gates: [...gates, ...this.truthyProps(module, e.left)] }, seen);
      if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) {
        return [...this.objectsOf({ expr: e.left, module, gates }, seen), ...this.objectsOf({ expr: e.right, module, gates }, seen)];
      }
      return [];
    }
    if (ts.isIdentifier(e)) {
      const binding = module.reader.resolve(e);
      if (binding?.kind !== "const" || !binding.decl.initializer) return [];
      const init: Located = { expr: binding.decl.initializer, module, gates };
      if (!binding.path.length) return this.objectsOf(init, seen);
      // `const { target: hoverTarget } = useHover(...)`: the member the destructuring takes.
      return this.membersOf(init, binding.path, seen);
    }
    if (ts.isPropertyAccessExpression(e)) return this.membersOf({ expr: e.expression, module, gates }, [e.name.text], seen);
    if (ts.isCallExpression(e)) return this.returnsOf({ expr: e, module, gates }, seen).flatMap((r) => this.objectsOf(r, seen));
    return [];
  }

  /** The object literals the member at `path` of a value can be. */
  private membersOf(located: Located, path: (string | number)[], seen: Set<ts.Node>): ObjectValue[] {
    if (!path.length) return this.objectsOf(located, seen);
    const [key, ...rest] = path;
    const out: ObjectValue[] = [];
    for (const found of this.objectsOf(located, seen)) {
      for (const property of found.literal.properties) {
        const name = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
        if (name !== key) continue;
        const value = ts.isPropertyAssignment(property) ? property.initializer : ts.isShorthandPropertyAssignment(property) ? property.name : null;
        if (value) out.push(...this.membersOf({ expr: value, module: found.module, gates: found.gates }, rest, seen));
      }
    }
    return out;
  }

  /**
   * What a call returns, as expressions in the module the function is written in: React's
   * `useMemo` (its factory's result), or a function the component's own modules, a shared
   * family module or the style layer declares (its return statements, or an arrow's body).
   */
  private returnsOf(located: Located, seen: Set<ts.Node>): Located[] {
    const call = unwrap(located.expr) as ts.CallExpression;
    const callee = unwrap(call.expression);
    if (!ts.isIdentifier(callee)) return [];
    const binding = located.module.reader.resolve(callee);
    let fn: Fn | null = null;
    if (binding?.kind === "import" && binding.specifier === "react") {
      if (binding.imported !== "useMemo" || !call.arguments[0]) return [];
      const factory = unwrap(call.arguments[0]);
      return ts.isArrowFunction(factory) || ts.isFunctionExpression(factory) ? bodyResults(factory).map((expr) => ({ expr, module: located.module, gates: located.gates })) : [];
    }
    if (binding?.kind === "import") {
      const file = this.resolveImport(located.module.path, binding.specifier);
      if (file && this.isSourceOfReader(file)) fn = this.exported(file, binding.imported);
    } else if (binding?.kind === "function") fn = { node: binding.decl, module: located.module, name: callee.text };
    else if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer) {
      const node = functionOf(binding.decl.initializer);
      if (node) fn = { node, module: located.module, name: callee.text };
    }
    if (!fn || seen.has(fn.node)) return [];
    seen.add(fn.node);
    return bodyResults(fn.node).map((expr) => ({ expr, module: fn!.module, gates: located.gates }));
  }

  /** Whether the reader follows a call into this file: the kit's source (a component's modules, a shared family module, the style layer). */
  private isSourceOfReader(file: string): boolean {
    const rel = relative(this.root, file).split("\\").join("/");
    return rel.startsWith("src/");
  }

  /**
   * The module a tag's component comes from when it is another kit component: an import, or
   * a constant that names one (`const Drawer = parts.Drawer ?? WebDrawer`, a platform entry's
   * part with the web build as its default). Null for anything else.
   */
  private componentFile(module: Parsed, tag: ts.JsxTagNameExpression): string | null {
    if (!ts.isIdentifier(tag)) return null;
    const follow = (expr: ts.Expression, depth: number): string | null => {
      const e = unwrap(expr);
      if (depth > 4) return null;
      if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken || e.operatorToken.kind === ts.SyntaxKind.BarBarToken)) {
        return follow(e.right, depth + 1) ?? follow(e.left, depth + 1);
      }
      if (!ts.isIdentifier(e)) return null;
      const binding = module.reader.resolve(e);
      if (binding?.kind === "import") return this.resolveImport(module.path, binding.specifier);
      if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer) return follow(binding.decl.initializer, depth + 1);
      // A part a platform entry injects (`createAvatarMenu(skin, Dropdown)`): its default, or
      // the kit component its type names (`Dropdown: (props: DropdownProps) => ReactElement`).
      if (binding?.kind === "param") {
        const param = binding.fn.parameters.find((p) => boundNames(p.name).some((b) => b.id === binding.id));
        if (!param) return null;
        if (param.initializer) return follow(param.initializer, depth + 1);
        return param.type ? this.typeComponentFile(module, param.type) : null;
      }
      return null;
    };
    const file = follow(tag, 0);
    return file && this.isComponentModule(file) ? file : null;
  }

  /**
   * The kit component a type names: the first type it refers to that is imported (a type
   * import included, which the value reader does not bind) from another component's module.
   */
  private typeComponentFile(module: Parsed, type: ts.TypeNode): string | null {
    const importedFrom = (name: string): string | null => {
      for (const statement of module.sf.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
        const named = statement.importClause?.namedBindings;
        if (named && ts.isNamedImports(named) && named.elements.some((el) => el.name.text === name)) return statement.moduleSpecifier.text;
      }
      return null;
    };
    let found: string | null = null;
    const visit = (node: ts.Node): void => {
      if (found) return;
      if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
        const specifier = importedFrom(node.typeName.text);
        const file = specifier ? this.resolveImport(module.path, specifier) : null;
        if (file && this.isComponentModule(file)) found = file;
      }
      ts.forEachChild(node, visit);
    };
    visit(type);
    return found;
  }

  /** Whether a file is one of the kit components' own modules (not a family's shared module). */
  private isComponentModule(file: string): boolean {
    const parts = relative(this.root, file).split("\\").join("/").split("/");
    return parts[0] === "src" && this.groups.includes(parts[1]!) && parts.length > 3 && parts[2] !== "shared";
  }

  private readonly overlays = new Map<string, boolean>();

  /** Whether the component a module belongs to renders an overlay primitive anywhere in its own directory. */
  private rendersOverlay(file: string): boolean {
    const dir = dirname(file);
    const known = this.overlays.get(dir);
    if (known !== undefined) return known;
    let found = false;
    for (const path of walkFiles(dir).filter(isSourceModule)) {
      const module = this.parse(path);
      const visit = (node: ts.Node): void => {
        if (found) return;
        if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && OVERLAY_TAGS.has(node.tagName.getText(module.sf))) {
          if (this.tagOf(module, node.tagName, dir).place === "primitive") found = true;
        }
        ts.forEachChild(node, visit);
      };
      visit(module.sf);
      if (found) break;
    }
    this.overlays.set(dir, found);
    return found;
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
          const given = this.attributes(module, attrs);
          // Where a prop is written, and the props it is rendered under: those around the
          // element, those the spread it came in on was given under, and those its value is
          // there only with.
          const placed = (attr: Attr, extra: string[] = []) => ({
            at: this.at(attr.module, attr.node),
            gates: [...new Set([...this.gatesOf(module, attr.site, scope), ...attr.gates, ...extra])],
          });
          if (tag.name === "TextInput") add({ kind: "text-entry", state: "focus", what: "a TextInput" }, node);
          if (OVERLAY_TAGS.has(tag.name)) {
            const opens = this.opensWith(given);
            if (opens) {
              const opened = opens === true ? null : opens;
              const where = opened ? placed(opened, opened.value ? (this.passedProps(opened.module, opened.value) ?? []) : []) : { at: this.at(module, node), gates: this.gatesOf(module, node, scope) };
              out.push({ kind: "overlay", state: "open", what: `a <${tag.name}>`, via: [], ...where, overlay: renderedIn(module, node) });
            }
          }
          // The controls it disables: `disabled` and `aria-disabled` given a value that can be
          // true, and an `accessibilityState` whose `disabled` can be.
          let around: Around | null | undefined;
          for (const attr of given) {
            const by = DISABLED_PROPS.has(attr.name) ? this.disabledBy(attr.module, attr.value) : attr.name === "accessibilityState" ? this.stateDisabled(attr.module, attr.value) : null;
            if (!by) continue;
            const where = placed(attr);
            if (around === undefined) around = this.overlayAround(module, node, scope, own);
            if (around && shutIn(around, where.gates, by)) continue;
            out.push({ kind: "disabled", state: "disabled", what: `${attr.name} on <${tag.name}>`, via: [], ...where, disabledBy: by, ...(around ? { within: around.name } : {}) });
          }
          const stop = tabStop(tag.name, given);
          if (stop) {
            // A role reached only under a condition (`accessibilityRole={onPress ? "button" : undefined}`) is gated by it.
            const where = stop.attr ? placed(stop.attr, stop.literal ? this.gatesOf(stop.attr.module, stop.literal, stop.attr.node) : []) : { at: this.at(module, node), gates: this.gatesOf(module, node, scope) };
            out.push({ kind: "tab-stop", state: "focus", what: stop.what, via: [], ...where });
          }
          for (const attr of given) {
            const prop = attr.name;
            const value = attr.value;
            // `onPress={undefined}` is no handler.
            if (value && this.passedProps(attr.module, value) === null) continue;
            const extra = value ? (this.passedProps(attr.module, value) ?? []) : [];
            const signal = (kind: SignalKind, state: SignalState, element?: ElementFacts) => {
              out.push({ kind, state, what: `${prop} on <${tag.name}>`, via: [], ...placed(attr, extra), ...(element ? { element } : {}) });
            };
            const facts = (): ElementFacts => elementFacts(given, attr);
            if (PRESS_PROPS.has(prop)) signal("press", "pressed", facts());
            else if (RESPONDER_PROPS.has(prop)) signal("responder", "pressed", facts());
            else if (HOVER_PROPS.has(prop)) signal("hover-in", "hover", facts());
            else if (prop === "href") signal("link", "focus");
            else if ((prop === "accessibilityRole" || prop === "role") && value) {
              // `accessibilityRole={anchor ? "link" : undefined}`: a link where the literal is reached.
              const literal = findLiteral(value, "link");
              if (literal) {
                const where = placed(attr);
                out.push({ kind: "link", state: "focus", what: `${prop} "link" on <${tag.name}>`, at: where.at, via: [], gates: attr.site === attr.node ? this.gatesOf(module, literal, scope) : [...new Set([...where.gates, ...this.gatesOf(attr.module, literal, attr.node)])] });
              }
            }
          }
        } else if (tag.fn && (tag.place === "shared" || skip.has(tag.fn.node))) {
          this.inherit(out, module, node, scope, tag.fn, own, attrs, skip);
        } else {
          // Another kit component given its open state by this one: an overlay this component opens.
          const file = this.componentFile(module, node.tagName);
          const given = file ? this.attributes(module, attrs) : [];
          const handed = (attr: Attr, extra: string[]) => ({
            at: this.at(attr.module, attr.node),
            gates: [...new Set([...this.gatesOf(module, attr.site, scope), ...attr.gates, ...extra])],
          });
          if (file && this.rendersOverlay(file)) {
            const opened = given.find((a) => OPEN_PROPS.includes(a.name));
            if (opened && this.opensWith([opened])) {
              out.push({
                kind: "overlay",
                state: "open",
                what: `a <${tag.name}> (an overlay) given \`${opened.name}\``,
                via: [],
                ...handed(opened, opened.value ? (this.passedProps(opened.module, opened.value) ?? []) : []),
                overlay: renderedIn(module, node),
              });
            }
          }
          // Another kit component disabled by this one (AlertDialog's confirm Button, until its token is typed).
          const disabled = given.find((a) => a.name === "disabled");
          const by = disabled ? this.disabledBy(disabled.module, disabled.value) : null;
          if (disabled && by) {
            const where = handed(disabled, []);
            const around = this.overlayAround(module, node, scope, own);
            if (!(around && shutIn(around, where.gates, by))) out.push({ kind: "disabled", state: "disabled", what: `disabled on <${tag.name}>`, via: [], ...where, disabledBy: by, ...(around ? { within: around.name } : {}) });
          }
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
    const valueAt = (attr: ts.JsxAttribute) => (attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression ? attr.initializer.expression : null);
    const attrNamed = (name: string) => attrs?.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && ts.isIdentifier(a.name) && a.name.text === name);
    // The disabled controls the function renders sit inside whatever overlay the use is in.
    let siteOverlay: Around | null | undefined;
    const overlayAtSite = () => (siteOverlay === undefined ? (siteOverlay = this.overlayAround(module, site, scope, own)) : siteOverlay);
    for (const signal of inner) {
      let gates: string[] | null = [...around];
      if (attrs) {
        for (const gate of signal.gates) {
          const attr = attrNamed(gate);
          if (!attr) {
            // A spread may pass it; nothing else does.
            if (!attrs.some(ts.isJsxSpreadAttribute)) gates = null;
            break;
          }
          const value = valueAt(attr);
          const passed = value ? this.passedProps(module, value) : [];
          if (passed === null) {
            gates = null;
            break;
          }
          gates.push(...passed);
        }
      }
      if (gates === null) continue;
      const placed: Partial<Signal> = {};
      if (signal.disabledBy) {
        // What disables it, through the values the use gives the props it is true with
        // (`disabled={!!disabled}`, `disabled={item.disabled}`); one never given, or given a
        // value that is never true, never disables it.
        const by = attrs ? this.disabledThrough(module, signal.disabledBy, attrs, valueAt, attrNamed) : signal.disabledBy;
        if (!by) continue;
        placed.disabledBy = by;
        if (signal.within) placed.within = signal.within;
        else {
          // Placed where the use is: inside the overlay around it, unless that overlay is kept closed whenever it is disabled.
          const around = overlayAtSite();
          if (around && shutIn(around, gates, by)) continue;
          if (around) placed.within = around.name;
        }
      }
      out.push({ ...signal, via: [fn.name, ...signal.via], gates: [...new Set(gates)], ...placed });
    }
  }

  /**
   * A local component's `disabledBy` in the props of the component that uses it: each prop a
   * way needs, read through the value the use gives it. A way the use never takes (its prop
   * is not given and no spread could give it, or is given a value that is never true) is
   * dropped; null when none is left. A prop a spread may give says nothing in particular.
   */
  private disabledThrough(
    module: Parsed,
    inner: DisabledBy,
    attrs: ts.NodeArray<ts.JsxAttributeLike>,
    valueAt: (attr: ts.JsxAttribute) => ts.Expression | null,
    attrNamed: (name: string) => ts.JsxAttribute | undefined,
  ): DisabledBy | null {
    const ways: DisabledWay[] = [];
    for (const way of inner) {
      let here: DisabledBy | null = [{ props: [], keys: way.keys }];
      for (const prop of way.props) {
        const attr = attrNamed(prop);
        if (!attr) {
          if (!attrs.some(ts.isJsxSpreadAttribute)) here = null;
          if (!here) break;
          continue;
        }
        const by = this.disabledBy(module, valueAt(attr));
        here = by ? allOf(here, by) : null;
        if (!here) break;
      }
      if (here) ways.push(...here);
    }
    return ways.length ? uniqueWays(ways) : null;
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
      const key = `${s.kind}|${s.state}|${s.what}|${s.at}|${s.via.join(">")}|${[...s.gates].sort().join(",")}|${s.disabledBy ? JSON.stringify(s.disabledBy) : ""}|${s.within ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * The signals a raw primitive's rail examples give it: the handler props, `href`, a pressed
   * look and a disabling prop (disabled by itself as a prop, since the example that passes it
   * is the one that shows it) on its own tag (`tag`, the component's name), and the tag itself when it
   * is the TextInput. The props are read as a source's are, written on the tag or spread onto
   * it from a value the example's own code lets the reader follow. `where` names the
   * markdown, for `at`.
   */
  exampleSignals(tag: string, examples: readonly { label: string; code: string }[], where: string): Signal[] {
    const signals: Signal[] = [];
    for (const example of examples) {
      const sf = ts.createSourceFile("example.tsx", `const example = (<>\n${example.code}\n</>);\n`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const at = `${where} (${example.label})`;
      const module: Parsed = { path: join(this.root, where), sf, reader: new StaticReader(sf) };
      const visit = (node: ts.Node): void => {
        if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(sf) === tag) {
          const add = (kind: SignalKind, state: SignalState, what: string) => signals.push({ kind, state, what, at, via: [], gates: [] });
          if (tag === "TextInput") add("text-entry", "focus", "a TextInput");
          const given = this.attributes(module, node.attributes.properties);
          const stop = tabStop(tag, given);
          if (stop) add("tab-stop", "focus", stop.what);
          for (const attr of given) {
            const prop = attr.name;
            if (PRESS_PROPS.has(prop)) add("press", "pressed", `${prop} on <${tag}>`);
            else if (HOVER_PROPS.has(prop)) add("hover-in", "hover", `${prop} on <${tag}>`);
            else if (prop === "href") add("link", "focus", `href on <${tag}>`);
            if (takesParameter(attr.value ?? attr.node, "pressed")) add("look", "pressed", `a function taking \`pressed\` on <${tag}>`);
            // A control the example disables: rendered so only with the prop it passes.
            const by = DISABLED_PROPS.has(prop) ? this.disabledBy(module, attr.value) : prop === "accessibilityState" ? this.stateDisabled(module, attr.value) : null;
            if (by) signals.push({ kind: "disabled", state: "disabled", what: `${prop} on <${tag}>`, at, via: [], gates: [], disabledBy: [{ props: [prop], keys: [] }] });
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(sf);
    }
    return signals;
  }
}

/**
 * The name of the function a node is rendered in: a declaration's or a named function
 * expression's own name, or the constant, property or method an arrow is assigned to
 * (through memo() and forwardRef()); the module's file name when no function names it.
 */
function renderedIn(module: Parsed, node: ts.Node): string {
  for (let current = node.parent; current; current = current.parent) {
    if ((ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current)) && current.name) return current.name.text;
    if (ts.isMethodDeclaration(current) && ts.isIdentifier(current.name)) return current.name.text;
    if (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
      let holder: ts.Node = current.parent;
      while (ts.isCallExpression(holder) || ts.isParenthesizedExpression(holder) || ts.isAsExpression(holder)) holder = holder.parent;
      if ((ts.isVariableDeclaration(holder) || ts.isPropertyAssignment(holder)) && ts.isIdentifier(holder.name)) return holder.name.text;
    }
  }
  return module.path.split(/[\\/]/).pop()!;
}

/** The identifiers in `scope` that read the constant a declaration binds: its uses, not its own name or a property of the same name. */
function usesOf(module: Parsed, decl: ts.VariableDeclaration, scope: ts.Node): ts.Identifier[] {
  const name = (decl.name as ts.Identifier).text;
  const out: ts.Identifier[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === name && node !== decl.name) {
      const parent = node.parent;
      const isName =
        (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        (ts.isPropertyAssignment(parent) && parent.name === node) ||
        ts.isJsxAttribute(parent) ||
        ts.isBindingElement(parent);
      if (!isName) {
        const binding = module.reader.resolve(node);
        if (binding?.kind === "const" && binding.decl === decl) out.push(node);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(scope);
  return out;
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

/** What the props of the element a handler is on say about it. */
function elementFacts(given: readonly Attr[], handler: Attr): ElementFacts {
  const valueOf = (name: string): ts.Expression | null => {
    const attr = given.find((a) => a.name === name);
    return attr?.value ? unwrap(attr.value) : null;
  };
  const accessible = valueOf("accessible");
  const importance = valueOf("importantForAccessibility");
  const ariaHidden = valueOf("aria-hidden");
  const hidden =
    accessible?.kind === ts.SyntaxKind.FalseKeyword ||
    (!!importance && ts.isStringLiteral(importance) && importance.text.startsWith("no")) ||
    (!!ariaHidden && (ariaHidden.kind === ts.SyntaxKind.TrueKeyword || (ts.isStringLiteral(ariaHidden) && ariaHidden.text === "true")));
  const look = given.some((a) => !!a.value && takesParameter(a.value, "pressed"));
  const text = handler.value ? handler.value.getText(handler.module.sf) : handler.node.getText(handler.module.sf);
  return { hidden, look, handler: text.replace(/\s+/g, " ").slice(0, 120) };
}

/**
 * Whether react-native-web makes an element a tab stop, from the props the source gives it,
 * and the prop that says so (none for a Pressable, which is one by default). A Pressable is
 * one unless it is taken out (`focusable={false}`, which the kit's Pressable spells as tab
 * index -1; `tabIndex={-1}`; `disabled`); another primitive is one when it is given
 * `focusable` or tab index 0, or a role createDOMProps makes a tab stop, unless
 * `focusable={false}` or `tabIndex={-1}`. A value the reader cannot name counts as one: the
 * source can make it a tab stop. `href` and the link role are the link signal's.
 */
function tabStop(tag: string, given: readonly Attr[]): { what: string; attr: Attr | null; literal?: ts.Node } | null {
  const find = (name: string) => given.find((a) => a.name === name);
  const tabIndex = find("tabIndex");
  const focusable = find("focusable");
  const out = (tabIndex && isMinusOne(tabIndex.value)) || (focusable && isLiteralFalse(focusable.value));
  if (tag === "Pressable") {
    const disabled = find("disabled");
    if (out || (disabled && isLiteralTrue(disabled.value))) return null;
    return { what: "a tab stop: <Pressable>", attr: null };
  }
  if (tag === "TextInput" || out) return null;
  if (focusable && !isLiteralFalse(focusable.value)) return { what: `focusable on <${tag}>`, attr: focusable };
  if (tabIndex && tabIndex.value && !isMinusOne(tabIndex.value)) return { what: `tabIndex on <${tag}>`, attr: tabIndex };
  for (const name of ["accessibilityRole", "role"]) {
    const role = find(name);
    const literal = role?.value ? [...TAB_STOP_ROLES].map((r) => findLiteral(role.value!, r)).find(Boolean) : null;
    if (role && literal) return { what: `${name} "${(literal as ts.StringLiteral).text}" on <${tag}>`, attr: role, literal };
  }
  return null;
}

/** The expressions a function returns: an arrow's body, or every return statement outside the functions it holds. */
function bodyResults(fn: ts.FunctionLikeDeclaration): ts.Expression[] {
  if (!fn.body) return [];
  if (!ts.isBlock(fn.body)) return [fn.body];
  const out: ts.Expression[] = [];
  const visit = (node: ts.Node): void => {
    if (node !== fn.body && (ts.isFunctionLike(node) || ts.isClassLike(node))) return;
    if (ts.isReturnStatement(node) && node.expression) out.push(node.expression);
    ts.forEachChild(node, visit);
  };
  visit(fn.body);
  return out;
}

/** Whether a statement always returns (or throws). */
function returns(statement: ts.Statement): boolean {
  if (ts.isReturnStatement(statement) || ts.isThrowStatement(statement)) return true;
  if (ts.isBlock(statement)) return statement.statements.some(returns);
  return false;
}
