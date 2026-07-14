import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";

// The Material 3 in-container floating label, extended from Input to Autocomplete,
// Select, and Textarea for M3 parity. All four consume the SAME shared
// `FloatingLabel` helper (src/style/floating-label.tsx): iOS + web render the
// label ABOVE the field (`floatingLabel: false`), Android FLOATS the M3
// in-container label (`floatingLabel: true`). Across every skin the label is the
// field's programmatic NAME (accessibilityLabel/aria-label, plus aria-labelledby
// on Input/Textarea), so getByLabelText resolves the control by the label text.
// The docs/web bundler renders every skin through react-native-web, so all three
// are assertable at the DOM here.

import { Autocomplete as AutocompleteWeb } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Autocomplete as AutocompleteIOS } from "../src/atoms/autocomplete/autocomplete.ios.tsx";
import { Autocomplete as AutocompleteAndroid } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import { Select as SelectWeb } from "../src/atoms/select/select.tsx";
import { Select as SelectIOS } from "../src/atoms/select/select.ios.tsx";
import { Select as SelectAndroid } from "../src/atoms/select/select.android.tsx";
import { Textarea as TextareaWeb } from "../src/atoms/textarea/textarea.tsx";
import { Textarea as TextareaIOS } from "../src/atoms/textarea/textarea.ios.tsx";
import { Textarea as TextareaAndroid } from "../src/atoms/textarea/textarea.android.tsx";

import { webSkin as comboWeb, iosSkin as comboIos, androidSkin as comboAndroid } from "../src/atoms/autocomplete/autocomplete.styles.ts";
import { webSkin as selectWeb, iosSkin as selectIos, androidSkin as selectAndroid } from "../src/atoms/select/select.styles.ts";
import { webSkin as areaWeb, iosSkin as areaIos, androidSkin as areaAndroid } from "../src/atoms/textarea/textarea.styles.ts";

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

// --- the label-placement contract each skin declares ------------------------
describe("floatingLabel: Android floats the M3 label, iOS + web render it above", () => {
  const FAMILIES = [
    ["Autocomplete", comboWeb, comboIos, comboAndroid],
    ["Select", selectWeb, selectIos, selectAndroid],
    ["Textarea", areaWeb, areaIos, areaAndroid],
  ] as const;
  for (const [name, web, ios, android] of FAMILIES) {
    it(`${name}: web=false, ios=false, android=true`, () => {
      expect(web.floatingLabel).toBe(false);
      expect(ios.floatingLabel).toBe(false);
      expect(android.floatingLabel).toBe(true);
      // The Android skin supplies the floating geometry; iOS/web do not need it.
      expect(typeof android.labelRest).toBe("function");
      expect(typeof android.labelFloated).toBe("function");
      expect(typeof android.labelReserve).toBe("function");
    });
  }
});

// --- the label names the field on every skin (getByLabelText) ---------------
describe("Autocomplete label names the field on every skin", () => {
  for (const [plat, Autocomplete] of [["web", AutocompleteWeb], ["ios", AutocompleteIOS], ["android", AutocompleteAndroid]] as const) {
    it(`${plat}: the visible label is the field's accessible name`, () => {
      ui(<Autocomplete label="Assignee" options={["Ada", "Grace"]} placeholder="Search…" />);
      const field = screen.getByLabelText("Assignee");
      expect(field.tagName.toLowerCase()).toBe("input");
      expect(field.getAttribute("role")).toBe("combobox");
    });
  }
});

describe("Select label names the trigger on every skin", () => {
  for (const [plat, Select] of [["web", SelectWeb], ["ios", SelectIOS], ["android", SelectAndroid]] as const) {
    it(`${plat}: the visible label is the trigger's accessible name`, () => {
      ui(<Select label="Region" options={["EU", "US"]} placeholder="Select a region" />);
      const trigger = screen.getByLabelText("Region");
      // The trigger is the pressable disclosure control (aria-expanded present).
      expect(trigger.getAttribute("aria-expanded")).not.toBeNull();
    });
  }
});

describe("Textarea label names the field on every skin", () => {
  for (const [plat, Textarea] of [["web", TextareaWeb], ["ios", TextareaIOS], ["android", TextareaAndroid]] as const) {
    it(`${plat}: the visible label is the field's accessible name`, () => {
      ui(<Textarea label="Description" placeholder="A few words…" rows={3} />);
      const field = screen.getByLabelText("Description");
      expect(field.tagName.toLowerCase()).toBe("textarea");
      // Textarea links the label by nativeID (aria-labelledby), mirroring Input.
      expect(field.getAttribute("aria-labelledby")).toBeTruthy();
    });
  }
});

