import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Field } from "../src/molecules/field/field.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// Field's whole reason to exist is the message line no control owns, plus label delegation.
// Delegation is the part that is easy to get subtly wrong, so it is pinned from both directions:
// a field-family control must RECEIVE the label (so Android can float it), and anything else must
// keep the static label above (so it is still named at all).

// An element's OWN text, ignoring descendants. textContent would count every ancestor as a hit,
// and a leaf-only filter would miss a required label, whose node holds "Email" plus a star element.
const ownText = (e: Element): string =>
  [...e.childNodes]
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent ?? "")
    .join("")
    .trim();

const labelsOf = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>("*")].map(ownText);

describe("Field", () => {
  it("renders the helper line under the control", () => {
    ui(
      <Field label="Email" helper="We'll never share your email.">
        <Input placeholder="you@example.com" />
      </Field>,
    );
    expect(screen.getByText("We'll never share your email.")).toBeTruthy();
  });

  it("error replaces helper in place rather than stacking a second line", () => {
    const { container } = ui(
      <Field label="Email" helper="We'll never share your email." error="Enter a valid email address.">
        <Input />
      </Field>,
    );
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    // The helper is gone, not merely hidden: the row must not grow when an error appears.
    expect(labelsOf(container)).not.toContain("We'll never share your email.");
  });

  it("marks the error message as an alert so it is announced", () => {
    const { container } = ui(
      <Field error="Enter a valid email address.">
        <Input />
      </Field>,
    );
    expect(container.querySelector('[role="alert"]')?.textContent).toBe("Enter a valid email address.");
  });

  it("a helper is not an alert", () => {
    const { container } = ui(
      <Field helper="Optional.">
        <Input />
      </Field>,
    );
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("delegates the label into a lone Input rather than drawing its own", () => {
    const { container } = ui(
      <Field label="Email" required>
        <Input testID="control" />
      </Field>,
    );
    // Exactly one node carries the label text. If Field drew its own AND delegated, there would
    // be two, and the field would be announced twice.
    // `required` appends a hidden " *", so match the stem rather than demanding equality.
    const hits = labelsOf(container).filter((t) => t.startsWith("Email"));
    expect(hits.length).toBe(1);
    // The delegated control is the one that got it, so it is marked required too.
    expect(container.querySelector('[aria-required="true"]')).toBeTruthy();
  });

  it("delegates into Textarea as well, not just Input", () => {
    const { container } = ui(
      <Field label="Bio">
        <Textarea />
      </Field>,
    );
    expect(labelsOf(container).filter((t) => t === "Bio").length).toBe(1);
  });

  it("does NOT delegate to a control that owns no label slot: the static label stays", () => {
    const { container } = ui(
      <Field label="Notifications">
        <Switch>Release activity</Switch>
      </Field>,
    );
    // A Switch cannot float a label, so Field must render one itself or the row goes unnamed.
    expect(labelsOf(container)).toContain("Notifications");
    expect(screen.getByText("Release activity")).toBeTruthy();
  });

  it("does NOT override a control that already labels itself", () => {
    const { container } = ui(
      <Field label="Outer">
        <Input label="Inner" />
      </Field>,
    );
    // The control's own label wins; Field falls back to the static label rather than clobbering it.
    expect(labelsOf(container)).toContain("Inner");
    expect(labelsOf(container).filter((t) => t === "Inner").length).toBeGreaterThan(0);
  });

  it("does NOT delegate when there is more than one child", () => {
    const { container } = ui(
      <Field label="Range">
        <Input testID="a" />
        <Input testID="b" />
      </Field>,
    );
    // No single owner, so the label is drawn statically and both controls stay unlabeled.
    expect(labelsOf(container)).toContain("Range");
  });

  it("points a delegated control at the message for assistive tech", () => {
    const { container } = ui(
      <Field label="Email" error="Enter a valid email address.">
        <Input />
      </Field>,
    );
    const described = container.querySelector("[aria-describedby]");
    expect(described).toBeTruthy();
    const id = described?.getAttribute("aria-describedby");
    expect(container.querySelector(`[id="${id}"]`)?.textContent).toBe("Enter a valid email address.");
  });

  it("delegates the error STATE too, so the control paints its destructive border", () => {
    const { container } = ui(
      <Field label="Email" error="Enter a valid email address.">
        <Input />
      </Field>,
    );
    // Without this the row shows red text under a neutral box and reads as unfinished.
    expect(container.querySelector('[aria-invalid="true"]')).toBeTruthy();
  });

  it("does not mark the control invalid when only a helper is set", () => {
    const { container } = ui(
      <Field label="Email" helper="Optional.">
        <Input />
      </Field>,
    );
    expect(container.querySelector('[aria-invalid="true"]')).toBeNull();
  });

  it("renders nothing extra when given only a control", () => {
    const { container } = ui(
      <Field>
        <Input testID="bare" />
      </Field>,
    );
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector('[data-testid="bare"]')).toBeTruthy();
  });
});
