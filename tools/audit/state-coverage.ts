// Whether the interaction-state table (e2e/support/state-recipes.ts) answers every state a
// component's own source gives it (tools/audit/interaction-signals.ts): a recipe for the
// state, or an exemption whose claim holds against that source and the component's page.
// tools/audit/state-recipes.test.ts runs it over every component, and the checklists'
// "Interaction states" fact (tools/audit/facts.ts) reports what it found.
//
// An overlay is answered one by one: when a component's source renders more than one (the
// Calendar's hover card and its day peek), each needs a recipe that names it (`opens`).
//
// A hover, a focus and a press are answered place by place, as the disabled state is (below):
// on the component's own surface, and inside each overlay it opens, since a row in a menu is
// on the page only once the menu opens and no variant cell photographs it. A recipe answers
// the place it is applied in (`inOverlay`, `opens`), and only through a control of the
// component's own there: the control it names (`StateRecipe.control`, its ARIA role and, where
// given, the function that renders it) must be one the component's source renders in that
// place, in the recipe's example, and the function that renders it must take the state there.
// A control another kit component renders for it (FilterPanel's Clear, Dropdown's default
// trigger, DescriptionList's Update link: kit Buttons) is that component's, whose own recipes
// capture it, so a recipe on one answers nothing and is an error. An opening that a resting
// pointer makes (`alsoAnswers`: Tooltip's bubble) answers the hover of the place it opens
// from: what it captures is the overlay the hover opens, which its `opens` names, and that
// overlay is the component's own whatever element the pointer rests on (Tooltip hands the
// same `disclosure` handlers to its own triggers and to the kit Button of its default one).
//
// The disabled state is the examples': a control is disabled where an example asks for it,
// by passing what its source disables it with (a prop such as `disabled` or `withInput`, or
// the key of the data it reads, `{ label: "Archive", disabled: true }`). It is answered
// place by place: on the component's own surface, and inside each overlay the component
// opens, since a control in an overlay is on the page only once the overlay opens and no
// variant cell photographs it. A place where an example asks for a disabled control needs a
// disabled recipe there (one applied inside an overlay, `inOverlay`, opens that overlay
// first); a place no example asks for needs nothing, and nor does a control the component
// disables by itself (a stepper's minus at its minimum), which every capture of its place
// already shows. There is no exemption for it: a recipe answers what an example shows.
//
// The claims are checked, not taken on trust:
//
//   unpassed       every signal of the state names one of the props among its gates (it is
//                  rendered only when that prop is passed), and no rail example renders
//                  one: none passes every prop it is rendered under.
//   dismissLayers  every signal of the state is a press handler on an element the source
//                  keeps from assistive technology, with no pressed look, whose handler is
//                  empty or closes (`() => {}`, `setOpen(false)`, `onClose()`); and the
//                  component has an open recipe, which captures the overlay itself.
//
// An exemption for a state the source does not give, or beside a recipe for the same
// state, is an error too: it would outlive the code it excused.

import { readFileSync } from "node:fs";
import { relative } from "node:path";
import ts from "typescript";
import { ROOT, componentDocPath, variantSlug } from "../../e2e/support/routes.ts";
import { STATE_NAMES, recipesIn, type ComponentStates, type ControlSpec, type Exemption, type StateName, type StateRecipe } from "../../e2e/support/state-recipes.ts";
import { splitDoc, type Example } from "../docgen/parse-md.ts";
import type { InventoryComponent } from "./inventory.ts";
import { SignalReader, type Control, type Signal, type SignalState } from "./interaction-signals.ts";

/** The states a signal can give: the ones the source decides (invalid is the examples' alone). */
export const SIGNAL_STATES: readonly SignalState[] = ["hover", "focus", "pressed", "open", "disabled"];

