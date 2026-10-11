---
"@nannier/canvas": patch
---

The native materials smoke checks Android capture where it runs: in-page glass has no safe capture target and keeps its solid skin (the owner's P3a decision), so the flow expects idle capture on the page and reads the counters from an open menu, whose frost captures the page, in a glass parent and in a glass descendant of a solid parent.
