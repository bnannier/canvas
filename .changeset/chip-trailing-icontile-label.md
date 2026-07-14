---
"@bnannier/canvas": minor
---

Add a `trailing` slot to `Chip` (a trailing element such as a chevron, so a
Chip can be a menu/account trigger: leading avatar + label + chevron) and a
`label` monogram prop to `IconTile` (a letter or two painted in the tone color,
for the letter-tile used on stat cards). Together these let an account-menu pill
and a monogram tile be built from real components instead of a hand-composed
bordered Pressable or tinted letter square.
