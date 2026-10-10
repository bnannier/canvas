// The interaction-state recipes (e2e/support/state-recipes.ts) against what they must
// cover: every component the interaction registry lists has recipes or a reason it has
// none, every recipe names an example its page has, every state a component's own source
// gives it (tools/audit/interaction-signals.ts: a scrub surface, a press, hover or field
// handler, the hover primitive, a tab stop, an overlay it opens, a pressed, hovered or
// focused look, whether written on the tag or spread onto it) has a recipe or an
// exemption whose claim holds (tools/audit/state-coverage.ts), each overlay a component
// opens is opened by a recipe that names it when it opens more than one, every overlay
// the e2e suite opens (and Tooltip's in-row bubble) has an open recipe, and an overlay
// opens from exactly the rows whose platform build the docs registry injects.
import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import { MATERIAL_OVERLAY_RECIPES, TOAST_RECIPE } from "../../e2e/support/overlay-recipes.ts";
import { ROOT } from "../../e2e/support/routes.ts";
import { breakpoints } from "../../src/style/tokens.ts";
import {
  DESKTOP,
  EVERY_WIDTH,
  HOVER_PROPERTIES,
  STATE_NAMES,
  STATE_RECIPES,
  checkStateTable,
  inspectionDiff,
  namedRecipesOf,
  pressFired,
  pressTrace,
  recipeFor,
  recipesIn,
  recipesOf,
  stateSpecsOf,
  type ComponentStates,
  type PressRecord,
  type StateRecipe,
} from "../../e2e/support/state-recipes.ts";
import { inventory as registry } from "../interactions/registry.ts";
import { registeredSkins } from "../skins/registry.ts";
import { SignalReader, type Signal } from "./interaction-signals.ts";
import { WIDTHS, components, widthsAtOrBelow } from "./inventory.ts";
import { asksFor, componentSignals, controlFailure, coverageOf, deviceFeedback, docsRowsOf, exemptionFailure, ownControls, railExamples, rowsOfSignal, sourceDirOf, tableCoverage } from "./state-coverage.ts";
import { parseWebFilters, planStateCapture } from "./web-capture.ts";

const pages = components();
const reader = new SignalReader(ROOT);
const component = (slug: string) => pages.find((c) => c.slug === slug)!;
const signalsOf = (slug: string) => reader.signalsOf(sourceDirOf(component(slug)));
/** A signal as one line: kind, state, what, gates and route. */
const line = (s: Signal) => `${s.state} ${s.kind}: ${s.what}${s.gates.length ? ` [${[...s.gates].sort().join("&")}]` : ""}${s.via.length ? ` via ${s.via.join(">")}` : ""}`;
const examplesOf = (slug: string) => pages.find((c) => c.slug === slug)?.variants.map((v) => v.variant) ?? null;
/** The rows a component's docs page shows, and the build each renders. */
const rowsOf = (slug: string) => docsRowsOf(slug, component(slug), reader);

/** The export whose platform builds an open recipe's rows follow, per component that opens something. */
const OPENED_EXPORT: Record<string, string> = {
  "button-group": "ButtonGroup",
  calendar: "Calendar",
  "filter-panel": "FilterPanel",
  sidebar: "Sidebar",
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

  it("captures the hover of every component whose source takes a resting pointer, and no other", () => {
    const withHover = Object.keys(STATE_RECIPES).filter((slug) => recipesOf(slug).some((r) => r.state === "hover")).sort();
    const byOpening = Object.keys(STATE_RECIPES).filter((slug) => recipesOf(slug).some((r) => r.alsoAnswers?.includes("hover"))).sort();
    const resting = pages.filter((c) => STATE_RECIPES[c.slug] && componentSignals(reader, c).some((s) => s.state === "hover")).map((c) => c.slug).sort();
    // Held to the source, not to a list: a component the source gives a hover has a hover
    // recipe or an opening a resting pointer makes, and no hover recipe goes without one.
    expect([...new Set([...withHover, ...byOpening])].sort()).toEqual(resting);
    // Every reader of the hover primitive is among them.
    expect(hoverDeclarers()).toEqual(["avatar", "button", "card", "dropdown", "listbox", "pagination", "row-menu", "sidebar"]);
    for (const slug of hoverDeclarers()) expect(withHover).toContain(slug);
    // Spread handlers count: the Calendar's blocks take `{...hoverProps}` and Tooltip's
    // triggers `{...disclosure}`; Tooltip's hover is its open recipe's (a resting pointer opens it).
    expect(resting).toContain("calendar");
    expect(resting).toContain("tooltip");
    expect(byOpening).toEqual(["tooltip"]);
    // The hover is judged by what src/style/hover.tsx changes: the lift and the wash.
    expect([...HOVER_PROPERTIES].sort()).toEqual(["background-color", "box-shadow", "scale", "transform", "translate"]);
  });

  it("opens every overlay a component's source opens, every one the e2e suite opens, and Tooltip's in-row bubble", () => {
    const opens = Object.keys(STATE_RECIPES).filter((slug) => recipesOf(slug).some((r) => r.state === "open")).sort();
    const overlays = [...MATERIAL_OVERLAY_RECIPES.map((r) => r.slug), TOAST_RECIPE.slug];
    for (const slug of overlays) expect(opens).toContain(slug);
    // Held to the source: every component whose source renders an overlay, or hands a kit
    // overlay its open state, has an open recipe, AvatarMenu's injected Dropdown included.
    const bySource = pages.filter((c) => STATE_RECIPES[c.slug] && componentSignals(reader, c).some((s) => s.kind === "overlay")).map((c) => c.slug).sort();
    for (const slug of bySource) expect(opens).toContain(slug);
    expect(bySource).toContain("avatar");
    // The one opening no overlay primitive carries: Tooltip draws its bubble in flow beside its trigger.
    expect(opens.filter((slug) => !bySource.includes(slug))).toEqual(["tooltip"]);
    expect(opens).toEqual(Object.keys(OPENED_EXPORT).sort());
  });

  it("opens each overlay from the web row and from every row whose platform build the docs registry injects", () => {
    const registered = registeredSkins(readFileSync(join(ROOT, "docs/src/core/platform-skins.ts"), "utf8"));
    // A page that shows one preview (Sidebar's full app frame) has the web row alone.
    const single = new Set(COMPONENTS.filter((c) => c.singlePreview).map((c) => c.slug));
    expect([...single]).toEqual(["sidebar"]);
    for (const [slug, name] of Object.entries(OPENED_EXPORT)) {
      const expected = ["web", ...(single.has(slug) ? [] : (["ios", "android"] as const).filter((platform) => registered[platform].has(name)))];
      expect({ slug, rows: [...recipeFor(slug, "open").rows] }).toEqual({ slug, rows: expected });
    }
    // Toast has no iOS build of its own: its iOS row is the web one.
    expect([...recipeFor("toast", "open").rows]).toEqual(["web", "android"]);
  });

  it("captures hover, focus, pressed, invalid and disabled at the desktop in the row (in the viewport inside an overlay), and open at every width in the viewport, but where a state exists only at some widths", () => {
    // A state that exists only at some widths is captured there alone: the drawers FilterPanel
    // and Sidebar become at and below their breakpoints (and the rows in each drawer), and the
    // Heatmap's scroller, a tab stop only where the year overflows it, below `sm`.
    const only: Record<string, readonly string[]> = {
      "filter-panel open": widthsAtOrBelow("sm"),
      "filter-panel focus-responsivedrawer": widthsAtOrBelow("sm"),
      "filter-panel pressed-responsivedrawer": widthsAtOrBelow("sm"),
      "sidebar open": widthsAtOrBelow("lg"),
      "sidebar hover-default-inside": widthsAtOrBelow("lg"),
      "sidebar focus-default-inside": widthsAtOrBelow("lg"),
      "sidebar pressed-default-inside": widthsAtOrBelow("lg"),
      "heatmap focus": widthsAtOrBelow("sm"),
    };
    // A state is applied on the web row, but where the control it acts on is the component's
    // own only on another build's row (the iOS and Android builds' own footer buttons, whose web
    // build renders kit Buttons; DataTable's native cell editor beside the web's surface), and
    // never on a row where it shows the state only through feedback react-native-web does not
    // draw (the Android text buttons' `android_ripple`: their press is the iOS row's alone).
    const rowsOf: Record<string, readonly string[]> = {
      "dialog focus": ["ios", "android"],
      "dialog pressed": ["ios"],
      "alert-dialog focus": ["ios", "android"],
      "alert-dialog pressed": ["ios"],
      "alert-dialog disabled": ["web", "ios", "android"],
      "data-table focus": ["web", "ios", "android"],
    };
    for (const slug of Object.keys(STATE_RECIPES)) {
      for (const { name, recipe } of namedRecipesOf(slug)) {
        const key = `${slug} ${name}`;
        const widths = only[key] ?? (recipe.state === "open" ? EVERY_WIDTH : DESKTOP);
        expect({ key, widths: [...recipe.widths] }).toEqual({ key, widths: [...widths] });
        if (recipe.state === "open") expect({ key, frame: recipe.frame }).toEqual({ key, frame: "viewport" });
        else {
          // Inside an overlay (a hover, a focus, a press or a disabled control in an opened
          // menu, dialog or sheet, or a card a resting pointer floats) the photograph is the viewport.
          if (recipe.frame === "viewport") expect(["hover", "focus", "pressed", "disabled"]).toContain(recipe.state);
          // A recipe applied inside an overlay it opens says so; the card a resting pointer floats is the opening itself.
          const opening = recipe.alsoAnswers?.includes("open") ?? false;
          expect({ key, inOverlay: recipe.inOverlay === true }).toEqual({ key, inOverlay: recipe.frame === "viewport" && !opening });
        }
        if (recipe.state !== "open") expect({ key, rows: [...recipe.rows] }).toEqual({ key, rows: [...(rowsOf[key] ?? ["web"])] });
        expect(recipe.how.trim()).not.toBe("");
      }
    }
    // The kit's own breakpoints, read off the audit's widths: a phone sits under sm, a tablet under lg.
    expect(widthsAtOrBelow("sm")).toEqual(WIDTHS.filter((w) => w.width <= breakpoints.sm).map((w) => w.key));
    expect([widthsAtOrBelow("sm"), widthsAtOrBelow("lg"), widthsAtOrBelow("xl"), widthsAtOrBelow("2xl")]).toEqual([["phone"], ["phone", "tablet"], ["phone", "tablet"], ["phone", "tablet", "desktop"]]);
  });

  it("plans a state per row and width in every look and surface: button 24 cells, dialog 72, filter panel at a phone's width alone", () => {
    const filters = parseWebFilters({});
    const button = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["button"] }, [...STATE_NAMES]);
    expect(button.byState).toEqual({ hover: 6, focus: 6, pressed: 6, disabled: 6 });
    expect(button.cells).toBe(24);
    expect(button.groups.length).toBe(6);
    const dialog = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["dialog"] }, [...STATE_NAMES]);
    // Open from three rows at three widths; the focus on its own Cancel, inside it, at the
    // desktop, on the iOS and Android rows (the web row's Cancel is a kit Button), and the press
    // on the iOS row's alone (the Android row's text button presses with `android_ripple`, which
    // react-native-web does not draw).
    expect(dialog.byState).toEqual({ focus: 2 * 6, pressed: 6, open: 3 * 3 * 6 });
    expect(dialog.cells).toBe(72);
    expect(dialog.groups[0]!.cells.map((c) => `${c.state} ${c.row}.${c.width.key}`)).toEqual([
      "focus ios.desktop", "focus android.desktop",
      "pressed ios.desktop",
      "open web.phone", "open web.tablet", "open web.desktop",
      "open ios.phone", "open ios.tablet", "open ios.desktop",
      "open android.phone", "open android.tablet", "open android.desktop",
    ]);
    // A width filter keeps the states that are captured there: only open runs at phone width.
    const phone = planStateCapture(pages, stateSpecsOf, parseWebFilters({ AUDIT_ONLY: "button,dialog", AUDIT_WIDTHS: "phone" }), [...STATE_NAMES]);
    expect(phone.byState).toEqual({ open: 3 * 6 });
    expect(phone.components).toBe(1);
    // The drawer exists only at a phone's width (`sm`): one width, three rows.
    const drawer = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["filter-panel"] }, ["open"]);
    expect(drawer.groups[0]!.cells.map((c) => `${c.row}.${c.width.key}`)).toEqual(["web.phone", "ios.phone", "android.phone"]);
  });

  it("refuses a recipe naming an example the page does not have", () => {
    const specs = () => [{ name: "hover", state: "hover" as const, variant: "nosuchexample", rows: ["web" as const], widths: DESKTOP }];
    expect(() => planStateCapture(pages, specs, { ...parseWebFilters({}), only: ["button"] }, ["hover"])).toThrow(/names the example "nosuchexample"/);
  });

  it("names each recipe of a state a component has several of for its example, and plans each its own cells", () => {
    // Dropdown is disabled in two places: its trigger, and an item inside the menu it opens.
    const dropdown = recipesOf("dropdown").filter((r) => r.state === "disabled");
    expect(dropdown.map((r) => ({ variant: r.variant, inOverlay: r.inOverlay === true, frame: r.frame }))).toEqual([
      { variant: "disabledtrigger", inOverlay: false, frame: "row" },
      { variant: "disableditem", inOverlay: true, frame: "viewport" },
    ]);
    // Its focus and its press are on the Custom trigger example's button and on a row of the menu.
    expect(stateSpecsOf("dropdown").map((spec) => spec.name)).toEqual([
      "hover",
      "focus-customtrigger",
      "focus-default",
      "pressed-customtrigger",
      "pressed-default",
      "open",
      "disabled-disabledtrigger",
      "disabled-disableditem",
    ]);
    // A state with one recipe keeps the state's name, so every other cell keeps its id.
    expect(stateSpecsOf("button").map((spec) => spec.name)).toEqual(["hover", "focus", "pressed", "disabled"]);
    expect(recipeFor("dropdown", "disabled-disableditem").variant).toBe("disableditem");
    expect(() => recipeFor("dropdown", "disabled")).toThrow("dropdown has no recipe named disabled (its disabled recipes are disabled-disabledtrigger, disabled-disableditem)");
    const plan = planStateCapture(pages, stateSpecsOf, { ...parseWebFilters({}), only: ["dropdown"] }, ["disabled"]);
    expect(plan.byState).toEqual({ disabled: 2 * 6 });
    expect(plan.groups[0]!.cells.map((c) => `${c.name} ${c.row}.${c.width.key}`)).toEqual(["disabled-disabledtrigger web.desktop", "disabled-disableditem web.desktop"]);
  });

  it("fails two recipes of one state on one example in one place, whose cells would share a name, and a list holding another state's recipe", () => {
    const [trigger, item] = recipesOf("dropdown").filter((r) => r.state === "disabled");
    const focus = recipeFor("dropdown", "focus-default");
    const table: Record<string, ComponentStates> = { dropdown: { disabled: [trigger!, { ...trigger!, how: "again" }, focus] } };
    expect(checkStateTable(["dropdown"], table, examplesOf)).toEqual([
      'dropdown: two disabled recipes name the example "disabledtrigger", so their cells would share a name',
      "dropdown: the disabled entry holds a focus recipe",
    ]);
    // One on the example's surface and one inside the overlay it opens are two places: the
    // second is named `-inside` (Command's focus on its Search trigger and on a palette row).
    const inside: Record<string, ComponentStates> = { dropdown: { disabled: [trigger!, { ...item!, variant: "disabledtrigger" }] } };
    expect(checkStateTable(["dropdown"], inside, examplesOf)).toEqual([]);
    expect(stateSpecsOf("command").filter((spec) => spec.state !== "open").map((spec) => spec.name)).toEqual([
      "hover-default",
      "hover-inline",
      "focus-default",
      "focus-default-inside",
      "pressed-default",
      "pressed-default-inside",
    ]);
  });
});

