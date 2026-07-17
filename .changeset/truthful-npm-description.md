---
"@nannier/canvas": patch
---

Correct the npm package description.

The description said "styled with Tailwind", which misrepresents the public API:
Tailwind utilities are an internal implementation detail, and the consumer-facing
styling surface is semantic boolean props. The description now reads "Universal React
Native UI kit: one component API renders natively on iOS, Android, and web." Also adds
a `material-design` keyword alongside the existing platform keywords.
