import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { Dimensions } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { useFieldWidth } from "../src/style/field-width.ts";
import { fieldWidths } from "../src/style/tokens.ts";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Combobox } from "../src/atoms/combobox/combobox.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { Progress } from "../src/atoms/progress/progress.tsx";
import { Field } from "../src/molecules/field/field.tsx";
import { Form } from "../src/molecules/form/form.tsx";
import { Fieldset } from "../src/molecules/fieldset/fieldset.tsx";

// The standard field width axis (src/style/field-width.ts): a bare input-like
// control RENDERS AT fieldWidths.base at every viewport (narrow/wide pick the
// other two modes, block fills the container instead) and shrinks in narrower
// parents via maxWidth:"100%". The explicit width (not a width:100% + cap) is
// the load-bearing part: in a content-sized context (a centered stage, a row)
// width:100% collapses to the content's natural width, which is exactly the
// uneven look the axis exists to fix, and on a text field it also RESIZES on
// every keystroke (the placeholder sizes it while empty). The width is
// deliberately NOT responsive: an earlier sm-drops-the-width revision put
// phones back on width:100% and reintroduced the type-to-resize bug there.
// react-native-web renders the pair as inline width/max-width, so the axis is
// assertable at the DOM.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const at = (c: HTMLElement, id: string) => c.querySelector(`[data-testid="${id}"]`) as HTMLElement;

describe("field width axis: harness assumption", () => {
  it("runs at a desktop viewport (the setup.ts visualViewport stub)", () => {
    // The axis itself is viewport-independent, but the rest of the kit's
    // responsive components (Form, Fieldset, GridLists) branch on this, so
    // keep the harness's desktop default locked here where it was diagnosed.
    expect(Dimensions.get("window").width).toBeGreaterThan(640);
  });
});

describe("field width axis: Input", () => {
  it("renders a bare field AT the standard width, shrinking via maxWidth:100%", () => {
    const { container } = ui(<Input placeholder="Email" />);
    const el = container.querySelector("input") as HTMLElement;
    expect(el.style.width).toBe(`${fieldWidths.base}px`);
    expect(el.style.maxWidth).toBe("100%");
  });

  it("block fills the container instead (the former no-op now has effect)", () => {
    const { container } = ui(<Input block placeholder="Email" />);
    const el = container.querySelector("input") as HTMLElement;
    expect(el.style.width).toBe("100%");
    expect(el.style.maxWidth).toBe("");
  });

  it("narrow and wide pick the other two modes", () => {
    const { container } = ui(
      <>
        <Input narrow placeholder="n" />
        <Input wide placeholder="w" />
      </>,
    );
    const [n, w] = Array.from(container.querySelectorAll("input")) as HTMLElement[];
    expect(n.style.width).toBe(`${fieldWidths.narrow}px`);
    expect(w.style.width).toBe(`${fieldWidths.wide}px`);
  });

  it("block wins over narrow/wide when several are passed", () => {
    const { container } = ui(<Input block narrow wide placeholder="b" />);
    expect((container.querySelector("input") as HTMLElement).style.width).toBe("100%");
  });

  it("sizes the grouped (addon) layout on the group container, not the inner field", () => {
    const { container } = ui(<Input prefix="$" placeholder="0.00" />);
    const inner = container.querySelector("input") as HTMLElement;
    expect(inner.style.maxWidth).toBe("");
    // The group container is the field's ancestor View carrying the standard.
    let group: HTMLElement | null = inner.parentElement;
    while (group && group.style.width !== `${fieldWidths.base}px`) group = group.parentElement;
    expect(group?.style.width).toBe(`${fieldWidths.base}px`);
    expect(group?.style.maxWidth).toBe("100%");
  });
});

