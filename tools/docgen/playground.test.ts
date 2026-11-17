import { describe, expect, it } from "bun:test";
import { createElement } from "react";
import { playgroundExample } from "./playground";
import { applyPlaygroundElement, playgroundCode } from "../../docs/src/core/playground-example";
import { exampleKnobs } from "../../docs/src/ui/detail/example-knobs";
import { DETAIL_SPECS } from "../../docs/src/core/data/detail-specs";
import type { DocExample, ExampleScope, PropGroup } from "../../docs/src/core/scope";

describe("playground example source and rendering", () => {
  it("keeps the full composition and controlled callback closure around a nested target", () => {
    const source = '<Stateful initial={0}>{(value, setValue) => <Column><Slider value={value} onChange={setValue} /><Typography>{value}</Typography></Column>}</Stateful>';
    const example = playgroundExample(source, ["Slider"], "Slider")!;
    expect(example.expression).toContain('<Column>{applyPlaygroundElement((<Slider value={value} onChange={setValue} />), input, scope.Slider)}<Typography>');
    const shown = playgroundCode(example.source, { props: { disabled: { value: true, code: "true" } }, omit: [] });
    expect(shown).toContain('<Stateful initial={0}>');
    expect(shown).toContain('value={value} onChange={setValue} disabled');
    expect(shown).toContain('<Typography>{value}</Typography>');
    const onChange = () => {};
    const element = applyPlaygroundElement(createElement("Slider", { value: 4, onChange }), { props: { disabled: { value: true, code: "true" } }, omit: [] }, "Slider");
    expect(element.props).toMatchObject({ value: 4, onChange, disabled: true });
  });

  it("clears original axis choices and replaces slots, false values, and children in both outputs", () => {
    const example = playgroundExample('<Button primary large iconLeft={<Icon plus />} disabled>Old label</Button>', ["Button"], "Button")!;
    const icon = createElement("Icon", { check: true });
    const input = {
      props: { iconLeft: { value: icon, code: "<Icon check />" }, disabled: { value: false, code: "false" }, children: { value: 'Save "it" <now>', code: JSON.stringify('Save "it" <now>') } },
      omit: ["primary", "large", "iconLeft", "disabled", "children"],
    };
    const shown = playgroundCode(example.source, input);
    expect(shown).toContain('iconLeft={<Icon check />}');
    expect(shown).toContain('disabled={false}');
    expect(shown).toContain("{" + JSON.stringify('Save "it" <now>') + "}");
    expect(shown).not.toContain("primary");
    expect(shown).not.toContain("Old label");
    const element = applyPlaygroundElement(createElement("Button", { primary: true, large: true, disabled: true }, "Old label"), input, "Button");
    expect(element.props).not.toHaveProperty("primary");
    expect(element.props).not.toHaveProperty("large");
    expect(element.props).toMatchObject({ iconLeft: icon, disabled: false, children: 'Save "it" <now>' });
  });

  it("preserves children when unspecified and removes them when explicitly cleared", () => {
    const example = playgroundExample('<Card><Typography>Content</Typography></Card>', ["Card"], "Card")!;
    expect(playgroundCode(example.source, { props: {}, omit: [] })).toBe('<Card><Typography>Content</Typography></Card>');
    expect(playgroundCode(example.source, { props: {}, omit: ["children"] })).toBe('<Card />');
    const element = applyPlaygroundElement(createElement("Card", {}, "Content"), { props: {}, omit: ["children"] }, "Card");
    expect(element.props).not.toHaveProperty("children");
  });

  it("changes the selected component while preserving its original data and parent tree", () => {
    const example = playgroundExample('<Container><Row relaxed><Badge>One</Badge><Badge>Two</Badge></Row></Container>', ["Row", "Column"], "Column")!;
    expect(example.expression).toContain("input, scope.Column)");
    expect(playgroundCode(example.source, { props: {}, omit: [] })).toBe('<Container><Column relaxed><Badge>One</Badge><Badge>Two</Badge></Column></Container>');
    const element = applyPlaygroundElement(createElement("Row", { relaxed: true, key: "original" }, "One"), { props: {}, omit: [] }, "Column");
    expect(element.type).toBe("Column");
    expect(element.key).toBe("original");
    expect(element.props.children).toBe("One");
  });

  it("transforms exactly one target including a target inside an element slot", () => {
    const source = '<Card actions={<Button primary>First</Button>}><Button>Second</Button></Card>';
    const example = playgroundExample(source, ["Button"], "Button")!;
    expect(example.expression).toContain('actions={applyPlaygroundElement((<Button primary>First</Button>), input, scope.Button)}');
    expect(playgroundCode(example.source, { props: { destructive: { value: true, code: "true" } }, omit: ["primary"] })).toBe('<Card actions={<Button destructive>First</Button>}><Button>Second</Button></Card>');
    expect(playgroundExample(source, ["Input"], "Input")).toBeUndefined();
  });

  it("rejects opaque spreads rather than showing code that retains a cleared prop", () => {
    expect(() => playgroundExample('<Button {...defaults} />', ["Button"], "Button")).toThrow("spread attributes");
  });

  it("preserves the original example verbatim before any knob is edited", () => {
    const original = '<Column>\n  <Button\n    primary\n    accessibilityLabel="Save work"\n  >\n    Save\n  </Button>\n</Column>';
    const example = playgroundExample(original, ["Button"], "Button")!;
    expect(playgroundCode(example.source, { props: {}, omit: [] })).toBe(original);
  });

  it("keeps an edited nested element and its children at their original indentation", () => {
    const original = '<Column>\n    <Button\n      primary\n    >\n      Save\n    </Button>\n</Column>';
    const example = playgroundExample(original, ["Button"], "Button")!;
    const shown = playgroundCode(example.source, { props: { disabled: { value: true, code: "true" } }, omit: [] });
    expect(shown).toContain('\n    <Button\n      primary\n      disabled\n    >\n      Save\n    </Button>');
  });
});

