---
"@nannier/canvas": minor
---

Navbar: brand element and trailing actions slots.

Minor justification (new public capability): Navbar gains brandContent and a
free-form trailing actions slot for console topbars; existing
brand/links/actionLabel/avatar API unchanged. `brandContent` takes any ReactNode
and LEADS the existing left cluster, so a logo mark renders ahead of the `brand`
wordmark or stands in for it entirely; `actions` takes any ReactNode and LEADS
the existing right cluster, ahead of the built-in `actionLabel` button and
`avatar`, so a bar can carry a ghost search button with a Kbd chip, ghost icon
buttons, a notification dropdown and an AvatarMenu. Both slots are direct
children of the group rows already in the skins, so they take those rows' own
gap and no skin field changed.

`links` and `brand` are now optional. A bar with no middle nav renders neither
the links row nor the narrow menu button that stands in for it, so the automatic
at-and-below-`sm` collapse can no longer produce a hamburger opening an empty
menu; with links present the collapse is unchanged, and a trailing `actions`
slot never folds into that menu. Every existing call site renders exactly as
before.
