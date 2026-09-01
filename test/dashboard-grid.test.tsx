import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup, act, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { AccessibilityInfo, Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
// Web build (the alias serves <name>.tsx); per-OS skins are covered by skins-smoke.
import {
  DashboardGrid,
  clearStoredDashboardOrder,
  type DashboardWidget,
} from "../src/organisms/dashboard-grid/dashboard-grid.tsx";
import { dashboardCellWidth } from "../src/organisms/dashboard-grid/dashboard-grid.shared.tsx";

afterEach(cleanup);

// measureInWindow resolves on a macrotask (react-native-web wraps getBoundingClientRect in
// setTimeout(0)); the drag layer's measureAll chains several, so flush a handful of ticks.
async function flush(n = 6) {
  for (let i = 0; i < n; i++) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}

// happy-dom has no ResizeObserver, so RNW's onLayout never fires on its own; fire the handler
// RNW attaches to the host node (the progress.test.tsx idiom). The grid row is the only
// layout-handling node in this tree, so the first one in document order is it.
type LayoutHost = { __reactLayoutHandler?: (e: unknown) => void };
/** The grid's own wrapping row: the only layout-handling node in the tree. */
function gridRow(container: HTMLElement): HTMLElement {
  for (const el of Array.from(container.querySelectorAll("div"))) {
    if (typeof (el as unknown as LayoutHost).__reactLayoutHandler === "function") return el as HTMLElement;
  }
  throw new Error("no layout-handling node in the grid (RNW layout hook absent)");
}
function fireGridLayout(container: HTMLElement, width: number) {
  for (const el of Array.from(container.querySelectorAll("div"))) {
    const handler = (el as unknown as LayoutHost).__reactLayoutHandler;
    if (typeof handler === "function") {
      act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width, height: 400, left: 0, top: 0 } }, timeStamp: 1 }));
      return;
    }
  }
  throw new Error("no layout-handling node in the grid (RNW layout hook absent)");
}

const items: DashboardWidget[] = [
  { id: "a", span: 6, title: "Revenue", content: <Text testID="body-a">Revenue body</Text> },
  { id: "b", span: 6, title: "Signups", content: <Text testID="body-b">Signups body</Text> },
  { id: "c", span: 4, title: "Latency", content: <Text testID="body-c">Latency body</Text> },
];

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const byLabel = (c: HTMLElement, label: string) => c.querySelector(`[aria-label="${label}"]`) as HTMLElement;
/** The widget bodies in document order, by their testIDs. */
const bodyOrder = (c: HTMLElement) =>
  Array.from(c.querySelectorAll("[data-testid^='body-']")).map((el) => el.getAttribute("data-testid"));
/** The px width RNW wrote onto the cell that holds this widget body. */
const cellWidthOf = (c: HTMLElement, id: string) => {
  const cell = (c.querySelector(`[data-testid='body-${id}']`) as HTMLElement).parentElement as HTMLElement;
  return Math.round(parseFloat(cell.style.width));
};

/** Grab widget `label`'s grip, keyboard-drag it with `keys`, and drop it. */
async function keyboardDrag(container: HTMLElement, label: string, keys: string[]) {
  const grip = byLabel(container, `Reorder ${label}`);
  fireEvent.keyDown(grip, { key: " " });
  await flush();
  for (const key of keys) act(() => { fireEvent.keyDown(grip, { key }); });
  act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });
}

// happy-dom lays nothing out, so every getBoundingClientRect reports 0x0 and the drag layer
// measures a board with no geometry at all. Give the CELLS a rect derived from their LIVE
// position in the grid row, which is what a real stacked layout reports: the widget rendered
// first sits at the top. Read on every measure, so a board that has already been reordered
// measures its NEW arrangement, exactly as the browser would.
const CELL_HEIGHT = 100;
const CELL_WIDTH = 600;
function stubCellLayout(container: HTMLElement) {
  const row = (container.querySelector("[data-testid='grid']") as HTMLElement).firstElementChild!;
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const index = this.parentElement === row ? Array.from(row.children).indexOf(this) : -1;
    if (index < 0) return original.call(this);
    const top = index * CELL_HEIGHT;
    return {
      x: 0, y: top, left: 0, top, right: CELL_WIDTH, bottom: top + CELL_HEIGHT,
      width: CELL_WIDTH, height: CELL_HEIGHT, toJSON: () => ({}),
    } as DOMRect;
  };
  return () => { Element.prototype.getBoundingClientRect = original; };
}

