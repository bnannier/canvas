import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import type { TextInput } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Form, FormSection } from "../src/molecules/form/form.tsx";
import { webSkin as formWeb, iosSkin as formIos, androidSkin as formAndroid } from "../src/molecules/form/form.styles.ts";
import { lightColors } from "../src/style/tokens.ts";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Checkbox", () => {
  it("renders its label and toggles to the next value on press", () => {
    let next: boolean | null = null;
    ui(<Checkbox checked={false} onChange={(v) => { next = v; }}>Accept terms</Checkbox>);
    fireEvent.click(screen.getByText("Accept terms"));
    expect(next).toBe(true);
  });

  it("does not toggle while disabled", () => {
    let called = false;
    ui(<Checkbox checked={false} disabled onChange={() => { called = true; }}>Disabled</Checkbox>);
    fireEvent.click(screen.getByText("Disabled"));
    expect(called).toBe(false);
  });

  it("stacks a description under the label and keeps the whole row tappable", () => {
    let next: boolean | null = null;
    ui(
      <Checkbox checked={false} onChange={(v) => { next = v; }} description="Get notified when activity happens.">
        Email notifications
      </Checkbox>,
    );
    expect(screen.getByText("Email notifications")).toBeTruthy();
    fireEvent.click(screen.getByText("Get notified when activity happens."));
    expect(next).toBe(true);
  });
});

describe("Switch", () => {
  it("toggles to the opposite of its controlled value", () => {
    let next: boolean | null = null;
    ui(<Switch checked={true} onChange={(v) => { next = v; }}>Wi-Fi</Switch>);
    fireEvent.click(screen.getByText("Wi-Fi"));
    expect(next).toBe(false);
  });
});

describe("Input", () => {
  it("renders a placeholder and reports typed text", () => {
    let text = "";
    ui(<Input placeholder="Email" onChangeText={(t) => { text = t; }} />);
    const field = screen.getByPlaceholderText("Email") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "a@b.co" } });
    expect(text).toBe("a@b.co");
  });

  it("forwards a ref to the underlying field and exposes focus()", () => {
    const ref = createRef<TextInput>();
    ui(<Input ref={ref} placeholder="Name" />);
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.focus).toBe("function");
  });

  it("sets a displayName for DevTools/stack traces", () => {
    expect((Input as { displayName?: string }).displayName).toBe("Input");
  });

  it("emits aria-label to the DOM for accessibilityLabel (RNW drops the RN prop)", () => {
    ui(<Input accessibilityLabel="Email" placeholder="you@acme.dev" />);
    // getByLabelText resolves the computed accessible name: proves WCAG 4.1.2 Name.
    expect(screen.getByLabelText("Email")).toBe(screen.getByPlaceholderText("you@acme.dev"));
  });

  it("emits aria-labelledby so a visible label Text names the field", () => {
    ui(
      <>
        {/* nativeID -> id on web */}
        <Input aria-labelledby="lbl" placeholder="bare" />
        <span id="lbl">Username</span>
      </>,
    );
    expect(screen.getByLabelText("Username")).toBe(screen.getByPlaceholderText("bare"));
  });
});

// The visible label of a composed field must be the input's programmatic name on
// web, not just a sibling Text (WCAG 4.1.2). getByLabelText only resolves when the
// accessible name is wired through to the DOM input, so it guards every layout.
describe("accessible names on composed fields", () => {
  it("Form renders stitched children, each input named by its own label", () => {
    ui(
      <Form>
        <Input block label="Full name" placeholder="Ada" />
        <Input block label="Email" placeholder="ada@acme.dev" />
      </Form>,
    );
    expect(screen.getByLabelText("Full name")).toBe(screen.getByPlaceholderText("Ada"));
    expect(screen.getByLabelText("Email")).toBe(screen.getByPlaceholderText("ada@acme.dev"));
  });

});

