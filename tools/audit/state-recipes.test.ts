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
  pressFired,
  pressTrace,
  recipeFor,
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
import { componentSignals, coverageOf, exemptionFailure, railExamples, sourceDirOf, tableCoverage } from "./state-coverage.ts";
import { parseWebFilters, planStateCapture } from "./web-capture.ts";

const pages = components();
const reader = new SignalReader(ROOT);
const component = (slug: string) => pages.find((c) => c.slug === slug)!;
const signalsOf = (slug: string) => reader.signalsOf(sourceDirOf(component(slug)));
/** A signal as one line: kind, state, what, gates and route. */
const line = (s: Signal) => `${s.state} ${s.kind}: ${s.what}${s.gates.length ? ` [${[...s.gates].sort().join("&")}]` : ""}${s.via.length ? ` via ${s.via.join(">")}` : ""}`;
const examplesOf = (slug: string) => pages.find((c) => c.slug === slug)?.variants.map((v) => v.variant) ?? null;

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
    // and Sidebar become at and below their breakpoints, and the Heatmap's scroller, a tab
    // stop only where the year overflows it, below `sm`.
    const only: Record<string, readonly string[]> = {
      "filter-panel open": widthsAtOrBelow("sm"),
      "sidebar open": widthsAtOrBelow("lg"),
      "heatmap focus": widthsAtOrBelow("sm"),
    };
    for (const slug of Object.keys(STATE_RECIPES)) {
      for (const recipe of recipesOf(slug)) {
        const key = `${slug} ${recipe.state}`;
        const widths = only[key] ?? (recipe.state === "open" ? EVERY_WIDTH : DESKTOP);
        expect({ key, widths: [...recipe.widths] }).toEqual({ key, widths: [...widths] });
        if (recipe.state === "open") expect({ key, frame: recipe.frame }).toEqual({ key, frame: "viewport" });
        // Inside an overlay (a hover, a focus or a press in an opened menu, dialog or sheet,
        // or a card a resting pointer floats) the photograph is the viewport.
        else if (recipe.frame === "viewport") expect(["hover", "focus", "pressed"]).toContain(recipe.state);
        if (recipe.state !== "open") expect([...recipe.rows]).toEqual(["web"]);
        expect(recipe.how.trim()).not.toBe("");
      }
    }
    // The kit's own breakpoints, read off the audit's widths: a phone sits under sm, a tablet under lg.
    expect(widthsAtOrBelow("sm")).toEqual(WIDTHS.filter((w) => w.width <= breakpoints.sm).map((w) => w.key));
    expect([widthsAtOrBelow("sm"), widthsAtOrBelow("lg"), widthsAtOrBelow("xl"), widthsAtOrBelow("2xl")]).toEqual([["phone"], ["phone", "tablet"], ["phone", "tablet"], ["phone", "tablet", "desktop"]]);
  });

  it("plans a state per row and width in every look and surface: button 24 cells, dialog 66, filter panel at a phone's width alone", () => {
    const filters = parseWebFilters({});
    const button = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["button"] }, [...STATE_NAMES]);
    expect(button.byState).toEqual({ hover: 6, focus: 6, pressed: 6, disabled: 6 });
    expect(button.cells).toBe(24);
    expect(button.groups.length).toBe(6);
    const dialog = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["dialog"] }, [...STATE_NAMES]);
    // Open from three rows at three widths; the focus and the press on its Cancel, inside it, at the desktop.
    expect(dialog.byState).toEqual({ focus: 6, pressed: 6, open: 3 * 3 * 6 });
    expect(dialog.cells).toBe(66);
    expect(dialog.groups[0]!.cells.map((c) => `${c.state} ${c.row}.${c.width.key}`)).toEqual([
      "focus web.desktop",
      "pressed web.desktop",
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
    const specs = () => [{ state: "hover" as const, variant: "nosuchexample", rows: ["web" as const], widths: DESKTOP }];
    expect(() => planStateCapture(pages, specs, { ...parseWebFilters({}), only: ["button"] }, ["hover"])).toThrow(/names the example "nosuchexample"/);
  });
});

