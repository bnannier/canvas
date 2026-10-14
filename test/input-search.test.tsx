import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Input } from "../src/atoms/input/input.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);

test("toolbar search names the editor and replaces its decorative prompt while typing", () => {
  const values: string[] = [];
  const { getByRole, getByText, queryByText } = render(<ThemeProvider light solid><Input search systemFocus placeholder="Search work items" onChangeText={(text) => values.push(text)} /></ThemeProvider>);
  const field = getByRole("textbox", { name: "Search work items" });
  expect(getByText("Search work items").getAttribute("aria-hidden")).toBe("true");
  fireEvent.change(field, { target: { value: "Argus" } });
  expect(values).toEqual(["Argus"]);
  expect(queryByText("Search work items")).toBeNull();
  fireEvent.change(field, { target: { value: "" } });
  expect(getByText("Search work items")).toBeTruthy();
});
