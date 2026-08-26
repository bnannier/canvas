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
//
// Layout direction (why `rtl` is a PARAMETER, never a read):
//   Measured rects are always PHYSICAL: `measureInWindow` reports screen coordinates, and a
//   right-to-left locale does not change that. What RTL does change is the INLINE axis a row is
//   read along: `flexDirection: "row"` mirrors, so in a horizontal zone data index 0 is the
//   RIGHTMOST card and "later in data order" means further LEFT. So every function here that
//   walks the X axis takes `rtl` and mirrors the DIRECTION it reads in, never the coordinates.
//   The BLOCK axis never mirrors, so a vertical zone is identical in both directions.
//
//   This mirrors how the rest of the kit resolves direction (the Slider maps a physical x to a
//   flipped fraction, the Drawer resolves a logical edge to a physical side), and keeping it a
//   parameter is what lets the whole module stay unit-testable with no renderer: the shell reads
//   `isRTL()` once per drag and hands the answer in.

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
 * DATA order (what `sortByMainAxis` returns), EXCLUDING the card being dragged. The index is the
 * count of cards the pointer has passed the midpoint of along the reading direction: down the Y
 * axis for a vertical list, and along the X axis for a horizontal one — rightward in LTR,
 * LEFTWARD in RTL. It runs 0..cards.length: 0 drops before the first card, cards.length after
 * the last.
 */
export function insertionIndexFor(px: number, py: number, cards: readonly Rect[], horizontal: boolean, rtl: boolean): number {
  const mirrored = horizontal && rtl;
  const p = horizontal ? px : py;
  let index = 0;
  for (const r of cards) {
    const mid = horizontal ? r.x + r.width / 2 : r.y + r.height / 2;
    if (mirrored ? p < mid : p > mid) index += 1;
    else break;
  }
  return index;
}

/**
 * The offset at which to paint the insertion indicator line, given the sorted card rects
 * (provider-relative, dragged card excluded), the chosen index, the zone's own provider-relative
 * rect, and a small visual gap. Placing the line at the boundary between card[index-1] and
 * card[index] keeps it centered in the gutter.
 *
 * The offset is measured along the READING axis from the zone's LEADING edge: its top edge for a
 * vertical list, its left edge for an LTR row, and its RIGHT edge for an RTL row. That is a
 * LOGICAL inset, so the shell anchors the line with one style (`top` / `insetInlineStart`) that
 * every platform resolves to the correct physical side, with no branch. It also means a row and
 * its mirror image produce the same numbers.
 */
export function insertionOffset(
  cards: readonly Rect[],
  index: number,
  zone: Rect,
  horizontal: boolean,
  rtl: boolean,
  gap: number,
): number {
  const mirrored = horizontal && rtl;
  // A card's leading edge is the one the reading direction reaches first; its trailing edge the
  // one it leaves last. Under RTL those are its right and left edges respectively.
  const lead = (r: Rect) => (horizontal ? (mirrored ? r.x + r.width : r.x) : r.y);
  const trail = (r: Rect) => (horizontal ? (mirrored ? r.x : r.x + r.width) : r.y + r.height);
  // Physical main-axis coordinate -> distance from the zone's leading edge, growing along the
  // reading direction (so it counts DOWN from the zone's right edge in an RTL row).
  const rel = (c: number) => (mirrored ? zone.x + zone.width - c : c - (horizontal ? zone.x : zone.y));
  if (cards.length === 0) return gap;
  if (index <= 0) return rel(lead(cards[0]!)) - gap;
  if (index >= cards.length) return rel(trail(cards[cards.length - 1]!)) + gap;
  return rel((trail(cards[index - 1]!) + lead(cards[index]!)) / 2);
}

/**
 * Sort card rects into DATA order along the main axis (a copy; input is not mutated): by Y for a
 * vertical list, and by X for a horizontal one — ascending in LTR, DESCENDING in RTL, because a
 * mirrored row puts data index 0 at the largest X.
 */
export function sortByMainAxis(cards: readonly CardRect[], horizontal: boolean, rtl: boolean): CardRect[] {
  if (!horizontal) return [...cards].sort((a, b) => a.rect.y - b.rect.y);
  return [...cards].sort((a, b) => (rtl ? b.rect.x - a.rect.x : a.rect.x - b.rect.x));
}

/**
 * The zone ids in READING order: row by row down the surface, and along the inline axis within a
 * row — left to right in LTR, RIGHT TO LEFT in RTL — read off the measured rects rather than off
 * the order the zones happened to register in. Rows always run top to bottom: the block axis
 * never mirrors, so `rtl` reverses the within-row sweep and nothing else.
 *
 * Registration order is MOUNT order, and it never changes again: a zone that moves on screen
 * (a reordered dashboard cell, a lane a consumer moved) keeps its original slot, because React
 * reuses the keyed element instead of remounting it. Anything that walks zones the way a user
 * sees them (the keyboard cursor) must therefore ask the geometry, which the measurement pass
 * already captured, not the registry.
 *
 * Rows are swept, not bucketed by a tolerance: a zone joins the row being built while its top
 * edge is above the row's running bottom, which is exactly "these boxes share a band of the
 * screen" and needs no guess about how tall a row is. A wrapped line always starts below the
 * tallest box of the line above, so it clears the band and opens a new row; lanes of wildly
 * different heights still read as one row.
 *
 * Ids with no rect yet (a zone that mounted after the measure, or measured non-finite) keep
 * their given relative order and land at the end, and rects that are all zeros (nothing has
 * been laid out) leave the given order untouched, because every comparison ties and both sorts
 * are stable. So the worst case degrades to the input order rather than to a scramble.
 */
export function zonesInReadingOrder(order: readonly string[], rects: ReadonlyMap<string, Rect>, rtl: boolean): string[] {
  const measured: string[] = [];
  const unmeasured: string[] = [];
  for (const id of order) (rects.has(id) ? measured : unmeasured).push(id);
  const alongRow = (a: string, b: string) => (rtl ? rects.get(b)!.x - rects.get(a)!.x : rects.get(a)!.x - rects.get(b)!.x);
  measured.sort((a, b) => rects.get(a)!.y - rects.get(b)!.y || alongRow(a, b));

  const out: string[] = [];
  let row: string[] = [];
  let rowBottom = 0;
  const flushRow = () => {
    row.sort(alongRow);
    out.push(...row);
    row = [];
  };
  for (const id of measured) {
    const r = rects.get(id)!;
    if (row.length > 0 && r.y >= rowBottom) flushRow();
    rowBottom = row.length === 0 ? r.y + r.height : Math.max(rowBottom, r.y + r.height);
    row.push(id);
  }
  flushRow();
  return [...out, ...unmeasured];
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
