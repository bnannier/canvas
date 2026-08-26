import { describe, it, expect } from "bun:test";
import {
  withinRect,
  hitTestZone,
  insertionIndexFor,
  insertionOffset,
  sortByMainAxis,
  zonesInReadingOrder,
  keyboardMove,
  type Rect,
  type CardRect,
} from "../src/organisms/drag-drop/drag-drop.geometry.ts";

const r = (x: number, y: number, width: number, height: number): Rect => ({ x, y, width, height });

describe("withinRect", () => {
  it("includes the left/top edge and excludes the right/bottom edge", () => {
    const box = r(10, 10, 100, 50);
    expect(withinRect(10, 10, box)).toBe(true); // top-left corner
    expect(withinRect(109, 59, box)).toBe(true); // just inside
    expect(withinRect(110, 30, box)).toBe(false); // right edge excluded
    expect(withinRect(30, 60, box)).toBe(false); // bottom edge excluded
    expect(withinRect(9, 30, box)).toBe(false); // left of box
  });
});

describe("hitTestZone", () => {
  const rects = new Map<string, Rect>([
    ["a", r(0, 0, 100, 200)],
    ["b", r(120, 0, 100, 200)],
    ["c", r(240, 0, 100, 200)],
  ]);
  const order = ["a", "b", "c"];

  it("finds the zone under the pointer", () => {
    expect(hitTestZone(50, 100, rects, order)).toBe("a");
    expect(hitTestZone(150, 100, rects, order)).toBe("b");
    expect(hitTestZone(300, 100, rects, order)).toBe("c");
  });

  it("returns null in the gaps and outside every zone", () => {
    expect(hitTestZone(110, 100, rects, order)).toBeNull(); // gutter between a and b
    expect(hitTestZone(500, 100, rects, order)).toBeNull(); // past the last zone
  });

  it("prefers the later-registered zone when rects overlap (paints on top)", () => {
    const overlap = new Map<string, Rect>([
      ["under", r(0, 0, 200, 200)],
      ["over", r(50, 50, 100, 100)],
    ]);
    expect(hitTestZone(75, 75, overlap, ["under", "over"])).toBe("over");
  });

  it("skips zones that are not yet measured", () => {
    const partial = new Map<string, Rect>([["b", r(120, 0, 100, 200)]]);
    expect(hitTestZone(150, 100, partial, order)).toBe("b");
    expect(hitTestZone(50, 100, partial, order)).toBeNull(); // "a" not measured
  });
});

describe("insertionIndexFor (vertical list)", () => {
  // Three stacked cards, 60px tall each with a 10px gap → midpoints at y=30, 100, 170.
  const cards = [r(0, 0, 100, 60), r(0, 70, 100, 60), r(0, 140, 100, 60)];

  it("returns 0 above the first midpoint", () => {
    expect(insertionIndexFor(50, 0, cards, false)).toBe(0);
    expect(insertionIndexFor(50, 29, cards, false)).toBe(0);
  });

  it("increments as the pointer passes each card midpoint", () => {
    expect(insertionIndexFor(50, 31, cards, false)).toBe(1);
    expect(insertionIndexFor(50, 101, cards, false)).toBe(2);
    expect(insertionIndexFor(50, 171, cards, false)).toBe(3); // after the last card
  });

  it("returns 0 for an empty zone", () => {
    expect(insertionIndexFor(50, 500, [], false)).toBe(0);
  });
});

describe("insertionIndexFor (horizontal list)", () => {
  const cards = [r(0, 0, 60, 100), r(70, 0, 60, 100)]; // midpoints x=30, 100
  it("uses the X axis", () => {
    expect(insertionIndexFor(10, 50, cards, true)).toBe(0);
    expect(insertionIndexFor(50, 50, cards, true)).toBe(1);
    expect(insertionIndexFor(150, 50, cards, true)).toBe(2);
  });
});

describe("insertionOffset (vertical, zone origin at y=200)", () => {
  // Cards in provider space at y=210, 280 (each 60 tall); zone origin y=200; gap 6.
  const cards = [r(0, 210, 100, 60), r(0, 280, 100, 60)];
  it("places the line before the first card at index 0", () => {
    // 210 - 200 - 6 = 4 (zone-local, above the first card)
    expect(insertionOffset(cards, 0, 200, false, 6)).toBe(4);
  });
  it("places the line in the gutter between two cards", () => {
    // midpoint of end(210+60=270) and start(280) = 275, minus zone origin 200 = 75
    expect(insertionOffset(cards, 1, 200, false, 6)).toBe(75);
  });
  it("places the line after the last card at the final index", () => {
    // end(280+60=340) - 200 + 6 = 146
    expect(insertionOffset(cards, 2, 200, false, 6)).toBe(146);
  });
  it("returns the gap for an empty zone", () => {
    expect(insertionOffset([], 0, 200, false, 6)).toBe(6);
  });
});

