// Pure DashboardGrid layout logic, split out from the React shell so it can be unit-tested with
// no renderer (the board.logic.ts precedent). NONE of this touches React Native, React, or the
// DOM; the one thing it borrows from React is the `ReactNode` TYPE the widget's content slot
// carries.
//
// Two independent concerns live here:
//
//   - ORDER. The widget order is a plain array of ids, which is exactly what a consuming app
//     persists server-side. That array outlives the widget list it was captured from: a release
//     adds a widget (its id is missing from the stored order) or drops one (a stored id matches
//     no widget). Both are normal rather than exceptional, so `orderedWidgets` reconciles the
//     two instead of throwing, and `moveWidget` treats an id it cannot find as a no-op. A board
//     that threw on a stale order would break every user who saved a layout before the release.
//   - SPAN. Widgets declare their width in twelfths of the board. `effectiveSpan` resolves that
//     declaration for the tier the grid currently renders at, so the shell asks for one number
//     and never carries the tier rules itself.

import { type ReactNode } from "react";
import { clamp } from "../../style/math.js";

/** The board's column count: every span is a number of these 12 columns. */
export const DASHBOARD_COLUMNS = 12;

/**
 * The layout tier the grid renders at, resolved from the grid's OWN measured width (never the
 * window). `wide` honors each declared span, `narrow` reflows widgets to their `narrowSpan`,
 * and `phone` stacks every widget full width.
 */
export type DashboardTier = "wide" | "narrow" | "phone";

/** One widget (tile) on the dashboard. */
export interface DashboardWidget {
  /** Stable id, unique across the board; the order array and every move refer to it. */
  id: string;
  /** Declared width in columns on the `wide` tier, a whole 1..12 (outside values clamp). */
  span: number;
  /** Width in columns on the `narrow` tier; omit to take the span-derived default. */
  narrowSpan?: number;
  /**
   * The widget's ACCESSIBLE NAME, never visible chrome. Cells render bare (a widget arrives
   * with its own surface, which carries its own heading), so nothing paints this. Customize
   * mode is what reads it: it names the widget's drop zone and its draggable, so the grip
   * announces "Reorder {title}" and every drag announcement says which widget moved and what
   * it landed against. Locked, nothing reads it at all, but it is still required, because the
   * board can be unlocked at any time. Give it the same words the widget's own header shows.
   */
  title: string;
  /** The widget body. */
  content?: ReactNode;
}

/**
 * Arrange `widgets` by the id `order`, returning a NEW array (inputs untouched). The two lists
 * are reconciled, never assumed to agree: ids in `order` that match no widget are ignored, and
 * widgets whose id is missing from `order` are appended in their original `widgets` order. So a
 * stored order keeps working when a release adds widgets (the new ones land at the end) or
 * removes them (the orphaned ids drop out), which is the whole reason the consuming app can
 * persist the order as ids alone. Generic, so a consumer's richer widget type survives.
 */
export function orderedWidgets<T extends DashboardWidget>(widgets: readonly T[], order: readonly string[]): T[] {
  const byId = new Map(widgets.map((w) => [w.id, w]));
  const placed = new Set<string>();
  const result: T[] = [];
  for (const id of order) {
    const widget = byId.get(id);
    // A repeated id in the stored order places the widget once, at its first mention.
    if (!widget || placed.has(id)) continue;
    placed.add(id);
    result.push(widget);
  }
  for (const widget of widgets) {
    if (!placed.has(widget.id)) result.push(widget);
  }
  return result;
}

/**
 * Move `dragId` immediately before or after `targetId` within the id `order`, returning a NEW
 * array (input untouched). The dragged id is lifted out first, so the insertion point is read
 * from the order WITHOUT it and a forward move lands where the drop indicator sat. Dropping a
 * widget onto itself, or naming an id the order does not hold, returns an unchanged copy rather
 * than throwing: a drop can be reported against an order the app has already replaced.
 */
export function moveWidget(
  order: readonly string[],
  dragId: string,
  targetId: string,
  before: boolean,
): string[] {
  if (dragId === targetId) return [...order];
  if (!order.includes(dragId) || !order.includes(targetId)) return [...order];
  const without = order.filter((id) => id !== dragId);
  const at = without.indexOf(targetId);
  without.splice(before ? at : at + 1, 0, dragId);
  return without;
}

/**
 * The width in columns `widget` occupies on `tier`, always within 1..12.
 *
 * - `wide`: the declared `span`.
 * - `narrow`: `narrowSpan` when the widget declares one, otherwise a default derived from the
 *   span, since half of a wide board is not half of a narrow one. A widget that asked for 5 or
 *   more columns is a primary tile and takes the full 12; anything smaller pairs up at 6.
 * - `phone`: 12 for every widget, because two tiles side by side on a phone are unreadable.
 *
 * The derivation reads the CLAMPED span, so an out-of-range declaration resolves the same way
 * its clamped equivalent would.
 */
export function effectiveSpan(widget: DashboardWidget, tier: DashboardTier): number {
  if (tier === "phone") return DASHBOARD_COLUMNS;
  const span = clamp(widget.span, 1, DASHBOARD_COLUMNS);
  if (tier === "wide") return span;
  if (widget.narrowSpan != null) return clamp(widget.narrowSpan, 1, DASHBOARD_COLUMNS);
  return span >= 5 ? DASHBOARD_COLUMNS : DASHBOARD_COLUMNS / 2;
}