describe("source-derived initial knob values", () => {
  const Checkbox = () => null;
  const InputOTP = () => null;
  const Progress = () => null;
  const Button = () => null;
  const Row = () => null;
  const Column = () => null;
  const Icon = () => null;
  const Stateful = () => null;
  const scope = { Checkbox, InputOTP, Progress, Button, Row, Column, Icon, Stateful, ICON_NAMES: [{ key: "check" }, { key: "plus" }] } as unknown as ExampleScope;
  const example = (render: DocExample["render"]): DocExample[] => [{ label: "Default", code: "", render }];

  it("uses authored uncontrolled defaults, labels, and active axes instead of reference specimen labels", () => {
    const state = exampleKnobs(scope, DETAIL_SPECS.checkbox, example(() => createElement(Checkbox, { defaultChecked: true, small: true }, "Email notifications")));
    expect(state).toMatchObject({ checked: true, disabled: false, children: "Email notifications", description: "", "@Size": "small" });
  });

  it("reads initial values through Stateful without replacing its callback", () => {
    const state = exampleKnobs(scope, DETAIL_SPECS.progress, example(() => createElement(Stateful, {
      initial: 0.25,
      children: (value: number) => createElement(Progress, { value }),
    })));
    expect(state.value).toBe(25);
    expect(state.segments).toBe(0);
  });

  it("converts OTP groups into the knob's group count at the authored length", () => {
    const state = exampleKnobs(scope, DETAIL_SPECS["input-otp"], example(() => createElement(InputOTP, { length: 8, groups: 4 })));
    expect(state.length).toBe(8);
    expect(state.groups).toBe(2);
  });

  it("reads component choices, glyph slots and documented literal boolean defaults", () => {
    const layout = exampleKnobs(scope, DETAIL_SPECS["row-column"], example(() => createElement(Column, { relaxed: true })));
    expect(layout["@component"]).toBe("Column");
    expect(layout["@Gap"]).toBe("relaxed");
    const defaults = [{ props: [{ name: "wrap", default: "true" }] }] as PropGroup[];
    const spec = { ...DETAIL_SPECS.button, knobs: [...DETAIL_SPECS.button.knobs, { kind: "boolean" as const, prop: "wrap", value: false }] };
    const button = exampleKnobs(scope, spec, example(() => createElement(Button, { iconLeft: createElement(Icon, { check: true }) }, "Save")), defaults);
    expect(button.iconLeft).toBe("check");
    expect(button.wrap).toBe(true);
    expect(button.children).toBe("Save");
  });
});