describe("the states each component's source gives it", () => {
  it("are answered for every component: a recipe, or an exemption whose claim holds", () => {
    const coverage = tableCoverage(pages, STATE_RECIPES, reader);
    expect(coverage.flatMap((c) => c.errors)).toEqual([]);
    // Every exemption in the table, and that it holds.
    const exempt = coverage.flatMap((c) => c.answers.filter((a) => a.by === "exemption").map((a) => `${c.slug} ${a.state}: ${a.failure ?? "holds"}`));
    expect(exempt.sort()).toEqual([
      "avatar focus: holds",
      "avatar pressed: holds",
      "calendar pressed: holds",
      "drawer pressed: holds",
      "feeds focus: holds",
      "feeds pressed: holds",
      "grid-lists focus: holds",
      "grid-lists pressed: holds",
      "steps focus: holds",
      "steps pressed: holds",
      "typography focus: holds",
      "typography pressed: holds",
    ]);
    // A state answered by another state's recipe: Tooltip's hover, by the open recipe a resting pointer applies.
    const via = coverage.flatMap((c) => c.answers.filter((a) => a.recipe).map((a) => `${c.slug} ${a.state} by ${a.recipe}`));
    expect(via).toEqual(["tooltip hover by open"]);
    // The disabled controls inside an overlay, each answered by a recipe that opens it first.
    const inOverlays = coverage.flatMap((c) => c.answers.filter((a) => a.state === "disabled" && a.within).map((a) => `${c.slug} in ${a.within}: ${a.by}`));
    expect(inOverlays.sort()).toEqual([
      "action-sheet in ActionSheet: recipe",
      "alert-dialog in Present: recipe",
      "button-group in SplitButton: unshown",
      "dropdown in Dropdown: recipe",
      "row-menu in RowMenu: recipe",
    ]);
    // Where a source disables a control no example asks for: nothing to capture.
    const unshown = coverage.flatMap((c) => c.answers.filter((a) => a.by === "unshown").map((a) => `${c.slug}${a.within ? ` in ${a.within}` : ""}`));
    expect(unshown.sort()).toEqual(["button-group in SplitButton", "carousel", "chip", "form", "radio", "sidebar", "video"]);
    // The states the web runner can never show and the devices judge: Dialog's and
    // AlertDialog's Android text buttons, which press with `android_ripple` alone.
    const devices = coverage.flatMap((c) => c.answers.filter((a) => a.by === "devices").map((a) => `${c.slug} ${a.state}${a.within ? ` in ${a.within}` : ""}${a.rows ? ` on ${a.rows.join(" and ")}` : ""}: ${a.feedback ?? `no row renders the ${a.builds!.join(" and ")} build`}`));
    expect(devices.sort()).toEqual(["alert-dialog pressed in Present on android: android_ripple", "dialog pressed in Present on android: android_ripple"]);
    // No recipe sets up a state the source never shows the web: every kit field disabled
    // through `editable` also carries `aria-disabled` and an accessibilityState.
    const unreachable = coverage.flatMap((c) => c.unreachable.map((u) => `${c.slug} ${u.recipe.state} on ${u.recipe.variant} (${u.rows.join(" and ")}): ${u.why}`));
    expect(unreachable.sort()).toEqual([]);
  });

  it("holds each recipe to a control of the component's own, so one on a control another kit component renders answers nothing", () => {
    const check = (slug: string, entry: Record<string, unknown>) => coverageOf(slug, entry as ComponentStates, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors;
    const table = STATE_RECIPES as Record<string, Record<string, unknown>>;
    // The recipes as the table had them, each found by the role its target is found by.
    const on = (slug: string, name: string, role: string, variant?: string): StateRecipe => ({ ...recipeFor(slug, name), ...(variant ? { variant } : {}), control: { role } });
    // FilterPanel's focus on the header's Clear, a kit Button: its own option rows were never focused.
    expect(check("filter-panel", { ...table["filter-panel"], focus: [on("filter-panel", "focus-default", "button"), recipeFor("filter-panel", "focus-responsivedrawer")] })).toEqual([
      "filter-panel: its focus recipe on the default example answers nothing on the web row: it acts on a button on its own surface, which is none of the component's own controls there (its example renders a checkbox in OptionRow); a control another kit component renders is that component's",
      "filter-panel: its source gives it a focus state on its own surface (a tab stop: <Pressable> at src/organisms/filter-panel/filter-panel.shared.tsx:153 via OptionRow), where no focus recipe acts on a control of its own, with no exemption",
    ]);
    // Dropdown's focus and press on its default trigger, a kit Button (which Dropdown disables, so
    // it is Dropdown's disabled control and no more): neither its custom trigger nor its menu rows.
    expect(check("dropdown", { ...table.dropdown, focus: on("dropdown", "focus-customtrigger", "button", "default"), pressed: on("dropdown", "pressed-customtrigger", "button", "default") })).toEqual([
      "dropdown: its focus recipe on the default example answers nothing on the web row: it acts on a button on its own surface, which is none of the component's own controls there (its example renders none); a control another kit component renders is that component's",
      "dropdown: its source gives it a focus state on its own surface (a tab stop: <Pressable> at src/atoms/dropdown/dropdown.shared.tsx:319), where no focus recipe acts on a control of its own, with no exemption",
      "dropdown: its source gives it a focus state in the overlay in Dropdown (a tab stop: <Pressable> at src/atoms/dropdown/dropdown.shared.tsx:164 via MenuRow), where no focus recipe acts on a control of its own, with no exemption",
      "dropdown: its pressed recipe on the default example answers nothing on the web row: it acts on a button on its own surface, which is none of the component's own controls there (its example renders none); a control another kit component renders is that component's",
      "dropdown: its source gives it a pressed state on its own surface (onPress on <Pressable> at src/atoms/dropdown/dropdown.shared.tsx:323), where no pressed recipe acts on a control of its own, with no exemption",
      "dropdown: its source gives it a pressed state in the overlay in Dropdown (onPress on <Pressable> at src/atoms/dropdown/dropdown.shared.tsx:176 via MenuRow, and 1 more), where no pressed recipe acts on a control of its own, with no exemption",
    ]);
    // DescriptionList's focus and press on its Update link, a kit Button: its own inline-edit
    // field was never focused, and its source gives it no press at all.
    const update = on("description-lists", "focus", "button");
    expect(check("description-lists", { focus: update, pressed: { ...update, state: "pressed" } })).toEqual([
      "description-lists: its focus recipe on the inlineedit example answers nothing on the web row: it acts on a button on its own surface, which is none of the component's own controls there (its example renders a textbox in rows); a control another kit component renders is that component's",
      "description-lists: its source gives it a focus state on its own surface (a TextInput at src/molecules/description-lists/description-lists.shared.tsx:319), where no focus recipe acts on a control of its own, with no exemption",
      "description-lists: its pressed recipe on the inlineedit example answers nothing on the web row: it acts on a button on its own surface, which is none of the component's own controls there (its example renders a textbox in rows); a control another kit component renders is that component's",
    ]);
    // GeoMap's focus on its Zoom in, a kit Button it disables at the end of the zoom: the map itself is the tab stop.
    expect(check("geo-map", { ...table["geo-map"], focus: on("geo-map", "focus", "button") })).toEqual([
      "geo-map: its focus recipe on the zoomable example answers nothing on the web row: it acts on a button on its own surface, which is none of the component's own controls there (its example renders an img in GeoMap, a <Pressable> with no role in GeoMap); a control another kit component renders is that component's",
      "geo-map: its source gives it a focus state on its own surface (focusable on <View> at src/charts/geo-map/geo-map.shared.tsx:530), where no focus recipe acts on a control of its own, with no exemption",
    ]);
    // A recipe that names no control is refused, and one whose own control takes no such state.
    const { control: _control, ...unnamed } = recipeFor("button", "focus");
    expect(controlFailure(unnamed as StateRecipe, "focus", "", signalsOf("button"), railExamples(component("button")))).toBe("it names no control (`StateRecipe.control`)");
    const field = { ...recipeFor("description-lists", "focus"), state: "pressed" as const };
    expect(controlFailure(field, "pressed", "", signalsOf("description-lists"), railExamples(component("description-lists")))).toBe(
      "it acts on a textbox in rows on its own surface, and nothing rows renders there takes a pressed state",
    );
  });

  it("answers a hover, a focus and a press place by place: the component's own surface and each overlay it renders them in", () => {
    const check = (slug: string, entry: Record<string, unknown>) => coverageOf(slug, entry as ComponentStates, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors;
    const table = STATE_RECIPES as Record<string, Record<string, unknown>>;
    // Dropdown's custom trigger answers its own surface, not the rows of the menu it opens.
    expect(check("dropdown", { ...table.dropdown, focus: recipeFor("dropdown", "focus-customtrigger") })).toEqual([
      "dropdown: its source gives it a focus state in the overlay in Dropdown (a tab stop: <Pressable> at src/atoms/dropdown/dropdown.shared.tsx:164 via MenuRow), where no focus recipe acts on a control of its own, with no exemption",
    ]);
    // FilterPanel's rows are on the panel and inside the drawer it becomes at a phone's width.
    expect(check("filter-panel", { ...table["filter-panel"], focus: recipeFor("filter-panel", "focus-default") })).toEqual([
      "filter-panel: its source gives it a focus state in the overlay in FilterPanel (a tab stop: <Pressable> at src/organisms/filter-panel/filter-panel.shared.tsx:153 via OptionRow), where no focus recipe acts on a control of its own, with no exemption",
    ]);
    // A recipe inside the overlay answers it alone.
    expect(check("dropdown", { ...table.dropdown, pressed: recipeFor("dropdown", "pressed-default") })).toEqual([
      "dropdown: its source gives it a pressed state on its own surface (onPress on <Pressable> at src/atoms/dropdown/dropdown.shared.tsx:323), where no pressed recipe acts on a control of its own, with no exemption",
    ]);
    // Where each place's own controls are, with the roles the page gives them.
    const places = (slug: string, state: string) =>
      [...new Set(ownControls(signalsOf(slug)).filter((c) => c.signals.some((s) => s.state === state)).map((c) => `${c.place || "surface"}: ${c.control.in} <${c.control.tag}> ${c.control.roles.join("/") || "no role"}`))].sort();
    expect(places("dropdown", "focus")).toEqual(["Dropdown: MenuRow <Pressable> menuitem", "surface: Dropdown <Pressable> button"]);
    expect(places("filter-panel", "focus")).toEqual(["FilterPanel: OptionRow <Pressable> checkbox", "surface: OptionRow <Pressable> checkbox"]);
    expect(places("description-lists", "focus")).toEqual(["surface: rows <TextInput> textbox"]);
    // A kit component the component disables is its control for the disabled state alone.
    expect(places("geo-map", "disabled")).toEqual(["surface: GeoMap <Button> button/link"]);
    expect(ownControls(signalsOf("geo-map")).find((c) => c.control.tag === "Button")!.control.kit).toBe(true);
  });

  it("checks an unpassed claim against the examples that render a signal, each passing every prop it needs", () => {
    const grid = component("grid-lists");
    const entry = STATE_RECIPES["grid-lists"]!;
    const own = signalsOf("grid-lists").filter((s) => s.state === "pressed");
    // A gallery tile is a button only with both `gallery` and `onPressItem`: the Gallery example passes one, the Tappable example the other.
    expect(own.map((s) => [...s.gates].sort().join("&"))).toEqual(["gallery&onPressItem", "gallery&onPressItem"]);
    expect(exemptionFailure("pressed", entry.exempt!.pressed!, own, railExamples(grid), entry)).toBeNull();
    const both = [...railExamples(grid), { label: "Tappable gallery", code: "<GridList gallery onPressItem={() => {}} items={[]} />" }];
    expect(exemptionFailure("pressed", entry.exempt!.pressed!, own, both, entry)).toBe("the Tappable gallery example passes onPressItem");
  });

  it("fails a disabled control an example asks for inside an overlay with no recipe that opens it, and one on the component's own surface with none there", () => {
    const check = (slug: string, entry: ComponentStates) => coverageOf(slug, entry, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors;
    // The four the table once left uncaptured: each example's disabled control is in the overlay the component opens.
    const without = (slug: string) => {
      const { disabled: _disabled, ...rest } = STATE_RECIPES[slug] as Record<string, unknown>;
      return rest as ComponentStates;
    };
    expect(check("action-sheet", without("action-sheet"))).toEqual([
      "action-sheet: its Disabled action example asks for a disabled control in the overlay in ActionSheet (disabled on <Pressable> at src/organisms/action-sheet/action-sheet.shared.tsx:204), with no disabled recipe there",
    ]);
    expect(check("row-menu", without("row-menu"))).toEqual([
      "row-menu: its Disabled item example asks for a disabled control in the overlay in RowMenu (disabled on <Pressable> at src/organisms/row-menu/row-menu.shared.tsx:79 via MenuRow), with no disabled recipe there",
    ]);
    // AlertDialog's confirm stays disabled until the token is typed, only with `withInput`; Present portals the dialog.
    expect(check("alert-dialog", without("alert-dialog"))).toEqual([
      "alert-dialog: its Body field example asks for a disabled control in the overlay in Present (disabled on <Pressable> at src/molecules/alert-dialog/alert-dialog.shared.tsx:209), with no disabled recipe there",
    ]);
    // Dropdown's trigger recipe answers its own surface, not the menu it opens; the item recipe, the menu alone.
    const [trigger, item] = recipesIn(STATE_RECIPES.dropdown!, "disabled");
    expect(check("dropdown", { ...without("dropdown"), disabled: trigger! })).toEqual([
      "dropdown: its Disabled item example asks for a disabled control in the overlay in Dropdown (disabled on <Pressable> at src/atoms/dropdown/dropdown.shared.tsx:177 via MenuRow), with no disabled recipe there",
    ]);
    expect(check("dropdown", { ...without("dropdown"), disabled: item! })).toEqual([
      // The kit Button it hands `disabled` (its Pressable trigger is an element trigger's, given `children`).
      "dropdown: its Disabled trigger example asks for a disabled control on its own surface (disabled on <Button> at src/atoms/dropdown/dropdown.shared.tsx:340), with no disabled recipe there",
    ]);
    // An own-surface recipe a disabled example asks for (Button's `disabled`, one of the two ways `disabled || loading` is true).
    expect(check("button", without("button"))).toEqual([
      "button: its Disabled example asks for a disabled control on its own surface (disabled on <Pressable> at src/atoms/button/button.shared.tsx:207), with no disabled recipe there",
    ]);
  });

  it("holds a disabled recipe applied inside an overlay to an overlay its source renders, and refuses an exemption for disabled", () => {
    const check = (slug: string, entry: ComponentStates) => coverageOf(slug, entry, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors;
    const item = recipeFor("dropdown", "disabled-disableditem");
    expect(check("button", { ...(STATE_RECIPES.button as object), disabled: { ...item, variant: "disabled" } } as ComponentStates)).toEqual([
      "button: its disabled recipe on the disabled example is applied inside an overlay, and its source renders none",
      "button: its Disabled example asks for a disabled control on its own surface (disabled on <Pressable> at src/atoms/button/button.shared.tsx:207), with no disabled recipe there",
    ]);
    const dropdown = STATE_RECIPES.dropdown as Record<string, unknown>;
    expect(check("dropdown", { ...dropdown, disabled: [recipeFor("dropdown", "disabled-disabledtrigger"), { ...item, opens: "Popover" }] } as ComponentStates)[0]).toBe(
      "dropdown: its disabled recipe on the disableditem example opens the overlay in Popover, which its source does not render (it renders Dropdown)",
    );
    // The Calendar renders two overlays, so a recipe inside one must name it.
    expect(check("calendar", { ...(STATE_RECIPES.calendar as object), disabled: { ...item, variant: "week" } } as ComponentStates)).toEqual([
      "calendar: its source renders 2 overlays (hoverCard, dayPeekOverlay), so its disabled recipe on the week example must name the one it opens",
    ]);
    const exemption = { claim: { unpassed: ["disabled"] }, reason: "test" };
    expect(check("radio", { ...(STATE_RECIPES.radio as object), exempt: { disabled: exemption } } as ComponentStates)).toEqual([
      "radio: exempts disabled, which a recipe answers where an example asks for it and nothing needs where none does",
    ]);
  });

  it("reads where each disabled control is and what disables it: an overlay's own, a constant placed where it is used, the ways a value is true", () => {
    const disabled = (slug: string) =>
      [...new Set(signalsOf(slug).filter((s) => s.state === "disabled").map((s) => `${s.what}${s.gates.length ? ` [${s.gates.join("&")}]` : ""} by ${s.disabledBy!.map((w) => `${w.props.join("&") || "-"}/${w.keys.join("&") || "-"}`).join(" | ")}${s.within ? ` in ${s.within}` : ""}`))].sort();
    // ActionSheet's rows (a constant, `actionRows`, rendered inside its Modal) read the action's `disabled`.
    expect(disabled("action-sheet")).toEqual(["accessibilityState on <Pressable> by -/disabled in ActionSheet", "disabled on <Pressable> by -/disabled in ActionSheet"]);
    // RowMenu's and Dropdown's rows: a local MenuRow, rendered inside the AnchoredOverlay, reading its item's `disabled`.
    expect(disabled("row-menu")).toEqual(["accessibilityState on <Pressable> by -/disabled in RowMenu", "aria-disabled on <Pressable> by -/disabled in RowMenu", "disabled on <Pressable> by -/disabled in RowMenu"]);
    expect(disabled("dropdown")).toEqual([
      "accessibilityState on <Pressable> [children] by disabled/-",
      "accessibilityState on <Pressable> by -/disabled in Dropdown",
      "aria-disabled on <Pressable> [children] by disabled/-",
      "aria-disabled on <Pressable> by -/disabled in Dropdown",
      "disabled on <Button> by disabled/-",
      "disabled on <Pressable> [children] by disabled/-",
      "disabled on <Pressable> by -/disabled in Dropdown",
    ]);
    // AlertDialog's confirm, a constant (`actionRow`) used inside Present, whose children go into a Portal:
    // disabled through `const confirmGated = !!withInput && ...`, on its own Pressables and on the kit Button it hands `disabled`.
    expect(disabled("alert-dialog")).toEqual([
      "accessibilityState on <Pressable> by withInput/- in Present",
      "aria-disabled on <Pressable> by withInput/- in Present",
      "disabled on <Button> [destructive] by withInput/- in Present",
      "disabled on <Button> by withInput/- in Present",
      "disabled on <Pressable> by withInput/- in Present",
    ]);
    // A Select's option rows are disabled with the Select, whose list `!disabled && ...` never opens: nothing.
    expect(disabled("select").filter((line) => line.includes(" in "))).toEqual([]);
    // `disabled || loading`: either way; a carousel's arrows at the ends of its slides: by itself.
    expect(disabled("button")).toContain("disabled on <Pressable> by disabled/- | loading/-");
    expect(disabled("carousel")).toEqual(["accessibilityState on <Pressable> by -/-", "aria-disabled on <Pressable> by -/-", "disabled on <Pressable> by -/-"]);
    // The split menu's rows render only for the split kind (`kindOf(props) === "split"`).
    expect(disabled("button-group")).toContain("disabled on <Pressable> [split] by disabled/- in SplitButton");
  });

  it("fails the Calendar marked static on every state its source gives it, the hover read from its spread", () => {
    const calendar = component("calendar");
    const errors = coverageOf("calendar", { static: true, reason: "a test" }, componentSignals(reader, calendar), railExamples(calendar), rowsOf("calendar")).errors;
    expect(errors.map((e) => e.replace(/ \(.*\),/, ","))).toEqual([
      "calendar: its source gives it a hover state, with neither a hover recipe nor an exemption",
      "calendar: its source gives it a focus state, with neither a focus recipe nor an exemption",
      "calendar: its source gives it a pressed state, with neither a pressed recipe nor an exemption",
      "calendar: its source gives it an open state, with neither an open recipe nor an exemption",
    ]);
    // The hover is the blocks' `{...hoverProps}`, written in the object the spread takes.
    expect(errors[0]).toContain("onHoverIn on <Pressable> at src/organisms/calendar/calendar.shared.tsx:");
  });

  it("names each overlay a component opens, and holds a component that opens two to a recipe for each", () => {
    // The Calendar renders two: the hover card a resting pointer floats, and the day peek a press opens.
    const overlays = (slug: string) => signalsOf(slug).filter((s) => s.kind === "overlay").map((s) => `${s.overlay}: ${s.what}`);
    expect(overlays("calendar")).toEqual(["hoverCard: a <AnchoredOverlay>", "dayPeekOverlay: a <AnchoredOverlay>"]);
    const calendar = STATE_RECIPES.calendar as Record<string, StateRecipe>;
    expect([calendar.hover!.opens, calendar.open!.opens]).toEqual(["hoverCard", "dayPeekOverlay"]);
    // The errors without where the source renders each signal: "(a <AnchoredOverlay> at src/...:614)".
    const bare = (errors: string[]) => errors.map((e) => e.replace(/ \(a <[^>]+>.*? at src\/[^)]*\)/, ""));
    const check = (slug: string, entry: Record<string, unknown>) => bare(coverageOf(slug, entry as ComponentStates, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors);
    expect(check("calendar", calendar)).toEqual([]);
    // A hover recipe that does not open the card leaves the card to nothing, whatever the day peek's recipe opens.
    expect(check("calendar", { ...calendar, hover: { ...recipeFor("sidebar", "hover-default"), variant: "week" } })).toEqual([
      "calendar: its source opens the overlay in hoverCard, which no recipe opens, with no exemption",
    ]);
    // Two overlays, so an opening that does not say which one it opens is refused.
    const { opens: _opens, ...unnamed } = calendar.open!;
    expect(check("calendar", { ...calendar, open: unnamed })).toEqual([
      "calendar: its source renders 2 overlays (hoverCard, dayPeekOverlay), so its open recipe must name the one it opens",
      "calendar: its source opens the overlay in dayPeekOverlay, which no recipe opens, with no exemption",
    ]);
    // A name the source does not render is stale.
    expect(check("calendar", { ...calendar, open: { ...calendar.open!, opens: "monthPeek" } })[0]).toBe("calendar: its open recipe opens the overlay in monthPeek, which its source does not render (it renders hoverCard, dayPeekOverlay)");
    // AvatarMenu hands its open state to the Dropdown its platform entries inject, typed by Dropdown's props.
    expect(overlays("avatar")).toEqual(["AvatarMenu: a <Dropdown> (an overlay) given `open`"]);
    const { open: _open, ...closed } = STATE_RECIPES.avatar as Record<string, unknown>;
    expect(check("avatar", closed)).toEqual(["avatar: its source gives it an open state, with neither an open recipe nor an exemption"]);
  });

  it("fails an overlay's own tab stops with no focus recipe, and a hover with no resting-pointer opening to answer it", () => {
    for (const slug of ["dialog", "alert-dialog", "action-sheet", "toast"]) {
      const { focus: _focus, ...rest } = STATE_RECIPES[slug] as Record<string, unknown>;
      const errors = coverageOf(slug, rest as ComponentStates, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors;
      expect({ slug, errors: errors.map((e) => e.replace(/ \(.*\),/, ",")) }).toEqual({ slug, errors: [`${slug}: its source gives it a focus state, with neither a focus recipe nor an exemption`] });
    }
    // Tooltip's open recipe answers its hover only because a resting pointer opens it.
    const tooltip = STATE_RECIPES.tooltip as Record<string, StateRecipe>;
    const clicked = { ...tooltip, open: { ...tooltip.open!, alsoAnswers: undefined } } as ComponentStates;
    expect(coverageOf("tooltip", clicked, signalsOf("tooltip"), railExamples(component("tooltip")), rowsOf("tooltip")).errors.map((e) => e.replace(/ \(.*\),/, ","))).toEqual([
      "tooltip: its source gives it a hover state, with neither a hover recipe nor an exemption",
    ]);
  });

  it("fails the charts and the heatmap the table used to call static", () => {
    // The entries as they stood: the reasons said no example takes input.
    const before: Record<string, ComponentStates> = {
      chart: { static: true, reason: "A chart with no control and no keyboard stop in any example: it displays data, and an inspected value is shown by an example that pins it." },
      "area-chart": { static: true, reason: "A chart with no control and no keyboard stop in any example: it displays data, and an inspected value is shown by an example that pins it." },
      histogram: { static: true, reason: "A chart with no control and no keyboard stop in any example: it displays data, and an inspected value is shown by an example that pins it." },
      heatmap: { static: true, reason: "A chart whose day cells take a pointer only (no keyboard stop in any example); it displays data." },
      slider: { focus: recipeFor("slider", "focus"), disabled: recipeFor("slider", "disabled") },
    };
    const errors = tableCoverage(pages, before, reader).flatMap((c) => c.errors);
    expect(errors.map((e) => e.replace(/ \(.*\),/, ","))).toEqual([
      "slider: its source gives it a pressed state, with neither a pressed recipe nor an exemption",
      "chart: its source gives it a pressed state, with neither a pressed recipe nor an exemption",
      "area-chart: its source gives it a pressed state, with neither a pressed recipe nor an exemption",
      "heatmap: its source gives it a hover state, with neither a hover recipe nor an exemption",
      "heatmap: its source gives it a focus state, with neither a focus recipe nor an exemption",
      "heatmap: its source gives it a pressed state, with neither a pressed recipe nor an exemption",
      "histogram: its source gives it a pressed state, with neither a pressed recipe nor an exemption",
    ]);
    // The message names where the source takes the input.
    expect(errors.find((e) => e.startsWith("area-chart"))).toContain("via chartShell > CartesianFrame > ScrubSurface");
  });

  it("are read through the shared chart modules, gated by the props that render them", () => {
    const states = (slug: string) => [...new Set(signalsOf(slug).map(line))].sort();
    // The scrub surface, rendered directly or through the shared frame.
    expect(states("histogram")).toContain("pressed responder: onStartShouldSetResponder on <View> via ScrubSurface");
    expect(states("area-chart")).toContain("pressed responder: onStartShouldSetResponder on <View> via chartShell>CartesianFrame>ScrubSurface");
    expect(states("box-plot")).toContain("pressed responder: onStartShouldSetResponder on <View> via CartesianFrame>ScrubSurface");
    // The frame renders the surface only with onBandScrub, which the depth chart never passes.
    expect(states("depth-chart")).toEqual([]);
    // The breakdown rows are buttons only with onPressRow: BarList passes its onPressItem, MetricBreakdown nothing.
    expect(states("bar-list")).toContain("pressed press: onPress on <Pressable> [onPressItem] via BreakdownRows");
    expect(states("metric-breakdown")).toEqual([]);
    // The heatmap's day cells exist only in the calendar layout, kept out of the tab order
    // (`focusable={false}`, tab index -1); its scroller is a stop once the year overflows it
    // (`{...scrollport}`, the style layer's useHorizontalScrollFocus).
    expect(states("heatmap")).toEqual([
      "focus tab-stop: focusable on <ScrollView> [calendar] via CalendarHeatmap",
      "hover hover-in: onHoverIn on <Pressable> [calendar] via CalendarHeatmap",
      "hover hover-in: onHoverOut on <Pressable> [calendar] via CalendarHeatmap",
      "pressed press: onPress on <Pressable> [calendar] via CalendarHeatmap",
    ]);
    // A local component's gate, mapped through the prop its use passes.
    expect(states("steps")).toEqual([
      "focus tab-stop: a tab stop: <Pressable> [onStepPress] via Circle",
      "pressed look: a function taking `pressed` [onStepPress] via Circle",
      "pressed press: onPress on <Pressable> [onStepPress] via Circle",
    ]);
    // The rows' lead is a kind picked from the props (`lead === "avatar"`, `if (p.avatar) return "avatar"`), so the avatar row's are gated by `avatar` too.
    expect(states("feeds")).toEqual([
      "focus tab-stop: a tab stop: <Pressable> [avatar&onItemPress]",
      "focus tab-stop: a tab stop: <Pressable> [onItemPress]",
      "focus tab-stop: focusable on <FlatList> [avatar&virtualized]",
      "focus tab-stop: focusable on <FlatList> [virtualized]",
      "pressed look: a function taking `pressed` [avatar&onItemPress]",
      "pressed look: a function taking `pressed` [onItemPress]",
      "pressed press: onPress on <Pressable> [avatar&onItemPress]",
      "pressed press: onPress on <Pressable> [onItemPress]",
    ]);
    // A link role and href reached only with href; a press only with onPress (a Text with
    // onPress and no role is no tab stop on the web).
    expect(states("typography")).toEqual(['focus link: accessibilityRole "link" on <Text> [href]', "focus link: href on <Text> [href]", "pressed press: onPress on <Text> [onPress]"]);
    // The slider's thumb: its PanResponder and the skin's pressed ring.
    expect(states("slider")).toEqual(expect.arrayContaining(["pressed responder: PanResponder.create()", "pressed look: a function taking `pressed`"]));
    // A kit Button's press is the Button's, not the EmptyState's that renders it.
    expect(states("empty-state")).toEqual([]);
  });

  it("reads a raw primitive's states from what its rail examples hand its tag", () => {
    const states = (slug: string) => [...new Set(componentSignals(reader, component(slug)).map((s) => `${s.state} ${s.what}`))].sort();
    // React Native's own View, Text and ScrollView: no example hands them a handler.
    for (const slug of ["view", "text", "scroll-view"]) expect({ slug, states: states(slug) }).toEqual({ slug, states: [] });
    expect(states("pressable")).toEqual(["disabled disabled on <Pressable>", "focus a tab stop: <Pressable>", "pressed a function taking `pressed` on <Pressable>"]);
    expect(states("text-input")).toEqual(["disabled aria-disabled on <TextInput>", "focus a TextInput"]);
    // An example's props are read as a source's are, spread onto the tag included.
    const spread = reader.exampleSignals("View", [{ label: "Spread", code: "<View {...{ onHoverIn: () => {}, focusable: true }} />" }], "src/atoms/view/view.md");
    expect(spread.map((s) => `${s.state} ${s.what}`)).toEqual(["focus focusable on <View>", "hover onHoverIn on <View>"]);
    // A component with source of its own is read from it, not from its examples.
    expect(reader.hasSource(sourceDirOf(component("button")))).toBe(true);
    expect(reader.hasSource(sourceDirOf(component("view")))).toBe(false);
  });

  it("checks an unpassed-props exemption against the gates and every rail example", () => {
    const feeds = component("feeds");
    const entry = STATE_RECIPES.feeds!;
    const exemption = entry.exempt!.pressed!;
    const own = signalsOf("feeds").filter((s) => s.state === "pressed");
    expect(exemptionFailure("pressed", exemption, own, railExamples(feeds), entry)).toBeNull();
    // An example passing the prop shows the state.
    const passing = [...railExamples(feeds), { label: "Clickable", code: "<Feeds items={items} onItemPress={() => {}} />" }];
    expect(exemptionFailure("pressed", exemption, own, passing, entry)).toBe("the Clickable example passes onItemPress");
    // A signal the prop does not gate is rendered anyway.
    const ungated = [...own, { ...own[0]!, gates: [], at: "src/molecules/feeds/feeds.shared.tsx:1" }];
    expect(exemptionFailure("pressed", exemption, ungated, railExamples(feeds), entry)).toBe("onPress on <Pressable> (src/molecules/feeds/feeds.shared.tsx:1) is rendered without onItemPress");
  });

  it("checks a dismiss-layer exemption against each element, and the open recipe", () => {
    const drawer = STATE_RECIPES.drawer!;
    const layers = signalsOf("drawer").filter((s) => s.state === "pressed");
    expect(layers.map((s) => s.element)).toEqual([
      { hidden: true, look: false, handler: "() => {}" },
      { hidden: true, look: false, handler: "() => setOpen(false)" },
    ]);
    expect(exemptionFailure("pressed", drawer.exempt!.pressed!, layers, [], drawer)).toBeNull();
    // The Dialog's own buttons are announced and dim when pressed: controls, not layers.
    const dialog = signalsOf("dialog").filter((s) => s.state === "pressed");
    expect(exemptionFailure("pressed", drawer.exempt!.pressed!, dialog, [], STATE_RECIPES.dialog!)).toMatch(/is not a hidden dismiss layer$|are not a hidden dismiss layer$/);
    // Without the open recipe nothing captures what the layers dismiss.
    const noOpen: ComponentStates = { exempt: drawer.exempt };
    expect(exemptionFailure("pressed", drawer.exempt!.pressed!, layers, [], noOpen)).toBe("the component has no open recipe to capture the overlay the layers dismiss");
  });

  it("refuses an exemption for a state the source does not give, or beside a recipe", () => {
    const exemption = { claim: { unpassed: ["onPress"] }, reason: "test" };
    const badge = coverageOf("badge", { static: true, reason: "A status label.", exempt: { pressed: exemption } }, signalsOf("badge"), railExamples(component("badge")), rowsOf("badge"));
    expect(badge.errors).toEqual(["badge: exempts pressed, which its source does not give it"]);
    const button = coverageOf("button", { ...(STATE_RECIPES.button as object), exempt: { pressed: exemption } } as ComponentStates, signalsOf("button"), railExamples(component("button")), rowsOf("button"));
    expect(button.errors).toEqual(["button: has a pressed recipe and a pressed exemption"]);
    const invalid = coverageOf("badge", { static: true, reason: "A status label.", exempt: { invalid: exemption } }, signalsOf("badge"), [], rowsOf("badge"));
    expect(invalid.errors).toEqual(["badge: exempts invalid, which no source signal gives"]);
  });

  it("reads gates from ifs, ternaries, &&, early returns and the props a local component is given", () => {
    const root = mkdtempSync(join(tmpdir(), "signals-"));
    try {
      const file = join(root, "src/atoms/probe/probe.shared.tsx");
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(join(root, "src/style.ts"), "export const Pressable = null; export const View = null; export const TextInput = null;\n");
      writeFileSync(
        file,
        `import { Pressable, View, TextInput } from "../../style.js";
function Dot({ onPress }: { onPress?: () => void }) {
  if (!onPress) return <View />;
  return <Pressable onPress={onPress} />;
}
export function Probe(props: { onTap?: () => void; onLong?: () => void; editable?: boolean; tone?: string; onNever?: () => void }) {
  const { onTap, editable } = props;
  return (
    <View>
      {onTap ? <Pressable onPress={onTap} /> : null}
      {props.onLong && <Pressable onLongPress={props.onLong} />}
      {editable ? null : <TextInput />}
      <Dot onPress={props.tone ? () => {} : undefined} />
      <Dot />
      <Pressable onHoverIn={() => {}} />
      <Pressable onPress={undefined} />
    </View>
  );
}
`,
      );
      expect(new SignalReader(root).signalsOf("src/atoms/probe").map(line).sort()).toEqual([
        // Every Pressable is a tab stop on the web, under the same gates as its press.
        "focus tab-stop: a tab stop: <Pressable>",
        "focus tab-stop: a tab stop: <Pressable>",
        "focus tab-stop: a tab stop: <Pressable> [onLong]",
        "focus tab-stop: a tab stop: <Pressable> [onTap]",
        "focus tab-stop: a tab stop: <Pressable> [tone] via Dot",
        // A ternary's false branch is rendered when the prop is NOT passed: no gate.
        "focus text-entry: a TextInput",
        "hover hover-in: onHoverIn on <Pressable>",
        "pressed press: onLongPress on <Pressable> [onLong]",
        "pressed press: onPress on <Pressable> [onTap]",
        // The early return gates Dot's Pressable on its onPress, which Probe gives only with tone; the bare <Dot /> gives none.
        "pressed press: onPress on <Pressable> [tone] via Dot",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads the props a spread gives, the tab stops react-native-web makes, and the overlays a component opens", () => {
    const root = mkdtempSync(join(tmpdir(), "signals-"));
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    try {
      write("src/style.ts", "export const Pressable = null; export const View = null; export const AnchoredOverlay = null;\n");
      // A style-layer hook whose result is spread: the reader builds its value where the hook does.
      write(
        "src/style/hoverish.ts",
        `import { useMemo } from "react";
export function useHoverish() {
  const target = useMemo(() => ({ onPointerEnter: () => {}, onPointerLeave: () => {} }), []);
  return { hovered: false, target };
}
`,
      );
      // Another kit component that renders an overlay primitive.
      write("src/atoms/sheet/sheet.tsx", `import { Modal } from "react-native";\nexport function Sheet(props: { open?: boolean }) {\n  return <Modal visible={props.open} />;\n}\n`);
      write(
        "src/atoms/probe/probe.shared.tsx",
        `import { useMemo } from "react";
import { Modal } from "react-native";
import { Pressable, View, AnchoredOverlay } from "../../style.js";
import { useHoverish } from "../../style/hoverish.js";
import { Sheet as WebSheet } from "../sheet/sheet.js";
function helper(onPress: () => void) {
  return { onPress, accessibilityRole: "button" as const };
}
export function createProbe(parts: { Sheet?: typeof WebSheet } = {}) {
  const Sheet = parts.Sheet ?? WebSheet;
  return function Probe(props: { pin?: boolean; onTap?: () => void; flag?: boolean; responsive?: boolean; peek?: boolean }) {
    const hoverProps = props.pin ? {} : { onHoverIn: () => {}, onHoverOut: () => {} };
    const memo = useMemo(() => ({ onLongPress: () => {} }), []);
    const { target } = useHoverish();
    const asSheet = !!props.responsive;
    return (
      <View>
        <Pressable {...hoverProps} focusable={false} />
        <View {...(props.onTap ? { onPress: props.onTap } : undefined)} />
        <View {...memo} />
        <View {...helper(() => {})} />
        <View {...target} />
        <View focusable />
        <View accessibilityRole={props.flag ? "button" : undefined} />
        <Pressable tabIndex={-1} onPress={() => {}} />
        <Pressable disabled onPress={() => {}} />
        {props.peek ? <AnchoredOverlay open /> : null}
        <Modal visible={false} />
        {asSheet ? <Sheet open={props.flag} /> : null}
        <Sheet />
      </View>
    );
  };
}
`,
      );
      expect(new SignalReader(root).signalsOf("src/atoms/probe").map(line).sort()).toEqual([
        // A Pressable disabled outright: a disabled control the component disables by itself.
        "disabled disabled: disabled on <Pressable>",
        // `focusable` on a View, and a role react-native-web makes a stop, gated by its condition.
        'focus tab-stop: accessibilityRole "button" on <View>',
        'focus tab-stop: accessibilityRole "button" on <View> [flag]',
        "focus tab-stop: focusable on <View>",
        // The hover-in pair from an object chosen by a ternary (a falsy `pin` says no prop was
        // passed), and the pointer pair a style-layer hook builds with useMemo; the Pressable
        // they are on is kept out of the tab order.
        "hover hover-in: onHoverIn on <Pressable>",
        "hover hover-in: onHoverOut on <Pressable>",
        "hover hover-in: onPointerEnter on <View>",
        "hover hover-in: onPointerLeave on <View>",
        // An overlay primitive shown only with `peek`; a kit component that renders one,
        // given its open state under `!!props.responsive` (and its value, `flag`). Neither
        // `visible={false}` nor a Sheet given no open state opens anything.
        "open overlay: a <AnchoredOverlay> [peek]",
        "open overlay: a <Sheet> (an overlay) given `open` [flag&responsive]",
        // A spread from a conditional, from useMemo and from a local helper's return; the
        // Pressables taken out of the tab order (tab index -1, disabled) still press.
        "pressed press: onLongPress on <View>",
        "pressed press: onPress on <Pressable>",
        "pressed press: onPress on <Pressable>",
        "pressed press: onPress on <View>",
        "pressed press: onPress on <View> [onTap]",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("places a disabled control in the overlay it renders inside, reads the ways it is disabled, and drops one its overlay's own gate keeps closed", () => {
    const root = mkdtempSync(join(tmpdir(), "signals-"));
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    try {
      write("src/style.ts", "export const Pressable = null; export const View = null; export const AnchoredOverlay = null; export const Portal = null;\n");
      // Another kit component that renders an overlay primitive, and one that is a plain button.
      write("src/atoms/sheet/sheet.tsx", `import { Modal } from "react-native";\nexport function Sheet(props: { open?: boolean; children?: unknown }) {\n  return <Modal visible={props.open}>{props.children as never}</Modal>;\n}\n`);
      write("src/atoms/knob/knob.tsx", `export function Knob(props: { disabled?: boolean }) {\n  return null;\n}\n`);
      write(
        "src/atoms/probe/probe.shared.tsx",
        `import { useState } from "react";
import { Pressable, View, AnchoredOverlay, Portal } from "../../style.js";
import { Sheet } from "../sheet/sheet.js";
import { Knob } from "../knob/knob.js";
function Present({ children }: { children: unknown }) {
  return <Portal>{children as never}</Portal>;
}
function Row({ item, off }: { item: { label: string; disabled?: boolean }; off?: boolean }) {
  return <Pressable disabled={item.disabled} aria-disabled={off} accessibilityState={item.disabled ? { disabled: true } : undefined} />;
}
function kindOf(p: { menu?: boolean }) {
  if (p.menu) return "menu";
  return "plain";
}
export function Probe(props: { items: { label: string; disabled?: boolean }[]; disabled?: boolean; loading?: boolean; gated?: boolean; menu?: boolean }) {
  const { items, disabled, loading, gated } = props;
  const [typed, setTyped] = useState("");
  const blocked = !!gated && typed !== "OK";
  const open = !disabled && typed === "";
  const kind = kindOf(props);
  const confirm = <Pressable disabled={blocked} onPress={() => setTyped("")} />;
  return (
    <View>
      <Knob disabled={disabled || loading} />
      <AnchoredOverlay open={open}>
        {items.map((item) => <Row key={item.label} item={item} off={!!disabled} />)}
        <Row item={items[0]!} />
      </AnchoredOverlay>
      <Present>{confirm}</Present>
      {kind === "menu" ? <Sheet open={typed === "x"}><Pressable disabled={loading} /></Sheet> : null}
    </View>
  );
}
`,
      );
      const signals = new SignalReader(root).signalsOf("src/atoms/probe");
      const lines = signals
        .filter((s) => s.state === "disabled")
        .map((s) => `${s.what}${s.gates.length ? ` [${s.gates.join("&")}]` : ""} by ${s.disabledBy!.map((w) => `${w.props.join("&") || "-"}/${w.keys.join("&") || "-"}`).join(" | ")}${s.within ? ` in ${s.within}` : ""}`)
        .sort();
      expect(lines).toEqual([
        // The rows inside the menu read the item's `disabled` (the key an example writes in an
        // item); a conditional state object is read through its condition. The rows' own
        // `aria-disabled={off}` is given `!!disabled`, which also keeps the menu closed
        // (`const open = !disabled && ...`), so it is never on the page. The confirm, a
        // constant used inside a local component that portals its children, is disabled only
        // with `gated` (`const blocked = !!gated && ...`).
        "accessibilityState on <Pressable> by -/disabled in Probe",
        // A press handed to a kit Button is the Button's, but `disabled` handed to one is the component's: either way.
        "disabled on <Knob> by disabled/- | loading/-",
        // The sheet's button renders only for the `menu` kind (`kindOf(props) === "menu"`);
        // the sheet is rendered in Probe too, but it is the menu's `!disabled` that keeps the
        // menu's rows off the page, not the sheet's.
        "disabled on <Pressable> [menu] by loading/- in Probe",
        "disabled on <Pressable> by -/disabled in Probe",
        "disabled on <Pressable> by gated/- in Present",
      ]);
      // What an example asks for: props written on a tag, keys written in an item, never one given `false`.
      const confirm = signals.find((s) => s.what === "disabled on <Pressable>" && s.within === "Present")!;
      const item = signals.find((s) => s.what === "disabled on <Pressable>" && s.within === "Probe" && !s.gates.length)!;
      expect(asksFor(confirm, { code: "<Probe gated items={[]} />" })).toBe(true);
      expect(asksFor(confirm, { code: "<Probe gated={false} items={[]} />" })).toBe(false);
      expect(asksFor(confirm, { code: '<Probe items={[{ label: "gated" }]} />' })).toBe(false);
      expect(asksFor(item, { code: '<Probe items={[{ label: "A", disabled: true }]} />' })).toBe(true);
      expect(asksFor(item, { code: '<Probe items={[{ label: "A", disabled: false }]} />' })).toBe(false);
      expect(asksFor(item, { code: "<Probe disabled items={[]} />" })).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads a disabled value a helper's return brings with the helper's parameters bound to the call's arguments, and fails on one it cannot bind", () => {
    const root = mkdtempSync(join(tmpdir(), "signals-"));
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    try {
      write("src/style.ts", "export const Pressable = null; export const TextInput = null; export const View = null;\n");
      // A field's availability on every channel, from an object-destructured parameter, as
      // src/style/text-entry-state.ts writes it, in a module of the style layer.
      write(
        "src/style/field-state.ts",
        `export function fieldState({ disabled, readOnly }: { disabled?: boolean; readOnly?: boolean }) {
  const off = !!disabled;
  return { editable: !off && !readOnly, accessibilityState: { disabled: off }, "aria-disabled": off || undefined };
}
`,
      );
      // Helpers in a module of the component's own: positional parameters with defaults, a
      // parameter handed the component's props object, and a helper that calls another.
      write(
        "src/atoms/probe/probe.helpers.ts",
        `export function knobState(min: number, value: number, { disabled = false }: { disabled?: boolean } = {}) {
  return { disabled: disabled || value <= min };
}
export function fromProps(p: { locked?: boolean }) {
  return { "aria-disabled": p.locked };
}
function announced(off?: boolean) {
  return { "aria-disabled": off || undefined };
}
export function wrapped({ disabled }: { disabled?: boolean }) {
  return { ...announced(disabled) };
}
`,
      );
      write(
        "src/atoms/probe/probe.shared.tsx",
        `import { Pressable, TextInput, View } from "../../style.js";
import { fieldState } from "../../style/field-state.js";
import { fromProps, knobState, wrapped } from "./probe.helpers.js";
function rowState(off: boolean) {
  return { disabled: off };
}
function renderRow(off: boolean) {
  return <Pressable disabled={off} />;
}
export function Probe(props: { disabled?: boolean; readOnly?: boolean; locked?: boolean; value: number; flags: [boolean] }) {
  const { disabled, readOnly, value } = props;
  const entry = fieldState({ disabled, readOnly });
  const { editable } = entry;
  return (
    <View>
      <TextInput {...entry} />
      <TextInput {...fieldState({ disabled })} accessibilityState={{ ...entry.accessibilityState, expanded: true }} />
      <Pressable disabled={!editable} />
      <Pressable {...knobState(0, value, { disabled: !!disabled })} />
      <Pressable {...fromProps(props)} />
      <Pressable {...wrapped({ disabled: readOnly })} />
      <Pressable {...rowState(...props.flags)} />
      {renderRow(!!disabled)}
    </View>
  );
}
`,
      );
      const signals = new SignalReader(root).signalsOf("src/atoms/probe");
      const ways = (s: Signal) => s.disabledBy!.map((w) => `${w.props.join("&") || "-"}/${w.keys.join("&") || "-"}${w.unread ? ` unread ${w.unread.join(", ")}` : ""}`).join(" | ");
      const disabled = signals.filter((s) => s.state === "disabled");
      const line = (at: string) => at.split(":").pop();
      expect(disabled.map((s) => `${s.what} on line ${line(s.control!.at)}, from ${s.at.replace(/^.*?src\//, "src/")}, by ${ways(s)}`).sort()).toEqual([
        // The helper's keys, read through each call: `{ disabled, readOnly }` (line 16) and `{ disabled }` (line 17).
        "accessibilityState on <TextInput> on line 16, from src/style/field-state.ts:3, by disabled/-",
        "accessibilityState on <TextInput> on line 17, from src/atoms/probe/probe.shared.tsx:17, by disabled/-",
        "accessibilityState on <TextInput> on line 17, from src/style/field-state.ts:3, by disabled/-",
        // `fromProps(props)`: the parameter's `locked` is the component's.
        "aria-disabled on <Pressable> on line 20, from src/atoms/probe/probe.helpers.ts:5, by locked/-",
        // `wrapped({ disabled: readOnly })` calls `announced(disabled)`: two calls deep, still `readOnly`.
        "aria-disabled on <Pressable> on line 21, from src/atoms/probe/probe.helpers.ts:8, by readOnly/-",
        "aria-disabled on <TextInput> on line 16, from src/style/field-state.ts:3, by disabled/-",
        "aria-disabled on <TextInput> on line 17, from src/style/field-state.ts:3, by disabled/-",
        // `const { editable } = entry`, read through its negation: false with either prop.
        "disabled on <Pressable> on line 18, from src/atoms/probe/probe.shared.tsx:18, by disabled/- | readOnly/-",
        // A positional third argument, destructured with a default; `value <= min` is the component's own.
        "disabled on <Pressable> on line 19, from src/atoms/probe/probe.helpers.ts:2, by disabled/- | -/-",
        // A call that spreads its arguments, and a render helper read where it is written: unread.
        "disabled on <Pressable> on line 22, from src/atoms/probe/probe.shared.tsx:5, by -/- unread `off`, a parameter of rowState (src/atoms/probe/probe.shared.tsx:4), handed through a spread",
        "disabled on <Pressable> on line 8, from src/atoms/probe/probe.shared.tsx:8, by -/- unread `off`, a parameter of renderRow (src/atoms/probe/probe.shared.tsx:7)",
        // `{ disabled }` gives no `readOnly`: the second field is not editable only with `disabled`.
        "editable on <TextInput> on line 16, from src/style/field-state.ts:3, by disabled/- | readOnly/-",
        "editable on <TextInput> on line 17, from src/style/field-state.ts:3, by disabled/-",
      ]);
      // An example asks for the field by passing the prop the helper is handed it through.
      const field = disabled.find((s) => s.what === "editable on <TextInput>" && s.disabledBy!.length === 2)!;
      expect(asksFor(field, { code: "<Probe disabled value={1} flags={[false]} />" })).toBe(true);
      expect(asksFor(field, { code: "<Probe readOnly value={1} flags={[false]} />" })).toBe(true);
      expect(asksFor(field, { code: "<Probe value={1} flags={[false]} />" })).toBe(false);
      // An unread way is never taken to be met, and the coverage fails on it instead of reading
      // the control as one no example asks for.
      const unread = disabled.filter((s) => s.disabledBy!.some((w) => w.unread));
      for (const signal of unread) expect(asksFor(signal, { code: "<Probe disabled value={1} flags={[true]} />" })).toBe(false);
      const errors = coverageOf("probe", {} as ComponentStates, signals, [], { web: "web" }).errors.filter((e) => e.includes("cannot follow"));
      expect(errors.sort()).toEqual([
        "probe: its source disables disabled on <Pressable> at src/atoms/probe/probe.shared.tsx:5 through `off`, a parameter of rowState (src/atoms/probe/probe.shared.tsx:4), handed through a spread, which the reader cannot follow to the props or keys an example passes, so it cannot tell whether an example asks for that control",
        "probe: its source disables disabled on <Pressable> at src/atoms/probe/probe.shared.tsx:8 through `off`, a parameter of renderRow (src/atoms/probe/probe.shared.tsx:7), which the reader cannot follow to the props or keys an example passes, so it cannot tell whether an example asks for that control",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads the kit's fields as disabled with their `disabled` prop through the text-entry helper, as the same value written on the tag is", () => {
    // Input, Textarea and the Stepper's field are handed `editable`, `aria-disabled` and an
    // accessibilityState by a helper (src/style/text-entry-state.ts, Stepper's own
    // stepper.accessibility.ts) from the props they spread its call's arguments from.
    const ways = (s: Signal) => s.disabledBy!.map((w) => `${w.props.join("&") || "-"}/${w.keys.join("&") || "-"}${w.unread ? " unread" : ""}`).join(" | ");
    const field = (slug: string) => signalsOf(slug).filter((s) => s.state === "disabled" && s.control?.tag === "TextInput");
    const read = (slug: string) => [...new Set(field(slug).map((s) => `${s.what} by ${ways(s)}`))].sort();
    expect(read("input")).toEqual(["accessibilityState on <TextInput> by disabled/-", "aria-disabled on <TextInput> by disabled/-", "editable on <TextInput> by disabled/- | readOnly/-"]);
    expect(read("textarea")).toEqual(["accessibilityState on <TextInput> by disabled/-", "aria-disabled on <TextInput> by disabled/-", "editable on <TextInput> by disabled/-"]);
    expect(read("stepper")).toEqual(["accessibilityState on <TextInput> by disabled/-", "aria-disabled on <TextInput> by disabled/-", "editable on <TextInput> by disabled/-"]);
    // So each field's Disabled example asks for its field on every channel.
    for (const slug of ["input", "textarea", "stepper"]) {
      const example = railExamples(component(slug)).find((e) => e.label === "Disabled")!;
      const asked = [...new Set(field(slug).filter((s) => asksFor(s, example)).map((s) => s.what))].sort();
      expect({ slug, asked }).toEqual({ slug, asked: ["accessibilityState on <TextInput>", "aria-disabled on <TextInput>", "editable on <TextInput>"] });
    }
  });
});

describe("the controls a component's source gives its states", () => {
  it("names each control, the place it renders in, the roles the page gives it and what decides whether it is there", () => {
    const root = mkdtempSync(join(tmpdir(), "signals-"));
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    try {
      write("src/style.ts", "export const Pressable = null; export const View = null; export const TextInput = null; export const AnchoredOverlay = null;\n");
      // A drawer that renders its content inside its overlay, a menu whose content is its trigger, and a plain button.
      write("src/atoms/sheet/sheet.tsx", `import { Modal } from "react-native";\nexport function Sheet(props: { open?: boolean; children?: unknown }) {\n  return <Modal visible={props.open}>{(props.children) as never}</Modal>;\n}\n`);
      write(
        "src/atoms/menu/menu.tsx",
        `import { Pressable, AnchoredOverlay } from "../../style.js";\nexport function Menu(props: { open?: boolean; children?: unknown }) {\n  return <Pressable accessibilityRole="button">{props.children as never}<AnchoredOverlay open={props.open} /></Pressable>;\n}\n`,
      );
      write("src/atoms/knob/knob.tsx", `import { Pressable } from "../../style.js";\nexport function Knob(props: { disabled?: boolean }) {\n  return <Pressable accessibilityRole="button" disabled={props.disabled} />;\n}\n`);
      write(
        "src/atoms/probe/probe.shared.tsx",
        `import { Platform } from "react-native";
import { Pressable, View, TextInput, AnchoredOverlay } from "../../style.js";
import { Sheet } from "../sheet/sheet.js";
import { Menu } from "../menu/menu.js";
import { Knob } from "../knob/knob.js";
function Frame({ children }: { children: unknown }) {
  return <View onPointerEnter={() => {}}>{children as never}</View>;
}
function Item({ children, onPress }: { children?: unknown; onPress?: () => void }) {
  if (children == null) return null;
  return <Pressable accessibilityRole="link" onPress={onPress}>{children as never}</Pressable>;
}
export function Probe(props: { onTap?: () => void; onItem?: () => void; open?: boolean; editing?: boolean; disabled?: boolean; flag?: boolean }) {
  const { onTap, onItem, open, disabled } = props;
  const onPress = onItem ? () => onItem() : undefined;
  const layer = (hoverable = true) => <Pressable accessibilityRole={onTap ? "button" : undefined} {...(hoverable ? { onHoverIn: () => {} } : {})} />;
  const rows = <Pressable accessibilityRole="checkbox" onPress={() => {}} />;
  return (
    <View>
      <Frame><Pressable accessibilityRole="button" style={({ pressed }) => [onTap && pressed ? { opacity: 0.8 } : null]} /></Frame>
      <View accessibilityRole="adjustable" focusable />
      <TextInput editable={!disabled} />
      <Pressable tabIndex={Platform.select({ web: -1, default: undefined })} onPress={() => {}} />
      <Pressable {...(props.flag ? { focusable: false } : { accessibilityRole: "button" as const })} />
      <Item onPress={onPress}>Home</Item>
      <Knob disabled={disabled} />
      {layer()}
      <AnchoredOverlay open={open}>{layer(false)}</AnchoredOverlay>
      {rows}
      <Sheet open={open}>{rows}</Sheet>
      <Menu open={open}><View onPointerEnter={() => {}} /></Menu>
    </View>
  );
}
`,
      );
      const signals = new SignalReader(root).signalsOf("src/atoms/probe");
      const at = (s: (typeof signals)[number]) => s.control?.at.replace("src/atoms/probe/probe.shared.tsx:", "") ?? "-";
      const lines = [
        ...new Set(
          signals
            .filter((s) => s.state !== "open")
            .map((s) => {
              const c = s.control;
              const what = c ? `${c.in} <${c.tag}> ${c.roles.join("/") || "no role"}${c.noRole ? " or none" : ""}${c.kit ? " kit" : ""}${c.inside ? ` inside ${c.inside.join(">")}` : ""}` : `no element, in ${s.in ?? "-"}`;
              return `${s.state} ${s.kind} @${at(s)} ${what}${s.gates.length ? ` [${[...s.gates].sort().join("&")}]` : ""}${s.within ? ` in ${s.within}` : ""}`;
            }),
        ),
      ].sort();
      expect(lines).toEqual([
        // A TextInput is disabled through `editable`, React Native's text field having no
        // `disabled`; a kit component the component disables has its own disabled control's roles.
        "disabled disabled @22 Probe <TextInput> textbox",
        "disabled disabled @26 Probe <Knob> button kit",
        // `children` given between the tags renders the item, a link.
        "focus link @11 Item <Pressable> link",
        "focus tab-stop @11 Item <Pressable> link",
        // A role reached only under a condition: a button, or no role at all; on the surface and in the menu.
        "focus tab-stop @16 layer <Pressable> button or none",
        "focus tab-stop @16 layer <Pressable> button or none in Probe",
        // The checkbox row a constant holds is on the surface and inside the drawer that renders its content.
        "focus tab-stop @17 Probe <Pressable> checkbox",
        "focus tab-stop @17 Probe <Pressable> checkbox in Probe",
        // Inside the frame whose hover target it is; react-native-web maps `adjustable` to `slider`.
        "focus tab-stop @20 Probe <Pressable> button inside Frame",
        "focus tab-stop @21 Probe <View> slider",
        // A tab stop taken out on one side of a condition is still one on the other, with no role there.
        "focus tab-stop @24 Probe <Pressable> button or none",
        "focus text-entry @22 Probe <TextInput> textbox",
        // The render helper's hover is given only where its call passes `hoverable`: not in the menu.
        "hover hover-in @16 layer <Pressable> button or none",
        // A Menu's children are its trigger, on the surface; the frame's hover is its own.
        "hover hover-in @31 Probe <View> no role",
        "hover hover-in @7 Frame <View> no role",
        // A look read only under `onTap` changes only with it.
        "pressed look @20 Probe <Pressable> button inside Frame [onTap]",
        // The press a local constant gives only with `onItem`.
        "pressed press @11 Item <Pressable> link [onItem]",
        "pressed press @17 Probe <Pressable> checkbox",
        "pressed press @17 Probe <Pressable> checkbox in Probe",
        // On the web its tab index is -1: a press, and no tab stop.
        "pressed press @23 Probe <Pressable> no role",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("the rows of the docs' three-up a state is answered on", () => {
  const check = (slug: string, entry: Record<string, unknown>) => coverageOf(slug, entry as ComponentStates, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors;
  const table = STATE_RECIPES as Record<string, Record<string, unknown>>;
  /** A recipe as the table had it, on the web row alone. */
  const onWeb = (slug: string, name: string): StateRecipe => ({ ...recipeFor(slug, name), rows: ["web"] });
  /** Each control a state is on, where it is, and the builds that render it. */
  const builds = (slug: string, state: string) =>
    [...new Set(signalsOf(slug).filter((s) => s.state === state && s.control).map((s) => `${s.control!.at.replace(/^src\/[a-z]+\/[a-z-]+\//, "")} ${s.control!.tag}${s.control!.kit ? " kit" : ""}: ${s.builds?.join(" and ") ?? "every build"}`))].sort();

  it("reads which platform build renders each control, from the skin each entry hands the shell's factory", () => {
    // Dialog's footer: the iOS build's capsules (`skin.footerKind === "capsules"`) and the
    // Android build's text buttons (`skin.textButton != null`); the web build's are kit
    // Buttons, none of its own. The Dismissible example's scrim is every build's.
    expect(builds("dialog", "focus")).toEqual(["dialog.shared.tsx:211 Pressable: ios", "dialog.shared.tsx:232 Pressable: android", "dialog.shared.tsx:244 Pressable: android"]);
    expect(builds("dialog", "pressed")).toEqual([
      "dialog.shared.tsx:211 Pressable: ios",
      "dialog.shared.tsx:232 Pressable: android",
      "dialog.shared.tsx:244 Pressable: android",
      "dialog.shared.tsx:315 Pressable: every build",
    ]);
    // AlertDialog's confirm (`skin.actionLayout`): the kit Button the web build hands `disabled`, its own on the others.
    expect(builds("alert-dialog", "disabled")).toEqual([
      "alert-dialog.shared.tsx:207 Pressable: ios",
      "alert-dialog.shared.tsx:245 Pressable: android",
      "alert-dialog.shared.tsx:264 Button kit: web",
      "alert-dialog.shared.tsx:268 Button kit: web",
    ]);
    // DataTable's cell editor: the web build's under its glass pane (`skin.liquidTextEntry`), the
    // others' bare; its scroller only where the skin does not collapse to the primary column.
    expect(builds("data-table", "focus").filter((line) => !line.endsWith("every build"))).toEqual([
      "data-table.shared.tsx:429 TextInput: ios and android",
      "data-table.shared.tsx:433 TextInput: web",
      "data-table.shared.tsx:838 ScrollView: web and android",
    ]);
    // The rows each page shows, and the build each renders: Toast's iOS row is the web build,
    // the docs registry injecting no iOS Toast; Sidebar's page shows one preview, the web build.
    expect(rowsOf("dialog")).toEqual({ web: "web", ios: "ios", android: "android" });
    expect(rowsOf("toast")).toEqual({ web: "web", ios: "web", android: "android" });
    expect(rowsOf("sidebar")).toEqual({ web: "web" });
    const capsule = signalsOf("dialog").find((s) => s.state === "focus" && s.builds?.includes("ios"))!;
    expect(rowsOfSignal(capsule, rowsOf("dialog"))).toEqual(["ios"]);
    expect(rowsOfSignal(capsule, rowsOf("sidebar"))).toEqual([]);
  });

  it("answers a place row by row: a recipe whose target on its row is a kit child answers nothing, and a control one build renders needs a recipe on that build's row", () => {
    // The focus and the press on the web row's Cancel, as the table had them: a kit Button, so
    // the iOS capsules and the Android text buttons, Dialog's own, were never captured. (The
    // text buttons' press, `android_ripple` alone, is the devices' whatever the table says.)
    expect(check("dialog", { ...table.dialog, focus: onWeb("dialog", "focus"), pressed: onWeb("dialog", "pressed") })).toEqual([
      "dialog: its focus recipe on the default example answers nothing on the web row: it acts on a button in the overlay in Present, which is none of the component's own controls there (its example renders none); a control another kit component renders is that component's",
      "dialog: its source gives it a focus state in the overlay in Present on the iOS and Android rows (a tab stop: <Pressable> at src/organisms/dialog/dialog.shared.tsx:211, and 2 more), where no focus recipe acts on a control of its own, with no exemption",
      "dialog: its pressed recipe on the default example answers nothing on the web row: it acts on a button in the overlay in Present, which is none of the component's own controls there (its example renders none); a control another kit component renders is that component's",
      "dialog: its source gives it a pressed state in the overlay in Present (onPress on <Pressable> at src/organisms/dialog/dialog.shared.tsx:214, and 2 more), where no pressed recipe acts on a control of its own, with no exemption",
    ]);
    // AlertDialog's the same, and its Body field's confirm: the web row's is the kit Button it
    // disables (its own for that state alone), the iOS and Android rows' its own, asked for too.
    expect(check("alert-dialog", { ...table["alert-dialog"], focus: onWeb("alert-dialog", "focus"), pressed: onWeb("alert-dialog", "pressed"), disabled: onWeb("alert-dialog", "disabled") })).toEqual([
      "alert-dialog: its focus recipe on the default example answers nothing on the web row: it acts on a button in the overlay in Present, which is none of the component's own controls there (its example renders none); a control another kit component renders is that component's",
      "alert-dialog: its source gives it a focus state in the overlay in Present on the iOS and Android rows (a tab stop: <Pressable> at src/molecules/alert-dialog/alert-dialog.shared.tsx:195, and 3 more), where no focus recipe acts on a control of its own, with no exemption",
      "alert-dialog: its pressed recipe on the default example answers nothing on the web row: it acts on a button in the overlay in Present, which is none of the component's own controls there (its example renders none); a control another kit component renders is that component's",
      "alert-dialog: its source gives it a pressed state in the overlay in Present on the iOS row (onPress on <Pressable> at src/molecules/alert-dialog/alert-dialog.shared.tsx:196, and 3 more), where no pressed recipe acts on a control of its own, with no exemption",
      "alert-dialog: its Body field example asks for a disabled control in the overlay in Present on the iOS and Android rows (disabled on <Pressable> at src/molecules/alert-dialog/alert-dialog.shared.tsx:209), with no disabled recipe there",
    ]);
    // DataTable's native cell editor is on the iOS and Android rows alone.
    expect(check("data-table", { ...table["data-table"], focus: onWeb("data-table", "focus") })).toEqual([
      "data-table: its source gives it a focus state on its own surface on the iOS and Android rows (a TextInput at src/organisms/data-table/data-table.shared.tsx:429 via CellEditor), where no focus recipe acts on a control of its own, with no exemption",
    ]);
    // As the table has them, each on the rows its own controls are on: nothing is left, and the
    // answers say which rows they are.
    for (const slug of ["dialog", "alert-dialog", "data-table"]) expect({ slug, errors: check(slug, table[slug]!) }).toEqual({ slug, errors: [] });
    const answers = (slug: string) => coverageOf(slug, STATE_RECIPES[slug]!, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).answers.map((a) => `${a.state} ${a.by}${a.within ? ` in ${a.within}` : ""}${a.rows ? ` on ${a.rows.join(" and ")}` : ""}`);
    // The press: the iOS capsules (and the Dismissible example's scrim, every build's) by the
    // recipe on the iOS row; the Android text buttons, `android_ripple` alone, by the devices.
    expect(answers("dialog")).toEqual(["focus recipe in Present on ios and android", "pressed recipe in Present", "pressed devices in Present on android", "open recipe"]);
    expect(answers("alert-dialog")).toEqual(["focus recipe in Present on ios and android", "pressed recipe in Present on ios", "pressed devices in Present on android", "open recipe", "disabled recipe in Present"]);
    // A recipe on the iOS row's Cancel is held to the iOS build's controls there: the capsule.
    expect(controlFailure(recipeFor("dialog", "focus"), "focus", "Present", signalsOf("dialog"), railExamples(component("dialog")), "ios")).toBeNull();
    expect(controlFailure(recipeFor("dialog", "focus"), "focus", "Present", signalsOf("dialog"), railExamples(component("dialog")), "web")).toBe(
      "it acts on a button in the overlay in Present, which is none of the component's own controls there (its example renders none); a control another kit component renders is that component's",
    );
  });

  it("reads a skin's branches through a ternary, &&, an early return, a constant and a component a factory builds, and the skin a build spreads", () => {
    const root = mkdtempSync(join(tmpdir(), "signals-"));
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    try {
      write("src/style.ts", "export const Pressable = null; export const View = null; export const TextInput = null;\n");
      write(
        "src/atoms/probe/probe.styles.ts",
        `export interface ProbeSkin { kind: "capsules" | "buttons"; textButton: { padding: number } | null; flag?: boolean; inner: "row" | "none" }
export const webSkin: ProbeSkin = { kind: "buttons", textButton: null, inner: "none" };
export const iosSkin: ProbeSkin = { ...webSkin, kind: "capsules", flag: true, inner: "row" };
export const androidSkin: ProbeSkin = { kind: "buttons", textButton: { padding: 8 }, inner: "row" };
`,
      );
      // A component the shell's factory builds with a factory of its own, from the same skin.
      write(
        "src/atoms/probe/probe.inner.tsx",
        `import { Pressable } from "../../style.js";
import type { ProbeSkin } from "./probe.styles.js";
export function createInner(skin: ProbeSkin) {
  return function Inner() {
    return skin.inner === "row" ? <Pressable accessibilityRole="radio" onPress={() => {}} /> : null;
  };
}
`,
      );
      write(
        "src/atoms/probe/probe.shared.tsx",
        `import { Pressable, View, TextInput } from "../../style.js";
import { createInner } from "./probe.inner.js";
import type { ProbeSkin } from "./probe.styles.js";
export function createProbe(skin: ProbeSkin) {
  const Inner = createInner(skin);
  return function Probe(props: { open?: boolean }) {
    const footer = skin.kind === "capsules" ? <Pressable accessibilityRole="button" /> : skin.textButton != null ? <Pressable accessibilityRole="link" /> : null;
    if (skin.flag && props.open) return <TextInput />;
    return (
      <View>
        {footer}
        {skin.flag && <Pressable accessibilityRole="checkbox" />}
        <Pressable accessibilityRole="switch" />
        <Inner />
      </View>
    );
  };
}
`,
      );
      for (const [file, skin] of [["probe.tsx", "webSkin"], ["probe.ios.tsx", "iosSkin"], ["probe.android.tsx", "androidSkin"]]) {
        write(`src/atoms/probe/${file}`, `import { createProbe } from "./probe.shared.js";\nimport { ${skin} } from "./probe.styles.js";\nexport const Probe = createProbe(${skin});\n`);
      }
      const probe = new SignalReader(root);
      const lines = [
        ...new Set(
          probe
            .signalsOf("src/atoms/probe")
            .filter((s) => s.state === "focus")
            .map((s) => `${s.control!.roles.join("/") || s.control!.tag}: ${s.builds?.join(" and ") ?? "every build"}${s.via.length ? ` via ${s.via.join(">")}` : ""}`),
        ),
      ].sort();
      expect(lines).toEqual([
        // The iOS build's skin spreads the web's and overrides its kind: the capsule's.
        "button: ios",
        // `skin.flag && ...`, which the iOS skin alone sets; the early return `skin.flag &&
        // props.open` reads a prop beside it, so what follows it is still every build's.
        "checkbox: ios",
        // `skin.textButton != null`, after the capsules' branch: Android's alone.
        "link: android",
        // `createInner(skin)` read where its component is used, through the shell's skin.
        "radio: ios and android via Inner",
        "switch: every build",
        "textbox: ios",
      ]);
      expect(probe.entriesOf("src/atoms/probe")).toEqual([
        { build: "android", file: "src/atoms/probe/probe.android.tsx", exports: ["Probe"] },
        { build: "ios", file: "src/atoms/probe/probe.ios.tsx", exports: ["Probe"] },
        { build: "web", file: "src/atoms/probe/probe.tsx", exports: ["Probe"] },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("places the Sidebar's drill-down rows inside the Drawer it opens, where the rail's recipes do not answer them and the drawer's do", () => {
    // The drill-down is a component the Sidebar's factory builds (`createSidebarDrillDown(skin,
    // Badge)`) and renders inside its Drawer: its rows are the drawer's, gated by `responsive`.
    const places = (state: string) =>
      [...new Set(ownControls(signalsOf("sidebar")).filter((c) => c.signals.some((s) => s.state === state)).map((c) => `${c.place || "surface"}: ${c.control.in} <${c.control.tag}> ${c.control.roles.join("/") || "no role"}`))].sort();
    expect(places("focus")).toEqual([
      "Sidebar: SidebarDrillDown <Pressable> button",
      "Sidebar: renderDrillRow <Pressable> button",
      "Sidebar: renderLeaf <Pressable> button",
      "surface: Sidebar <Pressable> button",
      "surface: renderRow <Pressable> button",
      "surface: renderSection <Pressable> button",
    ]);
    expect(places("hover")).toEqual(["Sidebar: SidebarRowFrame <RippleClip> no role", "surface: SidebarRowFrame <RippleClip> no role"]);
    expect([...new Set(signalsOf("sidebar").filter((s) => s.within === "Sidebar").map((s) => s.gates.join("&")))]).toEqual(["responsive"]);
    // The rail's recipes, as the table had them at the desktop alone, leave the drawer unanswered.
    const rail = { hover: recipeFor("sidebar", "hover-default"), focus: recipeFor("sidebar", "focus-default"), pressed: recipeFor("sidebar", "pressed-default"), open: recipeFor("sidebar", "open") };
    expect(check("sidebar", rail)).toEqual([
      "sidebar: its source gives it a hover state in the overlay in Sidebar (useHover() (src/style/hover.tsx) at src/organisms/sidebar/sidebar.item.tsx:98 via SidebarDrillDown > SidebarRowFrame, and 2 more), where no hover recipe acts on a control of its own, with no exemption",
      "sidebar: its source gives it a focus state in the overlay in Sidebar (a tab stop: <Pressable> at src/organisms/sidebar/sidebar.drilldown.tsx:106 via SidebarDrillDown, and 2 more), where no focus recipe acts on a control of its own, with no exemption",
      "sidebar: its source gives it a pressed state in the overlay in Sidebar (onPress on <Pressable> at src/organisms/sidebar/sidebar.drilldown.tsx:114 via SidebarDrillDown, and 5 more), where no pressed recipe acts on a control of its own, with no exemption",
    ]);
    // A recipe inside the drawer acts on a row of the drill-down's own there, and answers it.
    for (const name of ["hover-default-inside", "focus-default-inside", "pressed-default-inside"]) {
      const recipe = recipeFor("sidebar", name);
      expect({ name, inOverlay: recipe.inOverlay, widths: [...recipe.widths], failure: controlFailure(recipe, recipe.state as "hover" | "focus" | "pressed", "Sidebar", signalsOf("sidebar"), railExamples(component("sidebar")), "web") }).toEqual({
        name,
        inOverlay: true,
        widths: widthsAtOrBelow("lg"),
        failure: null,
      });
    }
    expect(check("sidebar", table.sidebar!)).toEqual([]);
  });

  it("records a control no row of its page renders as judged on devices, never as captured, and refuses a recipe on a row the page does not show", () => {
    // Were Dialog's page to show the web row alone, its own footer buttons (the iOS and Android
    // builds') would never be on the web runner's page: the devices', with nothing to capture.
    const webOnly = { web: "web" } as const;
    const signals = signalsOf("dialog").filter((s) => s.state === "focus" || s.state === "open");
    const open = { ...recipeFor("dialog", "open"), rows: ["web"] as const };
    const judged = coverageOf("dialog", { open }, signals, railExamples(component("dialog")), webOnly);
    expect(judged.errors).toEqual([]);
    expect(judged.answers.map((a) => `${a.state} ${a.by}${a.within ? ` in ${a.within}` : ""}${a.builds ? ` (${a.builds.join(" and ")})` : ""}`)).toEqual(["focus devices in Present (ios and android)", "open recipe"]);
    // A recipe applied on a row the page does not show captures nothing.
    expect(coverageOf("dialog", { open: recipeFor("dialog", "open") }, signals, railExamples(component("dialog")), webOnly).errors).toEqual([
      "dialog: its open recipe on the default example is applied on the iOS row, which its page does not show",
      "dialog: its open recipe on the default example is applied on the Android row, which its page does not show",
    ]);
  });
});

describe("the states the web runner can never show", () => {
  const check = (slug: string, entry: Record<string, unknown>) => coverageOf(slug, entry as ComponentStates, signalsOf(slug), railExamples(component(slug)), rowsOf(slug)).errors;
  const table = STATE_RECIPES as Record<string, Record<string, unknown>>;
  const ROW_KEYS = ["web", "ios", "android"] as const;

  it("records a press whose only feedback on a row is `android_ripple` as judged on devices, and refuses a recipe that would set it up there", () => {
    // Dialog's and AlertDialog's Android text buttons press with `android_ripple` and nothing
    // else, which react-native-web drops, so on the Android row the web runner sees no press;
    // the iOS capsules dim under a style function reading `pressed`, which the iOS skin
    // reaches, and the Dismissible example's scrim is given no ripple. Each control, by row.
    const feedback = (slug: string) => {
      const controls = new Map(signalsOf(slug).flatMap((s) => (s.state === "pressed" && s.control ? [[s.control.at, s.control] as const] : [])));
      return [...controls.values()].map((c) => `${c.at.replace(/^src\/[a-z]+\/[a-z-]+\//, "")}: ${ROW_KEYS.map((row) => deviceFeedback(c, "pressed", row, rowsOf(slug), signalsOf(slug)) ?? "-").join(" ")}`).sort();
    };
    expect(feedback("dialog")).toEqual(["dialog.shared.tsx:211: - - -", "dialog.shared.tsx:232: - - android_ripple", "dialog.shared.tsx:244: - - android_ripple", "dialog.shared.tsx:315: - - -"]);
    expect(feedback("alert-dialog")).toEqual(["alert-dialog.shared.tsx:195: - - -", "alert-dialog.shared.tsx:207: - - -", "alert-dialog.shared.tsx:235: - - android_ripple", "alert-dialog.shared.tsx:245: - - android_ripple"]);
    // The press on the iOS and Android rows, as the table had it: on the Android row it set up a
    // state the web runner could never see reached.
    const onNative = (slug: string): StateRecipe => ({ ...recipeFor(slug, "pressed"), rows: ["ios", "android"] });
    expect(check("dialog", { ...table.dialog, pressed: onNative("dialog") })).toEqual([
      "dialog: its pressed recipe on the default example answers nothing on the Android row: the only pressed feedback of a button in Dialog in the overlay in Present there is `android_ripple`, which react-native-web does not draw: the devices judge it",
    ]);
    expect(check("alert-dialog", { ...table["alert-dialog"], pressed: onNative("alert-dialog") })).toEqual([
      "alert-dialog: its pressed recipe on the default example answers nothing on the Android row: the only pressed feedback of a button in AlertDialog in the overlay in Present there is `android_ripple`, which react-native-web does not draw: the devices judge it",
    ]);
    // As the table has it, on the iOS row alone: the text buttons' press is the devices', with
    // the feedback that makes it so, and never a recipe's.
    for (const slug of ["dialog", "alert-dialog"]) {
      const coverage = coverageOf(slug, STATE_RECIPES[slug]!, signalsOf(slug), railExamples(component(slug)), rowsOf(slug));
      expect({ slug, errors: coverage.errors }).toEqual({ slug, errors: [] });
      const devices = coverage.answers.filter((a) => a.by === "devices").map((a) => `${a.state} in ${a.within} on ${a.rows!.join(" and ")}: ${a.feedback} (${a.signals.map((s) => s.at.replace(/^.*\//, "")).join(", ")})`);
      const at = slug === "dialog" ? ["dialog.shared.tsx:234", "dialog.shared.tsx:246"] : ["alert-dialog.shared.tsx:236", "alert-dialog.shared.tsx:246"];
      expect({ slug, devices }).toEqual({ slug, devices: [`pressed in Present on android: android_ripple (${at.join(", ")})`] });
      expect(coverage.answers.some((a) => a.by === "recipe" && a.signals.some((s) => at.some((place) => s.at.endsWith(place))))).toBe(false);
    }
  });

  it("reads per build whether a ripple is all a control shows of a press: the ripple's value, the style functions that read `pressed`, and the handlers that run while it is held", () => {
    const root = mkdtempSync(join(tmpdir(), "signals-"));
    const write = (path: string, text: string) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    try {
      write("src/style.ts", "export const Pressable = null; export const View = null;\n");
      write(
        "src/atoms/probe/probe.styles.ts",
        `export interface ProbeSkin { ripple: ((color: string) => { color: string }) | null; dim: number | null }
export const webSkin: ProbeSkin = { ripple: null, dim: 0.8 };
export const iosSkin: ProbeSkin = { ...webSkin };
export const androidSkin: ProbeSkin = { ripple: (color) => ({ color }), dim: null };
`,
      );
      write(
        "src/atoms/probe/probe.shared.tsx",
        `import { Pressable, View } from "../../style.js";
import type { ProbeSkin } from "./probe.styles.js";
export function createProbe(skin: ProbeSkin) {
  return function Probe(props: { ripple?: { color: string }; onHold?: () => void }) {
    const ripple = skin.ripple ? skin.ripple("blue") : undefined;
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={() => {}} android_ripple={ripple} style={({ pressed }) => (skin.dim != null && pressed ? { opacity: skin.dim } : null)} />
        <Pressable accessibilityRole="checkbox" onPress={() => {}} android_ripple={ripple} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })} />
        <Pressable accessibilityRole="switch" onPress={() => {}} android_ripple={ripple} style={({ focused }) => (focused ? { opacity: 0.9 } : null)} />
        <Pressable accessibilityRole="radio" onPressIn={props.onHold} android_ripple={ripple} />
        <Pressable accessibilityRole="tab" onPress={() => {}} android_ripple={props.ripple} />
        <Pressable accessibilityRole="menuitem" onPress={() => {}} android_ripple={{ color: "red" }} />
      </View>
    );
  };
}
`,
      );
      for (const [file, skin] of [["probe.tsx", "webSkin"], ["probe.ios.tsx", "iosSkin"], ["probe.android.tsx", "androidSkin"]]) {
        write(`src/atoms/probe/${file}`, `import { createProbe } from "./probe.shared.js";\nimport { ${skin} } from "./probe.styles.js";\nexport const Probe = createProbe(${skin});\n`);
      }
      const probe = new SignalReader(root);
      const signals = probe.signalsOf("src/atoms/probe");
      const controls = new Map(signals.flatMap((s) => (s.control ? [[s.control.at, s.control] as const] : [])));
      const lines = [...controls.values()].map((c) => `${c.roles.join("/")}: ${c.deviceOnly?.map((d) => `${d.prop} ${d.state} on ${d.platform}, ${d.builds?.join(" and ") ?? "every build"}`).join("; ") ?? "none"}`).sort();
      expect(lines).toEqual([
        // The skin gives the ripple on Android alone, and the dim it reads `pressed` under only elsewhere.
        "button: android_ripple pressed on android, android",
        // A style function that reads `pressed` in every build repaints a held press on the web.
        "checkbox: none",
        // A ripple given in every build, read once.
        "menuitem: android_ripple pressed on android, every build",
        // A handler that runs as the press goes down could repaint it.
        "radio: none",
        // One that reads `focused`, which a pointer press sets on the web, repaints it too.
        "switch: none",
        // A ripple the reader cannot read is never taken for all a control shows.
        "tab: none",
      ]);
      // On the Android row, the button's press is the devices'; on the others the web sees it.
      const rows = { web: "web", ios: "ios", android: "android" } as const;
      const button = [...controls.values()].find((c) => c.roles.includes("button"))!;
      expect(ROW_KEYS.map((row) => deviceFeedback(button, "pressed", row, rows, signals))).toEqual([null, null, "android_ripple"]);
      // A recipe on the Android row's button answers nothing there; on the web row it answers the
      // press (the fixture's tab stops, with no focus recipe, are another state's errors).
      const recipe: StateRecipe = { ...recipeFor("button", "pressed"), variant: "default", control: { role: "button" }, rows: ["web", "android"] };
      expect(coverageOf("probe", { pressed: recipe }, signals, [], rows).errors.filter((e) => e.includes("pressed"))).toEqual([
        "probe: its pressed recipe on the default example answers nothing on the Android row: the only pressed feedback of a button in Probe on its own surface there is `android_ripple`, which react-native-web does not draw: the devices judge it",
      ]);
      // With no recipe, the press is not the devices': the web and iOS rows render the button
      // too, where a press with no feedback the web can see is the web's finding to capture.
      const bare = coverageOf("probe", {}, signals, [], rows);
      expect(bare.answers.some((a) => a.by === "devices")).toBe(false);
      expect(bare.errors.filter((e) => e.includes("pressed"))).toEqual([
        "probe: its source gives it a pressed state (onPress on <Pressable> at src/atoms/probe/probe.shared.tsx:8, and 7 more), with neither a pressed recipe nor an exemption",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads a field disabled only through `editable` as one the web never announces, and lists its recipe as unreachable there", () => {
    // React Native's text field is disabled with `editable`, which react-native-web renders
    // `readonly`. The kit's fields also hand the field `aria-disabled` and an
    // accessibilityState, so their Disabled examples are announced disabled.
    const fieldDisabled = (slug: string) => [...new Set(signalsOf(slug).filter((s) => s.state === "disabled" && s.control?.tag === "TextInput").map((s) => `${s.what}${s.readOnly ? " (read-only)" : ""}`))].sort();
    for (const slug of ["input", "textarea", "stepper"]) expect({ slug, signals: fieldDisabled(slug) }).toEqual({ slug, signals: ["accessibilityState on <TextInput>", "aria-disabled on <TextInput>", "editable on <TextInput> (read-only)"] });
    const coverage = (slug: string, signals = signalsOf(slug)) => coverageOf(slug, STATE_RECIPES[slug]!, signals, railExamples(component(slug)), rowsOf(slug));
    const unreachable = (slug: string, signals?: ReturnType<typeof signalsOf>) => coverage(slug, signals).unreachable.map((u) => `${u.recipe.state} on ${u.recipe.variant}, ${u.rows.join(" and ")}: ${u.why}`);
    for (const slug of ["input", "textarea", "stepper"]) expect({ slug, unreachable: unreachable(slug) }).toEqual({ slug, unreachable: [] });
    // The same field disabled through `editable` alone is one the web never announces: its
    // recipe is unreachable there, and it still answers the state (its cell records the finding).
    const editableOnly = signalsOf("input").filter((s) => !(s.state === "disabled" && s.control?.tag === "TextInput" && !s.readOnly));
    expect(unreachable("input", editableOnly)).toEqual(["disabled on disabled, web: read-only"]);
    expect(coverage("input", editableOnly).answers.filter((a) => a.state === "disabled").map((a) => a.by)).toEqual(["recipe"]);
  });
});

describe("the press release", () => {
  const record = (over: Partial<PressRecord> = {}): PressRecord => ({
    aria: '- button "Cancel"',
    location: "/components/dialog",
    connected: true,
    styles: { nodes: [{ key: "control <div>", values: { opacity: "1" } }], size: 1 },
    shot: null,
    focus: "nothing",
    ...over,
  });
  // The pixel comparison is the only reading that needs the page; none of these get to it.
  const page = { evaluate: () => Promise.reject(new Error("no page")) } as unknown as Parameters<typeof pressTrace>[0];

  it("counts a click the control is delivered after a move-off as the press firing, and one on a thumb coming up in place as none", () => {
    expect(pressFired("move-off", [])).toBeNull();
    expect(pressFired("move-off", ['<div role="button">'])).toBe('a click reached <div role="button"> in the control as the button came up, so its press fired');
    expect(pressFired("in-place", ["<div>"])).toBeNull();
  });

  it("reads a control the press took out of the page, and the overlay it closed, as the press taking effect", async () => {
    expect(await pressTrace(page, record({ shot: null }), record({ shot: null }))).toEqual(["the control could not be photographed before and after the press"]);
    const gone = record({ aria: "(the scope is gone)", connected: false, styles: null });
    expect(await pressTrace(page, record(), gone)).toEqual(["the overlay the control was pressed in closed", "the pressed control left the page"]);
    // Still there, but looking pressed: the look is compared.
    const dimmed = record({ styles: { nodes: [{ key: "control <div>", values: { opacity: "0.6" } }], size: 1 } });
    expect(await pressTrace(page, record(), dimmed)).toEqual(["the control's look changed: control <div> opacity 1 -> 0.6", "the control could not be photographed before and after the press"]);
  });
});

describe("the inspection diff", () => {
  it("counts text as multisets and paints by position", () => {
    const rest = { texts: ["Q1", "Q2", "Q3"], marks: ["a", "b"], others: ["x"] };
    const now = { texts: ["Q1", "Q2", "Q3", "Q2", "Revenue", "70"], marks: ["a", "c"], others: ["x"] };
    // The flag repeats the axis label: one more "Q2" is added, not none.
    expect(inspectionDiff(rest, now)).toEqual({ added: ["Q2", "Revenue", "70"], removed: [], marks: 1, others: 0 });
    expect(inspectionDiff(now, rest)).toEqual({ added: [], removed: ["Q2", "Revenue", "70"], marks: 1, others: 0 });
    // A node added or taken away changes the count: every position past it differs.
    expect(inspectionDiff(rest, { ...rest, others: ["x", "y"] }).others).toBe(2);
  });
});
