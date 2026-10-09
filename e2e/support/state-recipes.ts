/**
 * How to put every interactive component into each interaction state it has, in one
 * place (the component audit's plan, 1d).
 *
 * overlay-recipes.ts answers one question for the e2e suite and lookout: how to open an
 * overlay. The audit asks the wider one per component: how to hover it, focus it, press
 * it, open it, find it invalid and find it disabled, and how to tell that it really is in
 * that state before it is photographed. Every component the interaction registry lists
 * (tools/interactions/registry.ts `inventory`) has an entry here: the recipes for the
 * states it has, or `static: true` with the reason it has none; and every recipe names
 * an example of its page. tools/audit/state-recipes.test.ts holds the table to both.
 *
 * A recipe has three steps, each through the input a person uses:
 *
 *   apply    hover: the pointer moves onto the control. focus: the Tab key, from the tab
 *            stop before the control. pressed: the pointer goes down on the control and
 *            stays down. open: the overlay recipes' own click (or a hover, for a
 *            tooltip), from the platform row the cell names. invalid: the example that
 *            shows an error, or typing past a limit. disabled: the example that disables
 *            the control.
 *   verify   reads the page and says whether the state was reached, with the structural
 *            evidence: for hover, what changed in the computed style of the control, its
 *            contents and its wrappers up to the row (the lift's transform and shade and
 *            the wash's background that src/style/hover.tsx applies are the hover; a
 *            control whose web skin declares none has no hover recipe); for focus, the
 *            node that took focus, whether it matches :focus-visible, the node that draws
 *            the ring and whether the ring shows on every side (e2e/support/focus-ring.ts
 *            `ringShows`); for pressed, what holding the pointer down changed against the
 *            hovered control; for open, the panel the opening added, where it painted,
 *            whether it runs edge to edge at the viewport's bottom (a sheet) and whether
 *            the trigger says it is expanded; `aria-invalid` and `aria-disabled` (or a
 *            native `disabled`) for the last two. A state verify cannot confirm is not
 *            reached: the capture records the cell as `state-not-reached` with the reason,
 *            and photographs nothing.
 *   release  takes the state away (the pointer moves off; focus blurs; a press is
 *            cancelled by moving off before the button comes up, and release checks that
 *            nothing toggled; an overlay closes on Escape) and reports how that went.
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

export interface Reached {
  reached: true;
  /** What verify read off the page that shows the state. */
  evidence: Record<string, unknown>;
  /** Defects the state shows, beside the probe's own flags. */
  flags: string[];
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
  release(scene: StateScene, applied: unknown): Promise<Record<string, unknown>>;
}

/** A component with no interaction state of its own, and why. */
export interface StaticEntry {
  static: true;
  reason: string;
}

export type StateRecipes = { static?: undefined } & { [K in StateName]?: StateRecipe };
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
  release(scene: StateScene, applied: A): Promise<Record<string, unknown>>;
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
      if (within && !("missing" in applied) && applied.opened) return { pointer: "moved off", ...(await openClose(within, scene, applied.opened)) };
      return { pointer: "moved off" };
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
      const flags = !node ? ["focus-ring-missing"] : shows ? [] : ["focus-ring-hidden"];
      if (node && !ring.themed) flags.push("focus-ring-colour");
      return { reached: true, evidence, flags };
    },
    async release(scene) {
      await scene.page.evaluate((key) => {
        (document.activeElement as HTMLElement | null)?.blur();
        delete (window as unknown as Record<string, unknown>)[key];
      }, EDGES_KEY);
      return { focus: "blurred" };
    },
  });
}

// --- Pressed -------------------------------------------------------------------------

type Pressed = { control: Locator; rest: StyleSnapshot; hovered: StyleSnapshot; toggles: Record<string, string | null> } | { missing: string };

/**
 * The pointer goes down on the control and stays down. Reached when holding it changed a
 * watched style against the hovered control just before: a press that looks like the
 * hover is no pressed state of its own, and the evidence says what the hover changed.
 * Released by moving off the control before the button comes up, which cancels the press;
 * release checks that the control's toggles and the page's address did not change.
 */
