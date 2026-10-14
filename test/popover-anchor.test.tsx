import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import type { View } from "react-native";
import { Button } from "../src/atoms/button/button.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrance } from "./entrance-layout.ts";
afterEach(cleanup);

test("an external anchor adds no second trigger and Escape closes its named panel", () => {
  const anchor = createRef<View>();
  const changes: boolean[] = [];
  const { getAllByRole, getByRole, queryByText } = render(<ThemeProvider light solid><Button ref={anchor}>Filters</Button><Popover anchorRef={anchor} open compact comfortable anchored panelWidth={320} title="Selection" accessibilityLabel="Roster filters" onOpenChange={(open) => changes.push(open)}>Choose roles</Popover></ThemeProvider>);
  layoutEntrance(getByRole("dialog", { hidden: true }), { width: 320, height: 120 });
  expect(getAllByRole("button")).toHaveLength(1);
  expect(getByRole("dialog", { name: "Roster filters" })).toBeTruthy();
  expect(queryByText("Open popover")).toBeNull();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(changes).toEqual([false]);
});