export interface StateAnswer {
  state: SignalState;
  /** The component's signals for the state. */
  signals: Signal[];
  /** How the table answers it: `unshown` for a disabled control no example asks for. */
  by: "recipe" | "exemption" | "nothing" | "unshown";
  /** For a hover, a focus, a press or a disabled control: the overlay it is in (`Signal.within`); absent on the component's own surface. */
  within?: string;
  /** For a state answered by a recipe of another state (a tooltip's hover by its open recipe, which a resting pointer opens): that state. */
  recipe?: StateName;
  exemption?: Exemption;
  /** Why the exemption's claim does not hold; absent when it holds. */
  failure?: string;
}

export interface Coverage {
  slug: string;
  answers: StateAnswer[];
  errors: string[];
}

/** The source directory of a component, repo-relative. */
export const sourceDirOf = (component: Pick<InventoryComponent, "category" | "dir">): string => `src/${component.category.toLowerCase()}/${component.dir}`;

/** The component's rail examples: the Usage fence and each variant, as its page renders them. */
export function railExamples(component: Pick<InventoryComponent, "category" | "dir">): Example[] {
  try {
    return splitDoc(readFileSync(componentDocPath(component.category, component.dir), "utf8")).examples;
  } catch {
    return [];
  }
}

/**
 * A component's signals: read from its source, or, for a raw primitive whose directory
 * holds only its markdown (React Native's own component), from what its rail examples hand
 * its tag.
 */
export function componentSignals(reader: SignalReader, component: Pick<InventoryComponent, "category" | "dir" | "name">): Signal[] {
  const sourceDir = sourceDirOf(component);
  if (reader.hasSource(sourceDir)) return reader.signalsOf(sourceDir);
  return reader.exampleSignals(component.name, railExamples(component), relative(ROOT, componentDocPath(component.category, component.dir)));
}

/** The recipes that capture a state: its own, then those of other states whose capture also shows it (`alsoAnswers`). */
function answeringRecipes(entry: ComponentStates, state: StateName): StateRecipe[] {
  const others = STATE_NAMES.filter((name) => name !== state).flatMap((name) => recipesIn(entry, name).filter((r) => r.alsoAnswers?.includes(state)));
  return [...recipesIn(entry, state), ...others];
}

/**
 * Which of the open state's signals the table's recipes answer, and which are left for an
 * exemption. Every recipe that opens something does, except where a component's source
 * renders more than one overlay: each is answered only by a recipe that names it (`opens`,
 * the function the source renders it in), so the Calendar's day peek cannot stand in for its
 * hover card. A recipe naming an overlay the source does not render is an error.
 */
function openAnswers(slug: string, entry: ComponentStates, own: Signal[]): { answered: Signal[]; rest: Signal[]; recipe?: StateName; errors: string[] } {
  const recipes = answeringRecipes(entry, "open");
  const errors: string[] = [];
  const sites = [...new Set(own.map((s) => s.overlay ?? ""))];
  const named = sites.join(", ");
  for (const recipe of recipes) {
    if (recipe.opens && !sites.includes(recipe.opens)) errors.push(`${slug}: its ${recipe.state} recipe opens the overlay in ${recipe.opens}, which its source does not render (it renders ${named})`);
  }
  if (!recipes.length) return { answered: [], rest: own, errors };
  if (sites.length <= 1) return { answered: own, rest: [], recipe: recipes[0]!.state, errors };
  for (const recipe of recipes) {
    if (!recipe.opens) errors.push(`${slug}: its source renders ${sites.length} overlays (${named}), so its ${recipe.state} recipe must name the one it opens`);
  }
  const opened = new Set(recipes.flatMap((r) => (r.opens ? [r.opens] : [])));
  const answered = own.filter((s) => opened.has(s.overlay ?? ""));
  const by = recipes.find((r) => r.opens && opened.has(r.opens));
  return { answered, rest: own.filter((s) => !opened.has(s.overlay ?? "")), ...(by ? { recipe: by.state } : {}), errors };
}

