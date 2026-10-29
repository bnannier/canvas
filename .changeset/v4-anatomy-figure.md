---
"@nannier/canvas": minor
---

The v4 component page's Anatomy figure. `AnatomyProvider` takes `zoomed`, which draws the specimen at the hand-off's anatomy zoom (1.6, a component that hugs its content): the provider fills its stage, lays its inner box out at the stage width over the zoom and scales it back up about its centre, reserves the scaled height so the stage grows with the figure, and maps every part rectangle into the space the specimen is seen in before reporting it; `onMeasure` also receives the provider's own box as its parent laid it out, so a consumer places markers against one source. Badge takes `marker`, the figure's numbered disc: a 22 px pill with no inset, its number 600 11 px in the code face on the accent, ringed by the stage well's fill and shadowed. Minor: the new `zoomed` option and box report on `AnatomyProvider`, and the new `marker` metric on Badge.
