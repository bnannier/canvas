/**
 * How to put every interactive component into each interaction state it has, in one
 * place (the component audit's plan, 1d).
 *
 * overlay-recipes.ts answers one question for the e2e suite and lookout: how to open an
 * overlay. The audit asks the wider one per component: how to hover it, focus it, press
 * it, open it, find it invalid and find it disabled, and how to tell that it really is in
 * that state before it is photographed. Every component the interaction registry lists
 * (tools/interactions/registry.ts `inventory`) has an entry here: the recipes for the
 * states it has, or `static: true` with the reason it has none, and `exempt` for a state
 * its source gives it that no capture is due for; every recipe names an example of its
 * page. tools/audit/state-recipes.test.ts holds the table to the registry, the pages, and
 * each component's own source (tools/audit/interaction-signals.ts reads the states a
 * source gives: a press, a scrub surface, a hover or field handler, a pressed, hovered or
 * focused look, an overlay, a disabled control, the control each is on and the overlay it is
 * in; tools/audit/state-coverage.ts checks that each has a recipe or an exemption whose claim
 * holds, that a hover, a focus and a press are answered in every place the source renders
 * them, the component's own surface and each overlay it opens, and every place an example
 * asks for a disabled control in, and that each recipe acts on a control of the component's
 * own there, `StateRecipe.control`: a control another kit component renders for it is that
 * component's, whose own recipes capture it).
 *
 * A recipe has three steps, each through the input a person uses:
 *
 *   apply    hover: the pointer moves onto the control. focus: the Tab key, from the tab
 *            stop before the control (in a menu that puts focus on its first row as it
 *            opens, the arrow key that moves it on). pressed: the pointer goes down on the control and
 *            stays down (a chart is pressed on one datum to inspect it). open: the
 *            overlay recipes' own click (or a hover, for a tooltip), from the platform
 *            row the cell names. invalid: the example that shows an error, or typing
 *            past a limit. disabled: the example that disables the control.
 *   verify   reads the page and says whether the state was reached, with the structural
 *            evidence, on the element the state landed on, which must be the recipe's own
 *            control (its role, `controlMismatch`): for hover, what changed in the computed style of the control, its
 *            contents and its wrappers up to the row (the lift's transform and shade and
 *            the wash's background that src/style/hover.tsx applies are the hover; a
 *            control whose web skin declares none has no hover recipe); for focus, the
 *            node that took focus, whether it matches :focus-visible, the node that draws
 *            the ring and whether the ring shows on every side (e2e/support/focus-ring.ts
 *            `ringShows`); for pressed, what holding the pointer down changed against the
 *            hovered control, or for a chart the value flag or readout the press shows
 *            (text it did not show with the pointer away) or the marks it repaints; for
 *            open, the panel the opening added, where it painted,
 *            whether it runs edge to edge at the viewport's bottom (a sheet) and whether
 *            the trigger says it is expanded; `aria-invalid` and `aria-disabled` (or a
 *            native `disabled`) for the last two. A state verify cannot confirm is not
 *            reached: the capture records the cell as `state-not-reached` with the reason,
 *            and photographs nothing.
 *   release  takes the state away (the pointer moves off; focus blurs; a press is
 *            cancelled by moving off before the button comes up, or ends in place on a
 *            thumb or a drag handle that a move would drag; an inspection is cleared by a
 *            second press on the same datum; an overlay closes on Escape) and measures how
 *            that went against the page before the state was applied. What it finds wrong
 *            is a flag like any other: `press-not-cancelled` (a click reached the control as
 *            the button came up after moving off, which is a Pressable's press firing; the
 *            control left the page; or the row's accessibility tree, the address, or the
 *            pressed control's computed look or pixels differ from before the press),
 *            `press-selects-label` (dragging off the control selected its own label's
 *            text), `inspection-not-cleared` and `overlay-not-closed`.
 *
 * What a defect looks like is recorded, not hidden: a focused control whose ring does not
 * show is still a reached focus state, flagged `focus-ring-missing` or
 * `focus-ring-hidden`; an overlay whose trigger does not report `aria-expanded="true"` is
 * still open, flagged `expanded-not-announced`; a tooltip that pushes its trigger out from
 * under the resting pointer is photographed open once the pointer follows the trigger,
 * flagged `hover-unstable`.
 *
 * Nothing here navigates or photographs: the capture (e2e/audit/state-cell.ts) opens the
 * example, fits the card, builds the scene, calls the steps and takes the picture. The
 * runtime imports are the overlay recipes and the ring check, whose Playwright imports
 * are types only, so the runner (tools/audit/run-web.ts) and the unit test read this
 * table under bun. The in-page readers below must stay self-contained.
 */
import type { ElementHandle, JSHandle, Locator, Page } from "@playwright/test";
import { WIDTHS, widthsAtOrBelow, type WidthKey } from "../../tools/audit/inventory.ts";
import type { RowPlatform } from "../../tools/audit/probe-math.ts";
import { ringShows } from "./focus-ring";
import { MATERIAL_OVERLAY_RECIPES, PHONE_INPUT_RECIPE, TOAST_RECIPE, type OverlayRecipe } from "./overlay-recipes";

/** The interaction states, in the order a component's cells are captured. */
export const STATE_NAMES = ["hover", "focus", "pressed", "open", "invalid", "disabled"] as const;
export type StateName = (typeof STATE_NAMES)[number];

/** Where a state is applied: the page, the Playground stage, one platform row of its card. */
export interface StateScene {
  page: Page;
  /** The Playground stage: the platform rows, and the outlet an anchored overlay portals into. */
  stage: Locator;
  /** The platform row the state is applied in. */
  row: Locator;
  platform: RowPlatform;
  /** The look's focus ring colour, as a computed style reports it (`rgb(r, g, b)`). */
  ring: string;
}

/**
 * The defects a reached state shows, beside the probe's own flags (`Reached.flags`), each
 * with what it means. The reviewer's index (tools/audit/index.ts) says them in these words.
 */
export const STATE_FLAGS = {
  "focus-ring-missing": "focus arrived on the control and nothing drew a new edge",
  "focus-ring-hidden": "the focus ring is drawn but does not show on every side",
  "focus-ring-colour": "the focus ring is not the look's ring colour",
  "expanded-not-announced": "the overlay is open but its trigger does not report aria-expanded=\"true\"",
  "error-not-described": "the field is aria-invalid but describes no error text",
  "disabled-tab-stop": "the disabled control is still a tab stop",
  "hover-unstable": "the tooltip's bubble pushed its trigger out from under the resting pointer, which had to follow it",
} as const;
export type StateFlag = keyof typeof STATE_FLAGS;

/** What a release found wrong (`Released.flags`), each with what it means; recorded for a state not reached as well. */
export const RELEASE_FLAGS = {
  "press-not-cancelled": "the press took effect where it should have been cancelled: a click reached the control as the button came up after moving off, the control left the page, or the row's tree, the address, or the control's look or pixels changed",
  "press-selects-label": "dragging off the control selected its own label's text",
  "inspection-not-cleared": "a second press on the inspected datum did not clear the inspection",
  "overlay-not-closed": "the overlay was still open 3 s after its close",
} as const;
export type ReleaseFlag = keyof typeof RELEASE_FLAGS;

export interface Reached {
  reached: true;
  /** What verify read off the page that shows the state. */
  evidence: Record<string, unknown>;
  /** Defects the state shows, beside the probe's own flags. */
  flags: StateFlag[];
  /**
   * The node the state opened (a menu, a dialog, a sheet, a bubble), or the one a state
   * applied inside an overlay is in (`StateRecipe.inOverlay`), probed beside the row.
   */
  panel?: Locator;
}

export interface NotReached {
  reached: false;
  /** Why the state could not be confirmed, in a sentence. */
  reason: string;
  evidence: Record<string, unknown>;
}

export type Verdict = Reached | NotReached;

/**
 * The control a recipe acts on, as the component's own source gives it
 * (tools/audit/interaction-signals.ts `Control`): the ARIA role the page gives it, absent for
 * one with none (a chart's scrub surface, a bare tab stop), and the function the source
 * renders it in, given where its role does not single it out. A control another kit
 * component renders for the component (FilterPanel's Clear, a kit Button) is that
 * component's, so tools/audit/state-coverage.ts refuses a recipe whose control is none of
 * the component's own where the recipe is applied, on each row it is applied on: a row shows
 * one platform build, and a build renders only its own skin's controls (the web Dialog's
 * Cancel is a kit Button, its iOS build's a capsule of its own), so the same role and name
 * can be the component's own control on one row and a kit child on another.
 */
export interface ControlSpec {
  role?: string;
  in?: string;
}

export interface StateRecipe {
  state: StateName;
  /** The example it is applied to: a variant key of the component's page (`default` for the Usage fence). */
  variant: string;
  /**
   * The platform rows of the docs' three-up it is applied from: the web row, unless the
   * control it acts on is the component's own only where another build renders it (Dialog's
   * and AlertDialog's iOS capsules and Android text buttons, `NATIVE_ROWS`), and every row an
   * overlay opens from.
   */
  rows: readonly RowPlatform[];
  /**
   * The widths it is captured at: the desktop (`DESKTOP`) for a state the pointer or the
   * keyboard gives, every width (`EVERY_WIDTH`) for an opening, since an overlay becomes a
   * sheet on a phone, and the widths a state exists at when it exists only there (a drawer a
   * component becomes at and below a breakpoint, `widthsAtOrBelow`; a scroll region that is a
   * tab stop only where its content overflows).
   */
  widths: readonly WidthKey[];
  /**
   * The other states its capture shows, for the source signals a state of its own would
   * answer: an opening under a resting pointer (a tooltip's bubble) is its trigger's hover.
   */
  alsoAnswers?: readonly StateName[];
  /**
   * For a recipe that opens an overlay, the one it opens, named as the component's source
   * names the function that renders it (tools/audit/interaction-signals.ts `Signal.overlay`):
   * given when the source renders more than one, so each is answered by the recipe that
   * shows it (the Calendar's `hoverCard` and `dayPeekOverlay`).
   */
  opens?: string;
  /**
   * The state is applied inside an overlay the recipe opens first (a hover, a focus, a press
   * or a disabled control in an opened menu, dialog or sheet), so it answers what the source
   * renders in that overlay (`Signal.within`), not on the component's own surface. Its
   * verdict hands the capture that overlay (`Reached.panel`), which is probed beside the
   * row, so the texts and targets of the photograph's overlay are read too.
   */
  inOverlay?: true;
  /**
   * The control the state is applied to (`ControlSpec`), on a hover, focus, pressed or
   * disabled recipe; an opening names its overlay instead (`opens`). The coverage holds it to
   * the component's own controls where the recipe is applied, and the capture holds the
   * element the state lands on to its role.
   */
  control?: ControlSpec;
  /**
   * What the photograph frames: the row the state is in (the card is fitted into a viewport
   * grown to hold it, as a variant cell's is), or the viewport at the cell's own size,
   * since an open overlay can paint anywhere in it and a sheet is placed against it.
   */
  frame: "row" | "viewport";
  /** How the state is reached, in a line, for the probe. */
  how: string;
  apply(scene: StateScene): Promise<unknown>;
  verify(scene: StateScene, applied: unknown): Promise<Verdict>;
  release(scene: StateScene, applied: unknown): Promise<Released>;
}

/** What a release did (for probe.json), and the defects it found (the cell's flags). */
export interface Released {
  report: Record<string, unknown>;
  flags: ReleaseFlag[];
}

/**
 * Why a component has no recipe for a state its own source gives it, as a claim
 * tools/audit/state-coverage.ts checks against that source and the component's page
 * (tools/audit/interaction-signals.ts reads the signals):
 *
 *   unpassed       every signal of the state is rendered only when one of these props is
 *                  passed (`onItemPress` makes a Feeds row a button), and no rail example
 *                  renders one (none passes every prop it needs), so no example shows the state.
 *   dismissLayers  every signal of the state is a press on a node kept from assistive
 *                  technology, with no pressed look, whose handler closes the overlay or
 *                  does nothing (a scrim, a panel that swallows a stray press); the overlay
 *                  itself has an open recipe.
 */
export type ExemptionClaim = { unpassed: readonly string[] } | { dismissLayers: true };

export interface Exemption {
  claim: ExemptionClaim;
  /** What the exempt signals are and why no capture is due, in a sentence. */
  reason: string;
}

export type Exemptions = { [K in StateName]?: Exemption };

/** A component with no interaction state of its own, and why; `exempt` answers the states its source gives it anyway. */
export interface StaticEntry {
  static: true;
  reason: string;
  exempt?: Exemptions;
}

/**
 * A component's recipes, by state: one, or, for a state it shows in more than one place (a
 * Dropdown's disabled trigger, and the disabled item inside its menu), one per place.
 */
export type StateRecipes = { static?: undefined; exempt?: Exemptions } & { [K in StateName]?: StateRecipe | readonly StateRecipe[] };
export type ComponentStates = StaticEntry | StateRecipes;

const isRecipeList = (value: StateRecipe | readonly StateRecipe[]): value is readonly StateRecipe[] => Array.isArray(value);

/** An entry's recipes for one state, in the table's order; none for a static entry. */
export function recipesIn(entry: ComponentStates, state: StateName): StateRecipe[] {
  if (entry.static) return [];
  const found = (entry as StateRecipes)[state];
  if (!found) return [];
  return isRecipeList(found) ? [...found] : [found];
}

// --- Reading the page --------------------------------------------------------------

/** The computed properties a state can change, read on the control, its contents and its wrappers. */
const WATCHED = [
  "transform",
  "translate",
  "scale",
  "background-color",
  "box-shadow",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  // A ring drawn as a wider border (the web Slider thumb's pressed ring).
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "color",
  "opacity",
  "filter",
  "outline-style",
  "outline-color",
  "outline-width",
] as const;

/** The properties src/style/hover.tsx changes (its `HoverProperty`, with the individual transform properties). */
export const HOVER_PROPERTIES: ReadonlySet<string> = new Set(["transform", "translate", "scale", "box-shadow", "background-color"]);

interface StyleNode {
  key: string;
  values: Record<string, string>;
}

/** The watched styles of a control: its wrappers up to the row (at most six), itself and its contents. */
interface StyleSnapshot {
  nodes: StyleNode[];
  /** How many elements the control holds, itself included. */
  size: number;
}

/** Runs in the page. */
function readStyles(target: Element, watched: readonly string[]): StyleSnapshot {
  const read = (el: Element): Record<string, string> => {
    const style = getComputedStyle(el);
    return Object.fromEntries(watched.map((property) => [property, style.getPropertyValue(property)]));
  };
  const nodes: StyleNode[] = [];
  const stop = target.closest("[data-platform-row]") ?? document.body;
  let depth = 0;
  for (let el = target.parentElement; el && el !== stop && depth < 6; el = el.parentElement) {
    depth += 1;
    nodes.push({ key: `wrapper ${depth} <${el.localName}>`, values: read(el) });
  }
  const subtree = [target, ...Array.from(target.querySelectorAll("*"))];
  subtree.slice(0, 160).forEach((el, index) => {
    nodes.push({ key: `${index === 0 ? "control" : `content ${index}`} <${el.localName}>`, values: read(el) });
  });
  return { nodes, size: subtree.length };
}

export interface StyleChange {
  node: string;
  property: string;
  from: string;
  to: string;
}

