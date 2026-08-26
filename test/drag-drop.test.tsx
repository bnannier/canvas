import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { AccessibilityInfo, I18nManager, Text, View } from "react-native";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
// Web build (the alias serves <name>.tsx). All four members come from one factory call.
import { DragDropProvider, DropZone, Draggable, DragHandle, type DropEvent } from "../src/organisms/drag-drop/drag-drop.tsx";

afterEach(cleanup);

// measureInWindow resolves on a macrotask (react-native-web wraps getBoundingClientRect in
// setTimeout(0)); measureAll chains several, so flush a handful of ticks inside act.
async function flush(n = 6) {
  for (let i = 0; i < n; i++) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}

// A minimal two-column board: z1 holds a + b, z2 holds c. Each card carries a labeled grip.
function Board({ onDrop }: { onDrop: (e: DropEvent) => void }) {
  const card = (id: string, text: string): ReactNode => (
    <Draggable id={id} data={{ id }} label={text}>
      <DragHandle label={`Reorder ${text}`} />
      <Text>{text}</Text>
    </Draggable>
  );
  return (
    <DragDropProvider>
      <DropZone id="z1" label="To do" onDrop={onDrop}>
        {card("a", "Task A")}
        {card("b", "Task B")}
      </DropZone>
      <DropZone id="z2" label="Doing" onDrop={onDrop}>
        {card("c", "Task C")}
      </DropZone>
    </DragDropProvider>
  );
}

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const handle = (c: HTMLElement, label: string) => c.querySelector(`[aria-label="${label}"]`) as HTMLElement;

// Run `body` with the layout direction forced right-to-left. The stub goes through the SAME
// accessor the kit reads (isRTL() -> I18nManager.getConstants().isRTL): react-native-web has no
// direct `I18nManager.isRTL` property, so stubbing that would be a no-op here (src/style/rtl.ts).
const withRTL = async (body: () => Promise<void>) => {
  const origGetConstants = I18nManager.getConstants;
  I18nManager.getConstants = () => ({ ...origGetConstants.call(I18nManager), isRTL: true });
  try {
    await body();
  } finally {
    I18nManager.getConstants = origGetConstants;
  }
};

describe("DragDrop handle accessibility", () => {
  it("renders each grip as a focusable button with an accessible name", () => {
    const { container } = ui(<Board onDrop={() => {}} />);
    const grip = handle(container, "Reorder Task A");
    expect(grip).not.toBeNull();
    // RNW maps accessibilityRole="button" to a native <button> (a keyboard tab stop by
    // default, so no explicit tabindex is needed and it is NOT taken out of the tab order).
    expect(grip.tagName.toLowerCase()).toBe("button");
    expect(grip.getAttribute("role")).toBe("button");
    expect(grip.getAttribute("tabindex")).not.toBe("-1");
    expect(grip.getAttribute("aria-disabled")).toBeNull();
  });

  it("marks a disabled draggable's grip aria-disabled and out of the tab order", () => {
    const { container } = ui(
      <DragDropProvider>
        <DropZone id="z" label="Zone">
          <Draggable id="x" data={{}} disabled label="Locked">
            <DragHandle label="Reorder Locked" />
            <Text>Locked</Text>
          </Draggable>
        </DropZone>
      </DragDropProvider>,
    );
    const grip = handle(container, "Reorder Locked");
    expect(grip.getAttribute("aria-disabled")).toBe("true");
    expect(grip.getAttribute("tabindex")).toBe("-1");
  });
});

