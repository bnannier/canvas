// Pure StackedList reorder math, split out from the React shell so it can be unit-tested with
// no renderer (the drag-drop.geometry.ts precedent). Nothing here touches React or RN.
//
// The DnD layer reports a within-list drop with an insertion index computed over the list
// EXCLUDING the dragged row (see insertionIndexFor / keyboardMove in
// ../../organisms/drag-drop/drag-drop.geometry.ts). That index IS the row's final index once
// the move is applied (remove, then insert), so `toIndex` needs no further adjustment.

/** The move reported through StackedList's `onReorder`. */
export interface StackedListMove {
  /** The moved row's id (`StackedListItem.id`, or its array index when the item has no id). */
  id: string | number;
  /** The row's index in the CURRENT `items` array. */
  fromIndex: number;
  /** The row's index once the move is applied (remove at fromIndex, insert at toIndex). */
  toIndex: number;
  /** Row now directly above, null = top of the list. */
  afterId: string | number | null;
  /** Row now directly below, null = bottom of the list. */
  beforeId: string | number | null;
}

/**
 * Compute the StackedListMove for a drop. `ids` is the row identity per CURRENT array position
 * (item.id, or the array index for id-less rows), `fromIndex` the dragged row's position, and
 * `insertionIndex` the drop position over the list with the dragged row excluded (exactly what
 * the DnD layer reports). Returns null when `fromIndex` is out of range (a stale drop).
 */
export function listMoveFor(
  ids: readonly (string | number)[],
  fromIndex: number,
  insertionIndex: number,
): StackedListMove | null {
  if (fromIndex < 0 || fromIndex >= ids.length) return null;
  const without = ids.filter((_, i) => i !== fromIndex);
  const toIndex = Math.max(0, Math.min(insertionIndex, without.length));
  return {
    id: ids[fromIndex]!,
    fromIndex,
    toIndex,
    afterId: toIndex > 0 ? without[toIndex - 1]! : null,
    beforeId: toIndex < without.length ? without[toIndex]! : null,
  };
}
