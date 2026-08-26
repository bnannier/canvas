import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
// Web build (the alias serves <name>.tsx); per-OS skins are covered by skins-smoke.
import { Board, applyBoardMove, type BoardColumn, type BoardItem, type BoardMove } from "../src/organisms/board/board.tsx";

afterEach(cleanup);

// measureInWindow resolves on a macrotask (react-native-web wraps getBoundingClientRect in
// setTimeout(0)); the drag layer's measureAll chains several, so flush a handful of ticks.
async function flush(n = 6) {
  for (let i = 0; i < n; i++) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}

const columns: BoardColumn[] = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "Doing" },
];
const items: BoardItem[] = [
  { id: "a", columnId: "todo", title: "Task A", description: "Rotate the webhook secrets before the audit window closes for the quarter.", badge: "3" },
  { id: "b", columnId: "todo", title: "Task B" },
  { id: "c", columnId: "doing", title: "Task C" },
];

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const byLabel = (c: HTMLElement, label: string) => c.querySelector(`[aria-label="${label}"]`) as HTMLElement;

describe("Board rendering", () => {
  it("renders every column label, card title, and description", () => {
    const { getByText } = ui(<Board columns={columns} items={items} />);
    expect(getByText("To do")).toBeTruthy();
    expect(getByText("Doing")).toBeTruthy();
    expect(getByText("Task A")).toBeTruthy();
    expect(getByText("Task C")).toBeTruthy();
    expect(getByText(/webhook secrets/)).toBeTruthy();
  });

  it("shows the item count badge, or the explicit column badge when given", () => {
    const { getByText } = ui(
      <Board columns={[{ id: "todo", label: "To do" }, { id: "doing", label: "Doing", badge: "WIP 2" }]} items={items} />,
    );
    expect(getByText("2")).toBeTruthy(); // todo holds a + b
    expect(getByText("WIP 2")).toBeTruthy(); // explicit badge wins over the count
  });

  it("renders the item badge and the chips slot on the card", () => {
    const withChips: BoardItem[] = [{ id: "a", columnId: "todo", title: "Task A", badge: "5", chips: <Text>frontend</Text> }];
    const { getByText } = ui(<Board columns={columns} items={withChips} />);
    expect(getByText("5")).toBeTruthy();
    expect(getByText("frontend")).toBeTruthy();
  });

  it("renders the empty message in an empty column (default and custom)", () => {
    const { getByText, rerender } = ui(<Board columns={columns} items={[{ id: "a", columnId: "todo", title: "Task A" }]} />);
    expect(getByText("No items")).toBeTruthy();
    rerender(
      <ThemeProvider>
        <Board columns={columns} items={[{ id: "a", columnId: "todo", title: "Task A" }]} emptyLabel="Nothing here" />
      </ThemeProvider>,
    );
    expect(getByText("Nothing here")).toBeTruthy();
  });
});

describe("Board accessibility", () => {
  it("gives every card a focusable, labeled drag grip", () => {
    const { container } = ui(<Board columns={columns} items={items} />);
    const grip = byLabel(container, "Move Task A");
    expect(grip).not.toBeNull();
    expect(grip.getAttribute("role")).toBe("button");
    expect(grip.getAttribute("tabindex")).not.toBe("-1");
  });

  it("exposes the pressable card body as a named button only when onPressItem is set", () => {
    const { container, rerender } = ui(<Board columns={columns} items={items} />);
    expect(byLabel(container, "Task A")).toBeNull();
    rerender(
      <ThemeProvider>
        <Board columns={columns} items={items} onPressItem={() => {}} />
      </ThemeProvider>,
    );
    const body = byLabel(container, "Task A");
    expect(body).not.toBeNull();
    expect(body.getAttribute("role")).toBe("button");
  });

  it("names the kebab menu after its card and reports selections with the item", () => {
    let selected: { item: BoardItem; label: string; index: number } | null = null;
    const withMenu: BoardItem[] = [
      { id: "a", columnId: "todo", title: "Task A", menu: [{ label: "Archive" }, { label: "Delete", destructive: true }] },
    ];
    const { container, getByText } = ui(
      <Board
        columns={columns}
        items={withMenu}
        onSelectItemMenu={(item, menuItem, menuIndex) => { selected = { item, label: menuItem.label, index: menuIndex }; }}
      />,
    );
    const trigger = byLabel(container, "Actions for Task A");
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger);
    fireEvent.click(getByText("Delete"));
    expect(selected).not.toBeNull();
    expect(selected!.item.id).toBe("a");
    expect(selected!.label).toBe("Delete");
    expect(selected!.index).toBe(1);
  });

  it("never nests one button inside another (grip, kebab, and press target are siblings)", () => {
    const withMenu: BoardItem[] = [{ id: "a", columnId: "todo", title: "Task A", menu: [{ label: "Archive" }] }];
    const { container } = ui(<Board columns={columns} items={withMenu} onPressItem={() => {}} />);
    const buttons = [...container.querySelectorAll("button")];
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.some((b) => b.parentElement?.closest("button") != null)).toBe(false);
  });
});

