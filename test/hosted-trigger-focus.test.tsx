import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { View } from "react-native";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

let measure: ReturnType<typeof spyOn>;
beforeEach(() => {
  // Leave the real host and portal lifecycle intact; happy-dom needs geometry.
  measure = spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const outlet = getComputedStyle(this).zIndex === "1000";
    const [x, y, width, height] = outlet ? [0, 0, 640, 800] : [80, 100, 180, 40];
    return { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height, toJSON: () => ({}) };
  });
});
afterEach(() => { cleanup(); measure.mockRestore(); });

const cases: { name: string; node: ReactNode; open: () => void; content: string }[] = [
  { name: "Autocomplete", node: <Autocomplete label="Fruit" options={["Apple"]} />,
    open: () => fireEvent.focus(screen.getByRole("combobox", { name: "Fruit" })), content: "Apple" },
  { name: "Select", node: <Select label="Fruit" options={["Apple"]} />,
    open: () => fireEvent.click(screen.getByRole("button", { name: "Fruit" })), content: "Apple" },
  { name: "Dropdown", node: <Dropdown trigger="Actions" items={[{ label: "Archive" }]} />,
    open: () => fireEvent.click(screen.getByRole("button", { name: "Actions" })), content: "Archive" },
  { name: "Popover", node: <Popover trigger="Details" title="Information" />,
    open: () => fireEvent.click(screen.getByRole("button", { name: "Details" })), content: "Information" },
  { name: "ButtonGroup split", node: <ButtonGroup split items={["Save"]} menu={["Save a copy"]} />,
    open: () => fireEvent.click(screen.getByRole("button", { name: "More actions" })), content: "Save a copy" },
  { name: "Command", node: <Command trigger groups={[{ items: [{ label: "Run task" }] }]} />,
    open: () => fireEvent.click(screen.getByText("Search...")), content: "Run task" },
  { name: "RowMenu", node: <RowMenu triggerLabel="Row actions" items={[{ label: "Archive" }]} />,
    open: () => fireEvent.click(screen.getByRole("button", { name: "Row actions" })), content: "Archive" },
];

describe("anchored trigger stacking", () => {
  for (const hosted of [true, false]) {
    for (const item of cases) {
      it(`${item.name}: ${hosted ? "hosted trigger stays at its original layer" : "inline fallback retains its open layer"}`, async () => {
        const fixture = <View testID="fixture">{item.node}</View>;
        render(<ThemeProvider>{hosted ? <OverlayProvider>{fixture}</OverlayProvider> : fixture}</ThemeProvider>);
        const frame = screen.getByTestId("fixture");
        const triggerAncestor = frame.firstElementChild!;
        const initialZ = getComputedStyle(triggerAncestor).zIndex;
        expect(["", "auto", "0"]).toContain(initialZ);

        item.open();
        await screen.findByText(item.content);
        expect(frame.firstElementChild).toBe(triggerAncestor);
        expect(getComputedStyle(triggerAncestor).zIndex).toBe(hosted ? initialZ : "50");
        // Hosted content really left the trigger subtree; suppressing its lift
        // must not accidentally turn the floating card into inline content.
        expect(triggerAncestor.contains(screen.getByText(item.content))).toBe(!hosted);
      });
    }
  }
});

it("the unnamed backdrop is excluded from focus and accessibility while outside presses still dismiss", async () => {
  const changes: boolean[] = [];
  const { container } = render(<ThemeProvider><OverlayProvider>
    <Dropdown trigger="Actions" items={[{ label: "Archive" }]} onOpenChange={(next) => changes.push(next)} />
  </OverlayProvider></ThemeProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Actions" }));
  await screen.findByRole("menuitem", { name: "Archive" });
  const outlet = [...container.querySelectorAll("div")].find((node) => getComputedStyle(node).zIndex === "1000")!;
  const backdrop = [...outlet.children].find((node) => {
    const style = getComputedStyle(node);
    return style.top === "0px" && style.bottom === "0px" && style.left === "0px" && style.right === "0px";
  }) as HTMLElement;
  expect(backdrop).toBeDefined();
  expect(backdrop.getAttribute("aria-hidden")).toBe("true");
  expect(backdrop.getAttribute("tabindex")).toBe("-1");
  expect(screen.queryByRole("button", { name: "" })).toBeNull();
  fireEvent.click(backdrop);
  await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Archive" })).toBeNull());
  expect(changes).toEqual([true, false]);
  expect(screen.getByRole("button", { name: "Actions" }).getAttribute("aria-expanded")).toBe("false");
});

it("Drawer interception wrappers stay out of the tab order without hiding their controls", async () => {
  let presses = 0;
  render(<ThemeProvider><Drawer trigger="Open drawer" open>
    <Button onPress={() => presses += 1}>Inside drawer</Button>
  </Drawer></ThemeProvider>);
  const inside = await screen.findByRole("button", { name: "Inside drawer" });
  expect(inside.closest('[aria-hidden="true"]')).toBeNull();
  const wrappers: HTMLElement[] = [];
  for (let node = inside.parentElement; node; node = node.parentElement) {
    if (node.hasAttribute("tabindex")) wrappers.push(node);
  }
  expect(wrappers.length).toBeGreaterThanOrEqual(2);
  for (const wrapper of wrappers) expect(wrapper.getAttribute("tabindex")).toBe("-1");
  fireEvent.click(inside);
  expect(presses).toBe(1);
  expect(screen.getByRole("button", { name: "Inside drawer" })).toBe(inside);
});
