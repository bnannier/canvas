---
"@nannier/canvas": minor
---

Give `Dropdown` an identity header, trailing-edge alignment, and a disabled trigger.

Three new user-visible capabilities (the reason this is a minor, not a patch),
all additive: a Dropdown that passes none of them renders exactly as before.

`title` and `description` add an identity header block above the menu's rows: the
title in the popover foreground, the description muted underneath, closed off by
the card's own hairline before the first row. It coexists with the existing
`label` section heading, which still sits between the header and the rows. The
header is plain text, not a menu item, so it takes no tab stop and never enters
the roving-focus count. The skins carry the gutter per platform (8 x 6 on web,
16 x 6 on iOS, 16 x 8 on Android, each matching that skin's own section-label
gutter) over one shared type scale.

`alignEnd` hangs the menu off the trigger's trailing edge instead of its leading
edge, for a trigger parked at the end of a bar where a leading-aligned menu would
run off the surface. It holds on both paths: the inline anchor flips from a
logical `start` inset to an `end` one, and the portalled path pins the card by an
inset from the outlet's own edge (so no card measurement and no second layout
pass). Both are logical, so a right-to-left locale mirrors them.

`disabled` makes the whole control inert: the trigger dims by each platform's own
disabled opacity, the press is a no-op, and a controlled `open` cannot force the
menu out of a disabled Dropdown. The trigger carries `accessibilityState` and its
`aria-disabled` alias, and both trigger forms now announce `aria-haspopup="menu"`
alongside `aria-expanded`.
