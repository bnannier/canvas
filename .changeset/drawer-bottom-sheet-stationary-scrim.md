---
"@nannier/canvas": patch
---

Fix the Drawer bottom sheet's dimmed backdrop sliding up with the sheet. The
bottom sheet was the only edge still using React Native Modal's native
`animationType="slide"`, which transforms the whole modal (the scrim dim
included), so the backdrop rose from the bottom instead of taking over the
surface. Every edge now shares one manual slide path: a stationary full-screen
dim that fades in while only the panel travels (the bottom sheet rises on
`translateY` from `+panelHeight` to `0`, mirroring the top sheet). This makes the
bottom sheet consistent with the left, right, and top variants.
