// The interaction-state recipes (e2e/support/state-recipes.ts) against what they must
// cover: every component the interaction registry lists has recipes or a reason it has
// none, every recipe names an example its page has, every component whose web skin
// declares hover feedback has a hover recipe, every overlay the e2e suite opens (and
// Tooltip and AvatarMenu, which it never opens) has an open recipe, and an overlay opens
// from exactly the rows whose platform build the docs registry injects.
import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { MATERIAL_OVERLAY_RECIPES, TOAST_RECIPE } from "../../e2e/support/overlay-recipes.ts";
import { ROOT } from "../../e2e/support/routes.ts";
import {
  HOVER_PROPERTIES,
  STATE_NAMES,
  STATE_RECIPES,
  checkStateTable,
  recipeFor,
  recipesOf,
  stateSpecsOf,
  type ComponentStates,
  type StateRecipe,
} from "../../e2e/support/state-recipes.ts";
import { inventory as registry } from "../interactions/registry.ts";
import { registeredSkins } from "../skins/registry.ts";
import { components } from "./inventory.ts";
import { parseWebFilters, planStateCapture } from "./web-capture.ts";

const pages = components();
const examplesOf = (slug: string) => pages.find((c) => c.slug === slug)?.variants.map((v) => v.variant) ?? null;

/** The export whose platform builds an open recipe's rows follow, per component that opens something. */
const OPENED_EXPORT: Record<string, string> = {
  dialog: "Dialog",
  "alert-dialog": "AlertDialog",
  popover: "Popover",
  dropdown: "Dropdown",
  "row-menu": "RowMenu",
  select: "Select",
  autocomplete: "Autocomplete",
  command: "Command",
  "action-sheet": "ActionSheet",
  drawer: "Drawer",
  "phone-input": "PhoneInput",
  tooltip: "Tooltip",
  avatar: "AvatarMenu",
  toast: "Toast",
};

/** The components whose own source reads the hover primitive (src/style/hover.tsx `useHover`). */
function hoverDeclarers(): string[] {
  const reads = /import\s*\{[^}]*\buseHover\b[^}]*\}\s*from\s*["']\.\.\/\.\.\/style\/hover\.js["']/;
  return pages
    .filter((c) => {
      const dir = join(ROOT, "src", c.category.toLowerCase(), c.dir);
      let files: string[];
      try {
        files = readdirSync(dir).filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f));
      } catch {
        return false;
      }
      return files.some((f) => reads.test(readFileSync(join(dir, f), "utf8")));
    })
    .map((c) => c.slug)
    .sort();
}