/** What changed between two snapshots of the same control, and whether its element tree did. */
export function diffStyles(before: StyleSnapshot, after: StyleSnapshot): { changes: StyleChange[]; structure: string | null } {
  const was = new Map(before.nodes.map((node) => [node.key, node.values]));
  const changes: StyleChange[] = [];
  for (const node of after.nodes) {
    const old = was.get(node.key);
    if (!old) continue;
    for (const [property, to] of Object.entries(node.values)) {
      const from = old[property] ?? "";
      if (from !== to) changes.push({ node: node.key, property, from, to });
    }
  }
  const keys = (snapshot: StyleSnapshot) => snapshot.nodes.map((node) => node.key).join("|");
  const structure = keys(before) === keys(after) && before.size === after.size ? null : `the control held ${before.size} element(s), now ${after.size}`;
  return { changes, structure };
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A control's styles once they hold still: read every 50 ms until two readings agree for
 * `holdMs`. Under the capture's reduced motion the hover transitions run in 0 ms, so this
 * waits on React's commit and the browser's style pass, not on an animation.
 */
async function settledStyles(control: Locator | ElementHandle<Element>, timeoutMs = 2_000, holdMs = 200): Promise<StyleSnapshot> {
  // A pinned element (a pressed control) is read as itself, even once a locator would find another.
  const read = () => ("count" in control ? control.evaluate(readStyles, WATCHED) : control.evaluate(readStyles, WATCHED));
  let previous = await read();
  let since = Date.now();
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    await pause(50);
    const current = await read();
    if (JSON.stringify(current) !== JSON.stringify(previous)) {
      previous = current;
      since = Date.now();
    } else if (Date.now() - since >= holdMs || Date.now() > deadline) return current;
    if (Date.now() > deadline) return current;
  }
}

/** Runs in the page: an element as a reviewer would name it. */
function describeElement(el: Element | null): string {
  if (!el) return "nothing";
  const role = el.getAttribute("role");
  const name = (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  return `<${el.localName}${role ? ` role="${role}"` : ""}>${name ? ` "${name}"` : ""}`;
}

/** Runs in the page: the state a press could toggle, and where the page is. */
function readToggles(el: Element): Record<string, string | null> {
  const toggles: Record<string, string | null> = {};
  for (const name of ["aria-checked", "aria-pressed", "aria-selected", "aria-expanded", "aria-current"]) toggles[name] = el.getAttribute(name);
  toggles.value = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : el.getAttribute("aria-valuenow");
  toggles.location = location.pathname + location.search;
  return toggles;
}

/** The control a recipe acts on: how the page finds it inside a scope, and what the source says it is. */
interface Target {
  locate: (scope: Locator) => Locator;
  control: ControlSpec;
}
type Role = Parameters<Locator["getByRole"]>[0];

/**
 * The first node of a role inside the scope, by its exact accessible name when a string names
 * it; `in` names the function of the component's source that renders it, where its role does
 * not single it out.
 */
const byRole = (role: Role, name?: string | RegExp, options: { in?: string } = {}): Target => ({
  locate: (scope) => scope.getByRole(role, name === undefined ? {} : { name, exact: typeof name === "string" }).first(),
  control: { role, ...(options.in ? { in: options.in } : {}) },
});

/** The scope's first keyboard stop that names no role (a chart's inspection stop, a bare Pressable). */
const firstTabStop: Target = { locate: (scope) => scope.locator('[tabindex="0"]').first(), control: {} };

/** The first node a selector finds inside the scope, a control with no role (a bare Pressable the example disables). */
const bySelector = (selector: string): Target => ({ locate: (scope) => scope.locator(selector).first(), control: {} });

/** The first node labelled `name` inside the scope, a control with no role (a calendar's event block without `onEventPress`). */
const byLabel = (name: string | RegExp, options: { in?: string } = {}): Target => ({
  locate: (scope) => scope.getByLabel(name, { exact: typeof name === "string" }).first(),
  control: options.in ? { in: options.in } : {},
});

/**
 * A node with no role inside another control, by a selector from it: AvatarMenu's pill, the
 * hover target inside the Dropdown trigger it is handed as children.
 */
const inside = (outer: Target, selector: string, options: { in?: string } = {}): Target => ({
  locate: (scope) => outer.locate(scope).locator(selector).first(),
  control: options.in ? { in: options.in } : {},
});

/**
 * A group's tab stop: the group is found by `group`, and the Tab key lands on the stop inside
 * it (a radio group's roving radio, a tab list's selected tab), a control of `role`.
 */
const stopIn = (group: Target, role: Role, options: { in?: string } = {}): Target => ({ locate: group.locate, control: { role, ...(options.in ? { in: options.in } : {}) } });

async function describeTarget(control: Locator): Promise<string> {
  return control.evaluate(describeElement);
}

/**
 * Runs in the page: the ARIA role an element carries, as react-native-web renders the kit's
 * controls: its `role`, or the one its tag implies (a text field's input or textarea, a link's
 * anchor, a button); null for none.
 */
function roleOf(el: Element): string | null {
  const explicit = el.getAttribute("role");
  if (explicit) return explicit.trim().split(/\s+/)[0]!;
  if (el.localName === "textarea") return "textbox";
  if (el.localName === "input") return ["password", "hidden", "checkbox", "radio", "range", "button", "submit"].includes((el as HTMLInputElement).type) ? null : "textbox";
  if (el.localName === "a" && el.hasAttribute("href")) return "link";
  if (el.localName === "button") return "button";
  return null;
}

/**
 * Why the element a state landed on is not the recipe's control, or null when it is: its role
 * must be the control's (`ControlSpec.role`), and none for a control with none.
 */
async function controlMismatch(node: Locator | ElementHandle<Element>, control: ControlSpec | undefined): Promise<string | null> {
  if (!control) return null;
  const role = await (node as Locator).evaluate(roleOf);
  const expected = control.role ?? null;
  if (role === expected) return null;
  const what = await (node as Locator).evaluate(describeElement);
  return `${what} ${role ? `is a ${role}` : "has no role"}, not the component's own control${expected ? ` (a ${expected})` : " (an element with no role)"}${control.in ? ` in ${control.in}` : ""}`;
}

/** The node is there and has a box, or the reason it does not. */
async function presence(control: Locator, what: string): Promise<string | null> {
  if ((await control.count()) === 0) return `the example shows no ${what}`;
  if (!(await control.isVisible())) return `the example's ${what} is not visible`;
  return null;
}

const NEUTRAL_POINT = { x: 1, y: 1 };

/** The desktop alone: where the pointer and the keyboard states are captured. */
export const DESKTOP: readonly WidthKey[] = ["desktop"];
/** The web row alone: where a state is applied, unless its control is the component's own only on another build's row. */
const WEB_ROW: readonly RowPlatform[] = ["web"];
/** Every audit width: an opening is captured at each, since an overlay becomes a sheet on a phone. */
export const EVERY_WIDTH: readonly WidthKey[] = WIDTHS.map((w) => w.key);


/** A recipe whose steps share one typed hand-off; erased to the table's shape. */
function recipe<A>(r: Omit<StateRecipe, "apply" | "verify" | "release"> & {
  apply(scene: StateScene): Promise<A>;
  verify(scene: StateScene, applied: A): Promise<Verdict>;
  release(scene: StateScene, applied: A): Promise<Released>;
}): StateRecipe {
  return r as unknown as StateRecipe;
}

const notReached = (reason: string, evidence: Record<string, unknown> = {}): NotReached => ({ reached: false, reason, evidence });

/** What a recipe applied inside an overlay says about it: that it is, and which overlay it opens when the spec names one. */
const insideOf = (within: OpenSpec | undefined): Pick<StateRecipe, "inOverlay" | "opens"> =>
  within ? { inOverlay: true, ...(within.opens ? { opens: within.opens } : {}) } : {};

// --- Hover ---------------------------------------------------------------------------

type Hovered = { control: Locator; rest: StyleSnapshot; opened?: Opened; panel?: Locator } | { missing: string; opened?: Opened };

/**
 * The pointer rests on the control. Reached when the control, its contents or its
 * wrappers changed one of the properties the kit's hover feedback changes; the evidence
 * lists every watched property that changed.
 */
function hover(variant: string, target: Target, options: { within?: OpenSpec; how?: string; widths?: readonly WidthKey[]; rows?: readonly RowPlatform[] } = {}): StateRecipe {
  const within = options.within;
  return recipe<Hovered>({
    state: "hover",
    variant,
    rows: options.rows ?? WEB_ROW,
    widths: options.widths ?? DESKTOP,
    frame: within ? "viewport" : "row",
    ...insideOf(within),
    control: target.control,
    how: options.how ?? "the pointer moves onto the control and rests there",
    async apply(scene) {
      let scope = scene.row;
      let opened: Opened | undefined;
      if (within) {
        opened = await openApply(within, scene);
        const verdict = await openVerify(within, scene, opened);
        if (!verdict.reached) return { missing: `the overlay the hover is read in did not open: ${verdict.reason}`, opened };
        scope = verdict.panel!;
      }
      const control = target.locate(scope);
      const missing = await presence(control, "control to hover");
      if (missing) return { missing, opened };
      await scene.page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const rest = await settledStyles(control);
      await control.hover();
      return { control, rest, opened, ...(within ? { panel: scope } : {}) };
    },
    async verify(_scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      const now = await settledStyles(applied.control);
      const { changes, structure } = diffStyles(applied.rest, now);
      const evidence = { control: await describeTarget(applied.control), changes: changes.slice(0, 40), structure };
      const other = await controlMismatch(applied.control, target.control);
      if (other) return notReached(`the pointer rests on ${other}`, evidence);
      if (!changes.some((change) => HOVER_PROPERTIES.has(change.property))) {
        return notReached(
          `the pointer on ${evidence.control} changed none of ${[...HOVER_PROPERTIES].join(", ")} on the control, its contents or its wrappers up to the row` +
            (changes.length ? ` (it changed ${[...new Set(changes.map((c) => c.property))].join(", ")})` : ""),
          evidence,
        );
      }
      return { reached: true, evidence, flags: [], ...(applied.panel ? { panel: applied.panel } : {}) };
    },
    async release(scene, applied) {
      await scene.page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      if (within && applied.opened) {
        const closed = await openClose(within, scene, applied.opened);
        return { report: { pointer: "moved off", ...closed.report }, flags: closed.flags };
      }
      return { report: { pointer: "moved off" }, flags: [] };
    },
  });
}

// --- Focus ---------------------------------------------------------------------------

/** Runs in the page: focus the tab stop before the control's first one, so the next Tab lands in the control. */
function focusTabStopBefore(target: Element): { from: string | null; expected: string } | { missing: string } {
  const describe = (el: Element | null): string => {
    if (!el) return "nothing";
    const role = el.getAttribute("role");
    const name = (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
    return `<${el.localName}${role ? ` role="${role}"` : ""}>${name ? ` "${name}"` : ""}`;
  };
  const SELECTOR = 'a[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable="true"]';
  const tabbable = (el: Element): boolean => {
    const node = el as HTMLElement;
    if (typeof node.tabIndex !== "number" || node.tabIndex < 0) return false;
    if ((node as HTMLButtonElement).disabled) return false;
    if (node.closest("[inert]")) return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility !== "visible") return false;
    return node.getClientRects().length > 0;
  };
  const stops = Array.from(document.querySelectorAll(SELECTOR)).filter(tabbable);
  const index = stops.findIndex((el) => el === target || target.contains(el));
  if (index < 0) return { missing: `${describe(target)} holds no tab stop` };
  const before = stops[index - 1] as HTMLElement | undefined;
  if (before) before.focus({ preventScroll: true });
  else (document.activeElement as HTMLElement | null)?.blur();
  return { from: before ? describe(before) : null, expected: describe(stops[index]!) };
}

/** Runs in the page: where focus is, against the control. */
function readFocus(target: Element): { inside: boolean; visible: boolean; active: string } {
  const active = document.activeElement;
  const role = active?.getAttribute("role");
  const name = active ? (active.getAttribute("aria-label") ?? active.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40) : "";
  return {
    inside: !!active && (active === target || target.contains(active)),
    visible: !!active && active.matches(":focus-visible"),
    active: active ? `<${active.localName}${role ? ` role="${role}"` : ""}>${name ? ` "${name}"` : ""}` : "nothing",
  };
}

/** Where the page keeps how the row drew its edges before the Tab key, between two evaluations. */
const EDGES_KEY = "__canvasAuditEdges";

/**
 * Runs in the page: how every element of the row draws its edges (outline, border colours
 * and widths, box shadow), kept on the window under `key` so the next reading can tell
 * what focus changed. Keyed by the element itself, so a node the focus inserts (an
 * autocomplete's list) is simply new, and nothing else shifts.
 */
function rememberEdges(row: Element, key: string): number {
  const edges = new WeakMap<Element, string>();
  let count = 0;
  for (const el of [row, ...Array.from(row.querySelectorAll("*"))]) {
    const s = getComputedStyle(el);
    edges.set(el, [s.outlineStyle, s.outlineWidth, s.outlineColor, s.borderTopWidth, s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor, s.boxShadow].join("|"));
    count += 1;
  }
  (window as unknown as Record<string, unknown>)[key] = edges;
  return count;
}

interface RingNode {
  node: Element | null;
  how: "outline" | "border" | "shadow" | "none";
  /** The colour the indicator is drawn in, as the computed style reports it. */
  color: string | null;
  /** The colour it paints at: a translucent ring composited over the nearest opaque fill behind it. */
  painted: string | null;
  /** Whether it is drawn in the look's ring colour (its channels; a translucent halo of the ring counts). */
  themed: boolean;
  drawnBy: string;
}

/**
 * Runs in the page: the node that draws the focused control's indicator, found by what
 * the Tab key changed. Every element of the row whose outline, border colour or box shadow
 * is not what it was before the Tab (`rememberEdges`) and now draws something is a
 * candidate, taken nearest the focused node first: the node itself, its wrappers up to the
 * row (a field box turns its border `ring`), its contents, then the rest of the row in
 * document order (an OTP's active cell sits beside its hidden input). A node that draws the
 * browser's own outline counts even when nothing changed.
 */
function findRing(args: { ring: string; key: string; scope: Element | null }): RingNode {
  const none = (drawnBy: string): RingNode => ({ node: null, how: "none", color: null, painted: null, themed: false, drawnBy });
  const active = document.activeElement;
  if (!active) return none("nothing is focused");
  // The scope whose edges were remembered: the row, or the overlay the control is in.
  const row = args.scope && args.scope.contains(active) ? args.scope : (active.closest("[data-platform-row]") ?? document.body);
  const before = (window as unknown as Record<string, unknown>)[args.key] as WeakMap<Element, string> | undefined;
  const describe = (el: Element): string => `<${el.localName}${el.getAttribute("role") ? ` role="${el.getAttribute("role")}"` : ""}>`;
  const channels = (color: string): number[] | null => {
    const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?/.exec(color);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] : null;
  };
  const ringChannels = channels(args.ring)!;
  const themed = (color: string) => {
    const c = channels(color);
    return !!c && c[0] === ringChannels[0] && c[1] === ringChannels[1] && c[2] === ringChannels[2];
  };
  const painted = (el: Element, color: string): string => {
    const c = channels(color);
    if (!c || c[3]! >= 1) return color;
    let under = [255, 255, 255];
    for (let node = el.parentElement; node; node = node.parentElement) {
      const fill = channels(getComputedStyle(node).backgroundColor);
      if (fill && fill[3] === 1) {
        under = fill;
        break;
      }
    }
    const a = c[3]!;
    return `rgb(${[0, 1, 2].map((i) => Math.round(c[i]! * a + under[i]! * (1 - a))).join(", ")})`;
  };
  const read = (s: CSSStyleDeclaration) => [s.outlineStyle, s.outlineWidth, s.outlineColor, s.borderTopWidth, s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor, s.boxShadow].join("|");
  const drawsOutline = (s: CSSStyleDeclaration) => s.outlineStyle === "auto" || (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0);

  const ordered: Element[] = [active];
  for (let el = active.parentElement; el && row.contains(el); el = el.parentElement) {
    ordered.push(el);
    if (el === row) break;
  }
  ordered.push(...Array.from(active.querySelectorAll("*")));
  const seen = new Set(ordered);
  for (const el of Array.from(row.querySelectorAll("*"))) if (!seen.has(el)) ordered.push(el);

  for (const el of ordered) {
    const s = getComputedStyle(el);
    const was = before?.get(el);
    const changed = was === undefined || was !== read(s);
    const old = was?.split("|") ?? [];
    if (drawsOutline(s) && (changed || el === active)) {
      return { node: el, how: "outline", color: s.outlineColor, painted: painted(el, s.outlineColor), themed: themed(s.outlineColor), drawnBy: describe(el) };
    }
    if (!changed) continue;
    const borders = [s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor];
    const bordered = parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderBottomWidth) > 0;
    const newBorder = borders.find((color, i) => color !== old[4 + i]);
    if (bordered && newBorder) return { node: el, how: "border", color: newBorder, painted: painted(el, newBorder), themed: themed(newBorder), drawnBy: describe(el) };
    if (s.boxShadow !== "none" && s.boxShadow !== old[8]) {
      const color = /rgba?\([^)]*\)/.exec(s.boxShadow)?.[0] ?? s.boxShadow;
      return { node: el, how: "shadow", color, painted: painted(el, color), themed: themed(color), drawnBy: describe(el) };
    }
  }
  return none("nothing in the row drew a new edge when focus arrived");
}

