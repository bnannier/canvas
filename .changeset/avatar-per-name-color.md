---
"@nannier/canvas": minor
---

feat(avatar): deterministic per-name colour for the initials fallback

An avatar with no photo now renders its initials in white on a colour chosen
deterministically from the name, drawn from the chart categorical palette, so
people stay visually distinct in stacks and lists instead of a wall of identical
grey circles. On iOS the solid colour shows for every non-pressable avatar; a
directly pressable avatar (`onPress`) keeps its interactive Liquid Glass. The
"+N" overflow chip stays neutral.
