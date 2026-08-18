---
"@nannier/canvas": minor
---

Add `AvatarMenu`, the account identity pill, to the Avatar family.

New user-visible capability (the reason this is a minor, not a patch): the kit
now ships the account-menu anatomy itself, so no app or topbar hand-composes one
out of an `Avatar`, a hand-rolled name column, and a chevron. `AvatarMenu` is a
single capsule trigger holding the avatar, the person's name over their email,
and a trailing chevron that rotates while the menu is open, wired to the kit's
own `Dropdown` for the menu (including its new identity header, so the name and
email repeat above the rows).

Boolean props follow the kit's semantic grammar: `compact` drops the name block
for a topbar, `alignEnd` hangs the menu off the pill's trailing edge, and
`disabled` makes the pill inert. The open state has the usual controlled and
uncontrolled duality (`open` plus `onOpenChange`, interactive out of the box with
neither), and `items` reuses the existing `DropdownItem` type.

Per-OS metrics come from the platform skins: a 32px `secondary` capsule on web
(with an `input`-coloured hairline and a 6% lifted fill when open), a 36pt
hairline-outlined capsule on iOS that fills with `secondary` when open, and a
40dp Material 3 tonal pill on Android (`primary` at 12%, 20% when open). The
trigger announces itself as a menu button and takes its accessible name from the
account holder, so a screen reader hears the person, not "button".
