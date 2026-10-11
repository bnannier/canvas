---
"@nannier/canvas": patch
---

The native Command smoke settles the results list at its end before selecting the last row: Maestro's "above" compares top edges and its visibility ignores the results pane's clipping, so it could stop with the last row mostly under the footer, where the selecting tap landed on the footer.