/** Where a signal renders: the overlay it is in, or "" for the component's own surface. */
const placeOfSignal = (signal: Signal): string => signal.within ?? "";

/** The function a signal's control is rendered in, or the one a signal on no element is written in. */
const siteOf = (signal: Signal): string => signal.control?.in ?? signal.in ?? "";

/**
 * A signal on no element that no overlay is known to hold: a skin's function taking
 * `pressed`, a helper of the component's that its rows take (`pressFeedback`), a responder a
 * hook builds. Where it shows is not in the source, so it is the component's whole look,
 * answered wherever a recipe of its state acts on a control of the component's own.
 */
const unplaced = (signal: Signal): boolean => !signal.control && signal.within === undefined;

/** A recipe as a message names it: its state and its example. */
const recipeLabel = (recipe: Pick<StateRecipe, "state" | "variant">) => `its ${recipe.state} recipe on the ${recipe.variant} example`;

/**
 * Where a recipe is applied: "" on the component's own surface, or the overlay it opens first
 * (`inOverlay`), named by `opens` when its source renders more than one (`sites`, the overlays
 * its source renders); null, with the error, when that cannot be told.
 */
function placeOfRecipe(slug: string, recipe: StateRecipe, sites: readonly string[], errors: string[]): string | null {
  if (!recipe.inOverlay) return "";
  const on = recipeLabel(recipe);
  if (recipe.opens) {
    if (sites.includes(recipe.opens)) return recipe.opens;
    errors.push(`${slug}: ${on} opens the overlay in ${recipe.opens}, which its source does not render${sites.length ? ` (it renders ${sites.join(", ")})` : ""}`);
    return null;
  }
  if (sites.length === 1) return sites[0]!;
  errors.push(sites.length ? `${slug}: its source renders ${sites.length} overlays (${sites.join(", ")}), so ${on} must name the one it opens` : `${slug}: ${on} is applied inside an overlay, and its source renders none`);
  return null;
}

/** A control of the component's own where it renders, with the signals it carries there. */
export interface OwnControl {
  control: Control;
  /** The overlay it renders in, or "" on the component's own surface. */
  place: string;
  signals: Signal[];
}

/** The component's own controls: one per element and place its signals are on. */
export function ownControls(signals: readonly Signal[]): OwnControl[] {
  const byKey = new Map<string, OwnControl>();
  for (const signal of signals) {
    if (!signal.control) continue;
    const place = placeOfSignal(signal);
    const key = `${signal.control.at}|${place}`;
    const found = byKey.get(key);
    if (found) found.signals.push(signal);
    else byKey.set(key, { control: signal.control, place, signals: [signal] });
  }
  return [...byKey.values()];
}

/**
 * Whether a control is the one a recipe names: it has the recipe's role (none, for a recipe
 * that names none) and, where the recipe names one, is rendered in its function. A role the
 * reader cannot read may be any.
 */
export function isNamed(spec: ControlSpec, control: Control): boolean {
  if (spec.in && spec.in !== control.in) return false;
  if (control.roleUnread) return true;
  return spec.role ? control.roles.includes(spec.role) : control.roles.length === 0 || control.noRole === true;
}

/** A control as a message names it. */
const describeControl = (control: Pick<Control, "roles" | "in" | "tag">) =>
  `${control.roles.length ? `${article(control.roles[0]!)} ${control.roles.join(" or ")}` : `a <${control.tag}> with no role`} in ${control.in}`;
const describeSpec = (spec: ControlSpec) => `${spec.role ? `${article(spec.role)} ${spec.role}` : "a control with no role"}${spec.in ? ` in ${spec.in}` : ""}`;

/** Whether an example renders a signal: its code passes every prop that renders it (`gates`). */
export function renders(signal: Signal, example: Pick<Example, "code">): boolean {
  const passed = passedBy(example.code);
  return signal.gates.every((prop) => passed.props.has(prop));
}

