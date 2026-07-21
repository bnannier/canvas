import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import type { TextInput } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Field } from "../src/molecules/field/field.tsx";
import { Form, FormSection } from "../src/molecules/form/form.tsx";
import { Fieldset } from "../src/molecules/fieldset/fieldset.tsx";

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
  it("Field names its control by the visible label", () => {
    ui(<Field label="Email" placeholder="ada@acme.dev" />);
    expect(screen.getByLabelText("Email")).toBe(screen.getByPlaceholderText("ada@acme.dev"));
  });

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

  it("Fieldset names each item's control by its label", () => {
    ui(<Fieldset legend="Address" items={[{ label: "Street", placeholder: "123 Market St" }]} />);
    expect(screen.getByLabelText("Street")).toBe(screen.getByPlaceholderText("123 Market St"));
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
