import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { fieldBorder } from "../src/style/field-colors.ts";
import { FOCUS_RING_OFFSET, FOCUS_RING_WIDTH } from "../src/style/pressable.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { Stepper as IOSStepper } from "../src/atoms/stepper/stepper.ios.tsx";
import { Stepper as AndroidStepper } from "../src/atoms/stepper/stepper.android.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Input as IOSInput } from "../src/atoms/input/input.ios.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { Textarea as AndroidTextarea } from "../src/atoms/textarea/textarea.android.tsx";
import { PhoneInput } from "../src/molecules/phone-input/phone-input.tsx";
import { PhoneInput as AndroidPhoneInput } from "../src/molecules/phone-input/phone-input.android.tsx";
import { Autocomplete as AndroidAutocomplete } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import { InputOTP as AndroidInputOTP } from "../src/atoms/input-otp/input-otp.android.tsx";

// A field suppresses the browser's focus ring only because it paints a focus state of
// its own; these hold that every such field really paints one, and that Increase
// Contrast keeps a state border (focus, error, an open list) instead of overwriting it
// with the contrasting hairline, which would leave a keyboard user no focus cue.

afterEach(cleanup);

const t = lightColors;
const channels = (color: string) => {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  return (/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color) ?? []).slice(1, 4).join(",");
};
const border = (node: HTMLElement, side = "") => channels(node.style.getPropertyValue(`border${side}-color`) || node.style.borderColor);
const outline = (node: HTMLElement, property: "offset" | "style" | "color" | "width") => node.style.getPropertyValue(`outline-${property}`);

describe("fields paint their own focus state", () => {
  it("the web Autocomplete field turns its border `ring` while focused, even after Escape closes the list", async () => {
    render(<ThemeProvider light solid><Autocomplete label="Fruit" options={["Apple", "Pear"]} /></ThemeProvider>);
    const field = screen.getByRole("combobox", { name: "Fruit" });
    const box = field.parentElement as HTMLElement;
    expect(border(box)).toBe(channels(fieldBorder(t)));
    fireEvent.focus(field);
    await waitFor(() => expect(border(box)).toBe(channels(t.ring)));
    fireEvent.keyDown(field, { key: "Escape" });
    fireEvent.keyUp(field, { key: "Escape" });
    expect(field.getAttribute("aria-expanded")).toBe("false");
    expect(border(box)).toBe(channels(t.ring));
    fireEvent.blur(field);
    await waitFor(() => expect(border(box)).toBe(channels(fieldBorder(t))));
  });

  it("the web Stepper box turns its border `ring` while its value field holds focus", async () => {
    render(<ThemeProvider light solid><Stepper defaultValue={2} accessibilityLabel="Seats" /></ThemeProvider>);
    const field = screen.getByRole("spinbutton");
    const group = field.parentElement as HTMLElement;
    expect(border(group)).toBe(channels(fieldBorder(t)));
    expect(outline(field, "style")).toBe("solid");
    expect(outline(field, "width")).toBe("0px");
    fireEvent.focus(field);
    await waitFor(() => expect(border(group)).toBe(channels(t.ring)));
    fireEvent.blur(field);
    await waitFor(() => expect(border(group)).toBe(channels(fieldBorder(t))));
  });

  it("a bare iOS or Android Stepper field keeps the kit's themed ring instead", () => {
    render(
      <ThemeProvider light solid>
        <IOSStepper defaultValue={2} accessibilityLabel="iOS seats" />
        <AndroidStepper defaultValue={2} accessibilityLabel="Android seats" />
      </ThemeProvider>,
    );
    for (const field of screen.getAllByRole("spinbutton")) {
      expect(outline(field, "style")).toBe("");
      expect(channels(outline(field, "color"))).toBe(channels(t.ring));
    }
  });

  it("the Command search row's rule turns `ring` and thickens while the search field holds focus", async () => {
    render(<ThemeProvider light solid><Command items={[{ label: "Profile" }, { label: "Settings" }]} /></ThemeProvider>);
    const search = screen.getByRole("textbox");
    const row = search.parentElement as HTMLElement;
    expect(row.style.getPropertyValue("border-bottom-width")).toBe("1px");
    fireEvent.focus(search);
    await waitFor(() => expect(border(row, "-bottom")).toBe(channels(t.ring)));
    expect(row.style.getPropertyValue("border-bottom-width")).toBe("2px");
    fireEvent.blur(search);
    await waitFor(() => expect(border(row, "-bottom")).toBe(channels(t.border)));
  });

  it("the web Select trigger turns its border `ring` while its list is open", async () => {
    render(<ThemeProvider light solid><Select label="Region" options={["EU", "US"]} /></ThemeProvider>);
    const trigger = screen.getByRole("button", { name: "Region" });
    expect(border(trigger)).toBe(channels(fieldBorder(t)));
    fireEvent.click(trigger);
    await waitFor(() => expect(border(trigger)).toBe(channels(t.ring)));
  });

  it("a flush Textarea, which has no frame to paint, keeps the themed ring inside itself", () => {
    render(
      <ThemeProvider light solid>
        <Textarea flush placeholder="Comment" testID="flush" />
        <Textarea placeholder="Framed" testID="framed" />
      </ThemeProvider>,
    );
    const flush = screen.getByTestId("flush");
    expect(outline(flush, "style")).toBe("");
    expect(outline(flush, "offset")).toBe(`-${FOCUS_RING_OFFSET}px`);
    expect(outline(screen.getByTestId("framed"), "style")).toBe("solid");
    expect(outline(screen.getByTestId("framed"), "width")).toBe("0px");
  });
});

