import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Accordion } from "../src/molecules/accordion/accordion.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";

afterEach(cleanup);
it("activity disclosures toggle the trace and expose expanded state", () => {
  const { getByRole, queryByText, getByText } = render(<ThemeProvider><Accordion activity items={[{ key: "run", title: "Scout run", content: <Typography>Trace complete</Typography> }]} /></ThemeProvider>);
  const header = getByRole("button", { name: "Scout run" });
  expect(header.getAttribute("aria-expanded")).toBe("false");
  expect(queryByText("Trace complete")).toBeNull();
  fireEvent.click(header);
  expect(header.getAttribute("aria-expanded")).toBe("true");
  expect(getByText("Trace complete")).toBeTruthy();
  fireEvent.click(header);
  expect(queryByText("Trace complete")).toBeNull();
});
it("nested activity actions keep their own target and leave the trace closed", () => {
  let opened = 0;
  const { getByRole, queryByText } = render(<ThemeProvider><Accordion activity compact items={[{ key: "run", title: "Scout run", content: "Trace complete" }]} renderHeader={(_item, _expanded, indicator) => <><Typography>Scout</Typography><Button onPress={() => { opened++; }}>Open reference</Button>{indicator}</>} /></ThemeProvider>);
  fireEvent.click(getByRole("button", { name: "Open reference" }));
  expect(opened).toBe(1);
  expect(queryByText("Trace complete")).toBeNull();
});
it("disabled activity rows do not expand", () => {
  const { getByRole, queryByText } = render(<ThemeProvider><Accordion activity disabled items={[{ key: "run", title: "Scout run", content: "Trace complete" }]} /></ThemeProvider>);
  fireEvent.click(getByRole("button", { name: "Scout run" }));
  expect(queryByText("Trace complete")).toBeNull();
});
