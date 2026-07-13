---
"@olympusoss/canvas": minor
---

**Heatmap gains a GitHub-style contribution calendar.** Pass `calendar` to lay
the cells out as seven-day week columns with weekday (Mon/Wed/Fri) and month
labels, discrete less-to-more levels, and a horizontal scroll so a full year
stays legible on a phone. Hover or tap a day to inspect its count and date in a
tooltip, and lead with a `caption` summary line.

- **Richer cell data.** `values` now accepts `{ value, count?, date?, label? }`
  cells alongside bare intensity numbers (fully backward compatible). `count`
  and `date` drive the inspect tooltip; `date` (ISO `YYYY-MM-DD`) also derives
  the calendar's month labels.
- **Inspect-to-read.** Cells are pointer-only (the grid keeps a single
  summarizing image role, so a year of days is not 365 tab stops); the active
  day gets a highlight ring and announces its count and date to assistive tech.
- The default wrapping grid layout and its accessible name are unchanged.
