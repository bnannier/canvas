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
// A recipe is applied on rows of the docs' three-up (`StateRecipe.rows`), and each row shows
// one platform build (`docsRowsOf`: the build the docs registry injects there, or the web
// build where it injects none; Sidebar's page shows the web row alone). A control a build
// alone renders (Dialog's iOS capsules, `Signal.builds`) is on that build's row alone, so a
// place is answered row by row: a recipe answers its place on each row it is applied on,
// through a control of the component's own on that row, and a signal is answered only where
// a recipe answers its place on a row that renders it. A recipe whose target on a row is a
// kit child (the web Dialog's Cancel, a kit Button) answers nothing there. A signal no row
// the page shows renders (a build whose row the page leaves out) is never on the web
// runner's page: it is recorded as judged on devices (`devices`), never as captured.
//
// Nor is a state whose only feedback on a row is one only a device draws (`deviceFeedback`,
// tools/audit/interaction-signals.ts `DEVICE_FEEDBACK`): the web runner renders every row
// through react-native-web, which never draws `android_ripple`, so Dialog's and AlertDialog's
// Android text buttons, which press with the ripple alone, show the runner nothing while held
// on the Android row. A signal every row that renders it shows only such feedback for is
// recorded as judged on devices too (`devices`, with the `feedback`), and a recipe applied on
// such a row, on such a control, answers nothing and is an error: it would set up a state the
// web cannot show. The ripple counts only on the Android row, which stands for the devices
// that draw it: on the web and iOS rows a press with a ripple and nothing else shows nothing on
// those platforms either, and like a press with no feedback at all it is the web runner's to
// capture, its cell, not reached, the finding.
//
// A recipe's state can also be one the source never shows the web where the recipe is
// applied while the recipe still answers it (`unreachable`): a field disabled only through a
// TextInput's `editable` (Input's and Textarea's Disabled examples) is rendered read-only by
// react-native-web, never `aria-disabled` or a native `disabled`, so the recipe's check of the
// announced state cannot pass. The recipe stays, since its cell records that finding, and the
// checklists list the state as not reachable on the web, with that reason.
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
import { join, relative } from "node:path";
import ts from "typescript";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import { ROOT, componentDocPath, variantSlug } from "../../e2e/support/routes.ts";
import { STATE_NAMES, recipesIn, type ComponentStates, type ControlSpec, type Exemption, type StateName, type StateRecipe } from "../../e2e/support/state-recipes.ts";
import { splitDoc, type Example } from "../docgen/parse-md.ts";
import { registeredSkins } from "../skins/registry.ts";
import type { InventoryComponent } from "./inventory.ts";
import { BUILDS, SignalReader, type Build, type Control, type Signal, type SignalState } from "./interaction-signals.ts";
import type { RowPlatform } from "./probe-math.ts";

/** The states a signal can give: the ones the source decides (invalid is the examples' alone). */
export const SIGNAL_STATES: readonly SignalState[] = ["hover", "focus", "pressed", "open", "disabled"];

export interface StateAnswer {
  state: SignalState;
  /** The component's signals for the state. */
  signals: Signal[];
  /**
   * How the table answers it: `unshown` for a disabled control no example asks for,
   * `devices` for one no row of the page renders (a build whose row the page leaves out), or
   * one whose only feedback on every row that renders it is one only a device draws
   * (`feedback`), which the web runner never has and the devices judge.
   */
  by: "recipe" | "exemption" | "nothing" | "unshown" | "devices";
  /** For a hover, a focus, a press or a disabled control: the overlay it is in (`Signal.within`); absent on the component's own surface. */
  within?: string;
  /**
   * The rows of the page its signals render on, when that is not every row the page shows
   * (Dialog's capsules: the iOS row); for `devices` by `feedback`, always: the rows the
   * feedback is all its controls show of the state on.
   */
  rows?: RowPlatform[];
  /** For `devices` that no row renders: the builds that render its signals. */
  builds?: Build[];
  /** For `devices` on rows the page shows: the prop whose feedback, all its controls show of the state there, only a device draws (`android_ripple`). */
  feedback?: string;
  /** For a state answered by a recipe of another state (a tooltip's hover by its open recipe, which a resting pointer opens): that state. */
  recipe?: StateName;
  exemption?: Exemption;
  /** Why the exemption's claim does not hold; absent when it holds. */
  failure?: string;
}

