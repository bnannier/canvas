import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import type { TextInput } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Field } from "../src/molecules/field/field.tsx";
import { Form } from "../src/molecules/form/form.tsx";
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

  it("Form (stacked) names each input by its label", () => {
    ui(<Form stacked fields={[{ label: "Full name", placeholder: "Ada" }, { label: "Email", placeholder: "ada@acme.dev" }]} />);
    expect(screen.getByLabelText("Full name")).toBe(screen.getByPlaceholderText("Ada"));
    expect(screen.getByLabelText("Email")).toBe(screen.getByPlaceholderText("ada@acme.dev"));
  });

  it("Form (sidebar) names each input by its label", () => {
    ui(<Form sidebar fields={[{ label: "City", placeholder: "Austin" }]} />);
    expect(screen.getByLabelText("City")).toBe(screen.getByPlaceholderText("Austin"));
  });

  it("Form keeps a pre-filled field editable and reports collected values on submit", () => {
    let submitted: Record<string, string | boolean> | null = null;
    ui(
      <Form
        stacked
        submitLabel="Save"
        fields={[
          { label: "Full name", value: "Ada" },
          { name: "email", label: "Email", placeholder: "ada@acme.dev" },
        ]}
        onSubmit={(v) => { submitted = v; }}
      />,
    );
    // A pre-filled controlled input must still accept edits (the RNW frozen-input regression).
    const name = screen.getByLabelText("Full name") as HTMLInputElement;
    expect(name.value).toBe("Ada");
    fireEvent.change(name, { target: { value: "Ada Lovelace" } });
    expect(name.value).toBe("Ada Lovelace");
    const email = screen.getByPlaceholderText("ada@acme.dev") as HTMLInputElement;
    fireEvent.change(email, { target: { value: "ada@acme.dev" } });
    fireEvent.click(screen.getByText("Save"));
    // Keyed by `name` when given, else the label.
    expect(submitted).toEqual({ "Full name": "Ada Lovelace", email: "ada@acme.dev" });
  });

  it("Form (sectioned) collects checkbox state on submit", () => {
    let submitted: Record<string, string | boolean> | null = null;
    ui(
      <Form
        sidebar
        submitLabel="Save"
        sections={[
          {
            title: "Notifications",
            checkboxes: [
              { name: "news", label: "Newsletter", checked: true },
              { label: "SMS" },
            ],
          },
        ]}
        onSubmit={(v) => { submitted = v; }}
      />,
    );
    fireEvent.click(screen.getByText("SMS"));
    fireEvent.click(screen.getByText("Save"));
    expect(submitted).toEqual({ news: true, SMS: true });
  });

  it("Fieldset names each item's control by its label", () => {
    ui(<Fieldset legend="Address" items={[{ label: "Street", placeholder: "123 Market St" }]} />);
    expect(screen.getByLabelText("Street")).toBe(screen.getByPlaceholderText("123 Market St"));
  });
});
