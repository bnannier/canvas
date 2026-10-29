import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ElementType } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";

// One job, different control (the design language's item 5): an iOS option list marks
// each chosen row with a trailing check. iOS menus (Select's pop-up menu) keep UIMenu's
// leading check, so they are not covered here.

afterEach(cleanup);

type Platform = "web" | "ios" | "android";
const suffix = (platform: Platform) => (platform === "web" ? "" : `.${platform}`);
const listbox = async (platform: Platform) =>
  (await import(`../src/atoms/listbox/listbox${suffix(platform)}.tsx`)).Listbox as ElementType;
const filterPanel = async (platform: Platform) =>
  (await import(`../src/organisms/filter-panel/filter-panel${suffix(platform)}.tsx`)).FilterPanel as ElementType;

/** The decorative trailing check of a row: the last hidden ✓, or null. */
function trailingCheck(row: HTMLElement): HTMLElement | null {
  const last = row.lastElementChild as HTMLElement | null;
  return last?.getAttribute("aria-hidden") === "true" && last.textContent === "✓" ? last : null;
}
const shown = (check: HTMLElement | null) => check != null && check.style.opacity !== "0";

const ITEMS = [{ label: "Backend" }, { label: "Frontend", detail: "Web applications" }, { label: "Design" }];

// Listbox has no platform control on iOS or Android (PLATFORM-REFERENCES.md), so every
// platform draws the hand-off's list: a chosen row sits on the accent's soft wash with a
// trailing check in the accent ink, in single and multi select alike.
const checkSlot = (row: HTMLElement) => row.lastElementChild as HTMLElement;
const checked = (row: HTMLElement) => checkSlot(row).getAttribute("aria-hidden") === "true" && checkSlot(row).childElementCount === 1;

describe("the Listbox on every platform", () => {
  for (const platform of ["web", "ios", "android"] as const) {
    it(`marks the chosen option with the soft wash and a trailing check that follows a press on ${platform}`, async () => {
      const Listbox = await listbox(platform);
      render(<ThemeProvider light solid><Listbox accessibilityLabel="Team" items={ITEMS} defaultSelected={1} /></ThemeProvider>);
      const rows = screen.getAllByRole("option");
      expect(rows.map(checked)).toEqual([false, true, false]);
      // No leading gutter: the row starts with its label stack.
      expect(rows[1].firstElementChild?.textContent).toBe("FrontendWeb applications");
      expect(rows[1].style.backgroundColor).toBe(lightColors["primary-soft"]!.replace("0.1)", "0.10)"));
      expect(rows[0].style.backgroundColor).toBe("");
      fireEvent.click(rows[2]);
      expect(rows.map(checked)).toEqual([false, false, true]);
      expect(rows[2].getAttribute("aria-selected")).toBe("true");
    });

    it(`marks every chosen row the same way in multi-select on ${platform}`, async () => {
      const Listbox = await listbox(platform);
      render(<ThemeProvider light solid><Listbox multi accessibilityLabel="Teams" items={ITEMS} defaultSelected={[0, 2]} /></ThemeProvider>);
      const rows = screen.getAllByRole("checkbox");
      expect(rows.map(checked)).toEqual([true, false, true]);
      fireEvent.click(rows[0]);
      expect(rows.map(checked)).toEqual([false, false, true]);
      expect(rows[0].getAttribute("aria-checked")).toBe("false");
    });
  }
});

describe("the FilterPanel option rows", () => {
  const groups = [{ title: "Status", options: [
    { label: "Active", value: "active", count: "128" },
    { label: "Archived", value: "archived", count: "42" },
  ] }];

  it("on iOS put the label first, then the count, then a trailing check on a chosen filter", async () => {
    const FilterPanel = await filterPanel("ios");
    render(<ThemeProvider><FilterPanel groups={groups} defaultValue={["active"]} /></ThemeProvider>);
    const active = screen.getByRole("checkbox", { name: "Active, 128" });
    const archived = screen.getByRole("checkbox", { name: "Archived, 42" });
    expect([...active.children].map((child) => child.textContent)).toEqual(["Active", "128", "✓"]);
    expect([shown(trailingCheck(active)), shown(trailingCheck(archived))]).toEqual([true, false]);
    fireEvent.click(archived);
    expect(shown(trailingCheck(archived))).toBe(true);
    expect(archived.getAttribute("aria-checked")).toBe("true");
  });

  for (const platform of ["web", "android"] as const) {
    it(`on ${platform} lead with the selection Checkbox and carry no trailing check`, async () => {
      const FilterPanel = await filterPanel(platform);
      render(<ThemeProvider><FilterPanel groups={groups} defaultValue={["active"]} /></ThemeProvider>);
      const active = screen.getByRole("checkbox", { name: "Active, 128" });
      expect(trailingCheck(active)).toBeNull();
      expect(active.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
      // The web row sets its own 400 label beside the bare box (the hand-off's option
      // label); Android's label is the Checkbox's own, inside the hidden indicator.
      if (platform === "web") expect(active.children[1]?.textContent).toBe("Active");
      else expect(active.firstElementChild?.textContent).toContain("Active");
    });
  }
});
