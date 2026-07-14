---
"@nannier/canvas": minor
---

Add `AvatarGroup`, the overlapping avatar stack, so no call site writes a magic
`marginLeft: -12` to overlap avatars. It caps the visible avatars at `max`,
collapses the remainder into an automatic "+N" chip (`total` overrides the count
for server-known totals), forwards its size to every child, and injects the
overlap margin and separator ring internally, so the caller's Avatars carry no
layout style. Overlap tightness is a boolean axis (`tight`/`snug`/`loose`).
`Avatar`'s `style` prop is no longer documented as an overlap escape hatch.
