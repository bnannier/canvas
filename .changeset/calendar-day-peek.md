---
"@nannier/canvas": minor
---

Calendar: `dayPeek` opens the pressed day's hour timeline in an anchored overlay (a tooltip-style day peek) in the month view, placed beside the cell (right first, left when the right lacks room, below when neither side fits), bounded to that day's events, dismissed by an outside tap or Escape; untimed events list as title rows. AnchoredOverlay gains optional `cardWidth`/`centered`/`preferSide` for width-aware, outlet-clamped placement (backward-compatible; existing callers are unchanged).
