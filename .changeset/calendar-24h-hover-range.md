---
"@nannier/canvas": minor
---

Calendar: full-day timelines, hour-format toggle, hover details, and range selection. The week/day timelines now span the whole day (0-24 by default; `startHour`/`endHour` narrow it) inside a vertical scroller whose initial window shows 8 AM to 5 PM, with a built-in 12h/24h segmented toggle (12-hour default; `hour24`/`defaultHour24`/`onHour24Change`). On pointer platforms, hovering an event block floats a detail card with the event's new `description` field. A new `range` mode turns the month grid into a check-in/check-out picker (`rangeStart`/`rangeEnd`/`defaultRangeStart`/`defaultRangeEnd`/`onRangeChange`) with a tinted band across the days between the endpoints.