describe("field width axis: Textarea", () => {
  it("shares the standard width by default", () => {
    const { container } = ui(<Textarea placeholder="Notes" />);
    const el = container.querySelector("textarea") as HTMLElement;
    expect(el.style.width).toBe(`${fieldWidths.base}px`);
    expect(el.style.maxWidth).toBe("100%");
  });

  it("flush implies block (the framed container is the field edge)", () => {
    const { container } = ui(<Textarea flush placeholder="Notes" />);
    expect((container.querySelector("textarea") as HTMLElement).style.width).toBe("100%");
  });
});

describe("field width axis: Select", () => {
  it("renders the root at the standard width (label + trigger share the field edge)", () => {
    const { container } = ui(<Select label="Region" options={["EU", "US"]} />);
    const trigger = container.querySelector("[aria-expanded]") as HTMLElement;
    const root = trigger.parentElement as HTMLElement;
    expect(root.style.width).toBe(`${fieldWidths.base}px`);
    expect(root.style.maxWidth).toBe("100%");
  });

  it("still renders its open option list at the standard width", () => {
    const { container } = ui(<Select options={["EU", "US"]} defaultOpen />);
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it("block fills the container instead", () => {
    const { container } = ui(<Select block options={["EU", "US"]} />);
    const trigger = container.querySelector("[aria-expanded]") as HTMLElement;
    expect((trigger.parentElement as HTMLElement).style.width).not.toBe(`${fieldWidths.base}px`);
  });
});

describe("field width axis: Combobox", () => {
  it("renders the wrapper at the standard width (label + field share the field edge)", () => {
    const { container } = ui(<Combobox label="Assignee" options={["Ada", "Grace"]} />);
    const input = container.querySelector("input") as HTMLElement;
    const wrapperEl = input.parentElement?.parentElement as HTMLElement;
    expect(wrapperEl.style.width).toBe(`${fieldWidths.base}px`);
    expect(wrapperEl.style.maxWidth).toBe("100%");
  });

  it("still renders its open option list at the standard width", () => {
    const { container } = ui(<Combobox options={["Ada", "Grace"]} defaultOpen />);
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
  });
});

describe("field width axis: Listbox", () => {
  const items = [{ label: "Backend" }, { label: "Frontend" }];

  it("renders the root list AT the standard width, shrinking via maxWidth:100%", () => {
    // Each row is a fixed 16px checkmark gutter + a flexBasis:"0%" label stack.
    // Without a definite width the labels collapse to zero in a content-sized or
    // centered parent on native (Yoga resolves the % basis against an indefinite
    // width to 0), which is the iOS/Android "only the checkmark shows" bug.
    const { container } = ui(<Listbox testID="lb" items={items} />);
    expect(at(container, "lb").style.width).toBe(`${fieldWidths.base}px`);
    expect(at(container, "lb").style.maxWidth).toBe("100%");
  });

  it("narrow and wide pick the other two modes", () => {
    const { container } = ui(
      <>
        <Listbox testID="lbn" narrow items={items} />
        <Listbox testID="lbw" wide items={items} />
      </>,
    );
    expect(at(container, "lbn").style.width).toBe(`${fieldWidths.narrow}px`);
    expect(at(container, "lbw").style.width).toBe(`${fieldWidths.wide}px`);
  });

  it("block fills the container instead (the width:100% base shows through)", () => {
    const { container } = ui(<Listbox testID="lbb" block items={items} />);
    expect(at(container, "lbb").style.width).toBe("100%");
    expect(at(container, "lbb").style.maxWidth).toBe("");
  });

  it("carries the axis on the bordered container too", () => {
    const { container } = ui(<Listbox testID="lbc" bordered items={items} />);
    expect(at(container, "lbc").style.width).toBe(`${fieldWidths.base}px`);
    expect(at(container, "lbc").style.maxWidth).toBe("100%");
  });
});

describe("field width axis: Progress", () => {
  it("renders the track AT the standard width, shrinking via maxWidth:100%", () => {
    // The output-only bar shares the axis: in a content-sized context a
    // width:100% track collapses to zero (nothing renders at all, there is no
    // placeholder to size it), which is how the docs stage originally hid it.
    const { container } = ui(<Progress testID="p" value={0.5} />);
    expect(at(container, "p").style.width).toBe(`${fieldWidths.base}px`);
    expect(at(container, "p").style.maxWidth).toBe("100%");
  });

  it("narrow and wide pick the other two modes", () => {
    const { container } = ui(
      <>
        <Progress testID="pn" narrow value={0.5} />
        <Progress testID="pw" wide value={0.5} />
      </>,
    );
    expect(at(container, "pn").style.width).toBe(`${fieldWidths.narrow}px`);
    expect(at(container, "pw").style.width).toBe(`${fieldWidths.wide}px`);
  });

  it("block fills the container instead", () => {
    const { container } = ui(<Progress testID="pb" block value={0.5} />);
    expect(at(container, "pb").style.width).toBe("100%");
    expect(at(container, "pb").style.maxWidth).toBe("");
  });
});

describe("field width axis: Slider", () => {
  it("renders the interactive row AT the standard width, shrinking via maxWidth:100%", () => {
    // The slider shares the axis: in a content-sized context a width:100%
    // container collapses to zero (no track, no fill, no drag width), which is
    // how the docs stage originally hid it.
    const { container } = ui(<Slider testID="s" defaultValue={40} />);
    expect(at(container, "s").style.width).toBe(`${fieldWidths.base}px`);
    expect(at(container, "s").style.maxWidth).toBe("100%");
  });

  it("narrow and wide pick the other two modes", () => {
    const { container } = ui(
      <>
        <Slider testID="sn" narrow defaultValue={40} />
        <Slider testID="sw" wide defaultValue={40} />
      </>,
    );
    expect(at(container, "sn").style.width).toBe(`${fieldWidths.narrow}px`);
    expect(at(container, "sw").style.width).toBe(`${fieldWidths.wide}px`);
  });

  it("block fills the container instead", () => {
    const { container } = ui(<Slider testID="sb" block defaultValue={40} />);
    expect(at(container, "sb").style.width).toBe("100%");
    expect(at(container, "sb").style.maxWidth).toBe("");
  });
});

describe("field width axis: viewport independence", () => {
  it("emits the same explicit width regardless of viewport (no sm drop)", () => {
    // The phone form factor is handled by maxWidth:"100%" against the parent,
    // never by dropping the width: a width:100% field in a content-sized
    // context resizes to hug the typed value on every keystroke.
    expect(useFieldWidth({})).toEqual({ width: fieldWidths.base, maxWidth: "100%" });
    expect(useFieldWidth({ narrow: true })).toEqual({ width: fieldWidths.narrow, maxWidth: "100%" });
    expect(useFieldWidth({ wide: true })).toEqual({ width: fieldWidths.wide, maxWidth: "100%" });
    expect(useFieldWidth({ block: true })).toBeNull();
  });
});

describe("field width axis: composition (inner controls are block)", () => {
  it("Field carries the standard width on its control stack; the inner Input fills it", () => {
    const { container } = ui(<Field testID="f" label="Name" placeholder="Ada" />);
    expect(at(container, "f").style.width).toBe(`${fieldWidths.base}px`);
    expect(at(container, "f").style.maxWidth).toBe("100%");
    expect((container.querySelector("input") as HTMLElement).style.width).toBe("100%");
  });

  it("Field display mode (read-only rows) stays unsized", () => {
    const { container } = ui(<Field testID="d" rows={[{ label: "Plan", value: "Pro" }]} />);
    expect(at(container, "d").style.width).toBe("");
    expect(at(container, "d").style.maxWidth).toBe("");
  });

  it("Form and Fieldset inner Inputs fill their column (no per-input standard)", () => {
    const { container } = ui(
      <>
        <Form fields={[{ label: "Email", placeholder: "you@example.com" }]} />
        <Fieldset legend="Profile" items={[{ label: "Name" }]} />
      </>,
    );
    const inputs = Array.from(container.querySelectorAll("input")) as HTMLElement[];
    expect(inputs.length).toBe(2);
    for (const el of inputs) expect(el.style.width).toBe("100%");
  });
});
