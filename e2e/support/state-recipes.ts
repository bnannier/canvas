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
 * focused look; tools/audit/state-coverage.ts checks that each has a recipe or an
 * exemption whose claim holds).
 *
 * A recipe has three steps, each through the input a person uses:
 *
 *   apply    hover: the pointer moves onto the control. focus: the Tab key, from the tab
 *            stop before the control. pressed: the pointer goes down on the control and
 *            stays down (a chart is pressed on one datum to inspect it). open: the
 *            overlay recipes' own click (or a hover, for a tooltip), from the platform
 *            row the cell names. invalid: the example that shows an error, or typing
 *            past a limit. disabled: the example that disables the control.
 *   verify   reads the page and says whether the state was reached, with the structural
 *            evidence: for hover, what changed in the computed style of the control, its
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
 *            is a flag like any other: `press-not-cancelled` (the row's accessibility tree,
 *            the address, or the pressed control's computed look or pixels differ from
 *            before the press), `press-selects-label` (dragging off the control selected
 *            its own label's text), `inspection-not-cleared` and `overlay-not-closed`.
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
import type { JSHandle, Locator, Page } from "@playwright/test";
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
  "press-not-cancelled": "moving off before the button came up did not cancel the press: the row's tree, the address, or the control's look or pixels changed",
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
  /** The node the state opened (a menu, a dialog, a sheet, a bubble), probed beside the row. */
  panel?: Locator;
}

export interface NotReached {
  reached: false;
  /** Why the state could not be confirmed, in a sentence. */
  reason: string;
  evidence: Record<string, unknown>;
}

export type Verdict = Reached | NotReached;