describe("DragDrop keyboard drag flow", () => {
  it("grabs, moves to the next zone, and drops (firing the target zone onDrop)", async () => {
    let dropped: DropEvent | null = null;
    const { container } = ui(<Board onDrop={(e) => { dropped = e; }} />);
    const grip = handle(container, "Reorder Task A");

    // Space grabs: the grip announces grabbed via aria-pressed once the async measure settles.
    fireEvent.keyDown(grip, { key: " " });
    await flush();
    expect(grip.getAttribute("aria-pressed")).toBe("true");

    // ArrowRight moves to the next zone (z1 -> z2); Enter drops there.
    act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
    act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });

    expect(dropped).not.toBeNull();
    expect(dropped!.id).toBe("a");
    expect(dropped!.from).toBe("z1");
    expect(dropped!.to).toBe("z2");
    // Dropping is done: the grip is no longer grabbed.
    expect(grip.getAttribute("aria-pressed")).toBeNull();
  });

  it("Escape cancels the keyboard drag without firing onDrop", async () => {
    let dropped: DropEvent | null = null;
    const { container } = ui(<Board onDrop={(e) => { dropped = e; }} />);
    const grip = handle(container, "Reorder Task A");

    fireEvent.keyDown(grip, { key: " " });
    await flush();
    expect(grip.getAttribute("aria-pressed")).toBe("true");

    act(() => { fireEvent.keyDown(grip, { key: "Escape" }); });
    expect(dropped).toBeNull();
    expect(grip.getAttribute("aria-pressed")).toBeNull();
  });
});

// A single HORIZONTAL zone holding three cards side by side. happy-dom lays nothing out, so
// every getBoundingClientRect reports 0x0 and the drag layer measures a row with no geometry;
// give each node the rect a real row would report. The cards differ in height and are centered
// on the cross axis, which is an ordinary row: their tops therefore DISAGREE with their
// left-to-right order, so a starting index taken off the vertical axis is visibly wrong.
const ROW_RECTS: Record<string, { x: number; y: number; width: number; height: number }> = {
  row: { x: 0, y: 0, width: 600, height: 120 },
  "card-a": { x: 0, y: 30, width: 160, height: 60 },
  "card-b": { x: 200, y: 10, width: 160, height: 100 },
  "card-c": { x: 400, y: 20, width: 160, height: 80 },
};

function stubRowLayout() {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const r = ROW_RECTS[this.getAttribute("data-testid") ?? ""];
    if (!r) return original.call(this);
    return {
      x: r.x, y: r.y, left: r.x, top: r.y, right: r.x + r.width, bottom: r.y + r.height,
      width: r.width, height: r.height, toJSON: () => ({}),
    } as DOMRect;
  };
  return () => { Element.prototype.getBoundingClientRect = original; };
}

function Row({ onDrop }: { onDrop: (e: DropEvent) => void }) {
  const card = (id: string, text: string): ReactNode => (
    <Draggable id={id} data={{ id }} label={text} testID={`card-${id}`}>
      <DragHandle label={`Reorder ${text}`} />
      <Text>{text}</Text>
    </Draggable>
  );
  return (
    <DragDropProvider>
      <DropZone id="row" label="Row" horizontal onDrop={onDrop} testID="row">
        {card("a", "Task A")}
        {card("b", "Task B")}
        {card("c", "Task C")}
      </DropZone>
    </DragDropProvider>
  );
}

describe("DragDrop keyboard drag in a horizontal zone", () => {
  it("starts the cursor at the card's LEFT-TO-RIGHT position, not its vertical one", async () => {
    const announced: string[] = [];
    const spy = spyOn(AccessibilityInfo, "announceForAccessibility").mockImplementation((text: string) => {
      announced.push(text);
    });
    const restore = stubRowLayout();
    try {
      const { container } = ui(<Row onDrop={() => {}} />);
      const grip = handle(container, "Reorder Task B");

      fireEvent.keyDown(grip, { key: " " });
      await flush();

      expect(announced[0]).toContain("Picked up Task B");
      // Task B is the MIDDLE card of the row, so the cursor opens on position 2 of 3. Sorting
      // this zone down the Y axis would rank it first (its tall card has the highest top edge).
      expect(announced.at(-1)).toBe("Row, position 2 of 3.");
    } finally {
      restore();
      spy.mockRestore();
    }
  });

  it("drops at the index the row reads, and the arrow keys walk on from there", async () => {
    const restore = stubRowLayout();
    try {
      let dropped: DropEvent | null = null;
      const { container } = ui(<Row onDrop={(e) => { dropped = e; }} />);
      const grip = handle(container, "Reorder Task B");

      // Grab and drop with no move: the middle card goes back where it came from, index 1.
      fireEvent.keyDown(grip, { key: " " });
      await flush();
      act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });
      expect(dropped).not.toBeNull();
      expect(dropped!.index).toBe(1);

      // One zone only, so ArrowRight steps the index: from 1 to 2, past Task C to the end.
      dropped = null;
      fireEvent.keyDown(grip, { key: " " });
      await flush();
      act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
      act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });
      expect(dropped!.index).toBe(2);
    } finally {
      restore();
    }
  });
});

