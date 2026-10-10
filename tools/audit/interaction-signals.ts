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
//               given a value that can be true, or a TextInput's `editable` given one that
//               can be false (`readOnly`: react-native-web renders that `readonly`, never
//               `aria-disabled` or a native `disabled`), on a primitive, or `disabled` handed to
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
// A signal on an element names that element (`control`): its tag, the function it is
// rendered in, the component's own functions whose tag it is the content of (Sidebar's rows
// sit in `SidebarRowFrame`, their hover target), and the ARIA roles the page gives it, as
// react-native-web maps them (`adjustable` is `slider`), `textbox` for a text field, none
// where the role is given only under a condition. That is what a recipe acts on:
// tools/audit/state-coverage.ts holds each recipe's control to the component's own controls
// where it is applied (FilterPanel's focus is its option rows, not the Clear it hands to a
// kit Button). Another kit component the component disables is its control for the disabled
// state alone (`kit`). A control also names the feedback it is given that only a device
// draws, where that is all it shows of a state, and the builds in which it is (`deviceOnly`,
// `DEVICE_FEEDBACK`): Dialog's Android text buttons press with `android_ripple` and nothing
// else, which react-native-web never draws, while its iOS capsules, given no ripple, dim
// under a style function reading `pressed`. A signal on no element written in a component
// or a hook (the hover primitive's call, a PanResponder) names that function (`in`); one
// written in neither (a skin's function taking `pressed`) is the component's whole look.
// Every signal rendered inside an overlay the component opens is placed there (`within`), as
// a disabled control is, and one rendered both on the surface and inside an overlay
// (FilterPanel's rows, on the panel and in the drawer it becomes) is a signal in each place.
// Another kit component given its open state holds the content between its tags inside its
// overlay only when its own source renders `children` there: a Drawer's content is in the
// drawer, a Dropdown's is its trigger. A component the component's own factory builds and
// renders as a tag (Sidebar's `const SidebarDrillDown = createSidebarDrillDown(skin, Badge)`,
// the function the factory returns) is read where it is used, as a local component is: the
// drill-down's rows are inside the Drawer the Sidebar opens, not on its own surface.
//
// A signal also says which platform builds render it (`builds`): a component is built once
// per platform by its entries (`dialog.tsx`, `dialog.ios.tsx`, `dialog.android.tsx`, each
// `createDialog(<skin>, <parts>)`), and a shell renders different controls per skin
// (Dialog's iOS capsules under `skin.footerKind === "capsules"`, its Android text buttons
// under `skin.textButton != null`, the web's kit Buttons otherwise). The conditions around
// a signal that read a factory's parameters are evaluated with each entry's arguments (the
// skin objects read from their modules with the static evaluator, tools/audit/static-eval.ts),
// through a constant used where it is placed, an early return, and a factory a factory calls
// (`createSidebarDrillDown(skin, Badge)` takes each entry's skin through `createSidebar`); a
// build whose arguments make one of them go the other way does not render it. A condition
// the evaluator cannot read keeps every build, as does a condition in a family's shared
// module, whose skin is each caller's. The docs' three-up shows each build in a row of its
// own (tools/audit/state-coverage.ts maps the rows to the builds), so a control a build
// alone renders is on that row alone.
//
// A signal can be gated: rendered only when the component is given a prop (`onItemPress`
// makes a Feeds row a button; `onStepPress` makes a step circle pressable). The gates are
// read from the conditions around the signal (an if, a ternary, `&&`, an early return)
// that test one of the component's props, through a local constant's value (`const onPress
// = onPressItem ? ... : undefined`), and are followed through the local components and
// shared modules the signal is reached through (a step circle is pressable when its own
// `onPress` is given, and Steps gives it one only when it has `onStepPress`; `children`
// given between the tags is given). A look is gated by the props every read of its input
// is guarded by (`onEventPress && pressed ? dim : null`). A gate the reader cannot follow is
// dropped, which only ever makes a signal unconditional. A render helper's parameter decides
// what it renders at each call written with a literal (the Calendar's `eventLayer(...,
// false)` gives the blocks in its day peek no hover). A prop given on one side of a condition
// (`{...(kitBar ? hidden : button)}`) is given only sometimes: it does not take an element out
// of the tab order. The web's tab stops read a `Platform.select` for the web, and a
// TextInput is disabled with `editable`, React Native's text field having no `disabled`.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import propsToAriaRole from "react-native-web/dist/modules/AccessibilityUtil/propsToAriaRole.js";
import ts from "typescript";
import { StaticReader, UNKNOWN, boundNames, outermost, pick, unwrap, type Binding, type Env } from "./static-eval.ts";

/**
 * The platform builds a component is made in, one per entry: `<name>.tsx` (the web's, the
 * base Metro falls back to), `<name>.ios.tsx` and `<name>.android.tsx`, each calling the
 * shell's factory with its own skin and parts.
 */
export const BUILDS = ["web", "ios", "android"] as const;
export type Build = (typeof BUILDS)[number];

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
   * For a signal rendered inside an overlay the component opens (a menu's rows, a dialog's
   * buttons, a disabled item): that overlay, by the name its own signal carries (`overlay`).
   * Absent for one on the component's own surface.
   */
  within?: string;
  /**
   * For a disabled control: disabled only as React Native's text field is, through a
   * TextInput's `editable`, which react-native-web renders `readonly` and never
   * `aria-disabled` or a native `disabled`, so the page never says the field is disabled.
   */
  readOnly?: true;
  /** For a signal on an element: that element, the control a recipe acts on. */
  control?: Control;
  /**
   * For a signal on no element written in a component or a hook (the hover primitive's call
   * in `MenuRow`, a PanResponder in `Slider`): that function, as the source names it, which a
   * control's own (`Control.in`) is held to. Absent for one written in neither (a skin's
   * function taking `pressed`): it is the component's whole look.
   */
  in?: string;
  /**
   * The platform builds that render it, in `BUILDS` order, when not every build the
   * component has does: Dialog's iOS capsules are the iOS build's alone, its Android text
   * buttons the Android build's (`skin.footerKind`, `skin.textButton`). Absent when every
   * build renders it, or the component has one build.
   */
  builds?: Build[];
}

/** A component's entry for one platform build: the build, its module, and the names it exports. */
export interface BuildEntry {
  build: Build;
  /** The entry module, repo-relative. */
  file: string;
  exports: string[];
}

/**
 * The element a signal is on, as the source writes it: the control a recipe acts on
 * (e2e/support/state-recipes.ts `StateRecipe.control`), told apart from the controls of
 * another kit component the component renders.
 */
export interface Control {
  /** Its tag (`Pressable`, `TextInput`, or `Button` for another kit component it disables). */
  tag: string;
  /** The function it is rendered in, as the source names it (`OptionRow`, `MenuRow`, `Dropdown`). */
  in: string;
  /**
   * The ARIA roles the page gives it, as react-native-web renders them: each string its
   * `accessibilityRole` or `role` can be (through constants and conditionals), mapped the way
   * react-native-web maps it (`adjustable` is `slider`, `header` is `heading`); where it can
   * be given none, the tag's own (`textbox` for a TextInput); `link` with `href`. For another
   * kit component, the roles of the controls its own source disables. Empty for an element
   * with no role (a bare Pressable, a focusable View).
   */
  roles: string[];
  /** Whether a role is given that the reader cannot read (a parameter, a computed value): any role may be it. */
  roleUnread?: true;
  /** Whether it renders with no role where its role is given only under a condition (`onEventPress ? "button" : undefined`). */
  noRole?: true;
  /**
   * The component's own functions it is rendered inside, as their tag's content, nearest
   * first: Sidebar's nav rows sit in `SidebarRowFrame`, the hover target that washes them.
   */
  inside?: string[];
  /** Another kit component the component disables (AlertDialog's confirm Button): its hover, focus and press are its own. */
  kit?: true;
  /**
   * The feedback it is given that only a device draws (`DEVICE_FEEDBACK`), where that is all
   * it shows of a state: Dialog's Android text buttons press with `android_ripple` alone.
   */
  deviceOnly?: DeviceOnly[];
  /** Where its tag is, `path:line`, repo-relative. */
  at: string;
}

