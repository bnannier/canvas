---
"@nannier/canvas": patch
---

Docs examples never overflow a phone: 29 fixed-width example style objects
across 7 component `.md` files (reveal, skeleton, divider, card, slider, chart,
stacked-bar) now carry `maxWidth:"100%"`, and a new docgen guardrail hard-fails
any future fence that pins a numeric width of 280 or more without a `maxWidth`
(the existing `docgen-allow-style` opt-out still applies).
