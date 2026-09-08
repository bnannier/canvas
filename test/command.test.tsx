import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrances } from "./entrance-layout.ts";
import { Command } from "../src/organisms/command/command.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The Command palette's search row is a REAL input: typing filters the grouped
// rows (uncontrolled by default, controllable via query/defaultQuery/onQueryChange).
describe("Command search filtering", () => {
  const groups = [
    { heading: "Actions", items: [{ label: "New File" }, { label: "Open File" }, { label: "Save" }] },
    { heading: "Navigation", items: [{ label: "Go to Dashboard" }, { label: "Go to Settings" }] },
  ];

  const labels = (container: HTMLElement) =>
    [...container.querySelectorAll('[role="option"]')].map((o) => o.textContent ?? "");

  it("is searchable out of the box: keystrokes narrow the rows (uncontrolled query)", () => {
    const { container } = ui(<Command groups={groups} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(labels(container).length).toBe(5);
    fireEvent.change(input, { target: { value: "file" } });
    expect(labels(container)).toEqual(["New File", "Open File"]);
  });

  it("drops a group (heading included) when none of its rows match", () => {
    const { container } = ui(<Command groups={groups} />);
    fireEvent.change(container.querySelector("input") as HTMLInputElement, { target: { value: "save" } });
    expect(labels(container)).toEqual(["Save"]);
    expect(screen.queryByText("NAVIGATION")).toBeNull();
    expect(screen.queryByText("Navigation")).toBeNull();
  });

  it("shows a muted No results row when the query matches nothing", () => {
    const { container } = ui(<Command groups={groups} />);
    fireEvent.change(container.querySelector("input") as HTMLInputElement, { target: { value: "zzz" } });
    expect(labels(container).length).toBe(0);
    expect(screen.getByText("No results")).toBeDefined();
  });

  it("filters by a controlled query and seeds from defaultQuery", () => {
    const { container } = ui(<Command groups={groups} query="dash" />);
    expect(labels(container)).toEqual(["Go to Dashboard"]);
    cleanup();
    const { container: seeded } = ui(<Command groups={groups} defaultQuery="open" />);
    expect(labels(seeded)).toEqual(["Open File"]);
  });

  it("reports each keystroke through onQueryChange", () => {
    let typed = "";
    const { container } = ui(<Command groups={groups} onQueryChange={(q) => { typed = q; }} />);
    fireEvent.change(container.querySelector("input") as HTMLInputElement, { target: { value: "go" } });
    expect(typed).toBe("go");
  });

  it("resets the highlight to the first match on each keystroke, and selects within the filtered list", () => {
    let picked = "";
    const { container } = ui(
      <Command groups={groups} defaultActive={4} onSelect={(item) => { picked = item.label; }} />,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    const activeIdx = () =>
      [...container.querySelectorAll('[role="option"]')].findIndex((o) => o.getAttribute("aria-selected") === "true");
    expect(activeIdx()).toBe(4);
    fireEvent.change(input, { target: { value: "go to" } });
    // The visible list is now the two Navigation rows; the highlight snapped to the first.
    expect(activeIdx()).toBe(0);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(picked).toBe("Go to Settings");
  });

  it("prompts with the search placeholder by default", () => {
    ui(<Command groups={groups} />);
    expect(screen.getByPlaceholderText("Search commands...")).toBeDefined();
  });

  it("preserves no highlight until navigation and never selects a nonexistent option", () => {
    const selected: string[] = [];
    const { getByRole } = ui(<Command defaultActive={-1} groups={groups} onSelect={(item) => selected.push(item.label)} />);
    const input = getByRole("textbox");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(selected).toEqual([]);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(document.getElementById(input.getAttribute("aria-activedescendant")!)?.textContent).toBe("New File");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(selected).toEqual(["New File"]);
  });

  it("keeps active references valid as controlled results shrink, empty and reopen", () => {
    const view = (query: string, open = true, active = 20) => <ThemeProvider><Command trigger open={open} groups={groups} query={query} active={active} /></ThemeProvider>;
    const { container, rerender, getByRole, queryByRole } = render(view(""));
    layoutEntrances(container, { width: 360, height: 280 });
    const activeText = () => document.getElementById(getByRole("textbox").getAttribute("aria-activedescendant")!)?.textContent;
    expect(activeText()).toBe("Go to Settings");
    rerender(view("save"));
    expect(activeText()).toBe("Save");
    rerender(view("missing"));
    expect(getByRole("textbox").hasAttribute("aria-activedescendant")).toBe(false);
    rerender(view("", false));
    expect(queryByRole("textbox")).toBeNull();
    rerender(view(""));
    layoutEntrances(container, { width: 360, height: 280 });
    expect(activeText()).toBe("Go to Settings");
    for (const invalid of [-2, 0.5, NaN, Infinity]) {
      rerender(view("", true, invalid));
      expect(getByRole("textbox").hasAttribute("aria-activedescendant")).toBe(false);
    }
  });

  it("associates each purpose-named search with its own named result list", () => {
    const { getByRole } = ui(<>
      <Command accessibilityLabel="Find a document" groups={groups} />
      <Command placeholder="Navigate workspace" groups={groups} />
    </>);
    const first = getByRole("listbox", { name: "Find a document" });
    const second = getByRole("listbox", { name: "Navigate workspace" });
    expect(getByRole("textbox", { name: "Find a document" }).getAttribute("aria-controls")).toBe(first.id);
    expect(getByRole("textbox", { name: "Navigate workspace" }).getAttribute("aria-controls")).toBe(second.id);
    expect(first.id).not.toBe(second.id);
  });

  it("preserves IME confirmation and modified text-editing keys", () => {
    const picked: string[] = [];
    const { container } = ui(<Command open groups={groups} onSelect={(item) => picked.push(item.label)} />);
    const input = container.querySelector("input") as HTMLInputElement;
    const initial = input.getAttribute("aria-activedescendant");
    for (const composition of [{ isComposing: true }, { keyCode: 229 }]) {
      for (const key of ["ArrowDown", "ArrowUp", "Enter"]) {
        expect(fireEvent.keyDown(input, { key, ...composition })).toBe(true);
      }
    }
    for (const modifier of ["altKey", "ctrlKey", "metaKey"]) {
      expect(fireEvent.keyDown(input, { key: "ArrowDown", [modifier]: true })).toBe(true);
    }
    for (const key of ["Home", "End"]) expect(fireEvent.keyDown(input, { key })).toBe(true);
    expect(input.getAttribute("aria-activedescendant")).toBe(initial);
    expect(picked).toEqual([]);
    expect(fireEvent.keyDown(input, { key: "Enter", repeat: true })).toBe(false);
    expect(picked).toEqual([]);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(picked).toEqual(["New File"]);
  });
});
