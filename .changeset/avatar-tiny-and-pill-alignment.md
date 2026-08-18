---
"@nannier/canvas": minor
---

`Avatar` gains a `tiny` size step, and `AvatarMenu` now hangs its menu from the pill's trailing edge by default.

New user-visible capabilities (the reason this is a minor, not a patch): a fourth boolean on Avatar's size axis, and a new `alignStart` boolean on AvatarMenu.

- **`Avatar tiny`** is the 24px disc, joining `small` (28), the default (40), and `large` (48). Precedence on the axis is `tiny` > `small` > `large`. It keeps the 12px initials rather than scaling on down, because a proportional 10px pair of initials stops reading at that diameter. `AvatarGroup` takes it too, with its own overlap row, so a stack of tiny avatars stays uniform.
- **`AvatarMenu` uses it for the pill's disc**, which is the fix this step exists for: the capsule is 32 / 36 / 40 tall on web / iOS / Android, so a 24px disc restores the intended 4 / 6 / 8 inset. With the 28px `small` disc it had been using, the web pill left only 2 and read as a tight ring around the photo.
- **`AvatarMenu alignStart`** hangs the menu from the pill's leading edge.

Behavior change to note when upgrading: `AvatarMenu`'s alignment default is now the TRAILING edge, where it was the leading edge in 2.30.0. A topbar parks the account pill at the trailing edge, and a leading-aligned menu there runs off the surface, so the trailing edge is what the design calls for and what almost every call site was already passing `alignEnd` to get. `alignEnd` still works and still means the same thing (it now spells out the default); pass the new `alignStart` for the old behavior. Plain `Dropdown` is untouched and still defaults to its leading edge.

Also corrected against the design hand-off: the pill's open fill on web is now the real `color-mix(in oklab, ...)` (computed through a new `mixOklab` colour helper) instead of an sRGB channel lerp that landed 2/255 per channel too light in both schemes, and a disabled `Dropdown` trigger or row on iOS now dims to 0.4, the platform's own disabled opacity, instead of the web's 0.5.