/**
 * A control's feedback for a state that only a device draws, and the builds in which it is
 * all the control shows of that state: the prop is given a value the reader knows is not
 * empty there, and nothing else the control is given can change what the web draws while the
 * state holds (`DeviceFeedback.looks`, `DeviceFeedback.handlers`).
 */
export interface DeviceOnly {
  prop: string;
  state: SignalState;
  /** The platform whose devices draw it (`DeviceFeedback.platform`). */
  platform: DeviceFeedback["platform"];
  /** The builds in which it is all the control shows of the state, in `BUILDS` order; absent when it is in every build the component has (always, for a component with one build). */
  builds?: Build[];
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

/**
 * Feedback a prop gives a control that only a device draws: the prop, the state it is the
 * feedback of, the platform whose devices draw it (the row of the docs' three-up that stands
 * for them), and what else on the control could change what the web draws while that state
 * holds, so the prop's feedback would not be all it shows: a function of the control reading
 * one of `looks`, or one of `handlers` given to it.
 */
export interface DeviceFeedback {
  prop: string;
  state: "hover" | "focus" | "pressed";
  platform: "ios" | "android";
  looks: readonly string[];
  handlers: readonly string[];
}

/**
 * The feedback the web runner can never see. It renders every row of the docs' three-up
 * through react-native-web, which drops `android_ripple` (its Pressable hands the prop to no
 * element), so the ripple an Android device draws under a held press is never on its page.
 * While a press is held on the web, a style function reading `pressed` repaints the control,
 * and so does one reading `focused` (a pointer press focuses a Pressable there), as can a
 * handler that runs as the press goes down or while it is held (`onPressIn`, `onLongPress`, a
 * raw responder); `onPress` runs once the press comes up, and `onPressOut` as it ends.
 */
export const DEVICE_FEEDBACK: readonly DeviceFeedback[] = [
  { prop: "android_ripple", state: "pressed", platform: "android", looks: ["pressed", "focused"], handlers: ["onPressIn", "onLongPress", ...RESPONDER_PROPS] },
];

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
  /** Brought by one side of a condition (`{...(kitBar ? a : b)}`): the element is given it only sometimes. */
  conditional?: true;
  /** What it needs of a render helper's arguments to be given (`Requirement`). */
  requires?: Requirement[];
}

/**
 * What a value needs of an argument: it is given only when a parameter of the component's
 * own render helper is truthy (`hoverable ? hoverProps : {}` in `eventLayer`), or falsy. The
 * call the element is reached through decides it (`eventLayer(peekDay, true, rs, re, false)`).
 */
interface Requirement {
  fn: ts.SignatureDeclaration;
  index: number;
  truthy: boolean;
}

/**
 * Where a node renders: inside an overlay (`around`), or on the component's own surface
 * (null), with the calls of the component's render helpers it is reached through, whose
 * arguments decide what renders there.
 */
interface Placement {
  around: Around | null;
  calls: ts.CallExpression[];
}

/** An object literal a value can be, with the module it is written in and the props its conditions say were passed. */
interface ObjectValue {
  literal: ts.ObjectLiteralExpression;
  module: Parsed;
  gates: string[];
  /** Reached through one side of a condition, so only sometimes what the value is. */
  conditional?: true;
  requires?: Requirement[];
}

/** An expression in the module it is written in, with the props its conditions say were passed. */
interface Located {
  expr: ts.Expression;
  module: Parsed;
  gates: string[];
  conditional?: true;
  requires?: Requirement[];
}

const isLiteralFalse = (value: ts.Expression | null): boolean => !!value && unwrap(value).kind === ts.SyntaxKind.FalseKeyword;
const isLiteralTrue = (value: ts.Expression | null): boolean => value === null || unwrap(value).kind === ts.SyntaxKind.TrueKeyword;
/**
 * The value a prop has on the web: a `Platform.select` table's `web` entry (or its `default`),
 * since the tab stops the reader reads are react-native-web's; any other value as written.
 */
function onTheWeb(value: ts.Expression): ts.Expression {
  const v = unwrap(value);
  if (!ts.isCallExpression(v)) return v;
  const callee = unwrap(v.expression);
  if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== "select" || !ts.isIdentifier(callee.expression) || callee.expression.text !== "Platform") return v;
  const table = v.arguments[0] ? unwrap(v.arguments[0]) : null;
  if (!table || !ts.isObjectLiteralExpression(table)) return v;
  const entry = (key: string) => table.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === key);
  return (entry("web") ?? entry("default"))?.initializer ?? v;
}

