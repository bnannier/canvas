---
"@nannier/canvas": minor
---

Typography: add a semantic `underline` boolean prop. Underline is its own orthogonal decoration axis that combines freely with any role, tone, and weight, and it emits `textDecorationLine: "underline"` from the token-backed style, so an inline text link (`<Typography body primary underline>View invoices</Typography>`) no longer needs a raw `style={{ textDecorationLine: "underline" }}` escape hatch. The docgen style guardrail now bans that raw key in example/"Do" fences, matching the other typography restyle keys.