describe("DashboardGrid collection prop", () => {
  /** Run `body` with console.warn captured, and hand back every message it produced. */
  function withWarnings(body: () => void): string[] {
    resetDevWarnings();
    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
    try {
      body();
      return warnSpy.mock.calls.map((c) => String(c[0]));
    } finally {
      warnSpy.mockRestore();
    }
  }

  it("lays the board out from the canonical `items`, silently", () => {
    const messages = withWarnings(() => {
      const { container } = ui(<DashboardGrid items={items} />);
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
    });
    expect(messages.some((m) => m.includes("<DashboardGrid />") && m.includes("`widgets`"))).toBe(false);
  });

  it("still lays the board out from the deprecated `widgets` alias, warning once toward `items`", () => {
    const messages = withWarnings(() => {
      const { container } = ui(<DashboardGrid widgets={items} order={["c", "a"]} />);
      // The alias feeds the same path: reconciliation, ordering, and appending all still run.
      expect(bodyOrder(container)).toEqual(["body-c", "body-a", "body-b"]);
    });
    const deprecation = messages.filter((m) => m.includes("<DashboardGrid />") && m.includes("deprecated"));
    expect(deprecation.length).toBe(1);
    expect(deprecation[0]).toContain("pass `items` instead");
  });

  it("lets `items` win when both are passed, and says so", () => {
    const legacy: DashboardWidget[] = [{ id: "z", span: 12, title: "Legacy", content: <Text testID="body-z">Legacy body</Text> }];
    const messages = withWarnings(() => {
      const { container } = ui(<DashboardGrid items={items} widgets={legacy} />);
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
    });
    expect(messages.some((m) => m.includes("<DashboardGrid />") && m.includes("`widgets` is ignored"))).toBe(true);
  });

  it("renders an empty board when neither is passed", () => {
    const { container } = ui(<DashboardGrid testID="grid" />);
    expect(bodyOrder(container)).toEqual([]);
    expect(container.querySelector("[data-testid='grid']")).toBeTruthy();
  });
});

describe("DashboardGrid layout", () => {
  it("renders every widget's content, and no title chrome (the title names the cell for a11y)", () => {
    const { getByText, queryByText } = ui(<DashboardGrid items={items} />);
    expect(getByText("Revenue body")).toBeTruthy();
    expect(getByText("Latency body")).toBeTruthy();
    expect(queryByText("Revenue")).toBeNull();
  });

  it("sizes each cell from its span once the grid has measured its own width", () => {
    const { container } = ui(<DashboardGrid items={items} />);
    fireGridLayout(container, 1200);
    // 12 columns and 11 x 16 gaps in 1200px: a 6-span cell is 592, and two of them plus the
    // gap between them fill the row exactly.
    expect(cellWidthOf(container, "a")).toBe(592);
    expect(cellWidthOf(container, "b")).toBe(592);
    expect(cellWidthOf(container, "c")).toBe(dashboardCellWidth(1200, 4, 16));
  });

  it("reflows to the narrow tier at or below the lg breakpoint, and stacks on a phone", () => {
    const narrow = ui(<DashboardGrid items={items} />);
    fireGridLayout(narrow.container, 800);
    // narrow: a 6-span widget declares no narrowSpan, and a span of 5 or more is a primary
    // tile, so it takes the full 12 columns; the 4-span pairs up at half the board.
    expect(cellWidthOf(narrow.container, "a")).toBe(800);
    expect(cellWidthOf(narrow.container, "c")).toBe(dashboardCellWidth(800, 6, 16));
    cleanup();

    const phone = ui(<DashboardGrid items={items} />);
    fireGridLayout(phone.container, 375);
    // phone: every widget is full width, whatever it declared.
    expect(cellWidthOf(phone.container, "a")).toBe(375);
    expect(cellWidthOf(phone.container, "c")).toBe(375);
  });

  it("honors an explicit narrowSpan on the narrow tier", () => {
    const wide: DashboardWidget[] = [
      { id: "a", span: 8, narrowSpan: 6, title: "Revenue", content: <Text testID="body-a">Revenue body</Text> },
    ];
    const { container } = ui(<DashboardGrid items={wide} />);
    fireGridLayout(container, 800);
    expect(cellWidthOf(container, "a")).toBe(dashboardCellWidth(800, 6, 16));
  });

  it("tightens the gap on the density axis", () => {
    const { container } = ui(<DashboardGrid compact items={items} />);
    fireGridLayout(container, 1200);
    expect(cellWidthOf(container, "a")).toBe(dashboardCellWidth(1200, 6, 8));
  });

  it("orders the cells by the id order, appending items the order does not mention", () => {
    const { container } = ui(<DashboardGrid items={items} order={["c", "a"]} />);
    expect(bodyOrder(container)).toEqual(["body-c", "body-a", "body-b"]);
  });

  // The cross-axis contract. Cells used to hug their own content, so a row holding one
  // short widget beside a tall one showed page background under the short one. Stretching
  // the cell gives a widget that wants the tile's full height something to grow into; the
  // widget still sizes itself, so a board of hugging widgets is unchanged.
  it("stretches every cell to the height of the row it wrapped onto", () => {
    const { container } = ui(<DashboardGrid items={items} />);
    expect(gridRow(container).style.alignItems).toBe("stretch");
  });
});