describe("the state recipe table", () => {
  it("covers every component in the interaction registry, each with recipes or a reason, every recipe on an example its page has", () => {
    expect(checkStateTable(registry, STATE_RECIPES, examplesOf)).toEqual([]);
    expect(Object.keys(STATE_RECIPES).sort()).toEqual([...registry].sort());
  });

  it("fails an interactive entry with neither recipes nor static and a reason", () => {
    const button = STATE_RECIPES.button!;
    const table: Record<string, ComponentStates> = { button, badge: { static: true, reason: " " }, chip: {} };
    expect(checkStateTable(["button", "badge", "chip", "switch"], table, examplesOf)).toEqual([
      "switch: in the interaction registry with neither state recipes nor static and a reason",
      "badge: static with no reason",
      "chip: neither state recipes nor static and a reason",
    ]);
  });

  it("fails a recipe on an example the page does not have, or filed under another state", () => {
    const hover = (STATE_RECIPES.button as { hover: StateRecipe }).hover;
    const focus = (STATE_RECIPES.button as { focus: StateRecipe }).focus;
    const table: Record<string, ComponentStates> = { button: { hover: { ...hover, variant: "nosuchexample" }, pressed: focus } };
    expect(checkStateTable(["button"], table, examplesOf)).toEqual([
      'button: the hover recipe names the example "nosuchexample", which its page does not have',
      "button: the pressed entry holds a focus recipe",
    ]);
  });

  it("has a hover recipe for exactly the components whose web skin declares hover feedback", () => {
    const withHover = Object.keys(STATE_RECIPES).filter((slug) => recipesOf(slug).some((r) => r.state === "hover")).sort();
    expect(hoverDeclarers()).toEqual(["avatar", "button", "card", "dropdown", "listbox", "pagination", "row-menu", "sidebar"]);
    expect(withHover).toEqual(hoverDeclarers());
    // The hover is judged by what src/style/hover.tsx changes: the lift and the wash.
    expect([...HOVER_PROPERTIES].sort()).toEqual(["background-color", "box-shadow", "scale", "transform", "translate"]);
  });

  it("opens every overlay the e2e suite opens, and Tooltip and AvatarMenu, which it never does", () => {
    const opens = Object.keys(STATE_RECIPES).filter((slug) => recipesOf(slug).some((r) => r.state === "open")).sort();
    const overlays = [...MATERIAL_OVERLAY_RECIPES.map((r) => r.slug), TOAST_RECIPE.slug];
    for (const slug of overlays) expect(opens).toContain(slug);
    expect(opens).toContain("tooltip");
    expect(opens).toContain("avatar");
    expect(opens).toEqual(Object.keys(OPENED_EXPORT).sort());
  });

  it("opens each overlay from the web row and from every row whose platform build the docs registry injects", () => {
    const registered = registeredSkins(readFileSync(join(ROOT, "docs/src/core/platform-skins.ts"), "utf8"));
    for (const [slug, name] of Object.entries(OPENED_EXPORT)) {
      const expected = ["web", ...(["ios", "android"] as const).filter((platform) => registered[platform].has(name))];
      expect({ slug, rows: [...recipeFor(slug, "open").rows] }).toEqual({ slug, rows: expected });
    }
    // Toast has no iOS build of its own: its iOS row is the web one.
    expect([...recipeFor("toast", "open").rows]).toEqual(["web", "android"]);
  });

  it("captures hover, focus, pressed, invalid and disabled at the desktop in the row, and open at every width in the viewport", () => {
    for (const slug of Object.keys(STATE_RECIPES)) {
      for (const recipe of recipesOf(slug)) {
        const where = { slug, state: recipe.state, widths: recipe.widths, frame: recipe.frame };
        if (recipe.state === "open") expect(where).toEqual({ slug, state: "open", widths: "all", frame: "viewport" });
        else if (recipe.state === "hover" && recipe.frame === "viewport") expect(where.widths).toBe("desktop");
        else expect(where).toEqual({ slug, state: recipe.state, widths: "desktop", frame: "row" });
        if (recipe.state !== "open") expect([...recipe.rows]).toEqual(["web"]);
        expect(recipe.how.trim()).not.toBe("");
      }
    }
  });

  it("plans a state per row and width in every look and surface: button 24 cells, dialog 54", () => {
    const filters = parseWebFilters({});
    const button = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["button"] }, [...STATE_NAMES]);
    expect(button.byState).toEqual({ hover: 6, focus: 6, pressed: 6, disabled: 6 });
    expect(button.cells).toBe(24);
    expect(button.groups.length).toBe(6);
    const dialog = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["dialog"] }, [...STATE_NAMES]);
    expect(dialog.cells).toBe(3 * 3 * 6);
    expect(dialog.groups[0]!.cells.map((c) => `${c.row}.${c.width.key}`)).toEqual([
      "web.phone", "web.tablet", "web.desktop",
      "ios.phone", "ios.tablet", "ios.desktop",
      "android.phone", "android.tablet", "android.desktop",
    ]);
    // A width filter keeps the states that are captured there: only open runs at phone width.
    const phone = planStateCapture(pages, stateSpecsOf, parseWebFilters({ AUDIT_ONLY: "button,dialog", AUDIT_WIDTHS: "phone" }), [...STATE_NAMES]);
    expect(phone.byState).toEqual({ open: 3 * 6 });
    expect(phone.components).toBe(1);
  });

  it("refuses a recipe naming an example the page does not have", () => {
    const specs = () => [{ state: "hover" as const, variant: "nosuchexample", rows: ["web" as const], widths: "desktop" as const }];
    expect(() => planStateCapture(pages, specs, { ...parseWebFilters({}), only: ["button"] }, ["hover"])).toThrow(/names the example "nosuchexample"/);
  });
});