/** `-1` (or `"-1"`), as a tab index is written (on the web, for a `Platform.select`). */
function isMinusOne(value: ts.Expression | null): boolean {
  if (!value) return false;
  const v = onTheWeb(value);
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

/** The arguments each build calls a factory with, bound to its parameters: one set per call (a factory an entry calls twice has two). */
type BuildEnvs = Map<Build, Env[]>;

export class SignalReader {
  private readonly parsed = new Map<string, Parsed>();
  private readonly summaries = new Map<ts.Node, Signal[]>();
  private readonly inProgress = new Set<ts.Node>();
  private readonly groups = ["atoms", "molecules", "organisms", "charts"];
  /** Per module, a static evaluator that follows the kit's own imports (a skin read from its styles module). */
  private readonly evaluators = new Map<string, StaticReader>();
  private readonly exportedValues = new Map<ts.Node, unknown>();
  /** Per component directory: its entries, each with the factory calls it makes. */
  private readonly entries = new Map<string, { entry: BuildEntry; calls: { fn: Fn; env: Env }[] }[]>();
  /** Per component directory: the calls its modules make, by the function called. */
  private readonly callSites = new Map<string, Map<ts.Node, { call: ts.CallExpression; module: Parsed }[]>>();
  /** Per component directory: the arguments each build gives a function, or null for a function no build is known to call. */
  private readonly envs = new Map<string, Map<ts.Node, BuildEnvs | null>>();

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

  /** A module's static evaluator: a name it imports from the kit's source reads as the constant that module exports (a skin object). */
  private evaluator(path: string): StaticReader {
    let found = this.evaluators.get(path);
    if (!found) {
      found = new StaticReader(this.parse(path).sf, { importValue: (specifier, imported) => this.importedValue(path, specifier, imported) });
      this.evaluators.set(path, found);
    }
    return found;
  }

  /**
   * The value of a name a module imports from the kit's source: the constant the module it
   * names exports under it (a skin object, read by that module's own evaluator, which caches
   * it and reads a cycle as unknown), through `export { a as b }` and a re-export. UNKNOWN for
   * a function, a package, or anything else, so a component's factory is never run.
   */
  private importedValue(from: string, specifier: string, imported: string, depth = 0): unknown {
    const file = this.resolveImport(from, specifier);
    if (!file || !this.isSourceOfReader(file) || depth > 6) return UNKNOWN;
    const module = this.parse(file);
    const constant = (name: string): unknown => {
      for (const statement of module.sf.statements) {
        if (!ts.isVariableStatement(statement) || !(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
        const decl = statement.declarationList.declarations.find((d) => ts.isIdentifier(d.name) && d.name.text === name);
        if (decl) return this.evaluator(file).evaluate(decl.name as ts.Identifier);
      }
      return UNKNOWN;
    };
    for (const statement of module.sf.statements) {
      const exported = ts.isVariableStatement(statement) && statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (exported && statement.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === imported)) return constant(imported);
      if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        const element = statement.exportClause.elements.find((el) => el.name.text === imported && !el.isTypeOnly);
        if (!element) continue;
        const name = (element.propertyName ?? element.name).text;
        if (statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) return this.importedValue(file, statement.moduleSpecifier.text, name, depth + 1);
        return constant(name);
      }
    }
    return UNKNOWN;
  }

  /**
   * A component's entries, one per platform build: `<name>.ios.tsx`, `<name>.android.tsx`, and
   * `<name>.tsx` beside one of them, the web's. Each exported constant an entry makes by
   * calling a factory of the component's own modules (`export const Dialog =
   * createDialog(iosSkin, { Button, Input })`) binds that factory's parameters to the build's
   * arguments.
   */
  private entriesIn(own: string): { entry: BuildEntry; calls: { fn: Fn; env: Env }[] }[] {
    const known = this.entries.get(own);
    if (known) return known;
    const files = existsSync(own) ? readdirSync(own).sort() : [];
    const out: { entry: BuildEntry; calls: { fn: Fn; env: Env }[] }[] = [];
    for (const name of files) {
      const native = /^(.+)\.(ios|android)\.tsx$/.exec(name);
      const web = native ? null : /^([^.]+)\.tsx$/.exec(name);
      const build: Build | null = native ? (native[2] as Build) : web && (files.includes(`${web[1]}.ios.tsx`) || files.includes(`${web[1]}.android.tsx`)) ? "web" : null;
      if (!build) continue;
      const module = this.parse(join(own, name));
      const calls: { fn: Fn; env: Env }[] = [];
      const exports: string[] = [];
      for (const statement of module.sf.statements) {
        if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        for (const decl of statement.declarationList.declarations) {
          exports.push(...boundNames(decl.name).map((b) => b.id.text));
          const init = decl.initializer ? unwrap(decl.initializer) : null;
          const callee = init && ts.isCallExpression(init) ? unwrap(init.expression) : null;
          if (!init || !ts.isCallExpression(init) || !callee || !ts.isIdentifier(callee)) continue;
          const { fn, place } = this.functionFor(module, callee, own);
          if (fn && place === "own") calls.push({ fn, env: this.bindArguments(fn, init, module, new Map()) });
        }
      }
      out.push({ entry: { build, file: relative(this.root, module.path), exports }, calls });
    }
    this.entries.set(own, out);
    return out;
  }

  /** A factory's parameters bound to the arguments a call gives it, read under `env` (a parameter's default where the call gives none). */
  private bindArguments(fn: Fn, call: ts.CallExpression, module: Parsed, env: Env): Env {
    const bound = new Map(env);
    fn.node.parameters.forEach((param, i) => {
      const arg = call.arguments[i];
      const value = arg ? (ts.isSpreadElement(arg) ? UNKNOWN : this.evaluator(module.path).evaluate(arg, env)) : param.initializer ? this.evaluator(fn.module.path).evaluate(param.initializer) : undefined;
      for (const name of boundNames(param.name)) bound.set(name.id, pick(value, name.path));
    });
    return bound;
  }

  /** The calls a component's modules make to the functions of its own modules, by the function called. */
  private callsIn(own: string): Map<ts.Node, { call: ts.CallExpression; module: Parsed }[]> {
    const known = this.callSites.get(own);
    if (known) return known;
    const sites = new Map<ts.Node, { call: ts.CallExpression; module: Parsed }[]>();
    this.callSites.set(own, sites);
    for (const path of walkFiles(own).filter(isSourceModule).sort()) {
      const module = this.parse(path);
      const visit = (node: ts.Node): void => {
        const callee = ts.isCallExpression(node) ? unwrap(node.expression) : null;
        if (callee && ts.isIdentifier(callee)) {
          const { fn } = this.functionFor(module, callee, own);
          if (fn && fn.module.path.startsWith(`${own}/`)) sites.set(fn.node, [...(sites.get(fn.node) ?? []), { call: node as ts.CallExpression, module }]);
        }
        ts.forEachChild(node, visit);
      };
      visit(module.sf);
    }
    return sites;
  }

  /**
   * The arguments each build gives a function of the component's own modules: an entry's call
   * of a factory (`createDialog(iosSkin, ...)`), or, for a factory a factory calls
   * (`createSidebarDrillDown(skin, Badge)` in `createSidebar`), that call's arguments read under
   * each build's arguments to the function it is made in. Null for a function no build is
   * known to call.
   */
  private envsOf(fn: Fn, own: string): BuildEnvs | null {
    let byDir = this.envs.get(own);
    if (!byDir) this.envs.set(own, (byDir = new Map()));
    if (byDir.has(fn.node)) return byDir.get(fn.node)!;
    // A function that reaches itself again reads as one no build is known to call.
    byDir.set(fn.node, null);
    const envs: BuildEnvs = new Map();
    const add = (build: Build, env: Env) => envs.set(build, [...(envs.get(build) ?? []), env]);
    for (const { entry, calls } of this.entriesIn(own)) for (const call of calls) if (call.fn.node === fn.node) add(entry.build, call.env);
    if (!envs.size) {
      for (const site of this.callsIn(own).get(fn.node) ?? []) {
        const outer = this.envsAround(site.module, site.call, own);
        if (!outer) continue;
        for (const [build, list] of outer) for (const env of list) add(build, this.bindArguments(fn, site.call, site.module, env));
      }
    }
    const found = envs.size ? envs : null;
    byDir.set(fn.node, found);
    return found;
  }

  /**
   * The arguments each build gives the nearest function around a node that a build is known
   * to call (its factory), or null. Only the component's own modules: a family's shared module
   * takes its skin from each caller, so what it renders is not read per build.
   */
  private envsAround(module: Parsed, node: ts.Node, own: string): BuildEnvs | null {
    if (!module.path.startsWith(`${own}/`)) return null;
    for (let current = node.parent; current; current = current.parent) {
      if (!(ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current) || ts.isArrowFunction(current) || ts.isMethodDeclaration(current))) continue;
      const envs = this.envsOf({ node: current, module, name: "" }, own);
      if (envs) return envs;
    }
    return null;
  }

  /** The builds a component's directory has an entry for, in `BUILDS` order. */
  private buildsIn(own: string): Build[] {
    const found = new Set(this.entriesIn(own).map((e) => e.entry.build));
    return BUILDS.filter((build) => found.has(build));
  }

  /**
   * The builds that render a node, read up to `scope`: each condition around it (an if, a
   * ternary, `&&` and `||`, an early return) that reads a factory's parameters is evaluated
   * with each build's arguments, and a build in which it goes the other way, whatever call
   * the build makes, does not render the node. A constant holding the node renders it
   * wherever it is used (Dialog's `footer`). Undefined when every build renders it.
   */
  private buildsAt(module: Parsed, node: ts.Node, scope: ts.Node, own: string): Build[] | undefined {
    const all = this.buildsIn(own);
    if (all.length < 2) return undefined;
    const found = this.routeBuilds(module, node, scope, own, all, new Set());
    return found.length === all.length ? undefined : found;
  }

  private routeBuilds(module: Parsed, node: ts.Node, scope: ts.Node, own: string, from: readonly Build[], seen: ReadonlySet<ts.Node>): Build[] {
    const builds = new Set(from);
    const narrow = (condition: ts.Expression, truthy: boolean) => {
      const envs = this.envsAround(module, condition, own);
      if (!envs) return;
      const evaluator = this.evaluator(module.path);
      for (const build of [...builds]) {
        const list = envs.get(build);
        if (!list?.length) continue;
        const goesOtherWay = list.every((env) => {
          const value = evaluator.evaluate(condition, env);
          return value !== UNKNOWN && !!value !== truthy;
        });
        if (goesOtherWay) builds.delete(build);
      }
    };
    for (let current: ts.Node = node; current !== scope && current.parent; current = current.parent) {
      const parent = current.parent;
      if (ts.isIfStatement(parent) && parent.thenStatement === current) narrow(parent.expression, true);
      else if (ts.isIfStatement(parent) && parent.elseStatement === current) narrow(parent.expression, false);
      else if (ts.isConditionalExpression(parent) && parent.whenTrue === current) narrow(parent.condition, true);
      else if (ts.isConditionalExpression(parent) && parent.whenFalse === current) narrow(parent.condition, false);
      else if (ts.isBinaryExpression(parent) && parent.right === current && parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) narrow(parent.left, true);
      else if (ts.isBinaryExpression(parent) && parent.right === current && parent.operatorToken.kind === ts.SyntaxKind.BarBarToken) narrow(parent.left, false);
      else if (ts.isBlock(parent) || ts.isSourceFile(parent)) {
        for (const statement of parent.statements) {
          if (statement === current) break;
          if (ts.isIfStatement(statement) && !statement.elseStatement && returns(statement.thenStatement)) narrow(statement.expression, false);
        }
      } else if (ts.isVariableDeclaration(parent) && parent.initializer === current && ts.isIdentifier(parent.name) && !seen.has(parent)) {
        const uses = usesOf(module, parent, scope);
        if (uses.length) {
          const along = new Set([...seen, parent]);
          const union = new Set(uses.flatMap((use) => this.routeBuilds(module, use, scope, own, [...builds], along)));
          return BUILDS.filter((build) => union.has(build));
        }
      }
      if (!builds.size) break;
    }
    return BUILDS.filter((build) => builds.has(build));
  }

  /** A component's entries: the build each is, its module, and the names it exports. */
  entriesOf(sourceDir: string): BuildEntry[] {
    return this.entriesIn(join(this.root, sourceDir)).map((e) => e.entry);
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

  /**
   * The function a JSX tag's name renders: the one `functionFor` finds, or, for a constant a
   * factory of the component's own (or of a shared module) makes (`const SidebarDrillDown =
   * createSidebarDrillDown(skin, Badge)`), the one function that factory returns. A factory an
   * entry calls makes a component of its own (AvatarGroup renders the Avatar `createAvatar`
   * makes), read whole as one, so its tag is left as it is.
   */
  private tagFunction(module: Parsed, id: ts.Identifier, own: string): { fn: Fn | null; place: Place } {
    const found = this.functionFor(module, id, own);
    if (found.fn) return found;
    const binding = module.reader.resolve(id);
    if (binding?.kind !== "const" || binding.path.length || !binding.decl.initializer) return found;
    const call = unwrap(binding.decl.initializer);
    const callee = ts.isCallExpression(call) ? unwrap(call.expression) : null;
    if (!callee || !ts.isIdentifier(callee)) return found;
    const factory = this.functionFor(module, callee, own);
    if (!factory.fn || (factory.place !== "own" && factory.place !== "shared")) return found;
    if (this.entriesIn(own).some((e) => e.calls.some((c) => c.fn.node === factory.fn!.node))) return found;
    const results = bodyResults(factory.fn.node);
    const built = results.length === 1 ? functionOf(results[0]!) : null;
    if (!built) return found;
    const name = (ts.isFunctionExpression(built) && built.name?.text) || id.text;
    return { fn: { node: built, module: factory.fn.module, name }, place: factory.place };
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
    return { name, ...this.tagFunction(module, head, own) };
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
  private passedProps(module: Parsed, value: ts.Expression, depth = 0): string[] | null {
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
    // A local constant: what its value is there only with (`const onPress = onPressItem ? () => ... : undefined`).
    if (ts.isIdentifier(v)) {
      const binding = module.reader.resolve(v);
      if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer && depth < 6) return this.passedProps(module, binding.decl.initializer, depth + 1);
    }
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
   * The ways a value is false: a TextInput's `editable`, which React Native's text field is
   * disabled with (it has no `disabled`). Null when it never is (`true`, a bare attribute,
   * `undefined`, the default); `!disabled` is false with `disabled`, `!disabled && !readOnly`
   * either way, `a || b` only when both are. A value the reader cannot follow is false with
   * nothing in particular.
   */
  private offBy(module: Parsed, value: ts.Expression | null, depth = 0): DisabledBy | null {
    if (value === null) return null;
    const v = unwrap(value);
    if (isNullish(v) || v.kind === ts.SyntaxKind.TrueKeyword) return null;
    if (v.kind === ts.SyntaxKind.FalseKeyword || depth > 6) return BY_ITSELF;
    if (ts.isPrefixUnaryExpression(v) && v.operator === ts.SyntaxKind.ExclamationToken) return this.disabledBy(module, v.operand, depth + 1);
    if (ts.isConditionalExpression(v)) return this.eitherSide(module, v, (side) => this.offBy(module, side, depth + 1), depth);
    if (ts.isBinaryExpression(v)) {
      const op = v.operatorToken.kind;
      const l = this.offBy(module, v.left, depth + 1);
      const r = this.offBy(module, v.right, depth + 1);
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) return l && r ? anyOf(l, r) : (l ?? r);
      if (op === ts.SyntaxKind.BarBarToken) return l && r ? allOf(l, r) : null;
      return BY_ITSELF;
    }
    if (ts.isIdentifier(v) && !this.propOf(module, v)) {
      const binding = module.reader.resolve(v);
      if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer) return this.offBy(module, binding.decl.initializer, depth + 1);
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
   * What a condition needs of a render helper's parameters to be `truthy` (`hoverable`, read
   * in `eventLayer`, which a call passes): a parameter of a function that is not a component,
   * read bare or negated, or each side of `&&` when it must be true.
   */
  private paramNeeds(module: Parsed, cond: ts.Expression, truthy: boolean): Requirement[] {
    const e = unwrap(cond);
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) return this.paramNeeds(module, e.operand, !truthy);
    if (truthy && ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return [...this.paramNeeds(module, e.left, true), ...this.paramNeeds(module, e.right, true)];
    if (!ts.isIdentifier(e)) return [];
    const binding = module.reader.resolve(e);
    if (binding?.kind !== "param" || isComponentFunction(binding.fn)) return [];
    const index = binding.fn.parameters.findIndex((p) => ts.isIdentifier(p.name) && p.name === binding.id);
    return index < 0 ? [] : [{ fn: binding.fn, index, truthy }];
  }

  /**
   * Whether the calls a place is reached through give a value what it needs: an argument
   * written as a literal (or a parameter's literal default, `hoverable = true`) that
   * contradicts a requirement keeps it out of that place; anything else may give it.
   */
  private callsAllow(needs: readonly Requirement[] | undefined, calls: readonly ts.CallExpression[], module: Parsed): boolean {
    if (!needs?.length) return true;
    return needs.every((need) => {
      const call = calls.find((c) => {
        const callee = unwrap(c.expression);
        if (!ts.isIdentifier(callee)) return false;
        const binding = module.reader.resolve(callee);
        const fn = binding?.kind === "function" ? binding.decl : binding?.kind === "const" && binding.decl.initializer ? functionOf(binding.decl.initializer) : null;
        return fn === need.fn;
      });
      if (!call) return true;
      const param = need.fn.parameters[need.index];
      const given = call.arguments[need.index] ?? param?.initializer;
      if (!given) return need.truthy === false;
      const v = unwrap(given);
      const value = v.kind === ts.SyntaxKind.TrueKeyword ? true : v.kind === ts.SyntaxKind.FalseKeyword || isNullish(v) ? false : null;
      return value === null || value === need.truthy;
    });
  }

  /**
   * Every place a node renders: inside an overlay (`Around`), or null on the component's own
   * surface. Read up the tree to `scope`: an overlay primitive the node is a child of, another
   * kit component given its open state, or a local or shared component that renders its
   * `children` inside one (AlertDialog's `Present`, whose own props are its business, so
   * nothing outside says what keeps it closed); a constant that holds the node is placed
   * wherever it is used (ActionSheet's `actionRows`, AlertDialog's `actionRow`), so one used
   * on the surface and inside a drawer (FilterPanel's `panel`, a drawer only when responsive)
   * is in both.
   */
  private placesAround(module: Parsed, node: ts.Node, scope: ts.Node, own: string, seen: ReadonlySet<ts.Node> = new Set(), calls: ts.CallExpression[] = []): Placement[] {
    for (let current: ts.Node = node; current !== scope && current.parent; current = current.parent) {
      const parent = current.parent;
      if (ts.isJsxElement(parent) && current !== parent.openingElement && current !== parent.closingElement) {
        const found = this.overlayOf(module, parent.openingElement, own, new Set(seen));
        if (found) return [{ around: found, calls }];
      }
      if (ts.isVariableDeclaration(parent) && parent.initializer === current && ts.isIdentifier(parent.name)) {
        if (seen.has(parent)) return [];
        const along = new Set([...seen, parent]);
        // A render helper's call is part of the route: its arguments decide what it renders there.
        const places = usesOf(module, parent, scope).flatMap((use) => {
          const call = ts.isCallExpression(use.parent) && use.parent.expression === use ? [use.parent] : [];
          return this.placesAround(module, use, scope, own, along, [...calls, ...call]);
        });
        return places.length ? places : [{ around: null, calls }];
      }
    }
    return [{ around: null, calls }];
  }

  /** The first overlay a node renders inside, or null when it renders on the surface alone. */
  private overlayAround(module: Parsed, node: ts.Node, scope: ts.Node, own: string, seen: ReadonlySet<ts.Node> = new Set()): Around | null {
    return this.placesAround(module, node, scope, own, seen).find((place) => place.around !== null)?.around ?? null;
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
    // Another kit component given its open state holds its content inside its overlay only
    // when its own source renders `children` there (a Drawer); a Dropdown's are its trigger.
    const file = this.componentFile(module, opening.tagName);
    if (!file || !this.rendersOverlay(file) || !this.childrenInside(file)) return null;
    const opened = this.attributes(module, opening.attributes.properties).find((a) => OPEN_PROPS.includes(a.name));
    const opens = opened ? this.opensWith([opened]) : null;
    return opens ? around(opens) : null;
  }

  private readonly childrenInsideOf = new Map<string, boolean>();

  /** Whether the kit component a module belongs to renders the `children` it is given inside one of its overlays. */
  private childrenInside(file: string): boolean {
    const dir = dirname(file);
    const known = this.childrenInsideOf.get(dir);
    if (known !== undefined) return known;
    this.childrenInsideOf.set(dir, false);
    let inside = false;
    for (const path of walkFiles(dir).filter(isSourceModule)) {
      const module = this.parse(path);
      const visit = (node: ts.Node): void => {
        if (inside) return;
        // `{children}`, `{props.children}`, through parentheses and `as`.
        const read =
          ((ts.isIdentifier(node) && node.text === "children") || (ts.isPropertyAccessExpression(node) && node.name.text === "children")) &&
          ts.isJsxExpression(outermost(node).parent);
        if (read && this.overlayAround(module, node, module.sf, dir)) inside = true;
        ts.forEachChild(node, visit);
      };
      visit(module.sf);
      if (inside) break;
    }
    this.childrenInsideOf.set(dir, inside);
    return inside;
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
    const sometimes = { ...(found.conditional ? { conditional: true as const } : {}), ...(found.requires?.length ? { requires: found.requires } : {}) };
    for (const property of found.literal.properties) {
      const key = property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;
      if (ts.isPropertyAssignment(property) && key !== null) out.push({ name: key, value: property.initializer, module: found.module, node: property, site, gates: found.gates, ...sometimes });
      else if (ts.isShorthandPropertyAssignment(property)) out.push({ name: property.name.text, value: property.name, module: found.module, node: property, site, gates: found.gates, ...sometimes });
      else if (ts.isMethodDeclaration(property) && key !== null) out.push({ name: key, value: null, module: found.module, node: property, site, gates: found.gates, ...sometimes });
      else if (ts.isSpreadAssignment(property)) {
        for (const inner of this.objectsOf({ expr: property.expression, module: found.module, gates: found.gates, ...sometimes }, seen)) out.push(...this.propertiesOf(inner, site, seen));
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
    const needs = located.requires ?? [];
    const kept = { ...(located.conditional ? { conditional: true as const } : {}), ...(needs.length ? { requires: needs } : {}) };
    const e = unwrap(located.expr);
    if (seen.has(e)) return [];
    seen.add(e);
    if (ts.isObjectLiteralExpression(e)) return [{ literal: e, module, gates, ...kept }];
    if (ts.isConditionalExpression(e)) {
      return [
        ...this.objectsOf({ expr: e.whenTrue, module, gates: [...gates, ...this.truthyProps(module, e.condition)], conditional: true, requires: [...needs, ...this.paramNeeds(module, e.condition, true)] }, seen),
        ...this.objectsOf({ expr: e.whenFalse, module, gates: [...gates, ...this.falsyProps(module, e.condition)], conditional: true, requires: [...needs, ...this.paramNeeds(module, e.condition, false)] }, seen),
      ];
    }
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        return this.objectsOf({ expr: e.right, module, gates: [...gates, ...this.truthyProps(module, e.left)], conditional: true, requires: [...needs, ...this.paramNeeds(module, e.left, true)] }, seen);
      }
      if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) {
        return [...this.objectsOf({ expr: e.left, module, gates, ...kept, conditional: true }, seen), ...this.objectsOf({ expr: e.right, module, gates, ...kept, conditional: true }, seen)];
      }
      return [];
    }
    if (ts.isIdentifier(e)) {
      const binding = module.reader.resolve(e);
      if (binding?.kind !== "const" || !binding.decl.initializer) return [];
      const init: Located = { expr: binding.decl.initializer, module, gates, ...kept };
      if (!binding.path.length) return this.objectsOf(init, seen);
      // `const { target: hoverTarget } = useHover(...)`: the member the destructuring takes.
      return this.membersOf(init, binding.path, seen);
    }
    if (ts.isPropertyAccessExpression(e)) return this.membersOf({ expr: e.expression, module, gates, ...kept }, [e.name.text], seen);
    if (ts.isCallExpression(e)) {
      // `Platform.select({ web: a, default: b })`: each platform's object, one of which the element is given.
      const callee = unwrap(e.expression);
      if (ts.isPropertyAccessExpression(callee) && callee.name.text === "select" && ts.isIdentifier(callee.expression) && callee.expression.text === "Platform" && e.arguments[0]) {
        const table = unwrap(e.arguments[0]);
        if (!ts.isObjectLiteralExpression(table)) return [];
        return table.properties.flatMap((property) => (ts.isPropertyAssignment(property) ? this.objectsOf({ expr: property.initializer, module, gates, ...kept, conditional: true }, seen) : []));
      }
      return this.returnsOf({ expr: e, module, gates, ...kept }, seen).flatMap((r) => this.objectsOf(r, seen));
    }
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
        if (value) out.push(...this.membersOf({ expr: value, module: found.module, gates: found.gates, ...(found.conditional ? { conditional: true as const } : {}), ...(found.requires?.length ? { requires: found.requires } : {}) }, rest, seen));
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
      if (!ts.isArrowFunction(factory) && !ts.isFunctionExpression(factory)) return [];
      const results = bodyResults(factory);
      return results.map((expr) => ({ expr, module: located.module, gates: located.gates, ...(located.requires?.length ? { requires: located.requires } : {}), ...(located.conditional || results.length > 1 ? { conditional: true as const } : {}) }));
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
    // A function with several returns gives one of them.
    const results = bodyResults(fn.node);
    return results.map((expr) => ({ expr, module: fn!.module, gates: located.gates, ...(located.requires?.length ? { requires: located.requires } : {}), ...(located.conditional || results.length > 1 ? { conditional: true as const } : {}) }));
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
   * The element a primitive's tag is, as a control: its tag, the function it is rendered in,
   * the roles the source can give it, and the feedback it is given that only a device draws
   * (`deviceOnlyOf`), read with the builds of the component whose directory is `own` (null for
   * a rail example's tag, which is one build).
   */
  private controlOf(module: Parsed, opening: ts.JsxOpeningElement | ts.JsxSelfClosingElement, tag: string, given: readonly Attr[], own: string | null): Control {
    const roles = new Set<string>();
    let unread = false;
    // Whether the element can be given no role the page renders, so the tag's own applies.
    let bare = true;
    const written = given.filter((a) => (a.name === "accessibilityRole" || a.name === "role") && a.value);
    // A role given on one side of a condition only (`{...(flag ? a : { role })}`) leaves it none on the other.
    if (written.some((a) => !a.conditional)) bare = false;
    for (const attr of written) {
      const found = this.stringsOf(attr.module, attr.value!);
      if (found === null) {
        unread = true;
        continue;
      }
      for (const value of found) {
        // `undefined` (an empty string here), or a role react-native-web renders as none (`text`).
        const role = value ? propsToAriaRole({ role: value }) : undefined;
        if (role) roles.add(role);
        else bare = true;
      }
    }
    if (bare && tag === "TextInput") roles.add("textbox");
    if (given.some((a) => a.name === "href")) roles.add("link");
    const inside = this.framesOf(module, opening);
    const deviceOnly = this.deviceOnlyOf(given, own);
    return {
      tag,
      in: renderedIn(module, opening),
      roles: [...roles].sort(),
      ...(unread ? { roleUnread: true as const } : {}),
      ...(bare && written.length && roles.size && tag !== "TextInput" ? { noRole: true as const } : {}),
      ...(inside.length ? { inside } : {}),
      ...(deviceOnly.length ? { deviceOnly } : {}),
      at: this.at(module, opening),
    };
  }

  /**
   * The feedback an element is given that only a device draws (`DEVICE_FEEDBACK`), where it
   * is all the element shows of its state, and the builds in which it is: the element is given
   * the prop a value the evaluator knows is not empty there (under every call the build makes
   * of the factory it is rendered in), none of the entry's handlers (in any build, whatever
   * its value, unless `undefined`), and no function of it reads one of the entry's look inputs
   * where that build renders the read (a Checkbox dims under `skin.pressedOpacity != null &&
   * pressed`, which the Android skin, giving a ripple instead, never reaches). A value or a
   * condition the evaluator cannot read keeps the feedback from being all the element shows,
   * so the web runner is never spared a state it might see. A component with one build (`own`
   * null for a rail example's tag) reads its values once, for every build.
   */
  private deviceOnlyOf(given: readonly Attr[], own: string | null): DeviceOnly[] {
    const all = own ? this.buildsIn(own) : [];
    const single = all.length < 2;
    const candidates: readonly Build[] = single ? BUILDS : all;
    const out: DeviceOnly[] = [];
    for (const feedback of DEVICE_FEEDBACK) {
      const prop = given.find((a) => a.name === feedback.prop && a.value);
      if (!prop?.value) continue;
      if (given.some((a) => feedback.handlers.includes(a.name) && (!a.value || this.passedProps(a.module, a.value) !== null))) continue;
      // The builds that give the prop a value known not to be empty.
      const envs = own ? this.envsAround(prop.module, prop.node, own) : null;
      // A rail example's code is a module of its own, read by its own reader.
      const evaluator = own ? this.evaluator(prop.module.path) : prop.module.reader;
      const gives = (env: Env) => {
        const value = evaluator.evaluate(prop.value!, env);
        return value !== UNKNOWN && !!value;
      };
      let builds = envs ? candidates.filter((build) => (envs.get(build) ?? []).length > 0 && envs.get(build)!.every(gives)) : gives(new Map()) ? [...candidates] : [];
      // Less the builds in which a function the element is given reads one of the look inputs.
      for (const attr of given) {
        if (!attr.value || !builds.length) continue;
        for (const read of inputReads(attr.module, attr.value, feedback.looks)) {
          const reading = single || !own ? candidates : this.routeBuilds(attr.module, read.node, read.fn, own, all, new Set());
          builds = builds.filter((build) => !reading.includes(build));
        }
      }
      if (!builds.length) continue;
      out.push({ prop: feedback.prop, state: feedback.state, platform: feedback.platform, ...(builds.length === candidates.length ? {} : { builds }) });
    }
    return out;
  }

  /** The component's own (and shared) functions whose tag an element is the content of, nearest first (through a `.map` callback or a render prop). */
  private framesOf(module: Parsed, opening: ts.JsxOpeningElement | ts.JsxSelfClosingElement): string[] {
    const frames: string[] = [];
    const element = ts.isJsxOpeningElement(opening) ? opening.parent : opening;
    for (let current: ts.Node = element; current.parent; current = current.parent) {
      const parent = current.parent;
      if (!ts.isJsxElement(parent) || current === parent.openingElement || current === parent.closingElement) continue;
      const head = parent.openingElement.tagName;
      if (!ts.isIdentifier(head) || /^[a-z]/.test(head.text)) continue;
      const binding = module.reader.resolve(head);
      if (binding?.kind === "function" || (binding?.kind === "const" && binding.decl.initializer && functionOf(binding.decl.initializer))) frames.push(head.text);
      else if (binding?.kind === "import" && binding.specifier.startsWith(".")) {
        const file = this.resolveImport(module.path, binding.specifier);
        const place = file ? this.place(file, dirname(module.path)) : "outside";
        if (place === "own" || place === "shared") frames.push(head.text);
      }
    }
    return frames;
  }

  /**
   * The strings a value can be: a literal, either side of a conditional, `&&`'s right, both
   * sides of `||` and `??`, a constant's initializer; the empty string for `undefined`, `null`
   * or `false`, a value that gives none. Null when it can be something the reader cannot
   * read (a prop, a parameter, a call).
   */
  private stringsOf(module: Parsed, expr: ts.Expression, depth = 0): string[] | null {
    const e = unwrap(expr);
    if (depth > 6) return null;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (isNullish(e) || e.kind === ts.SyntaxKind.FalseKeyword) return [""];
    const both = (a: ts.Expression, b: ts.Expression) => {
      const x = this.stringsOf(module, a, depth + 1);
      const y = this.stringsOf(module, b, depth + 1);
      return x && y ? [...x, ...y] : null;
    };
    if (ts.isConditionalExpression(e)) return both(e.whenTrue, e.whenFalse);
    if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      // `a && "x"` is `a` when falsy: a role, given none.
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) {
        const right = this.stringsOf(module, e.right, depth + 1);
        return right && [...right, ""];
      }
      if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) return both(e.left, e.right);
      return null;
    }
    if (ts.isIdentifier(e)) {
      const binding = module.reader.resolve(e);
      if (binding?.kind === "const" && !binding.path.length && binding.decl.initializer) return this.stringsOf(module, binding.decl.initializer, depth + 1);
    }
    return null;
  }

  /**
   * The props every read of a look function's parameter is guarded by: the left of an `&&`
   * it is on the right of, the condition of a ternary it is a branch of (read up to the
   * function). A look read only under `onEventPress` changes only when that prop is passed;
   * one read bare changes always (none).
   */
  private useGuards(module: Parsed, param: ts.ParameterDeclaration, id: ts.Identifier): string[] {
    const fn = param.parent;
    const body = ts.isFunctionLike(fn) ? (fn as ts.FunctionLikeDeclaration).body : undefined;
    if (!body) return [];
    const perUse: string[][] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isIdentifier(node) && node.text === id.text && node !== id) {
        const binding = module.reader.resolve(node);
        if (binding?.kind === "param" && binding.id === id) {
          const guards: string[] = [];
          for (let current: ts.Node = node; current !== body && current.parent; current = current.parent) {
            const parent = current.parent;
            if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && parent.right === current) guards.push(...this.truthyProps(module, parent.left));
            else if (ts.isConditionalExpression(parent) && parent.whenTrue === current) guards.push(...this.truthyProps(module, parent.condition));
            else if (ts.isConditionalExpression(parent) && parent.whenFalse === current) guards.push(...this.falsyProps(module, parent.condition));
          }
          perUse.push(guards);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(body);
    if (!perUse.length) return [];
    return [...new Set(perUse.reduce((a, b) => a.filter((prop) => b.includes(prop))))];
  }

  /**
   * The element a look function's parameter is on, when the function is a prop of a
   * primitive's tag (a Pressable's style callback), and the places it renders; none for a
   * function written anywhere else (a skin's, a hook's).
   */
  private lookElement(module: Parsed, param: ts.ParameterDeclaration, scope: ts.Node, own: string): { control?: Control; places: Placement[] } {
    let owner: ts.JsxOpeningElement | ts.JsxSelfClosingElement | null = null;
    for (let current: ts.Node = param.parent; current.parent; current = current.parent) {
      if (ts.isJsxAttribute(current) || ts.isJsxSpreadAttribute(current)) {
        const element = current.parent.parent;
        if (ts.isJsxOpeningElement(element) || ts.isJsxSelfClosingElement(element)) owner = element;
        break;
      }
      // Written in the children, or outside any tag (a constant, a skin's property).
      if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current) || ts.isJsxFragment(current) || ts.isBlock(current) || ts.isVariableDeclaration(current) || ts.isSourceFile(current)) break;
    }
    if (!owner) return { places: [{ around: null, calls: [] }] };
    const tag = this.tagOf(module, owner.tagName, own);
    if (tag.place !== "primitive") return { places: [{ around: null, calls: [] }] };
    const control = this.controlOf(module, owner, tag.name, this.attributes(module, owner.attributes.properties), own);
    return { control, places: this.placesAround(module, owner, scope, own) };
  }

  private readonly kitRolesOf = new Map<string, Pick<Control, "roles" | "roleUnread">>();

  /**
   * The roles of another kit component a component disables (AlertDialog's confirm Button):
   * those of the controls its own source disables, since `disabled` is what it is handed.
   */
  private kitRoles(file: string): Pick<Control, "roles" | "roleUnread"> {
    const dir = relative(this.root, dirname(file));
    const known = this.kitRolesOf.get(dir);
    if (known) return known;
    // A component that, through others, disables itself reads as a role the reader cannot name.
    this.kitRolesOf.set(dir, { roles: [], roleUnread: true });
    const controls = this.signalsOf(dir).flatMap((s) => (s.state === "disabled" && s.control ? [s.control] : []));
    const roles: Pick<Control, "roles" | "roleUnread"> = {
      roles: [...new Set(controls.flatMap((c) => c.roles))].sort(),
      ...(controls.some((c) => c.roleUnread) || !controls.length ? { roleUnread: true as const } : {}),
    };
    this.kitRolesOf.set(dir, roles);
    return roles;
  }

  /**
   * Every signal reachable from `scope` (a function, or a whole module), with its gates in
   * the props of the components around it. The bodies of local components used as a JSX
   * tag are skipped where they are declared and read where they are used, so their gates
   * can be mapped through the props each use passes.
   */
  private collect(module: Parsed, scope: ts.Node, own: string, skip: ReadonlySet<ts.Node>): Signal[] {
    const out: Signal[] = [];
    // The builds that render each node a signal is found at (`buildsAt`), read once.
    const builtAt = new Map<ts.Node, Build[] | undefined>();
    const buildsOf = (node: ts.Node): Pick<Signal, "builds"> => {
      if (!builtAt.has(node)) builtAt.set(node, this.buildsAt(module, node, scope, own));
      const builds = builtAt.get(node);
      return builds ? { builds } : {};
    };
    const add = (signal: Omit<Signal, "at" | "gates" | "via">, node: ts.Node) => {
      const written = writtenIn(node);
      out.push({ ...signal, at: this.at(module, node), via: [], gates: this.gatesOf(module, node, scope), ...(written ? { in: written } : {}), ...buildsOf(node) });
    };
    /**
     * A signal once per place it renders (where the calls it is reached through give what it
     * needs), on its control, with the builds that render `node`, the element (or the look's
     * parameter) it is found at.
     */
    const placedAt = (places: readonly Placement[], control: Control | undefined, signal: Signal, node: ts.Node, needs?: Requirement[]) => {
      for (const place of places) {
        if (!this.callsAllow(needs, place.calls, module)) continue;
        out.push({ ...signal, ...(control ? { control } : {}), ...(place.around ? { within: place.around.name } : {}), ...buildsOf(node) });
      }
    };

    const visit = (node: ts.Node): void => {
      if (node !== scope && skip.has(node)) return;
      // Look inputs: a function parameter named pressed, hovered or focused, or destructuring
      // one; on the element whose prop the function is (a Pressable's style callback), when it is one.
      if (ts.isParameter(node)) {
        let element: ReturnType<SignalReader["lookElement"]> | undefined;
        for (const bound of boundNames(node.name)) {
          const name = bound.path.length ? String(bound.path[bound.path.length - 1]) : bound.id.text;
          const state = LOOK_INPUTS[name];
          if (!state) continue;
          element ??= this.lookElement(module, node, scope, own);
          // A look read only under a prop (`onEventPress && pressed ? dim : null`) changes only with it.
          const guards = this.useGuards(module, node, bound.id);
          const look: Signal = { kind: "look", state, what: `a function taking \`${name}\``, at: this.at(module, node), via: [], gates: [...new Set([...this.gatesOf(module, node, scope), ...guards])] };
          const written = element.control ? undefined : writtenIn(node.parent);
          placedAt(element.places, element.control, written ? { ...look, in: written } : look, node);
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
          // The element every signal below is on, and the places it renders.
          const control = this.controlOf(module, node, tag.name, given, own);
          let places: Placement[] | undefined;
          const placesOf = () => (places ??= this.placesAround(module, node, scope, own));
          const push = (signal: Signal, needs?: Requirement[]) => placedAt(placesOf(), control, signal, node, needs);
          // Where a prop is written, and the props it is rendered under: those around the
          // element, those the spread it came in on was given under, and those its value is
          // there only with.
          const placed = (attr: Attr, extra: string[] = []) => ({
            at: this.at(attr.module, attr.node),
            gates: [...new Set([...this.gatesOf(module, attr.site, scope), ...attr.gates, ...extra])],
          });
          if (tag.name === "TextInput") push({ kind: "text-entry", state: "focus", what: "a TextInput", at: this.at(module, node), via: [], gates: this.gatesOf(module, node, scope) });
          if (OVERLAY_TAGS.has(tag.name)) {
            const opens = this.opensWith(given);
            if (opens) {
              const opened = opens === true ? null : opens;
              const where = opened ? placed(opened, opened.value ? (this.passedProps(opened.module, opened.value) ?? []) : []) : { at: this.at(module, node), gates: this.gatesOf(module, node, scope) };
              out.push({ kind: "overlay", state: "open", what: `a <${tag.name}>`, via: [], ...where, overlay: renderedIn(module, node), ...buildsOf(node) });
            }
          }
          // The controls it disables: `disabled` and `aria-disabled` given a value that can be
          // true, and an `accessibilityState` whose `disabled` can be.
          for (const attr of given) {
            const by = DISABLED_PROPS.has(attr.name)
              ? this.disabledBy(attr.module, attr.value)
              : attr.name === "accessibilityState"
                ? this.stateDisabled(attr.module, attr.value)
                : attr.name === "editable" && tag.name === "TextInput"
                  ? this.offBy(attr.module, attr.value)
                  : null;
            if (!by) continue;
            const where = placed(attr);
            // Not where an overlay that is kept closed whenever it is disabled renders it.
            const open = placesOf().filter((place) => !(place.around && shutIn(place.around, where.gates, by)));
            const readOnly = attr.name === "editable" ? { readOnly: true as const } : {};
            placedAt(open, control, { kind: "disabled", state: "disabled", what: `${attr.name} on <${tag.name}>`, via: [], ...where, disabledBy: by, ...readOnly }, node, attr.requires);
          }
          const stop = tabStop(tag.name, given);
          if (stop) {
            // A role reached only under a condition (`accessibilityRole={onPress ? "button" : undefined}`) is gated by it.
            const where = stop.attr ? placed(stop.attr, stop.literal ? this.gatesOf(stop.attr.module, stop.literal, stop.attr.node) : []) : { at: this.at(module, node), gates: this.gatesOf(module, node, scope) };
            push({ kind: "tab-stop", state: "focus", what: stop.what, via: [], ...where }, stop.attr?.requires);
          }
          for (const attr of given) {
            const prop = attr.name;
            const value = attr.value;
            // `onPress={undefined}` is no handler.
            if (value && this.passedProps(attr.module, value) === null) continue;
            const extra = value ? (this.passedProps(attr.module, value) ?? []) : [];
            const signal = (kind: SignalKind, state: SignalState, element?: ElementFacts) => {
              push({ kind, state, what: `${prop} on <${tag.name}>`, via: [], ...placed(attr, extra), ...(element ? { element } : {}) }, attr.requires);
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
                push({
                  kind: "link",
                  state: "focus",
                  what: `${prop} "link" on <${tag.name}>`,
                  at: where.at,
                  via: [],
                  gates: attr.site === attr.node ? this.gatesOf(module, literal, scope) : [...new Set([...where.gates, ...this.gatesOf(attr.module, literal, attr.node)])],
                }, attr.requires);
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
                ...buildsOf(node),
              });
            }
          }
          // Another kit component disabled by this one (AlertDialog's confirm Button, until its token is typed).
          const disabled = given.find((a) => a.name === "disabled");
          const by = disabled ? this.disabledBy(disabled.module, disabled.value) : null;
          if (file && disabled && by) {
            const where = handed(disabled, []);
            const open = this.placesAround(module, node, scope, own).filter((place) => !(place.around && shutIn(place.around, where.gates, by)));
            const control: Control = { tag: tag.name, in: renderedIn(module, node), ...this.kitRoles(file), kit: true, at: this.at(module, node) };
            placedAt(open, control, { kind: "disabled", state: "disabled", what: `disabled on <${tag.name}>`, via: [], ...where, disabledBy: by }, node, disabled.requires);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(scope);
    return out;
  }

  /**
   * The signals of a local or shared function used at `site`, with its gates mapped through
   * what the site passes, rendered by the builds that render both the signal inside it and the
   * use (a signal no build renders at the use is dropped).
   */
  private inherit(out: Signal[], module: Parsed, site: ts.Node, scope: ts.Node, fn: Fn, own: string, attrs: ts.NodeArray<ts.JsxAttributeLike> | null, skip: ReadonlySet<ts.Node>): void {
    // A shared module's own tag components are its business; the component's are the caller's.
    const inner = this.summary(fn, own, fn.module.path.startsWith(`${own}/`) ? skip : this.tagComponents([fn.module], own));
    const around = this.gatesOf(module, site, scope);
    const siteBuilds = this.buildsAt(module, site, scope, own);
    const valueAt = (attr: ts.JsxAttribute) => (attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression ? attr.initializer.expression : null);
    const attrNamed = (name: string) => attrs?.find((a): a is ts.JsxAttribute => ts.isJsxAttribute(a) && ts.isIdentifier(a.name) && a.name.text === name);
    // What the function renders sits wherever the use is: on the surface, inside an overlay, or both.
    let sitePlaces: Placement[] | undefined;
    const placesAtSite = () => (sitePlaces ??= this.placesAround(module, site, scope, own));
    // `children` is given between the tags, not as an attribute (`<BreadcrumbItem>{label}</BreadcrumbItem>`).
    const childrenGiven = ts.isJsxOpeningElement(site) && site.parent.children.some((child) => !(ts.isJsxText(child) && child.containsOnlyTriviaWhiteSpaces));
    for (const signal of inner) {
      let gates: string[] | null = [...around];
      if (attrs) {
        for (const gate of signal.gates) {
          if (gate === "children" && childrenGiven) continue;
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
      const builds = !signal.builds ? siteBuilds : !siteBuilds ? signal.builds : signal.builds.filter((build) => siteBuilds.includes(build));
      if (builds && !builds.length) continue;
      const { builds: _inner, ...rest } = signal;
      const reached: Signal = { ...rest, via: [fn.name, ...signal.via], gates: [...new Set(gates)], ...(builds ? { builds } : {}) };
      let by: DisabledBy | null = null;
      if (signal.disabledBy) {
        // What disables it, through the values the use gives the props it is true with
        // (`disabled={!!disabled}`, `disabled={item.disabled}`); one never given, or given a
        // value that is never true, never disables it.
        by = attrs ? this.disabledThrough(module, signal.disabledBy, attrs, valueAt, attrNamed) : signal.disabledBy;
        if (!by) continue;
        reached.disabledBy = by;
      }
      // Inside the function's own overlay, it stays there.
      if (signal.within) {
        out.push(reached);
        continue;
      }
      // Placed where the use is: each place, but an overlay that is kept closed whenever it is disabled.
      for (const place of placesAtSite()) {
        if (place.around && by && shutIn(place.around, reached.gates, by)) continue;
        out.push({ ...reached, ...(place.around ? { within: place.around.name } : {}) });
      }
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
          const { fn } = this.tagFunction(module, node.tagName, own);
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
      const key = `${s.kind}|${s.state}|${s.what}|${s.at}|${s.via.join(">")}|${[...s.gates].sort().join(",")}|${s.disabledBy ? JSON.stringify(s.disabledBy) : ""}|${s.within ?? ""}|${s.control?.at ?? ""}|${s.builds?.join(",") ?? ""}`;
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
          const given = this.attributes(module, node.attributes.properties);
          // The primitive's own tag is the control; it is rendered in no function of the kit's, so it is named for the tag.
          const control: Control = { ...this.controlOf(module, node, tag, given, null), in: tag, at };
          const add = (kind: SignalKind, state: SignalState, what: string) => signals.push({ kind, state, what, at, via: [], gates: [], control });
          if (tag === "TextInput") add("text-entry", "focus", "a TextInput");
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
            if (by) signals.push({ kind: "disabled", state: "disabled", what: `${prop} on <${tag}>`, at, via: [], gates: [], disabledBy: [{ props: [prop], keys: [] }], control });
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

/**
 * The component or hook a node is written in: the nearest enclosing function named as one
 * (`MenuRow`, `Slider`, `useHover`), its own name or the constant it is assigned to, passing
 * over the callbacks inside it (`useMemo(() => PanResponder.create(...))`); undefined for a
 * node in neither (a skin's function).
 */
function writtenIn(node: ts.Node): string | undefined {
  const named = (name: string | undefined) => (name && /^(?:[A-Z]|use[A-Z])/.test(name) ? name : undefined);
  for (let current: ts.Node | undefined = node; current; current = current.parent) {
    if ((ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current)) && named(current.name?.text)) return current.name!.text;
    if (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
      let holder: ts.Node = current.parent;
      while (ts.isCallExpression(holder) || ts.isParenthesizedExpression(holder) || ts.isAsExpression(holder)) holder = holder.parent;
      if (ts.isVariableDeclaration(holder) && ts.isIdentifier(holder.name) && named(holder.name.text)) return holder.name.text;
    }
  }
  return undefined;
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

/**
 * The reads of a look input in the functions a value holds (a Pressable's style callback): each
 * read, in its function's body, of a parameter bound to one of `inputs` (`pressed`, or
 * `{ pressed }` destructured), with the function it is the parameter of.
 */
function inputReads(module: Parsed, value: ts.Node, inputs: readonly string[]): { node: ts.Identifier; fn: ts.FunctionLikeDeclaration }[] {
  const reads: { node: ts.Identifier; fn: ts.FunctionLikeDeclaration }[] = [];
  const visit = (node: ts.Node): void => {
    if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.body) {
      const fn = node;
      const ids = node.parameters.flatMap((param) => boundNames(param.name).filter((b) => inputs.includes(b.path.length ? String(b.path[b.path.length - 1]) : b.id.text)).map((b) => b.id));
      const find = (inner: ts.Node): void => {
        if (ts.isIdentifier(inner) && !ids.includes(inner)) {
          const binding = module.reader.resolve(inner);
          if (binding?.kind === "param" && ids.includes(binding.id)) reads.push({ node: inner, fn });
        }
        ts.forEachChild(inner, find);
      };
      if (ids.length) find(node.body);
    }
    ts.forEachChild(node, visit);
  };
  visit(value);
  return reads;
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
  // Taken out only by a prop it is always given: one side of a condition (Video's overlay,
  // hidden beside a control bar and a button without one) leaves it a stop on the other.
  const always = (name: string, test: (value: ts.Expression | null) => boolean) => given.some((a) => a.name === name && !a.conditional && test(a.value));
  const tabIndex = find("tabIndex");
  const focusable = find("focusable");
  const out = always("tabIndex", isMinusOne) || always("focusable", isLiteralFalse);
  if (tag === "Pressable") {
    if (out || always("disabled", isLiteralTrue)) return null;
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
