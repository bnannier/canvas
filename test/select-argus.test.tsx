import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Select } from "../src/atoms/select/select.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrances } from "./entrance-layout.ts";
afterEach(cleanup);

test("compact selection fields expose their purpose and choose plain options without an indicator gutter", () => {
  const selections: string[] = [];
  const { container, getByRole, queryByRole } = render(<ThemeProvider light solid><Select dense eyebrow soft plainOptions steadyPress combobox menuWidth={260} label="Priority" defaultValue="medium" onSelect={(value) => selections.push(value)} options={[{ value: "high", label: "High" }, { value: "medium", label: "Medium" }]} /></ThemeProvider>);
  const trigger = getByRole("combobox", { name: "Priority" });
  fireEvent.click(trigger);
  layoutEntrances(container, { width: 260, height: 84 });
  const high = getByRole("option", { name: "High" });
  expect(getByRole("option", { name: "Medium" }).getAttribute("aria-selected")).toBe("true");
  expect(high.textContent).toBe("High");
  fireEvent.click(high);
  expect(selections).toEqual(["high"]);
  expect(trigger.textContent).toBe("High");
  expect(queryByRole("listbox")).toBeNull();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

test("a soft field drops only its resting edge: open, its edge is the ring", () => {
  const { getByRole } = render(<ThemeProvider light solid><Select dense eyebrow soft label="Priority" defaultValue="medium" options={[{ value: "high", label: "High" }, { value: "medium", label: "Medium" }]} /></ThemeProvider>);
  const trigger = getByRole("button", { name: "Priority" });
  const edge = () => getComputedStyle(trigger).borderTopColor;
  const rest = edge();
  fireEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(edge()).not.toBe(rest);
  expect(edge()).not.toBe("transparent");
});
