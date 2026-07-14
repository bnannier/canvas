---
"@nannier/canvas": patch
---

Fix TabBar shrink-wrapping to its icon column (which ran the labels together into an illegible "HomeSearchProfile"): the bar now fills its container width via `alignSelf: "stretch"` + `width: "100%"`, so each equal-width destination is wide enough for its label, and labels stay on a single line.
