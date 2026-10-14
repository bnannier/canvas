import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import type { View } from "react-native";
import { Button } from "../src/atoms/button/button.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrances } from "./entrance-layout.ts";
afterEach(cleanup);

test("external project menus announce checked choices and keep refresh commands open", () => {
  const anchor = createRef<View>();
  const selected: string[] = [], openings: boolean[] = [];
  const { container, getByRole, getAllByRole } = render(<ThemeProvider light solid><Button ref={anchor}>Projects</Button><Dropdown compact steadyPress anchorRef={anchor} menuWidth={250} label="Your projects" open onOpenChange={(open) => openings.push(open)} onSelect={(item) => selected.push(item.value!)} items={[
    { label: "All my projects", value: "all", selected: true, detail: "11" },
    { label: "Platform Core", value: "core", selected: false, detail: "6" },
    { label: "Refresh projects", value: "refresh", keepOpen: true, sectionBefore: "Manage projects" },
  ]} /></ThemeProvider>);
  layoutEntrances(container, { width: 250, height: 180 });
  expect(getAllByRole("button")).toHaveLength(1);
  expect(getByRole("menuitemradio", { name: "All my projects, 11" }).getAttribute("aria-checked")).toBe("true");
  fireEvent.click(getByRole("menuitem", { name: "Refresh projects" }));
  expect(openings).toEqual([]);
  fireEvent.click(getByRole("menuitemradio", { name: "Platform Core, 6" }));
  expect(selected).toEqual(["refresh", "core"]);
  expect(openings).toEqual([false]);
});
