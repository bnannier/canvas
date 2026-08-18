---
"@nannier/canvas": patch
---

`Dropdown`: the menu takes focus when it opens, hands it back when it closes, and names itself.

Three accessibility defects in the WAI-ARIA menu pattern, all on the path every app and docs page runs (an overlay host is mounted, so the menu is portaled):

- **Focus never entered the open menu.** Focus was moved in the same commit that flipped `open`, but a portaled card is held back until the trigger measurement lands, so there was no row to focus yet: the roving arrow keys were dead and the menu sat at the end of the tab order. `AnchoredOverlay` now reports `onCardMount`, fired from an effect inside the card's own subtree (after every row's ref is attached) on both the portaled and inline paths, and the first enabled row takes focus there. No polling, no timeout guess. The focus move passes `preventScroll`, so a menu that renders open from its first commit never yanks the page to itself.
- **Closing dropped focus on `document.body`.** Escape, a row press, an outside tap, and a controlled close now all return focus to the trigger. A close that did not orphan focus (the app closes the menu after the user has tabbed on) leaves focus exactly where the user put it.
- **The menu had no accessible name and its identity header was loose generic text.** The menu is named from the header's title, falling back to the section `label`; the header is a `group` (a valid child of `menu`) named from its two lines. It stays unfocusable and out of the roving-focus count, which is still `items.length`.