describe("the states each component's source gives it", () => {
  it("are answered for every component: a recipe, or an exemption whose claim holds", () => {
    const coverage = tableCoverage(pages, STATE_RECIPES, reader);
    expect(coverage.flatMap((c) => c.errors)).toEqual([]);
    // Every exemption in the table, and that it holds.
    const exempt = coverage.flatMap((c) => c.answers.filter((a) => a.by === "exemption").map((a) => `${c.slug} ${a.state}: ${a.failure ?? "holds"}`));
    expect(exempt.sort()).toEqual([
      "drawer pressed: holds",
      "feeds focus: holds",
      "feeds pressed: holds",
      "steps focus: holds",
      "steps pressed: holds",
      "typography focus: holds",
      "typography pressed: holds",
    ]);
    // A state answered by another state's recipe: Tooltip's hover, by the open recipe a resting pointer applies.
    const via = coverage.flatMap((c) => c.answers.filter((a) => a.recipe).map((a) => `${c.slug} ${a.state} by ${a.recipe}`));
    expect(via).toEqual(["tooltip hover by open"]);
  });

  it("fails the Calendar marked static on every state its source gives it, the hover read from its spread", () => {
    const calendar = component("calendar");
    const errors = coverageOf("calendar", { static: true, reason: "a test" }, componentSignals(reader, calendar), railExamples(calendar)).errors;
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
    const check = (slug: string, entry: Record<string, unknown>) => bare(coverageOf(slug, entry as ComponentStates, signalsOf(slug), railExamples(component(slug))).errors);
    expect(check("calendar", calendar)).toEqual([]);
    // A hover recipe that does not open the card leaves the card to nothing, whatever the day peek's recipe opens.
    expect(check("calendar", { ...calendar, hover: { ...recipeFor("sidebar", "hover"), variant: "week" } })).toEqual([
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
      const errors = coverageOf(slug, rest as ComponentStates, signalsOf(slug), railExamples(component(slug))).errors;
      expect({ slug, errors: errors.map((e) => e.replace(/ \(.*\),/, ",")) }).toEqual({ slug, errors: [`${slug}: its source gives it a focus state, with neither a focus recipe nor an exemption`] });
    }
    // Tooltip's open recipe answers its hover only because a resting pointer opens it.
    const tooltip = STATE_RECIPES.tooltip as Record<string, StateRecipe>;
    const clicked = { ...tooltip, open: { ...tooltip.open!, alsoAnswers: undefined } } as ComponentStates;
    expect(coverageOf("tooltip", clicked, signalsOf("tooltip"), railExamples(component("tooltip"))).errors.map((e) => e.replace(/ \(.*\),/, ","))).toEqual([
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
    expect(states("feeds")).toEqual([
      "focus tab-stop: a tab stop: <Pressable> [onItemPress]",
      "focus tab-stop: focusable on <FlatList> [virtualized]",
      "pressed look: a function taking `pressed` [onItemPress]",
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
    expect(states("pressable")).toEqual(["focus a tab stop: <Pressable>", "pressed a function taking `pressed` on <Pressable>"]);
    expect(states("text-input")).toEqual(["focus a TextInput"]);
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
    const badge = coverageOf("badge", { static: true, reason: "A status label.", exempt: { pressed: exemption } }, signalsOf("badge"), railExamples(component("badge")));
    expect(badge.errors).toEqual(["badge: exempts pressed, which its source does not give it"]);
    const button = coverageOf("button", { ...(STATE_RECIPES.button as object), exempt: { pressed: exemption } } as ComponentStates, signalsOf("button"), railExamples(component("button")));
    expect(button.errors).toEqual(["button: has a pressed recipe and a pressed exemption"]);
    const invalid = coverageOf("badge", { static: true, reason: "A status label.", exempt: { invalid: exemption } }, signalsOf("badge"), []);
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