describe("DashboardGrid locked mode", () => {
  it("renders no grips and mounts no drag provider", () => {
    const { container } = ui(<DashboardGrid testID="grid" items={items} />);
    expect(container.querySelectorAll("[aria-label^='Reorder ']").length).toBe(0);
    // The provider always renders its ghost outlet beside the content, so a root holding only
    // the grid row is proof the provider is not mounted.
    const root = container.querySelector("[data-testid='grid']") as HTMLElement;
    expect(root.children.length).toBe(1);
  });

  it("mounts the provider and a grip per widget once unlocked", () => {
    const { container } = ui(<DashboardGrid unlocked testID="grid" items={items} />);
    expect(container.querySelectorAll("[aria-label^='Reorder ']").length).toBe(3);
    const grip = byLabel(container, "Reorder Revenue");
    expect(grip.getAttribute("role")).toBe("button");
    expect(grip.getAttribute("tabindex")).not.toBe("-1");
    const root = container.querySelector("[data-testid='grid']") as HTMLElement;
    expect(root.children.length).toBe(2); // the grid row + the drag ghost outlet
  });

  // Locked, the cell itself is what stretches. Unlocked, the drag wrapper and the dashed
  // edit ring stand between the cell and the widget, so both have to pass the height on or
  // a tile that fills its cell would shrink back the moment customize mode is entered.
  it("carries the stretched cell's height through the customize chrome", () => {
    const { container } = ui(<DashboardGrid unlocked items={items} />);
    const body = container.querySelector("[data-testid='body-a']") as HTMLElement;
    const editRing = body.parentElement as HTMLElement;
    const draggable = editRing.parentElement as HTMLElement;
    expect(editRing.style.flexGrow).toBe("1");
    expect(draggable.style.flexGrow).toBe("1");
  });

  it("never nests a grip inside another interactive element", () => {
    const interactive: DashboardWidget[] = [
      { id: "a", span: 6, title: "Revenue", content: <Text testID="body-a">Revenue body</Text> },
    ];
    const { container } = ui(<DashboardGrid unlocked items={interactive} />);
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.some((b) => b.parentElement?.closest("button") != null)).toBe(false);
  });
});

