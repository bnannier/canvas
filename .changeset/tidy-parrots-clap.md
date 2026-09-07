---
"@nannier-com/canvas": patch
---

Three accessibility fixes found by running axe over every component page in a real
browser.

**RowMenu** rendered its rows as `menuitem` with no `menu` container around them. ARIA
requires a menuitem to be owned by a menu, so each row was an orphan: axe files it as
`aria-required-parent`, and a screen reader reads a loose control rather than "menu, N
items". Dropdown has carried that container since it shipped. The panel now has one
too, named from the section label or the trigger, so a screen-reader user hears which
menu opened. A menu of links, which is what `links` makes, correctly gets no menu role.

**A named status Badge** put its `accessibilityLabel` on a bare View. ARIA prohibits
naming a generic element, so the label was being discarded rather than announced,
which is the opposite of what a status dot standing in for a word needs. It now
carries `role="img"`, the same role Swatch already uses for the same reason, and only
when it actually has a name: a decorative dot beside its own text label stays silent.

**Kbd** had the same problem by a different route: it set `accessibilityRole="text"`,
which react-native-web maps to no DOM role at all, leaving the chord's name on a
generic div. It is `role="img"` now, so "⌘+K" is announced once as a unit rather than
cap by cap, which was always the intent.
