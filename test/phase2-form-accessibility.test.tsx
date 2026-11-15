import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type ForwardedRef, type ReactNode } from "react";
import { Pressable as RNPressable, TextInput as RNTextInput, type AccessibilityProps } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Field } from "../src/molecules/field/field.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { PhoneInput } from "../src/molecules/phone-input/phone-input.tsx";
import { Field as IOSField } from "../src/molecules/field/field.ios.tsx";
import { Input as IOSInput } from "../src/atoms/input/input.ios.tsx";
import { Textarea as IOSTextarea } from "../src/atoms/textarea/textarea.ios.tsx";
import { Select as IOSSelect } from "../src/atoms/select/select.ios.tsx";
import { Autocomplete as IOSAutocomplete } from "../src/atoms/autocomplete/autocomplete.ios.tsx";
import { PhoneInput as IOSPhoneInput } from "../src/molecules/phone-input/phone-input.ios.tsx";
import { Field as AndroidField } from "../src/molecules/field/field.android.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { Textarea as AndroidTextarea } from "../src/atoms/textarea/textarea.android.tsx";
import { Select as AndroidSelect } from "../src/atoms/select/select.android.tsx";
import { Autocomplete as AndroidAutocomplete } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import { PhoneInput as AndroidPhoneInput } from "../src/molecules/phone-input/phone-input.android.tsx";

afterEach(cleanup);
const themed = (node: ReactNode) => <ThemeProvider light solid>{node}</ThemeProvider>;
const ui = (node: ReactNode) => render(themed(node));
const options = ["Alpha", "Beta"];
const webControls = { Input, Textarea, Select, Autocomplete, PhoneInput };
const descriptions = (node: HTMLElement) => (node.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);

for (const [name, Control] of Object.entries(webControls)) {
  for (const ownLabel of [false, true]) it(`${name}: validation updates independently of ${ownLabel ? "its own" : "an absent Field"} label`, () => {
    const control = <Control testID="editor" {...(ownLabel ? { label: "Inner" } : {})} />;
    const { rerender } = ui(<Field required helper="Pick carefully">{control}</Field>);
    const editor = screen.getByTestId("editor");
    if (name === "Select") expect(editor.getAttribute("aria-label")).toEndWith(", required");
    else expect(editor.getAttribute("aria-required")).toBe("true");
    const ids = descriptions(editor);
    expect(ids).toHaveLength(1);
    expect(document.getElementById(ids[0]!)?.textContent).toBe("Pick carefully");
    expect(editor.hasAttribute("aria-invalid")).toBe(false);
    if (ownLabel) expect(editor.getAttribute("aria-label")).toStartWith("Inner");

    rerender(themed(<Field required helper="Pick carefully" error="Choose a valid entry">{control}</Field>));
    expect(editor.getAttribute("aria-invalid")).toBe("true");
    expect(descriptions(editor)).toEqual(ids);
    expect(document.getElementById(ids[0]!)?.textContent).toBe("Choose a valid entry");
    expect(screen.getByRole("alert").textContent).toBe("Choose a valid entry");

    rerender(themed(<Field>{control}</Field>));
    expect(editor.hasAttribute("aria-invalid")).toBe(false);
    expect(editor.hasAttribute("aria-describedby")).toBe(false);
    expect(editor.hasAttribute("aria-required")).toBe(false);
  });

  it(`${name}: explicit child state wins and existing description IDs survive`, () => {
    ui(<Field label="Outer" required error="Outer validation"><Control testID="editor" label="Inner" required={false} error={false} aria-describedby="first second first" /></Field>);
    const editor = screen.getByTestId("editor");
    expect(editor.hasAttribute("aria-invalid")).toBe(false);
    expect(editor.hasAttribute("aria-required")).toBe(false);
    expect(editor.getAttribute("aria-label")).toStartWith("Inner");
    const ids = descriptions(editor);
    expect(ids.slice(0, 2)).toEqual(["first", "second"]);
    expect(ids).toHaveLength(3);
    expect(document.getElementById(ids[2]!)?.textContent).toBe("Outer validation");
  });
}

it("keeps explicit invalid and required child states when Field has no state", () => {
  ui(<Field helper="Hint"><Input testID="editor" label="Email" error required /></Field>);
  const editor = screen.getByTestId("editor");
  expect(editor.getAttribute("aria-invalid")).toBe("true");
  expect(editor.getAttribute("aria-required")).toBe("true");
});

it("does not assign one description to multiple children", () => {
  ui(<Field error="Check the pair"><Input testID="a" /><Input testID="b" /></Field>);
  expect(screen.getByTestId("a").hasAttribute("aria-describedby")).toBe(false);
  expect(screen.getByTestId("b").hasAttribute("aria-describedby")).toBe(false);
});

