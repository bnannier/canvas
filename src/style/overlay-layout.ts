/** The edge of its trigger an anchored card sits against: above or below it, or beside
 *  it at the trigger's leading (`start`) or trailing (`end`) side in the layout direction. */
export type OverlaySide = "above" | "below" | "start" | "end";
/** The two vertical sides a card can be fitted to. */
export type OverlayVerticalSide = "above" | "below";
/** The two sides a card can sit beside its trigger, logical in the layout direction. */
export type OverlayBesideSide = "start" | "end";

const INSET = 8;
const EPSILON = 0.5;

/**
 * Fit an anchored card inside its host's visible vertical band.
 *
 * Above or below: the card goes on `currentSide` (the preferred side when it first
 * opens) while it fits there, flips to the opposite side when that one has more room,
 * and is capped to the larger band. It never falls back to beside. Beside (`beside`
 * names the side placeOverlay resolved): the card is top-aligned with its trigger and
 * slid inside the band, and the side reported is that beside side.
 */
export function fitOverlayHeight({
  triggerTop, triggerHeight, outletHeight, visibleTop = 0, visibleBottom = outletHeight,
  desiredHeight, currentSide = "below", gap, beside,
}: {
  triggerTop: number;
  triggerHeight: number;
  outletHeight: number;
  visibleTop?: number;
  visibleBottom?: number;
  desiredHeight: number | null;
  currentSide?: OverlayVerticalSide;
  gap: number;
  beside?: OverlayBesideSide | null;
}): { side: OverlaySide; top?: number; bottom?: number; maxHeight: number } {
  // A content-sized outlet can lie inside the visible viewport without filling
  // it, so its card may extend beyond its own bottom. Only the visible band caps.
  const lower = Math.max(visibleTop, visibleBottom);
  const inset = Math.min(INSET, (lower - visibleTop) / 2);
  const ceiling = visibleTop + inset;
  const floor = lower - inset;
  // Keep cards attached to wholly offscreen anchors. Pulling them into the
  // visible band would cover unrelated controls, including pinned-open demos.
  if (triggerTop >= lower || triggerTop + triggerHeight <= visibleTop) {
    if (beside) return { side: beside, top: triggerTop, maxHeight: floor - ceiling };
    return currentSide === "above"
      ? { side: "above", bottom: outletHeight - (triggerTop - gap), maxHeight: floor - ceiling }
      : { side: "below", top: triggerTop + triggerHeight + gap, maxHeight: floor - ceiling };
  }
  const belowTop = Math.max(ceiling, Math.min(floor, triggerTop + triggerHeight + gap));
  const aboveBottom = Math.max(ceiling, Math.min(floor, triggerTop - gap));
  const below = floor - belowTop;
  const above = aboveBottom - ceiling;
  const desired = Math.max(0, desiredHeight ?? Infinity);

  if (beside) {
    const height = Math.min(desired, floor - ceiling);
    return { side: beside, top: Math.max(ceiling, Math.min(triggerTop, floor - height)), maxHeight: floor - ceiling };
  }

  let side = currentSide;
  const current = side === "below" ? below : above;
  const opposite = side === "below" ? above : below;
  // Keep a placement that still fits when filtering shortens a list. A keyboard
  // or resize can invalidate it, so the side is never latched for the opening.
  if (desiredHeight === null || current + EPSILON >= desired) {
    // Current placement still fits.
  } else if (opposite > current + EPSILON) {
    side = side === "below" ? "above" : "below";
  }

  const available = side === "below" ? below : above;
  // A visible trigger can occupy the entire band. Use the whole band when
  // neither adjacent space can display content.
  if (available <= 0) return { side: "below", top: ceiling, maxHeight: floor - ceiling };
  return side === "below"
    ? { side, top: belowTop, maxHeight: available }
    : { side, bottom: outletHeight - aboveBottom, maxHeight: available };
}