describe("DashboardGrid controlled order", () => {
  it("reports the full next order on a drop and leaves the rendered order to the consumer", async () => {
    let next: string[] | null = null;
    const { container } = ui(
      <DashboardGrid unlocked items={items} order={["a", "b", "c"]} onOrderChange={(o) => { next = o; }} />,
    );
    // ArrowRight walks to the next widget's zone, ArrowDown moves past its midpoint, so the
    // drop lands AFTER Signups.
    await keyboardDrag(container, "Revenue", ["ArrowRight", "ArrowDown"]);
    expect(next).toEqual(["b", "a", "c"]);
    // Controlled: the kit never reorders itself, so the DOM still follows the `order` prop.
    expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
  });

  it("reports a complete order even when the controlled one predates a widget", async () => {
    let next: string[] | null = null;
    const { container } = ui(
      <DashboardGrid unlocked items={items} order={["a", "b"]} onOrderChange={(o) => { next = o; }} />,
    );
    // "c" is appended by the reconciliation; moving it must still produce a full order.
    await keyboardDrag(container, "Latency", ["ArrowLeft", "ArrowLeft"]);
    expect(next).toEqual(["c", "a", "b"]);
  });

  it("stays silent when a drop leaves the order unchanged", async () => {
    let calls = 0;
    const { container } = ui(
      <DashboardGrid unlocked items={items} order={["a", "b", "c"]} onOrderChange={() => { calls += 1; }} />,
    );
    // Dropping Revenue BEFORE Signups is where it already sits.
    await keyboardDrag(container, "Revenue", ["ArrowRight"]);
    expect(calls).toBe(0);
  });

  it("Escape cancels a keyboard drag without reporting an order", async () => {
    let calls = 0;
    const { container } = ui(
      <DashboardGrid unlocked items={items} order={["a", "b", "c"]} onOrderChange={() => { calls += 1; }} />,
    );
    const grip = byLabel(container, "Reorder Revenue");
    fireEvent.keyDown(grip, { key: " " });
    await flush();
    expect(grip.getAttribute("aria-pressed")).toBe("true");
    act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
    act(() => { fireEvent.keyDown(grip, { key: "Escape" }); });
    expect(calls).toBe(0);
    expect(grip.getAttribute("aria-pressed")).toBeNull();
  });
});

describe("DashboardGrid uncontrolled order", () => {
  it("seeds from the items array and applies each drop itself", async () => {
    let next: string[] | null = null;
    const { container } = ui(<DashboardGrid unlocked items={items} onOrderChange={(o) => { next = o; }} />);
    expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
    await keyboardDrag(container, "Revenue", ["ArrowRight", "ArrowDown"]);
    expect(next).toEqual(["b", "a", "c"]);
    // Uncontrolled: the grid owns the order, so the cells really move.
    expect(bodyOrder(container)).toEqual(["body-b", "body-a", "body-c"]);
  });

  it("seeds from defaultOrder", () => {
    const { container } = ui(<DashboardGrid items={items} defaultOrder={["c", "b", "a"]} />);
    expect(bodyOrder(container)).toEqual(["body-c", "body-b", "body-a"]);
  });
});

describe("DashboardGrid keyboard reorder tracks the rendered order", () => {
  it("moves the second reorder by what is on screen, not by mount order", async () => {
    let latest: string[] | null = null;
    const { container } = ui(
      <DashboardGrid unlocked testID="grid" items={items} onOrderChange={(o) => { latest = o; }} />,
    );
    const restore = stubCellLayout(container);
    try {
      // First reorder: Revenue past Signups. Mount order and rendered order still agree here.
      await keyboardDrag(container, "Revenue", ["ArrowRight", "ArrowDown"]);
      expect(bodyOrder(container)).toEqual(["body-b", "body-a", "body-c"]);
      expect(latest).toEqual(["b", "a", "c"]);

      // Second reorder, the regression: Signups now renders FIRST, and the widget after it on
      // screen is Revenue. One step forward and past its midpoint must swap the two back. A
      // cursor that walked the mount order would step to Latency instead and land ["a","c","b"].
      await keyboardDrag(container, "Signups", ["ArrowRight", "ArrowDown"]);
      expect(latest).toEqual(["a", "b", "c"]);
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
    } finally {
      restore();
    }
  });

  it("announces the widget the cursor is really over, and what the drop did", async () => {
    const announced: string[] = [];
    const spy = spyOn(AccessibilityInfo, "announceForAccessibility").mockImplementation((text: string) => {
      announced.push(text);
    });
    const { container } = ui(<DashboardGrid unlocked testID="grid" items={items} />);
    const restore = stubCellLayout(container);
    try {
      await keyboardDrag(container, "Revenue", ["ArrowRight", "ArrowDown"]);
      expect(bodyOrder(container)).toEqual(["body-b", "body-a", "body-c"]);

      // Second grab, on the widget that now renders first.
      announced.length = 0;
      const grip = byLabel(container, "Reorder Signups");
      fireEvent.keyDown(grip, { key: " " });
      await flush();
      expect(announced[0]).toContain("Picked up Signups");
      expect(announced.at(-1)).toBe("Signups, position 1 of 1.");

      // One step forward lands on Revenue, the widget beside it on screen, not on Latency.
      act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
      expect(announced.at(-1)).toBe("Revenue, position 1 of 2.");
      act(() => { fireEvent.keyDown(grip, { key: "ArrowDown" }); });
      expect(announced.at(-1)).toBe("Revenue, position 2 of 2.");
      act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });
      expect(announced.at(-1)).toBe("Moved Signups to Revenue, position 2.");
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
    } finally {
      restore();
      spy.mockRestore();
    }
  });

  it("walks back the way it came, and Escape leaves the board untouched", async () => {
    let latest: string[] | null = null;
    const { container } = ui(
      <DashboardGrid unlocked testID="grid" items={items} onOrderChange={(o) => { latest = o; }} />,
    );
    const restore = stubCellLayout(container);
    try {
      // Revenue to the end of the board: forward past Signups, then past Latency.
      await keyboardDrag(container, "Revenue", ["ArrowRight", "ArrowRight", "ArrowDown"]);
      expect(bodyOrder(container)).toEqual(["body-b", "body-c", "body-a"]);

      // And back to the front: Revenue is last on screen, so two steps back reach Signups, and
      // ArrowUp puts the cursor before it.
      await keyboardDrag(container, "Revenue", ["ArrowLeft", "ArrowLeft", "ArrowUp"]);
      expect(latest).toEqual(["a", "b", "c"]);
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);

      // Escape after moving the cursor around changes nothing at all.
      const grip = byLabel(container, "Reorder Revenue");
      fireEvent.keyDown(grip, { key: " " });
      await flush();
      act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
      act(() => { fireEvent.keyDown(grip, { key: "ArrowDown" }); });
      act(() => { fireEvent.keyDown(grip, { key: "Escape" }); });
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
      expect(latest).toEqual(["a", "b", "c"]);
    } finally {
      restore();
    }
  });
});

