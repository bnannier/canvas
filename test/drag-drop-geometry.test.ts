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
    expect(insertionIndexFor(50, 0, cards, false, false)).toBe(0);
    expect(insertionIndexFor(50, 29, cards, false, false)).toBe(0);
  });

  it("increments as the pointer passes each card midpoint", () => {
    expect(insertionIndexFor(50, 31, cards, false, false)).toBe(1);
    expect(insertionIndexFor(50, 101, cards, false, false)).toBe(2);
    expect(insertionIndexFor(50, 171, cards, false, false)).toBe(3); // after the last card
  });

  it("returns 0 for an empty zone", () => {
    expect(insertionIndexFor(50, 500, [], false, false)).toBe(0);
  });

  it("ignores RTL: the block axis never mirrors", () => {
    for (const y of [0, 29, 31, 101, 171]) {
      expect(insertionIndexFor(50, y, cards, false, true)).toBe(insertionIndexFor(50, y, cards, false, false));
    }
  });
});

describe("insertionIndexFor (horizontal list)", () => {
  const cards = [r(0, 0, 60, 100), r(70, 0, 60, 100)]; // midpoints x=30, 100
  it("uses the X axis", () => {
    expect(insertionIndexFor(10, 50, cards, true, false)).toBe(0);
    expect(insertionIndexFor(50, 50, cards, true, false)).toBe(1);
    expect(insertionIndexFor(150, 50, cards, true, false)).toBe(2);
  });
});

// A right-to-left row: `flexDirection: "row"` mirrors under RTL, so data index 0 is the
// RIGHTMOST card and "later in data order" means further LEFT. `cards` reaches the geometry in
// DATA order (sortByMainAxis puts it there), which is descending X here.
describe("insertionIndexFor (horizontal list, RTL)", () => {
  // Zone x=0..220; cards inset 10 from each edge with a 10px gutter, laid out right to left:
  // data 0 = [150,210], data 1 = [80,140], data 2 = [10,70] → midpoints x=180, 110, 40.
  const cards = [r(150, 0, 60, 100), r(80, 0, 60, 100), r(10, 0, 60, 100)];

  it("returns 0 to the RIGHT of the first card's midpoint", () => {
    expect(insertionIndexFor(205, 50, cards, true, true)).toBe(0);
    expect(insertionIndexFor(181, 50, cards, true, true)).toBe(0);
  });

  it("increments as the pointer moves LEFT past each card midpoint", () => {
    expect(insertionIndexFor(179, 50, cards, true, true)).toBe(1);
    expect(insertionIndexFor(109, 50, cards, true, true)).toBe(2);
    expect(insertionIndexFor(39, 50, cards, true, true)).toBe(3); // past the last (leftmost) card
  });

  it("is the mirror of the LTR reading, not the same answer", () => {
    // Far right = index 0 in RTL, and the final index in LTR (with the same rects read the
    // other way): the two directions must not agree.
    const ltr = [r(10, 0, 60, 100), r(80, 0, 60, 100), r(150, 0, 60, 100)];
    expect(insertionIndexFor(205, 50, ltr, true, false)).toBe(3);
    expect(insertionIndexFor(205, 50, cards, true, true)).toBe(0);
  });

  it("returns 0 for an empty zone", () => {
    expect(insertionIndexFor(205, 50, [], true, true)).toBe(0);
  });
});

describe("insertionOffset (vertical, zone at y=200)", () => {
  // Cards in provider space at y=210, 280 (each 60 tall); zone origin y=200; gap 6.
  const zone = r(0, 200, 100, 200);
  const cards = [r(0, 210, 100, 60), r(0, 280, 100, 60)];
  it("places the line before the first card at index 0", () => {
    // 210 - 200 - 6 = 4 (zone-local, above the first card)
    expect(insertionOffset(cards, 0, zone, false, false, 6)).toBe(4);
  });
  it("places the line in the gutter between two cards", () => {
    // midpoint of end(210+60=270) and start(280) = 275, minus zone origin 200 = 75
    expect(insertionOffset(cards, 1, zone, false, false, 6)).toBe(75);
  });
  it("places the line after the last card at the final index", () => {
    // end(280+60=340) - 200 + 6 = 146
    expect(insertionOffset(cards, 2, zone, false, false, 6)).toBe(146);
  });
  it("returns the gap for an empty zone", () => {
    expect(insertionOffset([], 0, zone, false, false, 6)).toBe(6);
  });
  it("ignores RTL: the block axis never mirrors", () => {
    for (const i of [0, 1, 2]) {
      expect(insertionOffset(cards, i, zone, false, true, 6)).toBe(insertionOffset(cards, i, zone, false, false, 6));
    }
  });
});

