// Whether the interaction-state table (e2e/support/state-recipes.ts) answers every state a
// component's own source gives it (tools/audit/interaction-signals.ts): a recipe for the
// state, or an exemption whose claim holds against that source and the component's page.
// tools/audit/state-recipes.test.ts runs it over every component, and the checklists'
// "Interaction states" fact (tools/audit/facts.ts) reports what it found.
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
import { ROOT, componentDocPath } from "../../e2e/support/routes.ts";
import { STATE_NAMES, type ComponentStates, type Exemption, type StateName, type StateRecipes } from "../../e2e/support/state-recipes.ts";
import { splitDoc, type Example } from "../docgen/parse-md.ts";
import type { InventoryComponent } from "./inventory.ts";
import { SignalReader, exampleSignals, type Signal, type SignalState } from "./interaction-signals.ts";

/** The states a signal can give: the ones the source decides (invalid and disabled are the examples'). */
export const SIGNAL_STATES: readonly SignalState[] = ["hover", "focus", "pressed", "open"];

export interface StateAnswer {
  state: SignalState;
  /** The component's signals for the state. */
  signals: Signal[];
  /** How the table answers it. */
  by: "recipe" | "exemption" | "nothing";
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
  return exampleSignals(component.name, railExamples(component), relative(ROOT, componentDocPath(component.category, component.dir)));
}

const recipeFor = (entry: ComponentStates, state: StateName) => (entry.static ? undefined : (entry as StateRecipes)[state]);

/** The recipe that captures a state: its own, or another state's whose capture also shows it (`alsoAnswers`). */
function answeringRecipe(entry: ComponentStates, state: StateName): { state: StateName } | undefined {
  if (entry.static) return undefined;
  if (recipeFor(entry, state)) return { state };
  const other = STATE_NAMES.find((name) => (entry as StateRecipes)[name]?.alsoAnswers?.includes(state));
  return other ? { state: other } : undefined;
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
  if (!recipeFor(entry, "open")) return "the component has no open recipe to capture the overlay the layers dismiss";
  return null;
}

const article = (state: string) => (/^[aeiou]/.test(state) ? "an" : "a");

/** How the table answers each state a component's source gives it, and what is wrong. */
export function coverageOf(slug: string, entry: ComponentStates, signals: Signal[], rail: readonly Example[]): Coverage {
  const answers: StateAnswer[] = [];
  const errors: string[] = [];
  const exempt = entry.exempt ?? {};
  for (const state of SIGNAL_STATES) {
    const own = signals.filter((s) => s.state === state);
    const exemption = exempt[state];
    const recipe = answeringRecipe(entry, state);
    if (!own.length) {
      if (exemption) errors.push(`${slug}: exempts ${state}, which its source does not give it`);
      continue;
    }
    if (recipe) {
      if (exemption) errors.push(`${slug}: has a ${state} recipe and a ${state} exemption`);
      answers.push({ state, signals: own, by: "recipe", ...(recipe.state !== state ? { recipe: recipe.state } : {}) });
      continue;
    }
    if (exemption) {
      const failure = exemptionFailure(state, exemption, own, rail, entry);
      if (failure) errors.push(`${slug}: the ${state} exemption does not hold: ${failure}`);
      answers.push({ state, signals: own, by: "exemption", exemption, ...(failure ? { failure } : {}) });
      continue;
    }
    const first = own[0]!;
    errors.push(
      `${slug}: its source gives it ${article(state)} ${state} state (${first.what} at ${first.at}${first.via.length ? ` via ${first.via.join(" > ")}` : ""}${own.length > 1 ? `, and ${own.length - 1} more` : ""}), with neither ${article(state)} ${state} recipe nor an exemption`,
    );
    answers.push({ state, signals: own, by: "nothing" });
  }
  // Exemptions for states no signal can give (open, invalid, disabled) are never checked, so never allowed.
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