/**
 * A recipe that answers its state where it is applied, on rows where the source never shows
 * the web runner that state: the rows, and why. `read-only`: the controls it acts on are
 * disabled only through a TextInput's `editable` (`Signal.readOnly`), which react-native-web
 * renders `readonly`, never `aria-disabled` or a native `disabled`, so the recipe's check of
 * the announced state cannot pass.
 */
export interface Unreachable {
  recipe: StateRecipe;
  rows: RowPlatform[];
  why: "read-only";
}

export interface Coverage {
  slug: string;
  answers: StateAnswer[];
  /** The recipes whose state the web runner cannot reach where they are applied. */
  unreachable: Unreachable[];
  errors: string[];
}

/** The source directory of a component, repo-relative. */
export const sourceDirOf = (component: Pick<InventoryComponent, "category" | "dir">): string => `src/${component.category.toLowerCase()}/${component.dir}`;

/**
 * The build each row of a component's docs page renders, for the rows the page shows: the
 * web row the web build; the iOS and Android rows the build the docs registry injects there
 * (docs/src/core/platform-skins.ts, when it registers one of the entry's exports), or the web
 * build where it injects none (Toast's iOS row). A page that shows one preview
 * (`singlePreview`, Sidebar's app frame) has the web row alone.
 */
export type RowBuilds = Partial<Record<RowPlatform, Build>>;

/** The rows of the docs' three-up, in the order the table and the messages name them. */
const ROWS: readonly RowPlatform[] = ["web", "ios", "android"];
const ROW_NAMES: Record<RowPlatform, string> = { web: "web", ios: "iOS", android: "Android" };

let registry: ReturnType<typeof registeredSkins> | null = null;

/** The rows a component's docs page shows, and the build each renders (`RowBuilds`). */
export function docsRowsOf(slug: string, component: Pick<InventoryComponent, "category" | "dir">, reader: SignalReader): RowBuilds {
  if (COMPONENTS.find((c) => c.slug === slug)?.singlePreview) return { web: "web" };
  registry ??= registeredSkins(readFileSync(join(ROOT, "docs/src/core/platform-skins.ts"), "utf8"));
  const sourceDir = sourceDirOf(component);
  const entries = reader.hasSource(sourceDir) ? reader.entriesOf(sourceDir) : [];
  const injected = (platform: "ios" | "android"): Build => (entries.some((e) => e.build === platform && e.exports.some((name) => registry![platform].has(name))) ? platform : "web");
  return { web: "web", ios: injected("ios"), android: injected("android") };
}

/** The rows of the page a signal renders on: those whose build renders it. */
export function rowsOfSignal(signal: Pick<Signal, "builds">, rows: RowBuilds): RowPlatform[] {
  return ROWS.filter((row) => rows[row] !== undefined && (!signal.builds || signal.builds.includes(rows[row]!)));
}

/** Rows as a message names them: "the iOS row", "the iOS and Android rows". */
const rowsText = (rows: readonly RowPlatform[]) => `the ${andText(rows.map((row) => ROW_NAMES[row]))} ${rows.length === 1 ? "row" : "rows"}`;
const andText = (items: readonly string[]) => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

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

/** The builds that render some of the signals, in `BUILDS` order (every build for a signal that names none). */
const buildsOf = (signals: readonly Signal[]): Build[] => BUILDS.filter((build) => signals.some((s) => !s.builds || s.builds.includes(build)));

/**
 * Which of the open state's signals the table's recipes answer, and which are left for an
 * exemption. Every recipe that opens something does, on the rows it is applied on, except
 * where a component's source renders more than one overlay: each is answered only by a
 * recipe that names it (`opens`, the function the source renders it in), so the Calendar's
 * day peek cannot stand in for its hover card. A recipe naming an overlay the source does not
 * render is an error. An overlay no row of the page renders is the devices' (`devices`).
 */