function pressed(variant: string, target: Target, how = "the pointer goes down on the control and is held"): StateRecipe {
  return recipe<Pressed>({
    state: "pressed",
    variant,
    rows: ["web"],
    widths: "desktop",
    frame: "row",
    how,
    async apply(scene) {
      const control = target(scene.row);
      const missing = await presence(control, "control to press");
      if (missing) return { missing };
      await scene.page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      const rest = await settledStyles(control);
      await control.hover();
      const hovered = await settledStyles(control);
      const toggles = await control.evaluate(readToggles);
      await scene.page.mouse.down();
      return { control, rest, hovered, toggles };
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
      await scene.page.mouse.move(NEUTRAL_POINT.x, NEUTRAL_POINT.y);
      await scene.page.mouse.up();
      if ("missing" in applied) return { pointer: "up" };
      await pause(150);
      const after = await applied.control.evaluate(readToggles).catch(() => null);
      const changed = after ? Object.keys(applied.toggles).filter((key) => applied.toggles[key] !== after[key]) : ["the control is gone"];
      return { pointer: "moved off, then up", cancelled: changed.length === 0, ...(changed.length ? { changed } : {}) };
    },
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
  steady?: (page: Page, scope: Locator, panel: Locator) => Promise<{ held: boolean; reason?: string; evidence: Record<string, unknown>; flags: string[] }>;
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
  const flags: string[] = [];
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

async function openClose(spec: OpenSpec, scene: StateScene, opened: Opened): Promise<Record<string, unknown>> {
  if ("missing" in opened) return {};
  if (spec.where === "announcement") return { closed: "a toast leaves by itself" };
  if (spec.close) await spec.close(scene.page, scene.row);
  else await scene.page.keyboard.press("Escape");
  const nodes = openNodes(spec, scene);
  const deadline = Date.now() + 3_000;
  let count = await nodes.count();
  while (count !== opened.before && Date.now() < deadline) {
    await pause(100);
    count = await nodes.count();
  }
  return { closed: count === opened.before, by: spec.close ? "its own close" : "Escape" };
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
      if ("missing" in applied || applied.typed === null) return {};
      await applied.control.fill("");
      await scene.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      return { cleared: true };
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
      return {};
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
async function followPointer(page: Page, trigger: Locator, bubble: Locator): Promise<{ held: boolean; reason?: string; evidence: Record<string, unknown>; flags: string[] }> {
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
const CHART_STATIC = "A chart with no control and no keyboard stop in any example: it displays data, and an inspected value is shown by an example that pins it.";

/**
 * Every component in the interaction registry: the states it has, each with the example it
 * is reached on, or why it has none. A component whose web skin declares hover feedback
 * (src/style/hover.tsx) has a hover recipe; an overlay opens from every row whose platform
 * build the docs registry injects (docs/src/core/platform-skins.ts).
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
    open: open("onhover", TOOLTIP_OPEN, ALL_ROWS, "the pointer rests on the On hover example's trigger, in the row"),
  },
  typography: { static: true, reason: "Text styles: they take no input." },
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
  feeds: { static: true, reason: "A read-only activity list: it takes no input." },
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
    open: open("default", overlay("dialog"), ALL_ROWS, viaRecipe("dialog")),
  },
  "drag-drop": {
    focus: focus("default", byRole("button", /^Reorder /)),
    disabled: disabled("lockeditem", byRole("button", /^Locked task/)),
  },
  drawer: {
    open: open("default", overlay("drawer"), ALL_ROWS, viaRecipe("drawer")),
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
  steps: { static: true, reason: "A progress display: its steps take no input." },
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
    // The iOS build is the web one (the docs registry injects no iOS Toast).
    open: open("default", TOAST_OPEN, ["web", "android"], "overlay-recipes.ts' TOAST_RECIPE (Show toast), from the row"),
  },

  // Charts
  chart: { static: true, reason: CHART_STATIC },
  "line-chart": { static: true, reason: "A chart with no control and no keyboard stop: its Press to inspect example inspects under a pointer only, which the native capture and the example's own resting picture show." },
  "area-chart": { static: true, reason: CHART_STATIC },
  "pie-chart": { focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop") },
  "scatter-plot": { focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop") },
  "candlestick-chart": { static: true, reason: "A chart with no control and no keyboard stop: its Press to inspect example inspects under a pointer only, which the native capture and the example's own resting picture show." },
  "depth-chart": { static: true, reason: CHART_STATIC },
  sparkline: { static: true, reason: CHART_STATIC },
  "stacked-bar": { static: true, reason: CHART_STATIC },
  gauge: { static: true, reason: CHART_STATIC },
  heatmap: { static: true, reason: "A chart whose day cells take a pointer only (no keyboard stop in any example); it displays data." },
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
  "composed-chart": { static: true, reason: CHART_STATIC },
  "range-area-chart": { static: true, reason: CHART_STATIC },
  histogram: { static: true, reason: CHART_STATIC },
  "box-plot": { static: true, reason: CHART_STATIC },
  "waterfall-chart": { static: true, reason: CHART_STATIC },
  "radial-bar-chart": { focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop") },
  "funnel-chart": { focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop") },
  "radar-chart": { static: true, reason: CHART_STATIC },
  treemap: { focus: focus("default", firstTabStop, "Tab onto the chart's inspection stop") },
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
