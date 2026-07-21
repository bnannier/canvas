import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { ActionPanel } from "../src/molecules/action-panels/action-panels.tsx";
import { CodeBlock } from "../src/molecules/code-block/code-block.tsx";
import { DescriptionList } from "../src/molecules/description-lists/description-lists.tsx";
import { MediaObject } from "../src/molecules/media-objects/media-objects.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("ActionPanel", () => {
  it("renders its title + description copy and fires the action button handler", () => {
    let fired = false;
    ui(
      <ActionPanel
        title="Delete workspace"
        description="This permanently removes all data."
        actionLabel="Delete"
        onAction={() => { fired = true; }}
        destructive
      />,
    );
    // Main content renders.
    expect(screen.getByText("Delete workspace")).toBeTruthy();
    expect(screen.getByText("This permanently removes all data.")).toBeTruthy();
    // The action is a button carrying the label, and pressing it fires onAction.
    const button = screen.getByText("Delete");
    fireEvent.click(button);
    expect(fired).toBe(true);
  });

  it("toggle axis swaps the Button action for a Switch that fires onToggle", () => {
    let next: boolean | null = null;
    ui(
      <ActionPanel
        title="Wi-Fi"
        description="Connect automatically to known networks."
        toggle
        defaultChecked={false}
        onToggle={(v) => { next = v; }}
      />,
    );
    // In toggle mode the action renders as a Switch, not a Button.
    const sw = screen.getByRole("switch");
    expect(sw).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    // Flipping the uncontrolled Switch reports the next value.
    fireEvent.click(sw);
    expect(next).toBe(true);
  });
});

describe("CodeBlock", () => {
  it("renders the code content and a filename header label (plain variant)", () => {
    ui(<CodeBlock code="const x = 1;" filename="config.ts" />);
    expect(screen.getByText("const x = 1;")).toBeTruthy();
    expect(screen.getByText("config.ts")).toBeTruthy();
  });

  it("copy affordance renders a labelled button and passes the code back on press", () => {
    let copied: string | null = null;
    ui(<CodeBlock code="npm run build" copy onCopy={(c) => { copied = c; }} />);
    const copyBtn = screen.getByRole("button", { name: "Copy code" });
    fireEvent.click(copyBtn);
    expect(copied).toBe("npm run build");
  });

  it("numbered variant renders one gutter line-number per code line", () => {
    ui(<CodeBlock numbered code={"alpha\nbeta\ngamma"} />);
    // Three lines => a 1,2,3 gutter, and each code line renders.
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.queryByText("4")).toBeNull();
    expect(screen.getByText("beta")).toBeTruthy();
  });

  it("terminal variant renders the language chrome label and each command row", () => {
    const { container } = ui(<CodeBlock terminal language="zsh" code={"npm install\nnpm test"} />);
    expect(screen.getByText("zsh")).toBeTruthy();
    // Commands are tokenized into highlighted spans, so match on text content.
    expect(container.textContent).toContain("npm install");
    expect(container.textContent).toContain("npm test");
  });
});

describe("DescriptionList", () => {
  const items = [
    { term: "Name", value: "Ada Lovelace" },
    { term: "Role", value: "Owner", badge: true },
    { term: "Plan", value: "Pro", update: true },
  ];

  it("renders every term and value pair", () => {
    ui(<DescriptionList testID="dl" items={items} />);
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("Role")).toBeTruthy();
    expect(screen.getByText("Plan")).toBeTruthy();
  });

  it("renders exactly one row per data item", () => {
    const { container } = ui(<DescriptionList testID="dl" items={items} />);
    const root = container.querySelector('[data-testid="dl"]');
    expect(root).toBeTruthy();
    // With no card header, each item is one direct child row of the root.
    expect(root!.children.length).toBe(items.length);
  });

  it("the update affordance renders a named Update button, and card adds a header title", () => {
    ui(<DescriptionList card title="Account" items={items} />);
    // The per-item `update` flag appends a labelled inline-edit button.
    expect(screen.getByRole("button", { name: "Update Plan" })).toBeTruthy();
    // `card` + `title` renders the header band title.
    expect(screen.getByText("Account")).toBeTruthy();
  });

  it("Update opens the in-place editor; committing shows the new value and fires onUpdate", () => {
    let got: [number, string] | null = null;
    ui(<DescriptionList items={items} onUpdate={(i, v) => { got = [i, v]; }} />);
    fireEvent.click(screen.getByRole("button", { name: "Update Plan" }));
    // The editor seeds from the current value.
    const input = screen.getByLabelText("Plan value") as HTMLInputElement;
    expect(input.value).toBe("Pro");
    fireEvent.change(input, { target: { value: "Enterprise" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Plan" }));
    // Uncontrolled commit: the row shows the new value, the editor closes, the
    // affordance returns for another round, and the callback reported it.
    expect(got).toEqual([2, "Enterprise"]);
    expect(screen.getByText("Enterprise")).toBeTruthy();
    expect(screen.queryByLabelText("Plan value")).toBeNull();
    expect(screen.getByRole("button", { name: "Update Plan" })).toBeTruthy();
  });

  it("Cancel dismisses the editor without changing the value or firing onUpdate", () => {
    let fired = false;
    ui(<DescriptionList items={items} onUpdate={() => { fired = true; }} />);
    fireEvent.click(screen.getByRole("button", { name: "Update Plan" }));
    fireEvent.change(screen.getByLabelText("Plan value"), { target: { value: "Scrapped" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel updating Plan" }));
    expect(fired).toBe(false);
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.queryByText("Scrapped")).toBeNull();
  });

  it("a consumer-supplied new item value (the controlled response) wins over the internal edit", () => {
    const { rerender } = ui(<DescriptionList items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Update Plan" }));
    fireEvent.change(screen.getByLabelText("Plan value"), { target: { value: "Team" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Plan" }));
    expect(screen.getByText("Team")).toBeTruthy();
    // The consumer answers onUpdate by passing new items: the prop value wins
    // and the internal (uncontrolled) edit goes inert.
    const next = [...items.slice(0, 2), { term: "Plan", value: "Business", update: true }];
    rerender(<ThemeProvider><DescriptionList items={next} /></ThemeProvider>);
    expect(screen.getByText("Business")).toBeTruthy();
    expect(screen.queryByText("Team")).toBeNull();
  });
});

describe("MediaObject", () => {
  it("renders the leading icon media, the title/description/body, and trailing meta", () => {
    ui(
      <MediaObject
        icon="★"
        title="Ada Lovelace"
        description="ada@example.com"
        body="Wrote the first algorithm."
        meta="2h ago"
      />,
    );
    expect(screen.getByText("★")).toBeTruthy();
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("ada@example.com")).toBeTruthy();
    expect(screen.getByText("Wrote the first algorithm.")).toBeTruthy();
    expect(screen.getByText("2h ago")).toBeTruthy();
  });

  it("onPress makes the row a button named after its title and fires the handler", () => {
    let pressed = false;
    ui(<MediaObject title="Open profile" description="tap me" onPress={() => { pressed = true; }} />);
    const button = screen.getByRole("button", { name: "Open profile" });
    fireEvent.click(button);
    expect(pressed).toBe(true);
  });

  it("a title-less tappable row falls back to the description for its accessible name", () => {
    ui(<MediaObject description="No headline here" onPress={() => {}} />);
    expect(screen.getByRole("button", { name: "No headline here" })).toBeTruthy();
  });

  it("a bare (no onPress) row exposes no button role", () => {
    ui(<MediaObject title="Static row" description="not tappable" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
