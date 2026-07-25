---
"@nannier/canvas": patch
---

Sidebar now marks its active row with `aria-current="page"` instead of `aria-selected`.

ARIA permits `aria-selected` only on roles that carry a selected state, such as
`option`, `tab` and `row`. A sidebar row is a `button`, so browsers discarded the
attribute as invalid and assistive technology announced every row as unselected,
including the current page. The row is navigation, so it now uses the same spelling
Navbars, Breadcrumb and Pagination already use.

The native `accessibilityState={{ selected }}` is unchanged, since a selected state is
valid on iOS and Android and is what VoiceOver and TalkBack read.

If you query the DOM for the active row, match on `[aria-current="page"]` rather than
`[aria-selected="true"]`.
