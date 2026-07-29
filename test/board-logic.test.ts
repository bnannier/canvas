import { describe, it, expect } from "bun:test";
import { boardMoveFor, applyBoardMove } from "../src/organisms/board/board.logic.ts";
import { type BoardItem } from "../src/organisms/board/board.types.ts";

// Pure Board move math (no renderer): BoardMove derivation from a drop (the DnD layer's
// index convention EXCLUDES the dragged card) and the standard applyBoardMove reducer.

const items: BoardItem[] = [
  { id: "a", columnId: "todo", title: "A" },
  { id: "b", columnId: "todo", title: "B" },
  { id: "c", columnId: "doing", title: "C" },
  { id: "d", columnId: "doing", title: "D" },
];

describe("boardMoveFor", () => {
  it("derives neighbors for a cross-column drop between two cards", () => {
    // Drop a into doing at index 1: doing (without a) is [c, d] -> after c, before d.
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "doing", index: 1 });
    expect(move).toEqual({ id: "a", from: "todo", to: "doing", index: 1, afterId: "c", beforeId: "d" });
  });

  it("marks the top of a column with afterId null", () => {
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "doing", index: 0 });
    expect(move).toEqual({ id: "a", from: "todo", to: "doing", index: 0, afterId: null, beforeId: "c" });
  });

  it("marks the bottom of a column with beforeId null", () => {
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "doing", index: 2 });
    expect(move).toEqual({ id: "a", from: "todo", to: "doing", index: 2, afterId: "d", beforeId: null });
  });

  it("excludes the dragged card from a same-column reorder", () => {
    // todo without a is [b]; index 1 = below b.
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "todo", index: 1 });
    expect(move).toEqual({ id: "a", from: "todo", to: "todo", index: 1, afterId: "b", beforeId: null });
  });

  it("targets an empty column with both neighbors null", () => {
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "done", index: 0 });
    expect(move).toEqual({ id: "a", from: "todo", to: "done", index: 0, afterId: null, beforeId: null });
  });

  it("clamps an out-of-range index into the column", () => {
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "doing", index: 99 });
    expect(move?.index).toBe(2);
    expect(move?.afterId).toBe("d");
    expect(move?.beforeId).toBeNull();
  });

  it("returns null for an unknown dragged id (stale drop)", () => {
    expect(boardMoveFor(items, { id: "zz", from: "todo", to: "doing", index: 0 })).toBeNull();
  });
});

describe("applyBoardMove", () => {
  it("moves the card into the target column at the move index", () => {
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "doing", index: 1 })!;
    const next = applyBoardMove(items, move);
    expect(next.filter((i) => i.columnId === "doing").map((i) => i.id)).toEqual(["c", "a", "d"]);
    expect(next.filter((i) => i.columnId === "todo").map((i) => i.id)).toEqual(["b"]);
  });

  it("reorders within a column", () => {
    const move = boardMoveFor(items, { id: "a", from: "todo", to: "todo", index: 1 })!;
    const next = applyBoardMove(items, move);
    expect(next.filter((i) => i.columnId === "todo").map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("does not mutate the input and preserves untouched columns", () => {
    const before = items.map((i) => ({ ...i }));
    const move = boardMoveFor(items, { id: "c", from: "doing", to: "todo", index: 0 })!;
    const next = applyBoardMove(items, move);
    expect(items).toEqual(before);
    expect(next).not.toBe(items);
    expect(next.filter((i) => i.columnId === "doing").map((i) => i.id)).toEqual(["d"]);
    expect(next.filter((i) => i.columnId === "todo").map((i) => i.id)).toEqual(["c", "a", "b"]);
  });

  it("round-trips with boardMoveFor: neighbors read back from the applied array", () => {
    const move = boardMoveFor(items, { id: "b", from: "todo", to: "doing", index: 2 })!;
    const next = applyBoardMove(items, move);
    const doing = next.filter((i) => i.columnId === "doing").map((i) => i.id);
    const at = doing.indexOf("b");
    expect(doing[at - 1] ?? null).toBe(move.afterId);
    expect(doing[at + 1] ?? null).toBe(move.beforeId);
  });

  it("returns an unchanged copy for an unknown id", () => {
    const next = applyBoardMove(items, { id: "zz", from: "todo", to: "doing", index: 0, afterId: null, beforeId: null });
    expect(next).toEqual(items);
    expect(next).not.toBe(items);
  });
});