type Focused = { control: Locator; scope: Locator; from: string | null; expected: string; opened?: Opened } | { missing: string; opened?: Opened };

interface FocusOptions {
  how?: string;
  /** An overlay opened first: the control is found and focused inside it, and it is closed after. */
  within?: OpenSpec;
  /**
   * The widths the control is a tab stop at, when not the desktop: a scroll region is one
   * only where its content overflows (the calendar Heatmap's, below `sm`), and a control
   * inside a drawer is there only where the drawer is (FilterPanel's, at a phone's width).
   */
  widths?: readonly WidthKey[];
  /**
   * The keys that move focus onto the control from where the overlay put it, in place of the
   * Tab key: a menu or a list moves focus among its rows with the arrow keys (the WAI-ARIA
   * menu and listbox patterns), and puts it on a row as it opens, so ArrowDown lands on the
   * next.
   */
  keys?: readonly string[];
  /**
   * A control pressed first, whose press shows the control: DescriptionList's Update link
   * swaps the row's value for its field.
   */
  reveal?: Target;
  /** The rows it is applied from, when not the web row alone (`StateRecipe.rows`). */
  rows?: readonly RowPlatform[];
}

/**
 * The Tab key lands on the control from the tab stop before it, as a keyboard user
 * reaches it (or, inside a menu or a list, the arrow keys, `FocusOptions.keys`). Reached
 * when focus is on (or inside) the control, is the control the recipe names
 * (`StateRecipe.control`), and matches :focus-visible; the ring is then found and checked in
 * the pixels on every side.
 */
function focus(variant: string, target: Target, options: FocusOptions = {}): StateRecipe {
  const { within } = options;
  return recipe<Focused>({
    state: "focus",
    variant,
    rows: options.rows ?? WEB_ROW,
    widths: options.widths ?? DESKTOP,
    frame: within ? "viewport" : "row",
    ...insideOf(within),
    control: target.control,
    how:
      options.how ??
      (within
        ? options.keys
          ? `the overlay opens, then ${options.keys.join(", ")} moves focus onto the control in it`
          : "the overlay opens, then Tab from the tab stop before the control in it"
        : "Tab from the tab stop before the control"),
    async apply(scene) {
      let scope = scene.row;
      let opened: Opened | undefined;
      if (within) {
        opened = await openApply(within, scene);
        const verdict = await openVerify(within, scene, opened);
        if (!verdict.reached) return { missing: `the overlay the focus is read in did not open: ${verdict.reason}`, opened };
        scope = verdict.panel!;
      }
      if (options.reveal) {
        const reveal = options.reveal.locate(scope);
        const hidden = await presence(reveal, "control that shows the control to focus");
        if (hidden) return { missing: hidden, opened };
        await reveal.click();
      }
      const control = target.locate(scope);
      const missing = await presence(control, "control to focus");
      if (missing) return { missing, opened };
      if (options.keys) {
        // The overlay has put focus on its first row; the keys move it, and the edges are
        // remembered before they do, so verify can tell which node the move changed.
        await scope.evaluate(rememberEdges, EDGES_KEY);
        for (const key of options.keys) await scene.page.keyboard.press(key);
        return { control, scope, from: `${options.keys.join(", ")} from where the overlay put focus`, expected: await describeTarget(control), opened };
      }
      const before = await control.evaluate(focusTabStopBefore);
      if ("missing" in before) return { ...before, opened };
      // How the scope draws its edges with focus on the stop before, so verify can tell
      // which node the arriving focus changed.
      await scope.evaluate(rememberEdges, EDGES_KEY);
      await scene.page.keyboard.press("Tab");
      return { control, scope, ...before, opened };
    },
    async verify(scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      const state = await applied.control.evaluate(readFocus);
      const evidence: Record<string, unknown> = { from: applied.from ?? "the start of the page", expected: applied.expected, active: state.active, focusVisible: state.visible };
      if (!state.inside) return notReached(`Tab from ${applied.from ?? "the start of the page"} moved focus to ${state.active}, not into the control (${applied.expected})`, evidence);
      if (!state.visible) return notReached(`${state.active} took focus from the Tab key but does not match :focus-visible`, evidence);
      const active = await scene.page.evaluateHandle(() => document.activeElement);
      const focused = active.asElement();
      const other = focused ? await controlMismatch(focused, target.control) : "nothing";
      await active.dispose();
      if (other) return notReached(`the Tab key focused ${other}`, evidence);
      // The ring is checked where the control is on screen. The card is fitted and centred
      // before the Tab, so the control is in view unless the Tab scrolled it; only then is it
      // brought back, since scrolling the page under something the focus opened in the
      // window's layer (an autocomplete's list) would leave that behind, over the field.
      await applied.control.evaluate((node) => {
        const box = node.getBoundingClientRect();
        if (box.top < 0 || box.left < 0 || box.bottom > window.innerHeight || box.right > window.innerWidth) node.scrollIntoView({ block: "center", inline: "nearest" });
      });
      const scope = await applied.scope.elementHandle();
      const handle: JSHandle<RingNode> = await scene.page.evaluateHandle(findRing, { ring: scene.ring, key: EDGES_KEY, scope });
      await scope?.dispose();
      // The description crosses as JSON; the node stays a handle for the pixel check, which
      // looks for the colour the indicator paints at.
      const ring = await handle.evaluate(({ how, color, painted, themed, drawnBy }) => ({ how, color, painted, themed, drawnBy }));
      const node = (await handle.getProperty("node")).asElement();
      const sides = node && ring.painted ? await ringShows(scene.page, node, ring.painted) : null;
      await handle.dispose();
      const shows = sides !== null && Object.values(sides).every(Boolean);
      evidence.ring = { how: ring.how, drawnBy: ring.drawnBy, color: ring.color, painted: ring.painted, themed: ring.themed, expected: scene.ring, sides };
      const flags: StateFlag[] = !node ? ["focus-ring-missing"] : shows ? [] : ["focus-ring-hidden"];
      if (node && !ring.themed) flags.push("focus-ring-colour");
      return { reached: true, evidence, flags, ...(within ? { panel: applied.scope } : {}) };
    },
    async release(scene, applied) {
      await scene.page.evaluate((key) => {
        (document.activeElement as HTMLElement | null)?.blur();
        delete (window as unknown as Record<string, unknown>)[key];
      }, EDGES_KEY);
      if (within && applied.opened) {
        const closed = await openClose(within, scene, applied.opened);
        return { report: { focus: "blurred", ...closed.report }, flags: closed.flags };
      }
      return { report: { focus: "blurred" }, flags: [] };
    },
  });
}

// --- Pressed -------------------------------------------------------------------------

/** A point on the page, in CSS pixels. */
interface Point {
  x: number;
  y: number;
}

/** The middle of a node's box, once it is in view. */
async function middleOf(node: Locator): Promise<Point | null> {
  await node.scrollIntoViewIfNeeded().catch(() => {});
  const box = await node.boundingBox();
  return box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : null;
}

/** What a press can leave behind: the scope's accessibility tree, the address, and how the pressed control looks. */
export interface PressRecord {
  aria: string;
  location: string;
  /** Whether the pressed control is still in the page; when it is not, it has no look or pixels to compare. */
  connected: boolean;
  styles: StyleSnapshot | null;
  /** The control's pixels, PNG; null when it could not be photographed. */
  shot: Buffer | null;
  /** The element focus is on, as a reviewer would name it. */
  focus: string;
}

/** The scope's tree, or that it is gone (an overlay a press inside it closed). */
async function scopeTree(scope: Locator): Promise<string> {
  if ((await scope.count()) === 0) return "(the scope is gone)";
  return scope.ariaSnapshot({ timeout: 5_000 }).catch(() => "(the scope is gone)");
}

/** A record of the pressed control, read through the element pinned when the press began. */
async function pressRecord(page: Page, scope: Locator, control: ElementHandle<Element>): Promise<PressRecord> {
  const connected = await control.evaluate((node) => node.isConnected);
  return {
    aria: await scopeTree(scope),
    location: await page.evaluate(() => location.pathname + location.search),
    connected,
    styles: connected ? await settledStyles(control) : null,
    shot: connected ? await control.screenshot({ animations: "disabled", caret: "hide", timeout: 5_000 }).catch(() => null) : null,
    focus: await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return "nothing";
      const role = el.getAttribute("role");
      const name = (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
      return `<${el.localName}${role ? ` role="${role}"` : ""}>${name ? ` "${name}"` : ""}`;
    }),
  };
}

/**
 * Runs in the page: how many pixels of two PNGs of the same node differ (by more than 24
 * across the three channels, which no repaint of the same state reaches), or that their
 * sizes differ.
 */
async function countChangedPixels(args: { a: string; b: string }): Promise<{ changed: number; total: number } | { size: string }> {
  const decode = async (png: string) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  };
  const [a, b] = await Promise.all([decode(args.a), decode(args.b)]);
  if (a.width !== b.width || a.height !== b.height) return { size: `${a.width}x${a.height} before, ${b.width}x${b.height} after` };
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.abs(a.data[i]! - b.data[i]!) + Math.abs(a.data[i + 1]! - b.data[i + 1]!) + Math.abs(a.data[i + 2]! - b.data[i + 2]!);
    if (d > 24) changed += 1;
  }
  return { changed, total: a.width * a.height };
}

/**
 * Runs in the page: the text the page has selected, whether the selection takes in the
 * control's own label, and then no selection at all; null when nothing was selected.
 */
function takeSelection(control: Element): { text: string; label: boolean } | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.toString().trim()) return null;
  const range = selection.getRangeAt(0);
  const label = Array.from(control.querySelectorAll("*")).concat(control).some((node) => node.childNodes.length > 0 && range.intersectsNode(node) && !!(node.textContent ?? "").trim());
  const text = selection.toString().replace(/\s+/g, " ").trim().slice(0, 80);
  selection.removeAllRanges();
  return { text, label };
}

/**
 * Whether the clicks a release delivered to the control are its press firing: after a
 * move-off any click there is (react-native-web runs a Pressable's `onPress` from it);
 * coming up in place on a thumb or a grip is a click by design.
 */
export function pressFired(ends: "move-off" | "in-place", clicks: readonly string[]): string | null {
  if (ends !== "move-off" || !clicks.length) return null;
  return `a click reached ${clicks[0]} in the control as the button came up, so its press fired`;
}

/** What differs between two records of the same control: nothing when the press left no trace. */
export async function pressTrace(page: Pick<Page, "evaluate">, before: PressRecord, after: PressRecord): Promise<string[]> {
  const trace: string[] = [];
  if (before.aria !== after.aria) trace.push(after.aria === "(the scope is gone)" ? "the overlay the control was pressed in closed" : "the accessibility tree of the row changed (its states, values or names)");
  if (before.location !== after.location) trace.push(`the page moved from ${before.location} to ${after.location}`);
  if (!after.connected || !before.styles || !after.styles) {
    if (!after.connected) trace.push("the pressed control left the page");
    return trace;
  }
  const { changes, structure } = diffStyles(before.styles, after.styles);
  if (structure) trace.push(structure);
  if (changes.length) trace.push(`the control's look changed: ${changes.slice(0, 6).map((c) => `${c.node} ${c.property} ${c.from} -> ${c.to}`).join("; ")}`);
  if (before.shot && after.shot && !before.shot.equals(after.shot)) {
    const pixels = await page.evaluate(countChangedPixels, { a: before.shot.toString("base64"), b: after.shot.toString("base64") });
    if ("size" in pixels) trace.push(`the control's box changed (${pixels.size})`);
    else if (pixels.changed > 0) trace.push(`${pixels.changed} of the control's ${pixels.total} pixels changed`);
  } else if (!before.shot || !after.shot) trace.push("the control could not be photographed before and after the press");
  return trace;
}

type Pressed =
  | { control: Locator; pinned: ElementHandle<Element>; scope: Locator; point: Point; rest: StyleSnapshot; hovered: StyleSnapshot; before: PressRecord; opened?: Opened }
  | { missing: string; opened?: Opened };

/** Where the page keeps the clicks a release delivers to the pressed control, between two evaluations. */
const CLICKS_KEY = "__canvasAuditClicks";

/**
 * Runs in the page: start recording every click whose target is the pressed control or
 * inside it, in the capture phase at the window, before react-native-web's own handler (a
 * Pressable runs `onPress` from the native click, and stops it there).
 */
function watchClicks(control: Element, key: string): void {
  const clicks: string[] = [];
  const listener = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element) || !control.contains(target)) return;
    const role = target.getAttribute("role");
    clicks.push(`<${target.localName}${role ? ` role="${role}"` : ""}>`);
  };
  window.addEventListener("click", listener, true);
  (window as unknown as Record<string, unknown>)[key] = { listener, clicks };
}

/** Runs in the page: stop recording, and the clicks the control was delivered. */
function takeClicks(key: string): string[] {
  const watch = (window as unknown as Record<string, unknown>)[key] as { listener: (event: Event) => void; clicks: string[] } | undefined;
  if (!watch) return [];
  window.removeEventListener("click", watch.listener, true);
  delete (window as unknown as Record<string, unknown>)[key];
  return watch.clicks;
}

interface PressOptions {
  how?: string;
  /**
   * How the press ends. `move-off` (the default): the pointer leaves the control before
   * the button comes up, which cancels a press on every platform. `in-place`: the button
   * comes up where it went down, for a slider's thumb or a drag handle, which a move would
   * drag; a press that does not move changes nothing there.
   */
  release?: "move-off" | "in-place";
  /** Where the pointer goes down, when not on the control itself (a slider's thumb inside the slider); the control is still the one the state is read on. */
  at?: Target;
  /** An overlay opened first: the control is found and pressed inside it, and it is closed after. */
  within?: OpenSpec;
  /** The widths the control is there at, when not the desktop: inside a drawer a panel becomes only at a phone's width. */
  widths?: readonly WidthKey[];
  /** The rows it is applied from, when not the web row alone (`StateRecipe.rows`). */
  rows?: readonly RowPlatform[];
}

/**
 * The pointer goes down on the control and stays down. Reached when holding it changed a
 * watched style against the hovered control just before: a press that looks like the
 * hover is no pressed state of its own, and the evidence says what the hover changed.
 *
 * Released as the press ends without taking effect (see `PressOptions.release`), and then
 * measured on the element pressed, pinned when the press began. After a move-off no click
 * may reach it as the button comes up: react-native-web runs a Pressable's `onPress` from
 * the native click, so a click there is the press firing, whatever its handler shows. With
 * the pointer away again the control must still be in the page, and the row's (or the
 * overlay's) accessibility tree, the page's address, and the control's computed look and
 * pixels must be what they were before the press. Anything that differs is listed and flags
 * the cell `press-not-cancelled`, whether the control announces a state or not. Text the
 * drag off the control selected is recorded and cleared first (`press-selects-label` when it
 * takes in the control's own label, as a native button's label never is).
 */