// An errored field's border shows the error, not its focus, so it paints no focus state of
// its own there. It must not leave a keyboard user without one: the kit's ring marks its
// keyboard focus around the red edge, drawn by the node that owns the border (the field
// itself, or the box of a grouped field), while the field keeps its browser ring off.
describe("an errored field wears the kit ring on keyboard focus", () => {
  // The node in `root` that wears the frame's ring, if any.
  const ringed = (root: HTMLElement) => [root, ...root.querySelectorAll<HTMLElement>("*")].filter((node) =>
    outline(node, "style") === "solid" && outline(node, "width") === `${FOCUS_RING_WIDTH}px`);
  const cases = [
    { name: "a bare web Input", node: () => <Input label="Email" error defaultValue="ada@" />, owner: "field" },
    { name: "a bare iOS Input", node: () => <IOSInput label="Email" error defaultValue="ada@" />, owner: "field" },
    { name: "an Android Input with its floating label", node: () => <AndroidInput label="Email" error defaultValue="ada@" />, owner: "field" },
    { name: "a grouped Input", node: () => <Input label="Email" suffix="@example.com" error defaultValue="ada" />, owner: "box" },
    { name: "a Textarea", node: () => <Textarea label="Email" error defaultValue="ada@" />, owner: "field" },
    { name: "an Android Textarea", node: () => <AndroidTextarea label="Email" error defaultValue="ada@" />, owner: "field" },
    { name: "a PhoneInput", node: () => <PhoneInput label="Email" error defaultValue="(415) 72" />, owner: "box" },
  ] as const;
  for (const { name, node, owner } of cases) {
    it(`${name} keeps its red edge and wears the ring on keyboard focus only`, () => {
      const { container } = render(<ThemeProvider light solid><View testID="root">{node()}</View></ThemeProvider>);
      const root = container as HTMLElement;
      const field = screen.getByRole("textbox", { name: "Email" });
      // The field keeps the browser's own ring off, so the two never stack.
      expect(outline(field, "width")).toBe("0px");
      expect(ringed(root)).toEqual([]);
      // Tab lands on the field and releases there.
      act(() => { fireEvent.focus(field); fireEvent.keyUp(field, { key: "Tab" }); });
      const [ring, ...more] = ringed(root);
      expect(more).toEqual([]);
      expect(ring).toBeDefined();
      expect(channels(outline(ring!, "color"))).toBe(channels(t.ring));
      expect(outline(ring!, "offset")).toBe(`${FOCUS_RING_OFFSET}px`);
      if (owner === "field") expect(ring).toBe(field);
      else expect(ring!.contains(field) && ring !== field).toBe(true);
      // The error edge stays: the ring is the focus cue, not a replacement for the error.
      const edges = [ring!, ...ring!.querySelectorAll<HTMLElement>("*")].map((n) => [border(n), border(n, "-bottom")]).flat();
      expect(edges).toContain(channels(t.destructive));
      // A pointer press ends the keyboard mark, as :focus-visible does.
      act(() => { fireEvent.pointerDown(field); });
      expect(ringed(root)).toEqual([]);
    });
  }

  it("a field without an error shows focus on its own border, not the ring", async () => {
    render(<ThemeProvider light solid><Input label="Name" testID="name" /></ThemeProvider>);
    const field = screen.getByTestId("name");
    act(() => { fireEvent.focus(field); fireEvent.keyUp(field, { key: "Tab" }); });
    await waitFor(() => expect(border(field)).toBe(channels(t.ring)));
    expect(outline(field, "width")).toBe("0px");
  });
});

