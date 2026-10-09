// Whether the interaction-state table (e2e/support/state-recipes.ts) answers every state a
// component's own source gives it (tools/audit/interaction-signals.ts): a recipe for the
// state, or an exemption whose claim holds against that source and the component's page.
// tools/audit/state-recipes.test.ts runs it over every component, and the checklists'
// "Interaction states" fact (tools/audit/facts.ts) reports what it found.
//
// An overlay is answered one by one: when a component's source renders more than one (the
// Calendar's hover card and its day peek), each needs a recipe that names it (`opens`).
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
//                  rendered only when that prop is passed), and no rail example's code
//                  names any of those props.
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
import { ROOT, componentDocPath } from "../../e2e/support/routes.ts";
import { STATE_NAMES, recipesIn, type ComponentStates, type Exemption, type StateName, type StateRecipe } from "../../e2e/support/state-recipes.ts";
import { splitDoc, type Example } from "../docgen/parse-md.ts";
import type { InventoryComponent } from "./inventory.ts";
import { SignalReader, type Signal, type SignalState } from "./interaction-signals.ts";

/** The states a signal can give: the ones the source decides (invalid is the examples' alone). */
export const SIGNAL_STATES: readonly SignalState[] = ["hover", "focus", "pressed", "open", "disabled"];

export interface StateAnswer {
  state: SignalState;
  /** The component's signals for the state. */
  signals: Signal[];
  /** How the table answers it: `unshown` for a disabled control no example asks for. */
  by: "recipe" | "exemption" | "nothing" | "unshown";
  /** For the disabled state: the overlay the controls are in (`Signal.within`); absent on the component's own surface. */
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
 * Which of a state's signals the table's recipes answer, and which are left for an
 * exemption. Every recipe that answers it does, except for the overlays a component opens:
 * when its source renders more than one, each is answered only by a recipe that names it
 * (`opens`, the function the source renders it in), so the Calendar's day peek cannot stand
 * in for its hover card. A recipe naming an overlay the source does not render is an error.
 */
function recipeAnswers(slug: string, entry: ComponentStates, state: SignalState, own: Signal[]): { answered: Signal[]; rest: Signal[]; recipe?: StateName; errors: string[] } {
  const recipes = answeringRecipes(entry, state);
  const errors: string[] = [];
  if (state !== "open") return recipes.length ? { answered: own, rest: [], recipe: recipes[0]!.state, errors } : { answered: [], rest: own, errors };
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
    for (const example of rail) {
      const named = props.filter((prop) => new RegExp(`\\b${prop}\\b`).test(example.code));
      if (named.length) return `the ${example.label} example passes ${named.join(", ")}`;
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

/** What an example's code passes: the props it writes on any tag, and the keys of the objects it writes (its items), each given anything but `false`. */
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
 * by `opens` when the source renders more than one); a place no rail example asks for a
 * disabled control in needs nothing (`unshown`).
 */
function disabledCoverage(slug: string, entry: ComponentStates, own: Signal[], signals: Signal[], rail: readonly Example[]): { answers: StateAnswer[]; errors: string[] } {
  const answers: StateAnswer[] = [];
  const errors: string[] = [];
  const sites = [...new Set(signals.filter((s) => s.kind === "overlay").map((s) => s.overlay ?? ""))];
  // Where each disabled recipe is applied: the component's own surface (""), or the overlay it opens first.
  const placed = new Set<string>();
  for (const recipe of recipesIn(entry, "disabled")) {
    if (!recipe.inOverlay) {
      placed.add("");
      continue;
    }
    const on = `its disabled recipe on the ${recipe.variant} example`;
    if (recipe.opens) {
      if (sites.includes(recipe.opens)) placed.add(recipe.opens);
      else errors.push(`${slug}: ${on} opens the overlay in ${recipe.opens}, which its source does not render${sites.length ? ` (it renders ${sites.join(", ")})` : ""}`);
    } else if (sites.length === 1) placed.add(sites[0]!);
    else errors.push(sites.length ? `${slug}: its source renders ${sites.length} overlays (${sites.join(", ")}), so ${on} must name the one it opens` : `${slug}: ${on} is applied inside an overlay, and its source renders none`);
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
  for (const state of SIGNAL_STATES) {
    const own = signals.filter((s) => s.state === state);
    if (state === "disabled") {
      const found = disabledCoverage(slug, entry, own, signals, rail);
      answers.push(...found.answers);
      errors.push(...found.errors);
      continue;
    }
    const exemption = exempt[state];
    if (!own.length) {
      if (exemption) errors.push(`${slug}: exempts ${state}, which its source does not give it`);
      continue;
    }
    const { answered, rest, recipe, errors: named } = recipeAnswers(slug, entry, state, own);
    errors.push(...named);
    if (answered.length) answers.push({ state, signals: answered, by: "recipe", ...(recipe && recipe !== state ? { recipe } : {}) });
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
    const first = rest[0]!;
    const where = `${first.what} at ${first.at}${first.via.length ? ` via ${first.via.join(" > ")}` : ""}`;
    errors.push(
      answered.length
        ? // An overlay no recipe names, beside ones a recipe opens.
          `${slug}: its source opens the overlay in ${first.overlay} (${where}), which no recipe opens, with no exemption`
        : `${slug}: its source gives it ${article(state)} ${state} state (${where}${rest.length > 1 ? `, and ${rest.length - 1} more` : ""}), with neither ${article(state)} ${state} recipe nor an exemption`,
    );
    answers.push({ state, signals: rest, by: "nothing" });
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
