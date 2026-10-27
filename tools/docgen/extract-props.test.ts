import { beforeAll, expect, test } from "bun:test";
import * as path from "node:path";
import * as ts from "typescript";
import { extractInherited, extractProps, parseAxis } from "./extract-props.ts";

const root = path.resolve(import.meta.dir, "../..");
const read = (dir: string) => extractProps([{ dir, file: path.join(root, `src/atoms/${dir}/${dir}.shared.tsx`) }])[dir];

// Loading the kit's full TypeScript project is fixture setup, not a five-second
// performance assertion on the first control. Keep a bounded cold-start budget.
beforeAll(() => { read("button"); }, 30_000);

test("public control refs are resolved from the factory return type and document their actual hosts", () => {
  for (const dir of ["button", "select", "checkbox", "switch", "radio", "slider"]) {
    const group = read(dir)[0];
    const rows = group.props.filter((prop) => prop.name === "ref");
    expect(rows.length).toBe(1);
    expect(rows[0].type).toBe("React.Ref<View>");
    expect(rows[0].required).toBe(false);
    expect(rows[0].description).toContain("interactive");
    expect(rows[0].description).toContain("Native host behavior depends");
    expect(rows[0].description).toContain("React Native Web");
    expect(rows[0].description).toContain("DOM");
    expect(rows[0].description).toContain("accessibility focus");
    expect(group.props.some((prop) => prop.name === "disabled")).toBe(true);
    expect(group.props.some((prop) => prop.name === "key")).toBe(false);
  }
});

test("existing text input refs retain their resolved text host type", () => {
  const ref = read("input")[0].props.find((prop) => prop.name === "ref");
  expect(ref?.type).toMatch(/^React.Ref<(RNTextInput|TextInput)>$/);
  expect(ref?.type).not.toContain("<T>");
});

test("ordinary factories do not acquire an invented ref prop", () => {
  expect(read("badge")[0].props.some((prop) => prop.name === "ref")).toBe(false);
});