// --- the required star never pollutes the accessible name -------------------
describe("required marks aria-required but the name stays the bare label", () => {
  it("Autocomplete (android floating)", () => {
    ui(<AutocompleteAndroid label="Assignee" required options={["Ada"]} placeholder="Search…" />);
    // getByLabelText is exact: it only resolves if the name is "Assignee", not "Assignee *".
    expect(screen.getByLabelText("Assignee").getAttribute("aria-required")).toBe("true");
  });
  it("Select (android floating)", () => {
    ui(<SelectAndroid label="Region" required options={["EU"]} placeholder="Select a region" />);
    expect(screen.getByLabelText("Region").getAttribute("aria-required")).toBe("true");
  });
  it("Textarea (ios above)", () => {
    ui(<TextareaIOS label="Description" required placeholder="A few words…" rows={3} />);
    expect(screen.getByLabelText("Description").getAttribute("aria-required")).toBe("true");
  });
  it("omits aria-required entirely when the field is optional", () => {
    ui(<AutocompleteWeb label="Assignee" options={["Ada"]} placeholder="Search…" />);
    expect(screen.getByLabelText("Assignee").getAttribute("aria-required")).toBeNull();
  });
});

// --- Android floating actually engages (M3 placeholder gating) --------------
describe("Android floating label owns the resting placeholder", () => {
  it("Autocomplete: the field hides its placeholder until the list opens", () => {
    const { container } = ui(<AutocompleteAndroid label="Assignee" options={["Ada"]} placeholder="Search…" />);
    const input = container.querySelector("input") as HTMLInputElement;
    // At rest the floating label IS the placeholder, so no placeholder attribute.
    expect(input.getAttribute("placeholder")).toBeNull();
    fireEvent.focus(input); // focusing opens the list (the combobox's focus signal)
    expect(input.getAttribute("placeholder")).toBe("Search…");
  });

  it("Autocomplete: web keeps the placeholder visible at rest (label is above)", () => {
    const { container } = ui(<AutocompleteWeb label="Assignee" options={["Ada"]} placeholder="Search…" />);
    expect((container.querySelector("input") as HTMLInputElement).getAttribute("placeholder")).toBe("Search…");
  });

  it("Select: the trigger hides its placeholder text at rest (label is the placeholder)", () => {
    ui(<SelectAndroid label="Region" options={["EU"]} placeholder="Select a region" />);
    // The floating label renders the field name; the resting placeholder text is suppressed.
    expect(screen.getByText("Region")).not.toBeNull();
    expect(screen.queryByText("Select a region")).toBeNull();
  });

  it("Select: web shows the placeholder text at rest (label is above)", () => {
    ui(<SelectWeb label="Region" options={["EU"]} placeholder="Select a region" />);
    expect(screen.getByText("Select a region")).not.toBeNull();
  });

  it("Textarea: the field hides its placeholder until focus", () => {
    const { container } = ui(<TextareaAndroid label="Description" placeholder="A few words…" rows={3} />);
    const area = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(area.getAttribute("placeholder")).toBeNull();
    fireEvent.focus(area);
    expect(area.getAttribute("placeholder")).toBe("A few words…");
  });

  it("Textarea: a prefilled Android field mounts floated without crashing", () => {
    ui(<TextareaAndroid label="Description" defaultValue="Seeded content" rows={3} />);
    expect(screen.getByLabelText("Description")).not.toBeNull();
  });

  it("Textarea: a flush field always renders the label above (no in-container float)", () => {
    // A flush textarea drops its frame to sit inside a toolbar Card, so the M3
    // in-container float makes no sense there; the label renders above instead.
    const { container } = ui(<TextareaAndroid label="Comment" flush placeholder="Leave a comment…" rows={3} />);
    const area = container.querySelector("textarea") as HTMLTextAreaElement;
    // Above-rendering keeps the placeholder visible immediately (not focus-gated).
    expect(area.getAttribute("placeholder")).toBe("Leave a comment…");
    expect(screen.getByLabelText("Comment")).not.toBeNull();
  });
});

// --- the no-label path is unchanged (bare root) -----------------------------
describe("the no-label path stays bare (backward compatible)", () => {
  it("Autocomplete emits no name link when `label` is omitted", () => {
    const { container } = ui(<AutocompleteWeb options={["Ada"]} placeholder="Search…" />);
    expect((container.querySelector("input") as HTMLElement).getAttribute("aria-label")).toBeNull();
  });
  it("Textarea emits no name link when `label` is omitted", () => {
    const { container } = ui(<TextareaWeb placeholder="Notes" />);
    const area = container.querySelector("textarea") as HTMLElement;
    expect(area.getAttribute("aria-label")).toBeNull();
    expect(area.getAttribute("aria-labelledby")).toBeNull();
  });
});
