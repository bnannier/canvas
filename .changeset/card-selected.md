---
"@nannier/canvas": minor
---

Add a `selected` prop to `Card`: an active/selected surface (a primary border and
a soft primary tint, with no border-width change so content never shifts). This
lets a card-style selectable option (a card radio or checkbox) show its chosen
state without hand-composing a bordered, tinted Pressable.