describe("DragDrop keyboard drag in a horizontal zone, right to left", () => {
  // The same measured row as above. `flexDirection: "row"` mirrors under RTL, so the row that
  // paints left to right here reads RIGHT to left: Task C (x=400) is data index 0 and Task A
  // (x=0) is the last. Every assertion below is the LTR answer counted from the other end.
  it("opens the cursor at the card's position counted from the RIGHT", async () => {
    const announced: string[] = [];
    const spy = spyOn(AccessibilityInfo, "announceForAccessibility").mockImplementation((text: string) => {
      announced.push(text);
    });
    const restore = stubRowLayout();
    try {
      await withRTL(async () => {
        const { container } = ui(<Row onDrop={() => {}} />);
        fireEvent.keyDown(handle(container, "Reorder Task A"), { key: " " });
        await flush();
        // Task A is the LEFTMOST card, which in a right-to-left row is the LAST position. The
        // LTR reading of the identical rects announces "position 1 of 3".
        expect(announced.at(-1)).toBe("Row, position 3 of 3.");
      });
    } finally {
      restore();
      spy.mockRestore();
    }
  });

  it("drops at the mirrored index, and the horizontal arrows walk the row the way it reads", async () => {
    const restore = stubRowLayout();
    try {
      await withRTL(async () => {
        let dropped: DropEvent | null = null;
        const { container } = ui(<Row onDrop={(e) => { dropped = e; }} />);
        const gripA = handle(container, "Reorder Task A");

        // Grab and drop with no move: the LEFTMOST card belongs at the row's LAST position. With
        // Task A lifted out two cards remain, so index 2 is the far end. LTR would say 0.
        fireEvent.keyDown(gripA, { key: " " });
        await flush();
        act(() => { fireEvent.keyDown(gripA, { key: "Enter" }); });
        expect(dropped).not.toBeNull();
        expect(dropped!.index).toBe(2);

        // One zone only, so the horizontal arrows step the index, and the two are swapped:
        // ArrowRight moves BACK toward the start of the row (2 -> 1).
        dropped = null;
        fireEvent.keyDown(gripA, { key: " " });
        await flush();
        act(() => { fireEvent.keyDown(gripA, { key: "ArrowRight" }); });
        act(() => { fireEvent.keyDown(gripA, { key: "Enter" }); });
        expect(dropped!.index).toBe(1);

        // ...and ArrowLeft moves FORWARD. Task C is the rightmost card, so it opens at index 0
        // (LTR would open it at 2) and one ArrowLeft advances it to 1.
        dropped = null;
        const gripC = handle(container, "Reorder Task C");
        fireEvent.keyDown(gripC, { key: " " });
        await flush();
        act(() => { fireEvent.keyDown(gripC, { key: "ArrowLeft" }); });
        act(() => { fireEvent.keyDown(gripC, { key: "Enter" }); });
        expect(dropped!.index).toBe(1);
      });
    } finally {
      restore();
    }
  });
});

