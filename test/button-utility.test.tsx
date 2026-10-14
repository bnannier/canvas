import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Button } from "../src/atoms/button/button.tsx";
import { Icon } from "../src/atoms/icon/icon.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);

test("notification actions keep one named button and deliver their action", () => {
  let presses = 0;
  const { getByRole, getAllByRole, getByText, rerender } = render(<ThemeProvider light solid><Button icon largeIcon circle ghost steadyPress count={3} accessibilityLabel="Approvals" iconLeft={<Icon bell />} onPress={() => presses++} /></ThemeProvider>);
  const trigger = getByRole("button", { name: "Approvals" });
  expect(getAllByRole("button")).toHaveLength(1);
  expect(getByText("3")).toBeTruthy();
  fireEvent.click(trigger);
  expect(presses).toBe(1);
  rerender(<ThemeProvider light solid><Button icon largeIcon circle ghost steadyPress count={3} accessibilityLabel="Approvals" disabled onPress={() => presses++} iconLeft={<Icon bell />} /></ThemeProvider>);
  fireEvent.click(getByRole("button", { name: "Approvals" }));
  expect(presses).toBe(1);
});
