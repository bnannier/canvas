// The interaction-state recipes (e2e/support/state-recipes.ts) against what they must
// cover: every component the interaction registry lists has recipes or a reason it has
// none, every recipe names an example its page has, every state a component's own source
// gives it (tools/audit/interaction-signals.ts: a scrub surface, a press, hover or field
// handler, the hover primitive, a pressed, hovered or focused look) has a recipe or an
// exemption whose claim holds (tools/audit/state-coverage.ts), every overlay the e2e
// suite opens (and Tooltip and AvatarMenu, which it never opens) has an open recipe, and
// an overlay opens from exactly the rows whose platform build the docs registry injects.
import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { MATERIAL_OVERLAY_RECIPES, TOAST_RECIPE } from "../../e2e/support/overlay-recipes.ts";
import { ROOT } from "../../e2e/support/routes.ts";
import {
  HOVER_PROPERTIES,
  STATE_NAMES,
  STATE_RECIPES,
  checkStateTable,
  inspectionDiff,
  recipeFor,
  recipesOf,
  stateSpecsOf,
  type ComponentStates,
  type StateRecipe,
} from "../../e2e/support/state-recipes.ts";
import { inventory as registry } from "../interactions/registry.ts";
import { registeredSkins } from "../skins/registry.ts";
import { SignalReader, type Signal } from "./interaction-signals.ts";
import { components } from "./inventory.ts";
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

  it("has a hover recipe for every component whose source reads the hover primitive or takes a resting pointer, and no other", () => {
    const withHover = Object.keys(STATE_RECIPES).filter((slug) => recipesOf(slug).some((r) => r.state === "hover")).sort();
    expect(hoverDeclarers()).toEqual(["avatar", "button", "card", "dropdown", "listbox", "pagination", "row-menu", "sidebar"]);
    for (const slug of hoverDeclarers()) expect(withHover).toContain(slug);
    // Command's rows take the active highlight under the pointer and the heatmap's days
    // inspect under it (onHoverIn); nothing else takes a resting pointer.
    const resting = pages.filter((c) => STATE_RECIPES[c.slug] && signalsOf(c.slug).some((s) => s.state === "hover")).map((c) => c.slug).sort();
    expect(resting).toEqual([...hoverDeclarers(), "command", "heatmap"].sort());
    expect(withHover).toEqual(resting);
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

  it("captures hover, focus, pressed, invalid and disabled at the desktop in the row (in the viewport inside an overlay), and open at every width in the viewport", () => {
    for (const slug of Object.keys(STATE_RECIPES)) {
      for (const recipe of recipesOf(slug)) {
        const where = { slug, state: recipe.state, widths: recipe.widths, frame: recipe.frame };
        if (recipe.state === "open") expect(where).toEqual({ slug, state: "open", widths: "all", frame: "viewport" });
        else if ((recipe.state === "hover" || recipe.state === "pressed") && recipe.frame === "viewport") expect(where.widths).toBe("desktop");
        else expect(where).toEqual({ slug, state: recipe.state, widths: "desktop", frame: "row" });
        if (recipe.state !== "open") expect([...recipe.rows]).toEqual(["web"]);
        expect(recipe.how.trim()).not.toBe("");
      }
    }
  });

  it("plans a state per row and width in every look and surface: button 24 cells, dialog 60", () => {
    const filters = parseWebFilters({});
    const button = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["button"] }, [...STATE_NAMES]);
    expect(button.byState).toEqual({ hover: 6, focus: 6, pressed: 6, disabled: 6 });
    expect(button.cells).toBe(24);
    expect(button.groups.length).toBe(6);
    const dialog = planStateCapture(pages, stateSpecsOf, { ...filters, only: ["dialog"] }, [...STATE_NAMES]);
    // Open from three rows at three widths; the press on its Cancel, inside it, at the desktop.
    expect(dialog.byState).toEqual({ pressed: 6, open: 3 * 3 * 6 });
    expect(dialog.cells).toBe(60);
    expect(dialog.groups[0]!.cells.map((c) => `${c.state} ${c.row}.${c.width.key}`)).toEqual([
      "pressed web.desktop",
      "open web.phone", "open web.tablet", "open web.desktop",
      "open ios.phone", "open ios.tablet", "open ios.desktop",
      "open android.phone", "open android.tablet", "open android.desktop",
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

describe("the states each component's source gives it", () => {
  it("are answered for every component: a recipe, or an exemption whose claim holds", () => {
    const coverage = tableCoverage(pages, STATE_RECIPES, reader);
    expect(coverage.flatMap((c) => c.errors)).toEqual([]);
    // Every exemption in the table, and that it holds.
    const exempt = coverage.flatMap((c) => c.answers.filter((a) => a.by === "exemption").map((a) => `${c.slug} ${a.state}: ${a.failure ?? "holds"}`));
    expect(exempt.sort()).toEqual(["drawer pressed: holds", "feeds pressed: holds", "steps pressed: holds", "typography focus: holds", "typography pressed: holds"]);
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
    // The heatmap's day cells exist only in the calendar layout.
    expect(states("heatmap")).toEqual([
      "hover hover-in: onHoverIn on <Pressable> [calendar] via CalendarHeatmap",
      "hover hover-in: onHoverOut on <Pressable> [calendar] via CalendarHeatmap",
      "pressed press: onPress on <Pressable> [calendar] via CalendarHeatmap",
    ]);
    // A local component's gate, mapped through the prop its use passes.
    expect(states("steps")).toEqual(["pressed look: a function taking `pressed` [onStepPress] via Circle", "pressed press: onPress on <Pressable> [onStepPress] via Circle"]);
    expect(states("feeds")).toEqual(["pressed look: a function taking `pressed` [onItemPress]", "pressed press: onPress on <Pressable> [onItemPress]"]);
    // A link role reached only with href; a press only with onPress.
    expect(states("typography")).toEqual(['focus link: accessibilityRole "link" on <Text> [href]', "pressed press: onPress on <Text> [onPress]"]);
    // The slider's thumb: its PanResponder and the skin's pressed ring.
    expect(states("slider")).toEqual(expect.arrayContaining(["pressed responder: PanResponder.create()", "pressed look: a function taking `pressed`"]));
    // A kit Button's press is the Button's, not the EmptyState's that renders it.
    expect(states("empty-state")).toEqual([]);
  });

  it("reads a raw primitive's states from what its rail examples hand its tag", () => {
    const states = (slug: string) => [...new Set(componentSignals(reader, component(slug)).map((s) => `${s.state} ${s.what}`))].sort();
    // React Native's own View, Text and ScrollView: no example hands them a handler.
    for (const slug of ["view", "text", "scroll-view"]) expect({ slug, states: states(slug) }).toEqual({ slug, states: [] });
    expect(states("pressable")).toEqual(["pressed a function taking `pressed` on <Pressable>"]);
    expect(states("text-input")).toEqual(["focus a TextInput"]);
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