describe("Board interaction", () => {
  it("reports the pressed item through onPressItem", () => {
    let pressed: BoardItem | null = null;
    const { container } = ui(<Board columns={columns} items={items} onPressItem={(item) => { pressed = item; }} />);
    fireEvent.click(byLabel(container, "Task C"));
    expect(pressed).not.toBeNull();
    expect(pressed!.id).toBe("c");
  });

  it("computes the BoardMove for a keyboard cross-column drop (controlled: list untouched)", async () => {
    let move: BoardMove | null = null;
    const { container, getByText } = ui(<Board columns={columns} items={items} onMove={(m) => { move = m; }} />);
    const grip = byLabel(container, "Move Task A");

    fireEvent.keyDown(grip, { key: " " });
    await flush();
    expect(grip.getAttribute("aria-pressed")).toBe("true");

    // ArrowRight moves the cursor to the Doing column at its top; Enter drops there.
    act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
    act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });

    expect(move).toEqual({ id: "a", from: "todo", to: "doing", index: 0, afterId: null, beforeId: "c" });
    // Controlled: the kit never reorders the DOM itself; Task A stays rendered from `items`.
    expect(getByText("Task A")).toBeTruthy();
  });

  it("computes neighbors for a keyboard same-column reorder", async () => {
    let move: BoardMove | null = null;
    const { container } = ui(<Board columns={columns} items={items} onMove={(m) => { move = m; }} />);
    const grip = byLabel(container, "Move Task A");

    fireEvent.keyDown(grip, { key: " " });
    await flush();
    act(() => { fireEvent.keyDown(grip, { key: "ArrowDown" }); });
    act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });

    expect(move).toEqual({ id: "a", from: "todo", to: "todo", index: 1, afterId: "b", beforeId: null });
  });

  it("applies moves internally in uncontrolled mode and reports the next list", async () => {
    let move: BoardMove | null = null;
    let next: BoardItem[] | null = null;
    const { container } = ui(
      <Board columns={columns} defaultItems={items} onMove={(m) => { move = m; }} onItemsChange={(list) => { next = list; }} />,
    );
    const grip = byLabel(container, "Move Task A");

    fireEvent.keyDown(grip, { key: " " });
    await flush();
    act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
    act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });

    expect(move).not.toBeNull();
    expect(next).not.toBeNull();
    expect(next!.find((i) => i.id === "a")?.columnId).toBe("doing");
    expect(next!.filter((i) => i.columnId === "doing").map((i) => i.id)).toEqual(["a", "c"]);
    // And the applied list matches the standard reducer applied to the reported move.
    expect(next!).toEqual(applyBoardMove(items, move!));
  });

  it("Escape cancels a keyboard drag without firing onMove", async () => {
    let move: BoardMove | null = null;
    const { container } = ui(<Board columns={columns} items={items} onMove={(m) => { move = m; }} />);
    const grip = byLabel(container, "Move Task A");

    fireEvent.keyDown(grip, { key: " " });
    await flush();
    expect(grip.getAttribute("aria-pressed")).toBe("true");
    act(() => { fireEvent.keyDown(grip, { key: "Escape" }); });
    expect(move).toBeNull();
    expect(grip.getAttribute("aria-pressed")).toBeNull();
  });
});

// happy-dom lays nothing out, so every getBoundingClientRect reports 0x0 and the drag layer sees
// a board with no geometry. Give the LANES a rect from their live position in the scroller, which
// is what a real row of lanes reports, and re-read it on every measure so a board whose columns
// the app has since reordered measures the lanes where they now are.
function stubLaneLayout(container: HTMLElement, labels: string[]) {
  const nodes = Array.from(container.querySelectorAll("div")) as HTMLElement[];
  // The lane row is the one node whose children map ONE-TO-ONE onto the column labels; an
  // ancestor holds all of them in a single child, so it is not it.
  const holds = (el: Element, label: string) => el.textContent?.includes(label) === true;
  const lanes = nodes.find((el) => {
    const kids = Array.from(el.children);
    return (
      kids.length === labels.length &&
      kids.every((kid) => labels.filter((label) => holds(kid, label)).length === 1) &&
      labels.every((label) => kids.filter((kid) => holds(kid, label)).length === 1)
    );
  });
  if (!lanes) throw new Error("no lane row in the board (the DropZone lanes were not found)");
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const index = this.parentElement === lanes ? Array.from(lanes.children).indexOf(this) : -1;
    if (index < 0) return original.call(this);
    const left = index * 300;
    return {
      x: left, y: 0, left, top: 0, right: left + 300, bottom: 400, width: 300, height: 400,
      toJSON: () => ({}),
    } as DOMRect;
  };
  return () => { Element.prototype.getBoundingClientRect = original; };
}

describe("Board keyboard lane cursor", () => {
  it("steps to the lane the user sees beside this one after the app reorders the columns", async () => {
    let move: BoardMove | null = null;
    const board = (cols: BoardColumn[]) => (
      <ThemeProvider>
        <Board columns={cols} items={items} onMove={(m) => { move = m; }} />
      </ThemeProvider>
    );
    const { container, rerender } = render(board(columns));
    // The app moves Doing in front of To do. The lanes are keyed by column id, so React reuses
    // them and nothing re-registers: only the geometry knows they swapped.
    rerender(board([columns[1]!, columns[0]!]));
    const restore = stubLaneLayout(container, ["Doing", "To do"]);
    try {
      const grip = byLabel(container, "Move Task A");
      fireEvent.keyDown(grip, { key: " " });
      await flush();
      // Task A sits in To do, which now renders SECOND, so the lane to its LEFT is Doing.
      act(() => { fireEvent.keyDown(grip, { key: "ArrowLeft" }); });
      act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });
      expect(move!.to).toBe("doing");
    } finally {
      restore();
    }
  });
});
