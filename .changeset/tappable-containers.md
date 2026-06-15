---
"@olympusoss/canvas": minor
---

Make the container molecules tappable so an interaction never needs a hand-rolled Pressable: MediaObject gains `onPress` (the whole row becomes a button), and GridList and Stats gain `onPressItem(index)` (each tile / metric card becomes a button). Each renders as a Pressable with `accessibilityRole="button"` and a pressed affordance, mirroring Card's existing `onPress`. Pressable stays a documented last resort.
