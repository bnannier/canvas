import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AnatomyProvider, type AnatomyRects } from "../src/style/anatomy.tsx";
import { anatomyParts } from "./fixtures/anatomy-parts.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { InputOTP } from "../src/atoms/input-otp/input-otp.tsx";
import { InputOTP as AndroidInputOTP } from "../src/atoms/input-otp/input-otp.android.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { PhoneInput } from "../src/molecules/phone-input/phone-input.tsx";
import { Field } from "../src/molecules/field/field.tsx";
import { Form, FormSection } from "../src/molecules/form/form.tsx";
import { FilterPanel } from "../src/organisms/filter-panel/filter-panel.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { Textarea as AndroidTextarea } from "../src/atoms/textarea/textarea.android.tsx";
import { Select as AndroidSelect } from "../src/atoms/select/select.android.tsx";
import { Autocomplete as AndroidAutocomplete } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import { Field as AndroidField } from "../src/molecules/field/field.android.tsx";

// The anatomy parts the input family registers with a docs AnatomyProvider (the hand-off's
// `an` lists), each rendered as its Anatomy demo draws it (the Android floating label
// too), and the scoping that keeps a wrapped control's parts (a Field's Input, a Form's
// fields and buttons) from leaking.

afterEach(cleanup);

describe("the input family's anatomy parts", () => {
  it("Input: the label, field, leading icon, value and clear action (its helper line is Field's)", async () => {
    expect(await anatomyParts(<Input label="Workspace URL" leadingIcon icon="globe" value="northwind" clearable suffix=".canvas.dev" />)).toEqual(
      ["Field", "Label", "Leading icon", "Trailing action", "Value or placeholder"],
    );
  });

  it("Textarea: the label, field, value and counter", async () => {
    expect(await anatomyParts(<Textarea label="Release notes" placeholder="What changed in this version?" showCount />)).toEqual(
      ["Counter", "Field", "Label", "Value or placeholder"],
    );
  });

  it("Select: the label, trigger, value, chevron and the open menu", async () => {
    expect(await anatomyParts(<Select label="Role" open defaultValue="Design engineer" options={["Design engineer", "Product manager"]} />)).toEqual(
      ["Chevron", "Label", "Menu", "Trigger", "Value"],
    );
  });

  it("InputOTP: the first cell and digit, the caret and the group gap", async () => {
    expect(await anatomyParts(<InputOTP length={6} groups={3} value="482" autoFocus />)).toEqual(["Caret", "Cell", "Digit", "Group gap"]);
  });

  it("Autocomplete: the label, field, query, listbox and the first match", async () => {
    expect(await anatomyParts(<Autocomplete label="Component" query="ra" open options={["Ada Lovelace", "Grace Hopper", "Kira Tanaka"]} />)).toEqual(
      ["Field", "Label", "Listbox", "Match highlight", "Query"],
    );
  });

  it("Listbox: the list, the first option, the chosen row's check and the first detail line", async () => {
    const items = [
      { label: "Mentions", detail: "Someone tags you on a board" },
      { label: "Comments", detail: "Replies on your cards" },
      { label: "Everything" },
    ];
    expect(await anatomyParts(<Listbox bordered selected={1} items={items} />)).toEqual(["Detail line", "Listbox", "Option", "Selected check"]);
  });

  it("PhoneInput: the label, country trigger, dial code and number (its error line is Field's)", async () => {
    expect(await anatomyParts(<PhoneInput label="Phone" error defaultValue="415 555 0132" />)).toEqual(["Country trigger", "Dial code", "Label", "Number"]);
  });

  it("Field: a delegated control draws Field's label, star and control, and its own parts stay closed", async () => {
    expect(await anatomyParts(<Field label="Email" required helper="Release notes only"><Input placeholder="you@example.com" /></Field>)).toEqual(
      ["Control", "Helper or error", "Label", "Required mark"],
    );
  });

  it("Field: every delegated control takes the label, star and control, Android's floating label included", async () => {
    const all = ["Control", "Helper or error", "Label", "Required mark"];
    expect(await anatomyParts(<Field label="Notes" required helper="Shown to reviewers"><Textarea /></Field>)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<Field label="Role" required helper="Pick one"><Select options={["Design engineer"]} /></Field>)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<Field label="Component" required helper="Search the kit"><Autocomplete options={["Radio"]} /></Field>)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<Field label="Phone" required helper="Mobile only"><PhoneInput /></Field>)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<AndroidField label="Email" required helper="Release notes only"><AndroidInput /></AndroidField>)).toEqual(all);
  });

  it("Field: over a control that keeps its own label, Field draws the label and star and measures the control", async () => {
    expect(await anatomyParts(<Field label="Notifications" required helper="Daily digest"><Switch /></Field>)).toEqual(
      ["Control", "Helper or error", "Label", "Required mark"],
    );
  });

  it("the Android floating label registers each control's Label", async () => {
    expect(await anatomyParts(<AndroidInput label="Workspace name" value="northwind" />)).toEqual(["Field", "Label", "Value or placeholder"]);
    cleanup();
    expect(await anatomyParts(<AndroidTextarea label="Release notes" showCount />)).toEqual(["Counter", "Field", "Label", "Value or placeholder"]);
    cleanup();
    expect(await anatomyParts(<AndroidSelect label="Role" open defaultValue="Design engineer" options={["Design engineer"]} />)).toEqual(
      ["Chevron", "Label", "Menu", "Trigger", "Value"],
    );
    cleanup();
    expect(await anatomyParts(<AndroidAutocomplete label="Component" query="ra" open options={["Radio"]} />)).toEqual(
      ["Field", "Label", "Listbox", "Match highlight", "Query"],
    );
  });

  it("Form: the section, the first field and the actions, with none of its fields' or buttons' parts", async () => {
    expect(await anatomyParts(
      <Form twoColumn submitLabel="Save" cancelLabel="Cancel">
        <Input label="First name" />
        <Input label="Last name" />
      </Form>,
    )).toEqual(["Actions", "Field", "Section"]);
  });

  it("Form: a form of sections numbers its first section and that section's first row", async () => {
    expect(await anatomyParts(
      <Form submitLabel="Save">
        <FormSection title="Profile">
          <Input label="First name" />
        </FormSection>
      </Form>,
    )).toEqual(["Actions", "Field", "Section"]);
  });

  it("FilterPanel: the panel, first heading, option and count, and the clear action", async () => {
    const groups = [
      { title: "Status", options: [{ label: "Active", checked: true, count: "128" }, { label: "Pending", count: "12" }] },
      { title: "Schema", options: [{ label: "Default", count: "96" }] },
    ];
    expect(await anatomyParts(<FilterPanel bordered activeCount={3} groups={groups} />)).toEqual(["Clear all", "Count", "Group heading", "Option", "Panel"]);
  });
});

