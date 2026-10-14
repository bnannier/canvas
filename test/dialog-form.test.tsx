import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);

test("closed application forms contribute no layout box", () => {
  const { container } = render(<ThemeProvider solid><Dialog form overlay open={false} title="Edit project"><Input label="Name" /></Dialog></ThemeProvider>);
  expect(container.childElementCount).toBe(0);
});

test("application forms keep their named header and footer around custom fields", () => {
  const changes: boolean[] = [];
  const { getByRole } = render(<ThemeProvider solid><OverlayProvider><Dialog form overlay dismissible open title="Project details" description="Update the name." onOpenChange={(open) => changes.push(open)} footer={<Button>Save changes</Button>}><Input label="Name" defaultValue="Core" autoFocus /></Dialog></OverlayProvider></ThemeProvider>);
  expect(getByRole("dialog", { name: "Project details" }).getAttribute("aria-describedby")).toBeTruthy();
  expect(document.activeElement).toBe(getByRole("textbox", { name: "Name" }));
  expect(getByRole("button", { name: "Save changes" })).toBeTruthy();
  fireEvent.click(getByRole("button", { name: "Close" }));
  expect(changes).toEqual([false]);
});
