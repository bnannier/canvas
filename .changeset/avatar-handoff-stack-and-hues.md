---
"@nannier/canvas": patch
---

AvatarGroup stacks avatars the way the v4 hand-off does: each avatar after the first overlaps its neighbour by 10px at every size (it was 16px at the default size and 13px on small avatars, which crowded the initials); `snug` and `loose` stay looser. A stock initials disc now takes the hue the hand-off draws for the same name (its eight identity hues and hash), so a name's disc colour matches the design; Argus's reference discs keep their gradient hues.