// The docs Anatomy section re-renders its specimen with every report (it keeps the rects in
// state). A part on an Animated host flapped there: Animated replaces its host's ref on
// each render, detaching the part, whose report re-rendered the specimen again, so the
// caret was missing from most reports. Its part is measured on a steady View instead.
describe("a part on an animated host, under a re-rendering specimen", () => {
  function Section({ blink, onReport }: { blink: boolean; onReport: (rects: AnatomyRects) => void }) {
    const [, setRects] = useState<AnatomyRects>({});
    return (
      <ThemeProvider dark solid>
        <AnatomyProvider onMeasure={(next) => { setRects(next); onReport(next); }}>
          <InputOTPWithBlink blink={blink} />
        </AnatomyProvider>
      </ThemeProvider>
    );
  }
  function InputOTPWithBlink({ blink }: { blink: boolean }) {
    return blink ? <AndroidInputOTP length={6} groups={3} value="482" autoFocus /> : <InputOTP length={6} groups={3} value="482" autoFocus />;
  }

  for (const blink of [false, true]) {
    it(`keeps the InputOTP caret registered across the section's re-renders (${blink ? "blinking" : "steady"})`, async () => {
      const reports: AnatomyRects[] = [];
      const { container } = render(<Section blink={blink} onReport={(rects) => reports.push(rects)} />);
      for (let i = 0; i < 3; i++) {
        for (const node of [container, ...container.querySelectorAll("*")]) {
          const handler = (node as unknown as { __reactLayoutHandler?: (event: unknown) => void }).__reactLayoutHandler;
          if (typeof handler === "function") act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width: 0, height: 0 } }, timeStamp: 1 }));
        }
        await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
      }
      expect(Object.keys(reports.at(-1) ?? {}).sort()).toEqual(["Caret", "Cell", "Digit", "Group gap"]);
      // Once registered, the caret never leaves a later report.
      const first = reports.findIndex((rects) => "Caret" in rects);
      expect(reports.slice(first).every((rects) => "Caret" in rects)).toBe(true);
    });
  }
});
