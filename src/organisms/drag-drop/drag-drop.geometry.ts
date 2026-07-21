// Pure drag-and-drop geometry, split out from the React shell so it can be unit-tested with no
// renderer. NONE of this touches React Native, the DOM, or Platform.OS.
//
// Coordinate model (why this is cross-platform with no branch):
//   Every rect here is in ONE consistent "screen" space, whatever `measureInWindow` reports.
//   On the web that is the VIEWPORT (react-native-web subtracts window.scrollX/Y in getRect);
//   on native it is the window. We never mix that with the responder's page-space pointer.
//   Instead the shell measures the provider, the zones, the cards, and the grabbed handle ALL
//   via measureInWindow at grab time, expresses them RELATIVE TO THE PROVIDER (a subtraction,
//   so the per-platform scroll term cancels), and then tracks the pointer by the PanResponder
//   gesture DELTA (dx/dy), which is identical in page and viewport space. So a hit-test only
//   ever compares provider-relative rects to a provider-relative pointer, and no scroll offset
//   or Platform.OS check is needed. See drag-drop.shared.tsx for how the pieces are measured.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A card's identity plus its provider-relative rect, used for insertion math. */
export interface CardRect {
  id: string;
  rect: Rect;
}

/** True if (px, py) lies inside `r` (left/top inclusive, right/bottom exclusive). */
export function withinRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px < r.x + r.width && py >= r.y && py < r.y + r.height;
}

/**
 * The id of the top-most zone whose rect contains the point, or null when the point is over no
 * zone. `order` lists zone ids in registration order; a later-registered zone paints over an
 * earlier one, so we scan it in reverse and return the first hit. Zones missing from `rects`
 * (not yet measured) are skipped rather than throwing.
 */
export function hitTestZone(
  px: number,
  py: number,
  rects: ReadonlyMap<string, Rect>,
  order: readonly string[],
): string | null {
  for (let i = order.length - 1; i >= 0; i--) {
    const id = order[i]!;
    const r = rects.get(id);
    if (r && withinRect(px, py, r)) return id;
  }
  return null;
}

/**
 * The insertion index for the pointer within a zone. `cards` are the zone's draggable rects in
 * visual order, EXCLUDING the card being dragged. The index is the count of cards the pointer
 * has passed the midpoint of along the main axis (Y for a vertical list, X for a horizontal
 * one), so it runs 0..cards.length: 0 drops before the first card, cards.length after the last.
 */
export function insertionIndexFor(px: number, py: number, cards: readonly Rect[], horizontal: boolean): number {
  const p = horizontal ? px : py;
  let index = 0;
  for (const r of cards) {
    const mid = horizontal ? r.x + r.width / 2 : r.y + r.height / 2;
    if (p > mid) index += 1;
    else break;
  }
  return index;
}

/**
 * The main-axis offset (in the zone's own coordinate space) at which to paint the insertion
 * indicator line, given the sorted card rects (provider-relative, dragged card excluded), the
 * chosen index, the zone's own provider-relative origin, and a small visual gap. Placing the
 * line at the boundary between card[index-1] and card[index] keeps it centered in the gutter.
 */
export function insertionOffset(
  cards: readonly Rect[],
  index: number,
  zoneOrigin: number,
  horizontal: boolean,
  gap: number,
): number {
  const start = (r: Rect) => (horizontal ? r.x : r.y);
  const end = (r: Rect) => (horizontal ? r.x + r.width : r.y + r.height);
  if (cards.length === 0) return gap;
  if (index <= 0) return start(cards[0]!) - zoneOrigin - gap;
  if (index >= cards.length) return end(cards[cards.length - 1]!) - zoneOrigin + gap;
  const before = cards[index - 1]!;
  const after = cards[index]!;
  return (end(before) + start(after)) / 2 - zoneOrigin;
}

/** Sort card rects into visual order along the main axis (a copy; input is not mutated). */
export function sortByMainAxis(cards: readonly CardRect[], horizontal: boolean): CardRect[] {
  return [...cards].sort((a, b) => (horizontal ? a.rect.x - b.rect.x : a.rect.y - b.rect.y));
}

// ---------------------------------------------------------------------------
// Keyboard drag cursor: pure state transitions for the screen-reader/keyboard path (no pointer
// geometry). `zones` lists each drop target in registration order with the number of cards it
// holds (EXCLUDING the dragged card), so an index runs 0..count within a zone.

export interface KeyboardCursor {
  zoneId: string;
  index: number;
}

export interface ZoneCount {
  id: string;
  count: number;
}

export type KeyboardMove = "prevZone" | "nextZone" | "prevIndex" | "nextIndex";

/**
 * Advance the keyboard drag cursor by one step, clamping at the ends. Moving between zones
 * clamps the carried index into the destination zone's range; moving the index walks 0..count
 * within the current zone. Unknown zone ids resolve to the first zone (defensive).
 */
export function keyboardMove(cursor: KeyboardCursor, move: KeyboardMove, zones: readonly ZoneCount[]): KeyboardCursor {
  if (zones.length === 0) return cursor;
  const zi = Math.max(0, zones.findIndex((z) => z.id === cursor.zoneId));
  if (move === "prevZone" || move === "nextZone") {
    const nextZi = move === "nextZone" ? Math.min(zones.length - 1, zi + 1) : Math.max(0, zi - 1);
    const z = zones[nextZi]!;
    return { zoneId: z.id, index: Math.min(cursor.index, z.count) };
  }
  const count = zones[zi]?.count ?? 0;
  const nextIndex = move === "nextIndex" ? Math.min(count, cursor.index + 1) : Math.max(0, cursor.index - 1);
  return { zoneId: cursor.zoneId, index: nextIndex };
}