// Form is a composition surface: the caller stitches the field atoms and keeps
// their state; Form owns the rhythm, the actions row, form semantics, and
// Enter-to-submit on the web. These tests pin that contract.
describe("Form (composition)", () => {
  it("exposes the form role and renders no actions row until a label is given", () => {
    const { container } = ui(
      <Form onSubmit={() => {}}>
        <Input block label="Email" />
      </Form>,
    );
    expect(container.querySelector('[role="form"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="button"]').length).toBe(0);
  });

  it("names its form landmark from accessibilityLabel, and stays unnamed without one", () => {
    const named = ui(
      <Form accessibilityLabel="Sign in">
        <Input block label="Email" />
      </Form>,
    );
    expect(named.getByRole("form", { name: "Sign in" })).toBeDefined();
    named.unmount();
    const { container } = ui(
      <Form>
        <Input block label="Email" />
      </Form>,
    );
    const form = container.querySelector('[role="form"]');
    expect(form?.hasAttribute("aria-label")).toBe(false);
  });

  it("fires onSubmit and onCancel from the actions row buttons", () => {
    let submitted = 0;
    let cancelled = 0;
    ui(
      <Form submitLabel="Save" cancelLabel="Cancel" onSubmit={() => { submitted += 1; }} onCancel={() => { cancelled += 1; }}>
        <Input block label="Email" />
      </Form>,
    );
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(submitted).toBe(1);
    expect(cancelled).toBe(1);
  });

  it("disabled gates the submit button", () => {
    let submitted = 0;
    ui(
      <Form submitLabel="Save" disabled onSubmit={() => { submitted += 1; }}>
        <Input block label="Email" />
      </Form>,
    );
    fireEvent.click(screen.getByText("Save"));
    expect(submitted).toBe(0);
  });

  it("submits on Enter in a single-line field, but never from a multiline one", () => {
    let submitted = 0;
    ui(
      <Form submitLabel="Save" onSubmit={() => { submitted += 1; }}>
        <Input block label="Email" placeholder="you@acme.dev" />
        <Textarea label="Bio" placeholder="About you" />
      </Form>,
    );
    fireEvent.keyDown(screen.getByPlaceholderText("you@acme.dev"), { key: "Enter" });
    expect(submitted).toBe(1);
    // A textarea keeps Enter for newlines.
    fireEvent.keyDown(screen.getByPlaceholderText("About you"), { key: "Enter" });
    expect(submitted).toBe(1);
  });

  it("FormSection renders its header and names the group for assistive tech", () => {
    const { container } = ui(
      <Form>
        <FormSection title="Notifications" description="Choose how you'd like to be notified.">
          <Checkbox defaultChecked>Email notifications</Checkbox>
        </FormSection>
      </Form>,
    );
    expect(screen.getByText("Notifications")).toBeTruthy();
    expect(screen.getByText("Choose how you'd like to be notified.")).toBeTruthy();
    const group = container.querySelector('[role="group"]') as HTMLElement;
    expect(group.getAttribute("aria-label")).toBe("Notifications");
  });

  it("twoColumn lays the stitched children out without losing any", () => {
    ui(
      <Form twoColumn submitLabel="Create">
        <Input block label="First name" placeholder="Ada" />
        <Input block label="Last name" placeholder="King" />
        <Input block label="Email" placeholder="ada@example.com" />
      </Form>,
    );
    expect(screen.getByPlaceholderText("Ada")).toBeTruthy();
    expect(screen.getByPlaceholderText("King")).toBeTruthy();
    expect(screen.getByPlaceholderText("ada@example.com")).toBeTruthy();
  });
});

