---
"@nannier/canvas": minor
---

Calendar: events and week/day views. A new `events` prop (`{ day, title?, start?, end? }`) marks event days with a dot in the month grid and week strip, with the count read to assistive tech. New `week` and `day` view booleans render a seven-day strip over an hour timeline and a single-day timeline, with timed events as positioned blocks (overlaps split into side-by-side lanes), `startHour`/`endHour` bounds that auto-extend to fit events, and `onEventPress` for tappable blocks. In week/day views the chevrons page the selection by a week or a day out of the box and fire `onPrev`/`onNext` only at the month boundary. All backward-compatible; the month view is unchanged by default.
