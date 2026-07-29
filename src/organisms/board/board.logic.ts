// Pure Board move logic, split out from the React shell so it can be unit-tested with no
// renderer (the drag-drop.geometry.ts precedent). NONE of this touches React Native or React.
//
// The DnD layer reports a drop as { id, from, to, index } where `index` is the insertion index
// within the target zone EXCLUDING the dragged item (see insertionIndexFor / keyboardMove in
// ../drag-drop/drag-drop.geometry.ts). BoardMove keeps exactly that convention and adds the
// neighbor ids (afterId / beforeId) so a consumer backed by a fractional-ordering store can
// re-rank without recomputing positions itself.

import { type BoardItem, type BoardMove } from "./board.types.js";

/** A drop as the DnD layer reports it: target index EXCLUDES the dragged item. */
export interface BoardDrop {
  /** The dragged item's id. */
  id: string;
  /** The source column id. */
  from: string;
  /** The target column id. */
  to: string;
  /** Insertion index within the target column, dragged item excluded, 0..count. */
  index: number;
}

/**
 * Compute the BoardMove for a drop against the CURRENT controlled `items` order. The target
 * column's order is the array order filtered by `columnId`, with the dragged item excluded
 * (it is being lifted out), so `afterId` is the item that ends up directly above the drop and
 * `beforeId` the one directly below; null marks the top/bottom of the column. Returns null when
 * the dragged id is not in `items` (a defensive no-op; the drop is stale).
 */
export function boardMoveFor(items: readonly BoardItem[], drop: BoardDrop): BoardMove | null {
  if (!items.some((it) => it.id === drop.id)) return null;
  const target = items.filter((it) => it.columnId === drop.to && it.id !== drop.id);
  const index = Math.max(0, Math.min(drop.index, target.length));
  return {
    id: drop.id,
    from: drop.from,
    to: drop.to,
    index,
    afterId: index > 0 ? target[index - 1]!.id : null,
    beforeId: index < target.length ? target[index]!.id : null,
  };
}

/**
 * Apply a BoardMove to a controlled `items` array, returning a NEW array (input untouched)
 * where the moved item carries the target `columnId` and sits at `move.index` within that
 * column. Items in other columns keep their relative order. This is the standard `onMove`
 * reducer for consumers that keep the list in local state, and the Board's own reducer in
 * uncontrolled (`defaultItems`) mode. Unknown ids return the input array unchanged. Generic
 * so a consumer's richer item type survives the reducer (the docs `applyDrop` precedent).
 */
export function applyBoardMove<T extends BoardItem>(items: readonly T[], move: BoardMove): T[] {
  const moved = items.find((it) => it.id === move.id);
  if (!moved) return [...items];
  const without = items.filter((it) => it.id !== move.id);
  // The spread keeps every consumer field; only columnId is re-homed. The cast is sound for
  // the documented constraint (`columnId: string`); a consumer narrowing columnId to a
  // literal union takes responsibility for the move's target id fitting it.
  const updated = { ...moved, columnId: move.to } as T;
  const target = without.filter((it) => it.columnId === move.to);
  const others = without.filter((it) => it.columnId !== move.to);
  target.splice(Math.max(0, Math.min(move.index, target.length)), 0, updated);
  return [...others, ...target];
}