// The form is the v4 hand-off's (cv-kit-inputs.js `K.def('form')`, cv-kit-code2.js
// `O('form')` and its FormSection) on every platform: the native builds alias the web skin.
describe("Form follows the v4 hand-off", () => {
  const t = lightColors;
  it("aliases the web skin on iOS and Android", () => {
    expect(formIos).toBe(formWeb);
    expect(formAndroid).toBe(formWeb);
  });
  it("keeps a 16px row rhythm and sets the actions 20 below the rows over a 14px inset and a border rule, 8 apart", () => {
    expect(formWeb.stack).toEqual({ gap: 16 });
    expect(formWeb.actions(t)).toMatchObject({ marginTop: 4, paddingTop: 14, borderTopWidth: 1, borderTopColor: t.border, justifyContent: "flex-end", gap: 8 });
  });
  it("closes a section with an 18px inset and a border rule, 14 between its parts, under a 500 15px title and a 13px subtle description", () => {
    expect(formWeb.section(t)).toEqual({ gap: 14, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: t.border });
    expect(formWeb.sectionTitle(t)).toMatchObject({ fontSize: 15, fontWeight: "500", color: t.foreground });
    expect(formWeb.sectionDescription(t)).toMatchObject({ marginTop: 4, fontSize: 13, lineHeight: 19.5, color: t["subtle-foreground"] });
  });
  it("dims a disabled form to 0.5", () => {
    const { container } = ui(
      <Form disabled submitLabel="Save" cancelLabel="Cancel">
        <Input label="Email" />
      </Form>,
    );
    expect((container.querySelector('[role="form"]') as HTMLElement).style.opacity).toBe("0.5");
  });
  it("gives a FormSection the whole row in the two-column flow", () => {
    const { container } = ui(
      <Form twoColumn>
        <Input label="First" />
        <FormSection title="Notifications">
          <Checkbox>Email</Checkbox>
        </FormSection>
      </Form>,
    );
    const section = container.querySelector('[aria-label="Notifications"]') as HTMLElement;
    expect((section.parentElement as HTMLElement).style.flexBasis).toBe("100%");
  });
});

// twoColumn is the hand-off's two-column grid (cv-kit-code2.js `O('form')`: `1fr 1fr`, a
// 16px gap, a FormSection across the whole line): exactly two half-width cells on a line
// however wide the form, never as many as fit; and at or under 512 px one full-width column
// that never wraps sideways. happy-dom never fires onLayout, so the flow resolves against
// the viewport seed (useContainerWidth) until a measurement lands.
describe("Form twoColumn flow", () => {
  const cellOf = (container: HTMLElement, placeholder: string) => {
    // input -> the Input's own root -> the cell (the rows wrapper's child)
    let node = container.querySelector(`[placeholder="${placeholder}"]`) as HTMLElement;
    while (node.parentElement && node.parentElement.style.flexDirection !== "row" && node.parentElement.style.flexDirection !== "column") {
      node = node.parentElement;
    }
    // The first flex-direction ancestor met may be inside the field; climb to the rows wrapper.
    while (node.parentElement && !node.parentElement.getAttribute("style")?.includes("gap")) node = node.parentElement;
    return node;
  };
  const rowsOf = (container: HTMLElement, placeholder: string) => cellOf(container, placeholder).parentElement as HTMLElement;
  const form = (
    <Form twoColumn>
      <Input label="Name" placeholder="a" />
      <Input label="URL" placeholder="b" />
      <Input label="Region" placeholder="c" />
      <FormSection title="Members">
        <Input label="Role" placeholder="d" />
      </FormSection>
      <Input label="After" placeholder="e" />
      <Input label="Odd" placeholder="f" />
      <Input label="Last" placeholder="g" />
    </Form>
  );

  it("lays exactly two half-width cells on a line, the 16px gutter split between them", () => {
    const { container } = ui(form);
    const rows = rowsOf(container as HTMLElement, "a");
    expect(rows.style.flexDirection).toBe("row");
    expect(rows.style.flexWrap).toBe("wrap");
    expect(rows.style.rowGap).toBe("16px");
    expect(rows.style.columnGap).toBe("");
    const a = cellOf(container as HTMLElement, "a");
    const b = cellOf(container as HTMLElement, "b");
    expect(a.style.width).toBe("50%");
    expect(b.style.width).toBe("50%");
    // No flex growth: a cell never stretches past its half, and a fifth never squeezes in.
    expect(a.style.flexGrow).toBe("");
    expect(b.style.flexGrow).toBe("");
    const inset = (el: HTMLElement) => [el.style.paddingInlineStart || el.style.paddingLeft, el.style.paddingInlineEnd || el.style.paddingRight];
    expect(inset(a)).toEqual(["", "8px"]);
    expect(inset(b)).toEqual(["8px", ""]);
  });

  it("starts a new line after a FormSection, and keeps an odd last field at half width", () => {
    const { container } = ui(form);
    const c = cellOf(container as HTMLElement, "c");
    const inset = (el: HTMLElement) => el.style.paddingInlineEnd || el.style.paddingRight;
    // Region is the third field: the start column of the second line.
    expect(inset(c)).toBe("8px");
    const section = container.querySelector('[aria-label="Members"]')!.parentElement as HTMLElement;
    expect(section.style.flexBasis).toBe("100%");
    // After the section the next field starts a line again, in the start column.
    expect(inset(cellOf(container as HTMLElement, "e"))).toBe("8px");
    expect(inset(cellOf(container as HTMLElement, "f"))).toBe("");
    const last = cellOf(container as HTMLElement, "g");
    expect(last.style.width).toBe("50%");
    expect(inset(last)).toBe("8px");
  });

  it("stacks one full-width column at a phone width: no wrap, no basis, no half cells", () => {
    resizeViewport(390);
    const { container } = ui(form);
    const rows = rowsOf(container as HTMLElement, "a");
    expect(rows.style.flexDirection).toBe("column");
    expect(rows.style.flexWrap).toBe("");
    expect(rows.style.gap || rows.style.rowGap).toBe("16px");
    for (const p of ["a", "b", "c", "e", "f", "g"]) {
      const cell = cellOf(container as HTMLElement, p);
      expect(cell.style.width).toBe("");
      expect(cell.style.flexBasis).toBe("");
    }
    const section = container.querySelector('[aria-label="Members"]')!.parentElement as HTMLElement;
    // The section's cell carries no `flexBasis: 100%`, which in a column is a HEIGHT basis.
    expect(section.style.flexBasis).toBe("");
  });

  it("lets a field fill its cell", () => {
    const { container } = ui(form);
    const cell = cellOf(container as HTMLElement, "a");
    const field = cell.firstElementChild as HTMLElement;
    expect(field.style.width).toBe("100%");
  });
});