function pressed(variant: string, target: Target, options: PressOptions = {}): StateRecipe {
  const { within } = options;
  const ends = options.release ?? "move-off";
  return recipe<Pressed>({
    state: "pressed",
    variant,
    rows: options.rows ?? WEB_ROW,
    widths: options.widths ?? DESKTOP,
    frame: within ? "viewport" : "row",
    ...insideOf(within),
    control: target.control,
    how: options.how ?? (within ? "the overlay opens, then the pointer goes down on the control in it and is held" : "the pointer goes down on the control and is held"),
    async apply(scene) {
      const { page } = scene;
      let scope = scene.row;
      let opened: Opened | undefined;
      if (within) {
        opened = await openApply(within, scene);
        const verdict = await openVerify(within, scene, opened);
        if (!verdict.reached) return { missing: `the overlay the press is made in did not open: ${verdict.reason}`, opened };
        scope = verdict.panel!;
      }
      const control = target.locate(scope);
      const missing = await presence(control, "control to press");
      if (missing) return { missing, opened };
      // The element pressed, pinned: the release measures this node, even when the press
      // takes it out of the page (a dialog's Cancel), where a locator would wait for another.
      const pinned = (await control.elementHandle())!;
      await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const before = await pressRecord(page, scope, pinned);
      const point = await middleOf(options.at ? options.at.locate(scope) : control);
      if (!point) return { missing: "the place to press has no box", opened };
      await page.mouse.move(point.x, point.y);
      const hovered = await settledStyles(pinned);
      await page.mouse.down();
      return { control, pinned, scope, point, rest: before.styles!, hovered, before, opened };
    },
    async verify(_scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      // Short of a long press (500 ms): the settle reads every 50 ms and holds 200.
      const now = await settledStyles(applied.pinned, 400, 200);
      const { changes, structure } = diffStyles(applied.hovered, now);
      const hover = [...new Set(diffStyles(applied.rest, applied.hovered).changes.map((c) => c.property))];
      const evidence = { control: await describeTarget(applied.control), changes: changes.slice(0, 40), structure, hoverChanged: hover };
      const other = await controlMismatch(applied.pinned, target.control);
      if (other) return notReached(`the pointer is held down on ${other}`, evidence);
      if (!changes.length && !structure) {
        return notReached(
          `holding the pointer down on ${evidence.control} changed no watched style against the hovered control` +
            (hover.length ? ` (its pressed look is its hover look, which changed ${hover.join(", ")})` : " (and the hover changed none either)"),
          evidence,
        );
      }
      return { reached: true, evidence, flags: [], ...(within ? { panel: applied.scope } : {}) };
    },
    async release(scene, applied) {
      const { page } = scene;
      // The clicks the control is delivered as the button comes up: a Pressable runs its
      // `onPress` from the native click, so one reaching the control after a move-off means
      // the press fired, whether or not its handler changes anything to see.
      if (!("missing" in applied)) await applied.pinned.evaluate(watchClicks, CLICKS_KEY);
      if (ends === "move-off") await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      await page.mouse.up();
      const pointer = ends === "move-off" ? "moved off, then up" : "up where it went down, then moved off";
      await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const close = async (): Promise<Released> => (within && applied.opened ? openClose(within, scene, applied.opened) : { report: {}, flags: [] });
      if ("missing" in applied) {
        const closed = await close();
        return { report: { pointer, ...closed.report }, flags: closed.flags };
      }
      await pause(150);
      const clicks = await page.evaluate(takeClicks, CLICKS_KEY);
      // A pointer dragged off a control with the button down selects text on the way, as on
      // any page. That is the page's doing, not the press's: it is recorded (and flagged when
      // the selection takes in the control's own label), then cleared, so the comparison below
      // is of the control alone.
      const selection = await applied.pinned.evaluate(takeSelection);
      const after = await pressRecord(page, applied.scope, applied.pinned);
      const trace = await pressTrace(page, applied.before, after);
      const fired = pressFired(ends, clicks);
      if (fired) trace.unshift(fired);
      await applied.pinned.dispose();
      const closed = await close();
      const flags: ReleaseFlag[] = [];
      if (trace.length) flags.push("press-not-cancelled");
      if (selection?.label) flags.push("press-selects-label");
      return {
        report: {
          pointer,
          cancelled: trace.length === 0,
          clicked: clicks.length > 0,
          ...(trace.length ? { trace, focus: { before: applied.before.focus, after: after.focus } } : {}),
          ...(selection ? { selected: selection } : {}),
          ...closed.report,
        },
        flags: [...flags, ...closed.flags],
      };
    },
  });
}

// --- Press to inspect ------------------------------------------------------------------

/**
 * Where on a chart to put the pointer, read off what the chart draws, so the same datum
 * is pressed in every look:
 *
 *   axis   above an axis label (a band's centre), `rise` px over the label's top (40: inside
 *          the plot), moved `t` of the way toward the label `toward` (a histogram bin
 *          between two ticks).
 *   text   the middle of a text (a treemap tile's label, a funnel stage's).
 *   mark   a node of the row (`selector`, the `index`th) at `fx`, `fy` of its box, plus
 *          `dx`, `dy` px (a ring's stroke inside a radial chart's edge).
 */
export type PlotPoint =
  | { axis: string; toward?: string; t?: number; rise?: number }
  | { text: string }
  | { mark: string; index?: number; fx?: number; fy?: number; dx?: number; dy?: number };

async function plotPoint(row: Locator, where: PlotPoint): Promise<{ point: Point; at: string } | { missing: string }> {
  await row.evaluate((node) => {
    const box = node.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) node.scrollIntoView({ block: "center" });
  });
  if ("axis" in where) {
    const label = row.getByText(where.axis, { exact: true }).first();
    if (!(await label.count())) return { missing: `the chart shows no label "${where.axis}"` };
    const box = (await label.boundingBox())!;
    let x = box.x + box.width / 2;
    if (where.toward) {
      const other = row.getByText(where.toward, { exact: true }).first();
      if (!(await other.count())) return { missing: `the chart shows no label "${where.toward}"` };
      const far = (await other.boundingBox())!;
      x += ((far.x + far.width / 2) - x) * (where.t ?? 0.5);
    }
    const rise = where.rise ?? 40;
    return { point: { x, y: box.y - rise }, at: `${rise} px above the axis label "${where.axis}"${where.toward ? `, ${where.t ?? 0.5} of the way to "${where.toward}"` : ""}` };
  }
  if ("text" in where) {
    const point = await middleOf(row.getByText(where.text, { exact: true }).first());
    return point ? { point, at: `the middle of "${where.text}"` } : { missing: `the chart shows no "${where.text}"` };
  }
  const node = row.locator(where.mark).nth(where.index ?? 0);
  const box = (await node.count()) ? await node.boundingBox() : null;
  if (!box) return { missing: `the row has no ${where.mark} #${where.index ?? 0}` };
  return {
    point: { x: box.x + box.width * (where.fx ?? 0.5) + (where.dx ?? 0), y: box.y + box.height * (where.fy ?? 0.5) + (where.dy ?? 0) },
    at: `${where.mark} #${where.index ?? 0} at ${where.fx ?? 0.5}, ${where.fy ?? 0.5} of its box${where.dx || where.dy ? ` + ${where.dx ?? 0}, ${where.dy ?? 0} px` : ""}`,
  };
}

/** What an inspection can change in a row: its text, how its marks paint, and how its other nodes paint. */
export interface InspectionRecord {
  /** The text of every leaf, in document order. */
  texts: string[];
  /** Each SVG node's fill, stroke and opacities, in document order. */
  marks: string[];
  /** Each other node's opacity, border, outline and background, in document order. */
  others: string[];
}

/** Runs in the page. */
function readInspection(row: Element): InspectionRecord {
  const texts: string[] = [];
  const marks: string[] = [];
  const others: string[] = [];
  for (const el of Array.from(row.querySelectorAll("*"))) {
    const s = getComputedStyle(el);
    if (el instanceof SVGElement) marks.push([s.fill, s.fillOpacity, s.stroke, s.strokeOpacity, s.opacity].join("|"));
    else others.push([s.opacity, s.borderTopColor, s.outlineStyle, s.outlineColor, s.backgroundColor].join("|"));
    if (el.children.length === 0) {
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text) texts.push(text);
    }
  }
  return { texts, marks, others };
}

/** What `after` shows that `before` did not: texts added and removed (as multisets), and paints that changed. */
export function inspectionDiff(before: InspectionRecord, after: InspectionRecord): { added: string[]; removed: string[]; marks: number; others: number } {
  const minus = (a: string[], b: string[]) => {
    const left = [...a];
    for (const t of b) {
      const i = left.indexOf(t);
      if (i >= 0) left.splice(i, 1);
    }
    return left;
  };
  const changed = (a: string[], b: string[]) => (a.length !== b.length ? Math.max(a.length, b.length) : a.filter((v, i) => v !== b[i]).length);
  return { added: minus(after.texts, before.texts), removed: minus(before.texts, after.texts), marks: changed(before.marks, after.marks), others: changed(before.others, after.others) };
}

type Inspected = { point: Point; at: string; rest: InspectionRecord; resting: InspectionRecord } | { missing: string };

interface InspectOptions {
  /**
   * How the chart takes the press. `hold`: a responder scrub surface, which inspects while
   * the pointer is down and keeps the selection when it comes up. `click`: a Pressable hit
   * layer, which inspects once the press completes.
   */
  mode: "hold" | "click";
  /** Texts the inspection must add (a flag's title and value); without them any added text or repainted mark is enough. */
  expect?: readonly string[];
  how: string;
  /**
   * The control under the point (`StateRecipe.control`): a chart's own scrub surface or hit
   * layer, which carries no role. The point is on the plot, so the capture does not read it back.
   */
  control?: ControlSpec;
}

/** Reached when the chart, against how it looked with the pointer away, shows text it did not (a value flag, a readout) or repaints its marks (the others dimmed). */
function inspectionVerdict(rest: InspectionRecord, now: InspectionRecord, expect: readonly string[] | undefined, evidence: Record<string, unknown>, nothing: string): Verdict {
  const diff = inspectionDiff(rest, now);
  Object.assign(evidence, { added: diff.added.slice(0, 40), removed: diff.removed.slice(0, 40), marksRepainted: diff.marks, othersRepainted: diff.others });
  if (!diff.added.length && !diff.marks) return notReached(nothing, evidence);
  const missing = (expect ?? []).filter((text) => !diff.added.includes(text));
  if (missing.length) return notReached(`the inspection does not show ${missing.map((t) => `"${t}"`).join(", ")} (it added ${diff.added.length ? diff.added.map((t) => `"${t}"`).join(", ") : "no text"})`, evidence);
  return { reached: true, evidence, flags: [] };
}

/** Clear an inspection the way its chart documents (a second press on the same datum), and measure whether the row is back to how it was. */
async function clearInspection(scene: StateScene, applied: Inspected, how: "press again" | "move off"): Promise<Released> {
  const { page } = scene;
  if ("missing" in applied) {
    await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
    return { report: {}, flags: [] };
  }
  if (how === "press again") {
    await page.mouse.move(applied.point.x, applied.point.y);
    await page.mouse.down();
    await page.mouse.up();
  }
  await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
  await pause(200);
  const diff = inspectionDiff(applied.rest, await scene.row.evaluate(readInspection));
  const cleared = !diff.added.length && !diff.removed.length && !diff.marks && !diff.others;
  return {
    report: { cleared, by: how === "press again" ? "a second press on the same point, then the pointer moved off" : "the pointer moved off", ...(cleared ? {} : { left: diff }) },
    flags: cleared ? [] : ["inspection-not-cleared"],
  };
}

/**
 * Press to inspect: the pointer goes down on one datum of a chart (`PlotPoint`), as a
 * person presses a chart to read a value. Reached when the chart then shows a value flag
 * or a readout (text it did not show with the pointer away), or repaints its marks; with
 * `expect`, the texts the inspection must show. How the chart looked once the pointer
 * rested on the datum, before the press, is in the evidence, so a press that only takes
 * away what the hover showed says so. Released by a second press on the same datum, the
 * chart's documented way to clear an inspection; `inspection-not-cleared` when the row is
 * not then back to how it was.
 */
function inspect(variant: string, where: PlotPoint, options: InspectOptions): StateRecipe {
  return recipe<Inspected>({
    state: "pressed",
    variant,
    rows: WEB_ROW,
    widths: DESKTOP,
    frame: "row",
    control: options.control ?? {},
    how: options.how,
    async apply(scene) {
      const { page } = scene;
      await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const found = await plotPoint(scene.row, where);
      if ("missing" in found) return found;
      const rest = await scene.row.evaluate(readInspection);
      await page.mouse.move(found.point.x, found.point.y);
      await pause(150);
      const resting = await scene.row.evaluate(readInspection);
      await page.mouse.down();
      if (options.mode === "click") await page.mouse.up();
      return { point: found.point, at: found.at, rest, resting };
    },
    async verify(scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      await pause(200);
      const now = await scene.row.evaluate(readInspection);
      const hover = inspectionDiff(applied.rest, applied.resting);
      const evidence: Record<string, unknown> = {
        at: applied.at,
        point: applied.point,
        mode: options.mode,
        restingShowed: { added: hover.added.slice(0, 20), marksRepainted: hover.marks },
      };
      const rested = hover.added.length ? ` (the pointer resting on it before the press had shown ${hover.added.map((t) => `"${t}"`).join(", ")}, which the press took away)` : "";
      return inspectionVerdict(applied.rest, now, options.expect, evidence, `pressing ${applied.at} showed nothing the chart did not show with the pointer away${rested}`);
    },
    async release(scene, applied) {
      if (!("missing" in applied) && options.mode === "hold") await scene.page.mouse.up();
      return clearInspection(scene, applied, "press again");
    },
  });
}

/**
 * Hover to inspect: the pointer rests on one datum of a chart that inspects under a
 * resting pointer (a heatmap's day). Reached as `inspect` is; released by moving off,
 * which must leave the row as it was (`inspection-not-cleared` otherwise).
 */
function hoverInspect(variant: string, where: PlotPoint, options: { expect?: readonly string[]; how: string; control?: ControlSpec }): StateRecipe {
  return recipe<Inspected>({
    state: "hover",
    variant,
    rows: WEB_ROW,
    widths: DESKTOP,
    frame: "row",
    control: options.control ?? {},
    how: options.how,
    async apply(scene) {
      const { page } = scene;
      await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const found = await plotPoint(scene.row, where);
      if ("missing" in found) return found;
      const rest = await scene.row.evaluate(readInspection);
      await page.mouse.move(found.point.x, found.point.y);
      return { point: found.point, at: found.at, rest, resting: rest };
    },
    async verify(scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      await pause(200);
      const now = await scene.row.evaluate(readInspection);
      return inspectionVerdict(applied.rest, now, options.expect, { at: applied.at, point: applied.point }, `the pointer resting on ${applied.at} showed nothing the chart did not show with the pointer away`);
    },
    release: (scene, applied) => clearInspection(scene, applied, "move off"),
  });
}

// --- Open ----------------------------------------------------------------------------

/** How to open an overlay from inside a scope (a platform row), and what opening adds. */
export interface OpenSpec {
  open: (page: Page, scope: Locator) => Promise<void>;
  trigger: (page: Page, scope: Locator) => Locator;
  /**
   * What the opening adds, by the ARIA role the opened node carries, or, for a card that
   * carries none (the Calendar's hover card and day peek), by the text it shows: the panel
   * is then the root of the subtree the opening added that holds the text (exactly one).
   */
  role: string | { shows: RegExp };
  /** How many nodes of that role one opening adds (one, for a card found by its text). */
  adds: number;
  /** Whether the trigger carries aria-expanded. */
  expands?: boolean;
  /**
   * Where the opened node is counted: anywhere the Playground's overlays paint (the
   * stage's outlet, the window's layer, a document-root Modal; the default), inside the
   * row (a tooltip's bubble draws in flow beside its trigger), or among the page's live
   * regions that are saying something (a toast).
   */
  where?: "overlay" | "row" | "announcement";
  /**
   * The opening is a pointer resting on the trigger (a tooltip), so the page is never
   * scrolled under it: the trigger would slide out from under the pointer and close it.
   */
  pointerHeld?: boolean;
  /**
   * Once the node is there, make sure it stays: what it took, and whether it held. For an
   * opening the pointer holds, so a layout the opening changes cannot close it again
   * between the check and the photograph.
   */
  steady?: (page: Page, scope: Locator, panel: Locator) => Promise<{ held: boolean; reason?: string; evidence: Record<string, unknown>; flags: StateFlag[] }>;
  /** How it is closed again; Escape when not given. */
  close?: (page: Page, scope: Locator) => Promise<void>;
  /** The overlay it opens, as the source names the function that renders it (`StateRecipe.opens`), for a component that renders more than one. */
  opens?: string;
  /**
   * For an opening a resting pointer makes, captured as the hover of the control it rests on
   * (`hoverOpen`, the Calendar's event block): that control (`StateRecipe.control`).
   */
  control?: ControlSpec;
}

