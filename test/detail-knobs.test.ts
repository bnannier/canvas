import { describe, expect, it } from "bun:test";
import { DETAIL_SPECS, type Knob } from "../docs/src/core/data/detail-specs.ts";
import { componentName, controlledProps, initialKnobs, isPinnedState, jsxCode, knobKey, knobProps, optionLabel, withOption } from "../docs/src/ui/detail/knobs.ts";
import { inStage, placeMarks } from "../docs/src/ui/detail/anatomy-marks.ts";
import { zoomRect } from "../src/style/anatomy.tsx";

// The v4 detail page's pure model: the playground's knob state, the props and JSX it
// produces (the hand-off's `K.init`, `K.props` and `K.code` in tools/v4/handoff/cv-kit.js),
// and where the Anatomy figure's markers go (Component.dc.html `_measure`).

const BUTTON_KNOBS: readonly Knob[] = [
  { kind: "axis", label: "Intent", options: [null, "secondary", "outline", "destructive"] },
  { kind: "axis", label: "Size", options: [null, "small", "large"] },
  { kind: "text", prop: "children", value: "Save changes" },
  { kind: "icon", prop: "iconLeft", value: "" },
  { kind: "boolean", prop: "disabled", value: false },
  { kind: "boolean", prop: "wrap", value: true },
];

describe("knob state", () => {
  it("keys an axis by its label and every other knob by its prop", () => {
    expect(BUTTON_KNOBS.map(knobKey)).toEqual(["@Intent", "@Size", "children", "iconLeft", "disabled", "wrap"]);
    expect(knobKey({ kind: "glyph", value: "plus" })).toBe("@glyph");
    expect(knobKey({ kind: "component", options: ["Row", "Column"], value: "Row" })).toBe("@component");
  });

  it("starts each axis on its first option and every other knob on its value", () => {
    expect(initialKnobs(BUTTON_KNOBS)).toEqual({ "@Intent": null, "@Size": null, children: "Save changes", iconLeft: "", disabled: false, wrap: true });
  });

  it("names the component from the props interface or the component knob", () => {
    const spec = DETAIL_SPECS.button!;
    expect(componentName(spec, initialKnobs(spec.knobs))).toBe("Button");
    const layout = { ...spec, knobs: [{ kind: "component", options: ["Row", "Column"], value: "Row" }] as Knob[] };
    expect(componentName(layout, { "@component": "Column" })).toBe("Column");
  });
});

describe("knob props", () => {
  it("passes the text and every flag that is on at rest, as the hand-off's K.props does", () => {
    expect(knobProps(BUTTON_KNOBS, initialKnobs(BUTTON_KNOBS))).toEqual({ children: "Save changes", wrap: true });
  });

  it("passes the picked axis option, an icon element and a flag switched against its default", () => {
    const state = { ...initialKnobs(BUTTON_KNOBS), "@Intent": "destructive", "@Size": "small", iconLeft: "plus", disabled: true, wrap: false };
    expect(knobProps(BUTTON_KNOBS, state)).toEqual({ destructive: true, small: true, children: "Save changes", iconLeft: { icon: "plus" }, disabled: true, wrap: false });
  });

  it("puts Icon's own glyph first", () => {
    const knobs: Knob[] = [{ kind: "number", prop: "size", min: 12, max: 48, value: 20 }, { kind: "glyph", value: "star" }];
    expect(Object.keys(knobProps(knobs, initialKnobs(knobs)))).toEqual(["star", "size"]);
  });

  it("drops an empty text knob", () => {
    expect(knobProps(BUTTON_KNOBS, { ...initialKnobs(BUTTON_KNOBS), children: "" })).toEqual({ wrap: true });
  });

  it("puts a text knob with an element inside that element, as a View's text must be", () => {
    const knobs: readonly Knob[] = [{ kind: "text", prop: "children", value: "View", element: "Text" }];
    const props = knobProps(knobs, initialKnobs(knobs));
    expect(props).toEqual({ children: { element: "Text", children: "View" } });
    expect(jsxCode("View", props)).toBe("<View><Text>View</Text></View>");
    expect(DETAIL_SPECS.view!.knobs).toEqual(knobs);
  });
});

describe("the props a specimen's page drives", () => {
  it("names every knob's props, the size row and the state props, never a pinned state", () => {
    const controlled = controlledProps(DETAIL_SPECS.button!, []);
    for (const prop of ["secondary", "outline", "destructive", "small", "large", "children", "iconLeft", "disabled", "loading"]) expect(controlled.has(prop), prop).toBe(true);
    for (const state of ["hover", "focus", "pressed"]) expect(controlled.has(state), state).toBe(false);
  });

  it("names Icon's glyphs for its glyph knob, so the example's glyph gives way", () => {
    expect(controlledProps(DETAIL_SPECS.icon!, ["shield", "star"]).has("shield")).toBe(true);
    expect(controlledProps(DETAIL_SPECS.button!, ["shield"]).has("shield")).toBe(false);
  });
});

