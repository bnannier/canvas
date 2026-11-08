---
"@nannier/canvas": minor
---

Badge: add `truncate`, which keeps the label on one line and lets the pill shrink in a tight row, ending the label with an ellipsis instead of overflowing its host. The board card's `noticeLabel` pill uses it, so a long notice no longer runs past the card's metadata row.

Minor justification: a new public option on an existing component (`Badge truncate`). Badges without it render unchanged.