describe("FormSection aside and Form hints (the Inputs section's Form card)", () => {
  it("sets the heading in a rail beside the rows, the first section with no inset above it", () => {
    const { container } = ui(
      <Form submitLabel="Save">
        <FormSection aside title="Workspace" description="Shown to everyone you invite." testID="first">
          <Input label="Name" />
        </FormSection>
        <FormSection aside title="Members" testID="second">
          <Input label="Role" />
        </FormSection>
      </Form>,
    );
    const first = screen.getByTestId("first");
    const second = screen.getByTestId("second");
    expect(first.style.flexDirection).toBe("row");
    expect(first.style.paddingTop).toBe("0px");
    expect(second.style.paddingTop).toBe("12px");
    expect(screen.getByText("Workspace").style.fontSize).toBe("20px");
    expect(screen.getByText("Shown to everyone you invite.").style.fontSize).toBe("14px");
    expect(screen.getByRole("group", { name: "Workspace" })).toBe(first);
    expect(container.textContent).toContain("Save");
  });

  it("drops the actions row's rule after a closing aside section, and leads it with the hints", () => {
    ui(
      <Form submitLabel="Save" hints={<Input accessibilityLabel="hint" />}>
        <FormSection aside title="Workspace">
          <Input label="Name" />
        </FormSection>
      </Form>,
    );
    let actions: HTMLElement = screen.getByRole("button", { name: "Save" });
    while (actions.style.justifyContent !== "space-between" && actions.parentElement) actions = actions.parentElement;
    expect(actions.style.justifyContent).toBe("space-between");
    expect(["", "0px"]).toContain(actions.style.borderTopWidth);
    expect(actions.style.paddingTop).toBe("0px");
    expect(actions.firstElementChild!.contains(screen.getByLabelText("hint"))).toBe(true);
  });
});