type Opened = { before: number; said: string[]; expanded: string | null } | { missing: string };

/** What an opening adds is described by: its role, or the text a role-less card shows. */
const describeOpening = (spec: OpenSpec): string => (typeof spec.role === "string" ? spec.role : `card showing ${spec.role.shows}`);

/** The nodes an opening is counted among, for an opening found by its role. */
function openNodes(spec: OpenSpec & { role: string }, scene: StateScene): Locator {
  const { page } = scene;
  if (spec.where === "row") return scene.row.getByRole(spec.role as Role);
  if (spec.where === "announcement") return page.getByRole("status").filter({ hasText: /\S/ });
  // The stage's own host holds what portals into the Playground's outlet; outside the page
  // scroller is the window's layer and a document-root Modal. A Do/Don't card pinned open
  // paints in the page's own outlet, inside the scroller but outside the stage, so it is
  // never counted.
  return scene.stage.locator("..").getByRole(spec.role as Role).or(page.getByRole(spec.role as Role).and(page.locator(":not([data-page-scroll] *)")));
}

/** Where the page keeps every element it had before an opening, for a card found by its text. */
const SEEN_KEY = "__canvasAuditSeen";
/** The attribute a card found by its text is marked with, so the capture can photograph and probe it. */
const OPENED_MARK = "data-audit-opened";

/** Runs in the page: remember every element, so a later reading can tell what an opening added. */
function rememberElements(key: string): void {
  const seen = new WeakSet<Element>();
  for (const el of Array.from(document.querySelectorAll("*"))) seen.add(el);
  (window as unknown as Record<string, unknown>)[key] = seen;
}

/**
 * Runs in the page: the roots of the subtrees added since `rememberElements` whose text
 * matches, each marked (and every earlier mark taken off), and how many there are.
 */
function markAdded(args: { key: string; source: string; flags: string; mark: string }): number {
  const seen = (window as unknown as Record<string, unknown>)[args.key] as WeakSet<Element> | undefined;
  for (const el of Array.from(document.querySelectorAll(`[${args.mark}]`))) el.removeAttribute(args.mark);
  if (!seen) return 0;
  const pattern = new RegExp(args.source, args.flags);
  let count = 0;
  for (const el of Array.from(document.querySelectorAll("*"))) {
    if (seen.has(el) || !el.parentElement || !seen.has(el.parentElement)) continue;
    if (!pattern.test(el.textContent ?? "")) continue;
    el.setAttribute(args.mark, "");
    count += 1;
  }
  return count;
}

/** How many of what the opening adds the page has: nodes of its role, or added cards showing its text. */
async function countOpened(spec: OpenSpec, scene: StateScene): Promise<number> {
  if (typeof spec.role === "string") return openNodes(spec as OpenSpec & { role: string }, scene).count();
  return scene.page.evaluate(markAdded, { key: SEEN_KEY, source: spec.role.shows.source, flags: spec.role.shows.flags, mark: OPENED_MARK });
}

async function openApply(spec: OpenSpec, scene: StateScene): Promise<Opened> {
  const trigger = spec.trigger(scene.page, scene.row);
  const missing = await presence(trigger, `trigger in the ${scene.platform} row`);
  if (missing) return { missing };
  await trigger.evaluate((node) => node.scrollIntoView({ block: "center", inline: "nearest" }));
  if (typeof spec.role !== "string") await scene.page.evaluate(rememberElements, SEEN_KEY);
  const before = await countOpened(spec, scene);
  const said = spec.where === "announcement" ? await openNodes(spec as OpenSpec & { role: string }, scene).allInnerTexts() : [];
  const expanded = spec.expands ? await trigger.getAttribute("aria-expanded") : null;
  await spec.open(scene.page, scene.row);
  return { before, said, expanded };
}

/** Runs in the page: how many nodes of each overlay role the page has, for a not-reached open's evidence. */
function countRoles(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const role of ["dialog", "alertdialog", "menu", "listbox", "alert", "status", "tooltip"]) counts[role] = document.querySelectorAll(`[role="${role}"]`).length;
  return counts;
}

/**
 * Runs in the page: bring a node that scrolls with the page into the band the docs chrome
 * leaves visible (below the top bar, above a phone's floating tab bar), centred when it
 * fits and from its top when it does not. A node outside the page scroller (the window's
 * layer, a document-root Modal) is placed against the window and is left where it is.
 */
function frameInPage(node: Element): string {
  const scroller = node.closest<HTMLElement>("[data-page-scroll]");
  if (!scroller) return "placed against the window";
  const banner = document.querySelector('[role="banner"]');
  const top = Math.max(0, banner ? banner.getBoundingClientRect().bottom : 0);
  const nav = document.querySelector('nav[aria-label="Primary"], [role="navigation"][aria-label="Primary"]');
  const navTop = nav ? nav.getBoundingClientRect().top : window.innerHeight;
  const bottom = navTop > window.innerHeight / 2 ? Math.min(window.innerHeight, navTop) : window.innerHeight;
  const box = node.getBoundingClientRect();
  if (box.top >= top && box.bottom <= bottom) return "already in view";
  const band = bottom - top;
  const target = box.height <= band ? top + (band - box.height) / 2 : top;
  scroller.scrollTop += box.top - target;
  return box.height <= band ? "scrolled to the middle of the visible band" : "scrolled to the top of the visible band (taller than the band)";
}

/**
 * Runs in the page: where an opened node painted, and how it sits in its frame: the
 * platform row when the Playground contains it there, the viewport otherwise. A sheet runs
 * edge to edge and rests on its frame's bottom edge.
 */
function placementOf(node: Element): Record<string, unknown> {
  const box = node.getBoundingClientRect();
  const row = node.closest("[data-platform-row]");
  const where = row
    ? "in the row"
    : node.closest("[data-preview-stage]")
      ? "in the stage"
      : node.closest("[data-page-scroll]")
        ? "in the stage's outlet"
        : "outside the page (the window's layer or a document-root Modal)";
  const frame = row ? row.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    where,
    box: { x: round(box.left), y: round(box.top), width: round(box.width), height: round(box.height) },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    frame: row ? "row" : "viewport",
    edgeToEdge: box.left <= frame.left + 1 && box.right >= frame.right - 1,
    atBottom: Math.abs(box.bottom - frame.bottom) <= 2,
    inView: box.top >= 0 && box.bottom <= window.innerHeight,
  };
}

async function openVerify(spec: OpenSpec, scene: StateScene, opened: Opened): Promise<Verdict> {
  if ("missing" in opened) return notReached(opened.missing);
  const want = opened.before + spec.adds;
  let after = opened.before;
  const deadline = Date.now() + 5_000;
  for (;;) {
    after = await countOpened(spec, scene);
    if (after >= want || Date.now() > deadline) break;
    await pause(100);
  }
  const what = describeOpening(spec);
  const evidence: Record<string, unknown> = { role: typeof spec.role === "string" ? spec.role : null, ...(typeof spec.role === "string" ? {} : { shows: String(spec.role.shows) }), where: spec.where ?? "overlay", before: opened.before, after };
  if (after !== want) {
    evidence.roles = await scene.page.evaluate(countRoles);
    return notReached(`opening from the ${scene.platform} row added ${after - opened.before} ${what} node(s) where ${spec.adds} was expected`, evidence);
  }
  const nodes = typeof spec.role === "string" ? openNodes(spec as OpenSpec & { role: string }, scene) : scene.page.locator(`[${OPENED_MARK}]`);
  let panel = nodes.last();
  if (spec.where === "announcement") {
    const said = await nodes.allInnerTexts();
    const index = said.findIndex((text) => !opened.said.includes(text));
    if (index < 0) return notReached("a live region started speaking, but none says anything new", evidence);
    panel = nodes.nth(index);
    evidence.said = said[index];
  }
  const flags: StateFlag[] = [];
  if (spec.steady) {
    const steady = await spec.steady(scene.page, scene.row, panel);
    Object.assign(evidence, steady.evidence);
    flags.push(...steady.flags);
    if (!steady.held) return notReached(steady.reason ?? `the ${what} did not stay open`, evidence);
  }
  try {
    await panel.waitFor({ state: "visible", timeout: 3_000 });
  } catch {
    return notReached(`the ${what} the opening added is not visible`, evidence);
  }
  // An anchored card is placed once its trigger and the outlet are measured, a layout pass
  // or two after it mounts: wait for its box to hold still, bring it into view when it
  // scrolls with the page, and wait again.
  const holdStill = async () => {
    let box = JSON.stringify(await panel.boundingBox());
    for (let i = 0; i < 20; i++) {
      await pause(100);
      const next = JSON.stringify(await panel.boundingBox());
      if (next === box) break;
      box = next;
    }
  };
  await holdStill();
  if (spec.pointerHeld) evidence.framing = "left in place: a resting pointer holds it open";
  else {
    evidence.framing = await panel.evaluate(frameInPage);
    await holdStill();
  }
  Object.assign(evidence, await panel.evaluate(placementOf));
  if (spec.expands) {
    const expanded = await spec.trigger(scene.page, scene.row).getAttribute("aria-expanded");
    evidence.expanded = { before: opened.expanded, after: expanded };
    if (expanded !== "true") flags.push("expanded-not-announced");
  }
  return { reached: true, evidence, flags, panel };
}

/**
 * Close what an opening added, and count again: `overlay-not-closed` when the node is
 * still there 3 s later.
 */
async function openClose(spec: OpenSpec, scene: StateScene, opened: Opened): Promise<Released> {
  if ("missing" in opened) return { report: {}, flags: [] };
  if (spec.where === "announcement") return { report: { closed: "a toast leaves by itself" }, flags: [] };
  // What the state left open: a press inside the overlay (Dialog's Cancel) may have closed it already.
  if ((await countOpened(spec, scene)) === opened.before) return { report: { closed: true, by: "already closed before its close" }, flags: [] };
  if (spec.close) await spec.close(scene.page, scene.row);
  else await scene.page.keyboard.press("Escape");
  const deadline = Date.now() + 3_000;
  let count = await countOpened(spec, scene);
  while (count !== opened.before && Date.now() < deadline) {
    await pause(100);
    count = await countOpened(spec, scene);
  }
  const closed = count === opened.before;
  const by = spec.close ? "its own close" : "Escape";
  return {
    report: { closed, by, ...(closed ? {} : { left: `${count - opened.before} ${describeOpening(spec)} node(s) still open 3 s after ${by}` }) },
    flags: closed ? [] : ["overlay-not-closed"],
  };
}

/**
 * Opening the overlay from each named row, at every width (an overlay becomes a sheet on a
 * phone), or at the widths it exists at (a drawer a component becomes only at and below a
 * breakpoint). An opening under a resting pointer (a tooltip) is also its trigger's hover.
 */
function open(variant: string, spec: OpenSpec, rows: readonly RowPlatform[], how: string, widths: readonly WidthKey[] = EVERY_WIDTH): StateRecipe {
  return recipe<Opened>({
    state: "open",
    variant,
    rows,
    widths,
    frame: "viewport",
    how,
    ...(spec.pointerHeld ? { alsoAnswers: ["hover"] as const } : {}),
    ...(spec.opens ? { opens: spec.opens } : {}),
    apply: (scene) => openApply(spec, scene),
    verify: (scene, opened) => openVerify(spec, scene, opened),
    release: (scene, opened) => openClose(spec, scene, opened),
  });
}

/**
 * The pointer rests on a control and opens a card (the Calendar's hover card over a timed
 * event): a hover whose effect is the card, not a lift or a wash of the control. Reached and
 * released as an opening is, from the web row at the desktop; framed against the row when
 * the card draws in it, against the viewport when it is placed against the window. Its
 * capture is the card open, so it also answers the opening of that overlay.
 */
function hoverOpen(variant: string, spec: OpenSpec & { control: ControlSpec }, how: string): StateRecipe {
  return recipe<Opened>({
    state: "hover",
    variant,
    rows: WEB_ROW,
    widths: DESKTOP,
    frame: spec.where === "row" ? "row" : "viewport",
    how,
    alsoAnswers: ["open"],
    ...(spec.opens ? { opens: spec.opens } : {}),
    control: spec.control,
    apply: (scene) => openApply(spec, scene),
    async verify(scene, opened) {
      const verdict = await openVerify(spec, scene, opened);
      if (!verdict.reached) return verdict;
      const other = await controlMismatch(spec.trigger(scene.page, scene.row), spec.control);
      return other ? notReached(`the pointer rests on ${other}`, verdict.evidence) : verdict;
    },
    release: (scene, opened) => openClose(spec, scene, opened),
  });
}

// --- Invalid and disabled ---------------------------------------------------------------

/** Runs in the page: how a control says it is invalid, and what its error message reads. */
function readInvalid(el: Element): Record<string, string | null> {
  const text = (ids: string | null) =>
    ids
      ? ids
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
          .filter(Boolean)
          .join(" / ") || null
      : null;
  return {
    ariaInvalid: el.getAttribute("aria-invalid"),
    ariaRequired: el.getAttribute("aria-required"),
    describedBy: text(el.getAttribute("aria-describedby")),
    errorMessage: text(el.getAttribute("aria-errormessage")),
  };
}

type Invalidated = { control: Locator; typed: number | null } | { missing: string };

/**
 * The control is invalid: the example that shows its error, or one the recipe types past
 * a limit (`type`). Reached when the control carries aria-invalid="true"; the evidence
 * names the error text it is described by.
 */
function invalid(variant: string, target: Target, options: { type?: string; how?: string } = {}): StateRecipe {
  return recipe<Invalidated>({
    state: "invalid",
    variant,
    rows: WEB_ROW,
    widths: DESKTOP,
    frame: "row",
    how: options.how ?? "the example that shows the control's error",
    async apply(scene) {
      const control = target.locate(scene.row);
      const missing = await presence(control, "field");
      if (missing) return { missing };
      if (options.type === undefined) return { control, typed: null };
      await control.fill(options.type);
      // Validation that runs on blur needs the field left, as a person leaves it.
      await scene.page.keyboard.press("Tab");
      return { control, typed: options.type.length };
    },
    async verify(_scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      const read = await applied.control.evaluate(readInvalid);
      const evidence = { control: await describeTarget(applied.control), typed: applied.typed, ...read };
      if (read.ariaInvalid !== "true") return notReached(`${evidence.control} has aria-invalid=${read.ariaInvalid === null ? "(absent)" : `"${read.ariaInvalid}"`}`, evidence);
      return { reached: true, evidence, flags: read.describedBy || read.errorMessage ? [] : ["error-not-described"] };
    },
    async release(scene, applied) {
      if ("missing" in applied || applied.typed === null) return { report: {}, flags: [] };
      await applied.control.fill("");
      await scene.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      return { report: { cleared: true }, flags: [] };
    },
  });
}

/** Runs in the page: how a control says it is disabled. */
function readDisabled(el: Element): { ariaDisabled: string | null; nativeDisabled: boolean; readOnly: boolean; tabIndex: number } {
  const node = el as HTMLInputElement;
  return {
    ariaDisabled: el.getAttribute("aria-disabled"),
    nativeDisabled: node.disabled === true,
    readOnly: node.readOnly === true,
    tabIndex: node.tabIndex,
  };
}

type Disabled = { control: Locator; opened?: Opened; panel?: Locator } | { missing: string; opened?: Opened };

/**
 * The example that disables the control, or, for a control disabled inside an overlay the
 * component opens (a menu's disabled item, an action sheet's disabled action, an alert
 * dialog's confirm until its token is typed), the overlay opened from the web row first and
 * the control found in it (`within`). Reached when the control carries aria-disabled="true"
 * or a native `disabled`; one the Tab key still stops on is flagged `disabled-tab-stop`. The
 * overlay is probed beside the row, and the release closes it.
 */