/**
 * Why a recipe applied at `place` does not act on a control of the component's own, or null
 * when it does. Its control (`StateRecipe.control`) must be one the component's source
 * renders there, in the recipe's example (which passes every prop that renders it), with the
 * recipe's role and, where named, in its function; another kit component the component only
 * disables (`Control.kit`) is its own for the disabled state alone. And that control must
 * take the state: a disabled control is disabled itself, while a hover or a press can be read
 * on what wraps or holds the control (the hover primitive's wrapper, `SidebarRowFrame` around
 * a nav row, a slider's responder), so there the function that renders it, or one it is
 * rendered inside, must take it.
 */
export function controlFailure(recipe: StateRecipe, state: SignalState, place: string, signals: readonly Signal[], rail: readonly Example[]): string | null {
  const spec = recipe.control;
  if (!spec) return "it names no control (`StateRecipe.control`)";
  const example = rail.find((e) => variantSlug(e.label) === recipe.variant);
  const shown = ownControls(signals).filter((c) => c.place === place && (state === "disabled" || !c.control.kit) && (!example || c.signals.some((s) => renders(s, example))));
  const named = shown.filter((c) => isNamed(spec, c.control));
  const where = placeOf(place);
  if (!named.length) {
    const own = [...new Set(shown.map((c) => describeControl(c.control)))];
    return `it acts on ${describeSpec(spec)} ${where}, which is none of the component's own controls there (${own.length ? `its example renders ${own.join(", ")}` : "its example renders none"}); a control another kit component renders is that component's`;
  }
  const fns = new Set(named.flatMap((c) => [c.control.in, ...(c.control.inside ?? [])]));
  const takes =
    state === "disabled"
      ? named.some((c) => c.signals.some((s) => s.state === state))
      : signals.some((s) => s.state === state && (placeOfSignal(s) === place || unplaced(s)) && fns.has(siteOf(s)));
  if (takes) return null;
  return state === "disabled"
    ? `it acts on ${describeControl(named[0]!.control)} ${where}, which its source never disables`
    : `it acts on ${describeControl(named[0]!.control)} ${where}, and nothing ${[...fns].join(" or ")} renders there takes ${article(state)} ${state} state`;
}

/**
 * How the table answers a hover, a focus or a press, place by place: the component's own
 * surface and each overlay its source renders the state's signals in. A place is answered by
 * a recipe of the state applied there through a control of the component's own
 * (`controlFailure`), or by an opening a resting pointer makes there (`alsoAnswers`); the
 * signals of the places left are the exemption's to answer.
 */
function placeAnswers(slug: string, entry: ComponentStates, state: SignalState, own: Signal[], signals: Signal[], rail: readonly Example[], sites: readonly string[]): { answers: StateAnswer[]; rest: Signal[]; errors: string[] } {
  const errors: string[] = [];
  // The state of the recipe that answers each place: the state's own, before an opening's.
  const answered = new Map<string, StateName>();
  for (const recipe of answeringRecipes(entry, state)) {
    const place = placeOfRecipe(slug, recipe, sites, errors);
    if (place === null) continue;
    if (recipe.state !== state) {
      if (!answered.has(place)) answered.set(place, recipe.state);
      continue;
    }
    const failure = controlFailure(recipe, state, place, signals, rail);
    if (failure) {
      errors.push(`${slug}: ${recipeLabel(recipe)} answers nothing: ${failure}`);
      continue;
    }
    answered.set(place, state);
  }
  const answers: StateAnswer[] = [];
  const rest: Signal[] = [];
  const placed = own.filter((s) => !unplaced(s));
  for (const place of [...new Set(placed.map(placeOfSignal))]) {
    const here = placed.filter((s) => placeOfSignal(s) === place);
    const by = answered.get(place);
    if (by) answers.push({ state, signals: here, by: "recipe", ...(place ? { within: place } : {}), ...(by !== state ? { recipe: by } : {}) });
    else rest.push(...here);
  }
  // The component's whole look: answered with any place, and left with none.
  const whole = own.filter(unplaced);
  if (whole.length) {
    const by = answered.get("") ?? answered.values().next().value;
    if (by) answers.push({ state, signals: whole, by: "recipe", ...(by !== state ? { recipe: by } : {}) });
    else rest.push(...whole);
  }
  return { answers, rest, errors };
}