export interface StateRecipe {
  state: StateName;
  /** The example it is applied to: a variant key of the component's page (`default` for the Usage fence). */
  variant: string;
  /** The platform rows it is applied from. */
  rows: readonly RowPlatform[];
  /** The widths it is captured at: the desktop alone, or all three, since an overlay becomes a sheet on a phone. */
  widths: "desktop" | "all";
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
 *                  passes any of them, so no example shows the state.
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

export type StateRecipes = { static?: undefined; exempt?: Exemptions } & { [K in StateName]?: StateRecipe };
export type ComponentStates = StaticEntry | StateRecipes;

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
async function settledStyles(control: Locator, timeoutMs = 2_000, holdMs = 200): Promise<StyleSnapshot> {
  const read = () => control.evaluate(readStyles, WATCHED);
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

/** A locator inside a scope: the control a recipe acts on. */
type Target = (scope: Locator) => Locator;
type Role = Parameters<Locator["getByRole"]>[0];

/** The first node of a role inside the scope, by its exact accessible name when a string names it. */
const byRole =
  (role: Role, name?: string | RegExp): Target =>
  (scope) =>
    scope.getByRole(role, name === undefined ? {} : { name, exact: typeof name === "string" }).first();

/** The scope's first keyboard stop that names no role (a chart's inspection stop, a bare Pressable). */
const firstTabStop: Target = (scope) => scope.locator('[tabindex="0"]').first();

async function describeTarget(control: Locator): Promise<string> {
  return control.evaluate(describeElement);
}

/** The node is there and has a box, or the reason it does not. */
async function presence(control: Locator, what: string): Promise<string | null> {
  if ((await control.count()) === 0) return `the example shows no ${what}`;
  if (!(await control.isVisible())) return `the example's ${what} is not visible`;
  return null;
}

const NEUTRAL_POINT = { x: 1, y: 1 };

/** A recipe whose steps share one typed hand-off; erased to the table's shape. */
function recipe<A>(r: Omit<StateRecipe, "apply" | "verify" | "release"> & {
  apply(scene: StateScene): Promise<A>;
  verify(scene: StateScene, applied: A): Promise<Verdict>;
  release(scene: StateScene, applied: A): Promise<Released>;
}): StateRecipe {
  return r as unknown as StateRecipe;
}

const notReached = (reason: string, evidence: Record<string, unknown> = {}): NotReached => ({ reached: false, reason, evidence });

// --- Hover ---------------------------------------------------------------------------

type Hovered = { control: Locator; rest: StyleSnapshot; opened?: Opened } | { missing: string };

/**
 * The pointer rests on the control. Reached when the control, its contents or its
 * wrappers changed one of the properties the kit's hover feedback changes; the evidence
 * lists every watched property that changed.
 */
function hover(variant: string, target: Target, options: { within?: OpenSpec; how?: string } = {}): StateRecipe {
  const within = options.within;
  return recipe<Hovered>({
    state: "hover",
    variant,
    rows: ["web"],
    widths: "desktop",
    frame: within ? "viewport" : "row",
    how: options.how ?? "the pointer moves onto the control and rests there",
    async apply(scene) {
      let scope = scene.row;
      let opened: Opened | undefined;
      if (within) {
        opened = await openApply(within, scene);
        const verdict = await openVerify(within, scene, opened);
        if (!verdict.reached) return { missing: `the overlay the hover is read in did not open: ${verdict.reason}` };
        scope = verdict.panel!;
      }
      const control = target(scope);
      const missing = await presence(control, "control to hover");
      if (missing) return { missing };
      await scene.page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const rest = await settledStyles(control);
      await control.hover();
      return { control, rest, opened };
    },
    async verify(_scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      const now = await settledStyles(applied.control);
      const { changes, structure } = diffStyles(applied.rest, now);
      const evidence = { control: await describeTarget(applied.control), changes: changes.slice(0, 40), structure };
      if (!changes.some((change) => HOVER_PROPERTIES.has(change.property))) {
        return notReached(
          `the pointer on ${evidence.control} changed none of ${[...HOVER_PROPERTIES].join(", ")} on the control, its contents or its wrappers up to the row` +
            (changes.length ? ` (it changed ${[...new Set(changes.map((c) => c.property))].join(", ")})` : ""),
          evidence,
        );
      }
      return { reached: true, evidence, flags: [] };
    },
    async release(scene, applied) {
      await scene.page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      if (within && !("missing" in applied) && applied.opened) {
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
function findRing(args: { ring: string; key: string }): RingNode {
  const none = (drawnBy: string): RingNode => ({ node: null, how: "none", color: null, painted: null, themed: false, drawnBy });
  const active = document.activeElement;
  if (!active) return none("nothing is focused");
  const row = active.closest("[data-platform-row]") ?? document.body;
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

type Focused = { control: Locator; from: string | null; expected: string } | { missing: string };

/**
 * The Tab key lands on the control from the tab stop before it, as a keyboard user
 * reaches it. Reached when focus is on (or inside) the control and matches
 * :focus-visible; the ring is then found and checked in the pixels on every side.
 */
function focus(variant: string, target: Target, how = "Tab from the tab stop before the control"): StateRecipe {
  return recipe<Focused>({
    state: "focus",
    variant,
    rows: ["web"],
    widths: "desktop",
    frame: "row",
    how,
    async apply(scene) {
      const control = target(scene.row);
      const missing = await presence(control, "control to focus");
      if (missing) return { missing };
      const before = await control.evaluate(focusTabStopBefore);
      if ("missing" in before) return before;
      // How the row draws its edges with focus on the stop before, so verify can tell
      // which node the arriving focus changed.
      await scene.row.evaluate(rememberEdges, EDGES_KEY);
      await scene.page.keyboard.press("Tab");
      return { control, ...before };
    },
    async verify(scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      const state = await applied.control.evaluate(readFocus);
      const evidence: Record<string, unknown> = { from: applied.from ?? "the start of the page", expected: applied.expected, active: state.active, focusVisible: state.visible };
      if (!state.inside) return notReached(`Tab from ${applied.from ?? "the start of the page"} moved focus to ${state.active}, not into the control (${applied.expected})`, evidence);
      if (!state.visible) return notReached(`${state.active} took focus from the Tab key but does not match :focus-visible`, evidence);
      // The ring is checked where the control is on screen. The card is fitted and centred
      // before the Tab, so the control is in view unless the Tab scrolled it; only then is it
      // brought back, since scrolling the page under something the focus opened in the
      // window's layer (an autocomplete's list) would leave that behind, over the field.
      await applied.control.evaluate((node) => {
        const box = node.getBoundingClientRect();
        if (box.top < 0 || box.left < 0 || box.bottom > window.innerHeight || box.right > window.innerWidth) node.scrollIntoView({ block: "center", inline: "nearest" });
      });
      const handle: JSHandle<RingNode> = await scene.page.evaluateHandle(findRing, { ring: scene.ring, key: EDGES_KEY });
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
      return { reached: true, evidence, flags };
    },
    async release(scene) {
      await scene.page.evaluate((key) => {
        (document.activeElement as HTMLElement | null)?.blur();
        delete (window as unknown as Record<string, unknown>)[key];
      }, EDGES_KEY);
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
interface PressRecord {
  aria: string;
  location: string;
  styles: StyleSnapshot;
  /** The control's pixels, PNG; null when it could not be photographed. */
  shot: Buffer | null;
  /** The element focus is on, as a reviewer would name it. */
  focus: string;
}

async function pressRecord(page: Page, scope: Locator, control: Locator): Promise<PressRecord> {
  const styles = await settledStyles(control);
  return {
    aria: await scope.ariaSnapshot({ timeout: 5_000 }).catch(() => "(the scope is gone)"),
    location: await page.evaluate(() => location.pathname + location.search),
    styles,
    shot: await control.screenshot({ animations: "disabled", caret: "hide", timeout: 5_000 }).catch(() => null),
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

/** What differs between two records of the same control: nothing when the press left no trace. */
async function pressTrace(page: Page, before: PressRecord, after: PressRecord): Promise<string[]> {
  const trace: string[] = [];
  if (before.aria !== after.aria) trace.push("the accessibility tree of the row changed (its states, values or names)");
  if (before.location !== after.location) trace.push(`the page moved from ${before.location} to ${after.location}`);
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
  | { control: Locator; scope: Locator; point: Point; rest: StyleSnapshot; hovered: StyleSnapshot; before: PressRecord; opened?: Opened }
  | { missing: string; opened?: Opened };

interface PressOptions {
  how?: string;
  /**
   * How the press ends. `move-off` (the default): the pointer leaves the control before
   * the button comes up, which cancels a press on every platform. `in-place`: the button
   * comes up where it went down, for a slider's thumb or a drag handle, which a move would
   * drag; a press that does not move changes nothing there.
   */
  release?: "move-off" | "in-place";
  /** Where the pointer goes down, when not on the control itself (a slider's thumb inside the slider). */
  at?: Target;
  /** An overlay opened first: the control is found and pressed inside it, and it is closed after. */
  within?: OpenSpec;
}

/**
 * The pointer goes down on the control and stays down. Reached when holding it changed a
 * watched style against the hovered control just before: a press that looks like the
 * hover is no pressed state of its own, and the evidence says what the hover changed.
 *
 * Released as the press ends without taking effect (see `PressOptions.release`), and then
 * measured: with the pointer away again, the row's (or the overlay's) accessibility tree,
 * the page's address, and the pressed control's computed look and pixels must be what
 * they were before the press. Anything that differs is listed and flags the cell
 * `press-not-cancelled`, whether the control announces a state or not. Text the drag off
 * the control selected is recorded and cleared first (`press-selects-label` when it takes
 * in the control's own label, as a native button's label never is).
 */
function pressed(variant: string, target: Target, options: PressOptions = {}): StateRecipe {
  const { within } = options;
  const ends = options.release ?? "move-off";
  return recipe<Pressed>({
    state: "pressed",
    variant,
    rows: ["web"],
    widths: "desktop",
    frame: within ? "viewport" : "row",
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
      const control = target(scope);
      const missing = await presence(control, "control to press");
      if (missing) return { missing, opened };
      await page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const before = await pressRecord(page, scope, control);
      const point = await middleOf(options.at ? options.at(scope) : control);
      if (!point) return { missing: "the place to press has no box", opened };
      await page.mouse.move(point.x, point.y);
      const hovered = await settledStyles(control);
      await page.mouse.down();
      return { control, scope, point, rest: before.styles, hovered, before, opened };
    },
    async verify(_scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      // Short of a long press (500 ms): the settle reads every 50 ms and holds 200.
      const now = await settledStyles(applied.control, 400, 200);
      const { changes, structure } = diffStyles(applied.hovered, now);
      const hover = [...new Set(diffStyles(applied.rest, applied.hovered).changes.map((c) => c.property))];
      const evidence = { control: await describeTarget(applied.control), changes: changes.slice(0, 40), structure, hoverChanged: hover };
      if (!changes.length && !structure) {
        return notReached(
          `holding the pointer down on ${evidence.control} changed no watched style against the hovered control` +
            (hover.length ? ` (its pressed look is its hover look, which changed ${hover.join(", ")})` : " (and the hover changed none either)"),
          evidence,
        );
      }
      return { reached: true, evidence, flags: [] };
    },
    async release(scene, applied) {
      const { page } = scene;
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
      // A pointer dragged off a control with the button down selects text on the way, as on
      // any page. That is the page's doing, not the press's: it is recorded (and flagged when
      // the selection takes in the control's own label), then cleared, so the comparison below
      // is of the control alone.
      const selection = await applied.control.evaluate(takeSelection);
      const after = await pressRecord(page, applied.scope, applied.control);
      const trace = await pressTrace(page, applied.before, after);
      const closed = await close();
      const flags: ReleaseFlag[] = [];
      if (trace.length) flags.push("press-not-cancelled");
      if (selection?.label) flags.push("press-selects-label");
      return {
        report: {
          pointer,
          cancelled: trace.length === 0,
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
    rows: ["web"],
    widths: "desktop",
    frame: "row",
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
function hoverInspect(variant: string, where: PlotPoint, options: { expect?: readonly string[]; how: string }): StateRecipe {
  return recipe<Inspected>({
    state: "hover",
    variant,
    rows: ["web"],
    widths: "desktop",
    frame: "row",
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
  /** The ARIA role the opened node carries. */
  role: string;
  /** How many nodes of that role one opening adds. */
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
}

type Opened = { before: number; said: string[]; expanded: string | null } | { missing: string };

/** The nodes an opening is counted among. */
function openNodes(spec: OpenSpec, scene: StateScene): Locator {
  const { page } = scene;
  if (spec.where === "row") return scene.row.getByRole(spec.role as Role);
  if (spec.where === "announcement") return page.getByRole("status").filter({ hasText: /\S/ });
  // The stage's own host holds what portals into the Playground's outlet; outside the page
  // scroller is the window's layer and a document-root Modal. A Do/Don't card pinned open
  // paints in the page's own outlet, inside the scroller but outside the stage, so it is
  // never counted.
  return scene.stage.locator("..").getByRole(spec.role as Role).or(page.getByRole(spec.role as Role).and(page.locator(":not([data-page-scroll] *)")));
}

async function openApply(spec: OpenSpec, scene: StateScene): Promise<Opened> {
  const trigger = spec.trigger(scene.page, scene.row);
  const missing = await presence(trigger, `trigger in the ${scene.platform} row`);
  if (missing) return { missing };
  await trigger.evaluate((node) => node.scrollIntoView({ block: "center", inline: "nearest" }));
  const nodes = openNodes(spec, scene);
  const before = await nodes.count();
  const said = spec.where === "announcement" ? await nodes.allInnerTexts() : [];
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
  const nodes = openNodes(spec, scene);
  const want = opened.before + spec.adds;
  let after = opened.before;
  const deadline = Date.now() + 5_000;
  for (;;) {
    after = await nodes.count();
    if (after >= want || Date.now() > deadline) break;
    await pause(100);
  }
  const evidence: Record<string, unknown> = { role: spec.role, where: spec.where ?? "overlay", before: opened.before, after };
  if (after !== want) {
    evidence.roles = await scene.page.evaluate(countRoles);
    return notReached(`opening from the ${scene.platform} row added ${after - opened.before} ${spec.role} node(s) where ${spec.adds} was expected`, evidence);
  }
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
    if (!steady.held) return notReached(steady.reason ?? `the ${spec.role} did not stay open`, evidence);
  }
  try {
    await panel.waitFor({ state: "visible", timeout: 3_000 });
  } catch {
    return notReached(`the ${spec.role} the opening added is not visible`, evidence);
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
  if (spec.close) await spec.close(scene.page, scene.row);
  else await scene.page.keyboard.press("Escape");
  const nodes = openNodes(spec, scene);
  const deadline = Date.now() + 3_000;
  let count = await nodes.count();
  while (count !== opened.before && Date.now() < deadline) {
    await pause(100);
    count = await nodes.count();
  }
  const closed = count === opened.before;
  const by = spec.close ? "its own close" : "Escape";
  return {
    report: { closed, by, ...(closed ? {} : { left: `${count - opened.before} ${spec.role} node(s) still open 3 s after ${by}` }) },
    flags: closed ? [] : ["overlay-not-closed"],
  };
}

/** Opening the overlay from each named row, at every width (an overlay becomes a sheet on a phone). */
function open(variant: string, spec: OpenSpec, rows: readonly RowPlatform[], how: string): StateRecipe {
  return recipe<Opened>({
    state: "open",
    variant,
    rows,
    widths: "all",
    frame: "viewport",
    how,
    apply: (scene) => openApply(spec, scene),
    verify: (scene, opened) => openVerify(spec, scene, opened),
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
    rows: ["web"],
    widths: "desktop",
    frame: "row",
    how: options.how ?? "the example that shows the control's error",
    async apply(scene) {
      const control = target(scene.row);
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

type Disabled = { control: Locator } | { missing: string };

/** The example that disables the control. Reached when it carries aria-disabled="true" or a native `disabled`. */
function disabled(variant: string, target: Target, how = "the example that disables the control"): StateRecipe {
  return recipe<Disabled>({
    state: "disabled",
    variant,
    rows: ["web"],
    widths: "desktop",
    frame: "row",
    how,
    async apply(scene) {
      const control = target(scene.row);
      const missing = await presence(control, "control the example disables");
      return missing ? { missing } : { control };
    },
    async verify(_scene, applied) {
      if ("missing" in applied) return notReached(applied.missing);
      const read = await applied.control.evaluate(readDisabled);
      const evidence = { control: await describeTarget(applied.control), ...read };
      if (read.ariaDisabled !== "true" && !read.nativeDisabled) {
        return notReached(`${evidence.control} carries neither aria-disabled="true" nor a native disabled${read.readOnly ? " (it is read-only)" : ""}`, evidence);
      }
      // A disabled control the Tab key still stops on is announced and reachable, but inert.
      return { reached: true, evidence, flags: read.tabIndex >= 0 && !read.nativeDisabled ? ["disabled-tab-stop"] : [] };
    },
    async release() {
      return { report: {}, flags: [] };
    },
  });
}

// --- The overlays ----------------------------------------------------------------------

const overlay = (slug: string): OverlayRecipe => {
  const found = MATERIAL_OVERLAY_RECIPES.find((r) => r.slug === slug);
  if (!found) throw new Error(`state-recipes: overlay-recipes.ts has no recipe for ${slug}`);
  return found;
};

/** The rows an overlay opens from: the web row, and each platform whose docs registry injects the component's own build. */
const ALL_ROWS: readonly RowPlatform[] = ["web", "ios", "android"];

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
    disabled: disabled("disabled", (row) => row.locator("[aria-disabled]").first()),
  },
  image: { static: true, reason: "An image: it takes no input." },
  "text-input": {
    focus: focus("default", byRole("textbox")),
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
    pressed: pressed("default", byRole("option", "Ada Lovelace"), { within: overlay("autocomplete"), how: "the list opens (a click and a typed letter), then the pointer goes down on its first option and is held" }),
    open: open("default", overlay("autocomplete"), ALL_ROWS, `${viaRecipe("autocomplete")}: the field takes a click and a typed letter`),
    disabled: disabled("disabled", byRole("combobox")),
  },
  avatar: {
    hover: hover("accountmenu", byRole("button", /^Rachel Chen,/), { how: "the pointer rests on the AvatarMenu pill" }),
    focus: focus("accountmenu", byRole("button", /^Rachel Chen,/)),
    pressed: pressed("accountmenu", byRole("button", /^Rachel Chen,/)),
    open: open("accountmenu", AVATAR_MENU_OPEN, ALL_ROWS, "a click on the AvatarMenu pill, from the row"),
    disabled: disabled("disabledmenu", byRole("button", /^Ada Lovelace,/)),
  },
  badge: { static: true, reason: "A status label: it takes no input." },
  breadcrumb: {
    focus: focus("default", byRole("link", "Projects")),
    pressed: pressed("default", byRole("link", "Projects")),
  },
  "button-group": {
    focus: focus("default", byRole("tablist")),
    pressed: pressed("default", byRole("tab", "Week")),
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
    focus: focus("default", byRole("button", "Actions")),
    pressed: pressed("default", byRole("button", "Actions")),
    open: open("default", overlay("dropdown"), ALL_ROWS, viaRecipe("dropdown")),
    disabled: disabled("disabledtrigger", byRole("button", "Actions")),
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
    focus: focus("default", byRole("listbox")),
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
    focus: focus("default", byRole("radiogroup")),
    pressed: pressed("default", byRole("radio", "Hobby")),
  },
  reveal: { static: true, reason: "An entrance transition around its content: it takes no input." },
  select: {
    focus: focus("default", byRole("button", "Country")),
    pressed: pressed("default", byRole("button", "Country")),
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
      at: (scope) => scope.getByRole("slider").first().locator(":scope > *").last(),
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
    focus: focus("onhover", byRole("button", "Hover me")),
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
    focus: focus("default", byRole("button", "Export")),
    pressed: pressed("default", byRole("button", "Export")),
  },
  alert: {
    focus: focus("dismissible", byRole("button", "Dismiss")),
    pressed: pressed("dismissible", byRole("button", "Dismiss")),
  },
  "alert-dialog": {
    pressed: pressed("default", byRole("button", "Cancel"), { within: overlay("alert-dialog") }),
    open: open("default", overlay("alert-dialog"), ALL_ROWS, viaRecipe("alert-dialog")),
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
    focus: focus("inlineedit", byRole("button", "Update Name")),
    pressed: pressed("inlineedit", byRole("button", "Update Name")),
  },
  field: {
    focus: focus("default", byRole("textbox", "Email")),
    invalid: invalid("error", byRole("textbox", "Email")),
  },
  "empty-state": { static: true, reason: "A message block: it takes no input (the Action example's control is a Button, whose states the button recipes capture)." },
  feeds: {
    static: true,
    reason: "An activity list whose rows are read-only in every rail example.",
    exempt: { pressed: unpassed("`onItemPress` makes each row a button; no rail example passes it.", "onItemPress") },
  },
  form: {
    focus: focus("default", byRole("textbox", "Email")),
    invalid: invalid("creditcardwitherrors", byRole("textbox", "Card Number")),
  },
  "grid-lists": {
    focus: focus("tappable", byRole("button", /^RC/)),
    pressed: pressed("tappable", byRole("button", /^RC/)),
  },
  "media-objects": {
    focus: focus("tappable", byRole("button", "Rachel Chen")),
    pressed: pressed("tappable", byRole("button", "Rachel Chen")),
  },
  "phone-input": {
    focus: focus("default", byRole("textbox", "Phone number")),
    pressed: pressed("default", byRole("button", /^Country,/)),
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
    pressed: pressed("default", byRole("button", "Take Photo"), { within: overlay("action-sheet") }),
    open: open("default", overlay("action-sheet"), ALL_ROWS, viaRecipe("action-sheet")),
  },
  board: {
    focus: focus("cardmenusandpress", byRole("button", /^Rotate webhook/)),
    pressed: pressed("cardmenusandpress", byRole("button", /^Rotate webhook/)),
  },
  calendar: {
    focus: focus("default", byRole("button", /^1(?:,|$)/)),
    pressed: pressed("default", byRole("button", /^2(?:,|$)/)),
  },
  carousel: {
    focus: focus("default", byRole("button", "Next slide")),
    pressed: pressed("default", byRole("button", "Next slide")),
  },
  command: {
    // Its rows take the active highlight under a resting pointer (onHoverIn); the first is active already.
    hover: hover("default", byRole("option", /^Open File/), { within: overlay("command"), how: "the palette opens, then the pointer rests on its second row" }),
    focus: focus("default", byRole("button", /^Search/)),
    pressed: pressed("default", byRole("button", /^Search/)),
    open: open("default", overlay("command"), ALL_ROWS, viaRecipe("command")),
  },
  "dashboard-grid": {
    focus: focus("customizemode", byRole("button", /^Reorder /)),
  },
  "data-table": {
    focus: focus("sortable", byRole("columnheader", /^Email/)),
    pressed: pressed("sortable", byRole("columnheader", /^Email/)),
  },
  dialog: {
    pressed: pressed("default", byRole("button", "Cancel"), { within: overlay("dialog") }),
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
    focus: focus("default", byRole("button", "Clear")),
    pressed: pressed("default", byRole("checkbox", /^Active/)),
  },
  navbars: {
    focus: focus("default", byRole("link", "Dashboard")),
    pressed: pressed("default", byRole("link", "Users")),
  },
  sidebar: {
    hover: hover("default", byRole("button", "Dashboard")),
    focus: focus("default", byRole("button", "Dashboard")),
    pressed: pressed("default", byRole("button", /^Inbox/)),
  },
  "row-menu": {
    hover: hover("default", byRole("button", "More options")),
    focus: focus("default", byRole("button", "More options")),
    pressed: pressed("default", byRole("button", "More options")),
    open: open("default", overlay("row-menu"), ALL_ROWS, viaRecipe("row-menu")),
  },
  steps: {
    static: true,
    reason: "A progress display whose step circles are plain in every rail example.",
    exempt: { pressed: unpassed("`onStepPress` makes each circle a button; no rail example passes it.", "onStepPress") },
  },
  "tab-bar": {
    focus: focus("default", byRole("tablist")),
    pressed: pressed("default", byRole("tab", "Search")),
  },
  tabs: {
    focus: focus("default", byRole("tablist")),
    pressed: pressed("default", byRole("tab", "Security")),
    disabled: disabled("disabledtab", byRole("tab", "Billing")),
  },
  toast: {
    // The With an action example renders its toast in the row, with its action button.
    pressed: pressed("withanaction", byRole("button", "Undo")),
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
    focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop"),
    // The first slice runs clockwise from 12 o'clock past 3: the plot's right middle is in it.
    pressed: inspect("default", { mark: "svg", fx: 0.75, fy: 0.5 }, { mode: "click", how: "press-to-inspect: a press on the first slice (the plot's right middle); the other slices dim" }),
  },
  "scatter-plot": {
    focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop"),
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
    focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop"),
    // The outer ring's 10 px stroke runs along the plot's edge (radial-bar-chart.shared.tsx `rOuter`): 5 px in from the top is on it.
    pressed: inspect("default", { mark: "svg", fx: 0.5, fy: 0, dy: 5 }, { mode: "click", how: "press-to-inspect: a press on the outer ring at 12 o'clock; the other rings dim" }),
  },
  "funnel-chart": {
    focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop"),
    pressed: inspect("default", { text: "Signups" }, { mode: "click", how: "press-to-inspect: a press on the Signups stage; the other stages dim" }),
  },
  "radar-chart": { static: true, reason: CHART_STATIC },
  treemap: {
    focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop"),
    pressed: inspect("default", { text: "Media" }, { mode: "click", expect: ["Media", "620"], how: "press-to-inspect: a press on the Media tile" }),
  },
  "geo-map": {
    focus: focus("zoomable", byRole("button", "Zoom in")),
    pressed: pressed("zoomable", byRole("button", "Zoom in")),
    disabled: disabled("zoomable", byRole("button", "Zoom out")),
  },
};

/** A component's recipes in capture order; none for a static component or one the table lacks. */
export function recipesOf(slug: string): StateRecipe[] {
  const entry = STATE_RECIPES[slug];
  if (!entry || entry.static) return [];
  const recipes = entry as StateRecipes;
  return STATE_NAMES.flatMap((state) => (recipes[state] ? [recipes[state]!] : []));
}

/** What the capture's planner needs of a component's recipes (tools/audit/web-capture.ts `planStateCapture`). */
export function stateSpecsOf(slug: string): { state: StateName; variant: string; rows: readonly RowPlatform[]; widths: "desktop" | "all" }[] {
  return recipesOf(slug).map(({ state, variant, rows, widths }) => ({ state, variant, rows, widths }));
}

/**
 * What is wrong with a state table against the interaction registry's inventory and the
 * component pages: a registered component with no entry, an entry for a component the
 * registry does not list, a static entry with no reason or with recipes beside it, an entry
 * with neither recipes nor `static`, a recipe filed under another state's key, or a recipe
 * naming an example its page does not have (`examplesOf` gives a page's variant keys, null
 * for a slug with no page). Empty when the table is whole.
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
    const recipes = STATE_NAMES.filter((state) => (entry as StateRecipes)[state] !== undefined);
    if (entry.static) {
      if (!entry.reason.trim()) errors.push(`${slug}: static with no reason`);
      if (recipes.length) errors.push(`${slug}: static, yet it has ${recipes.join(", ")} recipes`);
      continue;
    }
    if (!recipes.length) errors.push(`${slug}: neither state recipes nor static and a reason`);
    const examples = examplesOf(slug);
    for (const state of recipes) {
      const found = (entry as StateRecipes)[state]!;
      if (found.state !== state) errors.push(`${slug}: the ${state} entry holds a ${found.state} recipe`);
      if (examples === null) errors.push(`${slug}: has a ${state} recipe but no component page`);
      else if (!examples.includes(found.variant)) errors.push(`${slug}: the ${state} recipe names the example "${found.variant}", which its page does not have`);
      if (!found.rows.length) errors.push(`${slug}: the ${state} recipe is applied from no row`);
    }
  }
  return errors;
}

/** A component's recipe for one state; throws when it has none, since the planner only plans the ones it has. */
export function recipeFor(slug: string, state: StateName): StateRecipe {
  const found = recipesOf(slug).find((r) => r.state === state);
  if (!found) throw new Error(`state-recipes: ${slug} has no ${state} recipe`);
  return found;
}
