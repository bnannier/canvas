---
"@nannier/canvas": patch
---

Button's attention glow reads its red through `PALETTE_RED_500`, a single-sourced constant in the tokens module, instead of `palette["red-500"]`, which retained the whole ~500-entry palette record in every Button and StackedList bundle (about 2KB gzip each; the hue is unchanged). The size budgets are re-measured for the loop runtime the heartbeat legitimately carries: the Button ceiling moves to 16,384B and StackedList's to 70,656B, with the figures and rationale recorded in scripts/check-size.ts.