/** A handler that does nothing or closes what is open. */
const DISMISSES = /^\(\)\s*=>\s*\{\s*\}$|^\(\)\s*=>\s*(?:set\w*Open\(false\)|on(?:Close|Dismiss|OpenChange)\??\.?\((?:false)?\)|(?:close|dismiss)\w*\(\))$/;

/** Why an exemption's claim fails, or null when it holds. */
export function exemptionFailure(state: SignalState, exemption: Exemption, signals: Signal[], rail: readonly Example[], entry: ComponentStates): string | null {
  const claim = exemption.claim;
  if ("unpassed" in claim) {
    const props = claim.unpassed;
    if (!props.length) return "it names no prop";
    const ungated = signals.filter((signal) => !signal.gates.some((gate) => props.includes(gate)));
    if (ungated.length) {
      return `${ungated.map((s) => `${s.what} (${s.at})`).join(", ")} ${ungated.length === 1 ? "is" : "are"} rendered without ${props.join(" or ")}`;
    }
    // No example renders one: none passes every prop it needs (GridList's gallery tiles need
    // both `gallery` and `onPressItem`, and its Gallery and Tappable examples pass one each).
    for (const example of rail) {
      const shown = signals.find((signal) => renders(signal, example));
      if (shown) return `the ${example.label} example passes ${shown.gates.filter((gate) => props.includes(gate)).join(", ")}`;
    }
    return null;
  }
  const notLayers = signals.filter((s) => !(s.kind === "press" && s.element?.hidden && !s.element.look && DISMISSES.test(s.element.handler)));
  if (notLayers.length) {
    return `${notLayers.map((s) => `${s.what} (${s.at}${s.element ? `, ${s.element.hidden ? "" : "announced, "}${s.element.look ? "with a pressed look, " : ""}handler ${s.element.handler || "none"}` : ""})`).join(", ")} ${notLayers.length === 1 ? "is not" : "are not"} a hidden dismiss layer`;
  }
  if (!recipesIn(entry, "open").length) return "the component has no open recipe to capture the overlay the layers dismiss";
  return null;
}

const article = (state: string) => (/^[aeiou]/.test(state) ? "an" : "a");

/**
 * What an example's code passes: the props it writes on any tag (`children` for a tag with
 * content between its tags), and the keys of the objects it writes (its items), each given
 * anything but `false`.
 */
interface Passed {
  props: Set<string>;
  keys: Set<string>;
}

const passedCache = new Map<string, Passed>();