function disabled(variant: string, target: Target, options: { within?: OpenSpec; how?: string; rows?: readonly RowPlatform[] } = {}): StateRecipe {
  const within = options.within;
  return recipe<Disabled>({
    state: "disabled",
    variant,
    rows: options.rows ?? WEB_ROW,
    widths: DESKTOP,
    frame: within ? "viewport" : "row",
    ...insideOf(within),
    control: target.control,
    how: options.how ?? (within ? "the overlay opens, then the control the example disables in it" : "the example that disables the control"),
    async apply(scene) {
      let scope = scene.row;
      let opened: Opened | undefined;
      if (within) {
        opened = await openApply(within, scene);
        const verdict = await openVerify(within, scene, opened);
        if (!verdict.reached) return { missing: `the overlay the disabled control is in did not open: ${verdict.reason}`, opened };
        scope = verdict.panel!;
      }
      const control = target.locate(scope);
      const missing = await presence(control, `control the example disables${within ? " in the overlay" : ""}`);
      return missing ? { missing, opened } : { control, opened, ...(within ? { panel: scope } : {}) };
    },
    async verify(_scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      const read = await applied.control.evaluate(readDisabled);
      const evidence = { control: await describeTarget(applied.control), ...read };
      const other = await controlMismatch(applied.control, target.control);
      if (other) return notReached(`the control the example disables is ${other}`, evidence);
      if (read.ariaDisabled !== "true" && !read.nativeDisabled) {
        return notReached(`${evidence.control} carries neither aria-disabled="true" nor a native disabled${read.readOnly ? " (it is read-only)" : ""}`, evidence);
      }
      // A disabled control the Tab key still stops on is announced and reachable, but inert.
      return { reached: true, evidence, flags: read.tabIndex >= 0 && !read.nativeDisabled ? ["disabled-tab-stop"] : [], ...(applied.panel ? { panel: applied.panel } : {}) };
    },
    async release(scene, applied) {
      return within && applied.opened ? openClose(within, scene, applied.opened) : { report: {}, flags: [] };
    },
  });
}

// --- The overlays ----------------------------------------------------------------------

const overlay = (slug: string): OverlayRecipe => {
  const found = MATERIAL_OVERLAY_RECIPES.find((r) => r.slug === slug);
  if (!found) throw new Error(`state-recipes: overlay-recipes.ts has no recipe for ${slug}`);
  return found;
};

/**
 * An overlay recipe opened from another example's trigger: the last button in the row named
 * `name` (the Disabled action example's ActionSheet opens from "File options", not the Usage
 * example's "Add photo").
 */
const openedFrom = (spec: OverlayRecipe, name: string | RegExp): OpenSpec => {
  const trigger = (_page: Page, scope: Locator) => scope.getByRole("button", { name, exact: typeof name === "string" }).last();
  return {
    ...spec,
    open: async (page, scope) => {
      await trigger(page, scope).click();
    },
    trigger,
  };
};

/** The rows an overlay opens from: the web row, and each platform whose docs registry injects the component's own build. */
const ALL_ROWS: readonly RowPlatform[] = ["web", "ios", "android"];
/**
 * The iOS and Android rows: where a control the component's own iOS and Android builds render
 * is (Dialog's and AlertDialog's footer buttons), whose web build renders a kit Button there.
 */
const NATIVE_ROWS: readonly RowPlatform[] = ["ios", "android"];

/** Where each page's pointer rests, for an opening the pointer holds. */
const restingPointer = new WeakMap<Page, { x: number; y: number }>();

/** Rest the pointer on the middle of a node, and remember where. */
async function restOn(page: Page, node: Locator): Promise<boolean> {
  const box = await node.boundingBox();
  if (!box) return false;
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(point.x, point.y);
  restingPointer.set(page, point);
  return true;
}

/**
 * A tooltip's bubble draws in flow beside its trigger, so opening it above the trigger
 * pushes the trigger down, out from under a pointer that has not moved. The trigger's hover
 * then ends whenever the browser next hit-tests that pointer, and the bubble closes (and,
 * as the trigger slides back under the pointer, may open again). Steadying moves the
 * pointer back onto the trigger, wherever the trigger now is, until the pointer rests on it
 * with the bubble open and the bubble holds for 300 ms; any move it took means the bubble
 * did not stay open where the pointer first rested, which a person's resting pointer finds
 * too, so it is recorded and flagged `hover-unstable`.
 */
async function followPointer(page: Page, trigger: Locator, bubble: Locator): Promise<{ held: boolean; reason?: string; evidence: Record<string, unknown>; flags: StateFlag[] }> {
  const pointerOnTrigger = async () => {
    const point = restingPointer.get(page);
    if (!point) return false;
    return trigger.evaluate((node, p) => {
      const hit = document.elementFromPoint(p.x, p.y);
      return !!hit && node.contains(hit);
    }, point);
  };
  let moves = 0;
  let slidAway = false;
  for (let attempt = 0; attempt < 6; attempt++) {
    // The bubble's layout lands a frame or two after it mounts.
    await pause(100);
    const open = (await bubble.count()) > 0;
    const onTrigger = await pointerOnTrigger();
    if (open && onTrigger) {
      let held = true;
      for (let i = 0; i < 6 && held; i++) {
        await pause(50);
        held = (await bubble.count()) > 0;
      }
      if (held) {
        // Any move means the bubble did not stay open where the pointer first rested.
        return {
          held: true,
          evidence: { pointer: { followedTrigger: moves, slidAway } },
          flags: moves > 0 ? ["hover-unstable"] : [],
        };
      }
    }
    if (open && !onTrigger) slidAway = true;
    if (!(await restOn(page, trigger))) break;
    moves += 1;
  }
  return {
    held: false,
    reason: "the bubble would not stay open under the pointer: each opening moved the trigger out from under it",
    evidence: { pointer: { followedTrigger: moves, slidAway } },
    flags: [],
  };
}

/** Tooltip has no overlay recipe: its bubble draws in flow beside the trigger, raised by hover or focus. */
const TOOLTIP_OPEN: OpenSpec = {
  open: async (page, scope) => {
    await restOn(page, scope.getByRole("button", { name: "Hover me", exact: true }).last());
  },
  trigger: (_page, scope) => scope.getByRole("button", { name: "Hover me", exact: true }).last(),
  // The open bubble is a polite live region announced as an alert (src/atoms/tooltip/tooltip.shared.tsx).
  role: "alert",
  adds: 1,
  where: "row",
  pointerHeld: true,
  steady: (page, scope, panel) => followPointer(page, scope.getByRole("button", { name: "Hover me", exact: true }).last(), panel),
  close: async (page) => {
    await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
  },
};

/** AvatarMenu has no overlay recipe: its pill is a Dropdown trigger named for the account. */
const AVATAR_MENU_OPEN: OpenSpec = {
  open: async (_page, scope) => {
    await scope.getByRole("button", { name: /^Rachel Chen,/ }).last().click();
  },
  trigger: (_page, scope) => scope.getByRole("button", { name: /^Rachel Chen,/ }).last(),
  role: "menu",
  adds: 1,
  expands: true,
};

const TOAST_OPEN: OpenSpec = {
  open: (page, scope) => TOAST_RECIPE.open(page as never, scope as never),
  trigger: (_page, scope) => scope.getByRole("button", { name: "Show toast", exact: true }).last(),
  role: "status",
  adds: 1,
  where: "announcement",
};

const viaRecipe = (slug: string) => `overlay-recipes.ts' ${slug} recipe, from the row`;

/** ButtonGroup's split button: its chevron, named More actions, opens the overflow menu. */
const SPLIT_MENU_OPEN: OpenSpec = {
  open: async (_page, scope) => {
    await scope.getByRole("button", { name: "More actions", exact: true }).last().click();
  },
  trigger: (_page, scope) => scope.getByRole("button", { name: "More actions", exact: true }).last(),
  role: "menu",
  adds: 1,
  expands: true,
};

/**
 * The Calendar's hover card: a pointer resting on a timed event floats the event's detail
 * card beside it. The card carries no role, so it is found by the line it shows (the day and
 * the hours, which nothing else on the page shows), and the page is never scrolled under the
 * resting pointer.
 */
const CALENDAR_HOVER_CARD: OpenSpec & { control: ControlSpec } = {
  open: async (page, scope) => {
    await restOn(page, scope.getByLabel(/^Design review,/).last());
  },
  trigger: (_page, scope) => scope.getByLabel(/^Design review,/).last(),
  role: { shows: /Monday, May 19 · 11 AM – 12:30 PM/ },
  adds: 1,
  pointerHeld: true,
  close: async (page) => {
    await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
  },
  opens: "hoverCard",
  // The event block: a button only with `onEventPress`, which the Week example does not pass.
  control: { in: "eventLayer" },
};

/** The Calendar's day peek: a press on a day with events opens its timeline beside it, a card with no role, found by its title. */
const CALENDAR_DAY_PEEK: OpenSpec = {
  open: async (_page, scope) => {
    await scope.getByRole("button", { name: /^24(?:,|$)/ }).last().click();
  },
  trigger: (_page, scope) => scope.getByRole("button", { name: /^24(?:,|$)/ }).last(),
  role: { shows: /^Saturday, May 24/ },
  adds: 1,
  opens: "dayPeekOverlay",
};

/** FilterPanel's responsive drawer: below its breakpoint the panel is a Filters (n) trigger that opens it in a Drawer. */
const FILTER_DRAWER_OPEN: OpenSpec = {
  open: async (_page, scope) => {
    await scope.getByRole("button", { name: /^Filters \(\d+\)/ }).last().click();
  },
  trigger: (_page, scope) => scope.getByRole("button", { name: /^Filters \(\d+\)/ }).last(),
  role: "dialog",
  adds: 1,
};

/** Sidebar's responsive drawer, opened by the Usage example's app frame hamburger. */
const SIDEBAR_DRAWER_OPEN: OpenSpec = {
  open: async (_page, scope) => {
    await scope.getByRole("button", { name: "Open menu", exact: true }).last().click();
  },
  trigger: (_page, scope) => scope.getByRole("button", { name: "Open menu", exact: true }).last(),
  role: "dialog",
  adds: 1,
};

// --- The table -------------------------------------------------------------------------

const LAYOUT = "A layout primitive: it renders no control of its own (the controls in its examples are kit components with recipes of their own).";
/** A chart whose source takes no input at all (tools/audit/interaction-signals.ts finds no press, scrub, hover or field in it or the shared chart modules it renders). */
const CHART_STATIC = "A chart that takes no input: no press, scrub or hover handler in its source or the shared chart modules it renders; it displays data.";

/** An exemption for signals rendered only with props no rail example passes. */
const unpassed = (reason: string, ...props: string[]): Exemption => ({ claim: { unpassed: props }, reason });

/** The heatmap's day cells, in the order the grid renders them (a column of seven a week). */
const HEATMAP_DAY: PlotPoint = { mark: '[role="img"] [tabindex="-1"]', index: 10 };

/**
 * Every component in the interaction registry: the states it has, each with the example it
 * is reached on, or why it has none, and the exempt states its source gives it. A
 * component whose web skin declares hover feedback (src/style/hover.tsx) or takes a resting
 * pointer has a hover recipe; one that takes a press, a pressed look or a scrub has a
 * pressed recipe; an overlay opens from every row whose platform build the docs registry
 * injects (docs/src/core/platform-skins.ts).
 */