// CLAUDE.md, the glass model: a state border (a focus ring, an error edge, an open
// trigger) stays over the pane, and only a resting hairline gives way to the material's
// rim. The Android fields draw their focus as a bottom indicator, named side by side, so a
// clear of every border colour under glass took the indicator with it.
describe("under glass a field's focus border stays over its pane", () => {
  function backdropFilter() {
    const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
    Object.defineProperty(globalThis, "CSS", { value: { supports: () => true }, configurable: true });
    return () => {
      if (css) Object.defineProperty(globalThis, "CSS", css);
      else delete (globalThis as Record<string, unknown>).CSS;
    };
  }
  // The node in `root` whose bottom border is `ring`, which is where Android draws focus.
  const indicator = (root: HTMLElement) => [root, ...root.querySelectorAll<HTMLElement>("*")].find((node) =>
    border(node, "-bottom") === channels(t.ring) && node.style.getPropertyValue("border-bottom-width") !== "0px");
  const cases = [
    { name: "an Android Input", node: () => <AndroidInput label="Code" />, field: () => screen.getByRole("textbox", { name: "Code" }) },
    { name: "an Android Textarea", node: () => <AndroidTextarea label="Code" />, field: () => screen.getByRole("textbox", { name: "Code" }) },
    { name: "an Android PhoneInput", node: () => <AndroidPhoneInput label="Code" />, field: () => screen.getByRole("textbox", { name: "Code" }) },
    { name: "an Android Autocomplete", node: () => <AndroidAutocomplete label="Code" options={["Apple", "Pear"]} />, field: () => screen.getByRole("combobox", { name: "Code" }) },
  ] as const;
  for (const { name, node, field } of cases) {
    it(`${name} keeps its focused indicator`, async () => {
      const restore = backdropFilter();
      try {
        const { container } = render(<ThemeProvider light glass>{node()}</ThemeProvider>);
        expect(container.querySelectorAll('[data-testid="glass-material"]').length).toBeGreaterThan(0);
        expect(indicator(container as HTMLElement)).toBeUndefined();
        fireEvent.focus(field());
        await waitFor(() => expect(indicator(container as HTMLElement)).toBeDefined());
      } finally { restore(); }
    });
  }

  it("an Android InputOTP keeps its active cell's ring", async () => {
    const restore = backdropFilter();
    try {
      const { container } = render(<ThemeProvider light glass><AndroidInputOTP length={4} /></ThemeProvider>);
      const ringed = () => [...container.querySelectorAll<HTMLElement>("*")].filter((node) => border(node) === channels(t.ring));
      expect(ringed()).toEqual([]);
      fireEvent.focus(screen.getByLabelText("One-time code"));
      await waitFor(() => expect(ringed().length).toBe(1));
    } finally { restore(); }
  });

  // The web's clear wells (src/style/text-entry-material.tsx) draw a grouped field's state
  // border as an overlay in the foreground, inset inside the box, so the box itself must
  // give its border up there: a box that kept it as well drew the state twice, a 2 px
  // ring one border-width apart. Every field draws it exactly once, glass or solid, the
  // fields that keep the state on their own border included.
  describe("and is drawn exactly once", () => {
    const SIDES = ["top", "right", "bottom", "left"] as const;
    // The nodes in `root` with a visible border side in `color`.
    const stateBorders = (root: HTMLElement, color: string) => [root, ...root.querySelectorAll<HTMLElement>("*")].filter((node) =>
      SIDES.some((side) => border(node, `-${side}`) === channels(color)
        && parseFloat(node.style.getPropertyValue(`border-${side}-width`) || node.style.borderWidth || "0") > 0));
    const textbox = (name: string) => () => screen.getByRole("textbox", { name });
    const cases = [
      { name: "a bare web Input", node: () => <Input label="Code" />, field: textbox("Code") },
      { name: "a grouped web Input", node: () => <Input label="Code" suffix="@example.com" />, field: textbox("Code") },
      { name: "a web Textarea", node: () => <Textarea label="Code" />, field: textbox("Code") },
      { name: "a web PhoneInput", node: () => <PhoneInput label="Code" />, field: textbox("Code") },
      { name: "a web Autocomplete", node: () => <Autocomplete label="Code" options={["Apple", "Pear"]} />, field: () => screen.getByRole("combobox", { name: "Code" }) },
      { name: "a web Stepper", node: () => <Stepper defaultValue={2} accessibilityLabel="Code" />, field: () => screen.getByRole("spinbutton") },
    ] as const;
    for (const surface of ["glass", "solid"] as const) {
      for (const { name, node, field } of cases) {
        it(`${name} under ${surface} draws its focus border once`, async () => {
          const restore = backdropFilter();
          try {
            const { container } = render(<ThemeProvider light {...{ [surface]: true }}>{node()}</ThemeProvider>);
            const root = container as HTMLElement;
            if (surface === "glass") expect(root.querySelectorAll('[data-testid="glass-material"]').length).toBeGreaterThan(0);
            expect(stateBorders(root, t.ring)).toEqual([]);
            fireEvent.focus(field());
            await waitFor(() => expect(stateBorders(root, t.ring).length).toBeGreaterThan(0));
            expect(stateBorders(root, t.ring).length).toBe(1);
          } finally { restore(); }
        });
      }
    }

    // An error is a state border too, shown while the field rests and while it is focused.
    const errored = [
      { name: "a grouped web Input", node: () => <Input label="Code" suffix="@example.com" error defaultValue="ada" />, field: textbox("Code") },
      { name: "a web PhoneInput", node: () => <PhoneInput label="Code" error defaultValue="(415) 72" />, field: textbox("Code") },
      { name: "a web Textarea", node: () => <Textarea label="Code" error defaultValue="ada" />, field: textbox("Code") },
    ] as const;
    for (const { name, node, field } of errored) {
      it(`${name} under glass draws its error edge once, at rest and focused`, async () => {
        const restore = backdropFilter();
        try {
          const { container } = render(<ThemeProvider light glass>{node()}</ThemeProvider>);
          const root = container as HTMLElement;
          expect(stateBorders(root, t.destructive).length).toBe(1);
          fireEvent.focus(field());
          await waitFor(() => expect(stateBorders(root, t.ring)).toEqual([]));
          expect(stateBorders(root, t.destructive).length).toBe(1);
        } finally { restore(); }
      });
    }
  });
});

describe("Increase Contrast keeps state borders", () => {
  function contrastMore() {
    return spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-contrast"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => true,
        }) as unknown as MediaQueryList,
    );
  }

  it("a resting field takes the contrasting hairline; a focused one keeps `ring`; an errored one keeps its red", async () => {
    const spy = contrastMore();
    try {
      render(
        <ThemeProvider light solid>
          <Input label="Name" testID="rest" />
          <Input label="Email" testID="focus" />
          <Input label="Phone" error testID="error" />
        </ThemeProvider>,
      );
      const rest = screen.getByTestId("rest");
      await waitFor(() => expect(border(rest)).toBe(channels(t.foreground)));
      const focus = screen.getByTestId("focus");
      fireEvent.focus(focus);
      await waitFor(() => expect(border(focus)).toBe(channels(t.ring)));
      expect(border(screen.getByTestId("error"))).toBe(channels(t.destructive));
    } finally {
      spy.mockRestore();
    }
  });
});
