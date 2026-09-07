---
"@nannier-com/canvas": patch
---

Autocomplete and Select: a capped option list now clips and scrolls instead of
spilling out of its card.

Both cap the open option list with a `maxHeight` on the popover card, but that cap
bounded the card alone: React Native Views are `overflow: visible` and
`flexShrink: 0` by default, so a list taller than the cap painted its extra rows
past the card, onto the bare page, with no fill, border or shadow behind them. The
iOS and Android skins hit this on a seven-option list (326pt and 344dp of rows
under 260/280 caps); the web skin fit its 240 cap by eight pixels, so a single
extra option would have tipped it over too.

The card now clips to its own rounded corners, and the rows sit in a scrollport
that may shrink to the capped card, so the options past the cap scroll into reach
rather than being clipped away unreachable.