export const STATE_RECIPES: Record<string, ComponentStates> = {
  // Atoms
  view: { static: true, reason: "A layout primitive: it renders no control of its own and its examples hold none." },
  text: { static: true, reason: "A text primitive: it renders no control of its own and its examples hold none." },
  pressable: {
    focus: focus("default", firstTabStop),
    pressed: pressed("opacity", firstTabStop),
    disabled: disabled("disabled", bySelector("[aria-disabled]")),
  },
  image: { static: true, reason: "An image: it takes no input." },
  "text-input": {
    focus: focus("default", byRole("textbox")),
    disabled: disabled("disabled", byRole("textbox", "Plan")),
  },
  "scroll-view": { static: true, reason: "A scroll container whose examples render no tab stop; its keyboard stop and ring, where content overflows, are e2e/behavior/scroll-focus.e2e.ts's." },
  "row-column": { static: true, reason: LAYOUT },
  grid: { static: true, reason: LAYOUT },
  container: { static: true, reason: LAYOUT },
  chip: {
    focus: focus("selectable", byRole("button", "Design")),
    pressed: pressed("selectable", byRole("button", "Engineering")),
  },
  emblem: { static: true, reason: "A decorative identity mark: it takes no input." },
  autocomplete: {
    focus: focus("default", byRole("combobox")),
    // Pressed on its own surface (the chevron that toggles the list) and inside the list it opens.
    pressed: [
      pressed("default", byRole("button", "Toggle options")),
      pressed("requiredfield", byRole("option", "Ada Lovelace"), { within: overlay("autocomplete"), how: "the list opens (a click and a typed letter), then the pointer goes down on its first option and is held" }),
    ],
    open: open("default", overlay("autocomplete"), ALL_ROWS, `${viaRecipe("autocomplete")}: the field takes a click and a typed letter`),
    disabled: disabled("disabled", byRole("combobox")),
  },
  avatar: {
    // The pill is AvatarMenu's own hover target; the button around it is the Dropdown's custom
    // trigger, whose focus and press are Dropdown's (its Custom trigger recipes).
    hover: hover("accountmenu", inside(byRole("button", /^Rachel Chen,/), ":scope > div", { in: "AvatarMenu" }), { how: "the pointer rests on the AvatarMenu pill" }),
    open: open("accountmenu", AVATAR_MENU_OPEN, ALL_ROWS, "a click on the AvatarMenu pill, from the row"),
    disabled: disabled("disabledmenu", byRole("button", /^Ada Lovelace,/)),
    exempt: {
      focus: unpassed("`onPress` makes the Avatar a button, a tab stop; no rail example passes it (the AvatarMenu pill's button is the Dropdown's custom trigger).", "onPress"),
      pressed: unpassed("`onPress` makes the Avatar a button; no rail example passes it (the AvatarMenu pill's button is the Dropdown's custom trigger).", "onPress"),
    },
  },
  badge: { static: true, reason: "A status label: it takes no input." },
  breadcrumb: {
    focus: focus("default", byRole("link", "Projects")),
    pressed: pressed("default", byRole("link", "Projects")),
  },
  "button-group": {
    focus: [
      focus("default", stopIn(byRole("tablist"), "tab")),
      focus("split", byRole("menuitem", "Save and close"), { within: SPLIT_MENU_OPEN, how: "the split menu opens from its chevron, then Tab from the tab stop before its second item" }),
    ],
    pressed: [
      pressed("default", byRole("tab", "Week")),
      pressed("split", byRole("menuitem", "Save as draft"), { within: SPLIT_MENU_OPEN, how: "the split menu opens from its chevron, then the pointer goes down on its first item and is held" }),
    ],
    // The split button's chevron opens its overflow menu (an AnchoredOverlay).
    open: open("split", SPLIT_MENU_OPEN, ALL_ROWS, "a click on the Split example's chevron (More actions), from the row"),
    disabled: disabled("disabled", byRole("tab", "Day")),
  },
  button: {
    hover: hover("default", byRole("button", "Save changes")),
    focus: focus("default", byRole("button", "Save changes")),
    pressed: pressed("default", byRole("button", "Save changes")),
    disabled: disabled("disabled", byRole("button", "Save changes")),
  },
  checkbox: {
    focus: focus("default", byRole("checkbox")),
    pressed: pressed("default", byRole("checkbox")),
    disabled: disabled("disabled", byRole("checkbox")),
  },
  divider: { static: true, reason: "A separator: it takes no input (the Action example's control is a Button, whose states the button recipes capture)." },
  dropdown: {
    hover: hover("default", byRole("menuitem"), { within: overlay("dropdown"), how: "the menu opens, then the pointer rests on its first item" }),
    // The default trigger is a kit Button (its focus and press are Button's); Dropdown's own
    // are the Custom trigger example's button, and the rows of the menu it opens.
    focus: [
      focus("customtrigger", byRole("button")),
      focus("default", byRole("menuitem", "Duplicate"), { within: overlay("dropdown"), keys: ["ArrowDown"] }),
    ],
    pressed: [
      pressed("customtrigger", byRole("button")),
      pressed("default", byRole("menuitem", "Duplicate"), { within: overlay("dropdown") }),
    ],
    open: open("default", overlay("dropdown"), ALL_ROWS, viaRecipe("dropdown")),
    // Disabled in two places: the trigger, and an item inside the menu it opens.
    disabled: [
      disabled("disabledtrigger", byRole("button", "Actions")),
      disabled("disableditem", byRole("menuitem", "Archive"), { within: overlay("dropdown"), how: "the menu opens, then its Archive item, which the example disables" }),
    ],
  },
  icon: { static: true, reason: "A glyph: it takes no input." },
  input: {
    focus: focus("default", byRole("textbox")),
    pressed: pressed("password", byRole("button", "Show password")),
    invalid: invalid("error", byRole("textbox")),
    disabled: disabled("disabled", byRole("textbox")),
  },
  "input-otp": {
    focus: focus("default", byRole("textbox", "One-time code")),
    disabled: disabled("disabled", byRole("textbox", "One-time code")),
  },
  kbd: { static: true, reason: "A keycap: it takes no input (the In a button example's control is a Button, whose states the button recipes capture)." },
  listbox: {
    hover: hover("default", byRole("option", "Frontend")),
    focus: focus("default", stopIn(byRole("listbox"), "option")),
    pressed: pressed("default", byRole("option", "Frontend")),
    disabled: disabled("disabled", byRole("option", "Backend")),
  },
  stepper: {
    focus: focus("default", byRole("spinbutton")),
    pressed: pressed("default", byRole("button", "Increase")),
    disabled: disabled("disabled", byRole("spinbutton")),
  },
  pagination: {
    // Page 2 is the current page, which takes no hover wash; a resting page does.
    hover: hover("default", byRole("button", "Page 3")),
    focus: focus("default", byRole("button", "Page 3")),
    pressed: pressed("default", byRole("button", "Page 3")),
    disabled: disabled("firstandlastpage", byRole("button", "Previous page")),
  },
  popover: {
    open: open("default", overlay("popover"), ALL_ROWS, viaRecipe("popover")),
  },
  progress: { static: true, reason: "A meter: it shows a value and takes no input." },
  qrcode: { static: true, reason: "A code image: it takes no input." },
  radio: {
    focus: focus("default", stopIn(byRole("radiogroup"), "radio")),
    pressed: pressed("default", byRole("radio", "Hobby")),
  },
  reveal: { static: true, reason: "An entrance transition around its content: it takes no input." },
  select: {
    focus: [
      focus("default", byRole("button", "Country")),
      focus("requiredfield", byRole("option", "Canada"), { within: overlay("select") }),
    ],
    pressed: [
      pressed("default", byRole("button", "Country")),
      pressed("requiredfield", byRole("option", "Canada"), { within: overlay("select") }),
    ],
    open: open("default", overlay("select"), ALL_ROWS, viaRecipe("select")),
    disabled: disabled("disabled", byRole("button", "Country")),
  },
  skeleton: { static: true, reason: "A loading placeholder: it takes no input." },
  slider: {
    focus: focus("default", byRole("slider")),
    // The web thumb takes a pressed ring (slider.styles.ts `webSkin.thumb`, from the shell's
    // PanResponder). The pointer goes down on the thumb itself, so the value stays, and comes
    // up there: moving off while held would drag it.
    pressed: pressed("default", byRole("slider"), {
      at: inside(byRole("slider"), ":scope > *:last-child"),
      release: "in-place",
      how: "the pointer goes down on the slider's thumb and is held",
    }),
    disabled: disabled("disabled", byRole("slider")),
  },
  spinner: { static: true, reason: "A loading indicator: it takes no input." },
  textarea: {
    focus: focus("default", byRole("textbox")),
    invalid: invalid("charactercounter", byRole("textbox"), { type: "x".repeat(281), how: "281 characters typed against the soft cap of 280" }),
    disabled: disabled("disabled", byRole("textbox")),
  },
  swatch: { static: true, reason: "A colour sample: it takes no input." },
  switch: {
    focus: focus("default", byRole("switch")),
    pressed: pressed("default", byRole("switch")),
    disabled: disabled("disabled", byRole("switch")),
  },
  tooltip: {
    // Its hover is its open recipe's: the pointer resting on the trigger opens the bubble
    // (the examples whose trigger is its own pin the bubble open, so a hover changes nothing there).
    // The On hover example's trigger is a kit Button; Tooltip's own are the icon and text triggers.
    focus: focus("icon", byRole("button", "Open settings")),
    // The icon trigger is the tooltip's own pressable (`iconTrigger`), pinned open in its example.
    pressed: pressed("icon", byRole("button", "Open settings")),
    open: open("onhover", TOOLTIP_OPEN, ALL_ROWS, "the pointer rests on the On hover example's trigger, in the row"),
  },
  typography: {
    static: true,
    reason: "Text styles: no rail example makes the text a link or gives it a press, so none takes input.",
    exempt: {
      focus: unpassed(
        "`href` makes the text a link (a tab stop); no rail example passes it: typography.md's Inline links (href) fence follows Do & Don't, which the docs page does not render, so the link example is not on the page at all.",
        "href",
      ),
      pressed: unpassed("`onPress` makes the text pressable; no rail example passes it.", "onPress"),
    },
  },
  video: {
    focus: focus("default", byRole("button", /^Play /)),
    pressed: pressed("default", byRole("button", /^Play /)),
  },

  // Molecules
  accordion: {
    focus: focus("default", byRole("button", "Is it accessible?")),
    pressed: pressed("default", byRole("button", "Is it accessible?")),
    disabled: disabled("disabledrow", byRole("button", /^Advanced/)),
  },
  "action-panels": {
    static: true,
    reason: "A panel of text beside its actions: its controls are kit Buttons, Switches and fields, whose own recipes capture them.",
  },
  alert: {
    focus: focus("dismissible", byRole("button", "Dismiss")),
    pressed: pressed("dismissible", byRole("button", "Dismiss")),
  },
  "alert-dialog": {
    // Its own action buttons are the iOS build's capsules and the Android build's text buttons
    // (`skin.actionLayout`, `skin.textButton`); the web build's are kit Buttons, whose own
    // recipes capture their focus and press. So these are applied on the iOS and Android rows.
    focus: focus("default", byRole("button", "Cancel"), { within: overlay("alert-dialog"), rows: NATIVE_ROWS }),
    pressed: pressed("default", byRole("button", "Cancel"), { within: overlay("alert-dialog"), rows: NATIVE_ROWS }),
    open: open("default", overlay("alert-dialog"), ALL_ROWS, viaRecipe("alert-dialog")),
    // `withInput` keeps the confirm disabled until its token is typed in the dialog's field: the
    // kit Button it hands `disabled` on the web row, its own capsule and text button on the others.
    disabled: disabled("bodyfield", byRole("button", "Delete"), { within: overlay("alert-dialog"), rows: ALL_ROWS, how: "the dialog opens, then its Delete button, disabled until DELETE is typed in its field" }),
  },
  card: {
    hover: hover("pressable", byRole("button", /^Scout/)),
    focus: focus("pressable", byRole("button", /^Scout/)),
    pressed: pressed("pressable", byRole("button", /^Scout/)),
  },
  "code-block": {
    focus: focus("copybutton", byRole("button", "Copy code")),
    pressed: pressed("copybutton", byRole("button", "Copy code")),
  },
  collapsible: {
    focus: focus("default", byRole("button", "Shipping details")),
    pressed: pressed("default", byRole("button", "Shipping details")),
    disabled: disabled("disabled", byRole("button", /^Advanced settings/)),
  },
  "description-lists": {
    // Its own control is the inline-edit field its Update link (a kit Button) swaps in.
    focus: focus("inlineedit", byRole("textbox", "Name value"), { reveal: byRole("button", "Update Name"), how: "the Update link swaps the Name row's value for its field, then Tab from the tab stop before the field" }),
  },
  field: {
    // Its field is a kit Input, whose focus the input recipes capture; the error is Field's.
    invalid: invalid("error", byRole("textbox", "Email")),
  },
  "empty-state": { static: true, reason: "A message block: it takes no input (the Action example's control is a Button, whose states the button recipes capture)." },
  feeds: {
    static: true,
    reason: "An activity list whose rows are read-only in every rail example.",
    exempt: {
      focus: unpassed(
        "`onItemPress` makes each row a button, a tab stop, and `virtualized` scrolls the rows in a list that is one once they overflow; no rail example passes either.",
        "onItemPress",
        "virtualized",
      ),
      pressed: unpassed("`onItemPress` makes each row a button; no rail example passes it.", "onItemPress"),
    },
  },
  form: {
    // Its fields are kit Inputs, whose focus the input recipes capture; the errors are Form's.
    invalid: invalid("creditcardwitherrors", byRole("textbox", "Card Number")),
  },
  "grid-lists": {
    static: true,
    reason: "A grid of tiles: the Tappable example's tiles are kit Cards, whose own recipes capture them.",
    exempt: {
      focus: unpassed(
        "A gallery tile is a button only with `onPressItem`, and the list a tab stop only when `virtualized` scrolls; the Gallery example passes neither, and the Tappable example's tiles are kit Cards.",
        "onPressItem",
        "virtualized",
      ),
      pressed: unpassed("A gallery tile is a button only with `onPressItem`; the Gallery example does not pass it, and the Tappable example's tiles are kit Cards.", "onPressItem"),
    },
  },
  "media-objects": {
    focus: focus("tappable", byRole("button", "Rachel Chen")),
    pressed: pressed("tappable", byRole("button", "Rachel Chen")),
  },
  "phone-input": {
    focus: [
      focus("default", byRole("textbox", "Phone number")),
      focus("prefilled", byRole("option", /^Canada/), { within: PHONE_INPUT_RECIPE }),
    ],
    pressed: [
      pressed("default", byRole("button", /^Country,/)),
      pressed("prefilled", byRole("option", /^Canada/), { within: PHONE_INPUT_RECIPE }),
    ],
    open: open("default", PHONE_INPUT_RECIPE, ALL_ROWS, "overlay-recipes.ts' PHONE_INPUT_RECIPE (the country segment), from the row"),
    invalid: invalid("error", byRole("textbox", "Phone number")),
    disabled: disabled("disabled", byRole("button", /^Country,/)),
  },
  "stacked-lists": {
    focus: focus("clickable", byRole("button", /^RC/)),
    pressed: pressed("clickable", byRole("button", /^RC/)),
  },
  stats: {
    focus: focus("tappable", byRole("button", /^Active users/)),
    pressed: pressed("tappable", byRole("button", /^Active users/)),
  },

  // Organisms
  "action-sheet": {
    focus: focus("default", byRole("button", "Take Photo"), { within: overlay("action-sheet") }),
    pressed: pressed("default", byRole("button", "Take Photo"), { within: overlay("action-sheet") }),
    open: open("default", overlay("action-sheet"), ALL_ROWS, viaRecipe("action-sheet")),
    disabled: disabled("disabledaction", byRole("button", "Save As…"), {
      within: openedFrom(overlay("action-sheet"), "File options"),
      how: "the sheet opens from the Disabled action example's File options, then its Save As… action, which the example disables",
    }),
  },
  board: {
    focus: focus("cardmenusandpress", byRole("button", /^Rotate webhook/)),
    pressed: pressed("cardmenusandpress", byRole("button", /^Rotate webhook/)),
  },
  calendar: {
    // A pointer resting on a timed event floats its detail card (the Week example's Design review).
    hover: hoverOpen("week", CALENDAR_HOVER_CARD, "the pointer rests on the Week example's Design review block, which floats its detail card"),
    focus: [
      focus("default", byRole("button", /^1(?:,|$)/)),
      // The day peek's own timeline: its event blocks are tab stops (no hover, `eventLayer(..., false)`).
      focus("daypeek", byLabel(/^Sprint planning,/, { in: "eventLayer" }), { within: CALENDAR_DAY_PEEK, how: "the day peek opens on the 24th, then Tab from the tab stop before its Sprint planning block" }),
    ],
    pressed: pressed("default", byRole("button", /^2(?:,|$)/)),
    open: open("daypeek", CALENDAR_DAY_PEEK, ALL_ROWS, "a click on the Day peek example's 24th, which opens the day's timeline beside it, from the row"),
    exempt: {
      pressed: unpassed("An event block takes a press only with `onEventPress`, the day peek's included; no rail example passes it.", "onEventPress"),
    },
  },
  carousel: {
    focus: focus("default", byRole("button", "Next slide")),
    pressed: pressed("default", byRole("button", "Next slide")),
  },
  command: {
    // Its rows take the active highlight under a resting pointer (onHoverIn); the first is active
    // already. They do inline and in the palette its Search trigger opens.
    hover: [
      hover("default", byRole("option", /^Open File/), { within: overlay("command"), how: "the palette opens, then the pointer rests on its second row" }),
      hover("inline", byRole("option", /^Open File/), { how: "the pointer rests on the Inline example's second row" }),
    ],
    focus: [
      focus("default", byRole("button", /^Search/)),
      focus("default", byRole("option", /^Open File/), { within: overlay("command"), how: "the palette opens, then Tab from the tab stop before its second row" }),
    ],
    pressed: [
      pressed("default", byRole("button", /^Search/)),
      pressed("default", byRole("option", /^Open File/), { within: overlay("command"), how: "the palette opens, then the pointer goes down on its second row and is held" }),
    ],
    open: open("default", overlay("command"), ALL_ROWS, viaRecipe("command")),
  },
  "dashboard-grid": {
    static: true,
    reason: "A layout of tiles: in customize mode its reorder grips are a kit DragDrop's, whose own recipes capture them.",
  },
  "data-table": {
    // On every row: the iOS and Android builds render their own cell editor's field
    // (`skin.liquidTextEntry`), so the native rows' surfaces take focus where the web's does not.
    focus: focus("sortable", byRole("columnheader", /^Email/), { rows: ALL_ROWS }),
    pressed: pressed("sortable", byRole("columnheader", /^Email/)),
  },
  dialog: {
    // Its own footer controls are the iOS build's capsules and the Android build's text buttons
    // (`skin.footerKind`, `skin.textButton`); the web build's Cancel and Confirm are kit Buttons,
    // whose own recipes capture their focus and press. So these are applied on the iOS and
    // Android rows of the three-up.
    focus: focus("default", byRole("button", "Cancel"), { within: overlay("dialog"), rows: NATIVE_ROWS }),
    pressed: pressed("default", byRole("button", "Cancel"), { within: overlay("dialog"), rows: NATIVE_ROWS }),
    open: open("default", overlay("dialog"), ALL_ROWS, viaRecipe("dialog")),
  },
  "drag-drop": {
    focus: focus("default", byRole("button", /^Reorder /)),
    // The grip lifts its card while held (its PanResponder); a press that does not move
    // drops it where it was, and a move would drag it.
    pressed: pressed("default", byRole("button", "Reorder Design review"), { release: "in-place", how: "the pointer goes down on the first card's grip and is held" }),
    disabled: disabled("lockeditem", byRole("button", /^Locked task/)),
  },
  drawer: {
    open: open("default", overlay("drawer"), ALL_ROWS, viaRecipe("drawer")),
    exempt: {
      pressed: {
        claim: { dismissLayers: true },
        reason: "Its own presses are the dim scrim, which closes the drawer, and the panel, which swallows a stray press: neither is a control, and the open recipe captures the drawer itself.",
      },
    },
  },
  "filter-panel": {
    // Its own controls are the option rows, on the panel and inside the drawer it becomes at a
    // phone's width; the header's Clear is a kit Button.
    focus: [
      focus("default", byRole("checkbox", /^Pending/)),
      focus("responsivedrawer", byRole("checkbox", /^Archived/), { within: FILTER_DRAWER_OPEN, widths: widthsAtOrBelow("sm"), how: "the Filters (1) trigger opens the drawer, then Tab from the tab stop before its Archived row" }),
    ],
    pressed: [
      pressed("default", byRole("checkbox", /^Active/)),
      pressed("responsivedrawer", byRole("checkbox", /^Active/), { within: FILTER_DRAWER_OPEN, widths: widthsAtOrBelow("sm"), how: "the Filters (1) trigger opens the drawer, then the pointer goes down on its Active row and is held" }),
    ],
    // `responsive` collapses the panel to its Filters (n) trigger and a drawer at and below `drawerBreakpoint` (sm by default).
    open: open("responsivedrawer", FILTER_DRAWER_OPEN, ALL_ROWS, "a click on the Responsive drawer example's Filters (1) trigger, from the row", widthsAtOrBelow("sm")),
  },
  navbars: {
    focus: focus("default", byRole("link", "Dashboard")),
    pressed: pressed("default", byRole("link", "Users")),
  },
  sidebar: {
    // The rail's rows at the desktop, and the drill-down's rows inside the drawer it becomes at
    // and below `drawerBreakpoint` (lg by default), which the Usage example's app frame opens
    // from its hamburger. The page shows one preview (the web build), so the web row alone.
    hover: [
      hover("default", byRole("button", "Dashboard")),
      hover("default", byRole("button", /^Inbox/), { within: SIDEBAR_DRAWER_OPEN, widths: widthsAtOrBelow("lg"), how: "the hamburger opens the drawer, then the pointer rests on its Inbox row" }),
    ],
    focus: [
      focus("default", byRole("button", "Dashboard")),
      focus("default", byRole("button", /^Inbox/), { within: SIDEBAR_DRAWER_OPEN, widths: widthsAtOrBelow("lg"), how: "the hamburger opens the drawer, then Tab from the tab stop before its Inbox row" }),
    ],
    pressed: [
      pressed("default", byRole("button", /^Inbox/)),
      pressed("default", byRole("button", /^Inbox/), { within: SIDEBAR_DRAWER_OPEN, widths: widthsAtOrBelow("lg"), how: "the hamburger opens the drawer, then the pointer goes down on its Inbox row and is held" }),
    ],
    open: open("default", SIDEBAR_DRAWER_OPEN, ["web"], "a click on the Usage example's Open menu hamburger, from the row", widthsAtOrBelow("lg")),
  },
  "row-menu": {
    // Its trigger, and the rows of the menu it opens.
    hover: [
      hover("default", byRole("button", "More options")),
      hover("sectionlabel", byRole("menuitem", "Duplicate"), { within: overlay("row-menu"), how: "the menu opens, then the pointer rests on its Duplicate row" }),
    ],
    focus: [
      focus("default", byRole("button", "More options")),
      focus("sectionlabel", byRole("menuitem", "Duplicate"), { within: overlay("row-menu") }),
    ],
    pressed: [
      pressed("default", byRole("button", "More options")),
      pressed("sectionlabel", byRole("menuitem", "Duplicate"), { within: overlay("row-menu") }),
    ],
    open: open("default", overlay("row-menu"), ALL_ROWS, viaRecipe("row-menu")),
    disabled: disabled("disableditem", byRole("menuitem", "Clear column"), { within: overlay("row-menu"), how: "the menu opens, then its Clear column item, which the example disables" }),
  },
  steps: {
    static: true,
    reason: "A progress display whose step circles are plain in every rail example.",
    exempt: {
      focus: unpassed("`onStepPress` makes each circle a button, a tab stop; no rail example passes it.", "onStepPress"),
      pressed: unpassed("`onStepPress` makes each circle a button; no rail example passes it.", "onStepPress"),
    },
  },
  "tab-bar": {
    focus: focus("default", stopIn(byRole("tablist"), "tab")),
    pressed: pressed("default", byRole("tab", "Search")),
  },
  tabs: {
    focus: focus("default", stopIn(byRole("tablist"), "tab")),
    pressed: pressed("default", byRole("tab", "Security")),
    disabled: disabled("disabledtab", byRole("tab", "Billing")),
  },
  toast: {
    // The With an action example renders its toast in the row, with its action button; the
    // provider's toast (the Usage example's Show toast) carries a Dismiss.
    focus: [
      focus("withanaction", byRole("button", "Undo")),
      focus("default", byRole("button", "Dismiss"), { within: TOAST_OPEN, how: "Show toast raises a toast, then Tab from the tab stop before its Dismiss" }),
    ],
    pressed: [
      pressed("withanaction", byRole("button", "Undo")),
      pressed("default", byRole("button", "Dismiss"), { within: TOAST_OPEN, how: "Show toast raises a toast, then the pointer goes down on its Dismiss and is held" }),
    ],
    // The iOS build is the web one (the docs registry injects no iOS Toast).
    open: open("default", TOAST_OPEN, ["web", "android"], "overlay-recipes.ts' TOAST_RECIPE (Show toast), from the row"),
  },

  // Charts. A chart that inspects under a press has a press-to-inspect recipe on its Usage
  // example (chart: the grouped bars, since the plain columns dim and show no flag); a chart
  // whose source takes no input is static.
  chart: {
    pressed: inspect("groupedbars", { axis: "Q2" }, { mode: "hold", expect: ["Q2", "Revenue", "70"], how: "press-to-inspect: the pointer goes down over the Q2 cluster (its ScrubSurface) and is held" }),
  },
  "line-chart": {
    pressed: inspect("default", { axis: "Apr" }, { mode: "hold", expect: ["Apr", "147"], how: "press-to-inspect: the pointer goes down over Apr (the shared frame's ScrubSurface) and is held" }),
  },
  "area-chart": {
    pressed: inspect("default", { axis: "Apr" }, { mode: "hold", expect: ["Apr", "149"], how: "press-to-inspect: the pointer goes down over Apr (the shared frame's ScrubSurface) and is held" }),
  },
  "pie-chart": {
    focus: focus("default", firstTabStop, { how: "Tab onto the chart's inspection stop" }),
    // The first slice runs clockwise from 12 o'clock past 3: the plot's right middle is in it.
    pressed: inspect("default", { mark: "svg", fx: 0.75, fy: 0.5 }, { mode: "click", how: "press-to-inspect: a press on the first slice (the plot's right middle); the other slices dim" }),
  },
  "scatter-plot": {
    focus: focus("default", firstTabStop, { how: "Tab onto the chart's inspection stop" }),
    pressed: inspect("default", { mark: "svg circle", index: 1 }, { mode: "click", expect: ["us-east", "(220, 37)"], how: "press-to-inspect: a press on the second us-east point" }),
  },
  "candlestick-chart": {
    pressed: inspect("default", { axis: "D4" }, { mode: "hold", expect: ["D4", "Close", "64.2"], how: "press-to-inspect: the pointer goes down over D4 (the shared frame's ScrubSurface) and is held" }),
  },
  "depth-chart": { static: true, reason: CHART_STATIC },
  sparkline: { static: true, reason: CHART_STATIC },
  "stacked-bar": { static: true, reason: CHART_STATIC },
  gauge: { static: true, reason: CHART_STATIC },
  heatmap: {
    // The calendar's day cells inspect under a resting pointer and pin on a press; the plain grid takes no input.
    hover: hoverInspect("calendar", HEATMAP_DAY, { how: "the pointer rests on the eleventh day of the calendar" }),
    // Its scroller is a tab stop only where the year overflows it, below `sm` (e2e/behavior/scroll-focus.e2e.ts);
    // the day cells are pointer-only.
    focus: focus("calendar", firstTabStop, { how: "Tab onto the calendar's scroller, which the year overflows at a phone's width", widths: widthsAtOrBelow("sm") }),
    pressed: inspect("calendar", HEATMAP_DAY, { mode: "click", how: "press-to-inspect: a press on the eleventh day of the calendar" }),
  },
  "bar-list": {
    focus: focus("drillinrows", byRole("button", /^news\.ycombinator/)),
    pressed: pressed("drillinrows", byRole("button", /^news\.ycombinator/)),
  },
  "metric-breakdown": { static: true, reason: CHART_STATIC },
  "uptime-bar": { static: true, reason: CHART_STATIC },
  "service-health-list": {
    focus: focus("drillinrows", byRole("button", /^API:/)),
    pressed: pressed("drillinrows", byRole("button", /^API:/)),
  },
  "bullet-chart": { static: true, reason: CHART_STATIC },
  "progress-ring": { static: true, reason: CHART_STATIC },
  "composed-chart": {
    pressed: inspect("default", { axis: "Q2" }, { mode: "hold", expect: ["Q2", "510"], how: "press-to-inspect: the pointer goes down over Q2 (the shared frame's ScrubSurface) and is held" }),
  },
  "range-area-chart": {
    pressed: inspect("default", { axis: "Wed" }, { mode: "hold", expect: ["Wed", "131"], how: "press-to-inspect: the pointer goes down over Wed (the shared frame's ScrubSurface) and is held" }),
  },
  histogram: {
    // A quarter of the way from the 50 tick to the 60 tick is inside the 50 to 55 bin.
    pressed: inspect("default", { axis: "50", toward: "60", t: 0.25 }, { mode: "hold", expect: ["50 to 55"], how: "press-to-inspect: the pointer goes down over the 50 to 55 bin (its ScrubSurface) and is held" }),
  },
  "box-plot": {
    pressed: inspect("default", { axis: "eu-west" }, { mode: "hold", expect: ["eu-west", "Median", "59.5"], how: "press-to-inspect: the pointer goes down over eu-west (the shared frame's ScrubSurface) and is held" }),
  },
  "waterfall-chart": {
    pressed: inspect("default", { axis: "Expansion" }, { mode: "hold", expect: ["Expansion", "460"], how: "press-to-inspect: the pointer goes down over Expansion (the shared frame's ScrubSurface) and is held" }),
  },
  "radial-bar-chart": {
    focus: focus("default", firstTabStop, { how: "Tab onto the chart's inspection stop" }),
    // The outer ring's 10 px stroke runs along the plot's edge (radial-bar-chart.shared.tsx `rOuter`): 5 px in from the top is on it.
    pressed: inspect("default", { mark: "svg", fx: 0.5, fy: 0, dy: 5 }, { mode: "click", how: "press-to-inspect: a press on the outer ring at 12 o'clock; the other rings dim" }),
  },
  "funnel-chart": {
    focus: focus("default", firstTabStop, { how: "Tab onto the chart's inspection stop" }),
    pressed: inspect("default", { text: "Signups" }, { mode: "click", how: "press-to-inspect: a press on the Signups stage; the other stages dim" }),
  },
  "radar-chart": { static: true, reason: CHART_STATIC },
  treemap: {
    focus: focus("default", firstTabStop, { how: "Tab onto the chart's inspection stop" }),
    pressed: inspect("default", { text: "Media" }, { mode: "click", expect: ["Media", "620"], how: "press-to-inspect: a press on the Media tile" }),
  },
  "geo-map": {
    // The zoomable map itself takes focus; its zoom buttons are kit Buttons it disables at the ends.
    focus: focus("zoomable", byRole("img", /^Sessions by city/)),
    pressed: inspect("default", { mark: "svg circle", index: 0 }, { mode: "click", how: "press-to-inspect: a press on the first bubble (the hit layer finds the bubble under the point); the others dim" }),
    disabled: disabled("zoomable", byRole("button", "Zoom out")),
  },
};