describe("Select current-value names", () => {
  it("announces the selected display label and glyph with the field purpose", () => {
    ui(<Select label="Region" defaultValue="us" options={[{ value: "us", label: "United States", leading: "🇺🇸" }]} />);
    expect(screen.getByRole("button", { name: "Region, 🇺🇸 United States" })).toBeDefined();
  });

  it("keeps explicit accessibilityLabel as purpose and updates a controlled value", () => {
    const { rerender } = ui(<Select label="Role" accessibilityLabel="Billing role" value="Alpha" options={options} />);
    expect(screen.getByRole("button", { name: "Billing role, Alpha" })).toBeDefined();
    rerender(themed(<Select label="Role" accessibilityLabel="Billing role" value="Beta" options={options} />));
    expect(screen.getByRole("button", { name: "Billing role, Beta" })).toBeDefined();
  });

  it("announces the placeholder with inline labels and optional combobox role", () => {
    ui(<Select label="Region" inline required placeholder="Choose a region" combobox />);
    const trigger = screen.getByRole("combobox", { name: "Region, Choose a region, required" });
    expect(trigger.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("avoids duplicating an unlabeled placeholder or identical purpose and value", () => {
    const { rerender } = ui(<Select placeholder="Choose a region" />);
    expect(screen.getByRole("button", { name: "Choose a region" })).toBeDefined();
    rerender(themed(<Select label="Choose a region" placeholder="Choose a region" />));
    expect(screen.getByRole("button", { name: "Choose a region" })).toBeDefined();
  });

  it("updates the name after uncontrolled selection and preserves inline value naming", () => {
    ui(<Select label="Priority" inline options={options} />);
    fireEvent.click(screen.getByRole("button", { name: "Priority, Select an option" }));
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(screen.getByRole("button", { name: "Priority, Beta" }).getAttribute("aria-expanded")).toBe("false");
  });
});

it("connects Autocomplete's own helper together with a Field message", () => {
  ui(<Field label="Project" error="Pick a project"><Autocomplete helperText="Search by name" aria-describedby="existing" /></Field>);
  const editor = screen.getByRole("combobox");
  const ids = descriptions(editor);
  expect(ids[0]).toBe("existing");
  expect(ids.slice(1).map(id => document.getElementById(id)?.textContent)).toEqual(["Pick a project", "Search by name"]);
});

// Observe the actual native primitive boundary before RNW drops native-only hints.
// These assertions verify forwarding; spoken announcements still require device QA.
type NativeProps = AccessibilityProps & { testID?: string };
function captureNativeHints(run: (seen: Map<string, NativeProps>) => void) {
  const seen = new Map<string, NativeProps>();
  const observers = [RNTextInput, RNPressable].map(primitive => {
    const wrapped = primitive as unknown as { type?: unknown };
    const component = (wrapped.type ?? primitive) as { render: (props: NativeProps, ref: ForwardedRef<unknown>) => ReactNode };
    const original = component.render;
    return spyOn(component, "render").mockImplementation((props, ref) => {
      if (props.testID) seen.set(props.testID, props);
      return original(props, ref);
    });
  });
  try { run(seen); } finally { cleanup(); for (const observer of observers) observer.mockRestore(); }
}

for (const [platform, Wrapper, controls] of [
  ["ios", IOSField, { Input: IOSInput, Textarea: IOSTextarea, Select: IOSSelect, Autocomplete: IOSAutocomplete, PhoneInput: IOSPhoneInput }],
  ["android", AndroidField, { Input: AndroidInput, Textarea: AndroidTextarea, Select: AndroidSelect, Autocomplete: AndroidAutocomplete, PhoneInput: AndroidPhoneInput }],
] as const) {
  for (const [name, Control] of Object.entries(controls)) it(`${platform} ${name}: forwards dynamic Field messages as a native hint and preserves overrides`, () => captureNativeHints(seen => {
    const { rerender } = ui(<Wrapper helper="Choose carefully"><Control testID="native-editor" label="Own name" /></Wrapper>);
    expect(seen.get("native-editor")?.accessibilityHint).toBe("Choose carefully");
    rerender(themed(<Wrapper error="Invalid choice"><Control testID="native-editor" label="Own name" /></Wrapper>));
    expect(seen.get("native-editor")?.accessibilityHint).toBe("Invalid choice");
    rerender(themed(<Wrapper error="Invalid choice"><Control testID="native-editor" label="Own name" accessibilityHint="Consumer hint" /></Wrapper>));
    expect(seen.get("native-editor")?.accessibilityHint).toBe("Consumer hint");
    rerender(themed(<Wrapper><Control testID="native-editor" label="Own name" /></Wrapper>));
    expect(seen.get("native-editor")?.accessibilityHint).toBeUndefined();
  }));
}