function openAnswers(slug: string, entry: ComponentStates, own: Signal[], rows: RowBuilds): { answered: Signal[]; rest: Signal[]; devices: Signal[]; recipe?: StateName; errors: string[] } {
  const recipes = answeringRecipes(entry, "open");
  const errors: string[] = [];
  const sites = [...new Set(own.map((s) => s.overlay ?? ""))];
  const named = sites.join(", ");
  for (const recipe of recipes) {
    if (recipe.opens && !sites.includes(recipe.opens)) errors.push(`${slug}: its ${recipe.state} recipe opens the overlay in ${recipe.opens}, which its source does not render (it renders ${named})`);
  }
  if (sites.length > 1) {
    for (const recipe of recipes) {
      if (!recipe.opens) errors.push(`${slug}: its source renders ${sites.length} overlays (${named}), so its ${recipe.state} recipe must name the one it opens`);
    }
  }
  const devices = own.filter((s) => !rowsOfSignal(s, rows).length);
  const shown = own.filter((s) => rowsOfSignal(s, rows).length);
  // A recipe answers an overlay it opens (the only one, or the one it names) on a row that renders it.
  const answers = (recipe: StateRecipe, signal: Signal) =>
    (sites.length <= 1 || (recipe.opens !== undefined && recipe.opens === (signal.overlay ?? ""))) && recipe.rows.some((row) => rowsOfSignal(signal, rows).includes(row));
  const answered = shown.filter((s) => recipes.some((r) => answers(r, s)));
  const by = recipes.find((r) => answered.some((s) => answers(r, s)));
  return { answered, rest: shown.filter((s) => !answered.includes(s)), devices, ...(by ? { recipe: by.state } : {}), errors };
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
 * The component's own controls a recipe applied at `place` finds, on a row of `build` (every
 * build's, without one): `shown`, those its source renders there in the recipe's example (one
 * another kit component renders, `Control.kit`, only for the disabled state), and `named`,
 * those of them with the recipe's role and, where it names one, in its function.
 */
export function actedOn(recipe: StateRecipe, state: SignalState, place: string, signals: readonly Signal[], rail: readonly Example[], build?: Build): { shown: OwnControl[]; named: OwnControl[] } {
  const spec = recipe.control;
  const example = rail.find((e) => variantSlug(e.label) === recipe.variant);
  const built = (s: Signal) => build === undefined || !s.builds || s.builds.includes(build);
  const shown = ownControls(signals.filter(built)).filter((c) => c.place === place && (state === "disabled" || !c.control.kit) && (!example || c.signals.some((s) => renders(s, example))));
  return { shown, named: spec ? shown.filter((c) => isNamed(spec, c.control)) : [] };
}

/**
 * The feedback only a device draws that is all a control shows of a state on a row (its
 * prop, `android_ripple`), or null when the web runner can see the state there. The control
 * must be given it in the build the row renders (`Control.deviceOnly`), on the row of the
 * platform that draws it, and nothing of the component's on no element may draw the state on
 * it in that build: a look, a responder or a hover written in the function it is rendered in,
 * in one it is rendered inside, or in none (a skin's function, the component's whole look).
 */
export function deviceFeedback(control: Control, state: SignalState, row: RowPlatform, rows: RowBuilds, signals: readonly Signal[]): string | null {
  const build = rows[row];
  if (build === undefined) return null;
  const found = control.deviceOnly?.find((d) => d.state === state && d.platform === row && (!d.builds || d.builds.includes(build)));
  if (!found) return null;
  const fns = new Set([control.in, ...(control.inside ?? [])]);
  const drawn = signals.some((s) => s.state === state && unplaced(s) && (!s.builds || s.builds.includes(build)) && (s.in === undefined || fns.has(s.in)));
  return drawn ? null : found.prop;
}

/**
 * Why a recipe applied at `place` on `row` sets up a state the web runner cannot show there,
 * or null: every control of the component's own it can act on there shows only feedback a
 * device draws (`deviceFeedback`), so its cell could only ever be not reached.
 */
export function unseenFailure(recipe: StateRecipe, state: SignalState, place: string, signals: readonly Signal[], rail: readonly Example[], row: RowPlatform, rows: RowBuilds): string | null {
  const { named } = actedOn(recipe, state, place, signals, rail, rows[row]);
  const props = named.map((c) => deviceFeedback(c.control, state, row, rows, signals));
  if (!named.length || props.some((prop) => prop === null)) return null;
  const controls = [...new Set(named.map((c) => describeControl(c.control)))];
  return `the only ${state} feedback of ${andText(controls)} ${placeOf(place)} there is ${andText([...new Set(props)].map((prop) => `\`${prop}\``))}, which react-native-web does not draw: the devices judge it`;
}

/**
 * Whether the controls a disabled recipe applied at `place` acts on (on a row of `build`) are
 * disabled only through a TextInput's `editable` (`Signal.readOnly`), which react-native-web
 * renders read-only and never announces disabled: its example asks for one of those, and
 * nothing else of theirs can disable them in that build, so nothing announces it either (a
 * Stepper's field, also handed `aria-disabled` by a helper, is announced).
 */
export function readOnlyOn(recipe: StateRecipe, place: string, signals: readonly Signal[], rail: readonly Example[], build?: Build): boolean {
  const example = rail.find((e) => variantSlug(e.label) === recipe.variant);
  const disabled = actedOn(recipe, "disabled", place, signals, rail, build).named.flatMap((c) => c.signals.filter((s) => s.state === "disabled"));
  return disabled.some((s) => !example || asksFor(s, example)) && disabled.every((s) => s.readOnly === true);
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
 * rendered inside, must take it. `build` is the build of the row the recipe is applied on
 * (`RowBuilds`): only what that build renders is there (Dialog's capsules on the iOS row, kit
 * Buttons alone on the web's); without one, every build's.
 */
export function controlFailure(recipe: StateRecipe, state: SignalState, place: string, signals: readonly Signal[], rail: readonly Example[], build?: Build): string | null {
  const spec = recipe.control;
  if (!spec) return "it names no control (`StateRecipe.control`)";
  const built = (s: Signal) => build === undefined || !s.builds || s.builds.includes(build);
  const { shown, named } = actedOn(recipe, state, place, signals, rail, build);
  const where = placeOf(place);
  if (!named.length) {
    const own = [...new Set(shown.map((c) => describeControl(c.control)))];
    return `it acts on ${describeSpec(spec)} ${where}, which is none of the component's own controls there (${own.length ? `its example renders ${own.join(", ")}` : "its example renders none"}); a control another kit component renders is that component's`;
  }
  const fns = new Set(named.flatMap((c) => [c.control.in, ...(c.control.inside ?? [])]));
  const takes =
    state === "disabled"
      ? named.some((c) => c.signals.some((s) => s.state === state))
      : signals.some((s) => s.state === state && built(s) && (placeOfSignal(s) === place || unplaced(s)) && fns.has(siteOf(s)));
  if (takes) return null;
  return state === "disabled"
    ? `it acts on ${describeControl(named[0]!.control)} ${where}, which its source never disables`
    : `it acts on ${describeControl(named[0]!.control)} ${where}, and nothing ${[...fns].join(" or ")} renders there takes ${article(state)} ${state} state`;
}

/** The rows of the page a recipe is applied on that the page shows (one it does not show is `coverageOf`'s error). */
const shownRows = (recipe: Pick<StateRecipe, "rows">, rows: RowBuilds): RowPlatform[] => ROWS.filter((row) => recipe.rows.includes(row) && rows[row] !== undefined);

/** Where a place and a row meet, as the answers are keyed. */
const at = (place: string, row: RowPlatform) => `${row}|${place}`;

/** The rows signals render on, when that is not every row the page shows. */
function partialRows(signals: readonly Signal[], rows: RowBuilds): Pick<StateAnswer, "rows"> {
  const on = ROWS.filter((row) => signals.some((s) => rowsOfSignal(s, rows).includes(row)));
  return on.length < ROWS.filter((row) => rows[row] !== undefined).length ? { rows: on } : {};
}

/**
 * How the table answers a hover, a focus or a press, place by place and row by row: the
 * component's own surface and each overlay its source renders the state's signals in, on each
 * row of the page. A place is answered on a row by a recipe of the state applied there on that
 * row through a control of the component's own on it (`controlFailure`) that the web runner can
 * see the state on (`unseenFailure`), or by an opening a resting pointer makes there
 * (`alsoAnswers`); a signal is answered where its place is, on a row that renders it. The
 * signals no row renders are the devices', and so are those left whose controls show only a
 * device's feedback of the state on every row that renders them (`deviceFeedback`); the rest
 * are the exemption's to answer.
 */
function placeAnswers(slug: string, entry: ComponentStates, state: SignalState, own: Signal[], signals: Signal[], rail: readonly Example[], sites: readonly string[], rows: RowBuilds): { answers: StateAnswer[]; rest: Signal[]; errors: string[] } {
  const all = signals;
  const errors: string[] = [];
  // The state of the recipe that answers each place on each row: the state's own, before an opening's.
  const answered = new Map<string, StateName>();
  for (const recipe of answeringRecipes(entry, state)) {
    const place = placeOfRecipe(slug, recipe, sites, errors);
    if (place === null) continue;
    for (const row of shownRows(recipe, rows)) {
      if (recipe.state !== state) {
        if (!answered.has(at(place, row))) answered.set(at(place, row), recipe.state);
        continue;
      }
      const failure = controlFailure(recipe, state, place, signals, rail, rows[row]) ?? unseenFailure(recipe, state, place, signals, rail, row, rows);
      if (failure) {
        errors.push(`${slug}: ${recipeLabel(recipe)} answers nothing on the ${ROW_NAMES[row]} row: ${failure}`);
        continue;
      }
      answered.set(at(place, row), state);
    }
  }
  // The state that answers a signal in one of `places`, on a row that renders it: its own first.
  const answeredBy = (signal: Signal, places: readonly string[]): StateName | undefined => {
    const found = rowsOfSignal(signal, rows).flatMap((row) => places.flatMap((place) => answered.get(at(place, row)) ?? []));
    return found.includes(state) ? state : found[0];
  };
  const answers: StateAnswer[] = [];
  const rest: Signal[] = [];
  const answer = (signals: Signal[], places: readonly string[], within: Pick<StateAnswer, "within">) => {
    const devices = signals.filter((s) => !rowsOfSignal(s, rows).length);
    if (devices.length) answers.push({ state, signals: devices, by: "devices", ...within, builds: buildsOf(devices) });
    const shown = signals.filter((s) => rowsOfSignal(s, rows).length);
    const by = shown.filter((s) => answeredBy(s, places));
    if (by.length) {
      const recipe = by.some((s) => answeredBy(s, places) === state) ? state : answeredBy(by[0]!, places)!;
      answers.push({ state, signals: by, by: "recipe", ...within, ...partialRows(by, rows), ...(recipe !== state ? { recipe } : {}) });
    }
    // Of those left, a signal whose control shows only a device's feedback of the state on
    // every row that renders it is the devices': the web runner can show it on none.
    const unseen = new Map<string, Signal[]>();
    for (const signal of shown.filter((s) => !by.includes(s))) {
      const props = signal.control ? rowsOfSignal(signal, rows).map((row) => deviceFeedback(signal.control!, state, row, rows, all)) : [null];
      if (props.some((prop) => prop === null)) {
        rest.push(signal);
        continue;
      }
      const feedback = [...new Set(props)].join(", ");
      unseen.set(feedback, [...(unseen.get(feedback) ?? []), signal]);
    }
    for (const [feedback, group] of unseen) {
      answers.push({ state, signals: group, by: "devices", ...within, rows: ROWS.filter((row) => group.some((s) => rowsOfSignal(s, rows).includes(row))), feedback });
    }
  };
  const placed = own.filter((s) => !unplaced(s));
  for (const place of [...new Set(placed.map(placeOfSignal))]) {
    answer(
      placed.filter((s) => placeOfSignal(s) === place),
      [place],
      place ? { within: place } : {},
    );
  }
  // The component's whole look: answered with any place, on a row that renders it, and left with none.
  const whole = own.filter(unplaced);
  if (whole.length) answer(whole, ["", ...sites], {});
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
 * How the table answers the disabled controls a component's source renders, place by place
 * and row by row: its own surface, and each overlay it opens (`Signal.within`), on each row of
 * the page. A place is answered on a row by a disabled recipe applied there on that row
 * (inside an overlay: `inOverlay`, the overlay it opens named by `opens` when the source
 * renders more than one) on a control of the component's own on it (`controlFailure`); a
 * control is answered where its place is, on a row that renders it. Of those left, a place no
 * rail example asks for a disabled control in needs nothing (`unshown`); one no row renders is
 * the devices'. A recipe that answers its place on a row where every control it acts on is
 * disabled only through `editable` (`readOnlyOn`) still answers it, and is `unreachable` there.
 */
function disabledCoverage(slug: string, entry: ComponentStates, own: Signal[], signals: Signal[], rail: readonly Example[], sites: readonly string[], rows: RowBuilds): { answers: StateAnswer[]; unreachable: Unreachable[]; errors: string[] } {
  const answers: StateAnswer[] = [];
  const unreachable: Unreachable[] = [];
  const errors: string[] = [];
  // Where each disabled recipe is applied, on each row: the component's own surface (""), or the overlay it opens first.
  const placed = new Set<string>();
  for (const recipe of recipesIn(entry, "disabled")) {
    const place = placeOfRecipe(slug, recipe, sites, errors);
    if (place === null) continue;
    const readOnly: RowPlatform[] = [];
    for (const row of shownRows(recipe, rows)) {
      const failure = controlFailure(recipe, "disabled", place, signals, rail, rows[row]);
      if (failure) {
        errors.push(`${slug}: ${recipeLabel(recipe)} answers nothing on the ${ROW_NAMES[row]} row: ${failure}`);
        continue;
      }
      placed.add(at(place, row));
      if (readOnlyOn(recipe, place, signals, rail, rows[row])) readOnly.push(row);
    }
    if (readOnly.length) unreachable.push({ recipe, rows: readOnly, why: "read-only" });
  }
  for (const place of [...new Set(own.map((s) => s.within ?? ""))]) {
    const here = own.filter((s) => (s.within ?? "") === place);
    const within = place ? { within: place } : {};
    const devices = here.filter((s) => !rowsOfSignal(s, rows).length);
    if (devices.length) answers.push({ state: "disabled", signals: devices, by: "devices", ...within, builds: buildsOf(devices) });
    const shown = here.filter((s) => rowsOfSignal(s, rows).length);
    const answered = shown.filter((s) => rowsOfSignal(s, rows).some((row) => placed.has(at(place, row))));
    if (answered.length) answers.push({ state: "disabled", signals: answered, by: "recipe", ...within, ...partialRows(answered, rows) });
    const left = shown.filter((s) => !answered.includes(s));
    if (!left.length) continue;
    const onRows = partialRows(left, rows);
    const asked = rail.flatMap((example) => left.filter((signal) => asksFor(signal, example)).slice(0, 1).map((signal) => ({ example, signal })));
    if (!asked.length) {
      answers.push({ state: "disabled", signals: left, by: "unshown", ...within, ...onRows });
      continue;
    }
    const { example, signal } = asked[0]!;
    const where = `${signal.what} at ${signal.at}${signal.via.length ? ` via ${signal.via.join(" > ")}` : ""}`;
    errors.push(`${slug}: its ${example.label} example asks for a disabled control ${placeOf(place)}${onRows.rows ? ` on ${rowsText(onRows.rows)}` : ""} (${where}), with no disabled recipe there`);
    answers.push({ state: "disabled", signals: left, by: "nothing", ...within, ...onRows });
  }
  if (entry.exempt?.disabled) errors.push(`${slug}: exempts disabled, which a recipe answers where an example asks for it and nothing needs where none does`);
  return { answers, unreachable, errors };
}

/**
 * How the table answers each state a component's source gives it, and what is wrong. `rows`
 * are the rows the component's page shows and the build each renders (`docsRowsOf`).
 */
export function coverageOf(slug: string, entry: ComponentStates, signals: Signal[], rail: readonly Example[], rows: RowBuilds): Coverage {
  const answers: StateAnswer[] = [];
  const unreachable: Unreachable[] = [];
  const errors: string[] = [];
  const exempt = entry.exempt ?? {};
  // A recipe applied on a row the page does not show captures nothing.
  for (const state of STATE_NAMES) {
    for (const recipe of recipesIn(entry, state)) {
      for (const row of recipe.rows) if (rows[row] === undefined) errors.push(`${slug}: ${recipeLabel(recipe)} is applied on the ${ROW_NAMES[row]} row, which its page does not show`);
    }
  }
  // The overlays the source renders, by the names a recipe applied inside one gives them.
  const sites = [...new Set(signals.filter((s) => s.kind === "overlay").map((s) => s.overlay ?? ""))];
  for (const state of SIGNAL_STATES) {
    const own = signals.filter((s) => s.state === state);
    if (state === "disabled") {
      const found = disabledCoverage(slug, entry, own, signals, rail, sites, rows);
      answers.push(...found.answers);
      unreachable.push(...found.unreachable);
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
      const opened = openAnswers(slug, entry, own, rows);
      errors.push(...opened.errors);
      if (opened.devices.length) answers.push({ state, signals: opened.devices, by: "devices", builds: buildsOf(opened.devices) });
      if (opened.answered.length) answers.push({ state, signals: opened.answered, by: "recipe", ...partialRows(opened.answered, rows), ...(opened.recipe && opened.recipe !== state ? { recipe: opened.recipe } : {}) });
      rest = opened.rest;
      answeredAny = opened.answered.length > 0;
    } else {
      // Every recipe of the state is held to the component's own controls, whether or not its source gives it the state.
      const placed = placeAnswers(slug, entry, state, own, signals, rail, sites, rows);
      errors.push(...placed.errors);
      if (!own.length) {
        if (exemption) errors.push(`${slug}: exempts ${state}, which its source does not give it`);
        continue;
      }
      answers.push(...placed.answers);
      rest = placed.rest;
      answeredAny = placed.answers.some((a) => a.by === "recipe");
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
      answers.push({ state, signals: rest, by: "nothing", ...partialRows(rest, rows) });
      continue;
    }
    if (state === "open" || (!recipesIn(entry, state).length && !answeredAny)) {
      errors.push(`${slug}: its source gives it ${article(state)} ${state} state (${where(rest[0]!)}${rest.length > 1 ? `, and ${rest.length - 1} more` : ""}), with neither ${article(state)} ${state} recipe nor an exemption`);
      answers.push({ state, signals: rest, by: "nothing", ...partialRows(rest, rows) });
      continue;
    }
    // A place (or a row) no recipe of the state is applied in, beside the ones one is.
    for (const place of [...new Set(rest.map(placeOfSignal))]) {
      const here = rest.filter((s) => placeOfSignal(s) === place);
      const onRows = partialRows(here, rows);
      errors.push(
        `${slug}: its source gives it ${article(state)} ${state} state ${placeOf(place)}${onRows.rows ? ` on ${rowsText(onRows.rows)}` : ""} (${where(here[0]!)}${here.length > 1 ? `, and ${here.length - 1} more` : ""}), where no ${state} recipe acts on a control of its own, with no exemption`,
      );
      answers.push({ state, signals: here, by: "nothing", ...(place ? { within: place } : {}), ...onRows });
    }
  }
  // An exemption for the state no signal can give (invalid) is never checked, so never allowed.
  for (const state of STATE_NAMES) if (!SIGNAL_STATES.includes(state as SignalState) && exempt[state]) errors.push(`${slug}: exempts ${state}, which no source signal gives`);
  return { slug, answers, unreachable, errors };
}

/** Every component's coverage against the table. */
export function tableCoverage(components: readonly InventoryComponent[], table: Record<string, ComponentStates>, reader: SignalReader): Coverage[] {
  return components.flatMap((component) => {
    const entry = table[component.slug];
    if (!entry) return [];
    return [coverageOf(component.slug, entry, componentSignals(reader, component), railExamples(component), docsRowsOf(component.slug, component, reader))];
  });
}