/** Read an example's code with the TypeScript parser: the attributes on its tags and the keys of its object literals. */
function passedBy(code: string): Passed {
  const cached = passedCache.get(code);
  if (cached) return cached;
  const sf = ts.createSourceFile("example.tsx", `const example = (<>\n${code}\n</>);\n`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const passed: Passed = { props: new Set(), keys: new Set() };
  const isFalse = (value: ts.Node | undefined) => !!value && value.kind === ts.SyntaxKind.FalseKeyword;
  const visit = (node: ts.Node): void => {
    if (ts.isJsxAttribute(node)) {
      const value = node.initializer && ts.isJsxExpression(node.initializer) ? node.initializer.expression : undefined;
      if (!isFalse(value)) passed.props.add(node.name.getText(sf));
    } else if (ts.isJsxElement(node) && node.children.some((child) => !(ts.isJsxText(child) && child.containsOnlyTriviaWhiteSpaces))) {
      passed.props.add("children");
    } else if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) {
      if (!isFalse(node.initializer)) passed.keys.add(node.name.text);
    } else if (ts.isShorthandPropertyAssignment(node)) passed.keys.add(node.name.text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  passedCache.set(code, passed);
  return passed;
}

/**
 * Whether an example asks for a disabled control: its code passes every prop that renders the
 * control (`gates`) and everything one of the ways its source disables it needs
 * (`disabledBy`: props written on a tag, keys written in an item), a way that needs
 * something. A control the component disables by itself is asked for by no example.
 */
export function asksFor(signal: Signal, example: Pick<Example, "code">): boolean {
  const passed = passedBy(example.code);
  if (!signal.gates.every((prop) => passed.props.has(prop))) return false;
  return (signal.disabledBy ?? []).some((way) => (way.props.length > 0 || way.keys.length > 0) && way.props.every((prop) => passed.props.has(prop)) && way.keys.every((key) => passed.keys.has(key)));
}

const placeOf = (within: string) => (within ? `in the overlay in ${within}` : "on its own surface");

/**
 * How the table answers the disabled controls a component's source renders, place by place:
 * its own surface, and each overlay it opens (`Signal.within`). A place is answered by a
 * disabled recipe applied there (inside an overlay: `inOverlay`, the overlay it opens named
 * by `opens` when the source renders more than one) on a control of the component's own
 * (`controlFailure`); a place no rail example asks for a disabled control in needs nothing
 * (`unshown`).
 */
function disabledCoverage(slug: string, entry: ComponentStates, own: Signal[], signals: Signal[], rail: readonly Example[], sites: readonly string[]): { answers: StateAnswer[]; errors: string[] } {
  const answers: StateAnswer[] = [];
  const errors: string[] = [];
  // Where each disabled recipe is applied: the component's own surface (""), or the overlay it opens first.
  const placed = new Set<string>();
  for (const recipe of recipesIn(entry, "disabled")) {
    const place = placeOfRecipe(slug, recipe, sites, errors);
    if (place === null) continue;
    const failure = controlFailure(recipe, "disabled", place, signals, rail);
    if (failure) errors.push(`${slug}: ${recipeLabel(recipe)} answers nothing: ${failure}`);
    else placed.add(place);
  }
  for (const place of [...new Set(own.map((s) => s.within ?? ""))]) {
    const here = own.filter((s) => (s.within ?? "") === place);
    const within = place ? { within: place } : {};
    if (placed.has(place)) {
      answers.push({ state: "disabled", signals: here, by: "recipe", ...within });
      continue;
    }
    const asked = rail.flatMap((example) => here.filter((signal) => asksFor(signal, example)).slice(0, 1).map((signal) => ({ example, signal })));
    if (!asked.length) {
      answers.push({ state: "disabled", signals: here, by: "unshown", ...within });
      continue;
    }
    const { example, signal } = asked[0]!;
    const where = `${signal.what} at ${signal.at}${signal.via.length ? ` via ${signal.via.join(" > ")}` : ""}`;
    errors.push(`${slug}: its ${example.label} example asks for a disabled control ${placeOf(place)} (${where}), with no disabled recipe there`);
    answers.push({ state: "disabled", signals: here, by: "nothing", ...within });
  }
  if (entry.exempt?.disabled) errors.push(`${slug}: exempts disabled, which a recipe answers where an example asks for it and nothing needs where none does`);
  return { answers, errors };
}

/** How the table answers each state a component's source gives it, and what is wrong. */
export function coverageOf(slug: string, entry: ComponentStates, signals: Signal[], rail: readonly Example[]): Coverage {
  const answers: StateAnswer[] = [];
  const errors: string[] = [];
  const exempt = entry.exempt ?? {};
  // The overlays the source renders, by the names a recipe applied inside one gives them.
  const sites = [...new Set(signals.filter((s) => s.kind === "overlay").map((s) => s.overlay ?? ""))];
  for (const state of SIGNAL_STATES) {
    const own = signals.filter((s) => s.state === state);
    if (state === "disabled") {
      const found = disabledCoverage(slug, entry, own, signals, rail, sites);
      answers.push(...found.answers);
      errors.push(...found.errors);
      continue;
    }
    const exemption = exempt[state];
    let rest: Signal[];
    let answeredAny: boolean;
    if (state === "open") {
      if (!own.length) {
        if (exemption) errors.push(`${slug}: exempts ${state}, which its source does not give it`);
        continue;
      }
      const opened = openAnswers(slug, entry, own);
      errors.push(...opened.errors);
      if (opened.answered.length) answers.push({ state, signals: opened.answered, by: "recipe", ...(opened.recipe && opened.recipe !== state ? { recipe: opened.recipe } : {}) });
      rest = opened.rest;
      answeredAny = opened.answered.length > 0;
    } else {
      // Every recipe of the state is held to the component's own controls, whether or not its source gives it the state.
      const placed = placeAnswers(slug, entry, state, own, signals, rail, sites);
      errors.push(...placed.errors);
      if (!own.length) {
        if (exemption) errors.push(`${slug}: exempts ${state}, which its source does not give it`);
        continue;
      }
      answers.push(...placed.answers);
      rest = placed.rest;
      answeredAny = placed.answers.length > 0;
    }
    if (!rest.length) {
      if (exemption) errors.push(`${slug}: has a ${state} recipe and a ${state} exemption`);
      continue;
    }
    if (exemption) {
      const failure = exemptionFailure(state, exemption, rest, rail, entry);
      if (failure) errors.push(`${slug}: the ${state} exemption does not hold: ${failure}`);
      answers.push({ state, signals: rest, by: "exemption", exemption, ...(failure ? { failure } : {}) });
      continue;
    }
    const where = (signal: Signal) => `${signal.what} at ${signal.at}${signal.via.length ? ` via ${signal.via.join(" > ")}` : ""}`;
    if (state === "open" && answeredAny) {
      // An overlay no recipe names, beside ones a recipe opens.
      errors.push(`${slug}: its source opens the overlay in ${rest[0]!.overlay} (${where(rest[0]!)}), which no recipe opens, with no exemption`);
      answers.push({ state, signals: rest, by: "nothing" });
      continue;
    }
    if (state === "open" || (!recipesIn(entry, state).length && !answeredAny)) {
      errors.push(`${slug}: its source gives it ${article(state)} ${state} state (${where(rest[0]!)}${rest.length > 1 ? `, and ${rest.length - 1} more` : ""}), with neither ${article(state)} ${state} recipe nor an exemption`);
      answers.push({ state, signals: rest, by: "nothing" });
      continue;
    }
    // A place no recipe of the state is applied in, beside the places one is.
    for (const place of [...new Set(rest.map(placeOfSignal))]) {
      const here = rest.filter((s) => placeOfSignal(s) === place);
      errors.push(`${slug}: its source gives it ${article(state)} ${state} state ${placeOf(place)} (${where(here[0]!)}${here.length > 1 ? `, and ${here.length - 1} more` : ""}), where no ${state} recipe acts on a control of its own, with no exemption`);
      answers.push({ state, signals: here, by: "nothing", ...(place ? { within: place } : {}) });
    }
  }
  // An exemption for the state no signal can give (invalid) is never checked, so never allowed.
  for (const state of STATE_NAMES) if (!SIGNAL_STATES.includes(state as SignalState) && exempt[state]) errors.push(`${slug}: exempts ${state}, which no source signal gives`);
  return { slug, answers, errors };
}

/** Every component's coverage against the table. */
export function tableCoverage(components: readonly InventoryComponent[], table: Record<string, ComponentStates>, reader: SignalReader): Coverage[] {
  return components.flatMap((component) => {
    const entry = table[component.slug];
    if (!entry) return [];
    return [coverageOf(component.slug, entry, componentSignals(reader, component), railExamples(component))];
  });
}
