---
"@nannier/canvas": patch
---

AnchoredOverlay: retry the hosted trigger measurement until it lands. An overlay that is open on its very first render (e.g. a docs example pinned open) could measure during initial page mount before the measure callbacks complete, leaving the portaled card unmounted forever; the measurement now re-attempts on subsequent frames (bounded) until a real trigger box is reported.
