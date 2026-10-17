---
"@nannier/canvas": patch
---

Keep Chat pinned to the latest content while the reader follows the bottom, including streamed text, question-height changes, and viewport resizing. Pause when the reader scrolls up, resume on returning to the bottom, and coalesce non-animated adjustments after layout without treating content-growth scroll events as reader movement.