/** A component's recipes in capture order; none for a static component or one the table lacks. */
export function recipesOf(slug: string): StateRecipe[] {
  const entry = STATE_RECIPES[slug];
  if (!entry) return [];
  return STATE_NAMES.flatMap((state) => recipesIn(entry, state));
}

/**
 * A recipe's name among its component's, which names its cells (tools/audit/web-capture.ts
 * `stateCellId`): its state, or, for a state the component has more than one recipe of (a
 * Dropdown disabled on its trigger and on an item inside its menu), `<state>-<variant>`,
 * named for the example each is applied to; and `<state>-<variant>-inside` for the one
 * applied inside the overlay its example opens, beside one on that example's own surface
 * (Command's focus on its Search trigger, and on a row of the palette the trigger opens).
 * `siblings` are the component's recipes of the same state, the recipe among them.
 */
export function recipeName(recipe: Pick<StateRecipe, "state" | "variant" | "inOverlay">, siblings: readonly Pick<StateRecipe, "variant" | "inOverlay">[]): string {
  if (siblings.length <= 1) return recipe.state;
  const beside = siblings.some((other) => other !== recipe && other.variant === recipe.variant && !other.inOverlay);
  return `${recipe.state}-${recipe.variant}${recipe.inOverlay && beside ? "-inside" : ""}`;
}

/** An entry's recipes in capture order, each with its name (`recipeName`). */
export function namedRecipes(entry: ComponentStates): { name: string; recipe: StateRecipe }[] {
  return STATE_NAMES.flatMap((state) => {
    const recipes = recipesIn(entry, state);
    return recipes.map((recipe) => ({ name: recipeName(recipe, recipes), recipe }));
  });
}

/** A component's recipes in capture order, each with its name; none for one the table lacks. */
export function namedRecipesOf(slug: string): { name: string; recipe: StateRecipe }[] {
  const entry = STATE_RECIPES[slug];
  return entry ? namedRecipes(entry) : [];
}

/** What the capture's planner needs of a component's recipes (tools/audit/web-capture.ts `planStateCapture`). */
export function stateSpecsOf(slug: string): { name: string; state: StateName; variant: string; rows: readonly RowPlatform[]; widths: readonly WidthKey[] }[] {
  return namedRecipesOf(slug).map(({ name, recipe: { state, variant, rows, widths } }) => ({ name, state, variant, rows, widths }));
}

/**
 * What is wrong with a state table against the interaction registry's inventory and the
 * component pages: a registered component with no entry, an entry for a component the
 * registry does not list, a static entry with no reason or with recipes beside it, an entry
 * with neither recipes nor `static`, a recipe filed under another state's key, a recipe
 * naming an example its page does not have (`examplesOf` gives a page's variant keys, null
 * for a slug with no page), or two recipes of one state on the same example and in the same
 * place (its surface, or inside the overlay it opens), whose cells would share a name. Empty
 * when the table is whole.
 */
export function checkStateTable(
  registry: readonly string[],
  table: Record<string, ComponentStates>,
  examplesOf: (slug: string) => readonly string[] | null,
): string[] {
  const errors: string[] = [];
  for (const slug of registry) if (!(slug in table)) errors.push(`${slug}: in the interaction registry with neither state recipes nor static and a reason`);
  for (const [slug, entry] of Object.entries(table)) {
    if (!registry.includes(slug)) errors.push(`${slug}: has state recipes but is not in the interaction registry`);
    const states = STATE_NAMES.filter((state) => (entry as StateRecipes)[state] !== undefined);
    if (entry.static) {
      if (!entry.reason.trim()) errors.push(`${slug}: static with no reason`);
      if (states.length) errors.push(`${slug}: static, yet it has ${states.join(", ")} recipes`);
      continue;
    }
    if (!states.length) errors.push(`${slug}: neither state recipes nor static and a reason`);
    const examples = examplesOf(slug);
    for (const state of states) {
      const recipes = recipesIn(entry, state);
      if (!recipes.length) errors.push(`${slug}: the ${state} entry holds no recipe`);
      const seen = new Set<string>();
      for (const found of recipes) {
        if (found.state !== state) errors.push(`${slug}: the ${state} entry holds a ${found.state} recipe`);
        if (examples === null) errors.push(`${slug}: has a ${state} recipe but no component page`);
        else if (!examples.includes(found.variant)) errors.push(`${slug}: the ${state} recipe names the example "${found.variant}", which its page does not have`);
        if (!found.rows.length) errors.push(`${slug}: the ${state} recipe is applied from no row`);
        const place = `${found.variant}${found.inOverlay ? " inside" : ""}`;
        if (seen.has(place)) errors.push(`${slug}: two ${state} recipes name the example "${found.variant}", so their cells would share a name`);
        seen.add(place);
      }
    }
  }
  return errors;
}

/**
 * A component's recipe by its name (`recipeName`: the state, or `<state>-<variant>` for a
 * state it has several recipes of, `-inside` for one inside the overlay its example opens);
 * throws when it has none, since the planner only plans the ones it has.
 */
export function recipeFor(slug: string, name: string): StateRecipe {
  const found = namedRecipesOf(slug).find((r) => r.name === name);
  if (!found) {
    const several = namedRecipesOf(slug).filter((r) => r.recipe.state === name).map((r) => r.name);
    throw new Error(`state-recipes: ${slug} has no recipe named ${name}${several.length ? ` (its ${name} recipes are ${several.join(", ")})` : ""}`);
  }
  return found.recipe;
}