describe("size and state cells", () => {
  it("replaces the row's other options with the picked one", () => {
    expect(withOption({ large: true, children: "Go" }, [null, "small", "large"], "small")).toEqual({ children: "Go", small: true });
    expect(withOption({ large: true, children: "Go" }, [null, "small", "large"], null)).toEqual({ children: "Go" });
  });

  it("gives a size prop the option as its value, numeric when it reads as a number", () => {
    expect(withOption({}, ["16", "24"], "24", "size")).toEqual({ size: 24 });
    expect(withOption({}, ["sm", "lg"], "lg", "step")).toEqual({ step: "lg" });
  });

  it("pins hover, focus and pressed rather than passing them", () => {
    expect(["hover", "focus", "pressed", "disabled", null].map(isPinnedState)).toEqual([true, true, true, false, false]);
  });

  it("labels the none option and an empty icon", () => {
    expect([null, "", "small"].map(optionLabel)).toEqual(["default", "none", "small"]);
  });
});

describe("jsxCode", () => {
  it("prints a short element on one line", () => {
    expect(jsxCode("Button", { children: "Save changes" })).toBe("<Button>Save changes</Button>");
    expect(jsxCode("Button", { destructive: true, small: true, children: "Delete" })).toBe("<Button destructive small>Delete</Button>");
    expect(jsxCode("Divider", {})).toBe("<Divider />");
  });

  it("prints values by type, an icon as an Icon element", () => {
    expect(jsxCode("Icon", { star: true, size: 20 })).toBe("<Icon star size={20} />");
    expect(jsxCode("Button", { wrap: false, children: "Go" })).toBe("<Button wrap={false}>Go</Button>");
    expect(jsxCode("Button", { iconLeft: { icon: "plus", tone: "primaryForeground" }, children: "Add" })).toBe(
      "<Button iconLeft={<Icon plus primaryForeground size={16} />}>Add</Button>",
    );
  });

  it("breaks one attribute per line past 80 columns", () => {
    const code = jsxCode("Button", { destructive: true, large: true, iconLeft: { icon: "trash2" }, iconRight: { icon: "chevronDown" }, children: "Delete project" });
    expect(code).toBe(
      ["<Button", "  destructive", "  large", "  iconLeft={<Icon trash2 size={16} />}", "  iconRight={<Icon chevronDown size={16} />}", ">", "  Delete project", "</Button>"].join("\n"),
    );
  });
});

describe("placeMarks", () => {
  const box = { width: 400, height: 240 };

  it("alternates markers above and below their parts, 30 px off the edge, in part order", () => {
    const marks = placeMarks(["Container", "Label"], { Container: { x: 100, y: 100, width: 200, height: 40 }, Label: { x: 150, y: 110, width: 40, height: 20 } }, box);
    expect(marks).toEqual([
      { n: 1, x: 200, y: 70, lineTop: 81, lineHeight: 19 },
      { n: 2, x: 170, y: 160, lineTop: 130, lineHeight: 19 },
    ]);
  });

  it("numbers by the spec's order and skips a part that did not render", () => {
    const marks = placeMarks(["Container", "Badge", "Label"], { Container: { x: 100, y: 100, width: 200, height: 40 }, Label: { x: 150, y: 110, width: 40, height: 20 } }, box);
    expect(marks.map((m) => m.n)).toEqual([1, 3]);
  });

  it("keeps a marker inside the figure", () => {
    const [a] = placeMarks(["A"], { A: { x: 0, y: 2, width: 10, height: 4 } }, box);
    expect(a).toEqual({ n: 1, x: 14, y: 14, lineTop: 25, lineHeight: 0 });
  });

  it("places a zoomed part's marker against the stage: the provider's mapped rectangle carried in by its box", () => {
    // The stage is a 480 by 320 well; the provider's root sits 400 wide at (40, 128) in it, its
    // inner box 250 wide at (75, 12), scaled 1.6 about its centre. A container filling the
    // inner box is seen spanning the root, and a label 20 in from its edge 32 in.
    const inner = { x: 75, y: 12, width: 250, height: 40 };
    const box = { x: 40, y: 128, width: 400, height: 64 };
    const seen = { Container: zoomRect({ x: 75, y: 12, width: 250, height: 40 }, inner, 1.6), Label: zoomRect({ x: 95, y: 22, width: 80, height: 20 }, inner, 1.6) };
    const staged = inStage(seen, box);
    expect(staged).toEqual({ Container: { x: 40, y: 128, width: 400, height: 64 }, Label: { x: 72, y: 144, width: 128, height: 32 } });
    const marks = placeMarks(["Container", "Label"], staged, { width: 480, height: 320 });
    expect(marks).toEqual([
      { n: 1, x: 240, y: 98, lineTop: 109, lineHeight: 19 },
      { n: 2, x: 136, y: 206, lineTop: 176, lineHeight: 19 },
    ]);
  });

  it("steps a marker that lands on another 28 px along", () => {
    const rect = { x: 100, y: 100, width: 20, height: 20 };
    const [a, , c] = placeMarks(["A", "B", "C"], { A: rect, B: rect, C: rect }, box);
    expect(a).toMatchObject({ x: 110, y: 70 });
    expect(c).toMatchObject({ x: 138, y: 70 });
  });
});