describe("DashboardGrid storageKey", () => {
  const KEY = "test-overview";
  beforeEach(() => clearStoredDashboardOrder(KEY));
  afterEach(() => clearStoredDashboardOrder(KEY));

  it("seeds the uncontrolled order from storage and writes each drop back", async () => {
    localStorage.setItem(`canvas-dashboard-order:${KEY}`, JSON.stringify(["c", "b", "a"]));
    const { container } = ui(<DashboardGrid unlocked items={items} storageKey={KEY} />);
    expect(bodyOrder(container)).toEqual(["body-c", "body-b", "body-a"]);
    // Move Latency (first) past Signups (second).
    await keyboardDrag(container, "Latency", ["ArrowRight", "ArrowDown"]);
    expect(bodyOrder(container)).toEqual(["body-b", "body-c", "body-a"]);
    expect(JSON.parse(localStorage.getItem(`canvas-dashboard-order:${KEY}`)!)).toEqual(["b", "c", "a"]);
  });

  it("falls back to the items order when the stored value is unusable, and clears on demand", () => {
    localStorage.setItem(`canvas-dashboard-order:${KEY}`, "{ not an order }");
    const bad = ui(<DashboardGrid items={items} storageKey={KEY} />);
    expect(bodyOrder(bad.container)).toEqual(["body-a", "body-b", "body-c"]);
    cleanup();

    localStorage.setItem(`canvas-dashboard-order:${KEY}`, JSON.stringify(["c", "b", "a"]));
    clearStoredDashboardOrder(KEY);
    expect(localStorage.getItem(`canvas-dashboard-order:${KEY}`)).toBeNull();
    const cleared = ui(<DashboardGrid items={items} storageKey={KEY} defaultOrder={["b", "a", "c"]} />);
    expect(bodyOrder(cleared.container)).toEqual(["body-b", "body-a", "body-c"]);
  });

  it("warns and ignores storageKey when the order is controlled", () => {
    resetDevWarnings();
    const warnSpy = spyOn(console, "warn").mockImplementation(() => {});
    try {
      localStorage.setItem(`canvas-dashboard-order:${KEY}`, JSON.stringify(["c", "b", "a"]));
      const { container } = ui(<DashboardGrid items={items} order={["a", "b", "c"]} storageKey={KEY} />);
      // The controlled order wins; the stored one is not read.
      expect(bodyOrder(container)).toEqual(["body-a", "body-b", "body-c"]);
      const messages = warnSpy.mock.calls.map((c) => String(c[0]));
      expect(messages.some((m) => m.includes("<DashboardGrid />") && m.includes("`storageKey` is ignored"))).toBe(true);
    } finally {
      warnSpy.mockRestore();
    }
  });
});