// The offset is measured along the READING axis from the zone's LEADING edge (its left edge in
// LTR, its RIGHT edge in RTL), so the indicator can be anchored with one logical inset on every
// platform. The payoff: a row and its mirror image produce the SAME offsets.
describe("insertionOffset (horizontal, leading-edge relative in both directions)", () => {
  const zone = r(0, 0, 220, 100);
  const gap = 6;
  const ltr = [r(10, 0, 60, 100), r(80, 0, 60, 100), r(150, 0, 60, 100)];
  const rtl = [r(150, 0, 60, 100), r(80, 0, 60, 100), r(10, 0, 60, 100)]; // same row, data order mirrored

  it("measures from the left edge in LTR", () => {
    expect(insertionOffset(ltr, 0, zone, true, false, gap)).toBe(4); // 10 - 0 - 6
    expect(insertionOffset(ltr, 1, zone, true, false, gap)).toBe(75); // (70 + 80) / 2
    expect(insertionOffset(ltr, 2, zone, true, false, gap)).toBe(145); // (140 + 150) / 2
    expect(insertionOffset(ltr, 3, zone, true, false, gap)).toBe(216); // 210 + 6
  });

  it("measures from the RIGHT edge in RTL, giving the identical offsets", () => {
    expect(insertionOffset(rtl, 0, zone, true, true, gap)).toBe(4); // 220 - 210 - 6
    expect(insertionOffset(rtl, 1, zone, true, true, gap)).toBe(75); // 220 - (150 + 140) / 2
    expect(insertionOffset(rtl, 2, zone, true, true, gap)).toBe(145); // 220 - (80 + 70) / 2
    expect(insertionOffset(rtl, 3, zone, true, true, gap)).toBe(216); // 220 - 10 + 6
  });

  it("returns the gap for an empty zone in both directions", () => {
    expect(insertionOffset([], 0, zone, true, false, gap)).toBe(gap);
    expect(insertionOffset([], 0, zone, true, true, gap)).toBe(gap);
  });
});

describe("sortByMainAxis", () => {
  it("orders vertical cards by y without mutating the input", () => {
    const cards: CardRect[] = [
      { id: "b", rect: r(0, 70, 10, 60) },
      { id: "a", rect: r(0, 0, 10, 60) },
      { id: "c", rect: r(0, 140, 10, 60) },
    ];
    const sorted = sortByMainAxis(cards, false, false);
    expect(sorted.map((c) => c.id)).toEqual(["a", "b", "c"]);
    expect(cards.map((c) => c.id)).toEqual(["b", "a", "c"]); // input untouched
  });

  it("orders a vertical list the same way in RTL (the block axis never mirrors)", () => {
    const cards: CardRect[] = [
      { id: "b", rect: r(0, 70, 10, 60) },
      { id: "a", rect: r(0, 0, 10, 60) },
    ];
    expect(sortByMainAxis(cards, false, true).map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("orders a horizontal row left to right in LTR and right to left in RTL", () => {
    const cards: CardRect[] = [
      { id: "mid", rect: r(80, 0, 60, 100) },
      { id: "right", rect: r(150, 0, 60, 100) },
      { id: "left", rect: r(10, 0, 60, 100) },
    ];
    expect(sortByMainAxis(cards, true, false).map((c) => c.id)).toEqual(["left", "mid", "right"]);
    expect(sortByMainAxis(cards, true, true).map((c) => c.id)).toEqual(["right", "mid", "left"]);
    expect(cards.map((c) => c.id)).toEqual(["mid", "right", "left"]); // input untouched
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
    expect(zonesInReadingOrder(["a", "b", "c"], rects, false)).toEqual(["b", "a", "c"]);
  });

  it("reads each row RIGHT to left in a right-to-left locale", () => {
    // The same three cells as above. Rows still run top to bottom (the block axis never
    // mirrors); only the within-row sweep reverses.
    const rects = new Map<string, Rect>([
      ["a", r(608, 0, 592, 200)],
      ["b", r(0, 0, 592, 200)],
      ["c", r(0, 216, 592, 200)],
    ]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects, true)).toEqual(["a", "b", "c"]);
  });

  it("keeps lanes of very different heights on one row", () => {
    const rects = new Map<string, Rect>([
      ["doing", r(316, 0, 300, 180)],
      ["todo", r(0, 0, 300, 900)],
      ["done", r(632, 0, 300, 400)],
    ]);
    expect(zonesInReadingOrder(["todo", "doing", "done"], rects, false)).toEqual(["todo", "doing", "done"]);
    // In RTL the same board reads from the rightmost lane inward.
    expect(zonesInReadingOrder(["todo", "doing", "done"], rects, true)).toEqual(["done", "doing", "todo"]);
  });

  it("starts a new row only once a zone clears the row above", () => {
    const rects = new Map<string, Rect>([
      ["top-left", r(0, 0, 100, 100)],
      ["top-right", r(120, 0, 100, 300)],
      ["below", r(0, 316, 100, 100)], // clears the tallest box above, so it is a new row
    ]);
    expect(zonesInReadingOrder(["below", "top-right", "top-left"], rects, false)).toEqual(["top-left", "top-right", "below"]);
    // RTL reverses within the row but never lifts the second row above the first.
    expect(zonesInReadingOrder(["below", "top-right", "top-left"], rects, true)).toEqual(["top-right", "top-left", "below"]);
  });

  it("leaves the given order alone when nothing has been laid out", () => {
    const rects = new Map<string, Rect>([
      ["a", r(0, 0, 0, 0)],
      ["b", r(0, 0, 0, 0)],
      ["c", r(0, 0, 0, 0)],
    ]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects, false)).toEqual(["a", "b", "c"]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects, true)).toEqual(["a", "b", "c"]);
  });

  it("appends zones that have no rect yet, in their given order", () => {
    const rects = new Map<string, Rect>([["b", r(0, 0, 100, 100)]]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects, false)).toEqual(["b", "a", "c"]);
    expect(zonesInReadingOrder(["a", "b", "c"], rects, true)).toEqual(["b", "a", "c"]);
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
