import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { listMoveFor } from "../src/molecules/stacked-lists/stacked-lists.reorder.ts";
// Web build (the alias serves <name>.tsx); per-OS skins are covered by skins-smoke.
import { StackedList, type StackedListItem, type StackedListMove } from "../src/molecules/stacked-lists/stacked-lists.tsx";

afterEach(cleanup);

// measureInWindow resolves on a macrotask (react-native-web wraps getBoundingClientRect in
// setTimeout(0)); the drag layer's measureAll chains several, so flush a handful of ticks.
async function flush(n = 6) {
  for (let i = 0; i < n; i++) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}

const people: StackedListItem[] = [
  { id: "ada", name: "Ada Lovelace", detail: "ada@acme.dev" },
  { id: "alan", name: "Alan Turing", detail: "alan@acme.dev" },
  { id: "grace", name: "Grace Hopper", detail: "grace@acme.dev" },
];

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const grips = (c: HTMLElement) => [...c.querySelectorAll('[aria-label^="Reorder "]')] as HTMLElement[];

// ---- pure move math (no renderer) ------------------------------------------

describe("listMoveFor", () => {
  it("derives the move for a drop below the next row", () => {
    // Drag row 0 to insertion index 1 over [alan, grace] -> after alan, before grace.
    expect(listMoveFor(["ada", "alan", "grace"], 0, 1)).toEqual({
      id: "ada", fromIndex: 0, toIndex: 1, afterId: "alan", beforeId: "grace",
    });
  });

  it("marks the top with afterId null and the bottom with beforeId null", () => {
    expect(listMoveFor(["ada", "alan", "grace"], 2, 0)).toEqual({
      id: "grace", fromIndex: 2, toIndex: 0, afterId: null, beforeId: "ada",
    });
    expect(listMoveFor(["ada", "alan", "grace"], 0, 2)).toEqual({
      id: "ada", fromIndex: 0, toIndex: 2, afterId: "grace", beforeId: null,
    });
  });

  it("clamps an out-of-range insertion index", () => {
    expect(listMoveFor(["ada", "alan"], 0, 99)?.toIndex).toBe(1);
  });

  it("supports numeric (index-fallback) identities", () => {
    expect(listMoveFor([0, 1, 2], 1, 0)).toEqual({ id: 1, fromIndex: 1, toIndex: 0, afterId: null, beforeId: 0 });
  });

  it("returns null for an out-of-range fromIndex (stale drop)", () => {
    expect(listMoveFor(["ada"], 3, 0)).toBeNull();
    expect(listMoveFor(["ada"], -1, 0)).toBeNull();
  });
});

// ---- backward compatibility ------------------------------------------------

describe("StackedList without the new props", () => {
  it("renders no drag grips and no drop zone", () => {
    const { container, getByText } = ui(<StackedList items={people} />);
    expect(getByText("Ada Lovelace")).toBeTruthy();
    expect(grips(container).length).toBe(0);
  });

  it("keeps the clickable row a single whole-row pressable", () => {
    const { container } = ui(<StackedList clickable items={people} />);
    // Three rows, each one button, none nested.
    const buttons = [...container.querySelectorAll('[role="button"]')];
    expect(buttons.length).toBe(3);
  });
});

// ---- the trailing slot -----------------------------------------------------

describe("StackedList per-item trailing slot", () => {
  it("renders the slot content", () => {
    const withTrailing: StackedListItem[] = [
      { ...people[0]!, trailing: <Text>Owner</Text> },
      people[1]!,
    ];
    const { getByText } = ui(<StackedList items={withTrailing} />);
    expect(getByText("Owner")).toBeTruthy();
  });

  it("moves a clickable row's press target to the content region so controls never nest", () => {
    let pressed: number | null = null;
    const withTrailing: StackedListItem[] = [
      { ...people[0]!, trailing: <Text>Owner</Text> },
      people[1]!,
    ];
    const { container } = ui(<StackedList clickable items={withTrailing} onPressItem={(index) => { pressed = index; }} />);
    const buttons = [...container.querySelectorAll("button")];
    expect(buttons.some((b) => b.parentElement?.closest("button") != null)).toBe(false);
    const row = container.querySelector('[aria-label="Ada Lovelace"]') as HTMLElement;
    expect(row).not.toBeNull();
    fireEvent.click(row);
    expect(pressed).toBe(0);
  });
});

// ---- reorderable -----------------------------------------------------------

describe("StackedList reorderable", () => {
  it("gives every row a focusable, labeled leading grip", () => {
    const { container } = ui(<StackedList reorderable items={people} />);
    const g = grips(container);
    expect(g.length).toBe(3);
    expect(g[0]!.getAttribute("aria-label")).toBe("Reorder Ada Lovelace");
    expect(g[0]!.getAttribute("role")).toBe("button");
    expect(g[0]!.getAttribute("tabindex")).not.toBe("-1");
  });

  it("reorders by keyboard and reports the move without reordering internally", async () => {
    let move: StackedListMove | null = null;
    const { container, getByText } = ui(<StackedList reorderable items={people} onReorder={(m) => { move = m; }} />);
    const grip = grips(container)[0]!;

    fireEvent.keyDown(grip, { key: " " });
    await flush();
    expect(grip.getAttribute("aria-pressed")).toBe("true");

    // A single zone: ArrowDown walks the insertion index; Space drops.
    act(() => { fireEvent.keyDown(grip, { key: "ArrowDown" }); });
    act(() => { fireEvent.keyDown(grip, { key: " " }); });

    expect(move).toEqual({ id: "ada", fromIndex: 0, toIndex: 1, afterId: "alan", beforeId: "grace" });
    // Controlled: the DOM order still follows the consumer's items array.
    expect(getByText("Ada Lovelace")).toBeTruthy();
  });

  it("Escape cancels without firing onReorder", async () => {
    let move: StackedListMove | null = null;
    const { container } = ui(<StackedList reorderable items={people} onReorder={(m) => { move = m; }} />);
    const grip = grips(container)[0]!;
    fireEvent.keyDown(grip, { key: " " });
    await flush();
    act(() => { fireEvent.keyDown(grip, { key: "Escape" }); });
    expect(move).toBeNull();
  });

  it("keeps clickable rows pressable beside the grip with no nested buttons", () => {
    let pressed: number | null = null;
    const { container } = ui(<StackedList reorderable clickable items={people} onPressItem={(index) => { pressed = index; }} />);
    const buttons = [...container.querySelectorAll("button")];
    expect(buttons.some((b) => b.parentElement?.closest("button") != null)).toBe(false);
    fireEvent.click(container.querySelector('[aria-label="Alan Turing"]') as HTMLElement);
    expect(pressed).toBe(1);
  });

  it("reports index-fallback ids for rows without an id", () => {
    let move: StackedListMove | null = null;
    const anonymous = people.map(({ id: _id, ...rest }) => rest);
    const { container } = ui(<StackedList reorderable items={anonymous} onReorder={(m) => { move = m; }} />);
    const grip = grips(container)[0]!;
    fireEvent.keyDown(grip, { key: " " });
    return flush().then(() => {
      act(() => { fireEvent.keyDown(grip, { key: "ArrowDown" }); });
      act(() => { fireEvent.keyDown(grip, { key: " " }); });
      expect(move).toEqual({ id: 0, fromIndex: 0, toIndex: 1, afterId: 1, beforeId: 2 });
    });
  });
});
