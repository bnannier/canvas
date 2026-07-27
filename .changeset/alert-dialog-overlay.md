---
"@nannier/canvas": minor
---

**`AlertDialog` gained the `overlay` presentation**, matching `Dialog`.

It had the same in-flow default: a scrim sized for the docs preview, no
positioning, no portal, and `aria-modal` asserted anyway. That is the wrong
default for the component's main job, which is guarding a destructive action:
the confirm appeared wherever it happened to be mounted while the page behind it
stayed scrollable and clickable, so a user could reach the thing they were being
asked to confirm destroying.

With `overlay` it teleports into the nearest `OverlayProvider` and fills it. The
contained behaviour is unchanged and remains the default, and with no provider in
the tree it still renders in place rather than vanishing.
