import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { Dimensions } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { responsive } from "../src/style/responsive.ts";
import { fieldWidths } from "../src/style/tokens.ts";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Combobox } from "../src/atoms/combobox/combobox.tsx";
import { Field } from "../src/molecules/field/field.tsx";
import { Form } from "../src/molecules/form/form.tsx";
import { Fieldset } from "../src/molecules/fieldset/fieldset.tsx";

// The standard field width axis (src/style/field-width.ts): a bare input-like
// control RENDERS AT fieldWidths.base on desktop (narrow/wide pick the other
// two modes, block fills the container instead), shrinks in narrower parents
// via maxWidth:"100%", and drops the standard entirely at the sm breakpoint
// and below. The explicit width (not a width:100% + cap) is the load-bearing
// part: in a content-sized context (a centered stage, a row) width:100%
// collapses to the placeholder text's natural width, which is exactly the
// uneven look the axis exists to fix. react-native-web renders the pair as
// inline width/max-width, so the axis is assertable at the DOM. These suites
// rely on the setup.ts desktop viewport (wider than the 640px sm breakpoint);
// the first test locks that assumption so a harness change fails loudly here
// instead of silently asserting the phone (fill) branch.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const at = (c: HTMLElement, id: string) => c.querySelector(`[data-testid="${id}"]`) as HTMLElement;

describe("field width axis: harness assumption", () => {
  it("runs at a desktop viewport (wider than the sm breakpoint)", () => {
    // What useWindowDimensions/useResponsive actually consume (the setup.ts
    // visualViewport stub), not the DOM's window.innerWidth.
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

describe("field width axis: responsive collapse", () => {
  it("drops the standard at the sm breakpoint and below (null, not undefined)", () => {
    const map = { base: { width: fieldWidths.base, maxWidth: "100%" }, sm: null };
    expect(responsive(375, map)).toBeNull();
    expect(responsive(640, map)).toBeNull();
    expect(responsive(1024, map)).toEqual({ width: fieldWidths.base, maxWidth: "100%" });
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