describe("sortByMainAxis", () => {
  it("orders vertical cards by y without mutating the input", () => {
    const cards: CardRect[] = [
      { id: "b", rect: r(0, 70, 10, 60) },
      { id: "a", rect: r(0, 0, 10, 60) },
      { id: "c", rect: r(0, 140, 10, 60) },
    ];
    const sorted = sortByMainAxis(cards, false);
    expect(sorted.map((c) => c.id)).toEqual(["a", "b", "c"]);
    expect(cards.map((c) => c.id)).toEqual(["b", "a", "c"]); // input untouched
  });
});

describe("zonesInReadingOrder", () => {
  it("reads a wrapped grid row by row, left to right, whatever order the zones registered in", () => {
    // Two 6-column cells on the first row, one on the second: the arrangement a dashboard has
    // after a reorder, with the registry still holding the original mount order.
    const rects = new Map<string, Rect>([
      ["a", r(608, 0, 592, 200)],
      ["b", r(0, 0, 592, 200)],
      ["c", r(0, 216, 592, 200)],
    ]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects)).toEqual(["b", "a", "c"]);
  });

  it("keeps lanes of very different heights on one row", () => {
    const rects = new Map<string, Rect>([
      ["doing", r(316, 0, 300, 180)],
      ["todo", r(0, 0, 300, 900)],
      ["done", r(632, 0, 300, 400)],
    ]);
    expect(zonesInReadingOrder(["todo", "doing", "done"], rects)).toEqual(["todo", "doing", "done"]);
  });

  it("starts a new row only once a zone clears the row above", () => {
    const rects = new Map<string, Rect>([
      ["top-left", r(0, 0, 100, 100)],
      ["top-right", r(120, 0, 100, 300)],
      ["below", r(0, 316, 100, 100)], // clears the tallest box above, so it is a new row
    ]);
    expect(zonesInReadingOrder(["below", "top-right", "top-left"], rects)).toEqual(["top-left", "top-right", "below"]);
  });

  it("leaves the given order alone when nothing has been laid out", () => {
    const rects = new Map<string, Rect>([
      ["a", r(0, 0, 0, 0)],
      ["b", r(0, 0, 0, 0)],
      ["c", r(0, 0, 0, 0)],
    ]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects)).toEqual(["a", "b", "c"]);
  });

  it("appends zones that have no rect yet, in their given order", () => {
    const rects = new Map<string, Rect>([["b", r(0, 0, 100, 100)]]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects)).toEqual(["b", "a", "c"]);
  });
});

describe("keyboardMove", () => {
  const zones = [
    { id: "todo", count: 3 },
    { id: "doing", count: 1 },
    { id: "done", count: 2 },
  ];

  it("walks the index within a zone and clamps at both ends", () => {
    expect(keyboardMove({ zoneId: "todo", index: 0 }, "nextIndex", zones)).toEqual({ zoneId: "todo", index: 1 });
    expect(keyboardMove({ zoneId: "todo", index: 3 }, "nextIndex", zones)).toEqual({ zoneId: "todo", index: 3 }); // clamp at count
    expect(keyboardMove({ zoneId: "todo", index: 0 }, "prevIndex", zones)).toEqual({ zoneId: "todo", index: 0 }); // clamp at 0
  });

  it("moves between zones and clamps the carried index into the destination", () => {
    expect(keyboardMove({ zoneId: "todo", index: 3 }, "nextZone", zones)).toEqual({ zoneId: "doing", index: 1 }); // 3 clamped to doing.count=1
    expect(keyboardMove({ zoneId: "todo", index: 0 }, "prevZone", zones)).toEqual({ zoneId: "todo", index: 0 }); // clamp at first zone
    expect(keyboardMove({ zoneId: "done", index: 2 }, "nextZone", zones)).toEqual({ zoneId: "done", index: 2 }); // clamp at last zone
  });

  it("treats an unknown zone id as the first zone for clamping", () => {
    // Unknown zone -> zi falls back to 0 (todo, count 3), so a nextIndex from 5 clamps to 3.
    expect(keyboardMove({ zoneId: "ghost", index: 5 }, "nextIndex", zones)).toEqual({ zoneId: "ghost", index: 3 });
  });
});