describe("DragDrop insertion indicator anchoring", () => {
  // The line is the only absolutely-positioned 2px-wide box a horizontal zone paints while a
  // drag hovers it.
  const line = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("div")).find((n) => {
      const style = n.getAttribute("style") ?? "";
      return style.includes("position: absolute") && style.includes("width: 2px");
    });

  const lane = (
    <DragDropProvider>
      <DropZone id="row" label="Lane" horizontal>
        <Draggable id="a" data={{}} label="Task A">
          <DragHandle label="Reorder Task A" />
          <Text>Task A</Text>
        </Draggable>
        <Draggable id="b" data={{}} label="Task B">
          <DragHandle label="Reorder Task B" />
          <Text>Task B</Text>
        </Draggable>
      </DropZone>
    </DragDropProvider>
  );

  // insertionOffset measures from the zone's LEADING edge, so the line rides on the LOGICAL
  // `insetInlineStart`. These two cases pin down that it really is logical: the same component,
  // the same offset, resolving to opposite physical edges purely from the writing direction. A
  // physical `left` would emit `left:` in both and pin the line to the wrong edge of a mirrored
  // row. (React Native resolves the same property to the start edge natively.)
  it("anchors the line to the LEFT edge in a left-to-right document", async () => {
    const { container } = ui(lane);
    fireEvent.keyDown(handle(container, "Reorder Task A"), { key: " " });
    await flush();
    const style = line(container)?.getAttribute("style") ?? "";
    expect(style).toContain("left:");
    expect(style).not.toContain("right:");
  });

  it("anchors the line to the RIGHT edge under a dir=\"rtl\" ancestor", async () => {
    const { container } = ui(<View dir="rtl">{lane}</View>);
    fireEvent.keyDown(handle(container, "Reorder Task A"), { key: " " });
    await flush();
    const style = line(container)?.getAttribute("style") ?? "";
    expect(style).toContain("right:");
    expect(style).not.toContain("left:");
  });
});

describe("DragDrop RTL keyboard direction", () => {
  it("moves to the NEXT zone on ArrowLeft in a right-to-left locale", async () => {
    await withRTL(async () => {
      let dropped: DropEvent | null = null;
      const { container } = ui(<Board onDrop={(e) => { dropped = e; }} />);
      const grip = handle(container, "Reorder Task A");

      fireEvent.keyDown(grip, { key: " " });
      await flush();
      expect(grip.getAttribute("aria-pressed")).toBe("true");

      // Per the WAI-ARIA convention, Left Arrow advances in RTL: z1 -> z2.
      act(() => { fireEvent.keyDown(grip, { key: "ArrowLeft" }); });
      act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });

      expect(dropped).not.toBeNull();
      expect(dropped!.from).toBe("z1");
      expect(dropped!.to).toBe("z2");
    });
  });

  it("moves to the PREVIOUS zone on ArrowRight in a right-to-left locale", async () => {
    await withRTL(async () => {
      let dropped: DropEvent | null = null;
      const { container } = ui(<Board onDrop={(e) => { dropped = e; }} />);
      const grip = handle(container, "Reorder Task C"); // starts in z2, the last zone

      fireEvent.keyDown(grip, { key: " " });
      await flush();
      expect(grip.getAttribute("aria-pressed")).toBe("true");

      // ArrowRight steps back toward the first zone; ArrowLeft would clamp at the last.
      act(() => { fireEvent.keyDown(grip, { key: "ArrowRight" }); });
      act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });

      expect(dropped).not.toBeNull();
      expect(dropped!.from).toBe("z2");
      expect(dropped!.to).toBe("z1");
    });
  });

  it("leaves the vertical arrows alone in a right-to-left locale", async () => {
    await withRTL(async () => {
      let dropped: DropEvent | null = null;
      const { container } = ui(<Board onDrop={(e) => { dropped = e; }} />);
      const grip = handle(container, "Reorder Task A"); // z1, index 0 of 1 remaining card

      fireEvent.keyDown(grip, { key: " " });
      await flush();

      // ArrowDown still advances the position within the zone; the block axis never mirrors.
      act(() => { fireEvent.keyDown(grip, { key: "ArrowDown" }); });
      act(() => { fireEvent.keyDown(grip, { key: "Enter" }); });

      expect(dropped).not.toBeNull();
      expect(dropped!.to).toBe("z1");
      expect(dropped!.index).toBe(1);
    });
  });
});