test("a matching factory name cannot attach another structurally identical props type's ref", () => {
  const file = path.join(import.meta.dir, "fixtures/ref-factories.tsx");
  const prog = ts.createProgram([file], {
    strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  expect(ts.getPreEmitDiagnostics(prog).map((diagnostic) => diagnostic.messageText)).toEqual([]);
  const groups = extractProps([{ dir: "fixtures", file }], prog).fixtures;
  expect(groups.find((group) => group.name === "CorrectProps")?.props.find((prop) => prop.name === "ref")?.description)
    .toBe("Ref owned by Correct.");
  expect(groups.find((group) => group.name === "MistakenProps")?.props.some((prop) => prop.name === "ref")).toBe(false);
  expect(groups.find((group) => group.name === "OtherProps")?.props.some((prop) => prop.name === "ref")).toBe(false);
});

test("a `//` comment that wraps is read whole, and a blank line, a block comment or a previous member's trailing comment bounds it", () => {
  const file = path.join(import.meta.dir, "fixtures/line-comments.tsx");
  const prog = ts.createProgram([file], { strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext });
  const rows = Object.fromEntries(extractProps([{ dir: "fixtures", file }], prog).fixtures[0].props.map((prop) => [prop.name, prop.description]));
  expect(rows).toEqual({
    label: "A JSDoc description wins over any line comment.",
    destructive: "Tone (pick one; default neutral): a red title and a destructive Button. The run wraps over two lines.",
    small: "Size (pick one). A one-line header carries to the axis's later booleans.",
    large: "Size (pick one). A one-line header carries to the axis's later booleans.",
    disabled: "State.",
    success: "Two families: Semantic status: success / warning.",
    warning: "Two families: Semantic status: success / warning.",
    compact: "Only this line is read.",
    dense: "Only this line is read.",
    loose: "Loose comes after it.",
  });
});

test("ActionPanel's axis rows read whole, the wrapped toggle comment included", () => {
  const file = path.join(root, "src/molecules/action-panels/action-panels.shared.tsx");
  const rows = Object.fromEntries(extractProps([{ dir: "action-panels", file }])["action-panels"][0].props.map((prop) => [prop.name, prop.description]));
  expect(rows.destructive).toBe("Tone (omit for the neutral, primary-action default).");
  expect(rows.inline).toBe("Layout (pick one; default stacks the action below the copy).");
  expect(rows.toggle).toBe("Affordance: render the action as an on/off Switch instead of a Button. The panel always lays out inline in this mode.");
});

const fixture = (name: string) => {
  const file = path.join(import.meta.dir, `fixtures/${name}.tsx`);
  const prog = ts.createProgram([file], { strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext });
  return extractProps([{ dir: "fixtures", file }], prog).fixtures;
};

test("an axis header names its title before the first parenthesis, colon or sentence end, and says whether it is pick-one", () => {
  expect(parseAxis("Intent (pick one; default is the primary action).")).toEqual({ title: "Intent", pickOne: true, note: "Intent (pick one; default is the primary action)." });
  expect(parseAxis("Gutters: horizontal padding (pick one; omit for none).").title).toBe("Gutters");
  expect(parseAxis("Tone (single-series only; pick one; default primary).").pickOne).toBe(true);
  expect(parseAxis("Layout and state. A Button is HUG.")).toEqual({ title: "Layout and state", pickOne: false, note: "Layout and state. A Button is HUG." });
  expect(parseAxis("State.")).toEqual({ title: "State", pickOne: false });
  expect(parseAxis("Size (pick one).").note).toBe("Size (pick one).");
});

test("props carry their axis, the `//` header nearest above them even over a JSDoc, until the next header", () => {
  const widget = fixture("defaults").find((group) => group.name === "WidgetProps")!;
  expect(widget.groups).toEqual([
    { title: "Tone", pickOne: true, note: "Tone (pick one; default neutral)." },
    { title: "Layout", pickOne: false, note: "Layout. The widget hugs its content." },
  ]);
  const axis = Object.fromEntries(widget.props.map((prop) => [prop.name, prop.group]));
  expect(axis).toMatchObject({ label: undefined, success: 0, danger: 0, block: 1, wrap: 1, size: 1, title: 1 });
  // The documented `block` keeps its own description under the header.
  expect(widget.props.find((prop) => prop.name === "block")?.description).toBe("Fill the parent.");
});

test("defaults are the shell's literal initializers, false for an untouched optional boolean, and nothing when computed or contested", () => {
  const widget = fixture("defaults").find((group) => group.name === "WidgetProps")!;
  const defaults = Object.fromEntries(widget.props.map((prop) => [prop.name, prop.default]));
  expect(defaults).toEqual({
    label: '"Widget"',
    success: "false",
    danger: "false",
    block: "false",
    wrap: undefined, // `!props.block` is the component's behavior, not a value
    size: '"large"',
    count: "3",
    offset: "-2",
    open: "true",
    placement: undefined, // "top" in one shell, "bottom" in another
    title: undefined, // a call
  });
});

test("a shared interface is inherited by name, not listed row by row, and documented once on its own", () => {
  const widget = fixture("defaults").find((group) => group.name === "WidgetProps")!;
  expect(widget.inherits).toEqual(["MeasureProps"]);
  expect(widget.props.some((prop) => prop.name === "sm" || prop.name === "lg")).toBe(false);
  // Its own group keeps its rows.
  expect(fixture("defaults").find((group) => group.name === "MeasureProps")?.props.map((prop) => prop.name)).toEqual(["sm", "lg"]);

  const button = read("button").find((group) => group.name === "ButtonProps")!;
  expect(button.inherits).toEqual(["MeasureProps"]);
  expect(button.props.some((prop) => prop.name === "xs" || prop.name === "start")).toBe(false);
  expect(button.groups.map((group) => group.title)).toEqual(["Intent", "Size", "Layout and state"]);
  expect(button.props.find((prop) => prop.name === "primary")).toMatchObject({ group: 0, default: "false" });
  expect(button.props.find((prop) => prop.name === "children")?.default).toBeUndefined();

  const composed = extractProps([{ dir: "composed-chart", file: path.join(root, "src/charts/composed-chart/composed-chart.shared.tsx") }])["composed-chart"];
  expect(composed.find((group) => group.name === "ComposedChartProps")?.inherits).toEqual(['Omit<CartesianSeriesProps, "series">']);

  const inherited = extractInherited();
  expect(Object.keys(inherited)).toEqual(["MeasureProps", "CartesianSeriesProps"]);
  expect(inherited.MeasureProps.props.map((prop) => prop.name)).toContain("start");
  expect(inherited.MeasureProps.groups[0]).toMatchObject({ title: "Measure", pickOne: true });
});

test("a header above a documented member opens its axis (Input's overlaid glyph mode)", () => {
  const input = read("input").find((group) => group.name === "InputProps")!;
  const titles = input.groups.map((group) => group.title);
  expect(titles).toContain("Overlaid glyph mode");
  expect(input.groups[input.props.find((prop) => prop.name === "leadingIcon")!.group!].title).toBe("Overlaid glyph mode");
});
