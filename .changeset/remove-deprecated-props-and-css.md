---
"@nannier/canvas": minor
---

Remove the remaining deprecated props and CSS custom properties. Alert, Chip and Toast (and `toast()`'s options) drop `error`: use `destructive`. DashboardGrid drops `widgets`: use `items`. The Carousel skin drops `dotHitSlop`, ChatQuestionAnswerData drops `skipped`, and the overlay placement drops `preferSide` for `besideEnd`. The web hand-off drops `--orb-indigo`, `--orb-violet`, `--orb-cyan`, `--glass-lens`, `--glass-illumination` and `--surface-backdrop`, and glass mode no longer sets the body's `background-image`, which left an app's own page background alone only while that alias was `none`.

Minor by the owner's decision of 2026-10-23: nothing consumes these names, so their removal ships without a major, as the deprecated JS aliases did.
