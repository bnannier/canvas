---
"@nannier/canvas": patch
---

The keyboard ring sweep (every keyboard stop on every component page shows the kit's ring) runs each look as a test of its own and reads each stop's cue in one round trip from the page, so the Calendar page, whose every day is a keyboard stop, no longer runs past the test's minute on the CI runner. The assertions are unchanged. Repository tooling only; nothing in the package changes.
